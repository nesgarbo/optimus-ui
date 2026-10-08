import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import type { QueryBuilderColumn, QueryBuilderChangeEvent, RuleModel } from '@openng/optimus-ui/types/querybuilder';
import { beforeEach, describe, expect, it } from 'vitest';
import { QueryBuilder, QueryBuilderModule } from './querybuilder';

const columns: QueryBuilderColumn[] = [
    { field: 'name', label: 'Name', type: 'string' },
    { field: 'age', label: 'Age', type: 'number', validation: { min: 0 } },
    { field: 'active', label: 'Active', type: 'boolean' }
];

const seed = (): RuleModel => ({ condition: 'and', rules: [{ field: 'name', operator: 'contains', value: 'jo', type: 'string' }] });

@Component({
    standalone: true,
    imports: [QueryBuilderModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<p-querybuilder #qb [columns]="columns" [(value)]="value" [allowValidation]="validate()" [enableNotCondition]="true" [maxGroupCount]="2" [readonly]="locked()" (ruleChanged)="events.push($event)" />`
})
class ModelHost {
    readonly qb = viewChild.required<QueryBuilder>('qb');
    readonly columns = columns;
    readonly value = signal<RuleModel>(seed());
    readonly validate = signal(false);
    readonly locked = signal(false);
    readonly events: QueryBuilderChangeEvent[] = [];
}

@Component({
    standalone: true,
    imports: [QueryBuilderModule, FormField],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<p-querybuilder [columns]="columns" [formField]="f.filter" />`
})
class SignalFormHost {
    readonly columns = columns;
    readonly model = signal<{ filter: RuleModel }>({ filter: seed() });
    readonly f = form(this.model);
}

@Component({
    standalone: true,
    imports: [QueryBuilderModule, ReactiveFormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<p-querybuilder [columns]="columns" [formControl]="control" />`
})
class ReactiveHost {
    readonly columns = columns;
    readonly control = new FormControl<RuleModel>(seed());
}

describe('QueryBuilder', () => {
    let fixture: ComponentFixture<ModelHost>;
    let host: ModelHost;

    const root = () => fixture.nativeElement.querySelector('p-querybuilder') as HTMLElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [ModelHost, SignalFormHost, ReactiveHost], providers: [provideZonelessChangeDetection()] }).compileComponents();

        fixture = TestBed.createComponent(ModelHost);
        host = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('draws the tree', () => {
        expect(root().querySelectorAll('.p-querybuilder-group')).toHaveLength(1);
        expect(root().querySelectorAll('.p-querybuilder-rule')).toHaveLength(1);
        expect(root().getAttribute('data-part')).toBe('root');
    });

    it('adds a condition and a nested group through the buttons, up to maxGroupCount', async () => {
        (root().querySelector('.p-querybuilder-add-rule button') as HTMLButtonElement).click();
        await fixture.whenStable();

        expect(host.value().rules).toHaveLength(2);

        (root().querySelector('.p-querybuilder-add-group button') as HTMLButtonElement).click();
        await fixture.whenStable();

        expect(host.value().rules).toHaveLength(3);
        expect(root().querySelectorAll('.p-querybuilder-group')).toHaveLength(2);
        expect(host.events.map((e) => e.type)).toEqual(['insertRule', 'insertGroup']);
        // the nested group is the second and last allowed
        expect((root().querySelector('.p-querybuilder-group .p-querybuilder-group .p-querybuilder-add-group button') as HTMLButtonElement).disabled).toBe(true);
    });

    it('deletes a condition', async () => {
        (root().querySelector('.p-querybuilder-rule .p-querybuilder-delete button') as HTMLButtonElement).click();
        await fixture.whenStable();

        expect(host.value().rules).toEqual([]);
        expect(root().querySelector('.p-querybuilder-empty')).toBeTruthy();
    });

    it('answers through the methods', async () => {
        const qb = host.qb();

        expect(qb.getSqlFromRules()).toBe("(name LIKE '%jo%')");
        expect(qb.getMongoQuery()).toEqual({ $and: [{ name: { $regex: 'jo', $options: 'i' } }] });
        expect(qb.getFeathersQuery()).toEqual({ name: { $ilike: '%jo%' } });
        expect(qb.getPredicate()({ name: 'John' })).toBe(true);

        qb.setRulesFromSql('age > 3 OR active = TRUE');
        await fixture.whenStable();

        expect(host.value().condition).toBe('or');
        expect(root().querySelectorAll('.p-querybuilder-rule')).toHaveLength(2);

        qb.reset();
        await fixture.whenStable();

        expect(host.value().rules).toEqual([]);
    });

    it('lets a listener cancel a change', async () => {
        const qb = host.qb();

        qb.actionBegin.subscribe((e) => (e.cancel = true));
        qb.insertRule([]);

        expect(host.value().rules).toHaveLength(1);
    });

    it('marks invalid leaves only when asked to', async () => {
        host.value.set({ condition: 'and', rules: [{ field: 'age', operator: 'equal', value: null, type: 'number' }] });
        await fixture.whenStable();

        expect(root().querySelector('.p-querybuilder-error')).toBeNull();

        host.validate.set(true);
        await fixture.whenStable();

        expect(root().querySelector('.p-querybuilder-error')?.textContent).toContain('Enter a value');
        expect(host.qb().isValid()).toBe(false);
    });

    it('takes the controls away when readonly', async () => {
        host.locked.set(true);
        await fixture.whenStable();

        expect(root().querySelector('.p-querybuilder-add-rule')).toBeNull();
        expect(root().querySelector('.p-querybuilder-delete')).toBeNull();

        host.qb().insertRule([]);

        expect(host.value().rules).toHaveLength(1);
    });

    it('binds to a signal form with [formField]', async () => {
        const f = TestBed.createComponent(SignalFormHost);

        await f.whenStable();

        expect(f.nativeElement.querySelectorAll('.p-querybuilder-rule')).toHaveLength(1);

        (f.nativeElement.querySelector('.p-querybuilder-add-rule button') as HTMLButtonElement).click();
        await f.whenStable();

        expect(f.componentInstance.model().filter.rules).toHaveLength(2);

        f.componentInstance.model.set({ filter: { condition: 'or', rules: [] } });
        await f.whenStable();

        expect(f.nativeElement.querySelectorAll('.p-querybuilder-rule')).toHaveLength(0);
    });

    it('binds to a reactive form', async () => {
        const f = TestBed.createComponent(ReactiveHost);

        await f.whenStable();

        (f.nativeElement.querySelector('.p-querybuilder-add-rule button') as HTMLButtonElement).click();
        await f.whenStable();

        expect(f.componentInstance.control.value!.rules).toHaveLength(2);

        f.componentInstance.control.setValue({ condition: 'and', rules: [] });
        await f.whenStable();

        expect(f.nativeElement.querySelectorAll('.p-querybuilder-rule')).toHaveLength(0);
    });
});

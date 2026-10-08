import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { disabled, form, FormField, readonly } from '@angular/forms/signals';
import { By } from '@angular/platform-browser';
import { AutoComplete, AutoCompleteModule } from '@openng/optimus-ui/autocomplete';
import { CascadeSelect, CascadeSelectModule } from '@openng/optimus-ui/cascadeselect';
import { ListboxModule } from '@openng/optimus-ui/listbox';
import { MultiSelect, MultiSelectModule } from '@openng/optimus-ui/multiselect';
import { RadioButtonModule } from '@openng/optimus-ui/radiobutton';
import { Select, SelectModule } from '@openng/optimus-ui/select';
import { SelectButtonModule } from '@openng/optimus-ui/selectbutton';
import { TreeSelect, TreeSelectModule } from '@openng/optimus-ui/treeselect';
import { describe, expect, it } from 'vitest';

interface City {
    name: string;
    code: string;
}

const CITIES: City[] = [
    { name: 'Madrid', code: 'MAD' },
    { name: 'Paris', code: 'PAR' },
    { name: 'Rome', code: 'ROM' }
];

const NODES = [
    { key: '0', label: 'Europe', children: [{ key: '0-0', label: 'Spain', data: 'ES' }] },
    { key: '1', label: 'Asia', data: 'AS' }
];

@Component({
    standalone: true,
    imports: [FormField, SelectModule, MultiSelectModule, ListboxModule, SelectButtonModule, RadioButtonModule, AutoCompleteModule, CascadeSelectModule, TreeSelectModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <p-select id="select" [options]="cities" optionLabel="name" optionValue="code" [formField]="f.select" />
        <p-select id="selectObject" [options]="cities" optionLabel="name" [formField]="f.city" />
        <p-multiselect id="multi" [options]="cities" optionLabel="name" optionValue="code" [formField]="f.multi" />
        <p-listbox id="listbox" [options]="cities" optionLabel="name" optionValue="code" [formField]="f.select" />
        <p-selectbutton id="selectbutton" [options]="cities" optionLabel="name" optionValue="code" [formField]="f.select" />
        <p-radiobutton id="radioMad" name="r" value="MAD" [formField]="f.select" />
        <p-radiobutton id="radioPar" name="r" value="PAR" [formField]="f.select" />
        <p-autocomplete id="auto" [suggestions]="[]" [formField]="f.text" />
        <p-cascadeselect id="cascade" [options]="cities" optionLabel="name" optionValue="code" [formField]="f.select" />
        <p-treeselect id="tree" [options]="nodes" [formField]="f.node" />
    `
})
class Host {
    readonly cities = CITIES;
    readonly nodes = NODES;
    readonly lock = signal(false);
    readonly freeze = signal(false);
    readonly model = signal<{ select: string | null; city: City | null; multi: string[]; text: string; node: object | null }>({ select: null, city: null, multi: [], text: '', node: null });
    readonly f = form(this.model, (p) => {
        for (const field of [p.select, p.city, p.multi, p.text, p.node]) {
            disabled(field as never, () => this.lock());
            readonly(field as never, () => this.freeze());
        }
    });
}

describe('forms interop: selection controls with [formField]', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    const el = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;
    const instance = <T>(id: string) => fixture.debugElement.query(By.css(`#${id}`)).componentInstance as T;
    const settle = async () => {
        fixture.detectChanges();
        await fixture.whenStable();
    };
    const setup = async () => {
        TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        await settle();
    };
    const blurInput = async (id: string) => {
        const input = el(id).querySelector('input, [role=combobox], [role=listbox]') as HTMLElement;

        input.dispatchEvent(new Event('focus'));
        input.dispatchEvent(new Event('blur'));
        await settle();
    };

    describe('select', () => {
        it('shows the label of the field value, and null as the placeholder', async () => {
            await setup();
            expect(el('select').textContent).not.toContain('Paris');
            host.f.select().value.set('PAR');
            await settle();
            expect(el('select').textContent).toContain('Paris');
            host.f.select().value.set(null);
            await settle();
            expect(el('select').textContent).not.toContain('Paris');
        });

        it('writes the chosen option value to the field', async () => {
            await setup();
            instance<Select>('select').onOptionSelect(new Event('click'), CITIES[2]);
            await settle();
            expect(host.f.select().value()).toBe('ROM');
        });

        it('works with an object as value', async () => {
            await setup();
            host.f.city().value.set(CITIES[1]);
            await settle();
            expect(el('selectObject').textContent).toContain('Paris');
            instance<Select>('selectObject').onOptionSelect(new Event('click'), CITIES[0]);
            await settle();
            expect(host.f.city().value()).toEqual(CITIES[0]);
        });

        it('marks the field touched on blur', async () => {
            await setup();
            await blurInput('select');
            expect(host.f.select().touched()).toBe(true);
        });

        it('follows disabled of the field', async () => {
            await setup();
            host.lock.set(true);
            await settle();
            expect(instance<Select>('select').$disabled()).toBe(true);
        });
    });

    describe('multiselect', () => {
        it('shows the field values', async () => {
            await setup();
            host.f.multi().value.set(['MAD', 'ROM']);
            await settle();
            expect(el('multi').textContent).toContain('Madrid');
            expect(el('multi').textContent).toContain('Rome');
        });

        it('builds a new array on each change, and leaves the form array alone', async () => {
            await setup();
            const before = host.f.multi().value();

            instance<MultiSelect>('multi').onOptionSelect({ originalEvent: new Event('click'), option: CITIES[0] });
            await settle();
            instance<MultiSelect>('multi').onOptionSelect({ originalEvent: new Event('click'), option: CITIES[1] });
            await settle();
            expect(host.f.multi().value()).toEqual(['MAD', 'PAR']);
            expect(before).toEqual([]);
        });

        it('marks the field touched on blur', async () => {
            await setup();
            await blurInput('multi');
            expect(host.f.multi().touched()).toBe(true);
        });
    });

    describe('listbox', () => {
        const options = () => Array.from(el('listbox').querySelectorAll('li[role=option]')) as HTMLElement[];

        it('shows the field value as the selected option', async () => {
            await setup();
            host.f.select().value.set('PAR');
            await settle();
            expect(
                options()
                    .filter((o) => o.getAttribute('aria-selected') === 'true')
                    .map((o) => o.textContent?.trim())
            ).toEqual(['Paris']);
        });

        it('writes a click to the field and marks it touched on blur', async () => {
            await setup();
            options()[2].click();
            await settle();
            expect(host.f.select().value()).toBe('ROM');

            await blurInput('listbox');
            expect(host.f.select().touched()).toBe(true);
        });
    });

    describe('selectbutton', () => {
        const buttons = () => Array.from(el('selectbutton').querySelectorAll('p-togglebutton, [role=button], [aria-pressed]')) as HTMLElement[];

        it('shows the field value as the pressed button', async () => {
            await setup();
            host.f.select().value.set('MAD');
            await settle();
            await settle();
            expect(el('selectbutton').querySelector('[aria-checked=true], [aria-pressed=true], .p-togglebutton-checked')?.textContent).toContain('Madrid');
        });

        it('writes a click to the field', async () => {
            await setup();
            (buttons().find((b) => b.textContent?.includes('Rome')) as HTMLElement).click();
            await settle();
            expect(host.f.select().value()).toBe('ROM');
        });
    });

    describe('radiobutton', () => {
        const radio = (id: string) => el(id).querySelector('input') as HTMLInputElement;

        it('checks the radio of the field value', async () => {
            await setup();
            host.f.select().value.set('PAR');
            await settle();
            expect(radio('radioPar').checked).toBe(true);
            expect(radio('radioMad').checked).toBe(false);
        });

        it('writes a click to the field and marks it touched on blur', async () => {
            await setup();
            radio('radioMad').click();
            await settle();
            expect(host.f.select().value()).toBe('MAD');

            radio('radioMad').dispatchEvent(new Event('blur'));
            await settle();
            expect(host.f.select().touched()).toBe(true);
        });
    });

    describe('autocomplete', () => {
        it('shows the field value', async () => {
            await setup();
            host.f.text().value.set('abc');
            await settle();
            expect((el('auto').querySelector('input') as HTMLInputElement).value).toBe('abc');
        });

        it('writes the selected option to the field and marks it touched on blur', async () => {
            await setup();
            instance<AutoComplete>('auto').onOptionSelect(new Event('click'), 'Madrid');
            await settle();
            expect(host.f.text().value()).toBe('Madrid');

            await blurInput('auto');
            expect(host.f.text().touched()).toBe(true);
        });
    });

    describe('cascadeselect', () => {
        it('shows the label of the field value', async () => {
            await setup();
            host.f.select().value.set('PAR');
            await settle();
            expect(el('cascade').textContent).toContain('Paris');
        });

        it('writes the chosen option to the field and marks it touched on blur', async () => {
            await setup();
            instance<CascadeSelect>('cascade').onOptionSelect({ originalEvent: new Event('click'), value: CITIES[2], isHide: false });
            await settle();
            expect(host.f.select().value()).toBe('ROM');

            await blurInput('cascade');
            expect(host.f.select().touched()).toBe(true);
        });
    });

    describe('treeselect', () => {
        it('shows the field value', async () => {
            await setup();
            host.f.node().value.set(NODES[1]);
            await settle();
            expect(el('tree').textContent).toContain('Asia');
        });

        it('writes the selection to the field and marks it touched on blur', async () => {
            await setup();
            instance<TreeSelect>('tree').onSelectionChange(NODES[0]);
            await settle();
            expect(host.f.node().value()).toBe(NODES[0]);

            await blurInput('tree');
            expect(host.f.node().touched()).toBe(true);
        });
    });
});

@Component({
    standalone: true,
    imports: [ReactiveFormsModule, FormsModule, SelectModule, MultiSelectModule, ListboxModule, RadioButtonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <p-select id="select" [options]="cities" optionLabel="name" optionValue="code" [formControl]="select" />
        <p-multiselect id="multi" [options]="cities" optionLabel="name" optionValue="code" [(ngModel)]="multi" />
        <p-listbox id="listbox" [options]="cities" optionLabel="name" optionValue="code" [formControl]="select" />
    `
})
class ClassicHost {
    readonly cities = CITIES;
    readonly select = new FormControl<string | null>('PAR');
    multi: string[] = ['MAD'];
}

describe('forms interop: selection controls with classic forms', () => {
    it('keep showing the value and writing it back', async () => {
        TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
        const fixture = TestBed.createComponent(ClassicHost);
        const host = fixture.componentInstance;

        for (let i = 0; i < 2; i++) {
            fixture.detectChanges();
            await fixture.whenStable();
        }

        expect((fixture.nativeElement.querySelector('#select') as HTMLElement).textContent).toContain('Paris');
        expect((fixture.nativeElement.querySelector('#multi') as HTMLElement).textContent).toContain('Madrid');

        (fixture.nativeElement.querySelectorAll('#listbox li[role=option]')[2] as HTMLElement).click();
        expect(host.select.value).toBe('ROM');
    });
});

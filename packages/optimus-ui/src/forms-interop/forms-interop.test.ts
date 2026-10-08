import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, FormField, validate } from '@angular/forms/signals';
import { AutoCompleteModule } from '@openng/optimus-ui/autocomplete';
import { CheckboxModule } from '@openng/optimus-ui/checkbox';
import { DatePickerModule } from '@openng/optimus-ui/datepicker';
import { InputNumberModule } from '@openng/optimus-ui/inputnumber';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { MultiSelectModule } from '@openng/optimus-ui/multiselect';
import { PasswordModule } from '@openng/optimus-ui/password';
import { RatingModule } from '@openng/optimus-ui/rating';
import { SelectModule } from '@openng/optimus-ui/select';
import { SliderModule } from '@openng/optimus-ui/slider';
import { TextareaModule } from '@openng/optimus-ui/textarea';
import { ToggleSwitchModule } from '@openng/optimus-ui/toggleswitch';
import { describe, expect, it } from 'vitest';

/**
 * Phase 0 probe: every form control bound with `[formField]` to a field that is invalid from the start
 * (a rule on an empty value). The error must stay hidden until the field is touched, as it does with
 * `formControl` and `ngModel`.
 */
interface Case {
    name: string;
    imports: unknown[];
    template: string;
    initial: unknown;
    /** Selector of the element that receives focus and blur. */
    focusable: string;
}

const CASES: Case[] = [
    { name: 'inputtext', imports: [InputTextModule], template: `<input pInputText [formField]="f.x" />`, initial: '', focusable: 'input' },
    { name: 'textarea', imports: [TextareaModule], template: `<textarea pTextarea [formField]="f.x"></textarea>`, initial: '', focusable: 'textarea' },
    { name: 'password', imports: [PasswordModule], template: `<p-password [formField]="f.x" />`, initial: '', focusable: 'input' },
    { name: 'inputnumber', imports: [InputNumberModule], template: `<p-inputnumber [formField]="f.x" />`, initial: null, focusable: 'input' },
    { name: 'select', imports: [SelectModule], template: `<p-select [options]="['a', 'b']" [formField]="f.x" />`, initial: null, focusable: 'input' },
    { name: 'multiselect', imports: [MultiSelectModule], template: `<p-multiselect [options]="['a', 'b']" [formField]="f.x" />`, initial: [], focusable: 'input' },
    { name: 'autocomplete', imports: [AutoCompleteModule], template: `<p-autocomplete [suggestions]="[]" [formField]="f.x" />`, initial: '', focusable: 'input' },
    { name: 'datepicker', imports: [DatePickerModule], template: `<p-datepicker [formField]="f.x" />`, initial: null, focusable: 'input' },
    { name: 'checkbox', imports: [CheckboxModule], template: `<p-checkbox [binary]="true" [formField]="f.x" />`, initial: false, focusable: 'input' },
    { name: 'toggleswitch', imports: [ToggleSwitchModule], template: `<p-toggleswitch [formField]="f.x" />`, initial: false, focusable: 'input' },
    { name: 'slider', imports: [SliderModule], template: `<p-slider [formField]="f.x" />`, initial: null, focusable: '.p-slider-handle' },
    { name: 'rating', imports: [RatingModule], template: `<p-rating [formField]="f.x" />`, initial: null, focusable: 'input' }
];

const isEmpty = (value: unknown) => value === '' || value === null || value === false || (Array.isArray(value) && !value.length);

const INVALID = '.p-invalid, [data-p~="invalid"]';

function hostFor({ imports, template, initial }: Case): Type<unknown> {
    @Component({
        standalone: true,
        imports: [FormField, ...(imports as never[])],
        changeDetection: ChangeDetectionStrategy.OnPush,
        template
    })
    class Host {
        readonly model = signal<{ x: unknown }>({ x: initial });
        readonly f = form(this.model as never, (p: any) => validate(p.x, ({ value }: any) => (isEmpty(value()) ? { kind: 'required' } : null))) as any;
    }

    return Host;
}

describe('forms interop: [formField] error visibility', () => {
    for (const c of CASES) {
        describe(c.name, () => {
            it('does not show the error before the field is touched', async () => {
                TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
                const fixture = TestBed.createComponent(hostFor(c));

                await fixture.whenStable();

                expect(fixture.componentInstance && (fixture.componentInstance as any).f.x().invalid()).toBe(true);
                expect(fixture.nativeElement.querySelector(INVALID), `${c.name} is red on entry`).toBeNull();
            });

            it('shows the error once the field is touched', async () => {
                TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
                const fixture = TestBed.createComponent(hostFor(c));

                await fixture.whenStable();
                (fixture.componentInstance as any).f.x().markAsTouched();
                await fixture.whenStable();

                expect(fixture.nativeElement.querySelector(INVALID), `${c.name} is not red after touch`).not.toBeNull();
            });
        });
    }
});

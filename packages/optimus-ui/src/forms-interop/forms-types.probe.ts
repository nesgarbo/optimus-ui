import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
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

/**
 * Type probe, not a runtime test: it must compile with `strictTemplates` (see tsconfig.forms-types.json).
 * Every control is bound to a field of the natural type, with no `any()` cast.
 */
@Component({
    standalone: true,
    imports: [FormField, InputTextModule, TextareaModule, PasswordModule, InputNumberModule, SelectModule, MultiSelectModule, AutoCompleteModule, DatePickerModule, CheckboxModule, ToggleSwitchModule, SliderModule, RatingModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <input pInputText [formField]="f.text" />
        <textarea pTextarea [formField]="f.text"></textarea>
        <p-password [formField]="f.text" />
        <p-inputnumber [formField]="f.num" />
        <p-select [options]="['a']" [formField]="f.text" />
        <p-select [options]="[1]" [formField]="f.num" />
        <p-multiselect [options]="['a']" [formField]="f.list" />
        <p-autocomplete [suggestions]="[]" [formField]="f.text" />
        <p-datepicker [formField]="f.date" />
        <p-checkbox [binary]="true" [formField]="f.flag" />
        <p-toggleswitch [formField]="f.flag" />
        <p-slider [formField]="f.num" />
        <p-rating [formField]="f.num" />
    `
})
export class FormsTypesProbe {
    readonly model = signal({ text: '', num: null as number | null, flag: false, date: null as Date | null, list: [] as string[] });
    readonly f = form(this.model);
}

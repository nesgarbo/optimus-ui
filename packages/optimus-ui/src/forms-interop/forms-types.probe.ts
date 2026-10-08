import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { AutoCompleteModule } from '@openng/optimus-ui/autocomplete';
import { CheckboxModule } from '@openng/optimus-ui/checkbox';
import { CascadeSelectModule } from '@openng/optimus-ui/cascadeselect';
import { DatePickerModule } from '@openng/optimus-ui/datepicker';
import { InputNumberModule } from '@openng/optimus-ui/inputnumber';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { KnobModule } from '@openng/optimus-ui/knob';
import { ListboxModule } from '@openng/optimus-ui/listbox';
import { MultiSelectModule } from '@openng/optimus-ui/multiselect';
import { PasswordModule } from '@openng/optimus-ui/password';
import { RadioButtonModule } from '@openng/optimus-ui/radiobutton';
import { RatingModule } from '@openng/optimus-ui/rating';
import { SelectModule } from '@openng/optimus-ui/select';
import { SelectButtonModule } from '@openng/optimus-ui/selectbutton';
import { SliderModule } from '@openng/optimus-ui/slider';
import { ToggleButtonModule } from '@openng/optimus-ui/togglebutton';
import { TreeSelectModule } from '@openng/optimus-ui/treeselect';
import { TextareaModule } from '@openng/optimus-ui/textarea';
import { ToggleSwitchModule } from '@openng/optimus-ui/toggleswitch';

/**
 * Type probe, not a runtime test: it must compile with `strictTemplates` (see tsconfig.forms-types.json).
 * Every control is bound to a field of the natural type, with no `any()` cast.
 */
@Component({
    standalone: true,
    imports: [
        FormField,
        InputTextModule,
        TextareaModule,
        PasswordModule,
        InputNumberModule,
        SelectModule,
        MultiSelectModule,
        AutoCompleteModule,
        DatePickerModule,
        CheckboxModule,
        ToggleSwitchModule,
        SliderModule,
        RatingModule,
        KnobModule,
        ToggleButtonModule,
        ListboxModule,
        SelectButtonModule,
        RadioButtonModule,
        CascadeSelectModule,
        TreeSelectModule
    ],
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
        <p-select [options]="cities" optionLabel="name" [formField]="f.city" />
        <p-multiselect [options]="cities" optionLabel="name" [formField]="f.cities" />
        <p-listbox [options]="cities" optionLabel="name" [formField]="f.city" />
        <p-listbox [options]="cities" optionLabel="name" [multiple]="true" [formField]="f.cities" />
        <p-selectbutton [options]="['a', 'b']" [formField]="f.text" />
        <p-radiobutton value="a" [formField]="f.text" />
        <p-cascadeselect [options]="cities" optionLabel="name" [formField]="f.city" />
        <p-treeselect [options]="[]" [formField]="f.node" />
        <p-datepicker [formField]="f.date" />
        <p-checkbox [binary]="true" [formField]="f.flag" />
        <p-checkbox value="a" [formField]="f.list" />
        <p-toggleswitch [formField]="f.flag" />
        <p-togglebutton onLabel="On" offLabel="Off" [formField]="f.flag" />
        <p-slider [formField]="f.num" />
        <p-slider [range]="true" [formField]="f.list2" />
        <p-knob [formField]="f.num" />
        <p-rating [formField]="f.num" />
    `
})
export class FormsTypesProbe {
    readonly model = signal({
        text: '',
        num: null as number | null,
        flag: false,
        date: null as Date | null,
        list: [] as string[],
        list2: [1, 2] as number[],
        city: null as { name: string } | null,
        cities: [] as { name: string }[],
        node: null as object | null
    });
    readonly cities = [{ name: 'Madrid' }];
    readonly f = form(this.model);
}

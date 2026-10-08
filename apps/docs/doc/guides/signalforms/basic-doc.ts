import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Code } from '@/domain/code';
import { Component, signal } from '@angular/core';
import { form, FormField, minLength, required } from '@angular/forms/signals';
import { CheckboxModule } from '@openng/optimus-ui/checkbox';
import { DatePickerModule } from '@openng/optimus-ui/datepicker';
import { InputNumberModule } from '@openng/optimus-ui/inputnumber';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { SelectModule } from '@openng/optimus-ui/select';

@Component({
    selector: 'basic-doc',
    standalone: true,
    imports: [FormField, InputTextModule, InputNumberModule, SelectModule, DatePickerModule, CheckboxModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                Every form component of Optimus UI binds to a signal form with <i>[formField]</i>, the same way a native input does. The field has the type of the model, so a <i>p-select</i> bound to an object, a <i>p-datepicker</i> bound to a
                <i>Date</i> and a <i>p-inputnumber</i> bound to <i>number | null</i> need no cast. The components keep working with <i>formControl</i>, <i>formControlName</i> and <i>ngModel</i> as well.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-col gap-4 max-w-sm">
            <input pInputText placeholder="Name" [formField]="f.name" />
            <p-inputnumber placeholder="Age" [formField]="f.age" />
            <p-select [options]="cities" optionLabel="name" placeholder="City" [formField]="f.city" />
            <p-datepicker placeholder="Birthday" [formField]="f.birthday" />
            <label class="flex items-center gap-2"><p-checkbox [binary]="true" [formField]="f.terms" /> Accept the terms</label>
        </div>
        <app-code [code]="code" selector="basic-doc"></app-code>
    `
})
export class BasicDoc {
    cities = [{ name: 'Madrid' }, { name: 'Paris' }, { name: 'Rome' }];

    model = signal<{ name: string; age: number | null; city: { name: string } | null; birthday: Date | null; terms: boolean }>({ name: '', age: null, city: null, birthday: null, terms: false });

    f = form(this.model, (path) => {
        required(path.name);
        minLength(path.name, 2);
    });

    code: Code = {
        html: `<div class="card flex flex-col gap-4 max-w-sm">
    <input pInputText placeholder="Name" [formField]="f.name" />
    <p-inputnumber placeholder="Age" [formField]="f.age" />
    <p-select [options]="cities" optionLabel="name" placeholder="City" [formField]="f.city" />
    <p-datepicker placeholder="Birthday" [formField]="f.birthday" />
    <p-checkbox [binary]="true" [formField]="f.terms" />
</div>`,
        typescript: `import { Component, signal } from '@angular/core';
import { form, FormField, minLength, required } from '@angular/forms/signals';
import { CheckboxModule } from '@openng/optimus-ui/checkbox';
import { DatePickerModule } from '@openng/optimus-ui/datepicker';
import { InputNumberModule } from '@openng/optimus-ui/inputnumber';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { SelectModule } from '@openng/optimus-ui/select';

@Component({
    selector: 'basic-doc',
    templateUrl: './basic-doc.html',
    standalone: true,
    imports: [FormField, InputTextModule, InputNumberModule, SelectModule, DatePickerModule, CheckboxModule]
})
export class BasicDoc {
    cities = [{ name: 'Madrid' }, { name: 'Paris' }, { name: 'Rome' }];

    model = signal<{ name: string; age: number | null; city: { name: string } | null; birthday: Date | null; terms: boolean }>({
        name: '',
        age: null,
        city: null,
        birthday: null,
        terms: false
    });

    f = form(this.model, (path) => {
        required(path.name);
        minLength(path.name, 2);
    });
}`
    };
}

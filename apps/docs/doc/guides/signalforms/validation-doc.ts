import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Code } from '@/domain/code';
import { Component, signal } from '@angular/core';
import { email, form, FormField, minLength, required } from '@angular/forms/signals';
import { FieldErrorModule } from '@openng/optimus-ui/fielderror';
import { InputTextModule } from '@openng/optimus-ui/inputtext';

@Component({
    selector: 'validation-doc',
    standalone: true,
    imports: [FormField, InputTextModule, FieldErrorModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                A signal form marks a field invalid as soon as a rule fails, even before the user touches it. A component bound with <i>[formField]</i> therefore shows the invalid style only once the user interacts with it: as soon as the user
                changes the value, so the error follows the typing in real time, or when the user leaves the field. A value set by the code does not count. Without <i>[formField]</i>, the <i>invalid</i> input is used as it is.
            </p>
            <p>
                The <i>pFieldError</i> directive adds the error message after a control, with no markup. It works with <i>[formField]</i>, <i>formControl</i>, <i>formControlName</i> and <i>ngModel</i>, on a native input and on any component. It shows
                the first error as soon as the user changes the field or leaves it, links the input to the message with <i>aria-describedby</i> and takes the text from the message of the rule, or from the translation of the configuration.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-col gap-4 max-w-sm">
            <input pInputText placeholder="Email" [formField]="f.email" pFieldError />
            <input pInputText placeholder="Name" [formField]="f.name" pFieldError [pFieldErrorAll]="true" />
        </div>
        <app-code [code]="code" selector="validation-doc"></app-code>

        <app-docsectiontext class="mt-6">
            <p>
                The same message is the <i>p-fielderror</i> component, for a layout where the message does not go right after the control. Pass it a signal form field with <i>[field]</i>, or a classic control with <i>[control]</i>.
                <i>showWhen</i> chooses <i>interacted</i> (the default: changed or left), <i>touched</i> (only after leaving), <i>dirty</i> (only after changing) or <i>always</i>, and <i>messages</i> overrides the text by error kind.
                <i>{{ '{0}' }}</i> in a text is replaced with the limit of the rule.
            </p>
            <p>
                The default texts are in <i>translation.validation</i> of the configuration, by error kind: <i>required</i>, <i>email</i>, <i>min</i>, <i>max</i>, <i>minLength</i>, <i>maxLength</i>, <i>pattern</i>, <i>minDate</i>, <i>maxDate</i> and
                <i>invalid</i>. A template given to <i>template</i>, or <i>pFieldErrorTemplate</i> on the directive, shows the errors in any other way, such as a list or a tooltip.
            </p>
        </app-docsectiontext>
        <app-code [code]="advancedCode" [hideToggleCode]="true"></app-code>
    `
})
export class ValidationDoc {
    model = signal({ email: '', name: '' });

    f = form(this.model, (path) => {
        required(path.email, { message: 'Email is required' });
        email(path.email);
        required(path.name);
        minLength(path.name, 3);
    });

    code: Code = {
        html: `<input pInputText placeholder="Email" [formField]="f.email" pFieldError />
<input pInputText placeholder="Name" [formField]="f.name" pFieldError [pFieldErrorAll]="true" />`,
        typescript: `import { Component, signal } from '@angular/core';
import { email, form, FormField, minLength, required } from '@angular/forms/signals';
import { FieldErrorModule } from '@openng/optimus-ui/fielderror';
import { InputTextModule } from '@openng/optimus-ui/inputtext';

@Component({
    selector: 'validation-doc',
    templateUrl: './validation-doc.html',
    standalone: true,
    imports: [FormField, InputTextModule, FieldErrorModule]
})
export class ValidationDoc {
    model = signal({ email: '', name: '' });

    f = form(this.model, (path) => {
        required(path.email, { message: 'Email is required' });
        email(path.email);
        required(path.name);
        minLength(path.name, 3);
    });
}`
    };

    advancedCode: Code = {
        html: `<!-- The component, for a signal form field or a classic control -->
<p-fielderror [field]="f.email" />
<p-fielderror [control]="form.controls.email" showWhen="dirty" />

<!-- The directive with classic forms, and with the messages by kind -->
<input pInputText formControlName="email" pFieldError [pFieldErrorMessages]="{ required: 'Fill in the email' }" />
<input pInputText [(ngModel)]="name" required minlength="3" pFieldError />

<!-- Any other way to show the errors -->
<input pInputText [formField]="f.email" pFieldError [pFieldErrorTemplate]="list" />
<ng-template #list let-errors>
    <ul>
        @for (error of errors; track error.kind) {
            <li>{{ error.message }}</li>
        }
    </ul>
</ng-template>`,
        typescript: `// Default texts, for example to translate them
provideOptimus({
    translation: {
        validation: {
            required: 'Este campo es obligatorio',
            minLength: 'Se necesitan al menos {0} caracteres'
        }
    }
});`
    };
}

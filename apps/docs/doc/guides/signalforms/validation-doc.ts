import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Code } from '@/domain/code';
import { Component, signal } from '@angular/core';
import { email, form, FormField, required } from '@angular/forms/signals';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { MessageModule } from '@openng/optimus-ui/message';

@Component({
    selector: 'validation-doc',
    standalone: true,
    imports: [FormField, InputTextModule, MessageModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                A signal form marks a field invalid as soon as a rule fails, even before the user touches it. A component bound with <i>[formField]</i> therefore shows the invalid style only after the field is <i>touched</i>, which the component
                reports when it loses the focus. Without <i>[formField]</i>, the <i>invalid</i> input is used as it is.
            </p>
            <p>The same rule applies to the error message: read <i>touched()</i> together with <i>invalid()</i>.</p>
        </app-docsectiontext>
        <div class="card flex flex-col gap-2 max-w-sm">
            <input pInputText placeholder="Email" [formField]="f.email" />
            @if (f.email().touched() && f.email().invalid()) {
                <p-message severity="error" size="small" variant="simple">{{ f.email().errors()[0].message }}</p-message>
            }
        </div>
        <app-code [code]="code" selector="validation-doc"></app-code>
    `
})
export class ValidationDoc {
    model = signal({ email: '' });

    f = form(this.model, (path) => {
        required(path.email, { message: 'Email is required' });
        email(path.email, { message: 'Enter a valid email' });
    });

    code: Code = {
        html: `<div class="card flex flex-col gap-2 max-w-sm">
    <input pInputText placeholder="Email" [formField]="f.email" />
    @if (f.email().touched() && f.email().invalid()) {
        <p-message severity="error" size="small" variant="simple">{{ f.email().errors()[0].message }}</p-message>
    }
</div>`,
        typescript: `import { Component, signal } from '@angular/core';
import { email, form, FormField, required } from '@angular/forms/signals';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { MessageModule } from '@openng/optimus-ui/message';

@Component({
    selector: 'validation-doc',
    templateUrl: './validation-doc.html',
    standalone: true,
    imports: [FormField, InputTextModule, MessageModule]
})
export class ValidationDoc {
    model = signal({ email: '' });

    f = form(this.model, (path) => {
        required(path.email, { message: 'Email is required' });
        email(path.email, { message: 'Enter a valid email' });
    });
}`
    };
}

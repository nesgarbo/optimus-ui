import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PasswordModule } from '@openng/optimus-ui/password';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { ButtonModule } from '@openng/optimus-ui/button';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'directive-doc',
    standalone: true,
    imports: [FormsModule, PasswordModule, InputTextModule, ButtonModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                The <i>pPassword</i> directive adds the strength meter to a native <i>input</i>. The meter opens while the user types and closes when the input loses the focus. <i>showPassword</i> sets the type of the input to <i>text</i> or
                <i>password</i>, so the page can bring its own toggle. Without <i>showPassword</i> the type of the input is left as it is.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-wrap items-start justify-center gap-4">
            <input id="pw-directive-basic" pPassword pInputText type="password" [(ngModel)]="value" placeholder="Password" autocomplete="off" />
            <input id="pw-directive-toggle" pPassword pInputText type="password" [(ngModel)]="value2" [showPassword]="visible" placeholder="Password" autocomplete="off" />
            <p-button id="pw-directive-button" [label]="visible ? 'Hide' : 'Show'" severity="secondary" (onClick)="visible = !visible" />
        </div>
        <app-code></app-code>
    `
})
export class DirectiveDoc {
    value!: string;

    value2!: string;

    visible = false;
}

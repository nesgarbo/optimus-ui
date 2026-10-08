import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PasswordModule } from '@openng/optimus-ui/password';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'togglemask-doc',
    standalone: true,
    imports: [FormsModule, PasswordModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                When <i>toggleMask</i> is present, an icon is displayed to show the value as plain text. The icon is a <i>button</i> that takes the focus with <i>tab</i> and has an <i>aria-label</i> and <i>aria-pressed</i>. The texts come from the
                <i>aria.showPassword</i> and <i>aria.hidePassword</i> keys of the translations (<i>Show password</i> and <i>Hide password</i>), and the clear icon from the <i>clear</i> key.
            </p>
        </app-docsectiontext>
        <div class="card flex justify-center">
            <p-password [(ngModel)]="value" [toggleMask]="true" autocomplete="off" />
        </div>
        <app-code></app-code>
    `
})
export class ToggleMaskDoc {
    value!: string;
}

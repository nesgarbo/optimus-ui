import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { Signature } from '@openng/optimus-ui/signature';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'forms-doc',
    standalone: true,
    imports: [Signature, FormField, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>Signature is a value control for signal forms, bound with <i>[formField]</i>. It also works with <i>formControlName</i>, <i>formControl</i>, <i>ngModel</i> and two-way <i>[(value)]</i>.</p>
        </app-docsectiontext>
        <div class="card">
            <p-signature [formField]="f.signature" />
            <p class="mt-4 text-sm">{{ model().signature ? 'Signed' : 'Not signed yet' }}</p>
        </div>
        <app-code></app-code>
    `
})
export class FormsDoc {
    model = signal<{ signature: string | null }>({ signature: null });

    f = form(this.model);
}

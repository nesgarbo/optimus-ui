import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { BlockEditor, type BlockValue } from '@openng/optimus-ui/blockeditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'forms-doc',
    standalone: true,
    imports: [BlockEditor, FormField, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>BlockEditor is a value control for signal forms, bound with <i>[formField]</i>. It also works with <i>formControlName</i>, <i>formControl</i>, <i>ngModel</i> and two-way <i>[(value)]</i>. An empty document is <i>null</i>.</p>
        </app-docsectiontext>
        <div class="card flex flex-col gap-4">
            <p-blockeditor [formField]="f.body" format="html" placeholder="Write the post…" />
            <pre class="text-xs overflow-auto">{{ model().body }}</pre>
        </div>
        <app-code></app-code>
    `
})
export class FormsDoc {
    model = signal<{ body: BlockValue }>({ body: '<p>Edit me.</p>' });

    f = form(this.model);
}

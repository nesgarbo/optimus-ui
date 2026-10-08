import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { Cropper } from '@openng/optimus-ui/cropper';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { samplePicture } from './sample';

@Component({
    selector: 'forms-doc',
    standalone: true,
    imports: [Cropper, FormField, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>Cropper is a value control for signal forms, bound with <i>[formField]</i>: the field holds the cropped picture. It also works with <i>formControlName</i>, <i>formControl</i>, <i>ngModel</i> and two-way <i>[(value)]</i>.</p>
        </app-docsectiontext>
        <div class="card">
            <p-cropper [src]="src" [aspectRatio]="1" [formField]="f.avatar" />
            <p class="mt-4 text-sm">{{ model().avatar ? 'Avatar chosen' : 'No avatar yet' }}</p>
        </div>
        <app-code></app-code>
    `
})
export class FormsDoc {
    src = samplePicture();

    model = signal<{ avatar: string | null }>({ avatar: null });

    f = form(this.model);
}

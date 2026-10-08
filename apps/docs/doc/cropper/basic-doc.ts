import { Component, signal, viewChild } from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { Cropper } from '@openng/optimus-ui/cropper';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { samplePicture } from './sample';

@Component({
    selector: 'basic-doc',
    standalone: true,
    imports: [Cropper, ButtonModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>src</i>, then move and resize the crop box. Drag the picture under it, or use the wheel to zoom. The cropped picture is the <i>value</i>, as a PNG data URL. <i>rotate</i>, <i>flipHorizontal</i>, <i>flipVertical</i>,
                <i>zoom</i>, <i>reset</i>, <i>selectAll</i>, <i>clear</i>, <i>toDataURL</i>, <i>toBlob</i> and <i>getCroppedCanvas</i> are methods of the component.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-col gap-4">
            <p-cropper #cropper [src]="src" [(value)]="value" />
            <div class="flex flex-wrap gap-2">
                <p-button label="Rotate" severity="secondary" size="small" (onClick)="cropper.rotate(90)" />
                <p-button label="Flip" severity="secondary" size="small" (onClick)="cropper.flipHorizontal()" />
                <p-button label="Zoom in" severity="secondary" size="small" (onClick)="cropper.zoom(0.1)" />
                <p-button label="Zoom out" severity="secondary" size="small" (onClick)="cropper.zoom(-0.1)" />
                <p-button label="Select all" severity="secondary" size="small" (onClick)="cropper.selectAll()" />
                <p-button label="Reset" severity="secondary" size="small" (onClick)="cropper.reset()" />
            </div>
            @if (value()) {
                <div>
                    <p class="mb-2 text-sm">The value:</p>
                    <img [src]="value()!" alt="The cropped picture" class="max-h-40 rounded border border-surface-200 dark:border-surface-700" />
                </div>
            }
        </div>
        <app-code></app-code>
    `
})
export class BasicDoc {
    src = samplePicture();

    value = signal<string | null>(null);
}

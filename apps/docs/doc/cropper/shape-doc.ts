import { Component, signal } from '@angular/core';
import { Cropper } from '@openng/optimus-ui/cropper';
import { SelectButtonModule } from '@openng/optimus-ui/selectbutton';
import { FormsModule } from '@angular/forms';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { samplePicture } from './sample';

@Component({
    selector: 'shape-doc',
    standalone: true,
    imports: [Cropper, SelectButtonModule, FormsModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>aspectRatio</i> holds the crop box to a shape, as width over height; leave it empty for a free box. <i>outputWidth</i> and <i>outputHeight</i> size the cropped picture, <i>outputType</i> picks <i>image/png</i>, <i>image/jpeg</i> or
                <i>image/webp</i>, and <i>quality</i> sets a lossy format. <i>initialCoverage</i>, <i>grid</i>, <i>crosshair</i>, <i>shade</i>, <i>movable</i>, <i>resizable</i> and <i>readonly</i> tune the box.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-col gap-4">
            <p-selectbutton [options]="ratios" [(ngModel)]="ratio" optionLabel="label" optionValue="value" [allowEmpty]="false" />
            <p-cropper [src]="src" [aspectRatio]="ratio()" [outputWidth]="400" outputType="image/jpeg" [quality]="0.85" [initialCoverage]="0.7" />
        </div>
        <app-code></app-code>
    `
})
export class ShapeDoc {
    src = samplePicture();

    ratio = signal<number | undefined>(undefined);

    ratios = [
        { label: 'Free', value: undefined },
        { label: '1:1', value: 1 },
        { label: '4:3', value: 4 / 3 },
        { label: '16:9', value: 16 / 9 }
    ];
}

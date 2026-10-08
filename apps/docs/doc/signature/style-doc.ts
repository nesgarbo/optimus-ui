import { Component } from '@angular/core';
import { Signature } from '@openng/optimus-ui/signature';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'style-doc',
    standalone: true,
    imports: [Signature, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>strokeColor</i>, <i>minStrokeWidth</i>, <i>maxStrokeWidth</i> and <i>velocity</i> shape the pen: a fast stroke thins towards the minimum and a slow one thickens towards the maximum. <i>backgroundColor</i> and
                <i>backgroundImage</i> sit behind the signature, and <i>saveWithBackground</i> says whether an export includes them.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-signature strokeColor="#2563eb" backgroundColor="#fefce8" [minStrokeWidth]="1" [maxStrokeWidth]="5" [velocity]="0.5" [saveWithBackground]="true" />
        </div>
        <app-code></app-code>
    `
})
export class StyleDoc {}

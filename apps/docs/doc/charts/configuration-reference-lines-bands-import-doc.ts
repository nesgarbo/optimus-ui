import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'configuration-reference-lines-bands-import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Reference lines and bands overlay fixed markers on cartesian charts. <i>ChartReferenceLine</i> draws a horizontal or vertical line at a fixed value; <i>ChartReferenceBand</i> shades a value range. Both support <i>label</i>,
                <i>stroke</i>, and dash styling.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReferenceLinesBandsImportDoc {}

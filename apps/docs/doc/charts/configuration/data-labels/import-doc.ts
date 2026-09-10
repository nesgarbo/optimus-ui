import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'configuration-data-labels-import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Data labels are opt-in: add <i>ChartDataLabels</i> to display values on chart elements; remove it and labels disappear. Works across all chart types. Use <i>display</i>, <i>formatter</i>, and a <i>pChartDataLabelDef</i> template to
                control content; <i>color</i>, <i>fontSize</i>, and <i>offset</i> to control appearance.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataLabelsImportDoc {}

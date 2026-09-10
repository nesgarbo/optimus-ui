import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'configuration-legend-import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Legends are opt-in: add <i>ChartLegend</i> to display a series key; remove it and no space is reserved. Clicking an entry toggles that series. Use <i>position</i>, <i>alignment</i>, and <i>layout</i> to control placement; use a
                <i>pChartLegendItemDef</i> template to replace individual entries with custom content.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegendImportDoc {}

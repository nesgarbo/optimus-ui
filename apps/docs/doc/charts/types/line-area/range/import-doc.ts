import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'types-line-area-range-import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>Use <i>ChartRange</i> when the band between two related series is the point: high and low prices, forecast intervals, daylight windows, or confidence ranges. It expects exactly two <i>ChartLine</i> children.</p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineAreaRangeImportDoc {}

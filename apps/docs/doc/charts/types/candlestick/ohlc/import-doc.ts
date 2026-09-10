import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'types-candlestick-ohlc-import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>Use <i>variant="ohlc"</i> when the chart needs compact tick bars instead of filled bodies. The same OHLC fields drive both variants.</p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CandlestickOhlcImportDoc {}

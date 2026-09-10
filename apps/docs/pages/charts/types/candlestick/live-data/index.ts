import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { LiveDataImport2Doc } from '@/doc/charts/types/candlestick/live-data/import-2-doc';
import { LiveDataBtcUsdHighFrequencyStreamDoc } from '@/doc/charts/types/candlestick/live-data/btc-usd-high-frequency-stream-doc';
import { LiveDataEurUsdLiveTickStreamDoc } from '@/doc/charts/types/candlestick/live-data/eur-usd-live-tick-stream-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Live Candles Examples - Optimus UI"
        header="Live Candles Examples"
        description="Live streaming candlestick demos. Each aggregates ticks into a rolling window with reactive overlays and live annotations."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesCandlestickLiveDataDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: LiveDataImport2Doc
        },
        {
            id: 'btc-usd-high-frequency-stream',
            label: 'BTC/USD, High-Frequency Stream',
            component: LiveDataBtcUsdHighFrequencyStreamDoc
        },
        {
            id: 'eur-usd-live-tick-stream',
            label: 'EUR/USD, Live Tick Stream',
            component: LiveDataEurUsdLiveTickStreamDoc
        }
    ];
}

import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { CandlestickImport2Doc } from '@/doc/charts/types/candlestick/candlestick/import-2-doc';
import { CandlestickBitcoinBtcUsdWeeklyNov2021ToDec2024Doc } from '@/doc/charts/types/candlestick/candlestick/bitcoin-btc-usd-weekly-nov-2021-to-dec-2024-doc';
import { CandlestickAppleIncAapl2024DailyOhlcDoc } from '@/doc/charts/types/candlestick/candlestick/apple-inc-aapl-2024-daily-ohlc-doc';
import { CandlestickAaplQ12024WithVolumeSubPaneDoc } from '@/doc/charts/types/candlestick/candlestick/aapl-q1-2024-with-volume-sub-pane-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Candlestick Examples - Optimus UI"
        header="Candlestick Examples"
        description="Filled-body candlestick demos on real data. Covers log scale, zoom with navigator, and event annotations."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesCandlestickCandlestickDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: CandlestickImport2Doc
        },
        {
            id: 'bitcoin-btc-usd-weekly-nov-2021-to-dec-2024',
            label: 'Bitcoin (BTC/USD), Weekly, Nov 2021 to Dec 2024',
            component: CandlestickBitcoinBtcUsdWeeklyNov2021ToDec2024Doc
        },
        {
            id: 'apple-inc-aapl-2024-daily-ohlc',
            label: 'Apple Inc. (AAPL), 2024 Daily OHLC',
            component: CandlestickAppleIncAapl2024DailyOhlcDoc
        },
        {
            id: 'aapl-q1-2024-with-volume-sub-pane',
            label: 'AAPL, Q1 2024 with Volume sub-pane',
            component: CandlestickAaplQ12024WithVolumeSubPaneDoc
        }
    ];
}

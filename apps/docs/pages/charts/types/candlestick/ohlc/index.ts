import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { OhlcImport2Doc } from '@/doc/charts/types/candlestick/ohlc/import-2-doc';
import { OhlcWtiCrudeOilCl12024WeeklyOhlcDoc } from '@/doc/charts/types/candlestick/ohlc/wti-crude-oil-cl1-2024-weekly-ohlc-doc';
import { OhlcGoldSpotXauUsd2024WeeklyOhlcDoc } from '@/doc/charts/types/candlestick/ohlc/gold-spot-xau-usd-2024-weekly-ohlc-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts OHLC Examples - Optimus UI"
        header="OHLC Examples"
        description='OHLC bar chart demos on real data. Each uses variant="ohlc" with per-bar color callbacks and event annotations.'
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesCandlestickOhlcDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: OhlcImport2Doc
        },
        {
            id: 'wti-crude-oil-cl1-2024-weekly-ohlc',
            label: 'WTI Crude Oil (CL1), 2024 Weekly OHLC',
            component: OhlcWtiCrudeOilCl12024WeeklyOhlcDoc
        },
        {
            id: 'gold-spot-xau-usd-2024-weekly-ohlc',
            label: 'Gold Spot (XAU/USD), 2024 Weekly OHLC',
            component: OhlcGoldSpotXauUsd2024WeeklyOhlcDoc
        }
    ];
}

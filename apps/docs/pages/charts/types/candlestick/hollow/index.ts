import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { HollowImport2Doc } from '@/doc/charts/types/candlestick/hollow/import-2-doc';
import { HollowTeslaIncTsla2024WeeklyHollowCandlesDoc } from '@/doc/charts/types/candlestick/hollow/tesla-inc-tsla-2024-weekly-hollow-candles-doc';
import { HollowEurUsdH22024DailyHollowCandlesDoc } from '@/doc/charts/types/candlestick/hollow/eur-usd-h2-2024-daily-hollow-candles-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Hollow Candles Examples - Optimus UI"
        header="Hollow Candles Examples"
        description="Hollow-body candlestick demos on real data. Covers momentum-based coloring, earnings event annotations, and EMA slope callbacks."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesCandlestickHollowDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: HollowImport2Doc
        },
        {
            id: 'tesla-inc-tsla-2024-weekly-hollow-candles',
            label: 'Tesla, Inc. (TSLA), 2024 Weekly Hollow Candles',
            component: HollowTeslaIncTsla2024WeeklyHollowCandlesDoc
        },
        {
            id: 'eur-usd-h2-2024-daily-hollow-candles',
            label: 'EUR/USD, H2 2024 Daily Hollow Candles',
            component: HollowEurUsdH22024DailyHollowCandlesDoc
        }
    ];
}

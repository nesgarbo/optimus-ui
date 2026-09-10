import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { WaterfallImport2Doc } from '@/doc/charts/types/column-bar/waterfall/import-2-doc';
import { WaterfallEu27GovernmentRevenueAndSpending2022Doc } from '@/doc/charts/types/column-bar/waterfall/eu-27-government-revenue-and-spending-2022-doc';
import { WaterfallGlobalCarbonBudget2022SourcesSinksNetAccumulationDoc } from '@/doc/charts/types/column-bar/waterfall/global-carbon-budget-2022-sources-sinks-net-accumulation-doc';
import { WaterfallFy2023EbitdaBridgeStackedWaterfallDoc } from '@/doc/charts/types/column-bar/waterfall/fy-2023-ebitda-bridge-stacked-waterfall-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Waterfall Examples - Optimus UI"
        header="Waterfall Examples"
        description="Waterfall chart demos on real data. Covers color routing by contribution type, horizontal orientation, and stacked waterfall layers."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesColumnBarWaterfallDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: WaterfallImport2Doc
        },
        {
            id: 'eu-27-government-revenue-and-spending-2022',
            label: 'EU-27 Government Revenue and Spending, 2022',
            component: WaterfallEu27GovernmentRevenueAndSpending2022Doc
        },
        {
            id: 'global-carbon-budget-2022-sources-sinks-net-accumulation',
            label: 'Global Carbon Budget 2022, Sources, Sinks, Net Accumulation',
            component: WaterfallGlobalCarbonBudget2022SourcesSinksNetAccumulationDoc
        },
        {
            id: 'fy-2023-ebitda-bridge-stacked-waterfall',
            label: 'FY 2023 EBITDA Bridge, Stacked Waterfall',
            component: WaterfallFy2023EbitdaBridgeStackedWaterfallDoc
        }
    ];
}

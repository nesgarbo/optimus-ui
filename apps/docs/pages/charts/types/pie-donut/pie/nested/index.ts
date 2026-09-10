import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { NestedImport2Doc } from '@/doc/charts/types/pie-donut/pie/nested/import-2-doc';
import { NestedGlobalEvSalesByMarketAndPowertrain2016To2023Doc } from '@/doc/charts/types/pie-donut/pie/nested/global-ev-sales-by-market-and-powertrain-2016-to-2023-doc';
import { NestedWorldGdpByRegionAndIncomeGroup2023Doc } from '@/doc/charts/types/pie-donut/pie/nested/world-gdp-by-region-and-income-group-2023-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Nested Pie Examples - Optimus UI"
        header="Nested Pie Examples"
        description="Concentric pie rings for hierarchical data using ChartStacked with multiple ChartPie components."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesPieDonutPieNestedDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: NestedImport2Doc
        },
        {
            id: 'global-ev-sales-by-market-and-powertrain-2016-to-2023',
            label: 'Global EV Sales by Market and Powertrain, 2016 to 2023',
            component: NestedGlobalEvSalesByMarketAndPowertrain2016To2023Doc
        },
        {
            id: 'world-gdp-by-region-and-income-group-2023',
            label: 'World GDP by region and income group 2023',
            component: NestedWorldGdpByRegionAndIncomeGroup2023Doc
        }
    ];
}

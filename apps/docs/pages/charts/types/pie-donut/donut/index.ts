import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { DonutImport2Doc } from '@/doc/charts/types/pie-donut/donut/import-2-doc';
import { DonutBrowserMarketShareDoc } from '@/doc/charts/types/pie-donut/donut/browser-market-share-doc';
import { DonutSandp500SectorBreakdownDoc } from '@/doc/charts/types/pie-donut/donut/sandp-500-sector-breakdown-doc';
import { DonutRenewableEnergyByRegionDoc } from '@/doc/charts/types/pie-donut/donut/renewable-energy-by-region-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Donut Examples - Optimus UI"
        header="Donut Examples"
        description="Donut chart demos on real data. Covers animated slice reordering, live annotation content, and custom center readouts."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesPieDonutDonutDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: DonutImport2Doc
        },
        {
            id: 'browser-market-share',
            label: 'Browser Market Share',
            component: DonutBrowserMarketShareDoc
        },
        {
            id: 'sandp-500-sector-breakdown',
            label: 'S&P 500 Sector Breakdown',
            component: DonutSandp500SectorBreakdownDoc
        },
        {
            id: 'renewable-energy-by-region',
            label: 'Renewable Energy by Region',
            component: DonutRenewableEnergyByRegionDoc
        }
    ];
}

import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { PieImport2Doc } from '@/doc/charts/types/pie-donut/pie/import-2-doc';
import { PieIaasCloudMarketShareDoc } from '@/doc/charts/types/pie-donut/pie/iaas-cloud-market-share-doc';
import { PieBrowserMarketShareDoc } from '@/doc/charts/types/pie-donut/pie/browser-market-share-doc';
import { PieGlobalEnergyMixDoc } from '@/doc/charts/types/pie-donut/pie/global-energy-mix-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Pie Examples - Optimus UI"
        header="Pie Examples"
        description="Pie chart demos on real data. Covers custom label rendering, color mapping, and center annotations."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesPieDonutPieDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: PieImport2Doc
        },
        {
            id: 'iaas-cloud-market-share',
            label: 'IaaS Cloud Market Share',
            component: PieIaasCloudMarketShareDoc
        },
        {
            id: 'browser-market-share',
            label: 'Browser Market Share',
            component: PieBrowserMarketShareDoc
        },
        {
            id: 'global-energy-mix',
            label: 'Global Energy Mix',
            component: PieGlobalEnergyMixDoc
        }
    ];
}

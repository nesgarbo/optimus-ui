import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { StackedImport2Doc } from '@/doc/charts/types/line-area/stacked/import-2-doc';
import { StackedUsFederalSpending20002023Doc } from '@/doc/charts/types/line-area/stacked/us-federal-spending-2000-2023-doc';
import { StackedEu27EnergyMix20132023Doc } from '@/doc/charts/types/line-area/stacked/eu-27-energy-mix-2013-2023-doc';

@Component({
    template: `<app-doc docTitle="Angular Charts Stacked Line Examples - Optimus UI" header="Stacked Line Examples" description="Examples of stacked area charts in absolute and percent normalized mode." [docs]="docs" themeDocs="charts"></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesLineAreaStackedDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: StackedImport2Doc
        },
        {
            id: 'us-federal-spending-2000-2023',
            label: 'US Federal Spending 2000–2023',
            component: StackedUsFederalSpending20002023Doc
        },
        {
            id: 'eu-27-energy-mix-2013-2023',
            label: 'EU-27 Energy Mix 2013–2023',
            component: StackedEu27EnergyMix20132023Doc
        }
    ];
}

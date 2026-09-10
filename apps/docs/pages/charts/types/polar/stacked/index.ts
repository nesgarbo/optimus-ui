import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { StackedImport2Doc } from '@/doc/charts/types/polar/stacked/import-2-doc';
import { StackedUkGridMonthlyRenewableGenerationBySourceDoc } from '@/doc/charts/types/polar/stacked/uk-grid-monthly-renewable-generation-by-source-doc';
import { StackedWindSpeedByDirectionMorningVsAfternoonDoc } from '@/doc/charts/types/polar/stacked/wind-speed-by-direction-morning-vs-afternoon-doc';
import { StackedWindGustinessByDirectionSustainedVsGustsDoc } from '@/doc/charts/types/polar/stacked/wind-gustiness-by-direction-sustained-vs-gusts-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Stacked Polar Examples - Optimus UI"
        header="Stacked Polar Examples"
        description="Stacked polar bar chart examples using ChartStacked in both absolute and percent-normalized configurations."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesPolarStackedDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: StackedImport2Doc
        },
        {
            id: 'uk-grid-monthly-renewable-generation-by-source',
            label: 'UK Grid: Monthly Renewable Generation by Source',
            component: StackedUkGridMonthlyRenewableGenerationBySourceDoc
        },
        {
            id: 'wind-speed-by-direction-morning-vs-afternoon',
            label: 'Wind Speed by Direction: Morning vs Afternoon',
            component: StackedWindSpeedByDirectionMorningVsAfternoonDoc
        },
        {
            id: 'wind-gustiness-by-direction-sustained-vs-gusts',
            label: 'Wind Gustiness by Direction: Sustained vs Gusts',
            component: StackedWindGustinessByDirectionSustainedVsGustsDoc
        }
    ];
}

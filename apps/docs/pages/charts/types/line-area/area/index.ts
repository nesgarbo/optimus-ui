import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { AreaImport2Doc } from '@/doc/charts/types/line-area/area/import-2-doc';
import { AreaUsUnemploymentRate20002024Doc } from '@/doc/charts/types/line-area/area/us-unemployment-rate-2000-2024-doc';
import { AreaUsElectricityGenerationMix20102023Doc } from '@/doc/charts/types/line-area/area/us-electricity-generation-mix-2010-2023-doc';
import { AreaUsTreasuryYieldCurve20192024Doc } from '@/doc/charts/types/line-area/area/us-treasury-yield-curve-2019-2024-doc';

@Component({
    template: `<app-doc docTitle="Angular Charts Area Examples - Optimus UI" header="Area Examples" description="Examples of area charts with segment fill coloring, reference overlays, and zoom." [docs]="docs" themeDocs="charts"></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesLineAreaAreaDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: AreaImport2Doc
        },
        {
            id: 'us-unemployment-rate-2000-2024',
            label: 'US Unemployment Rate 2000–2024',
            component: AreaUsUnemploymentRate20002024Doc
        },
        {
            id: 'us-electricity-generation-mix-2010-2023',
            label: 'US Electricity Generation Mix 2010–2023',
            component: AreaUsElectricityGenerationMix20102023Doc
        },
        {
            id: 'us-treasury-yield-curve-2019-2024',
            label: 'US Treasury Yield Curve 2019–2024',
            component: AreaUsTreasuryYieldCurve20192024Doc
        }
    ];
}

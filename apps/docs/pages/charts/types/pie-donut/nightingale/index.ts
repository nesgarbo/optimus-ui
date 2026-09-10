import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { NightingaleImport2Doc } from '@/doc/charts/types/pie-donut/nightingale/import-2-doc';
import { NightingaleUsTornadoClimatologyDoc } from '@/doc/charts/types/pie-donut/nightingale/us-tornado-climatology-doc';
import { NightingaleNoaaMonthlyPrecipitation2024Doc } from '@/doc/charts/types/pie-donut/nightingale/noaa-monthly-precipitation-2024-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Nightingale Examples - Optimus UI"
        header="Nightingale Examples"
        description="Rose chart where both angle and outer radius encode data values via sliceRadiusValue."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesPieDonutNightingaleDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: NightingaleImport2Doc
        },
        {
            id: 'us-tornado-climatology',
            label: 'US Tornado Climatology',
            component: NightingaleUsTornadoClimatologyDoc
        },
        {
            id: 'noaa-monthly-precipitation-2024',
            label: 'NOAA Monthly Precipitation 2024',
            component: NightingaleNoaaMonthlyPrecipitation2024Doc
        }
    ];
}

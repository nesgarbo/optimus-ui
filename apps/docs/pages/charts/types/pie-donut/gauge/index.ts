import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { GaugeImport2Doc } from '@/doc/charts/types/pie-donut/gauge/import-2-doc';
import { GaugeGbGridCarbonIntensityDoc } from '@/doc/charts/types/pie-donut/gauge/gb-grid-carbon-intensity-doc';
import { GaugeAtmosphericCoConcentrationMaunaLoaDoc } from '@/doc/charts/types/pie-donut/gauge/atmospheric-co-concentration-mauna-loa-doc';
import { GaugeNasaGlobalTemperatureAnomalyDoc } from '@/doc/charts/types/pie-donut/gauge/nasa-global-temperature-anomaly-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Gauge Examples - Optimus UI"
        header="Gauge Examples"
        description="Gauge examples combining color zone segments, ChartAnnotation needles, and interactive zone tooltips."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesPieDonutGaugeDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: GaugeImport2Doc
        },
        {
            id: 'gb-grid-carbon-intensity',
            label: 'GB Grid Carbon Intensity',
            component: GaugeGbGridCarbonIntensityDoc
        },
        {
            id: 'atmospheric-co-concentration-mauna-loa',
            label: 'Atmospheric CO₂ Concentration: Mauna Loa',
            component: GaugeAtmosphericCoConcentrationMaunaLoaDoc
        },
        {
            id: 'nasa-global-temperature-anomaly',
            label: 'NASA Global Temperature Anomaly',
            component: GaugeNasaGlobalTemperatureAnomalyDoc
        }
    ];
}

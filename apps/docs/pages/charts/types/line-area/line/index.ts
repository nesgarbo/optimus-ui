import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { LineImport2Doc } from '@/doc/charts/types/line-area/line/import-2-doc';
import { LineNasaGlobalTemperatureAnomalyDoc } from '@/doc/charts/types/line-area/line/nasa-global-temperature-anomaly-doc';
import { LineUSUnemploymentRate20002024Doc } from '@/doc/charts/types/line-area/line/u-s-unemployment-rate-2000-2024-doc';
import { LineUsStockIndicesNormalisedComparisonDoc } from '@/doc/charts/types/line-area/line/us-stock-indices-normalised-comparison-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Line Examples - Optimus UI"
        header="Line Examples"
        description="Line chart demos built on real datasets. Each combines multiple features in a realistic context."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesLineAreaLineDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: LineImport2Doc
        },
        {
            id: 'nasa-global-temperature-anomaly',
            label: 'NASA Global Temperature Anomaly',
            component: LineNasaGlobalTemperatureAnomalyDoc
        },
        {
            id: 'u-s-unemployment-rate-2000-2024',
            label: 'U.S. Unemployment Rate 2000–2024',
            component: LineUSUnemploymentRate20002024Doc
        },
        {
            id: 'us-stock-indices-normalised-comparison',
            label: 'US Stock Indices: Normalised Comparison',
            component: LineUsStockIndicesNormalisedComparisonDoc
        }
    ];
}

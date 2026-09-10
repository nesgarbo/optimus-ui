import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { TimeSeriesImport2Doc } from '@/doc/charts/types/line-area/time-series/import-2-doc';
import { TimeSeriesLiveServerMetricsCpuAndMemoryUtilisationDoc } from '@/doc/charts/types/line-area/time-series/live-server-metrics-cpu-and-memory-utilisation-doc';
import { TimeSeriesLiveStockPriceAcmeCorpDoc } from '@/doc/charts/types/line-area/time-series/live-stock-price-acme-corp-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Time Series Line Examples - Optimus UI"
        header="Time Series Line Examples"
        description="Line and area charts on a live time axis. Each demo uses a streaming rolling window."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesLineAreaTimeSeriesDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: TimeSeriesImport2Doc
        },
        {
            id: 'live-server-metrics-cpu-and-memory-utilisation',
            label: 'Live server metrics: CPU and memory utilisation',
            component: TimeSeriesLiveServerMetricsCpuAndMemoryUtilisationDoc
        },
        {
            id: 'live-stock-price-acme-corp',
            label: 'Live stock price: ACME Corp',
            component: TimeSeriesLiveStockPriceAcmeCorpDoc
        }
    ];
}

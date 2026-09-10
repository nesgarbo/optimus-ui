import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { ExamplesImport2Doc } from '@/doc/charts/types/combo/examples/import-2-doc';
import { ExamplesClimateDashboardRainfallTemperatureDoc } from '@/doc/charts/types/combo/examples/climate-dashboard-rainfall-temperature-doc';
import { ExamplesStockPriceVolumeDoc } from '@/doc/charts/types/combo/examples/stock-price-volume-doc';
import { ExamplesRevenueMixVsTargetWithGrowthOverlayDoc } from '@/doc/charts/types/combo/examples/revenue-mix-vs-target-with-growth-overlay-doc';
import { ExamplesChannelEfficiencyQuadrantsDoc } from '@/doc/charts/types/combo/examples/channel-efficiency-quadrants-doc';
import { ExamplesEconomicForecastEnvelopeDoc } from '@/doc/charts/types/combo/examples/economic-forecast-envelope-doc';
import { ExamplesProductCapabilityBenchmarkRadarPolarDoc } from '@/doc/charts/types/combo/examples/product-capability-benchmark-radar-polar-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Combo Examples - Optimus UI"
        header="Combo Examples"
        description="Combo chart demos on real data. Each combines multiple chart types to show complementary data views."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesComboExamplesDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: ExamplesImport2Doc
        },
        {
            id: 'climate-dashboard-rainfall-temperature',
            label: 'Climate Dashboard: Rainfall + Temperature',
            component: ExamplesClimateDashboardRainfallTemperatureDoc
        },
        {
            id: 'stock-price-volume',
            label: 'Stock Price + Volume',
            component: ExamplesStockPriceVolumeDoc
        },
        {
            id: 'revenue-mix-vs-target-with-growth-overlay',
            label: 'Revenue Mix vs Target with Growth Overlay',
            component: ExamplesRevenueMixVsTargetWithGrowthOverlayDoc
        },
        {
            id: 'channel-efficiency-quadrants',
            label: 'Channel Efficiency Quadrants',
            component: ExamplesChannelEfficiencyQuadrantsDoc
        },
        {
            id: 'economic-forecast-envelope',
            label: 'Economic Forecast Envelope',
            component: ExamplesEconomicForecastEnvelopeDoc
        },
        {
            id: 'product-capability-benchmark-radar-polar',
            label: 'Product Capability Benchmark: Radar + Polar',
            component: ExamplesProductCapabilityBenchmarkRadarPolarDoc
        }
    ];
}

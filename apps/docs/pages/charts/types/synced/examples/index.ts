import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { ExamplesImport2Doc } from '@/doc/charts/types/synced/examples/import-2-doc';
import { ExamplesClimateOverviewDoc } from '@/doc/charts/types/synced/examples/climate-overview-doc';
import { ExamplesTradingWatchlistSparklinesInTableDoc } from '@/doc/charts/types/synced/examples/trading-watchlist-sparklines-in-table-doc';
import { ExamplesFleetTelemetryKpiStripDoc } from '@/doc/charts/types/synced/examples/fleet-telemetry-kpi-strip-doc';
import { ExamplesECommerceFunnelCategorySyncDoc } from '@/doc/charts/types/synced/examples/e-commerce-funnel-category-sync-doc';
import { ExamplesServerMetricsMonitorDoc } from '@/doc/charts/types/synced/examples/server-metrics-monitor-doc';
import { ExamplesEnergyGridOperationsDoc } from '@/doc/charts/types/synced/examples/energy-grid-operations-doc';
import { ExamplesCandlestickVolumeStackedPanesDoc } from '@/doc/charts/types/synced/examples/candlestick-volume-stacked-panes-doc';
import { ExamplesFinancialWorkstationPriceVolumeSpreadDoc } from '@/doc/charts/types/synced/examples/financial-workstation-price-volume-spread-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Synced Charts Examples - Optimus UI"
        header="Synced Charts Examples"
        description="Synced chart examples using ChartGroup for crosshair sync, zoom lockstep, shared legends, and category sync across mixed chart types."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesSyncedExamplesDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: ExamplesImport2Doc
        },
        {
            id: 'climate-overview',
            label: 'Climate Overview',
            component: ExamplesClimateOverviewDoc
        },
        {
            id: 'trading-watchlist-sparklines-in-table',
            label: 'Trading Watchlist: Sparklines in Table',
            component: ExamplesTradingWatchlistSparklinesInTableDoc
        },
        {
            id: 'fleet-telemetry-kpi-strip',
            label: 'Fleet Telemetry: KPI Strip',
            component: ExamplesFleetTelemetryKpiStripDoc
        },
        {
            id: 'e-commerce-funnel-category-sync',
            label: 'E-commerce Funnel: Category Sync',
            component: ExamplesECommerceFunnelCategorySyncDoc
        },
        {
            id: 'server-metrics-monitor',
            label: 'Server Metrics Monitor',
            component: ExamplesServerMetricsMonitorDoc
        },
        {
            id: 'energy-grid-operations',
            label: 'Energy Grid Operations',
            component: ExamplesEnergyGridOperationsDoc
        },
        {
            id: 'candlestick-volume-stacked-panes',
            label: 'Candlestick + Volume: Stacked Panes',
            component: ExamplesCandlestickVolumeStackedPanesDoc
        },
        {
            id: 'financial-workstation-price-volume-spread',
            label: 'Financial Workstation: Price, Volume, Spread',
            component: ExamplesFinancialWorkstationPriceVolumeSpreadDoc
        }
    ];
}

import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { PolarImport2Doc } from '@/doc/charts/types/polar/polar/import-2-doc';
import { PolarMonacoGrandPrixSectorPerformanceByTeamDoc } from '@/doc/charts/types/polar/polar/monaco-grand-prix-sector-performance-by-team-doc';
import { PolarHeathrowLhrScheduledDeparturesByHourOfDayDoc } from '@/doc/charts/types/polar/polar/heathrow-lhr-scheduled-departures-by-hour-of-day-doc';
import { PolarGlobalFxMarket24HourTradingVolumeCycleDoc } from '@/doc/charts/types/polar/polar/global-fx-market-24-hour-trading-volume-cycle-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Polar Examples - Optimus UI"
        header="Polar Examples"
        description="Polar chart examples using grouped series, custom color functions, and per-hour tooltip rendering across cyclical datasets."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesPolarPolarDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: PolarImport2Doc
        },
        {
            id: 'monaco-grand-prix-sector-performance-by-team',
            label: 'Monaco Grand Prix: Sector Performance by Team',
            component: PolarMonacoGrandPrixSectorPerformanceByTeamDoc
        },
        {
            id: 'heathrow-lhr-scheduled-departures-by-hour-of-day',
            label: 'Heathrow LHR: Scheduled Departures by Hour of Day',
            component: PolarHeathrowLhrScheduledDeparturesByHourOfDayDoc
        },
        {
            id: 'global-fx-market-24-hour-trading-volume-cycle',
            label: 'Global FX Market: 24-Hour Trading Volume Cycle',
            component: PolarGlobalFxMarket24HourTradingVolumeCycleDoc
        }
    ];
}

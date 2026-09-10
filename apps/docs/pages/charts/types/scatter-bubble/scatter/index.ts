import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { ScatterImport2Doc } from '@/doc/charts/types/scatter-bubble/scatter/import-2-doc';
import { ScatterUsTechProfitabilityFortune100BySubIndustryFy2023Doc } from '@/doc/charts/types/scatter-bubble/scatter/us-tech-profitability-fortune-100-by-sub-industry-fy2023-doc';
import { ScatterNba202324ScorersVsPlaymakersByPositionDoc } from '@/doc/charts/types/scatter-bubble/scatter/nba-2023-24-scorers-vs-playmakers-by-position-doc';
import { ScatterMooreSLawTransistorCountPerMicroprocessor19712024Doc } from '@/doc/charts/types/scatter-bubble/scatter/moore-s-law-transistor-count-per-microprocessor-1971-2024-doc';
import { ScatterWindFarmTelemetry100000ReadingsDecimatedDoc } from '@/doc/charts/types/scatter-bubble/scatter/wind-farm-telemetry-100-000-readings-decimated-doc';
import { Scatter100000PointsCanvasBoostModeDoc } from '@/doc/charts/types/scatter-bubble/scatter/100-000-points-canvas-boost-mode-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Scatter Examples - Optimus UI"
        header="Scatter Examples"
        description="Scatter chart examples using custom legend and tooltip rendering, logarithmic axes, decimation, and boost mode for large point clouds."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesScatterBubbleScatterDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: ScatterImport2Doc
        },
        {
            id: 'us-tech-profitability-fortune-100-by-sub-industry-fy2023',
            label: 'US Tech Profitability: Fortune 100 by Sub-Industry, FY2023',
            component: ScatterUsTechProfitabilityFortune100BySubIndustryFy2023Doc
        },
        {
            id: 'nba-2023-24-scorers-vs-playmakers-by-position',
            label: 'NBA 2023-24: Scorers vs Playmakers, by Position',
            component: ScatterNba202324ScorersVsPlaymakersByPositionDoc
        },
        {
            id: 'moore-s-law-transistor-count-per-microprocessor-1971-2024',
            label: "Moore's Law: Transistor Count per Microprocessor, 1971–2024",
            component: ScatterMooreSLawTransistorCountPerMicroprocessor19712024Doc
        },
        {
            id: 'wind-farm-telemetry-100-000-readings-decimated',
            label: 'Wind Farm Telemetry: 100,000 Readings, Decimated',
            component: ScatterWindFarmTelemetry100000ReadingsDecimatedDoc
        },
        {
            id: '100-000-points-canvas-boost-mode',
            label: '100,000 Points · Canvas + Boost Mode',
            component: Scatter100000PointsCanvasBoostModeDoc
        }
    ];
}

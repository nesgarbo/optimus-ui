import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { HeatmapImport2Doc } from '@/doc/charts/types/heatmap/heatmap/import-2-doc';
import { HeatmapSandp500SectorCorrelationMatrixDailyReturns2023Doc } from '@/doc/charts/types/heatmap/heatmap/sandp-500-sector-correlation-matrix-daily-returns-2023-doc';
import { HeatmapOlympicMedalTableBySportDoc } from '@/doc/charts/types/heatmap/heatmap/olympic-medal-table-by-sport-doc';
import { HeatmapSaasMonthlyCohortRetention2024SignupsDoc } from '@/doc/charts/types/heatmap/heatmap/saas-monthly-cohort-retention-2024-signups-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Heatmap Examples - Optimus UI"
        header="Heatmap Examples"
        description="Heatmap chart demos built on real datasets. Each uses a different color scale and cell-level labeling strategy."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesHeatmapHeatmapDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: HeatmapImport2Doc
        },
        {
            id: 'sandp-500-sector-correlation-matrix-daily-returns-2023',
            label: 'S&P 500 Sector Correlation Matrix: Daily Returns, 2023',
            component: HeatmapSandp500SectorCorrelationMatrixDailyReturns2023Doc
        },
        {
            id: 'olympic-medal-table-by-sport',
            label: 'Olympic Medal Table by Sport',
            component: HeatmapOlympicMedalTableBySportDoc
        },
        {
            id: 'saas-monthly-cohort-retention-2024-signups',
            label: 'SaaS Monthly-Cohort Retention: 2024 Signups',
            component: HeatmapSaasMonthlyCohortRetention2024SignupsDoc
        }
    ];
}

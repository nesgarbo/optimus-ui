import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { StackedImport2Doc } from '@/doc/charts/types/radar/stacked/import-2-doc';
import { StackedDigitalTransformationEngagementHoursByServicePhaseDoc } from '@/doc/charts/types/radar/stacked/digital-transformation-engagement-hours-by-service-phase-doc';
import { StackedSaasPlatformMonthlyUsageByPlanTierDoc } from '@/doc/charts/types/radar/stacked/saas-platform-monthly-usage-by-plan-tier-doc';
import { StackedGlobalRetailerRevenueMixByRegionQ32025Doc } from '@/doc/charts/types/radar/stacked/global-retailer-revenue-mix-by-region-q3-2025-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Stacked Radar Examples - Optimus UI"
        header="Stacked Radar Examples"
        description="Stacked radar demos built on real datasets. Each uses ChartStacked to build concentric rings that represent series contributions per spoke."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesRadarStackedDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: StackedImport2Doc
        },
        {
            id: 'digital-transformation-engagement-hours-by-service-phase',
            label: 'Digital Transformation Engagement: Hours by Service × Phase',
            component: StackedDigitalTransformationEngagementHoursByServicePhaseDoc
        },
        {
            id: 'saas-platform-monthly-usage-by-plan-tier',
            label: 'SaaS Platform: Monthly Usage by Plan Tier',
            component: StackedSaasPlatformMonthlyUsageByPlanTierDoc
        },
        {
            id: 'global-retailer-revenue-mix-by-region-q3-2025',
            label: 'Global Retailer: Revenue Mix by Region, Q3 2025',
            component: StackedGlobalRetailerRevenueMixByRegionQ32025Doc
        }
    ];
}

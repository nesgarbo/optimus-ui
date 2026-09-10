import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { ResponsiveImport2Doc } from '@/doc/charts/reference/responsive/import-2-doc';
import { ResponsiveBasicDoc } from '@/doc/charts/reference/responsive/basic-doc';
import { ResponsiveAutoAdaptiveScalingDoc } from '@/doc/charts/reference/responsive/auto-adaptive-scaling-doc';
import { ResponsiveCustomRulesDoc } from '@/doc/charts/reference/responsive/custom-rules-doc';
import { ResponsiveCustomBreakpointsDoc } from '@/doc/charts/reference/responsive/custom-breakpoints-doc';
import { ResponsiveHidingElementsAtSmallSizesDoc } from '@/doc/charts/reference/responsive/hiding-elements-at-small-sizes-doc';
import { ResponsiveMobileDashboardDoc } from '@/doc/charts/reference/responsive/mobile-dashboard-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Responsive - Optimus UI"
        header="Responsive"
        description="Adapt chart configuration to different container sizes with font and layout scaling and custom breakpoint rules."
        [docs]="docs"
        [apiDocs]="['ChartResponsive']"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsReferenceResponsiveDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: ResponsiveImport2Doc
        },
        {
            id: 'basic',
            label: 'Basic',
            component: ResponsiveBasicDoc
        },
        {
            id: 'auto-adaptive-scaling',
            label: 'Auto-Adaptive Scaling',
            component: ResponsiveAutoAdaptiveScalingDoc
        },
        {
            id: 'custom-rules',
            label: 'Custom Rules',
            component: ResponsiveCustomRulesDoc
        },
        {
            id: 'custom-breakpoints',
            label: 'Custom Breakpoints',
            component: ResponsiveCustomBreakpointsDoc
        },
        {
            id: 'hiding-elements-at-small-sizes',
            label: 'Hiding Elements at Small Sizes',
            component: ResponsiveHidingElementsAtSmallSizesDoc
        },
        {
            id: 'mobile-dashboard',
            label: 'Mobile Dashboard',
            component: ResponsiveMobileDashboardDoc
        }
    ];
}

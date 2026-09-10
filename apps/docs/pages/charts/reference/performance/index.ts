import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { PerformanceImport2Doc } from '@/doc/charts/reference/performance/import-2-doc';
import { PerformancePerformanceDoc } from '@/doc/charts/reference/performance/performance-doc';
import { PerformanceRunnableLargeDataEvidenceDoc } from '@/doc/charts/reference/performance/runnable-large-data-evidence-doc';
import { PerformancePracticalLimitsDoc } from '@/doc/charts/reference/performance/practical-limits-doc';
import { PerformanceSvgVsCanvasDoc } from '@/doc/charts/reference/performance/svg-vs-canvas-doc';
import { PerformanceDecimationDoc } from '@/doc/charts/reference/performance/decimation-doc';
import { PerformanceAnimationDoc } from '@/doc/charts/reference/performance/animation-doc';
import { PerformanceZoomAndNavigatorDoc } from '@/doc/charts/reference/performance/zoom-and-navigator-doc';
import { PerformanceLiveUpdatesDoc } from '@/doc/charts/reference/performance/live-updates-doc';
import { PerformanceCustomRenderingDoc } from '@/doc/charts/reference/performance/custom-rendering-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Performance - Optimus UI"
        header="Performance"
        description="Reference for renderer choice, decimation, animation limits, and windowing large or streaming datasets."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsReferencePerformanceDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: PerformanceImport2Doc
        },
        {
            id: 'performance',
            label: 'Performance',
            component: PerformancePerformanceDoc
        },
        {
            id: 'runnable-large-data-evidence',
            label: 'Runnable large-data evidence',
            component: PerformanceRunnableLargeDataEvidenceDoc
        },
        {
            id: 'practical-limits',
            label: 'Practical Limits',
            component: PerformancePracticalLimitsDoc
        },
        {
            id: 'svg-vs-canvas',
            label: 'SVG vs Canvas',
            component: PerformanceSvgVsCanvasDoc
        },
        {
            id: 'decimation',
            label: 'Decimation',
            component: PerformanceDecimationDoc
        },
        {
            id: 'animation',
            label: 'Animation',
            component: PerformanceAnimationDoc
        },
        {
            id: 'zoom-and-navigator',
            label: 'Zoom & Navigator',
            component: PerformanceZoomAndNavigatorDoc
        },
        {
            id: 'live-updates',
            label: 'Live Updates',
            component: PerformanceLiveUpdatesDoc
        },
        {
            id: 'custom-rendering',
            label: 'Custom Rendering',
            component: PerformanceCustomRenderingDoc
        }
    ];
}

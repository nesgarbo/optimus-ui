import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { ArchitectureImport2Doc } from '@/doc/charts/getting-started/architecture/import-2-doc';
import { ArchitectureFirstChartDoc } from '@/doc/charts/getting-started/architecture/first-chart-doc';
import { ArchitectureDataModelDoc } from '@/doc/charts/getting-started/architecture/data-model-doc';
import { ArchitectureChartTypesDoc } from '@/doc/charts/getting-started/architecture/chart-types-doc';
import { ArchitectureCompoundApiDoc } from '@/doc/charts/getting-started/architecture/compound-api-doc';
import { ArchitectureDualRenderingDoc } from '@/doc/charts/getting-started/architecture/dual-rendering-doc';
import { ArchitectureImperativeApiDoc } from '@/doc/charts/getting-started/architecture/imperative-api-doc';
import { ArchitectureAnimationDoc } from '@/doc/charts/getting-started/architecture/animation-doc';
import { ArchitectureMultiChartSyncDoc } from '@/doc/charts/getting-started/architecture/multi-chart-sync-doc';
import { ArchitectureFeatureSurfaceDoc } from '@/doc/charts/getting-started/architecture/feature-surface-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Architecture - Optimus UI"
        header="Architecture"
        description="Understand the chart data model, chart type selection, the compound API, SVG vs Canvas rendering, and the feature surface."
        [docs]="docs"
        [apiDocs]="['ChartSvg', 'ChartCanvas']"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsGettingStartedArchitectureDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: ArchitectureImport2Doc
        },
        {
            id: 'first-chart',
            label: 'First Chart',
            component: ArchitectureFirstChartDoc
        },
        {
            id: 'data-model',
            label: 'Data Model',
            component: ArchitectureDataModelDoc
        },
        {
            id: 'chart-types',
            label: 'Chart Types',
            component: ArchitectureChartTypesDoc
        },
        {
            id: 'compound-api',
            label: 'Compound API',
            component: ArchitectureCompoundApiDoc
        },
        {
            id: 'dual-rendering',
            label: 'Dual rendering',
            component: ArchitectureDualRenderingDoc
        },
        {
            id: 'imperative-api',
            label: 'Imperative API',
            component: ArchitectureImperativeApiDoc
        },
        {
            id: 'animation',
            label: 'Animation',
            component: ArchitectureAnimationDoc
        },
        {
            id: 'multi-chart-sync',
            label: 'Multi-chart sync',
            component: ArchitectureMultiChartSyncDoc
        },
        {
            id: 'feature-surface',
            label: 'Feature Surface',
            component: ArchitectureFeatureSurfaceDoc
        }
    ];
}

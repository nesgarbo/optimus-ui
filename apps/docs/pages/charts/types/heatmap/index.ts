import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { HeatmapImport2Doc } from '@/doc/charts/types/heatmap/import-2-doc';
import { HeatmapBasicDoc } from '@/doc/charts/types/heatmap/basic-doc';
import { HeatmapColorRangeDoc } from '@/doc/charts/types/heatmap/color-range-doc';
import { HeatmapSingleColorDoc } from '@/doc/charts/types/heatmap/single-color-doc';
import { HeatmapCellStylingDoc } from '@/doc/charts/types/heatmap/cell-styling-doc';
import { HeatmapCustomContentDoc } from '@/doc/charts/types/heatmap/custom-content-doc';
import { HeatmapDeclarativeDoc } from '@/doc/charts/types/heatmap/declarative-doc';
import { HeatmapTitleAndCaptionDoc } from '@/doc/charts/types/heatmap/title-and-caption-doc';
import { HeatmapHoverDoc } from '@/doc/charts/types/heatmap/hover-doc';
import { HeatmapTooltipDoc } from '@/doc/charts/types/heatmap/tooltip-doc';
import { HeatmapLegendDoc } from '@/doc/charts/types/heatmap/legend-doc';
import { HeatmapAxesDoc } from '@/doc/charts/types/heatmap/axes-doc';
import { HeatmapDataLabelsDoc } from '@/doc/charts/types/heatmap/data-labels-doc';
import { HeatmapAnnotationDoc } from '@/doc/charts/types/heatmap/annotation-doc';
import { HeatmapAnimationDoc } from '@/doc/charts/types/heatmap/animation-doc';
import { HeatmapExportDoc } from '@/doc/charts/types/heatmap/export-doc';
import { HeatmapResponsiveDoc } from '@/doc/charts/types/heatmap/responsive-doc';
import { HeatmapAccessibilityDoc } from '@/doc/charts/types/heatmap/accessibility-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Heatmap - Optimus UI"
        header="Heatmap"
        description="Color-coded grid showing value intensity across two categorical dimensions."
        [docs]="docs"
        [apiDocs]="['ChartHeatmap']"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesHeatmapDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: HeatmapImport2Doc
        },
        {
            id: 'basic',
            label: 'Basic',
            component: HeatmapBasicDoc
        },
        {
            id: 'color-range',
            label: 'Color Range',
            component: HeatmapColorRangeDoc
        },
        {
            id: 'single-color',
            label: 'Single Color',
            component: HeatmapSingleColorDoc
        },
        {
            id: 'cell-styling',
            label: 'Cell Styling',
            component: HeatmapCellStylingDoc
        },
        {
            id: 'custom-content',
            label: 'Custom Content',
            component: HeatmapCustomContentDoc
        },
        {
            id: 'declarative',
            label: 'Declarative',
            component: HeatmapDeclarativeDoc
        },
        {
            id: 'title-and-caption',
            label: 'Title & Caption',
            component: HeatmapTitleAndCaptionDoc
        },
        {
            id: 'hover',
            label: 'Hover',
            component: HeatmapHoverDoc
        },
        {
            id: 'tooltip',
            label: 'Tooltip',
            component: HeatmapTooltipDoc
        },
        {
            id: 'legend',
            label: 'Legend',
            component: HeatmapLegendDoc
        },
        {
            id: 'axes',
            label: 'Axes',
            component: HeatmapAxesDoc
        },
        {
            id: 'data-labels',
            label: 'Data Labels',
            component: HeatmapDataLabelsDoc
        },
        {
            id: 'annotation',
            label: 'Annotation',
            component: HeatmapAnnotationDoc
        },
        {
            id: 'animation',
            label: 'Animation',
            component: HeatmapAnimationDoc
        },
        {
            id: 'export',
            label: 'Export',
            component: HeatmapExportDoc
        },
        {
            id: 'responsive',
            label: 'Responsive',
            component: HeatmapResponsiveDoc
        },
        {
            id: 'accessibility',
            label: 'Accessibility',
            component: HeatmapAccessibilityDoc
        }
    ];
}

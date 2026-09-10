import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { ScatterBubbleImport2Doc } from '@/doc/charts/types/scatter-bubble/import-2-doc';
import { ScatterBubbleBasicDoc } from '@/doc/charts/types/scatter-bubble/basic-doc';
import { ScatterBubbleBubbleDoc } from '@/doc/charts/types/scatter-bubble/bubble-doc';
import { ScatterBubbleColorsDoc } from '@/doc/charts/types/scatter-bubble/colors-doc';
import { ScatterBubbleGradientColorDoc } from '@/doc/charts/types/scatter-bubble/gradient-color-doc';
import { ScatterBubbleMarkersDoc } from '@/doc/charts/types/scatter-bubble/markers-doc';
import { ScatterBubbleCustomMarkersDoc } from '@/doc/charts/types/scatter-bubble/custom-markers-doc';
import { ScatterBubbleBorderDoc } from '@/doc/charts/types/scatter-bubble/border-doc';
import { ScatterBubbleDeclarativeDoc } from '@/doc/charts/types/scatter-bubble/declarative-doc';
import { ScatterBubbleTitleAndCaptionDoc } from '@/doc/charts/types/scatter-bubble/title-and-caption-doc';
import { ScatterBubbleHoverDoc } from '@/doc/charts/types/scatter-bubble/hover-doc';
import { ScatterBubbleTooltipDoc } from '@/doc/charts/types/scatter-bubble/tooltip-doc';
import { ScatterBubbleLegendDoc } from '@/doc/charts/types/scatter-bubble/legend-doc';
import { ScatterBubbleAxesDoc } from '@/doc/charts/types/scatter-bubble/axes-doc';
import { ScatterBubbleDataLabelsDoc } from '@/doc/charts/types/scatter-bubble/data-labels-doc';
import { ScatterBubbleZoomAndNavigatorDoc } from '@/doc/charts/types/scatter-bubble/zoom-and-navigator-doc';
import { ScatterBubbleAnnotationDoc } from '@/doc/charts/types/scatter-bubble/annotation-doc';
import { ScatterBubbleReferenceLinesAndBandsDoc } from '@/doc/charts/types/scatter-bubble/reference-lines-and-bands-doc';
import { ScatterBubbleDecimationDoc } from '@/doc/charts/types/scatter-bubble/decimation-doc';
import { ScatterBubbleAnimationDoc } from '@/doc/charts/types/scatter-bubble/animation-doc';
import { ScatterBubbleExportDoc } from '@/doc/charts/types/scatter-bubble/export-doc';
import { ScatterBubbleResponsiveDoc } from '@/doc/charts/types/scatter-bubble/responsive-doc';
import { ScatterBubbleAccessibilityDoc } from '@/doc/charts/types/scatter-bubble/accessibility-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Scatter & Bubble - Optimus UI"
        header="Scatter & Bubble"
        description="Point-based charts for correlations, clusters, and distributions. Scatter plots with optional bubble sizing."
        [docs]="docs"
        [apiDocs]="['ChartScatter']"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesScatterBubbleDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: ScatterBubbleImport2Doc
        },
        {
            id: 'basic',
            label: 'Basic',
            component: ScatterBubbleBasicDoc
        },
        {
            id: 'bubble',
            label: 'Bubble',
            component: ScatterBubbleBubbleDoc
        },
        {
            id: 'colors',
            label: 'Colors',
            component: ScatterBubbleColorsDoc
        },
        {
            id: 'gradient-color',
            label: 'Gradient Color',
            component: ScatterBubbleGradientColorDoc
        },
        {
            id: 'markers',
            label: 'Markers',
            component: ScatterBubbleMarkersDoc
        },
        {
            id: 'custom-markers',
            label: 'Custom Markers',
            component: ScatterBubbleCustomMarkersDoc
        },
        {
            id: 'border',
            label: 'Border',
            component: ScatterBubbleBorderDoc
        },
        {
            id: 'declarative',
            label: 'Declarative',
            component: ScatterBubbleDeclarativeDoc
        },
        {
            id: 'title-and-caption',
            label: 'Title & Caption',
            component: ScatterBubbleTitleAndCaptionDoc
        },
        {
            id: 'hover',
            label: 'Hover',
            component: ScatterBubbleHoverDoc
        },
        {
            id: 'tooltip',
            label: 'Tooltip',
            component: ScatterBubbleTooltipDoc
        },
        {
            id: 'legend',
            label: 'Legend',
            component: ScatterBubbleLegendDoc
        },
        {
            id: 'axes',
            label: 'Axes',
            component: ScatterBubbleAxesDoc
        },
        {
            id: 'data-labels',
            label: 'Data Labels',
            component: ScatterBubbleDataLabelsDoc
        },
        {
            id: 'zoom-and-navigator',
            label: 'Zoom & Navigator',
            component: ScatterBubbleZoomAndNavigatorDoc
        },
        {
            id: 'annotation',
            label: 'Annotation',
            component: ScatterBubbleAnnotationDoc
        },
        {
            id: 'reference-lines-and-bands',
            label: 'Reference Lines & Bands',
            component: ScatterBubbleReferenceLinesAndBandsDoc
        },
        {
            id: 'decimation',
            label: 'Decimation',
            component: ScatterBubbleDecimationDoc
        },
        {
            id: 'animation',
            label: 'Animation',
            component: ScatterBubbleAnimationDoc
        },
        {
            id: 'export',
            label: 'Export',
            component: ScatterBubbleExportDoc
        },
        {
            id: 'responsive',
            label: 'Responsive',
            component: ScatterBubbleResponsiveDoc
        },
        {
            id: 'accessibility',
            label: 'Accessibility',
            component: ScatterBubbleAccessibilityDoc
        }
    ];
}

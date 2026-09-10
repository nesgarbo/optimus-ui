import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { LineAreaImport2Doc } from '@/doc/charts/types/line-area/import-2-doc';
import { LineAreaBasicDoc } from '@/doc/charts/types/line-area/basic-doc';
import { LineAreaAreaDoc } from '@/doc/charts/types/line-area/area-doc';
import { LineAreaColorsDoc } from '@/doc/charts/types/line-area/colors-doc';
import { LineAreaGradientColorDoc } from '@/doc/charts/types/line-area/gradient-color-doc';
import { LineAreaCurveTypesDoc } from '@/doc/charts/types/line-area/curve-types-doc';
import { LineAreaNullHandlingDoc } from '@/doc/charts/types/line-area/null-handling-doc';
import { LineAreaSegmentStylingDoc } from '@/doc/charts/types/line-area/segment-styling-doc';
import { LineAreaMarkersDoc } from '@/doc/charts/types/line-area/markers-doc';
import { LineAreaCustomMarkersDoc } from '@/doc/charts/types/line-area/custom-markers-doc';
import { LineAreaLineStylingDoc } from '@/doc/charts/types/line-area/line-styling-doc';
import { LineAreaLineBorderDoc } from '@/doc/charts/types/line-area/line-border-doc';
import { LineAreaStackedAreaDoc } from '@/doc/charts/types/line-area/stacked-area-doc';
import { LineAreaRangeAreaDoc } from '@/doc/charts/types/line-area/range-area-doc';
import { LineAreaDeclarativeDoc } from '@/doc/charts/types/line-area/declarative-doc';
import { LineAreaTitleAndCaptionDoc } from '@/doc/charts/types/line-area/title-and-caption-doc';
import { LineAreaHoverDoc } from '@/doc/charts/types/line-area/hover-doc';
import { LineAreaTooltipDoc } from '@/doc/charts/types/line-area/tooltip-doc';
import { LineAreaLegendDoc } from '@/doc/charts/types/line-area/legend-doc';
import { LineAreaAxesDoc } from '@/doc/charts/types/line-area/axes-doc';
import { LineAreaDataLabelsDoc } from '@/doc/charts/types/line-area/data-labels-doc';
import { LineAreaZoomAndNavigatorDoc } from '@/doc/charts/types/line-area/zoom-and-navigator-doc';
import { LineAreaAnnotationDoc } from '@/doc/charts/types/line-area/annotation-doc';
import { LineAreaReferenceLinesAndBandsDoc } from '@/doc/charts/types/line-area/reference-lines-and-bands-doc';
import { LineAreaAnimationDoc } from '@/doc/charts/types/line-area/animation-doc';
import { LineAreaExportDoc } from '@/doc/charts/types/line-area/export-doc';
import { LineAreaResponsiveDoc } from '@/doc/charts/types/line-area/responsive-doc';
import { LineAreaAccessibilityDoc } from '@/doc/charts/types/line-area/accessibility-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Line & Area - Optimus UI"
        header="Line & Area"
        description="Line charts for trends and comparisons. Supports area fills, stacking, range bands, and segment-level styling."
        [docs]="docs"
        [apiDocs]="['ChartLine']"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesLineAreaDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: LineAreaImport2Doc
        },
        {
            id: 'basic',
            label: 'Basic',
            component: LineAreaBasicDoc
        },
        {
            id: 'area',
            label: 'Area',
            component: LineAreaAreaDoc
        },
        {
            id: 'colors',
            label: 'Colors',
            component: LineAreaColorsDoc
        },
        {
            id: 'gradient-color',
            label: 'Gradient Color',
            component: LineAreaGradientColorDoc
        },
        {
            id: 'curve-types',
            label: 'Curve Types',
            component: LineAreaCurveTypesDoc
        },
        {
            id: 'null-handling',
            label: 'Null Handling',
            component: LineAreaNullHandlingDoc
        },
        {
            id: 'segment-styling',
            label: 'Segment Styling',
            component: LineAreaSegmentStylingDoc
        },
        {
            id: 'markers',
            label: 'Markers',
            component: LineAreaMarkersDoc
        },
        {
            id: 'custom-markers',
            label: 'Custom Markers',
            component: LineAreaCustomMarkersDoc
        },
        {
            id: 'line-styling',
            label: 'Line Styling',
            component: LineAreaLineStylingDoc
        },
        {
            id: 'line-border',
            label: 'Line Border',
            component: LineAreaLineBorderDoc
        },
        {
            id: 'stacked-area',
            label: 'Stacked Area',
            component: LineAreaStackedAreaDoc
        },
        {
            id: 'range-area',
            label: 'Range Area',
            component: LineAreaRangeAreaDoc
        },
        {
            id: 'declarative',
            label: 'Declarative',
            component: LineAreaDeclarativeDoc
        },
        {
            id: 'title-and-caption',
            label: 'Title & Caption',
            component: LineAreaTitleAndCaptionDoc
        },
        {
            id: 'hover',
            label: 'Hover',
            component: LineAreaHoverDoc
        },
        {
            id: 'tooltip',
            label: 'Tooltip',
            component: LineAreaTooltipDoc
        },
        {
            id: 'legend',
            label: 'Legend',
            component: LineAreaLegendDoc
        },
        {
            id: 'axes',
            label: 'Axes',
            component: LineAreaAxesDoc
        },
        {
            id: 'data-labels',
            label: 'Data Labels',
            component: LineAreaDataLabelsDoc
        },
        {
            id: 'zoom-and-navigator',
            label: 'Zoom & Navigator',
            component: LineAreaZoomAndNavigatorDoc
        },
        {
            id: 'annotation',
            label: 'Annotation',
            component: LineAreaAnnotationDoc
        },
        {
            id: 'reference-lines-and-bands',
            label: 'Reference Lines & Bands',
            component: LineAreaReferenceLinesAndBandsDoc
        },
        {
            id: 'animation',
            label: 'Animation',
            component: LineAreaAnimationDoc
        },
        {
            id: 'export',
            label: 'Export',
            component: LineAreaExportDoc
        },
        {
            id: 'responsive',
            label: 'Responsive',
            component: LineAreaResponsiveDoc
        },
        {
            id: 'accessibility',
            label: 'Accessibility',
            component: LineAreaAccessibilityDoc
        }
    ];
}

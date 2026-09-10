import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { RadarImport2Doc } from '@/doc/charts/types/radar/import-2-doc';
import { RadarBasicDoc } from '@/doc/charts/types/radar/basic-doc';
import { RadarMultiSeriesDoc } from '@/doc/charts/types/radar/multi-series-doc';
import { RadarColorsDoc } from '@/doc/charts/types/radar/colors-doc';
import { RadarGradientColorDoc } from '@/doc/charts/types/radar/gradient-color-doc';
import { RadarFillOpacityDoc } from '@/doc/charts/types/radar/fill-opacity-doc';
import { RadarCurveDoc } from '@/doc/charts/types/radar/curve-doc';
import { RadarMarkersDoc } from '@/doc/charts/types/radar/markers-doc';
import { RadarCustomMarkersDoc } from '@/doc/charts/types/radar/custom-markers-doc';
import { RadarLineStylingDoc } from '@/doc/charts/types/radar/line-styling-doc';
import { RadarGridShapeDoc } from '@/doc/charts/types/radar/grid-shape-doc';
import { RadarGridStylingDoc } from '@/doc/charts/types/radar/grid-styling-doc';
import { RadarStackedDoc } from '@/doc/charts/types/radar/stacked-doc';
import { RadarDeclarativeDoc } from '@/doc/charts/types/radar/declarative-doc';
import { RadarTitleAndCaptionDoc } from '@/doc/charts/types/radar/title-and-caption-doc';
import { RadarHoverDoc } from '@/doc/charts/types/radar/hover-doc';
import { RadarTooltipDoc } from '@/doc/charts/types/radar/tooltip-doc';
import { RadarLegendDoc } from '@/doc/charts/types/radar/legend-doc';
import { RadarAxesDoc } from '@/doc/charts/types/radar/axes-doc';
import { RadarAnnotationDoc } from '@/doc/charts/types/radar/annotation-doc';
import { RadarReferenceBandsAndLinesDoc } from '@/doc/charts/types/radar/reference-bands-and-lines-doc';
import { RadarAnimationDoc } from '@/doc/charts/types/radar/animation-doc';
import { RadarExportDoc } from '@/doc/charts/types/radar/export-doc';
import { RadarResponsiveDoc } from '@/doc/charts/types/radar/responsive-doc';
import { RadarAccessibilityDoc } from '@/doc/charts/types/radar/accessibility-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Radar - Optimus UI"
        header="Radar"
        description="Multivariate data on radial axes. Each series renders a polygon across shared spoke labels, suitable for comparing profiles and performance across dimensions."
        [docs]="docs"
        [apiDocs]="['ChartRadar']"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesRadarDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: RadarImport2Doc
        },
        {
            id: 'basic',
            label: 'Basic',
            component: RadarBasicDoc
        },
        {
            id: 'multi-series',
            label: 'Multi-Series',
            component: RadarMultiSeriesDoc
        },
        {
            id: 'colors',
            label: 'Colors',
            component: RadarColorsDoc
        },
        {
            id: 'gradient-color',
            label: 'Gradient Color',
            component: RadarGradientColorDoc
        },
        {
            id: 'fill-opacity',
            label: 'Fill Opacity',
            component: RadarFillOpacityDoc
        },
        {
            id: 'curve',
            label: 'Curve',
            component: RadarCurveDoc
        },
        {
            id: 'markers',
            label: 'Markers',
            component: RadarMarkersDoc
        },
        {
            id: 'custom-markers',
            label: 'Custom Markers',
            component: RadarCustomMarkersDoc
        },
        {
            id: 'line-styling',
            label: 'Line Styling',
            component: RadarLineStylingDoc
        },
        {
            id: 'grid-shape',
            label: 'Grid Shape',
            component: RadarGridShapeDoc
        },
        {
            id: 'grid-styling',
            label: 'Grid Styling',
            component: RadarGridStylingDoc
        },
        {
            id: 'stacked',
            label: 'Stacked',
            component: RadarStackedDoc
        },
        {
            id: 'declarative',
            label: 'Declarative',
            component: RadarDeclarativeDoc
        },
        {
            id: 'title-and-caption',
            label: 'Title & Caption',
            component: RadarTitleAndCaptionDoc
        },
        {
            id: 'hover',
            label: 'Hover',
            component: RadarHoverDoc
        },
        {
            id: 'tooltip',
            label: 'Tooltip',
            component: RadarTooltipDoc
        },
        {
            id: 'legend',
            label: 'Legend',
            component: RadarLegendDoc
        },
        {
            id: 'axes',
            label: 'Axes',
            component: RadarAxesDoc
        },
        {
            id: 'annotation',
            label: 'Annotation',
            component: RadarAnnotationDoc
        },
        {
            id: 'reference-bands-and-lines',
            label: 'Reference Bands & Lines',
            component: RadarReferenceBandsAndLinesDoc
        },
        {
            id: 'animation',
            label: 'Animation',
            component: RadarAnimationDoc
        },
        {
            id: 'export',
            label: 'Export',
            component: RadarExportDoc
        },
        {
            id: 'responsive',
            label: 'Responsive',
            component: RadarResponsiveDoc
        },
        {
            id: 'accessibility',
            label: 'Accessibility',
            component: RadarAccessibilityDoc
        }
    ];
}

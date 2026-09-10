import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { ColumnBarImport2Doc } from '@/doc/charts/types/column-bar/import-2-doc';
import { ColumnBarBasicDoc } from '@/doc/charts/types/column-bar/basic-doc';
import { ColumnBarColorsDoc } from '@/doc/charts/types/column-bar/colors-doc';
import { ColumnBarGradientColorDoc } from '@/doc/charts/types/column-bar/gradient-color-doc';
import { ColumnBarGroupedDoc } from '@/doc/charts/types/column-bar/grouped-doc';
import { ColumnBarHorizontalDoc } from '@/doc/charts/types/column-bar/horizontal-doc';
import { ColumnBarSortedDoc } from '@/doc/charts/types/column-bar/sorted-doc';
import { ColumnBarNegativeValuesDoc } from '@/doc/charts/types/column-bar/negative-values-doc';
import { ColumnBarNullValuesDoc } from '@/doc/charts/types/column-bar/null-values-doc';
import { ColumnBarFloatingRangeDoc } from '@/doc/charts/types/column-bar/floating-range-doc';
import { ColumnBarVariwideDoc } from '@/doc/charts/types/column-bar/variwide-doc';
import { ColumnBarCustomShapeDoc } from '@/doc/charts/types/column-bar/custom-shape-doc';
import { ColumnBarBorderDoc } from '@/doc/charts/types/column-bar/border-doc';
import { ColumnBarBarSizingDoc } from '@/doc/charts/types/column-bar/bar-sizing-doc';
import { ColumnBarStackedDoc } from '@/doc/charts/types/column-bar/stacked-doc';
import { ColumnBarPercentStackedDoc } from '@/doc/charts/types/column-bar/percent-stacked-doc';
import { ColumnBarWaterfallDoc } from '@/doc/charts/types/column-bar/waterfall-doc';
import { ColumnBarOverlapDoc } from '@/doc/charts/types/column-bar/overlap-doc';
import { ColumnBarDeclarativeDoc } from '@/doc/charts/types/column-bar/declarative-doc';
import { ColumnBarTitleAndCaptionDoc } from '@/doc/charts/types/column-bar/title-and-caption-doc';
import { ColumnBarHoverDoc } from '@/doc/charts/types/column-bar/hover-doc';
import { ColumnBarTooltipDoc } from '@/doc/charts/types/column-bar/tooltip-doc';
import { ColumnBarLegendDoc } from '@/doc/charts/types/column-bar/legend-doc';
import { ColumnBarAxesDoc } from '@/doc/charts/types/column-bar/axes-doc';
import { ColumnBarDataLabelsDoc } from '@/doc/charts/types/column-bar/data-labels-doc';
import { ColumnBarZoomAndNavigatorDoc } from '@/doc/charts/types/column-bar/zoom-and-navigator-doc';
import { ColumnBarAnnotationDoc } from '@/doc/charts/types/column-bar/annotation-doc';
import { ColumnBarReferenceLinesAndBandsDoc } from '@/doc/charts/types/column-bar/reference-lines-and-bands-doc';
import { ColumnBarAnimationDoc } from '@/doc/charts/types/column-bar/animation-doc';
import { ColumnBarExportDoc } from '@/doc/charts/types/column-bar/export-doc';
import { ColumnBarResponsiveDoc } from '@/doc/charts/types/column-bar/responsive-doc';
import { ColumnBarAccessibilityDoc } from '@/doc/charts/types/column-bar/accessibility-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Column & Bar - Optimus UI"
        header="Column & Bar"
        description="Vertical columns, horizontal bars, grouped, stacked, waterfall, and custom-shaped bar charts."
        [docs]="docs"
        [apiDocs]="['ChartBar']"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesColumnBarDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: ColumnBarImport2Doc
        },
        {
            id: 'basic',
            label: 'Basic',
            component: ColumnBarBasicDoc
        },
        {
            id: 'colors',
            label: 'Colors',
            component: ColumnBarColorsDoc
        },
        {
            id: 'gradient-color',
            label: 'Gradient Color',
            component: ColumnBarGradientColorDoc
        },
        {
            id: 'grouped',
            label: 'Grouped',
            component: ColumnBarGroupedDoc
        },
        {
            id: 'horizontal',
            label: 'Horizontal',
            component: ColumnBarHorizontalDoc
        },
        {
            id: 'sorted',
            label: 'Sorted',
            component: ColumnBarSortedDoc
        },
        {
            id: 'negative-values',
            label: 'Negative Values',
            component: ColumnBarNegativeValuesDoc
        },
        {
            id: 'null-values',
            label: 'Null Values',
            component: ColumnBarNullValuesDoc
        },
        {
            id: 'floating-range',
            label: 'Floating / Range',
            component: ColumnBarFloatingRangeDoc
        },
        {
            id: 'variwide',
            label: 'Variwide',
            component: ColumnBarVariwideDoc
        },
        {
            id: 'custom-shape',
            label: 'Custom Shape',
            component: ColumnBarCustomShapeDoc
        },
        {
            id: 'border',
            label: 'Border',
            component: ColumnBarBorderDoc
        },
        {
            id: 'bar-sizing',
            label: 'Bar Sizing',
            component: ColumnBarBarSizingDoc
        },
        {
            id: 'stacked',
            label: 'Stacked',
            component: ColumnBarStackedDoc
        },
        {
            id: 'percent-stacked',
            label: 'Percent Stacked',
            component: ColumnBarPercentStackedDoc
        },
        {
            id: 'waterfall',
            label: 'Waterfall',
            component: ColumnBarWaterfallDoc
        },
        {
            id: 'overlap',
            label: 'Overlap',
            component: ColumnBarOverlapDoc
        },
        {
            id: 'declarative',
            label: 'Declarative',
            component: ColumnBarDeclarativeDoc
        },
        {
            id: 'title-and-caption',
            label: 'Title & Caption',
            component: ColumnBarTitleAndCaptionDoc
        },
        {
            id: 'hover',
            label: 'Hover',
            component: ColumnBarHoverDoc
        },
        {
            id: 'tooltip',
            label: 'Tooltip',
            component: ColumnBarTooltipDoc
        },
        {
            id: 'legend',
            label: 'Legend',
            component: ColumnBarLegendDoc
        },
        {
            id: 'axes',
            label: 'Axes',
            component: ColumnBarAxesDoc
        },
        {
            id: 'data-labels',
            label: 'Data Labels',
            component: ColumnBarDataLabelsDoc
        },
        {
            id: 'zoom-and-navigator',
            label: 'Zoom & Navigator',
            component: ColumnBarZoomAndNavigatorDoc
        },
        {
            id: 'annotation',
            label: 'Annotation',
            component: ColumnBarAnnotationDoc
        },
        {
            id: 'reference-lines-and-bands',
            label: 'Reference Lines & Bands',
            component: ColumnBarReferenceLinesAndBandsDoc
        },
        {
            id: 'animation',
            label: 'Animation',
            component: ColumnBarAnimationDoc
        },
        {
            id: 'export',
            label: 'Export',
            component: ColumnBarExportDoc
        },
        {
            id: 'responsive',
            label: 'Responsive',
            component: ColumnBarResponsiveDoc
        },
        {
            id: 'accessibility',
            label: 'Accessibility',
            component: ColumnBarAccessibilityDoc
        }
    ];
}

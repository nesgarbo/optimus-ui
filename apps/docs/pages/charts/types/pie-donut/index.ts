import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { PieDonutImport2Doc } from '@/doc/charts/types/pie-donut/import-2-doc';
import { PieDonutBasicDoc } from '@/doc/charts/types/pie-donut/basic-doc';
import { PieDonutDonutDoc } from '@/doc/charts/types/pie-donut/donut-doc';
import { PieDonutGaugeDoc } from '@/doc/charts/types/pie-donut/gauge-doc';
import { PieDonutColorsDoc } from '@/doc/charts/types/pie-donut/colors-doc';
import { PieDonutGradientColorDoc } from '@/doc/charts/types/pie-donut/gradient-color-doc';
import { PieDonutSortedDoc } from '@/doc/charts/types/pie-donut/sorted-doc';
import { PieDonutOuterRadiusDoc } from '@/doc/charts/types/pie-donut/outer-radius-doc';
import { PieDonutVariableRadiusDoc } from '@/doc/charts/types/pie-donut/variable-radius-doc';
import { PieDonutBorderDoc } from '@/doc/charts/types/pie-donut/border-doc';
import { PieDonutCustomSliceContentDoc } from '@/doc/charts/types/pie-donut/custom-slice-content-doc';
import { PieDonutStackedDoc } from '@/doc/charts/types/pie-donut/stacked-doc';
import { PieDonutDeclarativeDoc } from '@/doc/charts/types/pie-donut/declarative-doc';
import { PieDonutTitleAndCaptionDoc } from '@/doc/charts/types/pie-donut/title-and-caption-doc';
import { PieDonutHoverDoc } from '@/doc/charts/types/pie-donut/hover-doc';
import { PieDonutTooltipDoc } from '@/doc/charts/types/pie-donut/tooltip-doc';
import { PieDonutLegendDoc } from '@/doc/charts/types/pie-donut/legend-doc';
import { PieDonutDataLabelsDoc } from '@/doc/charts/types/pie-donut/data-labels-doc';
import { PieDonutAnnotationDoc } from '@/doc/charts/types/pie-donut/annotation-doc';
import { PieDonutAnimationDoc } from '@/doc/charts/types/pie-donut/animation-doc';
import { PieDonutExportDoc } from '@/doc/charts/types/pie-donut/export-doc';
import { PieDonutResponsiveDoc } from '@/doc/charts/types/pie-donut/responsive-doc';
import { PieDonutAccessibilityDoc } from '@/doc/charts/types/pie-donut/accessibility-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Pie & Donut - Optimus UI"
        header="Pie & Donut"
        description="Circular charts for part-to-whole relationships. Pie, donut, and gauge variants."
        [docs]="docs"
        [apiDocs]="['ChartPie']"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesPieDonutDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: PieDonutImport2Doc
        },
        {
            id: 'basic',
            label: 'Basic',
            component: PieDonutBasicDoc
        },
        {
            id: 'donut',
            label: 'Donut',
            component: PieDonutDonutDoc
        },
        {
            id: 'gauge',
            label: 'Gauge',
            component: PieDonutGaugeDoc
        },
        {
            id: 'colors',
            label: 'Colors',
            component: PieDonutColorsDoc
        },
        {
            id: 'gradient-color',
            label: 'Gradient Color',
            component: PieDonutGradientColorDoc
        },
        {
            id: 'sorted',
            label: 'Sorted',
            component: PieDonutSortedDoc
        },
        {
            id: 'outer-radius',
            label: 'Outer Radius',
            component: PieDonutOuterRadiusDoc
        },
        {
            id: 'variable-radius',
            label: 'Variable Radius',
            component: PieDonutVariableRadiusDoc
        },
        {
            id: 'border',
            label: 'Border',
            component: PieDonutBorderDoc
        },
        {
            id: 'custom-slice-content',
            label: 'Custom Slice Content',
            component: PieDonutCustomSliceContentDoc
        },
        {
            id: 'stacked',
            label: 'Stacked',
            component: PieDonutStackedDoc
        },
        {
            id: 'declarative',
            label: 'Declarative',
            component: PieDonutDeclarativeDoc
        },
        {
            id: 'title-and-caption',
            label: 'Title & Caption',
            component: PieDonutTitleAndCaptionDoc
        },
        {
            id: 'hover',
            label: 'Hover',
            component: PieDonutHoverDoc
        },
        {
            id: 'tooltip',
            label: 'Tooltip',
            component: PieDonutTooltipDoc
        },
        {
            id: 'legend',
            label: 'Legend',
            component: PieDonutLegendDoc
        },
        {
            id: 'data-labels',
            label: 'Data Labels',
            component: PieDonutDataLabelsDoc
        },
        {
            id: 'annotation',
            label: 'Annotation',
            component: PieDonutAnnotationDoc
        },
        {
            id: 'animation',
            label: 'Animation',
            component: PieDonutAnimationDoc
        },
        {
            id: 'export',
            label: 'Export',
            component: PieDonutExportDoc
        },
        {
            id: 'responsive',
            label: 'Responsive',
            component: PieDonutResponsiveDoc
        },
        {
            id: 'accessibility',
            label: 'Accessibility',
            component: PieDonutAccessibilityDoc
        }
    ];
}

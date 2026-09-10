import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { PolarImport2Doc } from '@/doc/charts/types/polar/import-2-doc';
import { PolarBasicDoc } from '@/doc/charts/types/polar/basic-doc';
import { PolarInnerRadiusDoc } from '@/doc/charts/types/polar/inner-radius-doc';
import { PolarColorsDoc } from '@/doc/charts/types/polar/colors-doc';
import { PolarGradientColorDoc } from '@/doc/charts/types/polar/gradient-color-doc';
import { PolarSortedDoc } from '@/doc/charts/types/polar/sorted-doc';
import { PolarBorderDoc } from '@/doc/charts/types/polar/border-doc';
import { PolarGridShapeDoc } from '@/doc/charts/types/polar/grid-shape-doc';
import { PolarGridStylingDoc } from '@/doc/charts/types/polar/grid-styling-doc';
import { PolarGroupedDoc } from '@/doc/charts/types/polar/grouped-doc';
import { PolarStackedDoc } from '@/doc/charts/types/polar/stacked-doc';
import { PolarPercentStackedDoc } from '@/doc/charts/types/polar/percent-stacked-doc';
import { PolarDeclarativeDoc } from '@/doc/charts/types/polar/declarative-doc';
import { PolarTitleAndCaptionDoc } from '@/doc/charts/types/polar/title-and-caption-doc';
import { PolarHoverDoc } from '@/doc/charts/types/polar/hover-doc';
import { PolarTooltipDoc } from '@/doc/charts/types/polar/tooltip-doc';
import { PolarLegendDoc } from '@/doc/charts/types/polar/legend-doc';
import { PolarAnnotationDoc } from '@/doc/charts/types/polar/annotation-doc';
import { PolarAnimationDoc } from '@/doc/charts/types/polar/animation-doc';
import { PolarExportDoc } from '@/doc/charts/types/polar/export-doc';
import { PolarResponsiveDoc } from '@/doc/charts/types/polar/responsive-doc';
import { PolarAccessibilityDoc } from '@/doc/charts/types/polar/accessibility-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Polar - Optimus UI"
        header="Polar"
        description="Nightingale and rose charts with radial bars proportional to value, arranged around a circular axis."
        [docs]="docs"
        [apiDocs]="['ChartPolar']"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesPolarDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: PolarImport2Doc
        },
        {
            id: 'basic',
            label: 'Basic',
            component: PolarBasicDoc
        },
        {
            id: 'inner-radius',
            label: 'Inner Radius',
            component: PolarInnerRadiusDoc
        },
        {
            id: 'colors',
            label: 'Colors',
            component: PolarColorsDoc
        },
        {
            id: 'gradient-color',
            label: 'Gradient Color',
            component: PolarGradientColorDoc
        },
        {
            id: 'sorted',
            label: 'Sorted',
            component: PolarSortedDoc
        },
        {
            id: 'border',
            label: 'Border',
            component: PolarBorderDoc
        },
        {
            id: 'grid-shape',
            label: 'Grid Shape',
            component: PolarGridShapeDoc
        },
        {
            id: 'grid-styling',
            label: 'Grid Styling',
            component: PolarGridStylingDoc
        },
        {
            id: 'grouped',
            label: 'Grouped',
            component: PolarGroupedDoc
        },
        {
            id: 'stacked',
            label: 'Stacked',
            component: PolarStackedDoc
        },
        {
            id: 'percent-stacked',
            label: 'Percent Stacked',
            component: PolarPercentStackedDoc
        },
        {
            id: 'declarative',
            label: 'Declarative',
            component: PolarDeclarativeDoc
        },
        {
            id: 'title-and-caption',
            label: 'Title & Caption',
            component: PolarTitleAndCaptionDoc
        },
        {
            id: 'hover',
            label: 'Hover',
            component: PolarHoverDoc
        },
        {
            id: 'tooltip',
            label: 'Tooltip',
            component: PolarTooltipDoc
        },
        {
            id: 'legend',
            label: 'Legend',
            component: PolarLegendDoc
        },
        {
            id: 'annotation',
            label: 'Annotation',
            component: PolarAnnotationDoc
        },
        {
            id: 'animation',
            label: 'Animation',
            component: PolarAnimationDoc
        },
        {
            id: 'export',
            label: 'Export',
            component: PolarExportDoc
        },
        {
            id: 'responsive',
            label: 'Responsive',
            component: PolarResponsiveDoc
        },
        {
            id: 'accessibility',
            label: 'Accessibility',
            component: PolarAccessibilityDoc
        }
    ];
}

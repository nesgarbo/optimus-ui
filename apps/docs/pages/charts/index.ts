import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { AreaDoc } from '@/doc/charts/area-doc';
import { ArchitectureDoc } from '@/doc/charts/architecture-doc';
import { AxesDoc } from '@/doc/charts/axes-doc';
import { BarDoc } from '@/doc/charts/bar-doc';
import { BasicDoc } from '@/doc/charts/basic-doc';
import { CanvasDoc } from '@/doc/charts/canvas-doc';
import { CurveDoc } from '@/doc/charts/curve-doc';
import { GradientDoc } from '@/doc/charts/gradient-doc';
import { GroupedDoc } from '@/doc/charts/grouped-doc';
import { HorizontalDoc } from '@/doc/charts/horizontal-doc';
import { ImportDoc } from '@/doc/charts/import-doc';
import { LegendDoc } from '@/doc/charts/legend-doc';
import { LocaleDoc } from '@/doc/charts/locale-doc';
import { MarkersDoc } from '@/doc/charts/markers-doc';
import { NullsDoc } from '@/doc/charts/nulls-doc';
import { RangeDoc } from '@/doc/charts/range-doc';
import { RtlDoc } from '@/doc/charts/rtl-doc';
import { StackedDoc } from '@/doc/charts/stacked-doc';
import { ThemingDoc } from '@/doc/charts/theming-doc';
import { TooltipDoc } from '@/doc/charts/tooltip-doc';
import { WaterfallDoc } from '@/doc/charts/waterfall-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Component - Optimus UI"
        header="Charts"
        description="Charts is a unified chart system: SVG and Canvas rendering from the same compound API, with axes, legends, tooltips, animation and fully replaceable surfaces."
        [docs]="docs"
        [apiDocs]="['ChartSvg', 'ChartCanvas']"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsDemo {
    docs = [
        {
            id: 'import',
            label: 'Import',
            component: ImportDoc
        },
        {
            id: 'basic',
            label: 'Basic',
            component: BasicDoc
        },
        {
            id: 'architecture',
            label: 'Architecture',
            component: ArchitectureDoc
        },
        {
            id: 'area',
            label: 'Area',
            component: AreaDoc
        },
        {
            id: 'gradient',
            label: 'Gradient Color',
            component: GradientDoc
        },
        {
            id: 'curve',
            label: 'Curve Types',
            component: CurveDoc
        },
        {
            id: 'markers',
            label: 'Markers',
            component: MarkersDoc
        },
        {
            id: 'nulls',
            label: 'Null Handling',
            component: NullsDoc
        },
        {
            id: 'range',
            label: 'Range Area',
            component: RangeDoc
        },
        {
            id: 'bar',
            label: 'Bar',
            component: BarDoc
        },
        {
            id: 'grouped',
            label: 'Grouped Bar',
            component: GroupedDoc
        },
        {
            id: 'stacked',
            label: 'Stacked Bar',
            component: StackedDoc
        },
        {
            id: 'horizontal',
            label: 'Horizontal Bar',
            component: HorizontalDoc
        },
        {
            id: 'waterfall',
            label: 'Waterfall',
            component: WaterfallDoc
        },
        {
            id: 'axes',
            label: 'Axes',
            component: AxesDoc
        },
        {
            id: 'legend',
            label: 'Legend',
            component: LegendDoc
        },
        {
            id: 'tooltip',
            label: 'Tooltip',
            component: TooltipDoc
        },
        {
            id: 'canvas',
            label: 'SVG & Canvas',
            component: CanvasDoc
        },
        {
            id: 'theming',
            label: 'Theming',
            component: ThemingDoc
        },
        {
            id: 'locale',
            label: 'Locale',
            component: LocaleDoc
        },
        {
            id: 'rtl',
            label: 'RTL',
            component: RtlDoc
        }
    ];
}

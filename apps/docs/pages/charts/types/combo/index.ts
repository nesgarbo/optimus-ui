import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { ComboImport2Doc } from '@/doc/charts/types/combo/import-2-doc';
import { ComboBarAndLineDoc } from '@/doc/charts/types/combo/bar-and-line-doc';
import { ComboDualAxisDoc } from '@/doc/charts/types/combo/dual-axis-doc';
import { ComboBarAndAreaDoc } from '@/doc/charts/types/combo/bar-and-area-doc';
import { ComboStackedBarAndLineDoc } from '@/doc/charts/types/combo/stacked-bar-and-line-doc';
import { ComboLineAndScatterDoc } from '@/doc/charts/types/combo/line-and-scatter-doc';
import { ComboLineAndScatterOnACategoryAxisDoc } from '@/doc/charts/types/combo/line-and-scatter-on-a-category-axis-doc';
import { ComboPolarAndRadarDoc } from '@/doc/charts/types/combo/polar-and-radar-doc';
import { ComboSharedTooltipDoc } from '@/doc/charts/types/combo/shared-tooltip-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Combo - Optimus UI"
        header="Combo"
        description="Combine chart types on a shared category axis. Supports bar, line, area, scatter, polar, and radar in any combination."
        [docs]="docs"
        [apiDocs]="['ChartSvg']"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesComboDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: ComboImport2Doc
        },
        {
            id: 'bar-and-line',
            label: 'Bar & Line',
            component: ComboBarAndLineDoc
        },
        {
            id: 'dual-axis',
            label: 'Dual Axis',
            component: ComboDualAxisDoc
        },
        {
            id: 'bar-and-area',
            label: 'Bar & Area',
            component: ComboBarAndAreaDoc
        },
        {
            id: 'stacked-bar-and-line',
            label: 'Stacked Bar & Line',
            component: ComboStackedBarAndLineDoc
        },
        {
            id: 'line-and-scatter',
            label: 'Line & Scatter',
            component: ComboLineAndScatterDoc
        },
        {
            id: 'line-and-scatter-on-a-category-axis',
            label: 'Line & Scatter on a Category Axis',
            component: ComboLineAndScatterOnACategoryAxisDoc
        },
        {
            id: 'polar-and-radar',
            label: 'Polar & Radar',
            component: ComboPolarAndRadarDoc
        },
        {
            id: 'shared-tooltip',
            label: 'Shared Tooltip',
            component: ComboSharedTooltipDoc
        }
    ];
}

import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { LegendImport2Doc } from '@/doc/charts/configuration/legend/import-2-doc';
import { LegendBasicDoc } from '@/doc/charts/configuration/legend/basic-doc';
import { LegendPositionDoc } from '@/doc/charts/configuration/legend/position-doc';
import { LegendAlignmentDoc } from '@/doc/charts/configuration/legend/alignment-doc';
import { LegendLayoutDoc } from '@/doc/charts/configuration/legend/layout-doc';
import { LegendOverflowDoc } from '@/doc/charts/configuration/legend/overflow-doc';
import { LegendIconShapeDoc } from '@/doc/charts/configuration/legend/icon-shape-doc';
import { LegendStylingDoc } from '@/doc/charts/configuration/legend/styling-doc';
import { LegendInteractiveDoc } from '@/doc/charts/configuration/legend/interactive-doc';
import { LegendSharedModeDoc } from '@/doc/charts/configuration/legend/shared-mode-doc';
import { LegendCustomLegendDoc } from '@/doc/charts/configuration/legend/custom-legend-doc';
import { LegendColorLegendDoc } from '@/doc/charts/configuration/legend/color-legend-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Legend - Optimus UI"
        header="Legend"
        description="Display an interactive legend with control over position, alignment, layout, icon shape, overflow, and custom rendering."
        [docs]="docs"
        [apiDocs]="['ChartLegend', 'ChartColorLegend']"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsConfigurationLegendDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: LegendImport2Doc
        },
        {
            id: 'basic',
            label: 'Basic',
            component: LegendBasicDoc
        },
        {
            id: 'position',
            label: 'Position',
            component: LegendPositionDoc
        },
        {
            id: 'alignment',
            label: 'Alignment',
            component: LegendAlignmentDoc
        },
        {
            id: 'layout',
            label: 'Layout',
            component: LegendLayoutDoc
        },
        {
            id: 'overflow',
            label: 'Overflow',
            component: LegendOverflowDoc
        },
        {
            id: 'icon-shape',
            label: 'Icon Shape',
            component: LegendIconShapeDoc
        },
        {
            id: 'styling',
            label: 'Styling',
            component: LegendStylingDoc
        },
        {
            id: 'interactive',
            label: 'Interactive',
            component: LegendInteractiveDoc
        },
        {
            id: 'shared-mode',
            label: 'Shared Mode',
            component: LegendSharedModeDoc
        },
        {
            id: 'custom-legend',
            label: 'Custom Legend',
            component: LegendCustomLegendDoc
        },
        {
            id: 'color-legend',
            label: 'Color Legend',
            component: LegendColorLegendDoc
        }
    ];
}

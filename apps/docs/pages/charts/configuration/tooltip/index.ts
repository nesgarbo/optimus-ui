import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { TooltipImport2Doc } from '@/doc/charts/configuration/tooltip/import-2-doc';
import { TooltipBasicDoc } from '@/doc/charts/configuration/tooltip/basic-doc';
import { TooltipSharedModeDoc } from '@/doc/charts/configuration/tooltip/shared-mode-doc';
import { TooltipSnapStrategyDoc } from '@/doc/charts/configuration/tooltip/snap-strategy-doc';
import { TooltipCrosshairDoc } from '@/doc/charts/configuration/tooltip/crosshair-doc';
import { TooltipPositionDoc } from '@/doc/charts/configuration/tooltip/position-doc';
import { TooltipCustomTooltipDoc } from '@/doc/charts/configuration/tooltip/custom-tooltip-doc';
import { TooltipOhlcLayoutDoc } from '@/doc/charts/configuration/tooltip/ohlc-layout-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Tooltip - Optimus UI"
        header="Tooltip"
        description="Show data details on hover with mode, snap strategy, crosshair, custom content, OHLC layout, position control, and delays."
        [docs]="docs"
        [apiDocs]="['ChartTooltip']"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsConfigurationTooltipDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: TooltipImport2Doc
        },
        {
            id: 'basic',
            label: 'Basic',
            component: TooltipBasicDoc
        },
        {
            id: 'shared-mode',
            label: 'Shared Mode',
            component: TooltipSharedModeDoc
        },
        {
            id: 'snap-strategy',
            label: 'Snap Strategy',
            component: TooltipSnapStrategyDoc
        },
        {
            id: 'crosshair',
            label: 'Crosshair',
            component: TooltipCrosshairDoc
        },
        {
            id: 'position',
            label: 'Position',
            component: TooltipPositionDoc
        },
        {
            id: 'custom-tooltip',
            label: 'Custom Tooltip',
            component: TooltipCustomTooltipDoc
        },
        {
            id: 'ohlc-layout',
            label: 'OHLC Layout',
            component: TooltipOhlcLayoutDoc
        }
    ];
}

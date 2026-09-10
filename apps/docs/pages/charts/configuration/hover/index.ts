import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { HoverImport2Doc } from '@/doc/charts/configuration/hover/import-2-doc';
import { HoverBasicDoc } from '@/doc/charts/configuration/hover/basic-doc';
import { HoverBrightnessAndDimDoc } from '@/doc/charts/configuration/hover/brightness-and-dim-doc';
import { HoverPieOffsetDoc } from '@/doc/charts/configuration/hover/pie-offset-doc';
import { HoverBorderOverrideDoc } from '@/doc/charts/configuration/hover/border-override-doc';
import { HoverScaleDoc } from '@/doc/charts/configuration/hover/scale-doc';
import { HoverColorOverrideDoc } from '@/doc/charts/configuration/hover/color-override-doc';
import { HoverClickDoc } from '@/doc/charts/configuration/hover/click-doc';
import { HoverLineMarkerScalingDoc } from '@/doc/charts/configuration/hover/line-marker-scaling-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Hover - Optimus UI"
        header="Hover"
        description="Apply visual feedback on hover with brightness, optional opacity dimming, color overrides, border styling, pie slice pop-out, and line marker scaling."
        [docs]="docs"
        [apiDocs]="['ChartHover']"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsConfigurationHoverDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: HoverImport2Doc
        },
        {
            id: 'basic',
            label: 'Basic',
            component: HoverBasicDoc
        },
        {
            id: 'brightness-and-dim',
            label: 'Brightness & Dim',
            component: HoverBrightnessAndDimDoc
        },
        {
            id: 'pie-offset',
            label: 'Pie Offset',
            component: HoverPieOffsetDoc
        },
        {
            id: 'border-override',
            label: 'Border Override',
            component: HoverBorderOverrideDoc
        },
        {
            id: 'scale',
            label: 'Scale',
            component: HoverScaleDoc
        },
        {
            id: 'color-override',
            label: 'Color Override',
            component: HoverColorOverrideDoc
        },
        {
            id: 'click',
            label: 'Click',
            component: HoverClickDoc
        },
        {
            id: 'line-marker-scaling',
            label: 'Line Marker Scaling',
            component: HoverLineMarkerScalingDoc
        }
    ];
}

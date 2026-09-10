import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { ThemingImport2Doc } from '@/doc/charts/reference/theming/import-2-doc';
import { ThemingOverviewDoc } from '@/doc/charts/reference/theming/overview-doc';
import { ThemingDefaultPaletteDoc } from '@/doc/charts/reference/theming/default-palette-doc';
import { ThemingSvgDoc } from '@/doc/charts/reference/theming/svg-doc';
import { ThemingCanvasDoc } from '@/doc/charts/reference/theming/canvas-doc';

@Component({
    template: `<app-doc docTitle="Angular Charts Theming - Optimus UI" header="Theming" description="Style charts with CSS custom properties for SVG, or a plain JS theme object for Canvas." [docs]="docs" themeDocs="charts"></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsReferenceThemingDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: ThemingImport2Doc
        },
        {
            id: 'overview',
            label: 'Overview',
            component: ThemingOverviewDoc
        },
        {
            id: 'default-palette',
            label: 'Default Palette',
            component: ThemingDefaultPaletteDoc
        },
        {
            id: 'svg',
            label: 'SVG',
            component: ThemingSvgDoc
        },
        {
            id: 'canvas',
            label: 'Canvas',
            component: ThemingCanvasDoc
        }
    ];
}

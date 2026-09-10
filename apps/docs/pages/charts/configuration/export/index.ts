import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { ExportImport2Doc } from '@/doc/charts/configuration/export/import-2-doc';
import { ExportBasicDoc } from '@/doc/charts/configuration/export/basic-doc';
import { ExportMenuItemsDoc } from '@/doc/charts/configuration/export/menu-items-doc';
import { ExportFilenameDoc } from '@/doc/charts/configuration/export/filename-doc';
import { ExportScaleDoc } from '@/doc/charts/configuration/export/scale-doc';
import { ExportBackgroundColorDoc } from '@/doc/charts/configuration/export/background-color-doc';
import { ExportButtonPositionDoc } from '@/doc/charts/configuration/export/button-position-doc';
import { ExportExportNotesDoc } from '@/doc/charts/configuration/export/export-notes-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Export - Optimus UI"
        header="Export"
        description="Add a built-in export menu to download charts as PNG, JPEG, SVG, PDF, or CSV, with control over filename, scale, background, and menu items."
        [docs]="docs"
        [apiDocs]="['ChartExportMenu']"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsConfigurationExportDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: ExportImport2Doc
        },
        {
            id: 'basic',
            label: 'Basic',
            component: ExportBasicDoc
        },
        {
            id: 'menu-items',
            label: 'Menu Items',
            component: ExportMenuItemsDoc
        },
        {
            id: 'filename',
            label: 'Filename',
            component: ExportFilenameDoc
        },
        {
            id: 'scale',
            label: 'Scale',
            component: ExportScaleDoc
        },
        {
            id: 'background-color',
            label: 'Background Color',
            component: ExportBackgroundColorDoc
        },
        {
            id: 'button-position',
            label: 'Button Position',
            component: ExportButtonPositionDoc
        },
        {
            id: 'export-notes',
            label: 'Export Notes',
            component: ExportExportNotesDoc
        }
    ];
}

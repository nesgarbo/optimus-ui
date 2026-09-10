import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { ApiImport2Doc } from '@/doc/charts/reference/api/import-2-doc';

@Component({
    template: `<app-doc docTitle="Angular Charts API - Optimus UI" header="API" description="Generated reference for Chart inputs, events, methods, templates, types, and style classes." [docs]="docs" themeDocs="charts"></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsReferenceApiDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: ApiImport2Doc
        }
    ];
}

import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { ApiDoc } from '@/doc/spreadsheet/api-doc';
import { BasicDoc } from '@/doc/spreadsheet/basic-doc';
import { FormsDoc } from '@/doc/spreadsheet/forms-doc';
import { ImportDoc } from '@/doc/spreadsheet/import-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Spreadsheet Component - Optimus UI"
        header="Spreadsheet"
        description="Spreadsheet is a full spreadsheet with formulas, formats and sheets, on top of Univer, that binds to signals and forms."
        [docs]="docs"
        [apiDocs]="['Spreadsheet']"
        themeDocs="spreadsheet"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class SpreadsheetDemo {
    docs = [
        { id: 'import', label: 'Import', component: ImportDoc },
        { id: 'basic', label: 'Basic', component: BasicDoc },
        { id: 'api', label: 'Cells and CSV', component: ApiDoc },
        { id: 'forms', label: 'Forms', component: FormsDoc }
    ];
}

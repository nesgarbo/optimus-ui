import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { BasicDoc } from '@/doc/pdfeditor/basic-doc';
import { FormDoc } from '@/doc/pdfeditor/form-doc';
import { ImportDoc } from '@/doc/pdfeditor/import-doc';
import { PagesDoc } from '@/doc/pdfeditor/pages-doc';
import { SignatureDoc } from '@/doc/pdfeditor/signature-doc';

@Component({
    template: `<app-doc
        docTitle="Angular PDF Editor Component - Optimus UI"
        header="PdfEditor"
        description="PdfEditor annotates PDF documents, fills in their forms, signs them and rearranges their pages, with pdf.js and pdf-lib."
        [docs]="docs"
        [apiDocs]="['PdfEditor']"
        themeDocs="pdfeditor"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class PdfEditorDemo {
    docs = [
        { id: 'import', label: 'Import', component: ImportDoc },
        { id: 'basic', label: 'Annotations', component: BasicDoc },
        { id: 'form', label: 'Form', component: FormDoc },
        { id: 'signature', label: 'Signature', component: SignatureDoc },
        { id: 'pages', label: 'Pages and Save', component: PagesDoc }
    ];
}

import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { BasicDoc } from '@/doc/signature/basic-doc';
import { FormsDoc } from '@/doc/signature/forms-doc';
import { ImportDoc } from '@/doc/signature/import-doc';
import { StyleDoc } from '@/doc/signature/style-doc';
import { TypedDoc } from '@/doc/signature/typed-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Signature Component - Optimus UI"
        header="Signature"
        description="Signature captures a handwritten signature from a mouse, a pen or a finger, with undo, redo, and export to PNG, JPEG or SVG."
        [docs]="docs"
        [apiDocs]="['Signature']"
        themeDocs="signature"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class SignatureDemo {
    docs = [
        { id: 'import', label: 'Import', component: ImportDoc },
        { id: 'basic', label: 'Basic', component: BasicDoc },
        { id: 'style', label: 'Pen and Background', component: StyleDoc },
        { id: 'typed', label: 'Typed and Loaded', component: TypedDoc },
        { id: 'forms', label: 'Forms', component: FormsDoc }
    ];
}

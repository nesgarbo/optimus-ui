import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { BasicDoc } from '@/doc/blockeditor/basic-doc';
import { FormsDoc } from '@/doc/blockeditor/forms-doc';
import { ImportDoc } from '@/doc/blockeditor/import-doc';
import { PicturesDoc } from '@/doc/blockeditor/pictures-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Block Editor Component - Optimus UI"
        header="BlockEditor"
        description="BlockEditor is a block-based editor on top of Tiptap: headings, lists, to-dos, quotes, code and pictures from a slash menu."
        [docs]="docs"
        [apiDocs]="['BlockEditor']"
        themeDocs="blockeditor"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class BlockEditorDemo {
    docs = [
        { id: 'import', label: 'Import', component: ImportDoc },
        { id: 'basic', label: 'Basic', component: BasicDoc },
        { id: 'pictures', label: 'Pictures and Menu', component: PicturesDoc },
        { id: 'forms', label: 'Forms', component: FormsDoc }
    ];
}

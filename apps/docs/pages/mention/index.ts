import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { BasicDoc } from '@/doc/mention/basic-doc';
import { EditableDoc } from '@/doc/mention/editable-doc';
import { FieldsDoc } from '@/doc/mention/fields-doc';
import { LabelsDoc } from '@/doc/mention/labels-doc';
import { ImportDoc } from '@/doc/mention/import-doc';
import { RemoteDoc } from '@/doc/mention/remote-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Mention Component - Optimus UI"
        header="Mention"
        description="Mention opens a list when the user types a trigger character into a textarea, an input or a contenteditable element, and writes the pick back."
        [docs]="docs"
        [apiDocs]="['Mention']"
        themeDocs="mention"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class MentionDemo {
    docs = [
        { id: 'import', label: 'Import', component: ImportDoc },
        { id: 'basic', label: 'Basic', component: BasicDoc },
        { id: 'fields', label: 'Fields, Groups and Templates', component: FieldsDoc },
        { id: 'editable', label: 'Contenteditable', component: EditableDoc },
        { id: 'remote', label: 'Remote Data', component: RemoteDoc },
        { id: 'labels', label: 'Labels', component: LabelsDoc }
    ];
}

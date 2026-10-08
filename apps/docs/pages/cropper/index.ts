import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { BasicDoc } from '@/doc/cropper/basic-doc';
import { FormsDoc } from '@/doc/cropper/forms-doc';
import { ImportDoc } from '@/doc/cropper/import-doc';
import { ShapeDoc } from '@/doc/cropper/shape-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Cropper Component - Optimus UI"
        header="Cropper"
        description="Cropper crops, rotates, flips and zooms an image, on top of Cropper.js, and returns the crop as a data URL or a blob."
        [docs]="docs"
        [apiDocs]="['Cropper']"
        themeDocs="cropper"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class CropperDemo {
    docs = [
        { id: 'import', label: 'Import', component: ImportDoc },
        { id: 'basic', label: 'Basic', component: BasicDoc },
        { id: 'shape', label: 'Shape and Output', component: ShapeDoc },
        { id: 'forms', label: 'Forms', component: FormsDoc }
    ];
}

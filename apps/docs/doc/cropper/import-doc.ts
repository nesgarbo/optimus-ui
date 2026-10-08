import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>The component is standalone. It uses <a href="https://github.com/fengyuanchen/cropperjs" target="_blank" rel="noopener">Cropper.js</a> 2, an optional peer dependency that is loaded when the first cropper is shown.</p>
        </app-docsectiontext>
        <app-code [code]="code" [hideToggleCode]="true"></app-code>
    `
})
export class ImportDoc {
    code = {
        typescript: `npm install cropperjs

import { Cropper } from '@openng/optimus-ui/cropper';`
    };
}

import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>The component is standalone. It is built on <a href="https://tiptap.dev" target="_blank" rel="noopener">Tiptap</a>, whose packages are optional peer dependencies, loaded when the first editor is shown.</p>
        </app-docsectiontext>
        <app-code [code]="code" [hideToggleCode]="true"></app-code>
    `
})
export class ImportDoc {
    code = {
        typescript: `npm install @tiptap/core @tiptap/pm @tiptap/starter-kit @tiptap/extension-list @tiptap/extension-image @tiptap/extensions @tiptap/suggestion

import { BlockEditor } from '@openng/optimus-ui/blockeditor';`
    };
}

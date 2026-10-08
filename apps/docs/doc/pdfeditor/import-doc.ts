import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                The component is standalone. It draws pages with <a href="https://mozilla.github.io/pdf.js/" target="_blank" rel="noopener">pdf.js</a> and changes the document with
                <a href="https://pdf-lib.js.org/" target="_blank" rel="noopener">pdf-lib</a>. Both are optional peer dependencies, loaded when the first editor is shown. The original file is never changed: <i>save</i> makes a new one. Text is written
                in the standard PDF fonts, which have the characters of Latin-1; for Cyrillic, Greek, Asian scripts and the like, give <i>unicodeFont</i> a TrueType or OpenType file (this needs <i>@pdf-lib/fontkit</i>), and that text is written, and
                measured on the screen, with it.
            </p>
        </app-docsectiontext>
        <app-code [code]="code" [hideToggleCode]="true"></app-code>
    `
})
export class ImportDoc {
    code = {
        typescript: `npm install pdfjs-dist pdf-lib

import { PdfEditor } from '@openng/optimus-ui/pdfeditor';`
    };
}

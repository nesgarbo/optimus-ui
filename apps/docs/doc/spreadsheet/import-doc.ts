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
                The component is standalone and uses <a href="https://univer.ai" target="_blank" rel="noopener">Univer</a>, whose packages are optional peer dependencies, loaded when the first spreadsheet is shown. Univer draws its interface with
                React, so React comes with it. Its stylesheet has to be part of the application.
            </p>
        </app-docsectiontext>
        <app-code [code]="code" [hideToggleCode]="true"></app-code>
    `
})
export class ImportDoc {
    code = {
        typescript: `npm install @univerjs/presets @univerjs/preset-sheets-core react react-dom

import { Spreadsheet, rowsToWorkbook } from '@openng/optimus-ui/spreadsheet';`,
        basic: `// angular.json, in the options of the build
"styles": ["node_modules/@univerjs/preset-sheets-core/lib/index.css"]`
    };
}

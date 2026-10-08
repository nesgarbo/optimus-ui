import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>The component, and the engine functions behind it, come from one entry point.</p>
        </app-docsectiontext>
        <app-code [code]="code" [hideToggleCode]="true"></app-code>
    `
})
export class ImportDoc {
    code = {
        typescript: `import { QueryBuilder } from '@openng/optimus-ui/querybuilder';
import type { QueryBuilderColumn, RuleModel } from '@openng/optimus-ui/types/querybuilder';`
    };
}

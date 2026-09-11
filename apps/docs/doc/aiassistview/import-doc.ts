import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>The module brings the root, every supplied part and every template definition in one import.</p>
        </app-docsectiontext>
        <app-code [code]="code" [hideToggleCode]="true"></app-code>
        <app-docsectiontext>
            <p>A surface that composes the parts itself can import them individually instead, which is what keeps an assistant that never shows a reasoning panel from shipping one.</p>
        </app-docsectiontext>
        <app-code [code]="granular" [hideToggleCode]="true"></app-code>
    `
})
export class ImportDoc {
    code = {
        typescript: `import { AIAssistViewModule } from '@openng/optimus-ui/aiassistview';`
    };

    granular = {
        typescript: `import { AIAssistView } from '@openng/optimus-ui/aiassistview';
import { AssistPromptDef, AssistResponseDef, AssistToolDef } from '@openng/optimus-ui/aiassistview';
import type { AssistPrompt, AssistResponseBlock } from '@openng/optimus-ui/types/aiassistview';`
    };
}

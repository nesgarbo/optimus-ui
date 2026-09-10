import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'getting-started-llms-import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>Use the paths on the current Angular showcase host.</p>
            <p>
                <i>/llms.txt</i> is the compact documentation map. <i>/llms-full.txt</i> contains the full documentation bundle. <i>/raw/docs/&lt;path&gt;.md</i> returns one page as clean markdown, which is useful when a tool should focus on a single
                chart topic.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LlmsImportDoc {}

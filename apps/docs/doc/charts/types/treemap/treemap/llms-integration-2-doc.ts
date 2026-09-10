import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'types-treemap-treemap-llms-integration-2-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>PrimeUI documentation is available in machine-readable formats optimized for Large Language Models. These endpoints allow AI assistants like ChatGPT, Claude, and others to read and understand PrimeUI documentation.</p>
            <p>### Endpoints</p>
            <div class="doc-tablewrapper">
                <table class="doc-table">
                    <thead>
                        <tr>
                            <th>Endpoint</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>&lt;a href="/llms.txt" target="_blank"&gt;/llms.txt&lt;/a&gt;</td>
                            <td>Site content map with links to individual pages in markdown format.</td>
                        </tr>
                        <tr>
                            <td>&lt;a href="/llms-full.txt" target="_blank"&gt;/llms-full.txt&lt;/a&gt;</td>
                            <td>Complete documentation content in a single file.</td>
                        </tr>
                        <tr>
                            <td><i>/raw/docs/&lt;path&gt;.md</i></td>
                            <td>Individual page as raw markdown.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p>### Raw Markdown Endpoint</p>
            <p>The <i>/raw</i> endpoint serves any documentation page as clean markdown with <i>text/markdown; charset=utf-8</i> content type. Use the same path as the page URL with a <i>.md</i> extension.</p>
            <p><strong>Examples:</strong></p>
            <p>&lt;!-- prettier-ignore-start --&gt;</p>
            <p>&lt;!-- prettier-ignore-end --&gt;</p>
            <p>If a document is missing a top-level heading or description, the endpoint automatically prepends the title and description from the frontmatter.</p>
            <p>### Usage</p>
            <p>Point any LLM or AI tool to the <i>/llms.txt</i> endpoint to give it access to the full PrimeUI documentation:</p>
            <p>This allows AI assistants to provide accurate, up-to-date answers about PrimeUI components, APIs, and usage patterns.</p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreemapLlmsIntegration2Doc {}

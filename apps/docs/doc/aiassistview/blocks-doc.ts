import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { AIAssistViewModule } from '@openng/optimus-ui/aiassistview';
import type { AssistPrompt } from '@openng/optimus-ui/types/aiassistview';

@Component({
    selector: 'blocks-doc',
    standalone: true,
    imports: [AppDocSectionText, AIAssistViewModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                An answer may arrive as a string or as blocks. A string is rendered as markdown and fenced samples are lifted into code blocks automatically, so the two paths render through the identical components — a plain-text back end gets copy
                buttons and language labels for free.
            </p>
            <p>The kinds are <i>text</i>, <i>code</i>, <i>thinking</i>, <i>tool</i> and <i>error</i>. Set <i>[renderMarkdown]="false"</i> to take the prose verbatim.</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 34rem">
                <p-aiassistview [(prompts)]="prompts" heading="Blocks" [showFooter]="false" />
            </div>
        </div>
        <app-code></app-code>
    `
})
export class BlocksDoc {
    readonly prompts = signal<AssistPrompt[]>([
        {
            id: 'turn-1',
            prompt: 'Show me every block kind.',
            status: 'complete',
            blocks: [
                { blockType: 'text', id: 'intro', content: 'Here is one of each. Prose first, with **emphasis**, a [link](https://openng.org) and `inline code`.' },
                {
                    blockType: 'thinking',
                    id: 'thinking',
                    title: 'Thought process',
                    collapsible: true,
                    collapsed: true,
                    durationMs: 3400,
                    stages: [
                        { id: 'one', status: 'completed', content: 'Listed the block kinds', editableContext: [{ type: 'file', name: 'aiassistview.types.ts', badge: 'success' }] },
                        { id: 'two', status: 'failed', content: 'Tried an undocumented kind', editableContext: [{ type: 'result', name: 'unknown', badge: 'failed' }] }
                    ]
                },
                { blockType: 'code', id: 'sample', language: 'ts', fileName: 'answer.ts', content: "assist.addPromptResponse([\n    { blockType: 'text', content: 'Done.' }\n]);" },
                { blockType: 'tool', id: 'tool', toolName: 'weather', title: 'weather', status: 'completed', props: { city: 'Valencia' }, result: { tempC: 24, sky: 'clear' } },
                { blockType: 'error', id: 'error', content: 'The provider timed out after 30 seconds.', retryable: true }
            ],
            citations: [
                { id: 'c1', index: 1, title: 'Response blocks', url: 'https://openng.org', snippet: 'The grammar a structured answer is built from.' },
                { id: 'c2', index: 2, title: 'Markdown subset', url: 'https://openng.org' }
            ],
            usage: { model: 'fixture', totalTokens: 412, durationMs: 1830 }
        }
    ]);
}

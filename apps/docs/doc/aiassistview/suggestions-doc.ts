import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { AIAssistView, AIAssistViewModule } from '@openng/optimus-ui/aiassistview';
import { OpenngIcons } from '@openng/optimus-ui/api';
import type { AssistPrompt, AssistPromptRequestPayload, AssistSuggestion } from '@openng/optimus-ui/types/aiassistview';
import { answerFor } from './demo-assistant';

@Component({
    selector: 'suggestions-doc',
    standalone: true,
    imports: [AppDocSectionText, AIAssistViewModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                <i>promptSuggestions</i> takes bare strings, or objects when a chip needs an icon, a description or a payload that differs from its label. <i>suggestionsMode</i> decides when they show: <i>empty</i> — the default — only before the
                first turn, <i>always</i> for follow-ups, <i>never</i> to draw them yourself.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 30rem">
                <p-aiassistview #assist [(prompts)]="prompts" heading="Suggestions" [promptSuggestions]="suggestions" promptSuggestionsHeader="Try one of these" suggestionsMode="always" (promptRequest)="onPrompt($event)" />
            </div>
        </div>
        <app-code></app-code>
    `
})
export class SuggestionsDoc {
    readonly assist = viewChild.required<AIAssistView>('assist');

    readonly prompts = signal<AssistPrompt[]>([]);

    readonly suggestions: AssistSuggestion[] = [
        { id: 'signals', text: 'Explain Angular signals', description: 'Writable, computed and effects', iconCss: OpenngIcons.BOLT },
        { id: 'data', text: 'Which component for tabular data?', iconCss: OpenngIcons.TABLE },
        { id: 'a11y', text: 'How do I test accessibility?', iconCss: OpenngIcons.EYE }
    ];

    onPrompt(event: AssistPromptRequestPayload): void {
        setTimeout(() => this.assist().addPromptResponse(answerFor(event.prompt)), 400);
    }
}

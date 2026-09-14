import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { AIAssistView, AIAssistViewModule } from '@openng/optimus-ui/aiassistview';
import type { AssistPrompt, AssistPromptRequestPayload } from '@openng/optimus-ui/types/aiassistview';
import { answerFor } from './demo-assistant';

@Component({
    selector: 'events-doc',
    standalone: true,
    imports: [AppDocSectionText, AIAssistViewModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                Every output carries the turn and its position, so one handler can serve the whole surface. Four are cancellable — <i>promptRequest</i>, <i>promptEdit</i>, <i>suggestionClick</i> and <i>clearRequest</i> — and cancelling one leaves the
                transcript and the editor exactly as they were.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 26rem">
                <p-aiassistview
                    #assist
                    [(prompts)]="prompts"
                    heading="Events"
                    [promptSuggestions]="suggestions"
                    (promptRequest)="log('promptRequest', $event.prompt); onPrompt($event)"
                    (promptChanged)="log('promptChanged', $event.value)"
                    (feedbackChange)="log('feedbackChange', $event.feedback)"
                    (toolbarItemClick)="log('toolbarItemClick', $event.toolbar + ':' + $event.item.id)"
                    (responseNavigate)="log('responseNavigate', $event.responseIndex)"
                    (suggestionClick)="log('suggestionClick', $event.suggestion.text)"
                    (promptEdit)="log('promptEdit', $event.prompt)"
                    (clearRequest)="log('clearRequest', $event.turns.length)"
                    (viewChange)="log('viewChange', $event.index)"
                />
            </div>
            <ul class="mt-4 text-sm font-mono max-h-40 overflow-auto">
                @for (entry of events(); track $index) {
                    <li>{{ entry }}</li>
                }
            </ul>
        </div>
        <app-code></app-code>
    `
})
export class EventsDoc {
    readonly assist = viewChild.required<AIAssistView>('assist');

    readonly prompts = signal<AssistPrompt[]>([]);

    readonly events = signal<string[]>([]);

    readonly suggestions = ['Explain Angular signals'];

    log(name: string, detail: unknown): void {
        this.events.update((entries) => [`${name} · ${String(detail)}`, ...entries].slice(0, 40));
    }

    onPrompt(event: AssistPromptRequestPayload): void {
        setTimeout(() => this.assist().addPromptResponse(answerFor(event.prompt)), 400);
    }
}

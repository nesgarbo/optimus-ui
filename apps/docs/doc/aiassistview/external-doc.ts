import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { AIAssistViewModule } from '@openng/optimus-ui/aiassistview';
import type { AssistClearPayload, AssistFeedbackPayload, AssistPrompt, AssistPromptRequestPayload } from '@openng/optimus-ui/types/aiassistview';
import { answerFor } from './demo-assistant';

@Component({
    selector: 'external-doc',
    standalone: true,
    imports: [AppDocSectionText, AIAssistViewModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                Turn <i>managed</i> off and the component stops writing to the transcript entirely: it renders <i>prompts</i> and emits its outputs as <b>requests</b>. Nothing appears until the store puts it there, which is what a signal store, an
                NgRx feature or a server-owned conversation needs.
            </p>
            <p>Every cancellable payload still works, so a store can refuse a send, an edit or a clear without the surface having already acted on it.</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 30rem">
                <p-aiassistview [prompts]="store()" [managed]="false" heading="Store-owned" (promptRequest)="onPrompt($event)" (feedbackChange)="onFeedback($event)" (clearRequest)="onClear($event)" />
            </div>
            <p class="mt-3 text-sm opacity-70">Turns in the store: {{ store().length }}</p>
        </div>
        <app-code></app-code>
    `
})
export class ExternalDoc {
    /** Stands in for a signal store. Every write goes through here and nowhere else. */
    readonly store = signal<AssistPrompt[]>([]);

    onPrompt(event: AssistPromptRequestPayload): void {
        this.store.update((turns) => [...turns, { ...event.turn, status: 'pending' }]);

        setTimeout(() => {
            this.store.update((turns) => turns.map((turn) => (turn.id === event.turn.id ? { ...turn, response: answerFor(event.prompt), status: 'complete' } : turn)));
        }, 600);
    }

    onFeedback(event: AssistFeedbackPayload): void {
        this.store.update((turns) => turns.map((turn, index) => (index === event.index ? { ...turn, isResponseHelpful: event.feedback } : turn)));
    }

    onClear(event: AssistClearPayload): void {
        this.store.set([]);
        event.cancel = true;
    }
}

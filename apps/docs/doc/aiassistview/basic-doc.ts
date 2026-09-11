import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { AIAssistView, AIAssistViewModule } from '@openng/optimus-ui/aiassistview';
import type { AssistPrompt, AssistPromptRequestPayload } from '@openng/optimus-ui/types/aiassistview';
import { answerFor } from './demo-assistant';

@Component({
    selector: 'basic-doc',
    standalone: true,
    imports: [AppDocSectionText, AIAssistViewModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                Bind <i>[(prompts)]</i> for the transcript, answer <i>promptRequest</i> with <i>addPromptResponse</i>, and everything else is drawn: the composer, the bubbles, the copy and feedback strip, the empty state and the live regions a screen
                reader needs.
            </p>
            <p>The component never calls a model. It hands you the prompt and waits, which is the only arrangement that works across every provider.</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 30rem">
                <p-aiassistview #assist [(prompts)]="prompts" heading="Assistant" promptPlaceholder="Ask about signals, tables or accessibility…" (promptRequest)="onPrompt($event)" />
            </div>
        </div>
        <app-code></app-code>
    `
})
export class BasicDoc {
    readonly assist = viewChild.required<AIAssistView>('assist');

    readonly prompts = signal<AssistPrompt[]>([]);

    onPrompt(event: AssistPromptRequestPayload): void {
        // A real handler calls the model here. The delay stands in for the round trip.
        setTimeout(() => this.assist().addPromptResponse(answerFor(event.prompt)), 600);
    }
}

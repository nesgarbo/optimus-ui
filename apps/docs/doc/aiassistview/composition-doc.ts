import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { AIAssistView, AIAssistViewModule } from '@openng/optimus-ui/aiassistview';
import type { AssistPrompt, AssistPromptRequestPayload } from '@openng/optimus-ui/types/aiassistview';
import { answerFor } from './demo-assistant';

@Component({
    selector: 'composition-doc',
    standalone: true,
    imports: [AppDocSectionText, AIAssistViewModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                Under the supplied chrome every part is a component you can place yourself: <i>p-assist-header</i>, <i>p-assist-turn</i> with its <i>p-assist-prompt-message</i> and <i>p-assist-response-message</i> halves, <i>p-assist-blocks</i>,
                <i>p-assist-suggestions</i>, <i>p-assist-toolbar</i> and <i>p-assist-footer</i>.
            </p>
            <p>
                They hold no behaviour of their own. A part reads the shared state and calls the same commands the root does, which is what keeps a replacement honest — it can only do what the root already does, and the accessibility and streaming
                contracts come with it.
            </p>
            <p>Here the transcript is rendered turn by turn with a date separator the stock surface has no opinion about, and the reasoning blocks are drawn on their own above the answer.</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 32rem">
                <p-aiassistview #assist [(prompts)]="prompts" heading="Composed" [showHeader]="true" (promptRequest)="onPrompt($event)">
                    <ng-template pAssistResponseDef let-turn let-index="index" let-blocks="blocks">
                        <div class="text-xs uppercase tracking-wide opacity-50 mb-2">Answer {{ index + 1 }}</div>
                        <p-assist-blocks [blocks]="blocks" [turn]="turn" [index]="index" />
                    </ng-template>
                </p-aiassistview>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class CompositionDoc {
    readonly assist = viewChild.required<AIAssistView>('assist');

    readonly prompts = signal<AssistPrompt[]>([]);

    onPrompt(event: AssistPromptRequestPayload): void {
        setTimeout(() => this.assist().addPromptResponse(answerFor(event.prompt)), 400);
    }
}

import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Button } from '@openng/optimus-ui/button';
import { AIAssistView, AIAssistViewModule } from '@openng/optimus-ui/aiassistview';
import type { AssistPrompt, AssistPromptRequestPayload } from '@openng/optimus-ui/types/aiassistview';
import { answerFor } from './demo-assistant';

@Component({
    selector: 'templates-doc',
    standalone: true,
    imports: [AppDocSectionText, Button, AIAssistViewModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                Every surface has a <i>*Def</i> template behind it, and each one is typed: <i>let-turn</i>, <i>let-index</i> and the rest come through with real types rather than <i>any</i>, so a misspelled field fails the build instead of rendering
                blank.
            </p>
            <p>
                <i>pAssistPromptDef</i> and <i>pAssistResponseDef</i> replace a bubble, <i>pAssistBlockDef</i> one block, <i>pAssistBannerDef</i> the empty state, <i>pAssistSuggestionDef</i> a chip and <i>pAssistFooterDef</i> the whole composer — the
                footer context hands over <i>send</i> and <i>stop</i>, so a replacement keeps the behaviour without reimplementing it.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 32rem">
                <p-aiassistview #assist [(prompts)]="prompts" heading="Templates" [promptSuggestions]="suggestions" (promptRequest)="onPrompt($event)">
                    <ng-template pAssistBannerDef let-send="send">
                        <div class="text-center">
                            <div class="text-xl font-semibold mb-2">Good afternoon</div>
                            <div class="opacity-70 mb-4">What are we building today?</div>
                            <p-button [outlined]="true" severity="secondary" size="small" label="Start with signals" (onClick)="send('Explain Angular signals')" />
                        </div>
                    </ng-template>

                    <ng-template pAssistPromptDef let-turn let-index="index">
                        <div class="p-aiassistview-bubble p-aiassistview-bubble-prompt">
                            <div class="text-xs opacity-60 mb-1">Question {{ index + 1 }}</div>
                            {{ turn.prompt }}
                        </div>
                    </ng-template>
                </p-aiassistview>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class TemplatesDoc {
    readonly assist = viewChild.required<AIAssistView>('assist');

    readonly prompts = signal<AssistPrompt[]>([]);

    readonly suggestions = ['Explain Angular signals', 'How do I test accessibility?'];

    onPrompt(event: AssistPromptRequestPayload): void {
        setTimeout(() => this.assist().addPromptResponse(answerFor(event.prompt)), 400);
    }
}

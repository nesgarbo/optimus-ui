import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, viewChild } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { AIAssistView, AIAssistViewModule } from '@openng/optimus-ui/aiassistview';
import type { AssistContextClickPayload, AssistPrompt, AssistPromptRequestPayload } from '@openng/optimus-ui/types/aiassistview';
import { answerFor, demoStages, runStages } from './demo-assistant';

@Component({
    selector: 'thinking-doc',
    standalone: true,
    imports: [AppDocSectionText, AIAssistViewModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                A response is a list of blocks, and a <i>thinking</i> block is the reasoning timeline. Each stage carries a status, a line of text and any number of context chips — the files it read, the searches it ran, the tools it called — each
                with its own outcome badge.
            </p>
            <p>
                Patch the block in place with <i>updateBlock</i>, matched by its <i>id</i>: the panel counts up while <i>isActive</i> is true, folds away when the reader says so and stays folded through every later patch. Mark a chip
                <i>clickable</i> and it reports through <i>contextClick</i>, which is how an editor integration opens the file the model looked at.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 32rem">
                <p-aiassistview #assist [(prompts)]="prompts" heading="Reasoning" enableStreaming (promptRequest)="onPrompt($event)" (contextClick)="onContextClick($event)" />
            </div>
            @if (lastChip()) {
                <p class="mt-3 text-sm">
                    Opened: <b>{{ lastChip() }}</b>
                </p>
            }
        </div>
        <app-code></app-code>
    `
})
export class ThinkingDoc {
    readonly assist = viewChild.required<AIAssistView>('assist');

    readonly prompts = signal<AssistPrompt[]>([]);

    readonly lastChip = signal<string | null>(null);

    private cancel: (() => void) | null = null;

    constructor() {
        inject(DestroyRef).onDestroy(() => this.cancel?.());
    }

    onPrompt(event: AssistPromptRequestPayload): void {
        const assist = this.assist();

        this.cancel = runStages(
            demoStages(),
            (block) => assist.updateBlock(block),
            () => {
                this.cancel = null;
                assist.updateBlock({ blockType: 'text', id: 'answer', content: answerFor(event.prompt) });
                assist.addPromptResponse(this.prompts().at(-1)?.blocks ?? []);
            }
        );
    }

    onContextClick(event: AssistContextClickPayload): void {
        this.lastChip.set(event.contextItem.name ?? null);
    }
}

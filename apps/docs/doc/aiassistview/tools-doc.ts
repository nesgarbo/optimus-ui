import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { AIAssistView, AIAssistViewModule } from '@openng/optimus-ui/aiassistview';
import type { AssistPrompt, AssistPromptRequestPayload } from '@openng/optimus-ui/types/aiassistview';

@Component({
    selector: 'tools-doc',
    standalone: true,
    imports: [AppDocSectionText, AIAssistViewModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                A <i>tool</i> block is drawn by whichever <i>pAssistToolDef</i> claimed its name. The template is a real Angular template — components inside it behave like components anywhere else, which is the difference between this and a template
                supplied as an HTML string.
            </p>
            <p>A tool with no template registered still renders its name, its status and its result, so a tool you have not styled yet is visible rather than invisible.</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 30rem">
                <p-aiassistview #assist [(prompts)]="prompts" heading="Tools" (promptRequest)="onPrompt($event)">
                    <ng-template pAssistToolDef="weather" let-props="props" let-result="result">
                        <div class="flex items-center gap-4 p-3">
                            <span class="text-3xl">{{ result?.sky === 'clear' ? '☀️' : '☁️' }}</span>
                            <div>
                                <div class="font-semibold">{{ props?.city }}</div>
                                <div class="text-sm opacity-70">{{ result?.tempC }}°C · {{ result?.sky }}</div>
                            </div>
                        </div>
                    </ng-template>
                </p-aiassistview>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class ToolsDoc {
    readonly assist = viewChild.required<AIAssistView>('assist');

    readonly prompts = signal<AssistPrompt[]>([]);

    onPrompt(event: AssistPromptRequestPayload): void {
        const city = /in ([a-zA-Z ]+)/.exec(event.prompt)?.[1]?.trim() || 'Valencia';

        setTimeout(() => {
            this.assist().addPromptResponse([
                { blockType: 'text', content: `Calling the weather tool for **${city}**.` },
                { blockType: 'tool', id: 'weather', toolName: 'weather', status: 'completed', props: { city }, result: { tempC: 24, sky: 'clear' } },
                { blockType: 'text', content: 'Clear skies — a good afternoon to be outside.' }
            ]);
        }, 500);
    }
}

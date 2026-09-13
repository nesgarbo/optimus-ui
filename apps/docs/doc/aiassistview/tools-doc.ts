import { ChangeDetectionStrategy, Component, TemplateRef, signal, viewChild } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { AIAssistView, AIAssistViewModule } from '@openng/optimus-ui/aiassistview';
import { Button } from '@openng/optimus-ui/button';
import type { AssistPrompt, AssistPromptRequestPayload } from '@openng/optimus-ui/types/aiassistview';

@Component({
    selector: 'tools-doc',
    standalone: true,
    imports: [AppDocSectionText, AIAssistViewModule, AppCode, Button],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                A <i>tool</i> block is drawn by whichever template claimed its <i>toolName</i>. This is what a model needs to answer with a component instead of a paragraph: it emits a block naming the tool and the props, and the page decides what
                that renders as.
            </p>
            <p>
                Declare the renderer with <i>pAssistToolDef</i> when the name is known while you are writing the markup. The template is a real Angular template, so components inside it behave like components anywhere else — which is the difference
                between this and a template handed over as an HTML string.
            </p>
            <p>
                Use <i>registerToolUI</i> for the case markup cannot cover: a name that only exists at runtime, read from a manifest or negotiated with the model. Markup wins over the registry, so a page can override a renderer a plugin registered,
                and <i>unregisterToolUI</i> takes it back out.
            </p>
            <p>A tool with no renderer at all still shows its name, its status and its result, so a tool you have not styled yet is visible rather than invisible.</p>
        </app-docsectiontext>
        <div class="card">
            <div class="flex flex-wrap gap-3 mb-4">
                <p-button [outlined]="true" [rounded]="true" severity="secondary" size="small" [label]="registered() ? 'Unregister stock-tool' : 'Register stock-tool'" (onClick)="toggleRegistration()" />
            </div>
            <div style="height: 32rem">
                <p-aiassistview #assist [(prompts)]="prompts" heading="Generative UI" [promptSuggestions]="suggestions" (promptRequest)="onPrompt($event)">
                    <!-- Declared ahead of time: the weather card. -->
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

                <!-- Registered from code, and only while the button above says so. -->
                <ng-template #stock let-props="props" let-result="result">
                    <div class="flex items-center justify-between gap-4 p-3">
                        <div>
                            <div class="font-semibold">{{ props?.symbol }}</div>
                            <div class="text-sm opacity-70">Registered at runtime</div>
                        </div>
                        <div class="text-xl font-semibold" [class.text-red-500]="result?.change < 0">{{ result?.price }} ({{ result?.change }}%)</div>
                    </div>
                </ng-template>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class ToolsDoc {
    readonly assist = viewChild.required<AIAssistView>('assist');

    readonly stock = viewChild.required<TemplateRef<any>>('stock');

    readonly prompts = signal<AssistPrompt[]>([]);

    readonly registered = signal(false);

    readonly suggestions = ['Weather in Valencia', 'Stock price for OPTIMUS'];

    toggleRegistration(): void {
        if (this.registered()) {
            this.assist().unregisterToolUI('stock');
            this.registered.set(false);

            return;
        }

        this.assist().registerToolUI({ toolName: 'stock', template: this.stock() });
        this.registered.set(true);
    }

    onPrompt(event: AssistPromptRequestPayload): void {
        const wantsStock = /stock|price|symbol/i.test(event.prompt);
        const city = /in ([a-zA-Z ]+)/.exec(event.prompt)?.[1]?.trim() || 'Valencia';
        const symbol = /for ([A-Z]+)/.exec(event.prompt)?.[1] ?? 'OPTIMUS';

        setTimeout(() => {
            this.assist().addPromptResponse(
                wantsStock
                    ? [
                          { blockType: 'text', content: `Here is **${symbol}**.` },
                          { blockType: 'tool', id: 'stock', toolName: 'stock', status: 'completed', props: { symbol }, result: { price: '142.30', change: -1.4 } },
                          { blockType: 'text', content: this.registered() ? 'Drawn by the renderer registered from code.' : 'No renderer is registered, so the built-in card is showing. Press the button above.' }
                      ]
                    : [
                          { blockType: 'text', content: `Calling the weather tool for **${city}**.` },
                          { blockType: 'tool', id: 'weather', toolName: 'weather', status: 'completed', props: { city }, result: { tempC: 24, sky: 'clear' } },
                          { blockType: 'text', content: 'Clear skies — a good afternoon to be outside.' }
                      ]
            );
        }, 400);
    }
}

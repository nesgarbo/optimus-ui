import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Button } from '@openng/optimus-ui/button';
import { AIAssistView, AIAssistViewModule } from '@openng/optimus-ui/aiassistview';
import { OpenngIcons } from '@openng/optimus-ui/api';
import type { AssistPrompt, AssistPromptRequestPayload, AssistView } from '@openng/optimus-ui/types/aiassistview';
import { answerFor } from './demo-assistant';

@Component({
    selector: 'views-doc',
    standalone: true,
    imports: [AppDocSectionText, Button, AIAssistViewModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                The assistant is rarely alone: history, saved prompts and settings sit beside it. A view with <i>type: 'assist'</i> is the transcript; one with <i>type: 'custom'</i> is filled by the <i>pAssistViewDef</i> whose value matches its id,
                inside the same header and the same chrome.
            </p>
            <p>The switcher is a proper <i>tablist</i>: one tab stop, arrow keys between the tabs, <i>Home</i> and <i>End</i> to the ends, and <i>aria-controls</i> pointing at the panel that is actually rendered.</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 30rem">
                <p-aiassistview #assist [(prompts)]="prompts" [(activeView)]="activeView" [views]="views" heading="Workspace" (promptRequest)="onPrompt($event)">
                    <ng-template pAssistViewDef="history">
                        <div class="flex flex-col gap-2">
                            @for (entry of history; track entry) {
                                <p-button [outlined]="true" severity="secondary" size="small" [label]="entry" (onClick)="resume(entry)" />
                            }
                        </div>
                    </ng-template>

                    <ng-template pAssistViewDef="settings">
                        <p class="opacity-70">Any content at all. A custom view is your template inside the assistant's chrome — settings, a prompt library, a document preview.</p>
                    </ng-template>
                </p-aiassistview>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class ViewsDoc {
    readonly assist = viewChild.required<AIAssistView>('assist');

    readonly prompts = signal<AssistPrompt[]>([]);

    readonly activeView = signal(0);

    readonly views: AssistView[] = [
        { id: 'chat', type: 'assist', name: 'Chat', iconCss: OpenngIcons.COMMENTS },
        { id: 'history', type: 'custom', name: 'History', iconCss: OpenngIcons.HISTORY, badge: 3 },
        { id: 'settings', type: 'custom', name: 'Settings', iconCss: OpenngIcons.COG }
    ];

    readonly history = ['Explain Angular signals', 'Which component for tabular data?', 'How do I test accessibility?'];

    resume(prompt: string): void {
        this.activeView.set(0);
        // The handle drives the assistant from anywhere on the page, including another view.
        setTimeout(() => this.assist().executePrompt(prompt));
    }

    onPrompt(event: AssistPromptRequestPayload): void {
        setTimeout(() => this.assist().addPromptResponse(answerFor(event.prompt)), 400);
    }
}

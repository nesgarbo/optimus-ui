import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { AIAssistView, AIAssistViewModule } from '@openng/optimus-ui/aiassistview';
import { OpenngIcons } from '@openng/optimus-ui/api';
import type { AssistFooterToolbarOptions, AssistPrompt, AssistPromptRequestPayload, AssistToolbarItem, AssistToolbarItemClickPayload, AssistToolbarOptions } from '@openng/optimus-ui/types/aiassistview';
import { answerFor } from './demo-assistant';

@Component({
    selector: 'toolbars-doc',
    standalone: true,
    imports: [AppDocSectionText, AIAssistViewModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                Four strips, one shape. The header's, the one on a prompt bubble, the one under a response and the one built into the editor all take the same <i>AssistToolbarItem</i> and all report through <i>toolbarItemClick</i>, with the payload
                naming which strip it came from.
            </p>
            <p>
                Well-known ids — <i>copy</i>, <i>like</i>, <i>dislike</i>, <i>regenerate</i>, <i>edit</i>, <i>delete</i>, <i>readAloud</i>, <i>clear</i>, <i>attach</i>, <i>microphone</i>, <i>send</i>, <i>stop</i> — bring a glyph and a behaviour. The
                event fires first, so setting <i>cancel</i> puts your own behaviour in place of the built-in one.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 30rem">
                <p-aiassistview
                    #assist
                    [(prompts)]="prompts"
                    heading="Toolbars"
                    [toolbarSettings]="headerToolbar"
                    [footerToolbarSettings]="footerToolbar"
                    [responseToolbarItems]="responseItems"
                    (promptRequest)="onPrompt($event)"
                    (toolbarItemClick)="onItem($event)"
                />
            </div>
            @if (lastItem()) {
                <p class="mt-3 text-sm">
                    Last entry: <b>{{ lastItem() }}</b>
                </p>
            }
        </div>
        <app-code></app-code>
    `
})
export class ToolbarsDoc {
    readonly assist = viewChild.required<AIAssistView>('assist');

    readonly prompts = signal<AssistPrompt[]>([]);

    readonly lastItem = signal<string | null>(null);

    readonly headerToolbar: AssistToolbarOptions = {
        items: [
            { id: 'new', tooltip: 'New conversation' },
            { id: 'clear', tooltip: 'Clear conversation' }
        ]
    };

    readonly footerToolbar: AssistFooterToolbarOptions = {
        position: 'inline',
        items: [{ id: 'prompt-library', iconCss: OpenngIcons.BOOK, tooltip: 'Prompt library' }]
    };

    readonly responseItems: AssistToolbarItem[] = [
        { id: 'copy', tooltip: 'Copy' },
        { id: 'like', tooltip: 'Helpful' },
        { id: 'dislike', tooltip: 'Not helpful' },
        { id: 'separator', type: 'separator' },
        { id: 'regenerate', tooltip: 'Regenerate' },
        { id: 'share', iconCss: OpenngIcons.SHARE_ALT, tooltip: 'Share this answer' }
    ];

    onPrompt(event: AssistPromptRequestPayload): void {
        setTimeout(() => this.assist().addPromptResponse(answerFor(event.prompt)), 400);
    }

    onItem(event: AssistToolbarItemClickPayload): void {
        this.lastItem.set(`${event.toolbar} · ${event.item.id}`);

        // An id the component does not know is delivered and nothing else happens, which is how your
        // own entries arrive.
        if (event.item.id === 'share') event.cancel = true;
    }
}

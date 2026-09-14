import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { AIAssistView, AIAssistViewModule } from '@openng/optimus-ui/aiassistview';
import type { AssistAttachmentOptions, AssistAttachmentPayload, AssistPrompt, AssistPromptRequestPayload } from '@openng/optimus-ui/types/aiassistview';

@Component({
    selector: 'attachments-doc',
    standalone: true,
    imports: [AppDocSectionText, AIAssistViewModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                <i>enableAttachments</i> adds the paperclip, and with it dropping files anywhere on the surface and pasting an image straight into the editor. The rules — accepted types, largest file, how many per message — live in
                <i>attachmentSettings</i>, and a file turned away announces why through the assertive live region rather than failing silently.
            </p>
            <p>
                Leave <i>saveUrl</i> unset and the files stay local with their <i>File</i> intact, which is what most assistants want: the file goes to the model through the same call as the prompt. Set it and the component uploads them itself and
                reports progress on each chip.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 30rem">
                <p-aiassistview
                    #assist
                    [(prompts)]="prompts"
                    heading="Attachments"
                    enableAttachments
                    [attachmentSettings]="attachmentSettings"
                    promptPlaceholder="Drop a file, paste an image, or ask something…"
                    (promptRequest)="onPrompt($event)"
                    (attachmentUploadFailure)="onRejected($event)"
                />
            </div>
            @if (lastRejection()) {
                <p class="mt-3 text-sm">
                    Turned away: <b>{{ lastRejection() }}</b>
                </p>
            }
        </div>
        <app-code></app-code>
    `
})
export class AttachmentsDoc {
    readonly assist = viewChild.required<AIAssistView>('assist');

    readonly prompts = signal<AssistPrompt[]>([]);

    readonly lastRejection = signal<string | null>(null);

    readonly attachmentSettings: AssistAttachmentOptions = {
        allowedFileTypes: 'image/*,.pdf,.md,.txt,.csv',
        maxFileSize: 5 * 1024 * 1024,
        maximumCount: 3,
        allowDrop: true,
        allowPaste: true
    };

    onPrompt(event: AssistPromptRequestPayload): void {
        const names = (event.attachedFiles ?? []).map((file) => file.name).join(', ');

        setTimeout(() => this.assist().addPromptResponse(names ? `I received **${names}**. In a real assistant these travel to the model alongside the prompt.` : 'Nothing attached — try the paperclip, or drop a file on the transcript.'), 400);
    }

    onRejected(event: AssistAttachmentPayload): void {
        this.lastRejection.set(`${event.file.name} (${event.file.error})`);
    }
}

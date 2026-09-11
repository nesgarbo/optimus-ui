import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { AIAssistView, AIAssistViewModule } from '@openng/optimus-ui/aiassistview';
import type { AssistPrompt, AssistPromptRequestPayload, AssistSpeechToTextOptions, AssistTextToSpeechOptions } from '@openng/optimus-ui/types/aiassistview';
import { answerFor } from './demo-assistant';

@Component({
    selector: 'speech-doc',
    standalone: true,
    imports: [AppDocSectionText, AIAssistViewModule, AppCode],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                Dictation runs on the browser's <i>SpeechRecognition</i> and read-aloud on <i>SpeechSynthesis</i>. Both are optional in the platform and absent on the server, so the microphone button is drawn only where it would work and the
                read-aloud entry only joins the response toolbar when a voice exists.
            </p>
            <p><i>silenceTimeout</i> ends a dictation that has gone quiet — continuous recognition never ends itself — and <i>autoSend</i> sends what was heard without a second click, which is the whole point of dictating in the first place.</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 30rem">
                <p-aiassistview #assist [(prompts)]="prompts" heading="Speech" [speechToTextSettings]="speechToText" [textToSpeechSettings]="textToSpeech" (promptRequest)="onPrompt($event)" />
            </div>
        </div>
        <app-code></app-code>
    `
})
export class SpeechDoc {
    readonly assist = viewChild.required<AIAssistView>('assist');

    readonly prompts = signal<AssistPrompt[]>([]);

    readonly speechToText: AssistSpeechToTextOptions = {
        enabled: true,
        allowInterimResults: true,
        silenceTimeout: 2500,
        autoSend: false
    };

    readonly textToSpeech: AssistTextToSpeechOptions = {
        enabled: true,
        rate: 1,
        pitch: 1
    };

    onPrompt(event: AssistPromptRequestPayload): void {
        setTimeout(() => this.assist().addPromptResponse(answerFor(event.prompt)), 400);
    }
}

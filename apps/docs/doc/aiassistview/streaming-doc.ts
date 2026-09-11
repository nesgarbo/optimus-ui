import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { AIAssistView, AIAssistViewModule } from '@openng/optimus-ui/aiassistview';
import { Button } from '@openng/optimus-ui/button';
import type { AssistPrompt, AssistPromptRequestPayload } from '@openng/optimus-ui/types/aiassistview';
import { answerFor, streamDeltas, streamSseFrames } from './demo-assistant';

@Component({
    selector: 'streaming-doc',
    standalone: true,
    imports: [AppDocSectionText, AIAssistViewModule, AppCode, Button],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <app-docsectiontext>
            <p>
                <i>streamResponse</i> is the whole of it. Hand it whatever your provider gives back — a <i>fetch</i> <i>Response</i>, a <i>ReadableStream</i>, an SDK's async iterable, an <i>Observable</i> — and each delta is appended as it lands, the
                turn closes when the stream ends, and a stream that throws marks the turn failed with a retryable error block instead of leaving it open.
            </p>
            <p>
                Set <i>sse</i> when the source is framed as Server-Sent Events and each <i>data:</i> payload reaches <i>transform</i> as one string, with the <i>[DONE]</i> sentinel swallowed. Frames that straddle a chunk boundary — the normal case,
                not the edge case — are reassembled before <i>transform</i> sees them.
            </p>
            <p>The stop button cancels the read, so the turn closes and the connection is released. Nothing else has to be wired for it.</p>
        </app-docsectiontext>
        <div class="card">
            <div class="flex flex-wrap gap-3 mb-4">
                <p-button [outlined]="true" [rounded]="true" severity="secondary" size="small" [label]="'Source: ' + (sse() ? 'SSE frames' : 'plain deltas')" (onClick)="sse.set(!sse())" />
            </div>
            <div style="height: 30rem">
                <p-aiassistview #assist [(prompts)]="prompts" heading="Streaming" enableStreaming [promptSuggestions]="suggestions" (promptRequest)="onPrompt($event)" />
            </div>
        </div>
        <app-code></app-code>
        <app-docsectiontext>
            <p>Against a real endpoint, both shapes are one call:</p>
        </app-docsectiontext>
        <app-code [code]="realWorld" [hideToggleCode]="true"></app-code>
    `
})
export class StreamingDoc {
    readonly assist = viewChild.required<AIAssistView>('assist');

    readonly prompts = signal<AssistPrompt[]>([]);

    readonly sse = signal(false);

    readonly suggestions = ['Explain Angular signals', 'Which component for tabular data?', 'How do I test accessibility?'];

    onPrompt(event: AssistPromptRequestPayload): void {
        const answer = answerFor(event.prompt);

        if (this.sse()) {
            // The fixture puts the answer on the wire the way a hosted model does; the options are what
            // you would write against the real thing.
            void this.assist().streamResponse(streamSseFrames(answer), {
                sse: true,
                transform: (frame) => JSON.parse(frame).choices[0]?.delta?.content
            });

            return;
        }

        void this.assist().streamResponse(streamDeltas(answer));
    }

    realWorld = {
        typescript: `// A hosted model over SSE
async onPrompt(event: AssistPromptRequestPayload) {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: event.prompt })
    });

    await this.assist().streamResponse(response, {
        sse: true,
        transform: (frame) => JSON.parse(frame).choices[0]?.delta?.content
    });
}

// An SDK that already yields objects
async onPrompt(event: AssistPromptRequestPayload) {
    const stream = await this.client.messages.stream({ messages: [{ role: 'user', content: event.prompt }] });

    await this.assist().streamResponse(stream, {
        transform: (chunk: any) => chunk.delta?.text
    });
}

// An Angular service that hands back an Observable
onPrompt(event: AssistPromptRequestPayload) {
    this.assist().streamResponse(this.chat.ask(event.prompt));
}`
    };
}

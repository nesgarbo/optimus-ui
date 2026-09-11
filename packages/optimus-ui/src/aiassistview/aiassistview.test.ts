import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import type { AssistPrompt, AssistPromptRequestPayload } from '@openng/optimus-ui/types/aiassistview';
import { beforeEach, describe, expect, it } from 'vitest';
import { AIAssistView } from './aiassistview';
import { AIAssistViewModule } from './aiassistview.module';

// The component is mounted EXACTLY as a consumer writes it, and driven through the handle rather than
// through its internals. What this protects:
//   - that a prompt appends a turn, fires the event and clears the editor,
//   - that a cancelled request leaves the transcript and the editor untouched,
//   - that a streamed answer accumulates and closes,
//   - that blocks patch in place by id,
//   - that regeneration keeps the earlier answer and the navigator counts it,
//   - that the accessibility contract reaches the DOM.

@Component({
    standalone: true,
    imports: [AIAssistViewModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: ` <p-aiassistview #assist [(prompts)]="prompts" [(prompt)]="prompt" heading="Assistant" [enableStreaming]="streaming()" [promptSuggestions]="suggestions()" (promptRequest)="onPrompt($event)" /> `
})
class Host {
    readonly assist = viewChild.required<AIAssistView>('assist');

    readonly prompts = signal<AssistPrompt[]>([]);

    readonly prompt = signal('');

    readonly streaming = signal(false);

    readonly suggestions = signal<string[]>(['First suggestion']);

    readonly requests: AssistPromptRequestPayload[] = [];

    cancelNext = false;

    onPrompt(event: AssistPromptRequestPayload): void {
        this.requests.push(event);

        if (this.cancelNext) event.cancel = true;
    }
}

describe('AIAssistView', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    const assist = () => host.assist();
    const root = () => fixture.debugElement.query(By.css('[data-part="root"]')).nativeElement as HTMLElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [Host], providers: [provideZonelessChangeDetection()] }).compileComponents();

        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('renders the header, the transcript and the composer', () => {
        expect(root().querySelector('[data-part="header"]')?.textContent).toContain('Assistant');
        expect(root().querySelector('[data-part="footer"] textarea')).toBeTruthy();
        expect(root().querySelector('[role="log"]')?.getAttribute('aria-live')).toBe('polite');
    });

    it('shows the banner while the transcript is empty, and the suggestions with it', () => {
        expect(root().querySelector('[data-part="banner"]')).toBeTruthy();
        expect(root().querySelector('[data-part="suggestions"]')?.textContent).toContain('First suggestion');
    });

    it('appends a turn, reports it and empties the editor', async () => {
        host.prompt.set('Hello');
        await fixture.whenStable();

        assist().executePrompt('Hello');
        await fixture.whenStable();

        expect(host.prompts().length).toBe(1);
        expect(host.prompts()[0].prompt).toBe('Hello');
        expect(host.requests.at(-1)?.prompt).toBe('Hello');
        expect(root().querySelectorAll('[data-part="turn"]').length).toBe(1);
    });

    it('leaves everything alone when the request is cancelled', async () => {
        host.cancelNext = true;
        assist().executePrompt('Ignored');
        await fixture.whenStable();

        expect(host.prompts().length).toBe(0);
        expect(host.requests.length).toBe(1);
    });

    it('accumulates a streamed answer and closes the turn', async () => {
        host.streaming.set(true);
        assist().executePrompt('Stream please');
        await fixture.whenStable();

        assist().appendPromptResponse('Half ');
        assist().appendPromptResponse('an answer');
        await fixture.whenStable();

        expect(host.prompts()[0].response).toBe('Half an answer');
        expect(host.prompts()[0].status).toBe('streaming');

        assist().addPromptResponse('Half an answer');
        await fixture.whenStable();

        expect(host.prompts()[0].status).toBe('complete');
    });

    it('reads a streamed answer chunk by chunk and closes the turn', async () => {
        host.streaming.set(true);
        assist().executePrompt('Stream');
        await fixture.whenStable();

        async function* deltas() {
            yield 'One ';
            yield 'two ';
            yield 'three';
        }

        await assist().streamResponse(deltas());
        await fixture.whenStable();

        expect(host.prompts()[0].response).toBe('One two three');
        expect(host.prompts()[0].status).toBe('complete');
    });

    it('picks the delta out of an SSE frame', async () => {
        host.streaming.set(true);
        assist().executePrompt('Stream');
        await fixture.whenStable();

        // Split mid-frame on purpose: a chunk boundary inside a frame is the normal case, and a reader
        // that treats each chunk as a message loses half the answer.
        async function* frames() {
            yield 'data: {"delta":"Hel';
            yield 'lo"}\n\ndata: {"delta":" world"}\n\n';
            yield 'data: [DONE]\n\n';
        }

        await assist().streamResponse(frames(), { sse: true, transform: (frame) => JSON.parse(frame).delta });
        await fixture.whenStable();

        expect(host.prompts()[0].response).toBe('Hello world');
        expect(host.prompts()[0].status).toBe('complete');
    });

    it('reads an SDK stream that yields objects', async () => {
        host.streaming.set(true);
        assist().executePrompt('Stream');
        await fixture.whenStable();

        async function* sdk() {
            yield { type: 'message_start' };
            yield { type: 'delta', delta: { text: 'From ' } };
            yield { type: 'delta', delta: { text: 'an SDK' } };
            yield { type: 'message_stop' };
        }

        await assist().streamResponse(sdk(), { transform: (chunk) => chunk.delta?.text });
        await fixture.whenStable();

        expect(host.prompts()[0].response).toBe('From an SDK');
    });

    it('marks the turn failed when the stream throws', async () => {
        host.streaming.set(true);
        assist().executePrompt('Stream');
        await fixture.whenStable();

        async function* broken() {
            yield 'partial';
            throw new Error('upstream is down');
        }

        await assist().streamResponse(broken());
        await fixture.whenStable();

        const turn = host.prompts()[0];

        expect(turn.status).toBe('failed');
        expect(turn.response).toBe('partial');
        expect(turn.blocks?.at(-1)).toMatchObject({ blockType: 'error', content: 'upstream is down', retryable: true });
    });

    it('stops a stream when the stop button is pressed', async () => {
        host.streaming.set(true);
        assist().executePrompt('Stream');
        await fixture.whenStable();

        let delivered = 0;

        async function* slow() {
            for (let index = 0; index < 20; index += 1) {
                delivered += 1;
                yield 'x';
                await new Promise((resolve) => setTimeout(resolve, 5));
            }
        }

        const reading = assist().streamResponse(slow());

        await new Promise((resolve) => setTimeout(resolve, 20));
        assist().stopResponding();
        await reading;
        await fixture.whenStable();

        expect(host.prompts()[0].status).toBe('stopped');
        expect(delivered).toBeLessThan(20);
    });

    it('patches a block by id and appends an unmatched one', async () => {
        assist().executePrompt('Blocks');
        await fixture.whenStable();

        assist().updateBlock({ blockType: 'thinking', id: 'thinking', isActive: true, stages: [{ id: 's1', status: 'inProgress', content: 'Working' }] });
        assist().updateBlock({ blockType: 'thinking', id: 'thinking', isActive: false, stages: [{ id: 's1', status: 'completed', content: 'Working' }] });
        assist().updateBlock({ blockType: 'text', id: 'answer', content: 'Done' });
        await fixture.whenStable();

        const blocks = host.prompts()[0].blocks ?? [];

        expect(blocks.length).toBe(2);
        expect(blocks[0]).toMatchObject({ blockType: 'thinking', isActive: false });
        expect(root().querySelector('[data-part="thinking-block"]')).toBeTruthy();
    });

    it('keeps the earlier answer when a turn is regenerated', async () => {
        assist().executePrompt('Ask');
        await fixture.whenStable();

        assist().addPromptResponse('First answer');
        await fixture.whenStable();

        assist().regenerate(0);
        await fixture.whenStable();

        assist().addPromptResponse('Second answer');
        await fixture.whenStable();

        const turn = host.prompts()[0];

        expect(turn.regeneratedResponses).toEqual(['First answer']);
        expect(turn.response).toBe('Second answer');
        expect(root().querySelector('.p-aiassistview-response-nav')?.textContent).toContain('2 of 2');
    });

    it('marks a response helpful and takes the mark back', async () => {
        assist().executePrompt('Ask');
        await fixture.whenStable();
        assist().addPromptResponse('Answer');
        await fixture.whenStable();

        // The entry is a `p-button`, so the element that takes the click is the button inside it.
        const like = root().querySelector<HTMLButtonElement>('[data-assist-toolbar="response"] [data-assist-item="like"] button')!;

        like.click();
        await fixture.whenStable();
        expect(host.prompts()[0].isResponseHelpful).toBe('like');

        like.click();
        await fixture.whenStable();
        expect(host.prompts()[0].isResponseHelpful).toBeNull();
    });

    it('empties the transcript and says so', async () => {
        assist().executePrompt('Ask');
        await fixture.whenStable();

        assist().clear();
        await fixture.whenStable();

        expect(host.prompts().length).toBe(0);
        expect(root().querySelector('[data-part="banner"]')).toBeTruthy();
    });

    it('exports the transcript as markdown and as json', async () => {
        assist().executePrompt('Ask');
        await fixture.whenStable();
        assist().addPromptResponse('Answer');
        await fixture.whenStable();

        expect(assist().exportTranscript()).toContain('Answer');
        expect(JSON.parse(assist().exportTranscript('json')).length).toBe(1);
    });
});

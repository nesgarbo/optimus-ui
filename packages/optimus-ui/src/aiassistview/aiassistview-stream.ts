import type { AssistStreamSource, AssistSubscribable } from '@openng/optimus-ui/types/aiassistview';

/**
 * Turning whatever a provider hands back into a sequence of text chunks.
 *
 * Every AI endpoint streams, and no two agree on how. A `fetch` gives back a `Response` whose body is
 * a byte `ReadableStream`; the OpenAI and Anthropic SDKs give back an async iterable of objects; an
 * Angular service is as likely to give back an `Observable`. Normalising all of them here is what lets
 * the component expose ONE method — `streamResponse` — instead of one per shape.
 *
 * Nothing in this file touches the transcript. It only produces chunks: text for anything that
 * arrives as text or bytes, and the value untouched for anything else, so an SDK's objects reach the
 * caller's `transform` as they are.
 *
 * @module aiassistview-stream
 */

/**
 * Decodes bytes as they arrive, so a multi-byte character split across two chunks still survives.
 *
 * Anything that is neither text nor bytes — the objects an SDK yields — is passed through untouched
 * for the caller's `transform` to read.
 */
function createDecoder(): (value: unknown) => unknown {
    const decoder = typeof TextDecoder === 'undefined' ? null : new TextDecoder();

    return (value) => {
        if (typeof value === 'string') return value;
        if (!(value instanceof Uint8Array)) return value;

        // `stream: true` is the whole point: without it a character straddling a chunk boundary is
        // decoded twice, once as a replacement character and once as itself.
        return decoder ? decoder.decode(value, { stream: true }) : '';
    };
}

/** Whether the value is a subscribable — an RxJS `Observable` or anything shaped like one. @internal */
function isSubscribable(value: unknown): value is AssistSubscribable {
    return typeof (value as AssistSubscribable)?.subscribe === 'function';
}

/** Bridges a subscribable to an async iterable, with back-pressure-free buffering. @internal */
async function* fromSubscribable(source: AssistSubscribable, signal?: AbortSignal): AsyncGenerator<unknown> {
    const buffer: unknown[] = [];
    let done = false;
    let failure: unknown;
    let wake: (() => void) | null = null;

    const notify = () => {
        wake?.();
        wake = null;
    };

    const subscription = source.subscribe({
        next: (value) => {
            buffer.push(value);
            notify();
        },
        error: (error) => {
            failure = error ?? new Error('stream failed');
            done = true;
            notify();
        },
        complete: () => {
            done = true;
            notify();
        }
    });

    const unsubscribe = () => (typeof subscription === 'function' ? subscription() : subscription?.unsubscribe?.());
    const onAbort = () => {
        done = true;
        notify();
    };

    signal?.addEventListener('abort', onAbort);

    try {
        while (true) {
            while (buffer.length > 0) {
                if (signal?.aborted) return;

                yield buffer.shift()!;
            }

            if (failure) throw failure;
            if (done || signal?.aborted) return;

            await new Promise<void>((resolve) => (wake = resolve));
        }
    } finally {
        signal?.removeEventListener('abort', onAbort);
        unsubscribe();
    }
}

/** Reads a `ReadableStream` without `for await`, which older Safari does not implement on streams. @internal */
async function* fromReadableStream(stream: ReadableStream<string | Uint8Array>, signal?: AbortSignal): AsyncGenerator<string> {
    const reader = stream.getReader();
    const decode = createDecoder();
    const asText = (value: string | Uint8Array) => String(decode(value));

    try {
        while (true) {
            if (signal?.aborted) return;

            const { value, done } = await reader.read();

            if (done) return;
            if (value != null) yield asText(value);
        }
    } finally {
        // Releasing matters on an abort: a lock left held keeps the connection open.
        reader.releaseLock();
        if (signal?.aborted) void stream.cancel().catch(() => undefined);
    }
}

/**
 * Every source shape, as one async iterable of chunks.
 *
 * @group Function
 */
export async function* assistChunks(source: AssistStreamSource, signal?: AbortSignal): AsyncGenerator<unknown> {
    if (typeof Response !== 'undefined' && source instanceof Response) {
        if (!source.body) return;

        yield* fromReadableStream(source.body, signal);

        return;
    }

    if (typeof ReadableStream !== 'undefined' && source instanceof ReadableStream) {
        yield* fromReadableStream(source, signal);

        return;
    }

    if (isSubscribable(source)) {
        yield* fromSubscribable(source, signal);

        return;
    }

    const decode = createDecoder();

    for await (const value of source as AsyncIterable<unknown>) {
        if (signal?.aborted) return;

        yield decode(value);
    }
}

/** What an SSE frame carries once its `data:` lines are joined. @group Interface */
export interface AssistSseEvent {
    /** The `event:` name, when the server sent one. */
    event?: string;
    /** The joined `data:` payload. */
    data: string;
}

/**
 * Re-frames a byte or text stream as Server-Sent Events.
 *
 * The framing every hosted model uses, and the one piece of it that actually needs care: a frame ends
 * at a BLANK LINE, and a chunk boundary falls in the middle of a frame often enough that treating
 * each chunk as a message loses data. The carry-over buffer here is what makes it correct.
 *
 * `[DONE]` — the OpenAI end-of-stream sentinel — is swallowed rather than delivered.
 *
 * @group Function
 */
export async function* assistSseEvents(source: AssistStreamSource, signal?: AbortSignal): AsyncGenerator<AssistSseEvent> {
    let carry = '';

    const emit = function* (frame: string): Generator<AssistSseEvent> {
        const lines = frame.split(/\r?\n/);
        const data: string[] = [];
        let event: string | undefined;

        for (const line of lines) {
            if (line.startsWith(':')) continue;
            if (line.startsWith('event:')) event = line.slice(6).trim();
            else if (line.startsWith('data:')) data.push(line.slice(5).replace(/^ /, ''));
        }

        if (data.length === 0) return;

        const payload = data.join('\n');

        if (payload === '[DONE]') return;

        yield { event, data: payload };
    };

    for await (const chunk of assistChunks(source, signal)) {
        // A frame is text by definition; an object on an SSE source is not something to reassemble.
        if (typeof chunk !== 'string') continue;

        carry += chunk;

        let boundary = carry.search(/\r?\n\r?\n/);

        while (boundary >= 0) {
            const frame = carry.slice(0, boundary);

            carry = carry.slice(boundary + carry.slice(boundary).match(/^\r?\n\r?\n/)![0].length);
            yield* emit(frame);
            boundary = carry.search(/\r?\n\r?\n/);
        }
    }

    // A server that closes without a trailing blank line still owes us its last frame.
    if (carry.trim()) yield* emit(carry);
}

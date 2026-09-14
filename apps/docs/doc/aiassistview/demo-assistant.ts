import type { AssistResponseBlock, AssistThinkingStage } from '@openng/optimus-ui/types/aiassistview';

/**
 * A stand-in for a model, so the demos run with no key and no network.
 *
 * Everything here is canned. What matters for the demos is the SHAPE of the exchange — a prompt goes
 * out, text or blocks come back over time — which is identical whether the other end is a fixture or
 * a real endpoint.
 */

/** Answers keyed by a word in the prompt, so the demos feel like they are listening. */
const ANSWERS: { match: RegExp; answer: string }[] = [
    {
        match: /signal|state/i,
        answer: `Angular signals are a **reactive primitive**: a value plus the set of things that read it.

Three kinds cover almost everything:

1. \`signal()\` — a writable value.
2. \`computed()\` — a value derived from others, recalculated lazily.
3. \`effect()\` — a side effect that re-runs when what it read changes.

\`\`\`ts:counter.ts
const count = signal(0);
const doubled = computed(() => count() * 2);

count.set(4);
console.log(doubled()); // 8
\`\`\`

The rule worth remembering: read a signal inside \`computed\` or \`effect\` and you are subscribed to it. Read it anywhere else and you are not.`
    },
    {
        match: /table|grid|data/i,
        answer: `For tabular data, reach for the table first and the list second.

| Component | Best for | Virtualised |
| --- | --- | --- |
| Table | Rows with columns, sorting, filtering | Yes |
| DataView | Cards or list items | Yes |
| TreeTable | Hierarchies with columns | Partially |

> A table with fewer than fifty rows rarely needs virtual scroll, and turning it on costs you sticky headers in some layouts.`
    },
    {
        match: /accessib|aria|screen reader/i,
        answer: `Three things carry most of the weight:

- **Roles that match the behaviour.** A transcript is a \`log\`, a switcher is a \`tablist\`, a status line is a \`status\`.
- **A name for every control.** An icon-only button with no \`aria-label\` is a blank to a screen reader.
- **Announcements for what changed off-screen.** A live region is the only way a reader learns an answer finished arriving.

Test it by unplugging the mouse. If you cannot finish the task, neither can someone using a keyboard.`
    }
];

/** The answer for a prompt, falling back to a generic one. */
export function answerFor(prompt: string): string {
    return (
        ANSWERS.find((entry) => entry.match.test(prompt))?.answer ??
        `Here is what I found for **${prompt.slice(0, 60)}**.

This is a canned answer from the documentation fixture — no model is being called. Swap \`promptRequest\` for your own endpoint and the surface behaves exactly the same.

- Markdown is rendered, including \`inline code\`.
- Fenced samples become their own block with a copy button.
- Everything else is yours.`
    );
}

/**
 * Feeds `answer` back a few characters at a time, the way a token stream arrives.
 *
 * An async generator, which is exactly what `streamResponse` takes — so the demo talks to the
 * component the same way a real provider's SDK would.
 */
export async function* streamDeltas(answer: string): AsyncGenerator<string> {
    let cursor = 0;

    while (cursor < answer.length) {
        // A variable step, because a fixed one reads as a typewriter rather than as a model.
        const step = 3 + Math.floor(Math.random() * 8);

        yield answer.slice(cursor, cursor + step);
        cursor += step;

        await new Promise((resolve) => setTimeout(resolve, 24));
    }
}

/**
 * The same answer, framed as Server-Sent Events with a JSON delta per frame.
 *
 * What a hosted model actually puts on the wire, chunk boundaries falling mid-frame included.
 */
export async function* streamSseFrames(answer: string): AsyncGenerator<string> {
    let carry = '';

    for await (const delta of streamDeltas(answer)) {
        carry += `data: ${JSON.stringify({ choices: [{ delta: { content: delta } }] })}\n\n`;

        // Cut the buffer at an arbitrary point, so frames straddle chunks the way they do in the wild.
        const cut = Math.floor(carry.length * 0.6);

        yield carry.slice(0, cut);
        carry = carry.slice(cut);
    }

    yield `${carry}data: [DONE]\n\n`;
}

/** The reasoning steps a demo walks through before answering. */
export function demoStages(): AssistThinkingStage[] {
    return [
        {
            id: 'read',
            status: 'pending',
            content: 'Reading the workspace',
            editableContext: [
                { type: 'file', name: 'aiassistview.ts', value: '1.2k lines', badge: 'success', clickable: true },
                { type: 'file', name: 'aiassistview-state.ts', value: '730 lines', badge: 'success', clickable: true }
            ]
        },
        {
            id: 'search',
            status: 'pending',
            content: 'Searching for the relevant symbols',
            editableContext: [{ type: 'search', name: 'addPromptResponse', value: '7 hits', badge: 'success', clickable: true }]
        },
        {
            id: 'tool',
            status: 'pending',
            content: 'Running the type checker',
            editableContext: [{ type: 'tool', name: 'tsc --noEmit', value: 'clean', badge: 'success' }]
        },
        { id: 'compose', status: 'pending', content: 'Composing the answer' }
    ];
}

/** Walks the stages one at a time, patching the block after each. */
export function runStages(stages: AssistThinkingStage[], onUpdate: (block: AssistResponseBlock) => void, onDone: () => void): () => void {
    let step = 0;
    const started = Date.now();

    const emit = () =>
        onUpdate({
            blockType: 'thinking',
            id: 'thinking',
            isActive: step < stages.length,
            stages: stages.map((stage, index) => ({ ...stage, status: index < step ? 'completed' : index === step ? 'inProgress' : 'pending' })),
            durationMs: Date.now() - started,
            collapsible: true
        });

    emit();

    const timer = setInterval(() => {
        step += 1;
        emit();

        if (step < stages.length) return;

        clearInterval(timer);
        onDone();
    }, 900);

    return () => clearInterval(timer);
}

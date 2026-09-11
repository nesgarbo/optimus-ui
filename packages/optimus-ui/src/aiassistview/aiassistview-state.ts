import { InjectionToken, type Signal, computed, signal } from '@angular/core';
import type {
    AssistAttachment,
    AssistAttachmentOptions,
    AssistDensity,
    AssistFeedback,
    AssistFooterToolbarOptions,
    AssistLayout,
    AssistPrompt,
    AssistResponseBlock,
    AssistScrollPolicy,
    AssistSendTrigger,
    AssistSuggestion,
    AssistThinkingBlock,
    AssistToolbarItem,
    AssistToolbarOptions,
    AssistView
} from '@openng/optimus-ui/types/aiassistview';

/**
 * The shared runtime of one assistant: everything the parts read, and everything the root commands.
 *
 * A class rather than a service, for the same reason the TaskBoard's state is one — a page may hold
 * several assistants, each with its own transcript, its own open turn and its own editor. The root
 * instantiates it and provides it through {@link ASSIST_STATE}, so a part never has to be told which
 * assistant it belongs to.
 *
 * It takes SIGNALS, not values. The root hands over its own inputs, so the derived state recomputes
 * when the application changes the data and nothing has to push anything in.
 *
 * @module aiassistview-state
 */

/* -------------------------------------------------------------------------------------------------
 * Labels
 * ---------------------------------------------------------------------------------------------- */

/**
 * Every string the supplied chrome puts on screen.
 *
 * Spelled out as one flat record rather than pulled from a translation service: the component has no
 * opinion about how an application translates, and a record is the one shape every approach can fill.
 *
 * @group Interface
 */
export interface AssistLabels {
    /** Name of the answering side, on its avatar and in the live region. */
    assistant: string;
    /** Name of the asking side. */
    user: string;
    /** Placeholder of the editor. */
    placeholder: string;
    /** Send button. */
    send: string;
    /** Stop button, shown while an answer arrives. */
    stop: string;
    /** Clear-transcript entry. */
    clear: string;
    /** Attach-file entry. */
    attach: string;
    /** Dictation entry, while idle. */
    microphone: string;
    /** Dictation entry, while listening. */
    listening: string;
    /** Copy entry. */
    copy: string;
    /** What the copy entry says once it has copied. */
    copied: string;
    /** Mark-helpful entry. */
    like: string;
    /** Mark-unhelpful entry. */
    dislike: string;
    /** Regenerate entry. */
    regenerate: string;
    /** Edit-prompt entry. */
    edit: string;
    /** Confirms an edited prompt. */
    save: string;
    /** Abandons an edited prompt. */
    cancel: string;
    /** Delete-turn entry. */
    delete: string;
    /** Read-aloud entry, while idle. */
    readAloud: string;
    /** Read-aloud entry, while speaking. */
    stopReading: string;
    /** Retry entry on a failed turn. */
    retry: string;
    /** Heading of a reasoning panel while it runs. */
    thinking: string;
    /** Heading of a reasoning panel once it is done. */
    thought: string;
    /** Elapsed reasoning time. Takes `{0}`, a number of seconds. */
    thoughtFor: string;
    /** Scroll-to-newest button. */
    scrollToBottom: string;
    /** Heading over the suggestion chips. */
    suggestionsHeader: string;
    /** Heading of the empty state. */
    emptyTitle: string;
    /** Body of the empty state. */
    emptySubtitle: string;
    /** Step back through regenerated answers. */
    previousResponse: string;
    /** Step forward through regenerated answers. */
    nextResponse: string;
    /** Which regenerated answer is shown. Takes `{0}`, the position, and `{1}`, the count. */
    responseCounter: string;
    /** Heading over a turn's citations. */
    citations: string;
    /** Rejected because it is too big. Takes `{0}`, the file name, and `{1}`, the limit. */
    attachmentTooLarge: string;
    /** Rejected because of its type. Takes `{0}`, the file name. */
    attachmentRejected: string;
    /** Rejected because the turn is full. Takes `{0}`, the limit. */
    attachmentLimit: string;
    /** Removes one attachment. Takes `{0}`, the file name. */
    removeAttachment: string;
    /** Announced when a prompt goes out. */
    promptSent: string;
    /** Announced when an answer finishes. */
    responseComplete: string;
    /** Announced when an answer is cut short. */
    responseStopped: string;
    /** Announced when an answer fails. */
    responseFailed: string;
    /** Announced when the transcript is emptied. */
    transcriptCleared: string;
    /** Role of the scrolling transcript, for a screen reader. */
    transcriptLabel: string;
    /** Role of the view switcher, for a screen reader. */
    viewsLabel: string;
    /** What the editor's hint row says about sending. */
    sendHint: string;
}

/** The strings the component falls back to. English, so a product that ships one language ships none. */
export const ASSIST_DEFAULT_LABELS: AssistLabels = {
    assistant: 'Assistant',
    user: 'You',
    placeholder: 'Ask me anything…',
    send: 'Send',
    stop: 'Stop responding',
    clear: 'Clear conversation',
    attach: 'Attach files',
    microphone: 'Start dictation',
    listening: 'Stop dictation',
    copy: 'Copy',
    copied: 'Copied',
    like: 'Helpful',
    dislike: 'Not helpful',
    regenerate: 'Regenerate',
    edit: 'Edit prompt',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    readAloud: 'Read aloud',
    stopReading: 'Stop reading',
    retry: 'Retry',
    thinking: 'Thinking…',
    thought: 'Thought process',
    thoughtFor: 'Thought for {0}s',
    scrollToBottom: 'Scroll to latest',
    suggestionsHeader: 'Suggestions',
    emptyTitle: 'How can I help?',
    emptySubtitle: 'Ask a question to get started.',
    previousResponse: 'Previous response',
    nextResponse: 'Next response',
    responseCounter: '{0} of {1}',
    citations: 'Sources',
    attachmentTooLarge: '{0} is larger than {1}.',
    attachmentRejected: '{0} is not an accepted file type.',
    attachmentLimit: 'Up to {0} files per message.',
    removeAttachment: 'Remove {0}',
    promptSent: 'Prompt sent.',
    responseComplete: 'Response complete.',
    responseStopped: 'Response stopped.',
    responseFailed: 'Response failed.',
    transcriptCleared: 'Conversation cleared.',
    transcriptLabel: 'Conversation',
    viewsLabel: 'Assistant views',
    sendHint: 'Enter to send, Shift+Enter for a new line'
};

/** A partial override of {@link AssistLabels}. @group Types */
export type AssistLabelOverrides = Partial<AssistLabels>;

/**
 * Fills `{0}`, `{1}` … in a label.
 *
 * @group Function
 */
export function formatLabel(template: string, ...values: (string | number)[]): string {
    return template.replace(/\{(\d+)\}/g, (match, position) => {
        const value = values[Number(position)];

        return value === undefined ? match : String(value);
    });
}

/** Renders a byte count the way a file manager would. @group Function */
export function formatFileSize(bytes: number | undefined): string {
    if (bytes == null || !Number.isFinite(bytes)) return '';
    if (bytes < 1024) return `${bytes} B`;

    const units = ['KB', 'MB', 'GB'];
    let size = bytes / 1024;
    let unit = 0;

    while (size >= 1024 && unit < units.length - 1) {
        size /= 1024;
        unit += 1;
    }

    return `${size < 10 ? size.toFixed(1) : Math.round(size)} ${units[unit]}`;
}

/**
 * Renders a turn's `createdAt` as a clock time in the reader's own locale.
 *
 * Returns nothing when there is no date, so a transcript restored without one shows no time rather
 * than an invented one.
 *
 * @group Function
 */
export function formatTime(value: Date | string | number | undefined): string {
    if (value == null) return '';

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(date);
}

/* -------------------------------------------------------------------------------------------------
 * Identity
 * ---------------------------------------------------------------------------------------------- */

let assistSequence = 0;

/**
 * A transcript-unique id.
 *
 * A counter with a prefix, not `crypto.randomUUID`: ids are generated during rendering, they must be
 * stable between the server render and the client one when the transcript is seeded on the server,
 * and a random id differs between the two and throws the hydration away.
 *
 * @group Function
 */
export function assistId(prefix = 'turn'): string {
    assistSequence += 1;

    return `${prefix}-${assistSequence}`;
}

/** What `@for` tracks a turn by. @group Function */
export function assistTurnKey(index: number, turn: AssistPrompt): string {
    return turn.id ?? `index-${index}`;
}

/* -------------------------------------------------------------------------------------------------
 * Configuration
 * ---------------------------------------------------------------------------------------------- */

/** What the root hands the state. @internal */
export interface AssistStateConfig {
    /** The transcript. */
    prompts: Signal<AssistPrompt[]>;
    /** Writes the transcript back to the root's `model`. */
    setPrompts: (next: AssistPrompt[]) => void;
    /** What the editor holds. */
    prompt: Signal<string>;
    /** Writes the editor back to the root's `model`. */
    setPrompt: (next: string) => void;
    /** Which view is showing. */
    activeView: Signal<number>;
    /** Writes the active view back to the root's `model`. */
    setActiveView: (next: number) => void;
    /** The views. */
    views: Signal<AssistView[] | undefined>;
    /** The canned prompts. */
    suggestions: Signal<(string | AssistSuggestion)[] | undefined>;
    /** Chrome strings, merged over the defaults. */
    labels: Signal<AssistLabels>;
    /** Whether nothing responds to the pointer. */
    disabled: Signal<boolean>;
    /** Whether the transcript refuses edits while still answering prompts. */
    readonly: Signal<boolean>;
    /** Whether answers arrive in pieces. */
    streaming: Signal<boolean>;
    /** Whether the editor offers the paperclip. */
    attachments: Signal<boolean>;
    /** How attachments behave. */
    attachmentOptions: Signal<AssistAttachmentOptions | undefined>;
    /** The header toolbar. */
    toolbar: Signal<AssistToolbarOptions | undefined>;
    /** The footer toolbar. */
    footerToolbar: Signal<AssistFooterToolbarOptions | undefined>;
    /** Entries offered on a prompt bubble. */
    promptToolbarItems: Signal<AssistToolbarItem[] | undefined>;
    /** Entries offered under a response. */
    responseToolbarItems: Signal<AssistToolbarItem[] | undefined>;
    /** How tightly the surface is packed. */
    density: Signal<AssistDensity>;
    /** How a turn is laid out. */
    layout: Signal<AssistLayout>;
    /** When the transcript follows new content. */
    scrollPolicy: Signal<AssistScrollPolicy>;
    /** Which key sends. */
    sendTrigger: Signal<AssistSendTrigger>;
}

/* -------------------------------------------------------------------------------------------------
 * State
 * ---------------------------------------------------------------------------------------------- */

/**
 * The runtime.
 *
 * @group Interface
 */
export class AssistState {
    constructor(private readonly config: AssistStateConfig) {}

    /* --------------------------------------------------------------------------------------------
     * Straight reads
     * ----------------------------------------------------------------------------------------- */

    /** The chrome strings. */
    readonly labels = computed(() => this.config.labels());

    /** The transcript. */
    readonly prompts = computed(() => this.config.prompts());

    /** What the editor holds. */
    readonly prompt = computed(() => this.config.prompt());

    /** Whether nothing at all responds to the pointer. */
    readonly disabled = computed(() => this.config.disabled());

    /** Whether the transcript refuses edits, deletions and regeneration. */
    readonly readonly = computed(() => this.config.readonly());

    /** How tightly the surface is packed. */
    readonly density = computed(() => this.config.density());

    /** How a turn is laid out. */
    readonly layout = computed(() => this.config.layout());

    /** Which key sends. */
    readonly sendTrigger = computed(() => this.config.sendTrigger());

    /* --------------------------------------------------------------------------------------------
     * Local state
     * ----------------------------------------------------------------------------------------- */

    /** Where the turn currently being answered sits, or `-1` when nothing is arriving. */
    readonly activeTurnIndex = signal(-1);

    /** Attachments the editor is carrying, not yet sent. */
    readonly pendingAttachments = signal<AssistAttachment[]>([]);

    /** Whether the microphone is on. */
    readonly listening = signal(false);

    /** Which turn is being read aloud, or `-1`. */
    readonly speakingIndex = signal(-1);

    /** Which turn's prompt is open for editing, or `-1`. */
    readonly editingIndex = signal(-1);

    /** What that edit holds so far. */
    readonly editingValue = signal('');

    /** Whether the editor has the caret. */
    readonly editorFocused = signal(false);

    /** Whether files are being dragged over the surface. */
    readonly dropping = signal(false);

    /** Whether the transcript is scrolled away from its newest turn. */
    readonly scrolledAway = signal(false);

    /** Which toolbar entry last reported success, so the copy entry can say `Copied`. */
    readonly flashedItem = signal<string | null>(null);

    /** Which reasoning panels the reader folded away, by block id. */
    readonly collapsedBlocks = signal<ReadonlySet<string>>(new Set());

    /** What a polite screen-reader announcement should say. */
    readonly liveMessage = signal('');

    /** What an assertive screen-reader announcement should say. */
    readonly alertMessage = signal('');

    /** How long the open reasoning panel has been running, in whole seconds. */
    readonly thinkingElapsed = signal(0);

    /* --------------------------------------------------------------------------------------------
     * Derived
     * ----------------------------------------------------------------------------------------- */

    /** Whether an answer is arriving. */
    readonly busy = computed(() => this.activeTurnIndex() >= 0);

    /** The turn being answered, if any. */
    readonly activeTurn = computed<AssistPrompt | undefined>(() => this.prompts()[this.activeTurnIndex()]);

    /** Whether anything at all refuses interaction. */
    readonly inert = computed(() => this.disabled() || this.readonly());

    /** The views, with the implicit conversation view supplied when none are configured. */
    readonly views = computed<AssistView[]>(() => {
        const configured = this.config.views();

        if (!configured?.length) return [];

        return configured.map((view, index) => ({ id: view.id ?? `view-${index}`, type: view.type ?? 'assist', ...view }));
    });

    /** Which view is showing, clamped to the ones that exist. */
    readonly activeView = computed(() => {
        const count = this.views().length;

        if (count === 0) return 0;

        return Math.min(Math.max(this.config.activeView(), 0), count - 1);
    });

    /** Whether the transcript itself is the surface on screen. */
    readonly assistViewActive = computed(() => {
        const views = this.views();

        return views.length === 0 || (views[this.activeView()]?.type ?? 'assist') === 'assist';
    });

    /** The canned prompts, with the bare-string form widened to the object one. */
    readonly suggestions = computed<AssistSuggestion[]>(() => {
        const configured = this.config.suggestions();

        if (!configured?.length) return [];

        return configured.map((suggestion, index) =>
            typeof suggestion === 'string' ? { id: `suggestion-${index}`, text: suggestion, prompt: suggestion } : { id: suggestion.id ?? `suggestion-${index}`, ...suggestion, prompt: suggestion.prompt ?? suggestion.text }
        );
    });

    /** How attachments behave, merged over the defaults. */
    readonly attachmentOptions = computed<Required<Pick<AssistAttachmentOptions, 'maximumCount' | 'allowDrop' | 'allowPaste' | 'showPreview'>> & AssistAttachmentOptions>(() => ({
        maximumCount: 5,
        allowDrop: true,
        allowPaste: true,
        showPreview: true,
        ...(this.config.attachmentOptions() ?? {})
    }));

    /** Whether the paperclip is offered. */
    readonly attachmentsEnabled = computed(() => this.config.attachments());

    /** The header toolbar's visible entries. */
    readonly headerToolbarItems = computed(() => visibleItems(this.config.toolbar()?.items));

    /** The entries a prompt bubble offers. */
    readonly promptToolbarItems = computed(() => visibleItems(this.config.promptToolbarItems()));

    /** The entries a response offers, unless the turn carries its own. */
    readonly responseToolbarItems = computed(() => visibleItems(this.config.responseToolbarItems()));

    /** The entries one particular response offers. */
    responseToolbarItemsOf(turn: AssistPrompt): AssistToolbarItem[] {
        return turn.toolbarItems ? visibleItems(turn.toolbarItems) : this.responseToolbarItems();
    }

    /** The footer toolbar's visible entries. */
    readonly footerToolbarItems = computed(() => visibleItems(this.config.footerToolbar()?.items));

    /** Whether the footer entries sit on the editor row or beneath it. */
    readonly footerToolbarPosition = computed(() => this.config.footerToolbar()?.position ?? 'inline');

    /** Whether the transcript has nothing in it. */
    readonly empty = computed(() => this.prompts().length === 0);

    /** Whether a prompt can go out right now. */
    readonly canSend = computed(() => {
        if (this.disabled() || this.busy()) return false;

        return this.prompt().trim().length > 0 || this.pendingAttachments().length > 0;
    });

    /* --------------------------------------------------------------------------------------------
     * Transcript writes
     * ----------------------------------------------------------------------------------------- */

    /** Replaces the transcript. */
    setPrompts(next: AssistPrompt[]): void {
        this.config.setPrompts(next);
    }

    /** Replaces what the editor holds. */
    setPrompt(next: string): void {
        this.config.setPrompt(next);
    }

    /** Moves the view switcher. */
    setActiveView(next: number): void {
        this.config.setActiveView(next);
    }

    /**
     * Rewrites one turn.
     *
     * Every mutation goes through here, so the transcript is replaced rather than patched in place
     * and `OnPush` sees a new array. Patching the object and keeping the array would leave the
     * reference equal and the change invisible to a consumer holding the same array.
     */
    patchTurn(index: number, changes: Partial<AssistPrompt> | ((turn: AssistPrompt) => Partial<AssistPrompt>)): void {
        const turns = this.prompts();
        const turn = turns[index];

        if (!turn) return;

        const patch = typeof changes === 'function' ? changes(turn) : changes;
        const next = turns.slice();

        next[index] = { ...turn, ...patch };
        this.setPrompts(next);
    }

    /** Appends a turn and reports where it landed. */
    appendTurn(turn: AssistPrompt): number {
        const next = [...this.prompts(), turn];

        this.setPrompts(next);

        return next.length - 1;
    }

    /** Drops one turn. */
    removeTurn(index: number): AssistPrompt | undefined {
        const turns = this.prompts();
        const turn = turns[index];

        if (!turn) return undefined;

        this.setPrompts(turns.filter((_item, position) => position !== index));

        if (this.activeTurnIndex() === index) this.activeTurnIndex.set(-1);
        else if (this.activeTurnIndex() > index) this.activeTurnIndex.update((value) => value - 1);

        return turn;
    }

    /* --------------------------------------------------------------------------------------------
     * Responses
     * ----------------------------------------------------------------------------------------- */

    /** Replaces the open turn's answer. */
    setResponse(response: string | AssistResponseBlock[], final: boolean): void {
        const index = this.activeTurnIndex();

        if (index < 0) return;

        const patch: Partial<AssistPrompt> = typeof response === 'string' ? { response } : { blocks: response };

        this.patchTurn(index, { ...patch, status: final ? 'complete' : 'streaming' });

        if (final) this.finishTurn(index, 'complete');
    }

    /** Adds to the open turn's answer rather than replacing it. */
    appendResponse(chunk: string): void {
        const index = this.activeTurnIndex();

        if (index < 0) return;

        this.patchTurn(index, (turn) => ({ response: (turn.response ?? '') + chunk, status: 'streaming' }));
    }

    /**
     * Patches one block of the open turn, matched by `id`.
     *
     * A block without a match is appended, which is what makes a streamed answer that opens a
     * reasoning panel and then fills it work with no extra bookkeeping on the application's side.
     */
    updateBlock(block: AssistResponseBlock): void {
        const index = this.activeTurnIndex();

        if (index < 0) return;

        this.patchTurn(index, (turn) => {
            const blocks = turn.blocks ?? [];
            const position = block.id == null ? -1 : blocks.findIndex((candidate) => candidate.id === block.id);

            if (position < 0) return { blocks: [...blocks, block], status: 'streaming' };

            const next = blocks.slice();

            next[position] = { ...next[position], ...block } as AssistResponseBlock;

            return { blocks: next, status: 'streaming' };
        });
    }

    /** Closes the open turn and announces the outcome. */
    finishTurn(index: number, status: AssistPrompt['status'], error?: string): void {
        this.patchTurn(index, (turn) => ({
            status,
            error,
            // A reasoning panel left running would pulse forever once the answer is in, so closing the
            // turn closes them too.
            blocks: turn.blocks?.map((block) => (block.blockType === 'thinking' && block.isActive ? { ...block, isActive: false, durationMs: block.durationMs ?? this.thinkingElapsed() * 1000 } : block))
        }));

        if (this.activeTurnIndex() === index) this.activeTurnIndex.set(-1);

        this.thinkingElapsed.set(0);

        const labels = this.labels();

        this.announce(status === 'complete' ? labels.responseComplete : status === 'stopped' ? labels.responseStopped : labels.responseFailed);
    }

    /* --------------------------------------------------------------------------------------------
     * Regenerated answers
     * ----------------------------------------------------------------------------------------- */

    /** Every answer a turn holds, oldest first. */
    responsesOf(turn: AssistPrompt): string[] {
        const earlier = turn.regeneratedResponses ?? [];

        return earlier.length === 0 ? [turn.response ?? ''] : [...earlier, turn.response ?? ''];
    }

    /** Which of them is showing. Defaults to the newest. */
    activeResponseIndexOf(turn: AssistPrompt): number {
        const count = this.responsesOf(turn).length;
        const requested = turn.activeResponseIndex ?? count - 1;

        return Math.min(Math.max(requested, 0), count - 1);
    }

    /** The answer text actually on screen for a turn. */
    visibleResponseOf(turn: AssistPrompt): string {
        return this.responsesOf(turn)[this.activeResponseIndexOf(turn)] ?? '';
    }

    /* --------------------------------------------------------------------------------------------
     * Attachments
     * ----------------------------------------------------------------------------------------- */

    /** Adds an attachment to the editor. */
    addAttachment(file: AssistAttachment): void {
        this.pendingAttachments.update((files) => [...files, file]);
    }

    /** Takes one back out. */
    removeAttachment(id: string | undefined): AssistAttachment | undefined {
        const files = this.pendingAttachments();
        const file = files.find((candidate) => candidate.id === id);

        if (!file) return undefined;

        this.pendingAttachments.set(files.filter((candidate) => candidate.id !== id));

        return file;
    }

    /** Rewrites one attachment in place, for upload progress. */
    patchAttachment(id: string | undefined, changes: Partial<AssistAttachment>): void {
        this.pendingAttachments.update((files) => files.map((file) => (file.id === id ? { ...file, ...changes } : file)));
    }

    /** Empties the editor's attachment tray. */
    clearAttachments(): void {
        this.pendingAttachments.set([]);
    }

    /* --------------------------------------------------------------------------------------------
     * Reasoning panels
     * ----------------------------------------------------------------------------------------- */

    /** Whether a reasoning panel is folded away. */
    blockCollapsed(block: AssistThinkingBlock): boolean {
        const id = block.id;

        if (id == null) return block.collapsed ?? false;

        const overridden = this.collapsedBlocks();

        // The reader's choice wins over the block's own `collapsed`, but only once they have made
        // one: a panel that reopens itself on every streamed patch is unusable.
        if (overridden.has(`open:${id}`)) return false;
        if (overridden.has(id)) return true;

        return block.collapsed ?? false;
    }

    /** Folds or unfolds one reasoning panel. */
    toggleBlock(block: AssistThinkingBlock): void {
        const id = block.id;

        if (id == null) return;

        const collapsed = this.blockCollapsed(block);

        this.collapsedBlocks.update((current) => {
            const next = new Set(current);

            next.delete(id);
            next.delete(`open:${id}`);
            next.add(collapsed ? `open:${id}` : id);

            return next;
        });
    }

    /* --------------------------------------------------------------------------------------------
     * Feedback and announcements
     * ----------------------------------------------------------------------------------------- */

    /** Marks a turn helpful or not, and takes the mark back when it is applied twice. */
    toggleFeedback(index: number, feedback: Exclude<AssistFeedback, null>): AssistFeedback {
        const turn = this.prompts()[index];

        if (!turn) return null;

        const next = turn.isResponseHelpful === feedback ? null : feedback;

        this.patchTurn(index, { isResponseHelpful: next });

        return next;
    }

    /** Says something politely. */
    announce(message: string): void {
        this.liveMessage.set('');
        this.liveMessage.set(message);
    }

    /** Says something urgently. */
    alert(message: string): void {
        this.alertMessage.set('');
        this.alertMessage.set(message);
    }

    /** Marks one toolbar entry as having just succeeded, for the `Copied` flash. */
    flash(id: string): void {
        this.flashedItem.set(id);
    }
}

/** Drops the entries a toolbar was told not to draw. @internal */
function visibleItems(items: AssistToolbarItem[] | undefined): AssistToolbarItem[] {
    return (items ?? []).filter((item) => item.visible !== false);
}

/** What every part injects to reach its assistant's runtime. @group Interface */
export const ASSIST_STATE = new InjectionToken<AssistState>('ASSIST_STATE');

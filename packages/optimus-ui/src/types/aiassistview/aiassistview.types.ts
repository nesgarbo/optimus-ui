import type { PassThrough, PassThroughOption } from '@openng/optimus-ui/api';

/**
 * The AIAssistView contract.
 *
 * Everything a conversational assistant surface exchanges with the application lives here: the
 * transcript shape, the block grammar a response is built from, the settings objects, the event
 * payloads and the imperative handle.
 *
 * Nothing in this file imports from `@angular/core`. A back end, a state store or a test can depend
 * on the transcript shape without dragging the runtime in.
 *
 * @module aiassistview.types
 */

/* -------------------------------------------------------------------------------------------------
 * Transcript
 * ---------------------------------------------------------------------------------------------- */

/** Lifecycle of one turn, from the moment it is sent to the moment the answer is complete. */
export type AssistTurnStatus = 'pending' | 'streaming' | 'complete' | 'stopped' | 'failed';

/** Which way a turn was reacted to. `null` means the reader has not said. */
export type AssistFeedback = 'like' | 'dislike' | null;

/**
 * One turn of the conversation: what was asked, and what came back.
 *
 * A turn is the unit the transcript is made of, rather than a message, because prompt and response
 * are edited, regenerated and navigated together. `response` is the plain-text answer and `blocks`
 * the structured one; a turn may carry either, and a turn carrying both renders the blocks and keeps
 * the text as the copy/export/speech source.
 *
 * @group Interface
 */
export interface AssistPrompt<T = any> {
    /** Identity of the turn. Generated when the turn is created if the application omits it. */
    id?: string;
    /** What the reader asked. */
    prompt?: string;
    /** The plain-text answer. Markdown is rendered when `renderMarkdown` is on. */
    response?: string;
    /** The structured answer. Takes precedence over `response` for rendering. */
    blocks?: AssistResponseBlock[];
    /** Whether the answer was marked helpful. */
    isResponseHelpful?: AssistFeedback;
    /** Files sent alongside the prompt. */
    attachedFiles?: AssistAttachment[];
    /** Earlier answers to the same prompt, oldest first. The live one is `response`. */
    regeneratedResponses?: string[];
    /** Which of `regeneratedResponses` (plus the live one) the reader is looking at. */
    activeResponseIndex?: number;
    /** Where the turn is in its lifecycle. */
    status?: AssistTurnStatus;
    /** Why the turn failed, when `status` is `failed`. */
    error?: string;
    /** When the turn was created. */
    createdAt?: Date | string | number;
    /** Response-toolbar items for this turn alone, overriding `responseToolbar`. */
    toolbarItems?: AssistToolbarItem[];
    /** Sources the answer was drawn from, drawn under the response. */
    citations?: AssistCitation[];
    /** What the turn cost, drawn by the supplied footer when `showUsage` is on. */
    usage?: AssistTokenUsage;
    /** Whether the turn refuses editing, regeneration and deletion. */
    readonly?: boolean;
    /** Any extra payload. Travels untouched through the contexts and the payloads. */
    data?: T;
    /** Open for domain fields. */
    [key: string]: any;
}

/**
 * A source the answer leaned on.
 *
 * @group Interface
 */
export interface AssistCitation {
    /** Identity of the source. */
    id?: string;
    /** What to call it. */
    title?: string;
    /** Where it lives. */
    url?: string;
    /** The quoted fragment. */
    snippet?: string;
    /** Ordinal drawn in the marker. Defaults to the position in the list. */
    index?: number;
}

/**
 * What one turn cost.
 *
 * @group Interface
 */
export interface AssistTokenUsage {
    /** Tokens the prompt took. */
    promptTokens?: number;
    /** Tokens the answer took. */
    completionTokens?: number;
    /** Both, when the provider reports only the sum. */
    totalTokens?: number;
    /** Which model answered. */
    model?: string;
    /** How long the answer took, in milliseconds. */
    durationMs?: number;
}

/* -------------------------------------------------------------------------------------------------
 * Response blocks
 * ---------------------------------------------------------------------------------------------- */

/**
 * The grammar a structured answer is built from.
 *
 * A response is a list of blocks rather than a string because a modern assistant interleaves prose,
 * reasoning, tool calls and code, and each of those needs its own affordances — collapsing, copying,
 * re-running — that a single rendered string cannot offer.
 *
 * @group Types
 */
export type AssistResponseBlock = AssistTextBlock | AssistCodeBlock | AssistThinkingBlock | AssistToolBlock | AssistErrorBlock;

/** Fields every block carries. @group Interface */
export interface AssistBlockBase {
    /** Identity of the block. Used to patch one block of a streaming answer in place. */
    id?: string;
    /** Whether the block is still being written. */
    streaming?: boolean;
}

/**
 * Prose. Rendered as markdown when `renderMarkdown` is on, as text otherwise.
 *
 * @group Interface
 */
export interface AssistTextBlock extends AssistBlockBase {
    blockType: 'text';
    /** The prose. */
    content: string;
}

/**
 * A fenced code sample, with its own copy button and language label.
 *
 * @group Interface
 */
export interface AssistCodeBlock extends AssistBlockBase {
    blockType: 'code';
    /** The source. */
    content: string;
    /** Language tag, drawn in the block header and used for highlighting. */
    language?: string;
    /** Name shown instead of the language, when the sample belongs to a file. */
    fileName?: string;
    /** Whether the copy button is drawn. Defaults to the component's `allowCopy`. */
    copyable?: boolean;
}

/**
 * The model's reasoning, drawn as a collapsible timeline of stages.
 *
 * @group Interface
 */
export interface AssistThinkingBlock extends AssistBlockBase {
    blockType: 'thinking';
    /** Whether the reasoning is still running. Drives the pulse and the elapsed counter. */
    isActive?: boolean;
    /** Heading of the panel. Falls back to the `thinking` / `thought` locale strings. */
    title?: string;
    /** Free-form reasoning, used when there are no `stages`. */
    content?: string;
    /** The steps, in order. */
    stages?: AssistThinkingStage[];
    /** Whether the panel can be folded away. */
    collapsible?: boolean;
    /** Whether the panel starts folded. */
    collapsed?: boolean;
    /** How long the reasoning took, in milliseconds. Drawn once `isActive` goes false. */
    durationMs?: number;
}

/** Where a reasoning step is in its lifecycle. */
export type AssistThinkingStageStatus = 'completed' | 'inProgress' | 'failed' | 'pending';

/**
 * One step of the reasoning timeline.
 *
 * @group Interface
 */
export interface AssistThinkingStage {
    /** Identity of the step. */
    id?: string;
    /** Where the step is. */
    status?: AssistThinkingStageStatus;
    /** Icon class drawn in the rail, overriding the status icon. */
    iconCss?: string;
    /** What the step says. */
    content?: string;
    /** Resources the step touched, drawn as chips under it. */
    editableContext?: AssistThinkingContextItem[];
    /** How long the step took, in milliseconds. */
    durationMs?: number;
}

/** What kind of resource a reasoning chip points at. */
export type AssistThinkingContextType = 'file' | 'variable' | 'search' | 'tool' | 'result' | 'context';

/** The outcome badge a reasoning chip carries. */
export type AssistThinkingContextBadge = 'none' | 'success' | 'warning' | 'failed';

/**
 * A resource a reasoning step touched: a file read, a variable inspected, a search run.
 *
 * @group Interface
 */
export interface AssistThinkingContextItem {
    /** What kind of resource it is. Picks the default icon. */
    type?: AssistThinkingContextType;
    /** Hover text. */
    tooltipText?: string;
    /** Label of the chip. */
    name?: string;
    /** Value of the chip, drawn after the label. */
    value?: string;
    /** Whether clicking emits `contextClick`. */
    clickable?: boolean;
    /** Outcome indicator. */
    badge?: AssistThinkingContextBadge;
    /** Any extra payload. */
    data?: any;
}

/**
 * A tool the model called, rendered by whatever the application registered for `toolName`.
 *
 * @group Interface
 */
export interface AssistToolBlock extends AssistBlockBase {
    blockType: 'tool';
    /** Which registered renderer draws this block. */
    toolName: string;
    /** What the renderer is given. */
    props?: any;
    /** Where the call is. Drawn as a spinner, a tick or a cross by the supplied renderer. */
    status?: AssistThinkingStageStatus;
    /** Heading of the tool card. */
    title?: string;
    /** What the call returned. */
    result?: any;
    /** Why the call failed. */
    error?: string;
}

/**
 * A failure, drawn inline with a retry affordance.
 *
 * @group Interface
 */
export interface AssistErrorBlock extends AssistBlockBase {
    blockType: 'error';
    /** What went wrong. */
    content: string;
    /** Whether the retry button is drawn. */
    retryable?: boolean;
}

/* -------------------------------------------------------------------------------------------------
 * Views
 * ---------------------------------------------------------------------------------------------- */

/** Whether a view is the conversation itself or an application surface. */
export type AssistViewType = 'assist' | 'custom';

/**
 * One tab of the view switcher.
 *
 * The assistant is rarely alone: settings, history and saved prompts sit beside it. A view is how
 * those surfaces join the same chrome without the application rebuilding the header.
 *
 * @group Interface
 */
export interface AssistView {
    /** Identity of the view. Falls back to its index. */
    id?: string;
    /** `assist` renders the transcript; `custom` renders the application's template. */
    type?: AssistViewType;
    /** Label in the switcher. */
    name?: string;
    /** Icon class in the switcher. */
    iconCss?: string;
    /** Count or dot drawn on the tab. */
    badge?: string | number;
    /** Whether the tab refuses selection. */
    disabled?: boolean;
    /** Any extra payload. */
    data?: any;
}

/* -------------------------------------------------------------------------------------------------
 * Toolbars
 * ---------------------------------------------------------------------------------------------- */

/** What a toolbar entry is. */
export type AssistToolbarItemType = 'button' | 'separator' | 'spacer' | 'template';

/** Which end of the toolbar an entry is pinned to. */
export type AssistToolbarItemAlign = 'left' | 'center' | 'right';

/**
 * One entry of a toolbar — header, prompt, response or footer.
 *
 * The same shape serves all four so a product writes one helper and reuses it, and so
 * `toolbarItemClick` can carry a single payload type.
 *
 * @group Interface
 */
export interface AssistToolbarItem {
    /** Identity of the entry. What `toolbarItemClick` reports. */
    id?: string;
    /** Icon class. */
    iconCss?: string;
    /** Visible label. An entry with neither icon nor text renders nothing. */
    text?: string;
    /** What the entry is. */
    type?: AssistToolbarItemType;
    /** Which end it sits at. */
    align?: AssistToolbarItemAlign;
    /** Whether the entry is drawn. */
    visible?: boolean;
    /** Whether the entry refuses the pointer and the keyboard. */
    disabled?: boolean;
    /** Hover and screen-reader text. */
    tooltip?: string;
    /** Extra classes on the entry. */
    cssClass?: string;
    /** Named template drawn instead of the button, when `type` is `template`. */
    template?: string;
    /** Tab order of the entry. */
    tabIndex?: number;
    /** Whether the entry stays pressed, for a mode switch such as read-aloud. */
    toggle?: boolean;
    /** Whether a toggle entry is currently pressed. */
    active?: boolean;
    /** Any extra payload. */
    data?: any;
}

/** Where the footer toolbar sits relative to the editor. */
export type AssistFooterToolbarPosition = 'inline' | 'bottom';

/**
 * The header toolbar.
 *
 * @group Interface
 */
export interface AssistToolbarOptions {
    /** The entries. */
    items?: AssistToolbarItem[];
    /** Whether the toolbar is drawn at all. */
    visible?: boolean;
}

/**
 * The toolbar that appears on a prompt bubble.
 *
 * @group Interface
 */
export interface AssistPromptToolbarOptions extends AssistToolbarOptions {
    /** Width of the strip. A number is read as pixels. */
    width?: string | number;
    /** Whether the strip only appears while the bubble is hovered or focused. */
    showOnHover?: boolean;
}

/**
 * The toolbar that appears under a response.
 *
 * @group Interface
 */
export interface AssistResponseToolbarOptions extends AssistPromptToolbarOptions {}

/**
 * The toolbar built into the editor.
 *
 * @group Interface
 */
export interface AssistFooterToolbarOptions extends AssistToolbarOptions {
    /** Whether the entries sit on the editor row or on a row of their own beneath it. */
    position?: AssistFooterToolbarPosition;
}

/* -------------------------------------------------------------------------------------------------
 * Attachments
 * ---------------------------------------------------------------------------------------------- */

/** Where one attachment is in its upload. */
export type AssistAttachmentStatus = 'pending' | 'uploading' | 'uploaded' | 'failed' | 'removed';

/**
 * A file travelling with a prompt.
 *
 * @group Interface
 */
export interface AssistAttachment {
    /** Identity of the attachment. */
    id?: string;
    /** File name as shown. */
    name?: string;
    /** Size in bytes. */
    size?: number;
    /** MIME type. */
    type?: string;
    /** Where the upload is. */
    status?: AssistAttachmentStatus;
    /** Upload completion between 0 and 100. */
    progress?: number;
    /** Where the uploaded file ended up, or an object URL for a local preview. */
    url?: string;
    /** The browser file, when the attachment came from the picker or a drop. */
    file?: File;
    /** Why the upload failed. */
    error?: string;
    /** Any extra payload. */
    data?: any;
}

/**
 * How attachments behave.
 *
 * @group Interface
 */
export interface AssistAttachmentOptions {
    /** Where the picked files are POSTed. Left unset, files stay local and the product uploads them. */
    saveUrl?: string;
    /** Where a removal is POSTed. */
    removeUrl?: string;
    /** Accept list, in `<input accept>` syntax. */
    allowedFileTypes?: string;
    /** Largest single file, in bytes. */
    maxFileSize?: number;
    /** How many files one prompt may carry. */
    maximumCount?: number;
    /** Whether dropping files on the transcript attaches them. */
    allowDrop?: boolean;
    /** Whether pasting an image attaches it. */
    allowPaste?: boolean;
    /** Whether an image attachment is drawn as a thumbnail. */
    showPreview?: boolean;
}

/* -------------------------------------------------------------------------------------------------
 * Speech
 * ---------------------------------------------------------------------------------------------- */

/** Where the microphone is. */
export type AssistListeningState = 'inactive' | 'listening' | 'stopped' | 'error';

/**
 * Dictation, over the browser's SpeechRecognition.
 *
 * @group Interface
 */
export interface AssistSpeechToTextOptions {
    /** Whether the microphone button is drawn. */
    enabled?: boolean;
    /** Whether partial results land in the editor as they arrive. */
    allowInterimResults?: boolean;
    /** BCP 47 tag the recogniser listens in. Defaults to the document language. */
    lang?: string;
    /** Whether the button refuses the pointer. */
    disabled?: boolean;
    /** Hover text of the button. */
    tooltip?: string;
    /** Whether a finished dictation sends the prompt without a second click. */
    autoSend?: boolean;
    /** How long a silence ends the dictation, in milliseconds. Zero leaves it running. */
    silenceTimeout?: number;
}

/**
 * Read-aloud, over the browser's SpeechSynthesis.
 *
 * @group Interface
 */
export interface AssistTextToSpeechOptions {
    /** Whether the read-aloud entry is offered on responses. */
    enabled?: boolean;
    /** BCP 47 tag the voice speaks in. */
    lang?: string;
    /** Pitch between 0 and 2. */
    pitch?: number;
    /** Rate between 0.1 and 10. */
    rate?: number;
    /** Volume between 0 and 1. */
    volume?: number;
    /** Name of the voice to pick out of `speechSynthesis.getVoices()`. */
    voice?: string;
    /** Whether every finished answer is read without being asked. */
    autoSpeak?: boolean;
}

/* -------------------------------------------------------------------------------------------------
 * Suggestions, conversations, editor
 * ---------------------------------------------------------------------------------------------- */

/**
 * A canned prompt.
 *
 * Given as a bare string most of the time; the object form is for a suggestion that needs an icon,
 * a description or a payload that differs from its label.
 *
 * @group Interface
 */
export interface AssistSuggestion {
    /** Identity of the suggestion. */
    id?: string;
    /** What the chip says. */
    text?: string;
    /** What is actually sent. Defaults to `text`. */
    prompt?: string;
    /** Secondary line under the label. */
    description?: string;
    /** Icon class on the chip. */
    iconCss?: string;
    /** Whether the chip refuses the pointer. */
    disabled?: boolean;
    /** Any extra payload. */
    data?: any;
}

/**
 * One saved conversation, for the history surface.
 *
 * Beyond the Syncfusion surface: an assistant that keeps nothing is a demo, and every product that
 * ships one ends up writing the same list.
 *
 * @group Interface
 */
export interface AssistConversation {
    /** Identity of the conversation. */
    id: string;
    /** What to call it. Derived from the first prompt when the application omits it. */
    title?: string;
    /** The turns. */
    prompts?: AssistPrompt[];
    /** When it was last written to. */
    updatedAt?: Date | string | number;
    /** Whether it is pinned to the top of the list. */
    pinned?: boolean;
    /** Any extra payload. */
    data?: any;
}

/** Which key sends the prompt. */
export type AssistSendTrigger = 'enter' | 'ctrlEnter' | 'none';

/** How tightly the surface is packed. */
export type AssistDensity = 'comfortable' | 'compact';

/** How a turn is laid out: as a document row, or as a chat bubble. */
export type AssistLayout = 'flat' | 'bubble';

/** When the transcript follows new content. */
export type AssistScrollPolicy = 'always' | 'atBottom' | 'never';

/* -------------------------------------------------------------------------------------------------
 * Event payloads
 * ---------------------------------------------------------------------------------------------- */

/** What every payload carries. @group Interface */
export interface AssistEventBase {
    /** The originating DOM event, when there was one. */
    originalEvent?: Event;
}

/**
 * A prompt is about to be sent.
 *
 * The one cancellable payload: setting `cancel` keeps the turn out of the transcript and leaves the
 * editor untouched, which is how a product runs its own validation.
 *
 * @group Interface
 */
export interface AssistPromptRequestPayload extends AssistEventBase {
    /** What was asked. */
    prompt: string;
    /** Files travelling with it. */
    attachedFiles?: AssistAttachment[];
    /** The turn as it was appended, with its generated id. */
    turn: AssistPrompt;
    /** Where the turn sits in the transcript. */
    index: number;
    /** Whether this is a rerun of an existing turn rather than a new one. */
    regenerate?: boolean;
    /** Set to keep the turn out of the transcript. */
    cancel?: boolean;
    /** Response-toolbar entries for the turn being started. */
    responseToolbarItems?: AssistToolbarItem[];
}

/**
 * The editor's text changed.
 *
 * @group Interface
 */
export interface AssistPromptChangedPayload extends AssistEventBase {
    /** What the editor holds now. */
    value: string;
    /** What it held before. */
    previousValue: string;
}

/**
 * The reader asked for the answer to stop.
 *
 * @group Interface
 */
export interface AssistStopRespondingPayload extends AssistEventBase {
    /** The turn being answered. */
    turn: AssistPrompt;
    /** Where it sits. */
    index: number;
    /** What had been written when the stop landed. */
    partialResponse?: string;
}

/**
 * A toolbar entry was activated.
 *
 * @group Interface
 */
export interface AssistToolbarItemClickPayload extends AssistEventBase {
    /** Which toolbar it came from. */
    toolbar: 'header' | 'prompt' | 'response' | 'footer';
    /** The entry. */
    item: AssistToolbarItem;
    /** The turn the strip belongs to, for the prompt and response toolbars. */
    turn?: AssistPrompt;
    /** Where that turn sits. */
    index?: number;
    /** Set to suppress the built-in behaviour of a known entry such as copy or regenerate. */
    cancel?: boolean;
}

/**
 * A response was marked helpful or not.
 *
 * @group Interface
 */
export interface AssistFeedbackPayload extends AssistEventBase {
    /** The turn. */
    turn: AssistPrompt;
    /** Where it sits. */
    index: number;
    /** What it was marked. `null` when the reader took the mark back. */
    feedback: AssistFeedback;
}

/**
 * Something happened to an attachment.
 *
 * @group Interface
 */
export interface AssistAttachmentPayload extends AssistEventBase {
    /** The attachment. */
    file: AssistAttachment;
    /** Every attachment currently held by the editor. */
    files: AssistAttachment[];
    /** Set, on `beforeAttachmentUpload`, to drop the file. */
    cancel?: boolean;
}

/**
 * A reasoning chip was clicked.
 *
 * @group Interface
 */
export interface AssistContextClickPayload extends AssistEventBase {
    /** The chip. */
    contextItem: AssistThinkingContextItem;
    /** The step it belongs to. */
    stage?: AssistThinkingStage;
    /** The turn the reasoning belongs to. */
    turn?: AssistPrompt;
    /** Where that turn sits. */
    index?: number;
}

/**
 * The view switcher moved.
 *
 * @group Interface
 */
export interface AssistViewChangePayload extends AssistEventBase {
    /** Where it moved to. */
    index: number;
    /** The view now shown. */
    view: AssistView;
    /** Where it was. */
    previousIndex: number;
}

/**
 * The reader stepped through the regenerated answers of one turn.
 *
 * @group Interface
 */
export interface AssistResponseNavigatePayload extends AssistEventBase {
    /** The turn. */
    turn: AssistPrompt;
    /** Where it sits. */
    index: number;
    /** Which answer is shown now, zero-based. */
    responseIndex: number;
    /** How many answers the turn holds. */
    responseCount: number;
}

/**
 * A prompt was rewritten in place.
 *
 * @group Interface
 */
export interface AssistPromptEditPayload extends AssistEventBase {
    /** The turn. */
    turn: AssistPrompt;
    /** Where it sits. */
    index: number;
    /** The rewritten text. */
    prompt: string;
    /** What it said before. */
    previousPrompt: string;
    /** Set to keep the edit out of the transcript. */
    cancel?: boolean;
}

/**
 * A suggestion chip was taken.
 *
 * @group Interface
 */
export interface AssistSuggestionClickPayload extends AssistEventBase {
    /** The chip. */
    suggestion: AssistSuggestion;
    /** Where it sat in the list. */
    index: number;
    /** Set to keep the suggestion out of the editor. */
    cancel?: boolean;
}

/**
 * The reader asked for a turn to be dropped, or for the whole transcript to be.
 *
 * @group Interface
 */
export interface AssistClearPayload extends AssistEventBase {
    /** The turns removed. */
    turns: AssistPrompt[];
    /** Set to keep them. */
    cancel?: boolean;
}

/**
 * Dictation reported something.
 *
 * @group Interface
 */
export interface AssistSpeechPayload extends AssistEventBase {
    /** Where the microphone is. */
    state: AssistListeningState;
    /** What has been heard so far. */
    transcript?: string;
    /** Whether the transcript is still provisional. */
    interim?: boolean;
    /** What went wrong, when `state` is `error`. */
    error?: string;
}

/* -------------------------------------------------------------------------------------------------
 * Streaming
 * ---------------------------------------------------------------------------------------------- */

/**
 * Anything shaped like an RxJS `Observable`.
 *
 * Structural rather than an import, so binding an Angular service's stream costs no dependency on
 * rxjs from this package.
 *
 * @group Interface
 */
export interface AssistSubscribable<T = unknown> {
    /** Starts the stream and hands back whatever cancels it. */
    subscribe(observer: { next?(value: T): void; error?(error: unknown): void; complete?(): void }): { unsubscribe(): void } | (() => void);
}

/**
 * Whatever a provider hands back for an answer that arrives a piece at a time.
 *
 * A `fetch` gives a `Response`; a raw stream gives a `ReadableStream`; the OpenAI and Anthropic SDKs
 * give an async iterable; an Angular service gives an `Observable`. All four go straight into
 * `streamResponse` with nothing in between.
 *
 * @group Types
 */
export type AssistStreamSource = AsyncIterable<unknown> | ReadableStream<string | Uint8Array> | Response | AssistSubscribable<unknown>;

/**
 * How one streamed answer is read.
 *
 * @group Interface
 */
export interface AssistStreamOptions {
    /**
     * Whether the source is framed as Server-Sent Events.
     *
     * With it on, each `data:` payload reaches `transform` as one string and the `[DONE]` sentinel is
     * swallowed — which is the whole of what a hosted model's HTTP stream needs.
     */
    sse?: boolean;
    /**
     * Turns one raw chunk into the text to append.
     *
     * The hook that makes a delta work, whatever shape it arrives in. A hosted model over SSE hands
     * you a JSON string — `(chunk) => JSON.parse(chunk).choices[0].delta.content`. An SDK hands you
     * the object it already parsed — `(chunk) => chunk.delta?.text`. Both reach here untouched.
     *
     * Return nothing to skip the chunk: a keep-alive, a role-only first frame, a usage summary.
     *
     * Without a transform, string chunks are appended as they are and anything else is skipped.
     */
    transform?: (chunk: any) => string | null | undefined;
    /** Cancels the stream from outside. The stop button cancels it from inside regardless. */
    signal?: AbortSignal;
    /**
     * What to show when the stream throws.
     *
     * Left unset, the turn is marked failed and an error block carries the message. Return a string to
     * replace the message, or an empty string to say nothing.
     */
    onError?: (error: unknown) => string;
}

/* -------------------------------------------------------------------------------------------------
 * Imperative handle
 * ---------------------------------------------------------------------------------------------- */

/**
 * What a template reference on the component can do.
 *
 * The declarative inputs cover the steady state; this covers the moments a conversation is driven
 * from code — a streamed answer arriving chunk by chunk, a prompt sent from a shortcut elsewhere on
 * the page, a transcript restored from storage.
 *
 * @group Interface
 */
export interface AssistViewExpose {
    /** Sends `prompt` as though the reader had typed it. */
    executePrompt(prompt: string, attachedFiles?: AssistAttachment[]): void;
    /**
     * Answers the turn that is waiting.
     *
     * Called repeatedly while streaming: each call replaces the text of the open turn, and the call
     * with `isFinalUpdate` left at its default closes it.
     */
    addPromptResponse(response: string | AssistResponseBlock[], isFinalUpdate?: boolean): void;
    /** Appends to the open turn instead of replacing it. The streaming path that costs no string joins. */
    appendPromptResponse(chunk: string): void;
    /**
     * Reads a whole streamed answer into the open turn, chunk by chunk.
     *
     * The one call a streaming assistant needs: it accepts every source shape a provider hands back,
     * appends each delta as it lands, closes the turn when the stream ends, marks it failed when the
     * stream throws, and stops when the reader presses stop.
     *
     * Resolves once the turn is closed. It does not reject on a stream error — the failure is already
     * on screen by then, and a rejection would make every call site write a `catch` that does nothing.
     */
    streamResponse(source: AssistStreamSource, options?: AssistStreamOptions): Promise<void>;
    /** Patches one block of the open turn, matched by `id`. */
    updateBlock(block: AssistResponseBlock): void;
    /** Rewrites one turn of the transcript. */
    updateTurn(index: number, changes: Partial<AssistPrompt>): void;
    /** Ends the open answer as though the stop button had been pressed. */
    stopResponding(): void;
    /** Reruns one turn, keeping the earlier answer as a regeneration. */
    regenerate(index?: number): void;
    /** Empties the transcript. */
    clear(): void;
    /** Drops one turn. */
    removeTurn(index: number): void;
    /** Scrolls the transcript to its newest turn. */
    scrollToBottom(behavior?: ScrollBehavior): void;
    /** Scrolls one turn into view. */
    scrollToTurn(index: number, behavior?: ScrollBehavior): void;
    /** Puts the caret in the editor. */
    focusEditor(): void;
    /** Starts dictation. */
    startListening(): void;
    /** Ends dictation. */
    stopListening(): void;
    /** Reads a turn's answer aloud. Defaults to the newest. */
    speak(index?: number): void;
    /** Stops reading. */
    stopSpeaking(): void;
    /** The transcript as markdown, for download or the clipboard. */
    exportTranscript(format?: 'markdown' | 'text' | 'json'): string;
}

/* -------------------------------------------------------------------------------------------------
 * Passthrough
 * ---------------------------------------------------------------------------------------------- */

/**
 * Custom passthrough options of the AIAssistView root.
 *
 * @see {@link AssistViewPassThrough}
 * @group Interface
 */
export interface AssistViewPassThroughOptions<I = unknown> {
    /** Used to pass attributes to the root's DOM element. */
    root?: PassThroughOption<HTMLElement, I>;
    /** Used to pass attributes to the header's DOM element. */
    header?: PassThroughOption<HTMLElement, I>;
    /** Used to pass attributes to the view switcher's DOM element. */
    views?: PassThroughOption<HTMLElement, I>;
    /** Used to pass attributes to the scrolling transcript's DOM element. */
    content?: PassThroughOption<HTMLElement, I>;
    /** Used to pass attributes to the banner's DOM element. */
    banner?: PassThroughOption<HTMLElement, I>;
    /** Used to pass attributes to a prompt bubble's DOM element. */
    prompt?: PassThroughOption<HTMLElement, I>;
    /** Used to pass attributes to a response's DOM element. */
    response?: PassThroughOption<HTMLElement, I>;
    /** Used to pass attributes to the suggestion list's DOM element. */
    suggestions?: PassThroughOption<HTMLElement, I>;
    /** Used to pass attributes to the footer's DOM element. */
    footer?: PassThroughOption<HTMLElement, I>;
    /** Used to pass attributes to the editor's DOM element. */
    editor?: PassThroughOption<HTMLTextAreaElement, I>;
}

/**
 * Custom passthrough of the AIAssistView root.
 *
 * @see {@link AssistViewPassThroughOptions}
 * @group Types
 */
export type AssistViewPassThrough<I = unknown> = PassThrough<I, AssistViewPassThroughOptions<I>>;

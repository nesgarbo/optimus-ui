import { DOCUMENT, NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, PLATFORM_ID, ViewEncapsulation, booleanAttribute, computed, contentChild, contentChildren, effect, inject, input, model, output, untracked, viewChild } from '@angular/core';
import { BaseComponent, PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { Bind } from '@openng/optimus-ui/bind';
import { Button } from '@openng/optimus-ui/button';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import type {
    AssistAttachment,
    AssistAttachmentOptions,
    AssistAttachmentPayload,
    AssistClearPayload,
    AssistContextClickPayload,
    AssistDensity,
    AssistFeedback,
    AssistFeedbackPayload,
    AssistFooterToolbarOptions,
    AssistLayout,
    AssistPrompt,
    AssistPromptChangedPayload,
    AssistPromptEditPayload,
    AssistPromptRequestPayload,
    AssistResponseBlock,
    AssistResponseNavigatePayload,
    AssistScrollPolicy,
    AssistSendTrigger,
    AssistSpeechPayload,
    AssistSpeechToTextOptions,
    AssistStopRespondingPayload,
    AssistStreamOptions,
    AssistStreamSource,
    AssistSuggestion,
    AssistSuggestionClickPayload,
    AssistTextToSpeechOptions,
    AssistToolbarItem,
    AssistToolbarItemClickPayload,
    AssistToolbarOptions,
    AssistView,
    AssistViewChangePayload,
    AssistViewExpose,
    AssistViewPassThrough
} from '@openng/optimus-ui/types/aiassistview';
import { AssistAttachments } from './aiassistview-attachments';
import { copyToClipboard } from './aiassistview-clipboard';
import { ASSIST_COMMANDS, type AssistCommands } from './aiassistview-context';
import { AssistGlyph } from './aiassistview-icons';
import { blocksToPlainText } from './aiassistview-markdown';
import { AssistTurn } from './aiassistview-message';
import { assistChunks, assistSseEvents } from './aiassistview-stream';
import { AssistBanner, AssistFooter, AssistHeader, AssistSuggestions } from './aiassistview-parts';
import {
    ASSIST_TEMPLATES,
    AssistAttachmentDef,
    AssistBannerDef,
    AssistBlockDef,
    AssistFooterDef,
    AssistHeaderDef,
    AssistPromptDef,
    AssistResponseDef,
    AssistStageDef,
    AssistSuggestionDef,
    AssistToolDef,
    AssistToolbarItemDef,
    AssistViewDef,
    type AssistTemplates
} from './aiassistview-registry';
import { ASSIST_DEFAULT_LABELS, ASSIST_STATE, AssistState, type AssistLabelOverrides, type AssistLabels, assistId, assistTurnKey, formatLabel } from './aiassistview-state';
import { AssistSpeech } from './aiassistview-speech';
import { AIAssistViewStyle } from './style/aiassistviewstyle';

/**
 * AIAssistView: a conversational assistant surface.
 *
 * The component owns the transcript, the composer, the streaming lifecycle, the reasoning and tool
 * rendering, attachments, dictation and read-aloud, the accessibility contract and the keyboard. What
 * it does NOT own is the model: every answer arrives through `promptRequest` and goes back through
 * the handle, because there is no shape of AI back end this component could sensibly assume.
 *
 * Three ways to use it, in rising order of control:
 *
 * 1. Bind `[prompts]` and answer `promptRequest` with `addPromptResponse`. Everything else is drawn.
 * 2. Add `*Def` templates to replace a bubble, a block, a tool card, the banner or the whole footer.
 * 3. Drop the supplied parts entirely and compose `p-assist-header`, `p-assist-turn`,
 *    `p-assist-footer` yourself — they read the same state and call the same commands.
 *
 * @group Components
 */
@Component({
    selector: 'p-aiassistview',
    standalone: true,
    exportAs: 'pAssistView',
    imports: [AssistBanner, AssistFooter, AssistGlyph, AssistHeader, AssistSuggestions, AssistTurn, Button, NgTemplateOutlet, Tooltip],
    template: `
        @if (showHeader()) {
            <p-assist-header [heading]="heading()" [idPrefix]="assistId" />
        }

        <div class="p-aiassistview-body">
            @if (state.assistViewActive()) {
                <div
                    #content
                    class="p-aiassistview-content"
                    role="log"
                    aria-live="polite"
                    aria-relevant="additions text"
                    [id]="panelId()"
                    [attr.aria-labelledby]="tabId()"
                    [attr.aria-label]="tabId() ? null : state.labels().transcriptLabel"
                    [attr.aria-busy]="state.busy() ? 'true' : null"
                    (scroll)="onScroll()"
                >
                    @if (state.empty()) {
                        <p-assist-banner />
                    } @else {
                        <div class="p-aiassistview-turns">
                            @for (turn of state.prompts(); track trackTurn($index, turn)) {
                                <p-assist-turn [turn]="turn" [index]="$index" [showAvatars]="showAvatars()" [promptIconCss]="promptIconCss()" [responseIconCss]="responseIconCss()" [showOnHover]="toolbarOnHover()" [markdown]="renderMarkdown()" />
                            }
                        </div>
                    }

                    @if (state.suggestions().length && suggestionsVisible()) {
                        <p-assist-suggestions [header]="suggestionsHeader()" />
                    }
                </div>

                @if (enableScrollToBottom() && state.scrolledAway()) {
                    <p-button
                        class="p-aiassistview-scroll-bottom"
                        [rounded]="true"
                        [raised]="true"
                        severity="secondary"
                        size="small"
                        [ariaLabel]="state.labels().scrollToBottom"
                        [pTooltip]="state.labels().scrollToBottom"
                        tooltipPosition="top"
                        (onClick)="scrollToBottom()"
                    >
                        <p-assist-glyph name="arrow-down" />
                    </p-button>
                }
            } @else {
                <div class="p-aiassistview-custom-view" role="tabpanel" [id]="panelId()" [attr.aria-labelledby]="tabId()">
                    @if (activeViewTemplate(); as definition) {
                        <ng-container *ngTemplateOutlet="definition; context: activeViewContext()" />
                    } @else {
                        <ng-content />
                    }
                </div>
            }
        </div>

        @if (showFooter() && state.assistViewActive()) {
            <p-assist-footer #footer [placeholder]="promptPlaceholder()" [speechEnabled]="speechAvailable()" [showHint]="showSendHint()" (pasted)="onPaste($event)" />
        }

        <div role="status" aria-live="polite" aria-atomic="true" class="p-aiassistview-live-region">{{ state.liveMessage() }}</div>
        <div role="alert" aria-live="assertive" aria-atomic="true" class="p-aiassistview-live-region">{{ state.alertMessage() }}</div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        AIAssistViewStyle,
        AssistSpeech,
        AssistAttachments,
        { provide: PARENT_INSTANCE, useExisting: AIAssistView },
        { provide: ASSIST_STATE, useFactory: () => inject(AIAssistView).assistState },
        { provide: ASSIST_COMMANDS, useFactory: () => inject(AIAssistView).commands },
        { provide: ASSIST_TEMPLATES, useFactory: () => inject(AIAssistView).assistTemplates }
    ],
    host: {
        '[class]': 'cx("root")',
        'data-scope': 'aiassistview',
        'data-part': 'root',
        '[attr.dir]': 'rtl() ? "rtl" : null',
        '[attr.aria-busy]': 'assistState.busy() ? "true" : null',
        '[style.width]': 'widthStyle()',
        '[style.height]': 'heightStyle()',
        '(dragover)': 'onDragOver($event)',
        '(dragleave)': 'onDragLeave($event)',
        '(drop)': 'onDrop($event)'
    },
    hostDirectives: [Bind]
})
export class AIAssistView extends BaseComponent<AssistViewPassThrough> implements AssistViewExpose {
    componentName = 'AIAssistView';

    /** @internal */
    _componentStyle = inject(AIAssistViewStyle);

    private readonly bindDirectiveInstance = inject(Bind, { self: true });
    private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
    private readonly documentRef = inject(DOCUMENT);
    private readonly destroyRef = inject(DestroyRef);
    private readonly speech = inject(AssistSpeech);
    private readonly attachmentsService = inject(AssistAttachments);

    /** @internal Identity of this assistant, used to build the tab panel ids. */
    readonly assistId = assistId('assist');

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    // ---------------------------------------------------------------------------------------------
    // Data
    // ---------------------------------------------------------------------------------------------

    /**
     * The transcript. Supports `[(prompts)]`.
     *
     * Bind `(promptsChange)` and the component appends turns, patches answers and applies edits
     * itself. Left unbound it still emits the next array, so a store can own the writes.
     * @group Props
     */
    readonly prompts = model<AssistPrompt[]>([]);
    /**
     * What the editor holds. Supports `[(prompt)]`.
     * @group Props
     */
    readonly prompt = model<string>('');
    /**
     * Which view is showing. Supports `[(activeView)]`.
     * @group Props
     */
    readonly activeView = model<number>(0);
    /**
     * Placeholder of the editor.
     * @group Props
     */
    readonly promptPlaceholder = input<string>('');
    /**
     * The canned prompts. Bare strings, or objects carrying an icon and a description.
     * @group Props
     */
    readonly promptSuggestions = input<(string | AssistSuggestion)[] | undefined>(undefined);
    /**
     * Heading over the suggestion chips.
     * @group Props
     */
    readonly promptSuggestionsHeader = input<string | undefined>(undefined);
    /**
     * When the suggestion chips are drawn: only before the first turn, always, or never.
     * @group Props
     */
    readonly suggestionsMode = input<'empty' | 'always' | 'never'>('empty');
    /**
     * The tabs of the view switcher. With fewer than two, no switcher is drawn.
     * @group Props
     */
    readonly views = input<AssistView[] | undefined>(undefined);
    /**
     * What the header says.
     * @group Props
     */
    readonly heading = input<string | undefined>(undefined);
    /**
     * Whether the header is drawn at all.
     * @group Props
     */
    readonly showHeader = input(true, { transform: booleanAttribute });
    /**
     * Whether the composer is drawn at all. Off for a read-only transcript.
     * @group Props
     */
    readonly showFooter = input(true, { transform: booleanAttribute });
    /**
     * Whether the avatars are drawn beside the messages.
     * @group Props
     */
    readonly showAvatars = input(true, { transform: booleanAttribute });
    /**
     * Whether the editor carries a line explaining which key sends.
     * @group Props
     */
    readonly showSendHint = input(false, { transform: booleanAttribute });
    /**
     * Icon class of the asking avatar.
     * @group Props
     */
    readonly promptIconCss = input<string | undefined>(undefined);
    /**
     * Icon class of the answering avatar.
     * @group Props
     */
    readonly responseIconCss = input<string | undefined>(undefined);

    // ---------------------------------------------------------------------------------------------
    // Behaviour
    // ---------------------------------------------------------------------------------------------

    /**
     * Whether the component owns the mutations.
     *
     * Left on, it appends turns and patches answers itself. Turned off it renders `prompts` and does
     * nothing else, emitting its outputs as REQUESTS for a store to apply.
     * @group Props
     */
    readonly managed = input(true, { transform: booleanAttribute });
    /**
     * Whether nothing at all responds to the pointer.
     * @group Props
     */
    readonly disabled = input(false, { transform: booleanAttribute });
    /**
     * Whether the transcript refuses edits, deletions and regeneration while still taking prompts.
     * @group Props
     */
    readonly readonly = input(false, { transform: booleanAttribute });
    /**
     * Whether the surface is laid out right to left.
     * @group Props
     */
    readonly rtl = input(false, { transform: booleanAttribute });
    /**
     * Whether an answer arrives in pieces. Drives the caret and the stop button.
     * @group Props
     */
    readonly enableStreaming = input(false, { transform: booleanAttribute });
    /**
     * Whether answer text is read as markdown.
     * @group Props
     */
    readonly renderMarkdown = input(true, { transform: booleanAttribute });
    /**
     * Whether the scroll-to-newest button appears once the transcript is scrolled away.
     * @group Props
     */
    readonly enableScrollToBottom = input(true, { transform: booleanAttribute });
    /**
     * When the transcript follows new content.
     *
     * `atBottom` — the default — follows only while the reader is already at the end, which is what
     * stops a streaming answer from yanking them away from something they had scrolled back to read.
     * @group Props
     */
    readonly scrollPolicy = input<AssistScrollPolicy>('atBottom');
    /**
     * Which key sends the prompt.
     * @group Props
     */
    readonly sendTrigger = input<AssistSendTrigger>('enter');
    /**
     * How tightly the surface is packed.
     * @group Props
     */
    readonly density = input<AssistDensity>('comfortable');
    /**
     * How a turn is drawn.
     *
     * `flat` — the default — lays the transcript out the way the rest of the library lays out a
     * comment thread or a timeline: an avatar, an author, and the text. `bubble` opts into the
     * familiar chat shape, with the reader's message right-aligned in a tinted lozenge.
     * @group Props
     */
    readonly layout = input<AssistLayout>('flat');
    /**
     * Whether the message toolbars wait for a hover before appearing.
     * @group Props
     */
    readonly toolbarOnHover = input(true, { transform: booleanAttribute });
    /**
     * Width of the surface. A number is read as pixels.
     * @group Props
     */
    readonly width = input<string | number | undefined>(undefined);
    /**
     * Height of the surface. A number is read as pixels.
     * @group Props
     */
    readonly height = input<string | number | undefined>(undefined);
    /**
     * Chrome strings, merged over the built-in English ones.
     * @group Props
     */
    readonly labels = input<AssistLabelOverrides | undefined>(undefined);

    // ---------------------------------------------------------------------------------------------
    // Toolbars
    // ---------------------------------------------------------------------------------------------

    /**
     * The header toolbar.
     * @group Props
     */
    readonly toolbarSettings = input<AssistToolbarOptions | undefined>(undefined);
    /**
     * The toolbar built into the editor.
     * @group Props
     */
    readonly footerToolbarSettings = input<AssistFooterToolbarOptions | undefined>(undefined);
    /**
     * Entries offered on a prompt bubble. Left unset, the stock edit entry is offered.
     * @group Props
     */
    readonly promptToolbarItems = input<AssistToolbarItem[] | undefined>(undefined);
    /**
     * Entries offered under a response. Left unset, the stock copy, feedback and regenerate entries
     * are offered, plus read-aloud when speech is on.
     * @group Props
     */
    readonly responseToolbarItems = input<AssistToolbarItem[] | undefined>(undefined);

    // ---------------------------------------------------------------------------------------------
    // Attachments and speech
    // ---------------------------------------------------------------------------------------------

    /**
     * Whether the editor offers the paperclip.
     * @group Props
     */
    readonly enableAttachments = input(false, { transform: booleanAttribute });
    /**
     * How attachments behave.
     * @group Props
     */
    readonly attachmentSettings = input<AssistAttachmentOptions | undefined>(undefined);
    /**
     * Dictation.
     * @group Props
     */
    readonly speechToTextSettings = input<AssistSpeechToTextOptions | undefined>(undefined);
    /**
     * Read-aloud.
     * @group Props
     */
    readonly textToSpeechSettings = input<AssistTextToSpeechOptions | undefined>(undefined);

    // ---------------------------------------------------------------------------------------------
    // Outputs
    // ---------------------------------------------------------------------------------------------

    /** Fired before a prompt is appended. Setting `cancel` keeps it out of the transcript. @group Emits */
    readonly promptRequest = output<AssistPromptRequestPayload>();
    /** Fired when the editor's text changes. @group Emits */
    readonly promptChanged = output<AssistPromptChangedPayload>();
    /** Fired when the reader asks for the answer to stop. @group Emits */
    readonly stopRespondingClick = output<AssistStopRespondingPayload>();
    /** Fired when a toolbar entry is activated. @group Emits */
    readonly toolbarItemClick = output<AssistToolbarItemClickPayload>();
    /** Fired when a response is marked helpful or not. @group Emits */
    readonly feedbackChange = output<AssistFeedbackPayload>();
    /** Fired when a clickable reasoning chip is activated. @group Emits */
    readonly contextClick = output<AssistContextClickPayload>();
    /** Fired when the view switcher moves. @group Emits */
    readonly viewChange = output<AssistViewChangePayload>();
    /** Fired when the reader steps through regenerated answers. @group Emits */
    readonly responseNavigate = output<AssistResponseNavigatePayload>();
    /** Fired before an edited prompt is applied. @group Emits */
    readonly promptEdit = output<AssistPromptEditPayload>();
    /** Fired when a suggestion chip is taken. @group Emits */
    readonly suggestionClick = output<AssistSuggestionClickPayload>();
    /** Fired before the transcript, or one turn, is emptied. @group Emits */
    readonly clearRequest = output<AssistClearPayload>();
    /** Fired before an attachment is uploaded. @group Emits */
    readonly beforeAttachmentUpload = output<AssistAttachmentPayload>();
    /** Fired when an attachment finishes uploading. @group Emits */
    readonly attachmentUploadSuccess = output<AssistAttachmentPayload>();
    /** Fired when an attachment fails to upload, or is turned away by the rules. @group Emits */
    readonly attachmentUploadFailure = output<AssistAttachmentPayload>();
    /** Fired when an attachment is taken back out of the editor. @group Emits */
    readonly attachmentRemoved = output<AssistAttachmentPayload>();
    /** Fired as dictation starts, hears and stops. @group Emits */
    readonly speechChange = output<AssistSpeechPayload>();

    // ---------------------------------------------------------------------------------------------
    // Templates
    // ---------------------------------------------------------------------------------------------

    private readonly promptDef = contentChild(AssistPromptDef);
    private readonly responseDef = contentChild(AssistResponseDef);
    private readonly blockDef = contentChild(AssistBlockDef);
    private readonly toolDefs = contentChildren(AssistToolDef);
    private readonly stageDef = contentChild(AssistStageDef);
    private readonly suggestionDef = contentChild(AssistSuggestionDef);
    private readonly viewDefs = contentChildren(AssistViewDef);
    private readonly toolbarItemDefs = contentChildren(AssistToolbarItemDef);
    private readonly attachmentDef = contentChild(AssistAttachmentDef);
    private readonly bannerDef = contentChild(AssistBannerDef);
    private readonly footerDef = contentChild(AssistFooterDef);
    private readonly headerDef = contentChild(AssistHeaderDef);

    /** @internal What the parts read instead of querying for templates themselves. */
    readonly assistTemplates: AssistTemplates = {
        prompt: this.promptDef,
        response: this.responseDef,
        block: this.blockDef,
        tools: this.toolDefs,
        stage: this.stageDef,
        suggestion: this.suggestionDef,
        views: this.viewDefs,
        toolbarItems: this.toolbarItemDefs,
        attachment: this.attachmentDef,
        banner: this.bannerDef,
        footer: this.footerDef,
        header: this.headerDef
    };

    private readonly contentRef = viewChild<ElementRef<HTMLElement>>('content');
    private readonly footerRef = viewChild(AssistFooter);

    // ---------------------------------------------------------------------------------------------
    // Resolved configuration
    // ---------------------------------------------------------------------------------------------

    /** @internal The chrome strings, merged over the defaults. */
    protected readonly resolvedLabels = computed<AssistLabels>(() => ({ ...ASSIST_DEFAULT_LABELS, ...(this.labels() ?? {}) }));

    /** @internal Whether the browser can take dictation and the application asked for it. */
    protected readonly speechAvailable = computed(() => (this.speechToTextSettings()?.enabled ?? false) && this.speech.recognitionSupported);

    /** @internal Whether read-aloud is on offer. */
    private readonly readAloudAvailable = computed(() => (this.textToSpeechSettings()?.enabled ?? false) && this.speech.synthesisSupported);

    /**
     * @internal
     *
     * The stock prompt entries. Only `edit`, because everything else a prompt bubble could offer —
     * copying the question back, deleting the turn — is product policy rather than a default.
     */
    private readonly resolvedPromptItems = computed<AssistToolbarItem[]>(() => {
        const configured = this.promptToolbarItems();

        if (configured) return configured;
        if (this.readonly() || this.disabled()) return [];

        return [{ id: 'edit', tooltip: this.resolvedLabels().edit }];
    });

    /** @internal The stock response entries. */
    private readonly resolvedResponseItems = computed<AssistToolbarItem[]>(() => {
        const configured = this.responseToolbarItems();

        if (configured) return configured;

        const labels = this.resolvedLabels();
        const items: AssistToolbarItem[] = [
            { id: 'copy', tooltip: labels.copy },
            { id: 'like', tooltip: labels.like },
            { id: 'dislike', tooltip: labels.dislike }
        ];

        if (this.readAloudAvailable()) items.push({ id: 'readAloud', tooltip: labels.readAloud });
        if (!this.readonly()) items.push({ id: 'regenerate', tooltip: labels.regenerate });

        return items;
    });

    /** @internal */
    protected readonly suggestionsVisible = computed(() => {
        const mode = this.suggestionsMode();

        return mode === 'always' || (mode === 'empty' && this.state.empty());
    });

    /** @internal */
    protected readonly suggestionsHeader = computed(() => this.promptSuggestionsHeader() ?? this.resolvedLabels().suggestionsHeader);

    /** @internal */
    protected readonly widthStyle = computed(() => sizeToStyle(this.width()));

    /** @internal */
    protected readonly heightStyle = computed(() => sizeToStyle(this.height()));

    /**
     * @internal
     *
     * The id each tab's `aria-controls` points at. The header hands the tabs this assistant's id, so
     * the panel rendered here — outside any `p-tabpanels`, because the composer has to stay out of the
     * switcher — is the element they name.
     */
    protected readonly panelId = computed(() => `${this.assistId}_tabpanel_${this.state.activeView()}`);

    /** @internal The tab that labels the panel, when there is a switcher at all. */
    protected readonly tabId = computed(() => (this.state.views().length > 1 ? `${this.assistId}_tab_${this.state.activeView()}` : null));

    /** @internal The body of whichever custom view is showing. */
    protected readonly activeViewTemplate = computed(() => {
        const view = this.state.views()[this.state.activeView()];

        if (!view) return undefined;

        const definitions = this.viewDefs();
        const named = definitions.find((definition) => definition.pAssistViewDef() === view.id);

        return (named ?? definitions.find((definition) => !definition.pAssistViewDef()))?.template;
    });

    /** @internal */
    protected activeViewContext() {
        const index = this.state.activeView();
        const view = this.state.views()[index];

        return { $implicit: view, view, index };
    }

    // ---------------------------------------------------------------------------------------------
    // Runtime
    // ---------------------------------------------------------------------------------------------

    /** The shared runtime, provided through `ASSIST_STATE`. */
    readonly assistState = new AssistState({
        prompts: computed(() => this.prompts()),
        setPrompts: (next) => this.prompts.set(next),
        prompt: computed(() => this.prompt()),
        setPrompt: (next) => this.setPromptValue(next),
        activeView: computed(() => this.activeView()),
        setActiveView: (next) => this.selectView(next),
        views: computed(() => this.views()),
        suggestions: computed(() => this.promptSuggestions()),
        labels: this.resolvedLabels,
        disabled: computed(() => this.disabled()),
        readonly: computed(() => this.readonly()),
        streaming: computed(() => this.enableStreaming()),
        attachments: computed(() => this.enableAttachments()),
        attachmentOptions: computed(() => this.attachmentSettings()),
        toolbar: computed(() => this.toolbarSettings()),
        footerToolbar: computed(() => this.footerToolbarSettings()),
        promptToolbarItems: this.resolvedPromptItems,
        responseToolbarItems: this.resolvedResponseItems,
        density: computed(() => this.density()),
        layout: computed(() => this.layout()),
        scrollPolicy: computed(() => this.scrollPolicy()),
        sendTrigger: computed(() => this.sendTrigger())
    });

    /** @internal The template reads it under a shorter name. */
    protected readonly state = this.assistState;

    /** @internal What the transcript scroll effect compares against to notice new content. */
    private lastTurnSignature = '';

    /** The ticker behind the reasoning panels' elapsed counter. */
    private thinkingTimer: ReturnType<typeof setInterval> | null = null;

    /** What the editor last held, so `promptChanged` can carry the previous value. */
    private previousPrompt = '';

    /** Cancels the stream currently being read, if any. */
    private streamAbort: AbortController | null = null;

    constructor() {
        super();

        // Following the newest content. Reads the transcript so it runs on every write, and decides
        // whether to move based on where the reader already was — a stream must not drag them away
        // from something they scrolled back to.
        effect(() => {
            const turns = this.state.prompts();
            const signature = `${turns.length}:${turns[turns.length - 1]?.response?.length ?? 0}:${turns[turns.length - 1]?.blocks?.length ?? 0}`;

            if (signature === this.lastTurnSignature) return;

            this.lastTurnSignature = signature;

            untracked(() => {
                const policy = this.scrollPolicy();

                if (policy === 'never') return;
                if (policy === 'atBottom' && this.state.scrolledAway()) return;

                this.scrollToBottom();
            });
        });

        // The elapsed counter runs while — and only while — a reasoning panel is open, so an idle
        // assistant holds no interval at all.
        effect(() => {
            const running = this.state.busy() && this.hasActiveThinking();

            untracked(() => this.setThinkingTimer(running));
        });

        this.destroyRef.onDestroy(() => {
            this.streamAbort?.abort();
            this.setThinkingTimer(false);
            this.speech.dispose();
            this.attachmentsService.dispose();
        });
    }

    /** @internal */
    protected trackTurn(index: number, turn: AssistPrompt): string {
        return assistTurnKey(index, turn);
    }

    // ---------------------------------------------------------------------------------------------
    // Commands
    // ---------------------------------------------------------------------------------------------

    /** @internal What the supplied parts call, provided through `ASSIST_COMMANDS`. */
    readonly commands: AssistCommands = {
        send: (prompt) => this.send(prompt),
        stop: () => this.stopResponding(),
        regenerate: (index) => this.regenerate(index),
        copyTurn: (index) => void this.copyTurn(index),
        feedback: (index, feedback) => this.applyFeedback(index, feedback),
        beginEdit: (index) => this.beginEdit(index),
        commitEdit: (index, prompt) => this.commitEdit(index, prompt),
        cancelEdit: () => this.cancelEdit(),
        deleteTurn: (index) => this.deleteTurn(index),
        toggleSpeech: (index) => this.speak(index),
        navigateResponse: (index, delta) => this.navigateResponse(index, delta),
        retry: (index) => this.regenerate(index),
        toolbarItemClick: (payload) => this.onToolbarItemClick(payload),
        contextClick: (payload) => this.contextClick.emit(payload),
        suggestionClick: (suggestion, index) => this.takeSuggestion(suggestion, index),
        pickFiles: () => this.pickFiles(),
        removeAttachment: (id) => this.removeAttachment(id),
        toggleListening: () => this.toggleListening(),
        scrollToBottom: () => this.scrollToBottom()
    };

    /**
     * Sends a prompt.
     *
     * The one place a turn is created. `promptRequest` fires BEFORE the turn is appended so a
     * cancelling handler leaves the editor exactly as it was, which is what a product validating the
     * prompt needs.
     */
    private send(prompt?: string, options: { regenerate?: boolean; atIndex?: number } = {}): void {
        if (this.disabled() || this.state.busy()) return;

        const text = (prompt ?? this.prompt()).trim();
        const files = this.state.pendingAttachments();

        if (!text && files.length === 0) return;

        const turn: AssistPrompt = {
            id: assistId('turn'),
            prompt: text,
            attachedFiles: files.length ? files : undefined,
            status: 'pending',
            createdAt: Date.now()
        };

        const index = options.atIndex ?? this.state.prompts().length;
        const payload: AssistPromptRequestPayload = {
            prompt: text,
            attachedFiles: files.length ? files : undefined,
            turn,
            index,
            regenerate: options.regenerate,
            responseToolbarItems: undefined
        };

        this.promptRequest.emit(payload);

        if (payload.cancel) return;

        if (payload.responseToolbarItems) turn.toolbarItems = payload.responseToolbarItems;

        if (this.managed()) {
            if (options.regenerate && options.atIndex != null) this.state.patchTurn(options.atIndex, { status: 'pending' });
            else this.state.appendTurn(turn);
        }

        this.state.activeTurnIndex.set(index);
        this.state.clearAttachments();

        if (prompt == null) this.setPromptValue('');

        this.state.announce(this.resolvedLabels().promptSent);
    }

    /** Ends the open answer as though the stop button had been pressed. */
    stopResponding(event?: Event): void {
        const index = this.state.activeTurnIndex();
        const turn = this.state.prompts()[index];

        if (index < 0 || !turn) return;

        this.stopRespondingClick.emit({ originalEvent: event, turn, index, partialResponse: turn.response });

        // A stream still pulling from the network has to be told, or the turn closes and the chunks
        // keep arriving into a turn that is no longer open.
        this.streamAbort?.abort();

        if (this.managed()) this.state.finishTurn(index, 'stopped');
        else this.state.activeTurnIndex.set(-1);
    }

    /**
     * Reruns one turn.
     *
     * The answer already on screen is pushed into `regeneratedResponses` first, so the reader can step
     * back to it — a regeneration that throws the previous answer away is the one thing every reader
     * complains about.
     */
    regenerate(index?: number): void {
        const position = index ?? this.state.prompts().length - 1;
        const turn = this.state.prompts()[position];

        if (!turn || this.state.busy() || this.readonly()) return;

        if (this.managed()) {
            const earlier = this.state.responsesOf(turn).filter(Boolean);

            this.state.patchTurn(position, { regeneratedResponses: earlier, response: '', blocks: undefined, activeResponseIndex: earlier.length, status: 'pending', error: undefined });
        }

        this.send(turn.prompt ?? '', { regenerate: true, atIndex: position });
    }

    /** Puts one turn's answer on the clipboard. */
    private async copyTurn(index: number): Promise<void> {
        const turn = this.state.prompts()[index];

        if (!turn) return;

        const text = blocksToPlainText(turn.blocks, this.state.visibleResponseOf(turn));

        if (await copyToClipboard(this.documentRef, text)) {
            this.state.flash(`response:${index}:copy`);
            this.state.announce(this.resolvedLabels().copied);
            setTimeout(() => this.state.flashedItem.set(null), 1600);
        }
    }

    /** Marks a turn helpful or not. */
    private applyFeedback(index: number, feedback: Exclude<AssistFeedback, null>): void {
        const turn = this.state.prompts()[index];

        if (!turn) return;

        const next = this.managed() ? this.state.toggleFeedback(index, feedback) : turn.isResponseHelpful === feedback ? null : feedback;

        this.feedbackChange.emit({ turn: this.state.prompts()[index] ?? turn, index, feedback: next });
    }

    /** Opens one turn's prompt for rewriting. */
    private beginEdit(index: number): void {
        const turn = this.state.prompts()[index];

        if (!turn || this.readonly() || turn.readonly) return;

        this.state.editingIndex.set(index);
        this.state.editingValue.set(turn.prompt ?? '');
    }

    /** Accepts a rewritten prompt and reruns the turn. */
    private commitEdit(index: number, prompt: string): void {
        const turn = this.state.prompts()[index];

        if (!turn) return;

        const payload: AssistPromptEditPayload = { turn, index, prompt: prompt.trim(), previousPrompt: turn.prompt ?? '' };

        this.promptEdit.emit(payload);

        if (payload.cancel) return;

        this.state.editingIndex.set(-1);

        if (this.managed()) {
            // Everything after the edited turn is now an answer to a question that was never asked.
            this.state.setPrompts(this.state.prompts().slice(0, index + 1));
            this.state.patchTurn(index, { prompt: payload.prompt, response: '', blocks: undefined, regeneratedResponses: undefined, activeResponseIndex: undefined, status: 'pending' });
        }

        this.send(payload.prompt, { regenerate: true, atIndex: index });
    }

    /** Abandons a rewrite. */
    private cancelEdit(): void {
        this.state.editingIndex.set(-1);
        this.state.editingValue.set('');
    }

    /** Drops one turn. */
    private deleteTurn(index: number): void {
        const turn = this.state.prompts()[index];

        if (!turn || this.readonly()) return;

        const payload: AssistClearPayload = { turns: [turn] };

        this.clearRequest.emit(payload);

        if (payload.cancel) return;
        if (this.managed()) this.state.removeTurn(index);
    }

    /** Steps through one turn's regenerated answers. */
    private navigateResponse(index: number, delta: number): void {
        const turn = this.state.prompts()[index];

        if (!turn) return;

        const count = this.state.responsesOf(turn).length;
        const next = Math.min(Math.max(this.state.activeResponseIndexOf(turn) + delta, 0), count - 1);

        if (this.managed()) this.state.patchTurn(index, { activeResponseIndex: next });

        this.responseNavigate.emit({ turn, index, responseIndex: next, responseCount: count });
    }

    /**
     * Handles a toolbar entry.
     *
     * The event goes out FIRST, so an application can cancel a stock entry and put its own behaviour
     * in its place, and it goes out for unknown entries too — that is how a product's own entries are
     * delivered.
     */
    private onToolbarItemClick(payload: AssistToolbarItemClickPayload): void {
        this.toolbarItemClick.emit(payload);

        if (payload.cancel) return;

        const index = payload.index ?? -1;

        switch (payload.item.id) {
            case 'copy':
                if (index >= 0) void this.copyTurn(index);
                break;
            case 'like':
            case 'dislike':
                if (index >= 0) this.applyFeedback(index, payload.item.id);
                break;
            case 'regenerate':
            case 'retry':
                if (index >= 0) this.regenerate(index);
                break;
            case 'edit':
                if (index >= 0) this.beginEdit(index);
                break;
            case 'delete':
                if (index >= 0) this.deleteTurn(index);
                break;
            case 'readAloud':
                if (index >= 0) this.speak(index);
                break;
            case 'clear':
                this.clear();
                break;
            case 'attach':
                this.pickFiles();
                break;
            case 'microphone':
                this.toggleListening();
                break;
            case 'send':
                this.send();
                break;
            case 'stop':
                this.stopResponding(payload.originalEvent);
                break;
            default:
                break;
        }
    }

    /** Takes a suggestion chip. */
    private takeSuggestion(suggestion: AssistSuggestion, index: number): void {
        const payload: AssistSuggestionClickPayload = { suggestion, index };

        this.suggestionClick.emit(payload);

        if (payload.cancel) return;

        this.send(suggestion.prompt ?? suggestion.text ?? '');
    }

    /** Moves the view switcher. */
    private selectView(next: number): void {
        const previousIndex = this.activeView();

        if (next === previousIndex) return;

        this.activeView.set(next);
        this.viewChange.emit({ index: next, view: this.state.views()[next], previousIndex });
    }

    /** Writes the editor and reports the change. */
    private setPromptValue(next: string): void {
        const previousValue = this.previousPrompt;

        if (next === previousValue) return;

        this.previousPrompt = next;
        this.prompt.set(next);
        this.promptChanged.emit({ value: next, previousValue });
    }

    // ---------------------------------------------------------------------------------------------
    // Attachments
    // ---------------------------------------------------------------------------------------------

    /** Opens the file dialog. */
    private pickFiles(): void {
        if (!this.enableAttachments() || this.disabled()) return;

        this.attachmentsService.pick(this.state.attachmentOptions(), (files) => this.acceptFiles(files));
    }

    /** Runs the rules over a set of files and takes the ones that pass. */
    private acceptFiles(files: FileList | File[]): void {
        const options = this.state.attachmentOptions();
        const labels = this.resolvedLabels();
        const { accepted, rejected } = this.attachmentsService.accept(files, options, this.state.pendingAttachments().length);

        for (const attachment of accepted) {
            const payload: AssistAttachmentPayload = { file: attachment, files: [...this.state.pendingAttachments(), attachment] };

            this.beforeAttachmentUpload.emit(payload);

            if (payload.cancel) {
                this.attachmentsService.revoke(attachment);
                continue;
            }

            this.state.addAttachment(attachment);

            if (!options.saveUrl) continue;

            this.attachmentsService.upload(attachment, options, (changes) => {
                this.state.patchAttachment(attachment.id, changes);

                const current = { ...attachment, ...changes };

                if (changes.status === 'uploaded') this.attachmentUploadSuccess.emit({ file: current, files: this.state.pendingAttachments() });
                if (changes.status === 'failed') this.attachmentUploadFailure.emit({ file: current, files: this.state.pendingAttachments() });
            });
        }

        for (const rejection of rejected) {
            const message =
                rejection.reason === 'size'
                    ? formatLabel(labels.attachmentTooLarge, rejection.file.name, formatBytes(options.maxFileSize))
                    : rejection.reason === 'type'
                      ? formatLabel(labels.attachmentRejected, rejection.file.name)
                      : formatLabel(labels.attachmentLimit, options.maximumCount);

            this.state.alert(message);
            this.attachmentUploadFailure.emit({ file: { name: rejection.file.name, size: rejection.file.size, type: rejection.file.type, status: 'failed', error: rejection.reason }, files: this.state.pendingAttachments() });
        }
    }

    /** Takes one attachment back out of the editor. */
    private removeAttachment(id: string | undefined): void {
        const file = this.state.removeAttachment(id);

        if (!file) return;

        this.attachmentsService.remove(file, this.state.attachmentOptions());
        this.attachmentRemoved.emit({ file, files: this.state.pendingAttachments() });
    }

    /** @internal */
    protected onDragOver(event: DragEvent): void {
        if (!this.enableAttachments() || !this.state.attachmentOptions().allowDrop || this.disabled()) return;
        if (!event.dataTransfer?.types?.includes('Files')) return;

        event.preventDefault();
        this.state.dropping.set(true);
    }

    /** @internal */
    protected onDragLeave(event: DragEvent): void {
        // A drag crossing into a child fires `dragleave` on the parent, so the flag only clears when
        // the pointer has actually left the root.
        if (this.hostElement.nativeElement.contains(event.relatedTarget as Node)) return;

        this.state.dropping.set(false);
    }

    /** @internal */
    protected onDrop(event: DragEvent): void {
        if (!this.enableAttachments() || !this.state.attachmentOptions().allowDrop || this.disabled()) return;

        const files = event.dataTransfer?.files;

        this.state.dropping.set(false);

        if (!files?.length) return;

        event.preventDefault();
        this.acceptFiles(files);
    }

    /** @internal */
    protected onPaste(event: ClipboardEvent): void {
        if (!this.enableAttachments() || !this.state.attachmentOptions().allowPaste) return;

        const files = Array.from(event.clipboardData?.files ?? []);

        if (files.length === 0) return;

        event.preventDefault();
        this.acceptFiles(files);
    }

    // ---------------------------------------------------------------------------------------------
    // Speech
    // ---------------------------------------------------------------------------------------------

    /** Starts or stops dictation. */
    private toggleListening(): void {
        const options = this.speechToTextSettings() ?? {};

        if (this.state.listening()) {
            this.speech.stop();

            return;
        }

        this.state.listening.set(true);

        this.speech.start(options, (update) => {
            this.speechChange.emit({ state: update.state, transcript: update.transcript, interim: update.interim, error: update.error });

            if (update.state === 'listening') {
                this.setPromptValue(update.transcript);

                return;
            }

            this.state.listening.set(false);

            if (update.state === 'stopped' && options.autoSend && update.transcript.trim()) this.send();
        });
    }

    // ---------------------------------------------------------------------------------------------
    // Reasoning ticker
    // ---------------------------------------------------------------------------------------------

    private hasActiveThinking(): boolean {
        return this.state.activeTurn()?.blocks?.some((block) => block.blockType === 'thinking' && block.isActive) ?? false;
    }

    private setThinkingTimer(running: boolean): void {
        if (running === (this.thinkingTimer != null)) return;

        if (!running) {
            if (this.thinkingTimer != null) clearInterval(this.thinkingTimer);
            this.thinkingTimer = null;

            return;
        }

        if (!this.browser) return;

        this.state.thinkingElapsed.set(0);
        this.thinkingTimer = setInterval(() => this.state.thinkingElapsed.update((value) => value + 1), 1000);
    }

    // ---------------------------------------------------------------------------------------------
    // Scrolling
    // ---------------------------------------------------------------------------------------------

    /** @internal */
    protected onScroll(): void {
        const element = this.contentRef()?.nativeElement;

        if (!element) return;

        // 32px of slack, because a sub-pixel scroll height leaves `scrollTop + clientHeight` a
        // fraction short of `scrollHeight` even when the transcript is visually at its end.
        const atBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 32;

        this.state.scrolledAway.set(!atBottom);
    }

    // ---------------------------------------------------------------------------------------------
    // Public handle
    // ---------------------------------------------------------------------------------------------

    /** Sends `prompt` as though the reader had typed it. */
    executePrompt(prompt: string, attachedFiles?: AssistAttachment[]): void {
        if (attachedFiles?.length) for (const file of attachedFiles) this.state.addAttachment(file);

        this.send(prompt);
    }

    /**
     * Answers the turn that is waiting.
     *
     * Called repeatedly while streaming: each call replaces the open turn's answer, and the call that
     * leaves `isFinalUpdate` at its default closes the turn.
     */
    addPromptResponse(response: string | AssistResponseBlock[], isFinalUpdate = true): void {
        this.state.setResponse(response, isFinalUpdate);
    }

    /** Appends to the open turn's answer rather than replacing it. */
    appendPromptResponse(chunk: string): void {
        this.state.appendResponse(chunk);
    }

    /**
     * Reads a whole streamed answer into the open turn.
     *
     * The one call a streaming assistant needs. Every source shape a provider hands back goes in
     * directly — a `fetch` `Response`, a `ReadableStream`, an SDK's async iterable, an `Observable` —
     * and each delta is appended as it lands.
     *
     * ```ts
     * // A hosted model over SSE, picking the delta out of each frame.
     * onPrompt(event: AssistPromptRequestPayload) {
     *     const response = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ prompt: event.prompt }) });
     *
     *     this.assist().streamResponse(response, {
     *         sse: true,
     *         transform: (frame) => JSON.parse(frame).choices[0]?.delta?.content
     *     });
     * }
     * ```
     *
     * ```ts
     * // An async generator of your own. No options needed: plain strings go straight in.
     * this.assist().streamResponse(this.service.ask(prompt));
     * ```
     *
     * The stop button cancels it, the turn closes when the stream ends, and a stream that throws marks
     * the turn failed with a retryable error block rather than leaving it open forever.
     */
    async streamResponse(source: AssistStreamSource, options: AssistStreamOptions = {}): Promise<void> {
        const index = this.state.activeTurnIndex();

        if (index < 0) return;

        const controller = new AbortController();
        const external = options.signal;
        const forward = () => controller.abort();

        external?.addEventListener('abort', forward);
        this.streamAbort = controller;

        try {
            const frames = options.sse ? assistSseEvents(source, controller.signal) : assistChunks(source, controller.signal);

            for await (const frame of frames) {
                if (controller.signal.aborted) return;

                const raw = options.sse ? (frame as { data: string }).data : frame;
                // A transform that throws is a malformed frame, not a broken stream: a keep-alive or a
                // usage summary the caller's parser did not expect. Skip the frame and keep reading.
                let text: string | null | undefined;

                try {
                    // Without a transform only text can be appended: an object chunk from an SDK has
                    // no meaning this component could guess at.
                    text = options.transform ? options.transform(raw) : typeof raw === 'string' ? raw : undefined;
                } catch {
                    continue;
                }

                if (text) this.appendPromptResponse(text);
            }

            // An abort has already closed the turn through `stopResponding`.
            if (!controller.signal.aborted && this.state.activeTurnIndex() === index) this.state.finishTurn(index, 'complete');
        } catch (error) {
            if (controller.signal.aborted) return;

            const message = options.onError ? options.onError(error) : ((error as Error)?.message ?? String(error));

            if (message) {
                this.state.patchTurn(index, (turn) => ({
                    blocks: [...(turn.blocks ?? []), { blockType: 'error', id: `error-${index}`, content: message, retryable: true }]
                }));
            }

            this.state.finishTurn(index, 'failed', message);
        } finally {
            external?.removeEventListener('abort', forward);
            if (this.streamAbort === controller) this.streamAbort = null;
        }
    }

    /** Patches one block of the open turn, matched by `id`. */
    updateBlock(block: AssistResponseBlock): void {
        this.state.updateBlock(block);
    }

    /** Rewrites one turn of the transcript. */
    updateTurn(index: number, changes: Partial<AssistPrompt>): void {
        this.state.patchTurn(index, changes);
    }

    /** Empties the transcript. */
    clear(): void {
        const turns = this.state.prompts();

        if (turns.length === 0) return;

        const payload: AssistClearPayload = { turns };

        this.clearRequest.emit(payload);

        if (payload.cancel) return;

        if (this.managed()) this.state.setPrompts([]);

        this.state.activeTurnIndex.set(-1);
        this.state.announce(this.resolvedLabels().transcriptCleared);
    }

    /** Drops one turn. */
    removeTurn(index: number): void {
        this.deleteTurn(index);
    }

    /** Scrolls the transcript to its newest turn. */
    scrollToBottom(behavior: ScrollBehavior = 'smooth'): void {
        if (!this.browser) return;

        // After the frame the new turn was laid out in: scrolling in the same tick lands on the old
        // height and stops short of the content that prompted the scroll.
        requestAnimationFrame(() => {
            const element = this.contentRef()?.nativeElement;

            if (!element) return;

            element.scrollTo({ top: element.scrollHeight, behavior });
            this.state.scrolledAway.set(false);
        });
    }

    /** Scrolls one turn into view. */
    scrollToTurn(index: number, behavior: ScrollBehavior = 'smooth'): void {
        if (!this.browser) return;

        const element = this.contentRef()?.nativeElement?.querySelector<HTMLElement>(`[data-part="turn"][data-assist-index="${index}"]`);

        element?.scrollIntoView({ behavior, block: 'start' });
    }

    /** Puts the caret in the editor. */
    focusEditor(): void {
        this.footerRef()?.editorRef()?.nativeElement?.focus();
    }

    /** Starts dictation. */
    startListening(): void {
        if (!this.state.listening()) this.toggleListening();
    }

    /** Ends dictation. */
    stopListening(): void {
        if (this.state.listening()) this.speech.stop();
    }

    /** Reads a turn's answer aloud, or stops reading it. Defaults to the newest turn. */
    speak(index?: number): void {
        const position = index ?? this.state.prompts().length - 1;
        const turn = this.state.prompts()[position];

        if (!turn) return;

        if (this.state.speakingIndex() === position) {
            this.stopSpeaking();

            return;
        }

        const text = blocksToPlainText(turn.blocks, this.state.visibleResponseOf(turn));

        if (!text) return;

        this.state.speakingIndex.set(position);
        this.speech.speak(text, this.textToSpeechSettings() ?? {}, () => this.state.speakingIndex.set(-1));
    }

    /** Stops reading. */
    stopSpeaking(): void {
        this.speech.cancelSpeech();
        this.state.speakingIndex.set(-1);
    }

    /** The transcript, for a download or the clipboard. */
    exportTranscript(format: 'markdown' | 'text' | 'json' = 'markdown'): string {
        const turns = this.state.prompts();

        if (format === 'json') return JSON.stringify(turns, null, 2);

        const labels = this.resolvedLabels();

        return turns
            .map((turn) => {
                const answer = blocksToPlainText(turn.blocks, this.state.visibleResponseOf(turn));

                if (format === 'text') return `${labels.user}: ${turn.prompt ?? ''}\n${labels.assistant}: ${answer}`;

                return `**${labels.user}**\n\n${turn.prompt ?? ''}\n\n**${labels.assistant}**\n\n${answer}`;
            })
            .join('\n\n---\n\n');
    }
}

/** Renders a width or a height input as a CSS length. @internal */
function sizeToStyle(value: string | number | undefined): string | null {
    if (value == null) return null;

    return typeof value === 'number' ? `${value}px` : value;
}

/** Renders a byte limit for a rejection message. @internal */
function formatBytes(bytes: number | undefined): string {
    if (bytes == null) return '';
    if (bytes >= 1024 * 1024) return `${Math.round(bytes / (1024 * 1024))} MB`;

    return `${Math.round(bytes / 1024)} KB`;
}

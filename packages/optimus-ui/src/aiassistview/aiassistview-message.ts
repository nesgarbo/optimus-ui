import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, input } from '@angular/core';
import { Avatar } from '@openng/optimus-ui/avatar';
import { Button } from '@openng/optimus-ui/button';
import { Chip } from '@openng/optimus-ui/chip';
import { ProgressBar } from '@openng/optimus-ui/progressbar';
import { Textarea } from '@openng/optimus-ui/textarea';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import type { AssistAttachment, AssistPrompt, AssistResponseBlock, AssistToolbarItem } from '@openng/optimus-ui/types/aiassistview';
import { AssistBlocks } from './aiassistview-blocks';
import { ASSIST_COMMANDS, ASSIST_TURN_CONTEXT, type AssistTurnContext } from './aiassistview-context';
import { AssistGlyph } from './aiassistview-icons';
import { splitMarkdownBlocks } from './aiassistview-markdown';
import { ASSIST_TEMPLATES } from './aiassistview-registry';
import { ASSIST_STATE, formatFileSize, formatLabel, formatTime } from './aiassistview-state';
import { AssistToolbar } from './aiassistview-toolbar';

/**
 * One turn of the transcript, and the two halves it is made of.
 *
 * The halves are separate components because they are separately replaceable: a product that wants
 * its own prompt surface but the stock answer keeps one and drops the other, and both still sit
 * inside the turn's context, so the toolbars, the editing state and the regeneration counter keep
 * working.
 *
 * Everything on screen that is not the answer itself is a component from the rest of the library — an
 * avatar, chips, buttons, a textarea, a progress bar — so the assistant inherits their sizing, their
 * focus rings and their theming instead of restating them.
 *
 * @module aiassistview-message
 */

/* -------------------------------------------------------------------------------------------------
 * Attachment chips
 * ---------------------------------------------------------------------------------------------- */

/**
 * The files carried by a prompt, or held by the composer before one goes out.
 *
 * @group Components
 */
@Component({
    selector: 'p-assist-attachments',
    standalone: true,
    imports: [AssistGlyph, Chip, NgTemplateOutlet, ProgressBar],
    template: `
        @for (file of files(); track file.id ?? $index) {
            <li>
                @if (template(); as definition) {
                    <ng-container *ngTemplateOutlet="definition; context: { $implicit: file, file, index: $index, editable: editable() }" />
                } @else {
                    <p-chip
                        [image]="file.url && file.type?.startsWith('image/') ? file.url : undefined"
                        [alt]="file.name"
                        [removable]="editable()"
                        [attr.data-assist-status]="file.status ?? null"
                        [attr.title]="removeLabel(file)"
                        (onRemove)="remove(file)"
                    >
                        @if (!file.url || !file.type?.startsWith('image/')) {
                            <p-assist-glyph name="file" />
                        }
                        <span>{{ file.name }}</span>
                        @if (file.size) {
                            <span class="p-aiassistview-attachment-meta">{{ sizeOf(file) }}</span>
                        }
                        @if (file.status === 'uploading') {
                            <p-progress-bar class="p-aiassistview-attachment-progress" [value]="file.progress ?? 0" [showValue]="false" />
                        }
                    </p-chip>
                }
            </li>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-scope': 'aiassistview', 'data-part': 'attachments', class: 'p-aiassistview-attachments', role: 'list' }
})
export class AssistAttachmentList {
    private readonly state = inject(ASSIST_STATE);
    private readonly commands = inject(ASSIST_COMMANDS, { optional: true });
    private readonly templates = inject(ASSIST_TEMPLATES, { optional: true });

    /** The files. */
    readonly files = input<AssistAttachment[]>([]);

    /** Whether each chip offers a remove control. False once the prompt has gone out. */
    readonly editable = input(false);

    /** @internal */
    protected template() {
        return this.templates?.attachment()?.template;
    }

    /** @internal */
    protected sizeOf(file: AssistAttachment): string {
        return formatFileSize(file.size);
    }

    /** @internal */
    protected removeLabel(file: AssistAttachment): string {
        return formatLabel(this.state.labels().removeAttachment, file.name ?? '');
    }

    /** @internal */
    protected remove(file: AssistAttachment): void {
        this.commands?.removeAttachment(file.id);
    }
}

/* -------------------------------------------------------------------------------------------------
 * Prompt
 * ---------------------------------------------------------------------------------------------- */

/**
 * The asking half of a turn.
 *
 * @group Components
 */
@Component({
    selector: 'p-assist-prompt-message',
    standalone: true,
    imports: [AssistAttachmentList, AssistGlyph, AssistToolbar, Avatar, Button, NgTemplateOutlet, Textarea],
    template: `
        @if (showAvatar()) {
            <p-avatar shape="circle" styleClass="p-aiassistview-avatar" [ariaLabel]="labels().user">
                @if (avatarIconCss()) {
                    <span [class]="avatarIconCss()" aria-hidden="true"></span>
                } @else {
                    <p-assist-glyph name="user" />
                }
            </p-avatar>
        }
        <div class="p-aiassistview-message-body">
            @if (template(); as definition) {
                <ng-container *ngTemplateOutlet="definition; context: templateContext()" />
            } @else if (editing()) {
                <textarea pTextarea class="p-aiassistview-editor" rows="2" [value]="state.editingValue()" [attr.aria-label]="labels().edit" (input)="onEditInput($event)" (keydown)="onEditKeydown($event)"></textarea>
                <div class="p-aiassistview-message-actions">
                    <p-button size="small" [label]="labels().save" (onClick)="commitEdit()" />
                    <p-button size="small" severity="secondary" [text]="true" [label]="labels().cancel" (onClick)="cancelEdit()" />
                </div>
            } @else {
                <span class="p-aiassistview-author">
                    {{ labels().user }}
                    @if (timestamp(); as time) {
                        <span class="p-aiassistview-timestamp">{{ time }}</span>
                    }
                </span>
                <div class="p-aiassistview-prompt-content">
                    <p class="p-aiassistview-prompt-text">{{ turn().prompt }}</p>
                </div>
                @if (turn().attachedFiles?.length) {
                    <ul class="p-aiassistview-attachments">
                        <p-assist-attachments [files]="turn().attachedFiles ?? []" />
                    </ul>
                }
            }
            @if (toolbarItems().length && !editing()) {
                <p-assist-toolbar kind="prompt" [items]="toolbarItems()" [turn]="turn()" [index]="index()" [showOnHover]="showOnHover()" [disabled]="state.disabled()" (itemClick)="commands?.toolbarItemClick($event)" />
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        'data-scope': 'aiassistview',
        'data-part': 'prompt-message',
        class: 'p-aiassistview-message p-aiassistview-message-prompt',
        '[attr.data-assist-index]': 'index()'
    }
})
export class AssistPromptMessage {
    /** @internal */
    protected readonly state = inject(ASSIST_STATE);

    /** @internal */
    protected readonly commands = inject(ASSIST_COMMANDS, { optional: true });

    private readonly templates = inject(ASSIST_TEMPLATES, { optional: true });

    /** The turn. */
    readonly turn = input.required<AssistPrompt>();

    /** Where it sits. */
    readonly index = input.required<number>();

    /** Whether the avatar is drawn. */
    readonly showAvatar = input(true);

    /** Icon class of the avatar, replacing the built-in glyph. */
    readonly avatarIconCss = input<string | undefined>(undefined);

    /** Whether the toolbar waits for a hover. */
    readonly showOnHover = input(true);

    /** @internal */
    protected readonly labels = computed(() => this.state.labels());

    /** @internal */
    protected readonly editing = computed(() => this.state.editingIndex() === this.index());

    /**
     * @internal
     *
     * The clock time the turn was created, in the reader's own locale. Absent until a turn has a
     * `createdAt` — a transcript restored from a store without one simply shows no time rather than
     * inventing one.
     */
    protected readonly timestamp = computed(() => formatTime(this.turn().createdAt));

    /** @internal */
    protected readonly toolbarItems = computed<AssistToolbarItem[]>(() => this.state.promptToolbarItems());

    /** @internal */
    protected template() {
        return this.templates?.prompt()?.template;
    }

    /** @internal */
    protected templateContext() {
        const turn = this.turn();

        return { $implicit: turn, turn, index: this.index(), prompt: turn.prompt ?? '', attachedFiles: turn.attachedFiles ?? [], last: this.index() === this.state.prompts().length - 1 };
    }

    /** @internal */
    protected onEditInput(event: Event): void {
        this.state.editingValue.set((event.target as HTMLTextAreaElement).value);
    }

    /**
     * @internal
     *
     * Enter commits and Escape abandons, matching the inline-edit convention everywhere else in the
     * library. Shift+Enter still breaks the line, because a rewritten prompt is as likely to be
     * multi-line as the original was.
     */
    protected onEditKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            event.preventDefault();
            this.cancelEdit();

            return;
        }

        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.commitEdit();
        }
    }

    /** @internal */
    protected commitEdit(): void {
        this.commands?.commitEdit(this.index(), this.state.editingValue());
    }

    /** @internal */
    protected cancelEdit(): void {
        this.commands?.cancelEdit();
    }
}

/* -------------------------------------------------------------------------------------------------
 * Response
 * ---------------------------------------------------------------------------------------------- */

/**
 * The answering half of a turn.
 *
 * @group Components
 */
@Component({
    selector: 'p-assist-response-message',
    standalone: true,
    imports: [AssistBlocks, AssistGlyph, AssistToolbar, Avatar, Button, Chip, NgTemplateOutlet, Tooltip],
    template: `
        @if (showAvatar()) {
            <p-avatar shape="circle" styleClass="p-aiassistview-avatar p-aiassistview-avatar-assistant" [ariaLabel]="labels().assistant">
                @if (avatarIconCss()) {
                    <span [class]="avatarIconCss()" aria-hidden="true"></span>
                } @else {
                    <p-assist-glyph name="sparkles" />
                }
            </p-avatar>
        }
        <div class="p-aiassistview-message-body">
            <span class="p-aiassistview-author">
                {{ labels().assistant }}
                @if (timestamp(); as time) {
                    <span class="p-aiassistview-timestamp">{{ time }}</span>
                }
            </span>
            <div class="p-aiassistview-response-content">
                @if (template(); as definition) {
                    <ng-container *ngTemplateOutlet="definition; context: templateContext()" />
                } @else if (pending()) {
                    <span class="p-aiassistview-typing" [attr.aria-label]="labels().thinking"><span></span><span></span><span></span></span>
                } @else {
                    <p-assist-blocks [blocks]="blocks()" [turn]="turn()" [index]="index()" [markdown]="markdown()" (contextClick)="commands?.contextClick($event)" (retry)="commands?.retry(index())" />
                }
            </div>

            @if (turn().citations?.length) {
                <ul class="p-aiassistview-citations">
                    <li class="p-aiassistview-citations-label">{{ labels().citations }}</li>
                    @for (citation of turn().citations ?? []; track citation.id ?? $index) {
                        <li>
                            <a class="p-aiassistview-citation" [href]="citation.url" target="_blank" rel="noopener noreferrer" [pTooltip]="citation.snippet ?? ''" tooltipPosition="top">
                                <p-chip [label]="citation.title || citation.url" styleClass="p-aiassistview-context-item" />
                            </a>
                        </li>
                    }
                </ul>
            }

            <div class="p-aiassistview-message-actions">
                @if (responseCount() > 1) {
                    <span class="p-aiassistview-response-nav">
                        <p-button [text]="true" [rounded]="true" severity="secondary" size="small" [disabled]="responseIndex() === 0" [ariaLabel]="labels().previousResponse" (onClick)="commands?.navigateResponse(index(), -1)">
                            <p-assist-glyph name="chevron-left" />
                        </p-button>
                        <span>{{ counterLabel() }}</span>
                        <p-button [text]="true" [rounded]="true" severity="secondary" size="small" [disabled]="responseIndex() === responseCount() - 1" [ariaLabel]="labels().nextResponse" (onClick)="commands?.navigateResponse(index(), 1)">
                            <p-assist-glyph name="chevron-right" />
                        </p-button>
                    </span>
                }
                @if (toolbarItems().length && !pending()) {
                    <p-assist-toolbar kind="response" [items]="toolbarItems()" [turn]="turn()" [index]="index()" [showOnHover]="showOnHover()" [disabled]="state.disabled()" (itemClick)="commands?.toolbarItemClick($event)" />
                }
                @if (turn().usage; as usage) {
                    <span class="p-aiassistview-usage">{{ usageLabel(usage) }}</span>
                }
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        'data-scope': 'aiassistview',
        'data-part': 'response-message',
        class: 'p-aiassistview-message p-aiassistview-message-response',
        '[attr.data-assist-index]': 'index()',
        '[attr.data-assist-status]': 'turn().status ?? null'
    }
})
export class AssistResponseMessage {
    /** @internal */
    protected readonly state = inject(ASSIST_STATE);

    /** @internal */
    protected readonly commands = inject(ASSIST_COMMANDS, { optional: true });

    private readonly templates = inject(ASSIST_TEMPLATES, { optional: true });

    /** The turn. */
    readonly turn = input.required<AssistPrompt>();

    /** Where it sits. */
    readonly index = input.required<number>();

    /** Whether the avatar is drawn. */
    readonly showAvatar = input(true);

    /** Icon class of the avatar, replacing the built-in glyph. */
    readonly avatarIconCss = input<string | undefined>(undefined);

    /** Whether the toolbar waits for a hover. */
    readonly showOnHover = input(true);

    /** Whether text is read as markdown. */
    readonly markdown = input(true);

    /** @internal */
    protected readonly labels = computed(() => this.state.labels());

    /**
     * @internal
     *
     * The clock time the turn was created, in the reader's own locale. Absent until a turn has a
     * `createdAt` — a transcript restored from a store without one simply shows no time rather than
     * inventing one.
     */
    protected readonly timestamp = computed(() => formatTime(this.turn().createdAt));

    /** Whether the turn has been sent and nothing has come back yet. */
    protected readonly pending = computed(() => {
        const turn = this.turn();

        return (turn.status === 'pending' || turn.status === 'streaming') && !turn.blocks?.length && !turn.response;
    });

    /**
     * @internal
     *
     * `blocks` when the answer came structured; otherwise the text is split into the same shape, so
     * a plain-string answer with a fenced sample in it renders through the identical components.
     */
    protected readonly blocks = computed<AssistResponseBlock[]>(() => {
        const turn = this.turn();

        if (turn.blocks?.length) return turn.blocks;

        const text = this.state.visibleResponseOf(turn);

        if (!text) return [];

        return this.markdown() ? splitMarkdownBlocks(text) : [{ blockType: 'text', content: text }];
    });

    /** @internal */
    protected readonly responseCount = computed(() => this.state.responsesOf(this.turn()).length);

    /** @internal */
    protected readonly responseIndex = computed(() => this.state.activeResponseIndexOf(this.turn()));

    /** @internal */
    protected readonly counterLabel = computed(() => formatLabel(this.labels().responseCounter, this.responseIndex() + 1, this.responseCount()));

    /**
     * @internal
     *
     * The stock entries carry their pressed state here rather than in the state, so a `like` already
     * on the turn comes back pressed after a reload with nothing else having to remember it.
     */
    protected readonly toolbarItems = computed<AssistToolbarItem[]>(() => {
        const turn = this.turn();

        return this.state.responseToolbarItemsOf(turn).map((item) => {
            if (item.id === 'like') return { ...item, toggle: true, active: turn.isResponseHelpful === 'like' };
            if (item.id === 'dislike') return { ...item, toggle: true, active: turn.isResponseHelpful === 'dislike' };
            if (item.id === 'readAloud') return { ...item, toggle: true, active: this.state.speakingIndex() === this.index() };

            return item;
        });
    });

    /** @internal */
    protected template() {
        return this.templates?.response()?.template;
    }

    /** @internal */
    protected templateContext() {
        const turn = this.turn();

        return {
            $implicit: turn,
            turn,
            index: this.index(),
            response: this.state.visibleResponseOf(turn),
            blocks: this.blocks(),
            streaming: turn.status === 'streaming',
            last: this.index() === this.state.prompts().length - 1
        };
    }

    /** @internal */
    protected usageLabel(usage: NonNullable<AssistPrompt['usage']>): string {
        const total = usage.totalTokens ?? (usage.promptTokens ?? 0) + (usage.completionTokens ?? 0);
        const pieces = [usage.model, total ? `${total} tokens` : '', usage.durationMs ? `${(usage.durationMs / 1000).toFixed(1)}s` : ''];

        return pieces.filter(Boolean).join(' · ');
    }
}

/* -------------------------------------------------------------------------------------------------
 * Turn
 * ---------------------------------------------------------------------------------------------- */

/**
 * One turn: the prompt, the answer, and the context both halves sit in.
 *
 * @group Components
 */
@Component({
    selector: 'p-assist-turn',
    standalone: true,
    imports: [AssistPromptMessage, AssistResponseMessage],
    template: `
        @if (turn().prompt || turn().attachedFiles?.length) {
            <p-assist-prompt-message [turn]="turn()" [index]="index()" [showAvatar]="showAvatars()" [avatarIconCss]="promptIconCss()" [showOnHover]="showOnHover()" />
        }
        <p-assist-response-message [turn]="turn()" [index]="index()" [showAvatar]="showAvatars()" [avatarIconCss]="responseIconCss()" [showOnHover]="showOnHover()" [markdown]="markdown()" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: ASSIST_TURN_CONTEXT, useFactory: () => inject(AssistTurn).turnContext }],
    host: {
        'data-scope': 'aiassistview',
        'data-part': 'turn',
        class: 'p-aiassistview-turn',
        role: 'group',
        '[attr.data-assist-index]': 'index()'
    }
})
export class AssistTurn {
    private readonly state = inject(ASSIST_STATE);

    /** The turn. */
    readonly turn = input.required<AssistPrompt>();

    /** Where it sits. */
    readonly index = input.required<number>();

    /** Whether the avatars are drawn. */
    readonly showAvatars = input(true);

    /** Icon class of the asking avatar. */
    readonly promptIconCss = input<string | undefined>(undefined);

    /** Icon class of the answering avatar. */
    readonly responseIconCss = input<string | undefined>(undefined);

    /** Whether the toolbars wait for a hover. */
    readonly showOnHover = input(true);

    /** Whether text is read as markdown. */
    readonly markdown = input(true);

    /** @internal What a part placed inside this turn reads. */
    readonly turnContext: AssistTurnContext = {
        turn: computed(() => this.turn()),
        index: computed(() => this.index()),
        last: computed(() => this.index() === this.state.prompts().length - 1),
        streaming: computed(() => this.turn().status === 'streaming')
    };
}

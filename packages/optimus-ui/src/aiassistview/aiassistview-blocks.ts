import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, inject, input, output, signal } from '@angular/core';
import { Button } from '@openng/optimus-ui/button';
import { Chip } from '@openng/optimus-ui/chip';
import { Message } from '@openng/optimus-ui/message';
import { Panel } from '@openng/optimus-ui/panel';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import type {
    AssistCodeBlock,
    AssistContextClickPayload,
    AssistErrorBlock,
    AssistPrompt,
    AssistResponseBlock,
    AssistTextBlock,
    AssistThinkingBlock,
    AssistThinkingContextItem,
    AssistThinkingStage,
    AssistToolBlock
} from '@openng/optimus-ui/types/aiassistview';
import { copyToClipboard } from './aiassistview-clipboard';
import { ASSIST_THINKING_CONTEXT } from './aiassistview-context';
import { AssistGlyph, type AssistIconName } from './aiassistview-icons';
import { renderMarkdown } from './aiassistview-markdown';
import { ASSIST_TEMPLATES } from './aiassistview-registry';
import { ASSIST_STATE, formatLabel } from './aiassistview-state';

/**
 * The renderers for one response block of each kind.
 *
 * A response is a list of blocks, and each kind gets a component rather than a branch inside one
 * template. That is what lets a product import `AssistCodeBlockView` on its own to reuse the code
 * chrome elsewhere, and what keeps the reasoning timeline — the most intricate piece of the surface —
 * out of the transcript's own template.
 *
 * The boxed kinds — code, reasoning and tools — share one surface class, so they read as one family
 * alongside a panel or a card rather than as three separately invented boxes.
 *
 * @module aiassistview-blocks
 */

/** The glyph a reasoning chip draws for its `type`. */
const CONTEXT_ICONS: Record<string, AssistIconName> = {
    file: 'file',
    variable: 'pencil',
    search: 'search',
    tool: 'tool',
    result: 'check',
    context: 'file'
};

/* -------------------------------------------------------------------------------------------------
 * Text
 * ---------------------------------------------------------------------------------------------- */

/**
 * Prose, rendered as markdown or left as text.
 *
 * @group Components
 */
@Component({
    selector: 'p-assist-text-block',
    standalone: true,
    template: `
        @if (markdown()) {
            <div [innerHTML]="html()"></div>
        } @else {
            <div class="p-aiassistview-prompt-text">{{ block().content }}</div>
        }
        @if (block().streaming) {
            <span class="p-aiassistview-caret" aria-hidden="true"></span>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-scope': 'aiassistview', 'data-part': 'text-block', class: 'p-aiassistview-text' }
})
export class AssistTextBlockView {
    /** The block. */
    readonly block = input.required<AssistTextBlock>();

    /** Whether the content is read as markdown. */
    readonly markdown = input(true, { transform: booleanAttribute });

    /**
     * @internal
     *
     * The result is bound through `[innerHTML]`, so Angular's sanitiser runs over it in addition to
     * the escaping the renderer already did.
     */
    protected readonly html = computed(() => renderMarkdown(this.block().content ?? ''));
}

/* -------------------------------------------------------------------------------------------------
 * Code
 * ---------------------------------------------------------------------------------------------- */

/**
 * A code sample, with its language, its file name and its own copy button.
 *
 * @group Components
 */
@Component({
    selector: 'p-assist-code-block',
    standalone: true,
    imports: [AssistGlyph, Button, Panel, Tooltip],
    template: `
        <p-panel styleClass="p-aiassistview-block-panel">
            <ng-template #header>
                <span class="p-panel-title p-aiassistview-panel-title">
                    <span class="p-aiassistview-panel-label">{{ block().fileName || block().language || 'code' }}</span>
                </span>
            </ng-template>
            @if (block().copyable ?? true) {
                <ng-template #icons>
                    <p-button [text]="true" [rounded]="true" severity="secondary" size="small" [ariaLabel]="copied() ? labels().copied : labels().copy" [pTooltip]="copied() ? labels().copied : labels().copy" tooltipPosition="top" (onClick)="copy()">
                        <p-assist-glyph [name]="copied() ? 'check' : 'copy'" />
                    </p-button>
                </ng-template>
            }
            <pre><code>{{ block().content }}</code>@if (block().streaming) {<span class="p-aiassistview-caret" aria-hidden="true"></span>}</pre>
        </p-panel>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        'data-scope': 'aiassistview',
        'data-part': 'code-block',
        class: 'p-aiassistview-code',
        '[attr.data-assist-language]': 'block().language ?? null'
    }
})
export class AssistCodeBlockView {
    private readonly document = inject(DOCUMENT);
    private readonly state = inject(ASSIST_STATE);

    /** The block. */
    readonly block = input.required<AssistCodeBlock>();

    /** @internal */
    protected readonly labels = computed(() => this.state.labels());

    /** @internal Whether this sample's copy button has just fired. */
    protected readonly copied = signal(false);

    /** @internal */
    protected async copy(): Promise<void> {
        const done = await copyToClipboard(this.document, this.block().content ?? '');

        if (!done) return;

        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 1600);
    }
}

/* -------------------------------------------------------------------------------------------------
 * Thinking
 * ---------------------------------------------------------------------------------------------- */

/**
 * The reasoning timeline.
 *
 * The one block with state of its own: it folds, and the reader's choice has to survive the stream of
 * patches that arrives while the model is still reasoning. That choice lives in the shared state,
 * keyed by block id, so a panel does not spring back open on the next chunk.
 *
 * @group Components
 */
@Component({
    selector: 'p-assist-thinking-block',
    standalone: true,
    imports: [AssistGlyph, Chip, NgTemplateOutlet, Panel],
    template: `
        <p-panel styleClass="p-aiassistview-block-panel" [toggleable]="collapsible()" toggler="header" [collapsed]="collapsed()" (collapsedChange)="onCollapsedChange($event)">
            <ng-template #header>
                <span class="p-panel-title p-aiassistview-panel-title">
                    <p-assist-glyph [name]="block().isActive ? 'sparkles' : 'check'" />
                    <span>{{ heading() }}</span>
                    @if (duration(); as seconds) {
                        <span class="p-aiassistview-duration">{{ formatDuration(seconds) }}</span>
                    }
                </span>
            </ng-template>

            @if (block().stages?.length) {
                <ol class="p-aiassistview-stages">
                    @for (stage of block().stages ?? []; track stage.id ?? $index) {
                        <li class="p-aiassistview-stage" [class]="'p-aiassistview-stage-' + (stage.status ?? 'completed')">
                            <span class="p-aiassistview-stage-rail">
                                @if (stage.iconCss) {
                                    <span [class]="stage.iconCss" aria-hidden="true"></span>
                                } @else {
                                    <p-assist-glyph [name]="stageGlyph(stage)" />
                                }
                            </span>
                            <span class="p-aiassistview-stage-content">
                                @if (stageTemplate(); as definition) {
                                    <ng-container *ngTemplateOutlet="definition; context: { $implicit: stage, stage, index: $index, block: block() }" />
                                } @else {
                                    <span>{{ stage.content }}</span>
                                    @if (stage.editableContext?.length) {
                                        <span class="p-aiassistview-context">
                                            @for (item of stage.editableContext ?? []; track $index) {
                                                <p-chip
                                                    [label]="chipLabel(item)"
                                                    [attr.title]="item.tooltipText ?? null"
                                                    [attr.data-assist-badge]="item.badge && item.badge !== 'none' ? item.badge : null"
                                                    [attr.role]="item.clickable ? 'button' : null"
                                                    [attr.tabindex]="item.clickable ? 0 : null"
                                                    styleClass="p-aiassistview-context-item"
                                                    (click)="item.clickable && clickContext(item, stage, $event)"
                                                    (keydown.enter)="item.clickable && clickContext(item, stage, $event)"
                                                    (keydown.space)="item.clickable && clickContext(item, stage, $event)"
                                                />
                                            }
                                        </span>
                                    }
                                }
                            </span>
                        </li>
                    }
                </ol>
            } @else if (block().content) {
                <div class="p-aiassistview-stages">{{ block().content }}</div>
            }
        </p-panel>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: ASSIST_THINKING_CONTEXT, useFactory: () => inject(AssistThinkingBlockView).thinkingContext }],
    host: {
        'data-scope': 'aiassistview',
        'data-part': 'thinking-block',
        '[class]': 'hostClass()',
        '[attr.data-assist-active]': 'block().isActive ? "" : null'
    }
})
export class AssistThinkingBlockView {
    private readonly state = inject(ASSIST_STATE);
    private readonly templates = inject(ASSIST_TEMPLATES, { optional: true });

    /** The block. */
    readonly block = input.required<AssistThinkingBlock>();

    /** The turn the panel belongs to, carried out on a chip click. */
    readonly turn = input<AssistPrompt | undefined>(undefined);

    /** Where that turn sits. */
    readonly index = input<number | undefined>(undefined);

    /** Fired when a clickable reasoning chip is activated. */
    readonly contextClick = output<AssistContextClickPayload>();

    /** @internal */
    protected readonly collapsible = computed(() => this.block().collapsible ?? true);

    /** @internal */
    protected readonly collapsed = computed(() => this.collapsible() && this.state.blockCollapsed(this.block()));

    /**
     * @internal
     *
     * While the model is reasoning the panel counts up from the shared ticker; once it stops, the
     * block's own `durationMs` is the record and the ticker has already been reset.
     */
    protected readonly duration = computed(() => {
        const block = this.block();

        if (block.isActive) return this.state.thinkingElapsed() || null;

        return block.durationMs ? Math.round(block.durationMs / 1000) : null;
    });

    /** @internal */
    protected readonly heading = computed(() => {
        const block = this.block();
        const labels = this.state.labels();

        return block.title ?? (block.isActive ? labels.thinking : labels.thought);
    });

    /** @internal */
    protected readonly hostClass = computed(() => {
        const classes = ['p-aiassistview-thinking'];

        if (this.block().isActive) classes.push('p-aiassistview-thinking-active');

        return classes.join(' ');
    });

    /** @internal What a part placed inside the panel reads. */
    readonly thinkingContext = {
        block: computed(() => this.block()),
        collapsed: this.collapsed,
        toggle: () => this.toggle()
    };

    /** @internal */
    protected toggle(): void {
        if (!this.collapsible()) return;

        this.state.toggleBlock(this.block());
    }

    /**
     * @internal
     *
     * The panel reports its own collapse; the answer of record stays in the shared state, keyed by
     * block id, so the reader's choice survives the stream of patches that arrives while the model is
     * still reasoning.
     */
    protected onCollapsedChange(collapsed: boolean | undefined): void {
        if (!!collapsed === this.collapsed()) return;

        this.toggle();
    }

    /** @internal */
    protected stageGlyph(stage: AssistThinkingStage): AssistIconName {
        switch (stage.status) {
            case 'failed':
                return 'times';
            case 'inProgress':
                return 'sparkles';
            case 'pending':
                return 'chevron-right';
            default:
                return 'check';
        }
    }

    /** @internal */
    protected contextGlyph(item: AssistThinkingContextItem): AssistIconName {
        return CONTEXT_ICONS[item.type ?? 'context'] ?? 'file';
    }

    /** @internal What the chip says: the name, and the value after it when there is one. */
    protected chipLabel(item: AssistThinkingContextItem): string {
        return item.value ? `${item.name} · ${item.value}` : (item.name ?? '');
    }

    /** @internal */
    protected stageTemplate() {
        return this.templates?.stage()?.template;
    }

    /** @internal */
    protected formatDuration(seconds: number): string {
        return formatLabel(this.state.labels().thoughtFor, seconds);
    }

    /** @internal */
    protected clickContext(contextItem: AssistThinkingContextItem, stage: AssistThinkingStage, event: Event): void {
        this.contextClick.emit({ originalEvent: event, contextItem, stage, turn: this.turn(), index: this.index() });
    }
}

/* -------------------------------------------------------------------------------------------------
 * Tool
 * ---------------------------------------------------------------------------------------------- */

/**
 * A tool call, drawn by whichever `pAssistToolDef` claimed its name.
 *
 * With no template registered it still renders something useful — the tool's name, its status and its
 * result — rather than nothing at all, which is what makes a tool the application has not styled yet
 * visible instead of invisible.
 *
 * @group Components
 */
@Component({
    selector: 'p-assist-tool-block',
    standalone: true,
    imports: [AssistGlyph, NgTemplateOutlet, Panel],
    template: `
        @if (template(); as definition) {
            <ng-container *ngTemplateOutlet="definition; context: { $implicit: block(), block: block(), props: block().props, result: block().result, turn: turn() }" />
        } @else {
            <p-panel styleClass="p-aiassistview-block-panel">
                <ng-template #header>
                    <span class="p-panel-title p-aiassistview-panel-title">
                        <p-assist-glyph [name]="statusGlyph()" [spin]="block().status === 'inProgress'" />
                        <span>{{ block().title || block().toolName }}</span>
                    </span>
                </ng-template>
                @if (block().error || resultText()) {
                    <pre>{{ block().error || resultText() }}</pre>
                }
            </p-panel>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        'data-scope': 'aiassistview',
        'data-part': 'tool-block',
        class: 'p-aiassistview-code p-aiassistview-tool',
        '[attr.data-assist-tool]': 'block().toolName',
        '[attr.data-assist-status]': 'block().status ?? null'
    }
})
export class AssistToolBlockView {
    private readonly templates = inject(ASSIST_TEMPLATES, { optional: true });

    /** The block. */
    readonly block = input.required<AssistToolBlock>();

    /** The turn it belongs to. */
    readonly turn = input<AssistPrompt | undefined>(undefined);

    /** @internal The template registered for this tool's name, or the catch-all one. */
    protected readonly template = computed(() => {
        const definitions = this.templates?.tools() ?? [];
        const name = this.block().toolName;
        const named = definitions.find((definition) => definition.pAssistToolDef() === name);

        return (named ?? definitions.find((definition) => !definition.pAssistToolDef()))?.template;
    });

    /** @internal */
    protected readonly statusGlyph = computed<AssistIconName>(() => {
        switch (this.block().status) {
            case 'failed':
                return 'exclamation-triangle';
            case 'inProgress':
                return 'spinner';
            default:
                return 'tool';
        }
    });

    /** @internal */
    protected readonly resultText = computed(() => {
        const result = this.block().result;

        if (result == null) return null;

        return typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    });
}

/* -------------------------------------------------------------------------------------------------
 * Error
 * ---------------------------------------------------------------------------------------------- */

/**
 * A failure, with the retry the reader needs next to it.
 *
 * @group Components
 */
@Component({
    selector: 'p-assist-error-block',
    standalone: true,
    imports: [AssistGlyph, Button, Message],
    template: `
        <p-message severity="error">
            <span>{{ block().content }}</span>
            @if (block().retryable) {
                <p-button [text]="true" size="small" severity="danger" [label]="retryLabel()" (onClick)="retry.emit($event)">
                    <p-assist-glyph name="refresh" />
                </p-button>
            }
        </p-message>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-scope': 'aiassistview', 'data-part': 'error-block', class: 'p-aiassistview-error' }
})
export class AssistErrorBlockView {
    private readonly state = inject(ASSIST_STATE);

    /** The block. */
    readonly block = input.required<AssistErrorBlock>();

    /** Fired when the retry button is pressed. */
    readonly retry = output<Event>();

    /** @internal */
    protected readonly retryLabel = computed(() => this.state.labels().retry);
}

/* -------------------------------------------------------------------------------------------------
 * The list
 * ---------------------------------------------------------------------------------------------- */

/**
 * Every block of one answer, in order.
 *
 * @group Components
 */
@Component({
    selector: 'p-assist-blocks',
    standalone: true,
    imports: [AssistCodeBlockView, AssistErrorBlockView, AssistTextBlockView, AssistThinkingBlockView, AssistToolBlockView, NgTemplateOutlet],
    template: `
        @for (block of blocks(); track block.id ?? $index) {
            @if (blockTemplate(); as definition) {
                <ng-container *ngTemplateOutlet="definition; context: { $implicit: block, block, turn: turn(), index: index() }" />
            } @else {
                @switch (block.blockType) {
                    @case ('text') {
                        <p-assist-text-block [block]="asText(block)" [markdown]="markdown()" />
                    }
                    @case ('code') {
                        <p-assist-code-block [block]="asCode(block)" />
                    }
                    @case ('thinking') {
                        <p-assist-thinking-block [block]="asThinking(block)" [turn]="turn()" [index]="index()" (contextClick)="contextClick.emit($event)" />
                    }
                    @case ('tool') {
                        <p-assist-tool-block [block]="asTool(block)" [turn]="turn()" />
                    }
                    @case ('error') {
                        <p-assist-error-block [block]="asError(block)" (retry)="retry.emit($event)" />
                    }
                }
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-scope': 'aiassistview', 'data-part': 'blocks', class: 'p-aiassistview-blocks' }
})
export class AssistBlocks {
    private readonly templates = inject(ASSIST_TEMPLATES, { optional: true });

    /** The blocks. */
    readonly blocks = input<AssistResponseBlock[]>([]);

    /** The turn they belong to. */
    readonly turn = input<AssistPrompt | undefined>(undefined);

    /** Where that turn sits. */
    readonly index = input<number | undefined>(undefined);

    /** Whether text blocks are read as markdown. */
    readonly markdown = input(true, { transform: booleanAttribute });

    /** Fired when a clickable reasoning chip is activated. */
    readonly contextClick = output<AssistContextClickPayload>();

    /** Fired when an error block's retry is pressed. */
    readonly retry = output<Event>();

    /** @internal */
    protected blockTemplate() {
        return this.templates?.block()?.template;
    }

    // The narrowing helpers exist because a template's `@switch` does not narrow a discriminated
    // union the way TypeScript's own does, and an `$any()` in the binding would give the child no
    // type at all.

    /** @internal */
    protected asText(block: AssistResponseBlock): AssistTextBlock {
        return block as AssistTextBlock;
    }

    /** @internal */
    protected asCode(block: AssistResponseBlock): AssistCodeBlock {
        return block as AssistCodeBlock;
    }

    /** @internal */
    protected asThinking(block: AssistResponseBlock): AssistThinkingBlock {
        return block as AssistThinkingBlock;
    }

    /** @internal */
    protected asTool(block: AssistResponseBlock): AssistToolBlock {
        return block as AssistToolBlock;
    }

    /** @internal */
    protected asError(block: AssistResponseBlock): AssistErrorBlock {
        return block as AssistErrorBlock;
    }
}

/** Every block renderer, for the module to import and export in one go. @internal */
export const ASSIST_BLOCK_VIEWS = [AssistBlocks, AssistTextBlockView, AssistCodeBlockView, AssistThinkingBlockView, AssistToolBlockView, AssistErrorBlockView] as const;

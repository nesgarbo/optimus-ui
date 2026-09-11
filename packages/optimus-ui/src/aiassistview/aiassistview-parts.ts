import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, effect, inject, input, output, untracked, viewChild } from '@angular/core';
import { Badge } from '@openng/optimus-ui/badge';
import { Button } from '@openng/optimus-ui/button';
import { Tab, TabList, Tabs } from '@openng/optimus-ui/tabs';
import { Toolbar } from '@openng/optimus-ui/toolbar';
import { InputGroup } from '@openng/optimus-ui/inputgroup';
import { InputGroupAddon } from '@openng/optimus-ui/inputgroupaddon';
import { Textarea } from '@openng/optimus-ui/textarea';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import type { AssistSuggestion } from '@openng/optimus-ui/types/aiassistview';
import { ASSIST_COMMANDS } from './aiassistview-context';
import { AssistGlyph } from './aiassistview-icons';
import { AssistAttachmentList } from './aiassistview-message';
import { ASSIST_TEMPLATES } from './aiassistview-registry';
import { ASSIST_STATE } from './aiassistview-state';
import { AssistToolbar } from './aiassistview-toolbar';

/**
 * The chrome around the transcript: the header, the empty state, the suggestion chips and the
 * composer.
 *
 * Each is a component rather than a stretch of the root's template, so a product can import one on
 * its own — a suggestion strip on a landing page, the composer inside a different shell — and so the
 * root's template stays short enough to read.
 *
 * The view switcher is the library's own `p-tabs`, and the composer is a `pTextarea` with real
 * buttons beside it. Neither is a lookalike: the tabs bring their own ink bar, scrolling and roving
 * focus, and the field brings the same border, focus ring and invalid state every other form control
 * in the application has.
 *
 * @module aiassistview-parts
 */

/* -------------------------------------------------------------------------------------------------
 * Header
 * ---------------------------------------------------------------------------------------------- */

/**
 * Title, view switcher and header toolbar.
 *
 * @group Components
 */
@Component({
    selector: 'p-assist-header',
    standalone: true,
    imports: [AssistToolbar, Badge, NgTemplateOutlet, Tab, TabList, Tabs, Toolbar],
    template: `
        <p-toolbar styleClass="p-aiassistview-header">
            <ng-template #start>
                <div class="p-aiassistview-header-start">
                    @if (template(); as definition) {
                        <ng-container *ngTemplateOutlet="definition" />
                    } @else {
                        @if (heading()) {
                            <span class="p-aiassistview-title">{{ heading() }}</span>
                        }
                        @if (state.views().length > 1) {
                            <p-tabs #tabs [value]="state.activeView()" (valueChange)="select($event)">
                                <p-tablist>
                                    @for (view of state.views(); track view.id ?? $index) {
                                        <p-tab [value]="$index" [disabled]="!!view.disabled || state.disabled()">
                                            @if (view.iconCss) {
                                                <span [class]="view.iconCss" aria-hidden="true"></span>
                                            }
                                            <span>{{ view.name }}</span>
                                            @if (view.badge != null) {
                                                <p-badge [value]="view.badge" severity="contrast" />
                                            }
                                        </p-tab>
                                    }
                                </p-tablist>
                            </p-tabs>
                        }
                    }
                </div>
            </ng-template>
            <ng-template #end>
                @if (state.headerToolbarItems().length) {
                    <p-assist-toolbar kind="header" [items]="state.headerToolbarItems()" [disabled]="state.disabled()" (itemClick)="commands?.toolbarItemClick($event)" />
                }
                <ng-content />
            </ng-template>
        </p-toolbar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-scope': 'aiassistview', 'data-part': 'header', style: 'display:block' }
})
export class AssistHeader {
    /** @internal */
    protected readonly state = inject(ASSIST_STATE);

    /** @internal */
    protected readonly commands = inject(ASSIST_COMMANDS, { optional: true });

    private readonly templates = inject(ASSIST_TEMPLATES, { optional: true });

    /** What the title says. */
    readonly heading = input<string | undefined>(undefined);

    /**
     * Identity the tabs derive their element ids from.
     *
     * The root passes its own, so the panel it renders in the body can carry the exact id each tab's
     * `aria-controls` points at. Without it the tabs would name a panel that is not there — the
     * transcript is not inside a `p-tabpanels`, because the composer has to stay outside it.
     */
    readonly idPrefix = input('p-assist');

    private readonly tabs = viewChild(Tabs);

    constructor() {
        effect(() => {
            const tabs = this.tabs();
            const prefix = this.idPrefix();

            if (tabs) untracked(() => tabs.id.set(prefix));
        });
    }

    /** @internal */
    protected template() {
        return this.templates?.header()?.template;
    }

    /** @internal */
    protected select(value: unknown): void {
        this.state.setActiveView(Number(value));
    }
}

/* -------------------------------------------------------------------------------------------------
 * Banner
 * ---------------------------------------------------------------------------------------------- */

/**
 * What fills the transcript before the first turn.
 *
 * @group Components
 */
@Component({
    selector: 'p-assist-banner',
    standalone: true,
    imports: [AssistGlyph, NgTemplateOutlet],
    template: `
        @if (template(); as definition) {
            <ng-container *ngTemplateOutlet="definition; context: { send: send }" />
        } @else {
            <p-assist-glyph class="p-aiassistview-banner-icon" name="sparkles" />
            <span class="p-aiassistview-banner-title">{{ state.labels().emptyTitle }}</span>
            <span>{{ state.labels().emptySubtitle }}</span>
        }
        <ng-content />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-scope': 'aiassistview', 'data-part': 'banner', class: 'p-aiassistview-banner' }
})
export class AssistBanner {
    /** @internal */
    protected readonly state = inject(ASSIST_STATE);

    private readonly commands = inject(ASSIST_COMMANDS, { optional: true });

    private readonly templates = inject(ASSIST_TEMPLATES, { optional: true });

    /** @internal Handed to the template so a banner can offer starters of its own. */
    protected readonly send = (prompt: string) => this.commands?.send(prompt);

    /** @internal */
    protected template() {
        return this.templates?.banner()?.template;
    }
}

/* -------------------------------------------------------------------------------------------------
 * Suggestions
 * ---------------------------------------------------------------------------------------------- */

/**
 * The canned prompts.
 *
 * @group Components
 */
@Component({
    selector: 'p-assist-suggestions',
    standalone: true,
    imports: [Button, NgTemplateOutlet],
    template: `
        @if (header()) {
            <span class="p-aiassistview-suggestions-header">{{ header() }}</span>
        }
        <ul class="p-aiassistview-suggestion-list">
            @for (suggestion of state.suggestions(); track suggestion.id ?? $index) {
                <li>
                    @if (template(); as definition) {
                        <ng-container *ngTemplateOutlet="definition; context: { $implicit: suggestion, suggestion, index: $index }" />
                    } @else {
                        <p-button [outlined]="true" [rounded]="true" severity="secondary" size="small" [disabled]="!!suggestion.disabled || state.disabled() || state.busy()" (onClick)="take(suggestion, $index)">
                            @if (suggestion.iconCss) {
                                <span [class]="suggestion.iconCss" aria-hidden="true"></span>
                            }
                            <span>
                                {{ suggestion.text }}
                                @if (suggestion.description) {
                                    <span class="p-aiassistview-suggestion-description">{{ suggestion.description }}</span>
                                }
                            </span>
                        </p-button>
                    }
                </li>
            }
        </ul>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-scope': 'aiassistview', 'data-part': 'suggestions', class: 'p-aiassistview-suggestions' }
})
export class AssistSuggestions {
    /** @internal */
    protected readonly state = inject(ASSIST_STATE);

    private readonly commands = inject(ASSIST_COMMANDS, { optional: true });

    private readonly templates = inject(ASSIST_TEMPLATES, { optional: true });

    /** Heading over the chips. */
    readonly header = input<string | undefined>(undefined);

    /** @internal */
    protected template() {
        return this.templates?.suggestion()?.template;
    }

    /** @internal */
    protected take(suggestion: AssistSuggestion, index: number): void {
        this.commands?.suggestionClick(suggestion, index);
    }
}

/* -------------------------------------------------------------------------------------------------
 * Footer
 * ---------------------------------------------------------------------------------------------- */

/**
 * The composer: the field, its attachments and the controls beside it.
 *
 * @group Components
 */
@Component({
    selector: 'p-assist-footer',
    standalone: true,
    imports: [AssistAttachmentList, AssistGlyph, AssistToolbar, Button, InputGroup, InputGroupAddon, NgTemplateOutlet, Textarea, Tooltip],
    template: `
        <div class="p-aiassistview-footer-inner">
            @if (template(); as definition) {
                <ng-container *ngTemplateOutlet="definition; context: templateContext()" />
            } @else {
                @if (state.footerToolbarItems().length && state.footerToolbarPosition() === 'bottom') {
                    <p-assist-toolbar kind="footer" [items]="state.footerToolbarItems()" [disabled]="state.disabled()" (itemClick)="commands?.toolbarItemClick($event)" />
                }

                @if (state.pendingAttachments().length) {
                    <ul class="p-aiassistview-attachments">
                        <p-assist-attachments [files]="state.pendingAttachments()" [editable]="true" />
                    </ul>
                }

                <p-inputgroup styleClass="p-aiassistview-composer">
                    @if (state.footerToolbarItems().length && state.footerToolbarPosition() === 'inline') {
                        <p-inputgroup-addon>
                            <p-assist-toolbar kind="footer" [items]="state.footerToolbarItems()" [disabled]="state.disabled()" (itemClick)="commands?.toolbarItemClick($event)" />
                        </p-inputgroup-addon>
                    }
                    @if (state.attachmentsEnabled()) {
                        <p-inputgroup-addon>
                            <p-button severity="secondary" variant="text" [disabled]="state.disabled()" [ariaLabel]="state.labels().attach" [pTooltip]="state.labels().attach" tooltipPosition="top" (onClick)="commands?.pickFiles()">
                                <p-assist-glyph name="paperclip" />
                            </p-button>
                        </p-inputgroup-addon>
                    }
                    @if (speechEnabled()) {
                        <p-inputgroup-addon>
                            <p-button
                                [severity]="state.listening() ? 'danger' : 'secondary'"
                                variant="text"
                                [styleClass]="state.listening() ? 'p-aiassistview-listening' : undefined"
                                [disabled]="state.disabled()"
                                [ariaLabel]="state.listening() ? state.labels().listening : state.labels().microphone"
                                [pTooltip]="state.listening() ? state.labels().listening : state.labels().microphone"
                                tooltipPosition="top"
                                [attr.aria-pressed]="state.listening()"
                                (onClick)="commands?.toggleListening()"
                            >
                                <p-assist-glyph name="microphone" />
                            </p-button>
                        </p-inputgroup-addon>
                    }

                    <textarea
                        #editor
                        pTextarea
                        class="p-aiassistview-editor"
                        rows="1"
                        [value]="state.prompt()"
                        [placeholder]="placeholder()"
                        [disabled]="state.disabled()"
                        [attr.aria-label]="placeholder()"
                        (input)="onInput($event)"
                        (keydown)="onKeydown($event)"
                        (paste)="pasted.emit($event)"
                        (focus)="state.editorFocused.set(true)"
                        (blur)="state.editorFocused.set(false)"
                    ></textarea>

                    <p-inputgroup-addon>
                        @if (state.busy()) {
                            <p-button severity="secondary" [ariaLabel]="state.labels().stop" [pTooltip]="state.labels().stop" tooltipPosition="top" (onClick)="commands?.stop()">
                                <p-assist-glyph name="stop" />
                            </p-button>
                        } @else {
                            <p-button [disabled]="!state.canSend()" [ariaLabel]="state.labels().send" [pTooltip]="state.labels().send" (onClick)="commands?.send()">
                                <p-assist-glyph name="send" />
                            </p-button>
                        }
                    </p-inputgroup-addon>
                </p-inputgroup>

                @if (showHint()) {
                    <span class="p-aiassistview-hint">{{ state.labels().sendHint }}</span>
                }
            }
            <ng-content />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-scope': 'aiassistview', 'data-part': 'footer', class: 'p-aiassistview-footer' }
})
export class AssistFooter {
    /** @internal */
    protected readonly state = inject(ASSIST_STATE);

    /** @internal */
    protected readonly commands = inject(ASSIST_COMMANDS, { optional: true });

    private readonly templates = inject(ASSIST_TEMPLATES, { optional: true });

    /** Placeholder of the field. */
    readonly placeholder = input<string>('');

    /** Whether the microphone button is offered. */
    readonly speechEnabled = input(false);

    /** Whether the send-key hint is drawn under the field. */
    readonly showHint = input(false);

    /** The field itself, so the root can focus it and the autosize can measure it. */
    readonly editorRef = viewChild<ElementRef<HTMLTextAreaElement>>('editor');

    /** Fired on a paste into the field, so the root can turn a pasted image into an attachment. */
    readonly pasted = output<ClipboardEvent>();

    constructor() {
        // The field grows with what it holds. Driven from an effect rather than the input handler so
        // a programmatic write — a suggestion taken, a dictation landing, the field cleared after a
        // send — resizes it too.
        effect(() => {
            const element = this.editorRef()?.nativeElement;
            // Read so the effect re-runs on every write, including the programmatic ones.
            const value = this.state.prompt();

            void value;

            if (!element) return;

            // Measure at the field's natural height first.
            element.style.height = 'auto';

            const oneRow = element.clientHeight;
            const needed = element.scrollHeight;

            // An explicit height opts the field out of the input group's stretch, which leaves it a
            // pixel or two shorter than the addons beside it. So it is set only once the content
            // actually needs more than one row; below that the group decides the height.
            element.style.height = needed > oneRow ? `${needed}px` : '';
        });
    }

    /** @internal */
    protected template() {
        return this.templates?.footer()?.template;
    }

    /** @internal */
    protected templateContext() {
        return {
            $implicit: this.state.prompt(),
            value: this.state.prompt(),
            busy: this.state.busy(),
            attachedFiles: this.state.pendingAttachments(),
            send: (prompt?: string) => this.commands?.send(prompt),
            stop: () => this.commands?.stop()
        };
    }

    /** @internal */
    protected onInput(event: Event): void {
        this.state.setPrompt((event.target as HTMLTextAreaElement).value);
    }

    /**
     * @internal
     *
     * Which key sends is configurable because the two conventions are genuinely split: a chat window
     * sends on Enter, a composer that expects paragraphs sends on Ctrl+Enter, and picking one for
     * everybody is wrong half the time.
     */
    protected onKeydown(event: KeyboardEvent): void {
        const trigger = this.state.sendTrigger();

        if (event.key !== 'Enter' || trigger === 'none') return;
        // A composition is in progress: Enter is accepting an IME candidate, not sending a message.
        if (event.isComposing) return;

        const wanted = trigger === 'enter' ? !event.shiftKey && !event.ctrlKey && !event.metaKey : event.ctrlKey || event.metaKey;

        if (!wanted) return;

        event.preventDefault();
        this.commands?.send();
    }
}

/** The chrome parts, for the module to import and export in one go. @internal */
export const ASSIST_PART_COMPONENTS = [AssistHeader, AssistBanner, AssistSuggestions, AssistFooter] as const;

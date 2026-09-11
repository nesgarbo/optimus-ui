import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, inject, input, output } from '@angular/core';
import { Button } from '@openng/optimus-ui/button';
import { Divider } from '@openng/optimus-ui/divider';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import type { AssistPrompt, AssistToolbarItem, AssistToolbarItemClickPayload } from '@openng/optimus-ui/types/aiassistview';
import { AssistGlyph, type AssistIconName } from './aiassistview-icons';
import { ASSIST_TEMPLATES } from './aiassistview-registry';
import { ASSIST_STATE } from './aiassistview-state';

/**
 * One strip of toolbar entries: the header's, a prompt's, a response's or the composer's.
 *
 * The same component for all four, and every entry is a real `p-button`. Syncfusion drives four
 * settings objects into an imperative `Toolbar` instance per strip; here the difference between the
 * strips is only which entries go in and what a click means, and the entries themselves are the same
 * buttons the rest of the library uses — same severities, same focus ring, same ripple.
 *
 * @module aiassistview-toolbar
 */

/** The glyph a well-known entry id draws when it brings no `iconCss` of its own. */
const BUILT_IN_ICONS: Record<string, AssistIconName> = {
    copy: 'copy',
    regenerate: 'refresh',
    like: 'thumbs-up',
    dislike: 'thumbs-down',
    edit: 'pencil',
    delete: 'trash',
    readAloud: 'speaker',
    stopReading: 'speaker-off',
    retry: 'refresh',
    clear: 'trash',
    attach: 'paperclip',
    microphone: 'microphone',
    send: 'send',
    stop: 'stop',
    new: 'plus'
};

/**
 * A row of toolbar entries.
 *
 * @group Components
 */
@Component({
    selector: 'p-assist-toolbar',
    standalone: true,
    imports: [AssistGlyph, Button, Divider, NgTemplateOutlet, Tooltip],
    template: `
        @for (item of items(); track item.id ?? $index) {
            @switch (item.type ?? 'button') {
                @case ('separator') {
                    <p-divider layout="vertical" styleClass="p-aiassistview-toolbar-separator" />
                }
                @case ('spacer') {
                    <span class="p-aiassistview-surface-spacer"></span>
                }
                @case ('template') {
                    @if (templateFor(item); as definition) {
                        <ng-container *ngTemplateOutlet="definition; context: contextFor(item)" />
                    }
                }
                @default {
                    <p-button
                        [text]="true"
                        [rounded]="!item.text"
                        [severity]="item.active ? 'primary' : 'secondary'"
                        size="small"
                        [label]="item.text"
                        [disabled]="!!item.disabled || disabled()"
                        [tabindex]="item.tabIndex"
                        [ariaLabel]="labelOf(item)"
                        [styleClass]="item.cssClass"
                        [pTooltip]="labelOf(item)"
                        tooltipPosition="top"
                        [attr.data-assist-item]="item.id ?? null"
                        [attr.data-assist-align]="item.align ?? null"
                        [attr.aria-pressed]="item.toggle ? (item.active ? 'true' : 'false') : null"
                        (onClick)="activate(item, $event)"
                    >
                        @if (item.iconCss) {
                            <span [class]="item.iconCss" aria-hidden="true"></span>
                        } @else if (glyphOf(item); as glyph) {
                            <p-assist-glyph [name]="glyph" />
                        }
                    </p-button>
                }
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        'data-scope': 'aiassistview',
        'data-part': 'toolbar',
        '[class]': 'hostClass()',
        '[attr.data-assist-toolbar]': 'kind()',
        role: 'toolbar'
    }
})
export class AssistToolbar {
    private readonly state = inject(ASSIST_STATE);
    private readonly templates = inject(ASSIST_TEMPLATES, { optional: true });

    /** The entries to draw. Already filtered for visibility by the caller. */
    readonly items = input<AssistToolbarItem[]>([]);

    /** Which strip this is. Travels out on every click so one handler can serve all four. */
    readonly kind = input<'header' | 'prompt' | 'response' | 'footer'>('header');

    /** The turn the strip belongs to, for the prompt and response strips. */
    readonly turn = input<AssistPrompt | undefined>(undefined);

    /** Where that turn sits. */
    readonly index = input<number | undefined>(undefined);

    /** Whether the strip stays out of sight until its message is hovered or focused. */
    readonly showOnHover = input(false, { transform: booleanAttribute });

    /** Whether every entry refuses the pointer, on top of each entry's own `disabled`. */
    readonly disabled = input(false, { transform: booleanAttribute });

    /** Fired when an entry is activated. The payload's `cancel` suppresses the built-in behaviour. */
    readonly itemClick = output<AssistToolbarItemClickPayload>();

    /** @internal */
    protected readonly hostClass = computed(() => {
        const classes = ['p-aiassistview-message-actions'];

        if (this.showOnHover()) classes.push('p-aiassistview-actions-on-hover');

        return classes.join(' ');
    });

    /** @internal */
    protected glyphOf(item: AssistToolbarItem): AssistIconName | null {
        return item.id ? (BUILT_IN_ICONS[item.id] ?? null) : null;
    }

    /**
     * What the tooltip and the accessible name say.
     *
     * A copy entry that has just copied says so, which is the only feedback a strip this small has
     * room for and the only one that survives being read out rather than seen.
     */
    protected labelOf(item: AssistToolbarItem): string {
        if (item.id === 'copy' && this.state.flashedItem() === this.flashKey(item)) return this.state.labels().copied;

        return item.tooltip ?? item.text ?? '';
    }

    /** @internal */
    protected templateFor(item: AssistToolbarItem) {
        const definitions = this.templates?.toolbarItems() ?? [];
        const named = definitions.find((definition) => definition.pAssistToolbarItemDef() === (item.template ?? item.id));

        return (named ?? definitions.find((definition) => !definition.pAssistToolbarItemDef()))?.template;
    }

    /** @internal */
    protected contextFor(item: AssistToolbarItem) {
        return { $implicit: item, item, toolbar: this.kind(), turn: this.turn(), index: this.index() };
    }

    /** @internal */
    protected activate(item: AssistToolbarItem, event: Event): void {
        this.itemClick.emit({ originalEvent: event, toolbar: this.kind(), item, turn: this.turn(), index: this.index() });
    }

    /** Identity of a flash, which has to include the turn or every copy button would flash at once. */
    private flashKey(item: AssistToolbarItem): string {
        return `${this.kind()}:${this.index() ?? -1}:${item.id ?? ''}`;
    }
}

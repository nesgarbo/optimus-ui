import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import {
    afterNextRender,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    DestroyRef,
    effect,
    ElementRef,
    EmbeddedViewRef,
    inject,
    input,
    NgModule,
    NgZone,
    numberAttribute,
    output,
    PLATFORM_ID,
    signal,
    TemplateRef,
    untracked,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { SharedModule } from '@openng/optimus-ui/api';
import { BaseComponent, PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { Bind } from '@openng/optimus-ui/bind';
import type { MentionBeforeOpenEvent, MentionFields, MentionFilteringEvent, MentionItemContext, MentionOption, MentionPassThrough, MentionSearchPattern, MentionSelectEvent } from '@openng/optimus-ui/types/mention';
import { disposeCaretMirror, selectionCaret, textFieldCaret, type CaretRect } from './mention-caret';
import { filterItems, findMention, replaceMention, stepActive, toOptions, type MentionMatch } from './mention-engine';
import { MentionStyle } from './style/mentionstyle';

type Target = HTMLInputElement | HTMLTextAreaElement | HTMLElement;

/** What the caret is inside: a text field, or the text node of a `contenteditable`. */
interface CaretContext {
    text: string;
    caret: number;
    node?: Text;
}

const isTextField = (el: Element): el is HTMLInputElement | HTMLTextAreaElement => el.nodeName === 'INPUT' || el.nodeName === 'TEXTAREA';

let nextId = 0;

/**
 * Mention opens a list of items when the user types a trigger character, `@` by default, into a
 * `textarea`, an `input` or a `contenteditable` element, and writes the pick back into the text.
 *
 * The API follows Syncfusion's Mention: `dataSource`, `fields`, `mentionChar`, `suggestionCount`, `minLength`,
 * `allowSpaces`, `showMentionChar`, `ignoreCase`, `searchPattern`, `sortOrder`, `popupWidth`, `popupHeight`,
 * `target`, the `filtering`, `opened`, `closed` and `beforeOpen` events and the `showPopup` and `hidePopup`
 * methods. The `select` event is called `itemSelect` here, so that it does not collide with the browser's own.
 *
 * Put the field inside the component, or point `target` at one elsewhere.
 *
 * @group Components
 */
@Component({
    selector: 'p-mention',
    standalone: true,
    imports: [NgTemplateOutlet, SharedModule],
    template: `
        <ng-content />
        <div #popup popover="manual" [class]="cx('popup')" [style.left.px]="left()" [style.top.px]="top()" [style.width]="popupWidth()" [style.max-height]="popupHeight()" (mousedown)="$event.preventDefault()">
            @if (isOpen()) {
                @if (headerTpl(); as header) {
                    <div [class]="cx('header')"><ng-container *ngTemplateOutlet="header" /></div>
                }
                <ul #list role="listbox" [class]="cx('list')" [id]="listId" [attr.aria-label]="ariaLabel() || suggestionsLabel()">
                    @for (option of options(); track option.index) {
                        @if (option.group !== undefined && (option.index === 0 || options()[option.index - 1].group !== option.group)) {
                            <li role="presentation" [class]="cx('group')">{{ option.group }}</li>
                        }
                        <li
                            role="option"
                            [id]="optionId(option.index)"
                            [class]="cx('item', { option })"
                            [attr.aria-selected]="activeIndex() === option.index"
                            [attr.aria-disabled]="option.disabled ? 'true' : null"
                            (click)="choose(option, $event)"
                            (mousemove)="hover(option)"
                        >
                            @if (itemTpl(); as tpl) {
                                <ng-container *ngTemplateOutlet="tpl; context: { $implicit: option.item, text: option.text, active: activeIndex() === option.index }" />
                            } @else {
                                @if (option.iconCss) {
                                    <span [class]="cx('icon') + ' ' + option.iconCss" aria-hidden="true"></span>
                                }
                                <span>{{ option.text }}</span>
                            }
                        </li>
                    } @empty {
                        <li role="presentation" [class]="cx('empty')">
                            @if (noRecordsTpl(); as tpl) {
                                <ng-container *ngTemplateOutlet="tpl" />
                            } @else {
                                {{ noRecordsText() }}
                            }
                        </li>
                    }
                </ul>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [MentionStyle, { provide: PARENT_INSTANCE, useExisting: Mention }],
    host: { '[class]': 'cx("root")', 'data-scope': 'mention', 'data-part': 'root' },
    hostDirectives: [Bind]
})
export class Mention extends BaseComponent<MentionPassThrough> {
    componentName = 'Mention';

    /** @internal */
    _componentStyle = inject(MentionStyle);

    private readonly bindDirectiveInstance = inject(Bind, { self: true });
    private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
    private readonly destroyRef = inject(DestroyRef);
    private readonly popupRef = viewChild.required<ElementRef<HTMLElement>>('popup');

    /** @internal */
    readonly listId = `p-mention-list-${nextId++}`;

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    // ---------------------------------------------------------------------------------------------
    // Props
    // ---------------------------------------------------------------------------------------------

    /**
     * The items offered. Strings, or objects read through `fields`.
     * @group Props
     */
    readonly dataSource = input<any[]>([]);
    /**
     * Where the text, value, icon, group and disabled flag of an object item live.
     * @group Props
     */
    readonly fields = input<MentionFields>({ text: 'text' });
    /**
     * The character that opens the list.
     * @group Props
     */
    readonly mentionChar = input<string>('@');
    /**
     * Most items shown.
     * @group Props
     */
    readonly suggestionCount = input(25, { transform: numberAttribute });
    /**
     * Fewest characters after the trigger before the list opens.
     * @group Props
     */
    readonly minLength = input(0, { transform: numberAttribute });
    /**
     * Lets the typed text contain spaces, for names of more than one word.
     * @group Props
     */
    readonly allowSpaces = input(false, { transform: booleanAttribute });
    /**
     * Writes the trigger character in front of the inserted text.
     * @group Props
     */
    readonly showMentionChar = input(false, { transform: booleanAttribute });
    /**
     * Requires the trigger to start the text or follow whitespace, so that an e-mail address does not open the list.
     * @group Props
     */
    readonly requireLeadingSpace = input(true, { transform: booleanAttribute });
    /**
     * Matches without regard to case.
     * @group Props
     */
    readonly ignoreCase = input(true, { transform: booleanAttribute });
    /**
     * How the typed text is matched against an item.
     * @group Props
     */
    readonly searchPattern = input<MentionSearchPattern>('startsWith');
    /**
     * Order of the items.
     * @group Props
     */
    readonly sortOrder = input<'none' | 'ascending' | 'descending'>('none');
    /**
     * Width of the list. `auto` follows the target, within 12 to 24rem.
     * @group Props
     */
    readonly popupWidth = input<string>('auto');
    /**
     * Tallest the list gets before it scrolls.
     * @group Props
     */
    readonly popupHeight = input<string>('300px');
    /**
     * The text field, as an element or a CSS selector. Left out, the first `textarea`, `input` or
     * `contenteditable` element inside the component is used.
     * @group Props
     */
    readonly target = input<HTMLElement | string | null | undefined>(undefined);
    /**
     * Turns the list off.
     * @group Props
     */
    readonly disabled = input(false, { transform: booleanAttribute });
    /**
     * Accessible name of the list.
     * @group Props
     */
    readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
    /**
     * Accessible name of the list when `aria-label` is not set.
     * @group Props
     */
    readonly suggestionsLabel = input('Suggestions');
    /**
     * Text of the list when nothing matches and there is no `#noRecords` template.
     * @group Props
     */
    readonly noRecordsText = input('No records found');

    // ---------------------------------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------------------------------

    /**
     * Fires when an item is picked, before it is written. Set `cancel` to keep the text as typed.
     * @group Emits
     */
    readonly itemSelect = output<MentionSelectEvent>();
    /**
     * Fires as the typed text changes. Set `cancel` and call `updateData` to answer from a server.
     * @group Emits
     */
    readonly filtering = output<MentionFilteringEvent>();
    /**
     * Fires before the list opens. Set `cancel` to keep it closed.
     * @group Emits
     */
    readonly beforeOpen = output<MentionBeforeOpenEvent>();
    /**
     * Fires after the list opened.
     * @group Emits
     */
    readonly opened = output<void>();
    /**
     * Fires after the list closed.
     * @group Emits
     */
    readonly closed = output<void>();

    // ---------------------------------------------------------------------------------------------
    // Templates
    // ---------------------------------------------------------------------------------------------

    /** Template of one item. Reference it as `#item`. Context: `$implicit` (the item), `text`, `active`. @group Templates */
    readonly itemTpl = contentChild<TemplateRef<MentionItemContext>>('item');
    /** Template shown when nothing matches. Reference it as `#noRecords`. @group Templates */
    readonly noRecordsTpl = contentChild<TemplateRef<void>>('noRecords');
    /** Template over the list. Reference it as `#header`. @group Templates */
    readonly headerTpl = contentChild<TemplateRef<void>>('header');
    /**
     * Template of the chip a `contenteditable` target gets. Reference it as `#display`. Context: `$implicit` (the item), `text`.
     * @group Templates
     */
    readonly displayTpl = contentChild<TemplateRef<{ $implicit: any; text: string }>>('display');

    // ---------------------------------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------------------------------

    private readonly pool = signal<any[] | null>(null);
    private readonly match = signal<MentionMatch | null>(null);
    private readonly open = signal(false);
    private targetEl: Target | null = null;
    private context: CaretContext | null = null;
    private chipViews: EmbeddedViewRef<any>[] = [];
    private readonly zone = inject(NgZone);
    /** Text and caret the last evaluation read: the same pair again changes nothing. */
    private lastKey: string | null = null;
    private placeFrame = 0;

    /** `true` while the list is showing. */
    readonly isOpen = this.open.asReadonly();
    /** Index of the highlighted row, -1 for none. @internal */
    readonly activeIndex = signal(-1);
    /** @internal */
    readonly left = signal(0);
    /** @internal */
    readonly top = signal(0);

    /** The rows drawn. @internal */
    readonly options = computed<MentionOption[]>(() => {
        const match = this.match();
        const fields = this.fields();
        const source = this.pool() ?? filterItems(this.dataSource(), match?.query ?? '', { fields, ignoreCase: this.ignoreCase(), pattern: this.searchPattern(), limit: this.suggestionCount(), sort: this.sortOrder() });

        return toOptions(this.pool() ? source.slice(0, this.suggestionCount() || undefined) : source, fields);
    });

    constructor() {
        super();

        afterNextRender(() => this.attach());

        // A new `target` moves the listeners.
        effect(() => {
            this.target();

            if (this.browser && untracked(() => this.targetEl)) untracked(() => this.attach());
        });

        // The popover is in the top layer, so it needs no z-index and no portal.
        effect(() => {
            const open = this.open();

            untracked(() => {
                const el = this.popupRef()?.nativeElement;

                if (!el || !this.browser) return;

                if (open && !el.matches(':popover-open')) el.showPopover?.();
                else if (!open && el.matches(':popover-open')) el.hidePopover?.();
            });
        });

        effect(() => {
            const options = this.options();

            untracked(() => {
                if (!this.open()) return;

                const current = this.activeIndex();

                this.activeIndex.set(current >= 0 && current < options.length && !options[current].disabled ? current : stepActive(options, -1, 1));
                this.placeSoon();
            });
        });

        // Keeps the target's ARIA in step with the list.
        effect(() => {
            // The signals are read before the target is, so the effect keeps listening while there is none yet.
            const open = this.open();
            const active = this.activeIndex();
            const el = this.targetEl;

            if (!el) return;

            el.setAttribute('aria-expanded', String(open));
            open && active >= 0 ? el.setAttribute('aria-activedescendant', this.optionId(active)) : el.removeAttribute('aria-activedescendant');
        });

        this.destroyRef.onDestroy(() => this.detach());
    }

    /** @internal */
    optionId(index: number): string {
        return `${this.listId}-${index}`;
    }

    // ---------------------------------------------------------------------------------------------
    // Target
    // ---------------------------------------------------------------------------------------------

    private resolveTarget(): Target | null {
        const target = this.target();
        const host = this.el.nativeElement as HTMLElement;

        if (typeof target === 'string') return host.ownerDocument.querySelector<HTMLElement>(target);
        if (target) return target;

        return host.querySelector<HTMLElement>('textarea, input:not([type]), input[type="text"], input[type="search"], [contenteditable=""], [contenteditable="true"]');
    }

    // One keystroke fires `input`, `keyup` and `selectionchange` for the same text and caret: only the first one needs to work.
    private readonly onInput = () => this.evaluate();
    private readonly onKeyup = (e: KeyboardEvent) => !['ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape'].includes(e.key) && this.evaluate();
    private readonly onClick = () => this.evaluate(true);
    private readonly onBlur = () => {
        this.lastKey = null;
        this.stopSelectionWatch();
        this.close();
    };
    private readonly onFocus = () => this.startSelectionWatch();

    /** `selectionchange` is the document's and fires for every selection on the page: it is listened to outside the zone, and only while the target has the focus. */
    private readonly onSelectionChange = () => {
        const el = this.targetEl;

        if (!el || el.ownerDocument.activeElement !== el) return;

        const context = this.readContext();

        if (this.keyOf(context) === this.lastKey) return;

        this.zone.run(() => this.evaluate());
    };

    private selectionWatch: Document | null = null;

    private startSelectionWatch(): void {
        const doc = this.targetEl?.ownerDocument;

        if (!doc || this.selectionWatch) return;

        this.selectionWatch = doc;
        this.zone.runOutsideAngular(() => doc.addEventListener('selectionchange', this.onSelectionChange));
    }

    private stopSelectionWatch(): void {
        this.selectionWatch?.removeEventListener('selectionchange', this.onSelectionChange);
        this.selectionWatch = null;
    }

    private keyOf(context: CaretContext | null): string | null {
        return context ? `${context.caret}:${context.text}` : null;
    }

    private readonly onKeydown = (event: KeyboardEvent) => {
        if (!this.open()) return;

        const options = this.options();

        switch (event.key) {
            case 'ArrowDown':
            case 'ArrowUp':
                this.activeIndex.set(stepActive(options, this.activeIndex(), event.key === 'ArrowDown' ? 1 : -1));
                this.scrollToActive();
                break;
            case 'Enter':
            case 'Tab': {
                const option = options[this.activeIndex()];

                if (!option) return this.close();

                this.choose(option, event);
                break;
            }
            case 'Escape':
                this.close();
                break;
            default:
                return;
        }

        event.preventDefault();
        event.stopPropagation();
    };

    private attach(): void {
        this.detach();

        const el = this.resolveTarget();

        if (!el) return;

        this.targetEl = el;
        el.addEventListener('input', this.onInput);
        el.addEventListener('keyup', this.onKeyup);
        el.addEventListener('click', this.onClick);
        el.addEventListener('blur', this.onBlur);
        el.addEventListener('focus', this.onFocus);
        // Capture, so the list answers the arrows and Enter before an editor's own handlers do.
        el.addEventListener('keydown', this.onKeydown, true);
        if (el.ownerDocument.activeElement === el) this.startSelectionWatch();

        el.setAttribute('aria-autocomplete', 'list');
        el.setAttribute('aria-controls', this.listId);
        el.setAttribute('aria-haspopup', 'listbox');
        el.setAttribute('aria-expanded', String(this.open()));
    }

    private detach(): void {
        const el = this.targetEl;

        if (!el) return;

        el.removeEventListener('input', this.onInput);
        el.removeEventListener('keyup', this.onKeyup);
        el.removeEventListener('click', this.onClick);
        el.removeEventListener('blur', this.onBlur);
        el.removeEventListener('focus', this.onFocus);
        el.removeEventListener('keydown', this.onKeydown, true);
        this.stopSelectionWatch();
        disposeCaretMirror(el);
        this.lastKey = null;
        if (this.browser) cancelAnimationFrame(this.placeFrame);
        this.placeFrame = 0;
        ['aria-autocomplete', 'aria-controls', 'aria-haspopup', 'aria-expanded', 'aria-activedescendant'].forEach((a) => el.removeAttribute(a));
        this.targetEl = null;
        this.chipViews.forEach((v) => v.destroy());
        this.chipViews = [];
    }

    // ---------------------------------------------------------------------------------------------
    // Detecting a mention
    // ---------------------------------------------------------------------------------------------

    private readContext(): CaretContext | null {
        const el = this.targetEl;

        if (!el) return null;

        if (isTextField(el)) return el.selectionStart === el.selectionEnd && el.selectionStart !== null ? { text: el.value, caret: el.selectionStart } : null;

        const selection = el.ownerDocument.getSelection();
        const node = selection?.focusNode;

        if (!selection?.isCollapsed || !node || node.nodeType !== Node.TEXT_NODE || !el.contains(node)) return null;

        return { text: (node as Text).data, caret: selection.focusOffset, node: node as Text };
    }

    private evaluate(force = false): void {
        if (this.disabled()) return this.close();

        const context = this.readContext();
        const key = this.keyOf(context);

        if (!force && key === this.lastKey) return;

        this.lastKey = key;
        const match = context ? findMention(context.text, context.caret, { mentionChar: this.mentionChar(), allowSpaces: this.allowSpaces(), minLength: this.minLength(), requireLeadingSpace: this.requireLeadingSpace() }) : null;

        this.context = context;

        if (!match) return this.close();

        const changed = this.match()?.query !== match.query;

        this.match.set(match);

        if (changed) {
            this.pool.set(null);

            const event: MentionFilteringEvent = { text: match.query, cancel: false, updateData: (items) => this.pool.set(items ?? []) };

            this.filtering.emit(event);
        }

        if (!this.open()) this.show();
        else this.placeSoon();
    }

    // ---------------------------------------------------------------------------------------------
    // Popup
    // ---------------------------------------------------------------------------------------------

    private show(): void {
        const before: MentionBeforeOpenEvent = { cancel: false };

        this.beforeOpen.emit(before);

        if (before.cancel) return;

        this.activeIndex.set(stepActive(this.options(), -1, 1));
        this.open.set(true);
        this.opened.emit();
        this.cd.markForCheck();
        this.placeSoon();
    }

    /** Places the list on the next frame: a keystroke asks for it from several places, and one frame answers them all. */
    private placeSoon(): void {
        if (!this.browser || this.placeFrame) return;

        this.placeFrame = requestAnimationFrame(() => {
            this.placeFrame = 0;
            this.place();
        });
    }

    private close(): void {
        if (!this.open()) {
            this.match.set(null);

            return;
        }

        this.open.set(false);
        this.match.set(null);
        this.pool.set(null);
        this.activeIndex.set(-1);

        if (this.targetEl) disposeCaretMirror(this.targetEl);

        this.closed.emit();
        this.cd.markForCheck();
    }

    private caret(): CaretRect | null {
        const el = this.targetEl;

        if (!el || !this.context || !this.match()) return null;

        return isTextField(el) ? textFieldCaret(el, this.context.caret) : selectionCaret(el.ownerDocument);
    }

    private place(): void {
        if (!this.browser || !this.open()) return;

        const caret = this.caret();
        const popup = this.popupRef().nativeElement;

        if (!caret) return;

        const gap = 4;
        const width = popup.offsetWidth || 240;
        const height = popup.offsetHeight || 0;
        const view = popup.ownerDocument.documentElement;
        let left = Math.min(caret.left, view.clientWidth - width - 8);
        let top = caret.bottom + gap;

        // Not enough room below: open above the line.
        if (top + height > view.clientHeight - 8 && caret.top - gap - height > 8) top = caret.top - gap - height;

        left = Math.max(8, left);
        this.left.set(left);
        this.top.set(top);
    }

    private scrollToActive(): void {
        const el = this.popupRef().nativeElement.querySelector<HTMLElement>(`#${CSS.escape(this.optionId(this.activeIndex()))}`);

        el?.scrollIntoView?.({ block: 'nearest' });
    }

    /** @internal */
    hover(option: MentionOption): void {
        if (!option.disabled && this.activeIndex() !== option.index) this.activeIndex.set(option.index);
    }

    // ---------------------------------------------------------------------------------------------
    // Picking
    // ---------------------------------------------------------------------------------------------

    /** @internal */
    choose(option: MentionOption, originalEvent?: Event): void {
        const match = this.match();
        const context = this.context;
        const el = this.targetEl;

        if (!match || !context || !el || option.disabled) return;

        const text = `${this.showMentionChar() ? this.mentionChar() : ''}${option.text}`;
        const event: MentionSelectEvent = { item: option.item, text, cancel: false, originalEvent };

        this.itemSelect.emit(event);

        if (event.cancel) return;

        if (isTextField(el)) {
            const next = replaceMention(context.text, match, text);

            el.value = next.text;
            el.setSelectionRange(next.caret, next.caret);
            // The text changed from the outside: let `ngModel`, `formControl` and `[formField]` know.
            el.dispatchEvent(new Event('input', { bubbles: true }));
        } else if (context.node) {
            this.insertChip(context.node, match, option, text);
        }

        el.focus();
        this.close();
    }

    private insertChip(node: Text, match: MentionMatch, option: MentionOption, text: string): void {
        const doc = node.ownerDocument;
        const chip = doc.createElement('span');
        const tpl = this.displayTpl();

        chip.className = 'p-mention-chip';
        chip.contentEditable = 'false';
        chip.dataset['mention'] = String(option.value);

        if (tpl) {
            const view = tpl.createEmbeddedView({ $implicit: option.item, text });

            view.detectChanges();
            view.rootNodes.forEach((n) => chip.appendChild(n));
            // A chip the user deleted took its view with it: the views of those are let go, so that they do not pile up.
            this.chipViews = this.chipViews.filter((v) => {
                const root = v.rootNodes[0] as Node | undefined;

                if (root?.isConnected !== false) return true;

                v.destroy();

                return false;
            });
            this.chipViews.push(view);
        } else {
            chip.textContent = text;
        }

        // The node is cut in three: what came before, the chip, and a space followed by what came after.
        const range = doc.createRange();

        range.setStart(node, match.start);
        range.setEnd(node, match.end);
        range.deleteContents();

        const space = doc.createTextNode(' ');

        range.insertNode(space);
        range.insertNode(chip);

        const selection = doc.getSelection();

        selection?.removeAllRanges();

        const caret = doc.createRange();

        caret.setStartAfter(space);
        caret.collapse(true);
        selection?.addRange(caret);
        this.targetEl?.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // ---------------------------------------------------------------------------------------------
    // Methods
    // ---------------------------------------------------------------------------------------------

    /** Opens the list for the mention at the caret, if there is one. Mirrors Syncfusion's `showPopup`. */
    showPopup(): void {
        this.evaluate(true);
    }

    /** Closes the list. Mirrors Syncfusion's `hidePopup`. */
    hidePopup(): void {
        this.close();
    }
}

/**
 * @group Modules
 */
@NgModule({
    imports: [Mention, SharedModule],
    exports: [Mention, SharedModule]
})
export class MentionModule {}

import { NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    forwardRef,
    inject,
    InjectionToken,
    NgZone,
    input,
    NgModule,
    output,
    numberAttribute,
    Pipe,
    SecurityContext,
    PipeTransform,
    signal,
    TemplateRef,
    viewChild,
    ViewEncapsulation,
    ViewRef,
    contentChild,
    contentChildren,
    linkedSignal
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { MotionEvent, MotionOptions } from '@openng/optimus-ui-motion';
import { absolutePosition, addStyle, appendChild, find, findSingle, focus, isTouchDevice, uuid } from '@openng/optimus-ui-utils';
import { MenuItem, OverlayService, PrimeTemplate, SharedModule } from '@openng/optimus-ui/api';
import { BadgeModule } from '@openng/optimus-ui/badge';
import { BaseComponent, PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { Bind, BindModule } from '@openng/optimus-ui/bind';
import { ConnectedOverlayScrollHandler } from '@openng/optimus-ui/dom';
import { MotionModule } from '@openng/optimus-ui/motion';
import { Ripple } from '@openng/optimus-ui/ripple';
import { TooltipModule } from '@openng/optimus-ui/tooltip';
import { VoidListener } from '@openng/optimus-ui/ts-helpers';
import { MenuItemTemplateContext, MenuPassThrough, MenuSubmenuHeaderTemplateContext } from '@openng/optimus-ui/types/menu';
import { ZIndexUtils } from '@openng/optimus-ui/utils';
import { MenuStyle } from './style/menustyle';

const MENU_INSTANCE = new InjectionToken<Menu>('MENU_INSTANCE');

@Pipe({
    name: 'safeHtml',
    standalone: true
})
export class SafeHtmlPipe implements PipeTransform {
    private readonly sanitizer = inject(DomSanitizer);

    public transform(value: string): SafeHtml {
        if (!value) {
            return value;
        }

        // Pasa por el sanitizador de Angular (tambien en SSR); no se confia en el HTML de la etiqueta.
        return this.sanitizer.sanitize(SecurityContext.HTML, value) ?? '';
    }
}

const MENU_ITEM_KEYS = [
    'label',
    'icon',
    'disabled',
    'visible',
    'separator',
    'badge',
    'badgeStyleClass',
    'styleClass',
    'style',
    'title',
    'url',
    'target',
    'routerLink',
    'queryParams',
    'queryParamsHandling',
    'fragment',
    'preserveFragment',
    'skipLocationChange',
    'replaceUrl',
    'state',
    'routerLinkActiveOptions',
    'automationId',
    'linkClass',
    'linkStyle',
    'iconClass',
    'iconStyle',
    'labelClass',
    'labelStyle',
    'escape',
    'items'
] as const;

/** Reads the item properties the template depends on, plus the number of children, so two reads can be compared cheaply. */
function readMenuItem(item: any, into: unknown[]): unknown[] {
    for (let i = 0; i < MENU_ITEM_KEYS.length; i++) {
        into[i] = item[MENU_ITEM_KEYS[i]];
    }
    into[MENU_ITEM_KEYS.length] = item.items?.length;
    return into;
}

function menuItemChanged(item: any, seen: unknown[]): boolean {
    for (let i = 0; i < MENU_ITEM_KEYS.length; i++) {
        if (seen[i] !== item[MENU_ITEM_KEYS[i]]) {
            return true;
        }
    }
    return seen[MENU_ITEM_KEYS.length] !== item.items?.length;
}

@Component({
    // OnPush: an item mutated in place (item.label = 'x', item.disabled = true) still repaints. ngDoCheck runs whenever the parent Menu is refreshed (the
    // same moment an Eager view would be refreshed) and compares the ~25 item properties the template reads against the last seen values; only an item
    // that changed calls markForCheck. Cost: ~25 property reads per rendered item per Menu refresh (see the 1000 items test). Mutating something nested
    // inside an item property (item.style.color = 'x', item.queryParams.a = 1) is not seen: assign a new object. Today the Menu also re-dirties each item at
    // every refresh through the unstable [pBind]="ptm('item')" binding on the item host, so this check is the guarantee that survives a stable binding.
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: '[pMenuItemContent]',
    standalone: true,
    imports: [NgTemplateOutlet, RouterModule, Ripple, TooltipModule, BadgeModule, SharedModule, SafeHtmlPipe, BindModule],
    template: ` <div [class]="cx('itemContent')" (click)="onItemClick($event, item())" [attr.data-pc-section]="'content'" [pBind]="getPTOptions('itemContent')">
        @if (!itemTemplate()) {
            @if (!item()?.routerLink) {
                <a
                    [attr.title]="item().title"
                    [attr.href]="item().url || null"
                    [attr.data-automationid]="item().automationId"
                    [attr.tabindex]="-1"
                    [class]="cn(cx('itemLink'), item()?.linkClass)"
                    [style]="item()?.linkStyle"
                    [target]="item().target"
                    [pBind]="getPTOptions('itemLink')"
                    pRipple
                >
                    <ng-container *ngTemplateOutlet="itemContent; context: { $implicit: item() }"></ng-container>
                </a>
            }
            @if (item()?.routerLink) {
                <a
                    [routerLink]="item().routerLink"
                    [attr.data-automationid]="item().automationId"
                    [attr.tabindex]="-1"
                    [attr.title]="item().title"
                    [queryParams]="item().queryParams"
                    routerLinkActive="p-menu-item-link-active"
                    [routerLinkActiveOptions]="item().routerLinkActiveOptions || { exact: false }"
                    [class]="cn(cx('itemLink'), item()?.linkClass)"
                    [style]="item()?.linkStyle"
                    [target]="item().target"
                    [fragment]="item().fragment"
                    [queryParamsHandling]="item().queryParamsHandling"
                    [preserveFragment]="item().preserveFragment"
                    [skipLocationChange]="item().skipLocationChange"
                    [replaceUrl]="item().replaceUrl"
                    [state]="item().state"
                    [pBind]="getPTOptions('itemLink')"
                    pRipple
                >
                    <ng-container *ngTemplateOutlet="itemContent; context: { $implicit: item() }"></ng-container>
                </a>
            }
        }

        @if (itemTemplate()) {
            <ng-template *ngTemplateOutlet="itemTemplate(); context: { $implicit: item() }"></ng-template>
        }

        <ng-template #itemContent>
            @if (item().icon) {
                <span [class]="cn(cx('itemIcon', { item: item() }), item().iconClass)" [pBind]="getPTOptions('itemIcon')" [style]="item().iconStyle" [attr.data-pc-section]="'itemicon'"></span>
            }
            @if (item().escape !== false) {
                <span [class]="cn(cx('itemLabel'), item().labelClass)" [style]="item().labelStyle" [pBind]="getPTOptions('itemLabel')" [attr.data-pc-section]="'itemlabel'">{{ item().label }}</span>
            } @else {
                <span [class]="cn(cx('itemLabel'), item().labelClass)" [style]="item().labelStyle" [attr.data-pc-section]="'itemlabel'" [innerHTML]="item().label | safeHtml" [pBind]="getPTOptions('itemLabel')"></span>
            }
            @if (item().badge) {
                <p-badge [styleClass]="item().badgeStyleClass" [value]="item().badge" [pt]="getPTOptions('pcBadge')" [unstyled]="unstyled()" />
            }
        </ng-template>
    </div>`,
    encapsulation: ViewEncapsulation.None,
    providers: [MenuStyle]
})
export class MenuItemContent extends BaseComponent {
    readonly item = input<MenuItem | undefined>(undefined, { alias: 'pMenuItemContent' });

    readonly itemTemplate = input<any | undefined>(undefined);

    readonly menuitemId = input<string>('');

    readonly idx = input<number>(0);

    onMenuItemClick = output<any>();

    menu: Menu = inject(forwardRef(() => Menu));

    _componentStyle = inject(MenuStyle);

    hostName = 'Menu';

    private seenItem: unknown[] | undefined;

    onDoCheck(): void {
        const item = this.item();
        if (!item) {
            return;
        }
        if (!this.seenItem) {
            this.seenItem = readMenuItem(item, []);
        } else if (menuItemChanged(item, this.seenItem)) {
            readMenuItem(item, this.seenItem);
            this.cd.markForCheck();
        }
    }

    onItemClick(event, item) {
        this.onMenuItemClick.emit({ originalEvent: event, item });
    }

    getPTOptions(key: string) {
        return this.menu.getPTOptions(key, this.item(), this.idx(), this.menuitemId());
    }
}
/**
 * Menu is a navigation / command component that supports dynamic and static positioning.
 * @group Components
 */
@Component({
    selector: 'p-menu',
    standalone: true,
    imports: [NgTemplateOutlet, RouterModule, MenuItemContent, TooltipModule, BadgeModule, SharedModule, SafeHtmlPipe, BindModule, MotionModule],
    template: `
        @if (!popup() || overlayVisible()) {
            <div
                #container
                [class]="cn(cx('root'), styleClass())"
                [style]="rootInlineStyle"
                (click)="onOverlayClick($event)"
                [attr.id]="_id()"
                [pBind]="ptm('root')"
                [attr.data-p]="dataP"
                [pMotion]="visible() || !popup()"
                [pMotionName]="'p-anchored-overlay'"
                [pMotionAppear]="!!popup()"
                [pMotionDisabled]="!popup()"
                [pMotionOptions]="computedMotionOptions()"
                (pMotionOnBeforeEnter)="onOverlayBeforeEnter($event)"
                (pMotionOnAfterLeave)="onOverlayAfterLeave()"
            >
                @if (startTemplate() ?? _startTemplate) {
                    <div [class]="cx('start')" [pBind]="ptm('start')" [attr.data-pc-section]="'start'">
                        <ng-container *ngTemplateOutlet="startTemplate() ?? _startTemplate"></ng-container>
                    </div>
                }
                <ul
                    #list
                    [class]="cx('list')"
                    [pBind]="ptm('list')"
                    role="menu"
                    [attr.id]="_id() + '_list'"
                    [attr.tabindex]="getTabIndexValue()"
                    [attr.data-pc-section]="'menu'"
                    [attr.aria-activedescendant]="activedescendant()"
                    [attr.aria-label]="ariaLabel()"
                    [attr.aria-labelledBy]="ariaLabelledBy()"
                    (focus)="onListFocus($event)"
                    (blur)="onListBlur($event)"
                    (keydown)="onListKeyDown($event)"
                >
                    @if (hasSubMenu()) {
                        @for (submenu of model(); track submenu; let i = $index) {
                            @if (submenu.visible !== false) {
                                @if (submenu.separator) {
                                    <li [class]="cx('separator')" [pBind]="ptm('separator')" role="separator" [attr.data-pc-section]="'separator'"></li>
                                } @else {
                                    <li
                                        [class]="cx('submenuLabel')"
                                        [pBind]="ptm('submenuLabel')"
                                        [attr.data-automationid]="submenu.automationId"
                                        pTooltip
                                        [tooltipOptions]="submenu.tooltipOptions"
                                        [pTooltipUnstyled]="unstyled()"
                                        role="none"
                                        [attr.id]="menuitemId(submenu, _id(), i)"
                                        [attr.data-pc-section]="'submenulabel'"
                                    >
                                        @let submenuHeader = submenuHeaderTemplate() ?? _submenuHeaderTemplate;
                                        @if (submenuHeader) {
                                            <ng-container *ngTemplateOutlet="submenuHeader; context: { $implicit: submenu }"></ng-container>
                                        } @else {
                                            @if (submenu.escape !== false) {
                                                <span>{{ submenu.label }}</span>
                                            } @else {
                                                <span [innerHTML]="submenu.label ?? '' | safeHtml"></span>
                                            }
                                        }
                                    </li>
                                }
                            }
                            @for (item of submenu.items; track item; let j = $index) {
                                @if (item.separator && (item.visible !== false || submenu.visible !== false)) {
                                    <li [class]="cx('separator')" [pBind]="ptm('separator')" role="separator" [attr.data-pc-section]="'separator'"></li>
                                }
                                @if (!item.separator && item.visible !== false && (item.visible !== undefined || submenu.visible !== false)) {
                                    <li
                                        [class]="cn(cx('item', { item, id: menuitemId(item, _id(), i, j) }), item?.styleClass)"
                                        [pBind]="ptm('item')"
                                        [pMenuItemContent]="item"
                                        [itemTemplate]="itemTemplate() ?? _itemTemplate"
                                        [idx]="j"
                                        [menuitemId]="menuitemId(item, _id(), i, j)"
                                        [style]="item.style"
                                        (onMenuItemClick)="itemClick($event, menuitemId(item, _id(), i, j))"
                                        pTooltip
                                        [tooltipOptions]="item.tooltipOptions"
                                        [pTooltipUnstyled]="unstyled()"
                                        [unstyled]="unstyled()"
                                        role="menuitem"
                                        [attr.aria-label]="label(item.label)"
                                        [attr.data-p-focused]="isItemFocused(menuitemId(item, _id(), i, j))"
                                        [attr.data-p-disabled]="disabled(item.disabled)"
                                        [attr.aria-disabled]="disabled(item.disabled)"
                                        [attr.id]="menuitemId(item, _id(), i, j)"
                                    ></li>
                                }
                            }
                        }
                    }
                    @if (!hasSubMenu()) {
                        @for (item of model(); track item; let i = $index) {
                            @if (item.separator && item.visible !== false) {
                                <li [class]="cx('separator')" [pBind]="ptm('separator')" role="separator" [attr.data-pc-section]="'separator'"></li>
                            }
                            @if (!item.separator && item.visible !== false) {
                                <li
                                    [class]="cn(cx('item', { item, id: menuitemId(item, _id(), i) }), item?.styleClass)"
                                    [pBind]="ptm('item')"
                                    [pMenuItemContent]="item"
                                    [itemTemplate]="itemTemplate() ?? _itemTemplate"
                                    [idx]="i"
                                    [menuitemId]="menuitemId(item, _id(), i)"
                                    [style]="item.style"
                                    (onMenuItemClick)="itemClick($event, menuitemId(item, _id(), i))"
                                    pTooltip
                                    [tooltipOptions]="item.tooltipOptions"
                                    [unstyled]="unstyled()"
                                    [pTooltipUnstyled]="unstyled()"
                                    role="menuitem"
                                    [attr.aria-label]="label(item.label)"
                                    [attr.data-p-focused]="isItemFocused(menuitemId(item, _id(), i))"
                                    [attr.data-p-disabled]="disabled(item.disabled)"
                                    [attr.aria-disabled]="disabled(item.disabled)"
                                    [attr.id]="menuitemId(item, _id(), i)"
                                ></li>
                            }
                        }
                    }
                </ul>
                @if (endTemplate() ?? _endTemplate) {
                    <div [class]="cx('end')" [pBind]="ptm('end')" [attr.data-pc-section]="'end'">
                        <ng-container *ngTemplateOutlet="endTemplate() ?? _endTemplate"></ng-container>
                    </div>
                }
            </div>
        }
    `,

    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [MenuStyle, { provide: MENU_INSTANCE, useExisting: Menu }, { provide: PARENT_INSTANCE, useExisting: Menu }],
    hostDirectives: [Bind]
})
export class Menu extends BaseComponent<MenuPassThrough> {
    componentName = 'Menu';

    /**
     * An array of menuitems.
     * @group Props
     */
    readonly model = input<MenuItem[] | undefined>(undefined);
    /**
     * Defines if menu would displayed as a popup.
     * @group Props
     */
    readonly popup = input<boolean | undefined, unknown>(undefined, { transform: booleanAttribute });
    /**
     * Inline style of the component.
     * @group Props
     */
    readonly style = input<
        | {
              [klass: string]: any;
          }
        | null
        | undefined
    >(undefined);

    get rootInlineStyle() {
        return { ...(this.sx('root') as any), ...(this.style() as any) };
    }
    /**
     * Style class of the component.
     * @group Props
     */
    readonly styleClass = input<string | undefined>(undefined);
    /**
     * Whether to automatically manage layering.
     * @group Props
     */
    readonly autoZIndex = input<boolean, unknown>(true, { transform: booleanAttribute });
    /**
     * Base zIndex value to use in layering.
     * @group Props
     */
    readonly baseZIndex = input<number, unknown>(0, { transform: numberAttribute });
    /**
     * Transition options of the show animation.
     * @deprecated since v21.0.0, use `motionOptions` instead.
     * @group Props
     */
    readonly showTransitionOptions = input<string>('.12s cubic-bezier(0, 0, 0.2, 1)');
    /**
     * Transition options of the hide animation.
     * @deprecated since v21.0.0, use `motionOptions` instead.
     * @group Props
     */
    readonly hideTransitionOptions = input<string>('.1s linear');

    /**
     * Defines a string value that labels an interactive element.
     * @group Props
     */
    readonly ariaLabel = input<string | undefined>(undefined);
    /**
     * Identifier of the underlying input element.
     * @group Props
     */
    readonly ariaLabelledBy = input<string | undefined>(undefined);
    /**
     * Current id state as a string.
     * @group Props
     */
    readonly id = input<string | undefined>(undefined);
    /**
     * Index of the element in tabbing order.
     * @group Props
     */
    readonly tabindex = input<number, unknown>(0, { transform: numberAttribute });
    /**
     * Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name).
     * @defaultValue 'self'
     * @group Props
     */
    readonly appendTo = input<HTMLElement | ElementRef | TemplateRef<any> | 'self' | 'body' | null | undefined | any>(undefined);
    /**
     * The motion options.
     * @group Props
     */
    readonly motionOptions = input<MotionOptions | undefined>(undefined);

    readonly computedMotionOptions = computed<MotionOptions>(() => {
        return {
            ...this.ptm('motion'),
            ...this.motionOptions()
        };
    });
    /**
     * Callback to invoke when overlay menu is shown.
     * @group Emits
     */
    onShow = output<any>();
    /**
     * Callback to invoke when overlay menu is hidden.
     * @group Emits
     */
    onHide = output<any>();
    /**
     * Callback to invoke when the list loses focus.
     * @param {Event} event - blur event.
     * @group Emits
     */
    onBlur = output<Event>();
    /**
     * Callback to invoke when the list receives focus.
     * @param {Event} event - focus event.
     * @group Emits
     */
    readonly onFocus = output<Event | undefined>();

    readonly listViewChild = viewChild<ElementRef>('list');

    readonly containerViewChild = viewChild<ElementRef>('container');

    readonly $appendTo = computed(() => this.appendTo() || this.config.overlayAppendTo());

    container: any;

    scrollHandler: ConnectedOverlayScrollHandler | null | undefined;

    documentClickListener: VoidListener;

    documentResizeListener: VoidListener;

    preventDocumentDefault: boolean | undefined;

    target: any;

    /** Whether the popup is requested to be visible. */
    readonly visible = signal<boolean>(false);

    readonly focusedOptionId = computed(() => {
        return this.focusedOptionIndex() !== -1 ? this.focusedOptionIndex() : null;
    });

    public focusedOptionIndex: any = signal<any>(-1);

    public selectedOptionIndex: any = signal<any>(-1);

    public focused: boolean | undefined = false;

    /** Whether the popup overlay is rendered (stays true during the leave animation). */
    readonly overlayVisible = signal<boolean>(false);

    $pcMenu: Menu | undefined = inject(MENU_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    _componentStyle = inject(MenuStyle);

    bindDirectiveInstance = inject(Bind, { self: true });

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptm('host'));
    }

    overlayService = inject(OverlayService);

    private ngZone = inject(NgZone);

    /** Id actually rendered: the `id` input, or a generated one. */
    readonly _id = linkedSignal(() => this.id() || uuid('pn_id_'));

    getPTOptions(key: string, item: any, index: number, id: string) {
        return this.ptm(key, {
            context: {
                item: item,
                index: index,
                focused: this.isItemFocused(id),
                disabled: this.disabled(item.disabled)
            }
        });
    }
    /**
     * Toggles the visibility of the popup menu.
     * @param {Event} event - Browser event.
     * @group Method
     */
    public toggle(event: Event) {
        if (this.visible()) this.hide();
        else this.show(event);

        this.preventDocumentDefault = true;
    }
    /**
     * Displays the popup menu.
     * @param {Event} event - Browser event.
     * @group Method
     */
    public show(event: any) {
        // Clear container if exists but overlay is not currently visible (fast toggle case)
        if (this.container && !this.overlayVisible()) {
            this.container = undefined;
        }

        this.target = event.currentTarget;
        this.visible.set(true);
        this.preventDocumentDefault = true;
        this.overlayVisible.set(true);
        this.cd.markForCheck();
    }

    onInit() {
        if (!this.popup()) {
            this.bindDocumentClickListener();
        }
    }

    /**
     * Defines template option for start.
     * @group Templates
     */
    readonly startTemplate = contentChild<TemplateRef<void>>('start', { descendants: false });
    _startTemplate: TemplateRef<void> | undefined;

    /**
     * Defines template option for end.
     * @group Templates
     */
    readonly endTemplate = contentChild<TemplateRef<void>>('end', { descendants: false });
    _endTemplate: TemplateRef<void> | undefined;

    /**
     * Defines template option for header.
     * @group Templates
     */
    readonly headerTemplate = contentChild<TemplateRef<void>>('header', { descendants: false });
    _headerTemplate: TemplateRef<void> | undefined;

    /**
     * Custom item template.
     * @param {MenuItemTemplateContext} context - item context.
     * @see {@link MenuItemTemplateContext}
     * @group Templates
     */
    readonly itemTemplate = contentChild<TemplateRef<MenuItemTemplateContext>>('item', { descendants: false });
    _itemTemplate: TemplateRef<MenuItemTemplateContext> | undefined;

    /**
     * Custom submenu header template.
     * @param {MenuSubmenuHeaderTemplateContext} context - submenu header context.
     * @see {@link MenuSubmenuHeaderTemplateContext}
     * @group Templates
     */
    readonly submenuHeaderTemplate = contentChild<TemplateRef<MenuSubmenuHeaderTemplateContext>>('submenuheader', { descendants: false });
    _submenuHeaderTemplate: TemplateRef<MenuSubmenuHeaderTemplateContext> | undefined;

    readonly templates = contentChildren(PrimeTemplate);

    onAfterContentInit() {
        this.templates()?.forEach((item) => {
            switch (item.getType()) {
                case 'start':
                    this._startTemplate = item.template;
                    break;

                case 'end':
                    this._endTemplate = item.template;
                    break;

                case 'item':
                    this._itemTemplate = item.template;
                    break;

                case 'submenuheader':
                    this._submenuHeaderTemplate = item.template;
                    break;

                default:
                    this._itemTemplate = item.template;
                    break;
            }
        });
    }

    getTabIndexValue(): string | null {
        const tabindex = this.tabindex();
        return tabindex !== undefined ? tabindex.toString() : null;
    }

    onOverlayBeforeEnter(event: MotionEvent) {
        this.container = event.element as HTMLElement;

        if (this.container) {
            addStyle(this.container, { position: 'absolute', top: '0' });
            this.appendOverlay();
            this.moveOnTop();

            this.$attrSelector && this.container?.setAttribute(this.$attrSelector, '');
            this.bindDocumentClickListener();
            this.bindDocumentResizeListener();
            this.bindScrollListener();
            absolutePosition(this.container!, this.target);
            focus(this.listViewChild()?.nativeElement);
            this.onShow.emit({});
        }
    }

    onOverlayAfterLeave() {
        this.restoreOverlayAppend();
        this.onOverlayHide();
        this.overlayVisible.set(false);
        this.onHide.emit({});
    }

    appendOverlay() {
        if (this.$appendTo() && this.$appendTo() !== 'self') {
            if (this.$appendTo() === 'body') {
                appendChild(this.document.body, this.container!);
            } else {
                appendChild(this.$appendTo(), this.container!);
            }
        }
    }

    restoreOverlayAppend() {
        if (this.container && this.$appendTo() !== 'self') {
            appendChild(this.el.nativeElement, this.container);
        }
    }

    moveOnTop() {
        if (this.autoZIndex()) {
            ZIndexUtils.set('menu', this.container, this.baseZIndex() + this.config.zIndex.menu);
        }
    }
    /**
     * Hides the popup menu.
     * @group Method
     */
    public hide() {
        this.visible.set(false);

        this.cd.markForCheck();
    }

    onWindowResize() {
        if (this.visible() && !isTouchDevice()) {
            this.hide();
        }
    }

    menuitemId(item: MenuItem, id: string | any, index?: string | number, childIndex?: string | number) {
        return item?.id ?? `${id}_${index}${childIndex !== undefined ? '_' + childIndex : ''}`;
    }

    isItemFocused(id) {
        return this.focusedOptionId() === id;
    }

    label(label: any) {
        return typeof label === 'function' ? label() : label;
    }

    disabled(disabled: any) {
        return typeof disabled === 'function' ? disabled() : typeof disabled === 'undefined' ? false : disabled;
    }

    activedescendant() {
        return this.focused ? this.focusedOptionId() : undefined;
    }

    onListFocus(event: Event) {
        if (!this.focused) {
            this.focused = true;
            !this.popup() && this.changeFocusedOptionIndex(0);
            this.onFocus.emit(event);
        }
    }

    onListBlur(event: FocusEvent | MouseEvent) {
        if (this.focused) {
            this.focused = false;
            this.changeFocusedOptionIndex(-1);
            this.selectedOptionIndex.set(-1);
            this.focusedOptionIndex.set(-1);
            this.onBlur.emit(event);
        }
    }

    onListKeyDown(event) {
        switch (event.code) {
            case 'ArrowDown':
                this.onArrowDownKey(event);
                break;

            case 'ArrowUp':
                this.onArrowUpKey(event);
                break;

            case 'Home':
                this.onHomeKey(event);
                break;

            case 'End':
                this.onEndKey(event);
                break;

            case 'Enter':
                this.onEnterKey(event);
                break;

            case 'NumpadEnter':
                this.onEnterKey(event);
                break;

            case 'Space':
                this.onSpaceKey(event);
                break;

            case 'Escape':
            case 'Tab':
                if (this.popup()) {
                    focus(this.target);
                    this.hide();
                }
                this.overlayVisible() && this.hide();
                break;

            default:
                break;
        }
    }

    onArrowDownKey(event) {
        const optionIndex = this.findNextOptionIndex(this.focusedOptionIndex());
        this.changeFocusedOptionIndex(optionIndex);
        event.preventDefault();
    }

    onArrowUpKey(event) {
        if (event.altKey && this.popup()) {
            focus(this.target);
            this.hide();
            event.preventDefault();
        } else {
            const optionIndex = this.findPrevOptionIndex(this.focusedOptionIndex());

            this.changeFocusedOptionIndex(optionIndex);
            event.preventDefault();
        }
    }

    onHomeKey(event) {
        this.changeFocusedOptionIndex(0);
        event.preventDefault();
    }

    onEndKey(event) {
        this.changeFocusedOptionIndex(find(this.containerViewChild()?.nativeElement, 'li[data-pc-section="item"][data-p-disabled="false"]').length - 1);
        event.preventDefault();
    }

    onEnterKey(event) {
        const element = <any>findSingle(this.containerViewChild()?.nativeElement, `li[id="${`${this.focusedOptionIndex()}`}"]`);
        const anchorElement = element && (<any>findSingle(element, '[data-pc-section="itemlink"]') || findSingle(element, 'a,button'));

        this.popup() && focus(this.target);
        anchorElement ? anchorElement.click() : element && element.click();

        event.preventDefault();
    }

    onSpaceKey(event) {
        this.onEnterKey(event);
    }

    findNextOptionIndex(index) {
        const links = find(this.containerViewChild()?.nativeElement, 'li[data-pc-section="item"][data-p-disabled="false"]');
        const matchedOptionIndex = [...links].findIndex((link) => link.id === index);

        return matchedOptionIndex > -1 ? matchedOptionIndex + 1 : 0;
    }

    findPrevOptionIndex(index) {
        const links = find(this.containerViewChild()?.nativeElement, 'li[data-pc-section="item"][data-p-disabled="false"]');
        const matchedOptionIndex = [...links].findIndex((link) => link.id === index);

        return matchedOptionIndex > -1 ? matchedOptionIndex - 1 : 0;
    }

    changeFocusedOptionIndex(index) {
        const links = find(this.containerViewChild()?.nativeElement, 'li[data-pc-section="item"][data-p-disabled="false"]');
        if (links.length > 0) {
            let order = index >= links.length ? links.length - 1 : index < 0 ? 0 : index;
            order > -1 && this.focusedOptionIndex.set(links[order].getAttribute('id'));
        }
    }

    itemClick(event: any, id: string) {
        const { originalEvent, item } = event;

        if (!this.focused) {
            this.focused = true;
            this.onFocus.emit(undefined);
        }

        if (item.disabled) {
            originalEvent.preventDefault();
            return;
        }

        if (!item.url && !item.routerLink) {
            originalEvent.preventDefault();
        }

        if (item.command) {
            item.command({
                originalEvent: originalEvent,
                item: item
            });
        }

        const popup = this.popup();
        if (popup) {
            this.hide();
        }

        if (!popup && this.focusedOptionIndex() !== id) {
            this.focusedOptionIndex.set(id);
        }
    }

    onOverlayClick(event: Event) {
        if (this.popup()) {
            this.overlayService.add({
                originalEvent: event,
                target: this.el.nativeElement
            });
        }

        this.preventDocumentDefault = true;
    }

    bindDocumentClickListener() {
        if (!this.documentClickListener && isPlatformBrowser(this.platformId)) {
            const documentTarget: any = this.el ? this.el.nativeElement.ownerDocument : 'document';

            this.documentClickListener = this.renderer.listen(documentTarget, 'click', (event) => {
                const isOutsideContainer = this.containerViewChild()?.nativeElement && !this.containerViewChild()?.nativeElement.contains(event.target);
                const isOutsideTarget = !(this.target && (this.target === event.target || this.target.contains(event.target)));
                if (!this.popup() && isOutsideContainer && isOutsideTarget) {
                    this.onListBlur(event);
                }
                if (this.preventDocumentDefault && this.overlayVisible() && isOutsideContainer && isOutsideTarget) {
                    this.hide();
                    this.preventDocumentDefault = false;
                }
            });
        }
    }

    unbindDocumentClickListener() {
        if (this.documentClickListener) {
            this.documentClickListener();
            this.documentClickListener = null;
        }
    }

    bindDocumentResizeListener() {
        if (!this.documentResizeListener && isPlatformBrowser(this.platformId)) {
            const window = this.document.defaultView;
            this.documentResizeListener = this.renderer.listen(window, 'resize', this.onWindowResize.bind(this));
        }
    }

    unbindDocumentResizeListener() {
        if (this.documentResizeListener) {
            this.documentResizeListener();
            this.documentResizeListener = null;
        }
    }

    bindScrollListener() {
        if (!this.scrollHandler && isPlatformBrowser(this.platformId)) {
            this.scrollHandler = new ConnectedOverlayScrollHandler(
                this.target,
                () => {
                    if (this.visible()) {
                        this.ngZone.run(() => this.hide());
                    }
                },
                this.ngZone
            );
        }

        this.scrollHandler?.bindScrollListener();
    }

    unbindScrollListener() {
        if (this.scrollHandler) {
            this.scrollHandler.unbindScrollListener();
            this.scrollHandler = null;
        }
    }

    onOverlayHide() {
        this.unbindDocumentClickListener();
        this.unbindDocumentResizeListener();
        this.unbindScrollListener();
        this.preventDocumentDefault = false;

        if (!(this.cd as ViewRef).destroyed) {
            this.target = null;
        }
        if (this.container) {
            if (this.autoZIndex()) {
                ZIndexUtils.clear(this.container);
            }
            this.container = undefined;
        }
    }

    onDestroy() {
        const popup = this.popup();
        if (popup) {
            if (this.scrollHandler) {
                this.scrollHandler.destroy();
                this.scrollHandler = null;
            }

            if (this.container) {
                if (this.autoZIndex()) {
                    ZIndexUtils.clear(this.container);
                }
                this.container = undefined;
            }

            this.restoreOverlayAppend();
            this.onOverlayHide();
        }

        if (!popup) {
            this.unbindDocumentClickListener();
        }
    }

    hasSubMenu(): boolean {
        return this.model()?.some((item) => item.items) ?? false;
    }

    isItemHidden(item: any): boolean {
        if (item.separator) {
            return item.visible === false || (item.items && item.items.some((subitem) => subitem.visible !== false));
        }
        return item.visible === false;
    }

    get dataP() {
        return this.cn({
            popup: this.popup()
        });
    }
}

@NgModule({
    imports: [Menu, SharedModule, SafeHtmlPipe],
    exports: [Menu, SharedModule, SafeHtmlPipe]
})
export class MenuModule {}

import { NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, InjectionToken, NgModule, output, signal, TemplateRef, ViewEncapsulation, input, viewChild, contentChild, contentChildren, linkedSignal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { find, findSingle, resolve, uuid } from '@openng/optimus-ui-utils';
import { MenuItem, PrimeTemplate, SharedModule } from '@openng/optimus-ui/api';
import { Badge } from '@openng/optimus-ui/badge';
import { BaseComponent, PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { Bind } from '@openng/optimus-ui/bind';
import { Ripple } from '@openng/optimus-ui/ripple';
import { TooltipModule } from '@openng/optimus-ui/tooltip';
import { Nullable } from '@openng/optimus-ui/ts-helpers';
import { DockItemTemplateContext, DockPassThrough } from '@openng/optimus-ui/types/dock';
import { DockStyle } from './style/dockstyle';

const DOCK_INSTANCE = new InjectionToken<Dock>('DOCK_INSTANCE');

/**
 * Dock is a navigation component consisting of menuitems.
 * @group Components
 */
@Component({
    selector: 'p-dock',
    standalone: true,
    imports: [NgTemplateOutlet, RouterModule, RouterLink, RouterLinkActive, Ripple, TooltipModule, SharedModule, Bind, Badge],
    template: `
        <div [class]="cx('listContainer')" [pBind]="ptm('listContainer')">
            <ul
                #list
                [attr.id]="_id()"
                [class]="cx('list')"
                role="menu"
                [attr.aria-orientation]="position() === 'bottom' || position() === 'top' ? 'horizontal' : 'vertical'"
                [attr.aria-activedescendant]="focused ? focusedOptionId : undefined"
                [tabindex]="tabindex"
                [attr.aria-label]="ariaLabel()"
                [attr.aria-labelledby]="ariaLabelledBy()"
                (focus)="onListFocus($event)"
                (blur)="onListBlur($event)"
                (keydown)="onListKeyDown($event)"
                (mouseleave)="onListMouseLeave()"
                [pBind]="ptm('list')"
            >
                @for (item of model(); track item.label; let i = $index) {
                    @if (item.visible !== false) {
                        <li
                            [attr.id]="getItemId(item, i)"
                            [class]="cn(cx('item', { item, id: getItemId(item, i) }), item?.styleClass)"
                            [style]="item.style"
                            role="menuitem"
                            [attr.aria-label]="item.label"
                            [attr.aria-disabled]="disabled(item) || false"
                            (click)="onItemClick($event, item)"
                            (mouseenter)="onItemMouseEnter(i)"
                            [pBind]="getPTOptions(item, i, 'item')"
                            [attr.data-p-focused]="isItemActive(getItemId(item, i))"
                            [attr.data-p-disabled]="disabled(item) || false"
                        >
                            <div [class]="cx('itemContent')" [pBind]="getPTOptions(item, i, 'itemContent')">
                                @if (isClickableRouterLink(item)) {
                                    <a
                                        pRipple
                                        [routerLink]="item.routerLink"
                                        [queryParams]="item.queryParams"
                                        [class]="cn(cx('itemLink'), item?.linkClass)"
                                        [style]="item?.linkStyle"
                                        routerLinkActive="router-link-active"
                                        [routerLinkActiveOptions]="item.routerLinkActiveOptions || { exact: false }"
                                        [target]="item.target"
                                        [attr.title]="item.title"
                                        [attr.data-automationid]="item.automationId"
                                        [attr.tabindex]="item.disabled ? null : item.tabindex ? item.tabindex : '-1'"
                                        pTooltip
                                        [tooltipOptions]="item.tooltipOptions"
                                        [pTooltipUnstyled]="unstyled()"
                                        [fragment]="item.fragment"
                                        [queryParamsHandling]="item.queryParamsHandling"
                                        [preserveFragment]="item.preserveFragment"
                                        [skipLocationChange]="item.skipLocationChange"
                                        [replaceUrl]="item.replaceUrl"
                                        [state]="item.state"
                                        [attr.aria-hidden]="true"
                                        [pBind]="getPTOptions(item, i, 'itemLink')"
                                    >
                                        @if (item.icon && !itemTemplate() && !_itemTemplate) {
                                            <span [class]="cn(cx('itemIcon'), item.icon, item.iconClass)" [style]="item.iconStyle" [pBind]="getPTOptions(item, i, 'itemIcon')"></span>
                                        }
                                        <ng-container *ngTemplateOutlet="itemTemplate() || itemTemplate(); context: { $implicit: item }"></ng-container>
                                        @if (item.badge) {
                                            <p-badge [styleClass]="item.badgeStyleClass" [value]="item.badge" [pt]="getPTOptions(item, i, 'pcBadge')" [unstyled]="unstyled()" />
                                        }
                                    </a>
                                } @else {
                                    <a
                                        [tooltipPosition]="item.tooltipPosition"
                                        [attr.href]="item.url || null"
                                        [class]="cn(cx('itemLink'), item?.linkClass)"
                                        [style]="item?.linkStyle"
                                        pRipple
                                        pTooltip
                                        [tooltipOptions]="item.tooltipOptions"
                                        [pTooltipUnstyled]="unstyled()"
                                        [target]="item.target"
                                        [attr.title]="item.title"
                                        [attr.data-automationid]="item.automationId"
                                        [attr.tabindex]="item.disabled ? null : item.tabindex ? item.tabindex : '-1'"
                                        [attr.aria-hidden]="true"
                                        [pBind]="getPTOptions(item, i, 'itemLink')"
                                    >
                                        @if (item.icon && !itemTemplate() && !_itemTemplate) {
                                            <span [class]="cn(cx('itemIcon'), item.icon, item.iconClass)" [style]="item.iconStyle" [pBind]="getPTOptions(item, i, 'itemIcon')"></span>
                                        }
                                        <ng-container *ngTemplateOutlet="itemTemplate() || _itemTemplate; context: { $implicit: item }"></ng-container>
                                        @if (item.badge) {
                                            <p-badge [styleClass]="item.badgeStyleClass" [value]="item.badge" [pt]="getPTOptions(item, i, 'pcBadge')" [unstyled]="unstyled()" />
                                        }
                                    </a>
                                }
                            </div>
                        </li>
                    }
                }
            </ul>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [DockStyle, { provide: DOCK_INSTANCE, useExisting: Dock }, { provide: PARENT_INSTANCE, useExisting: Dock }],
    host: {
        '[class]': 'cn(cx("root"), styleClass())'
    },
    hostDirectives: [Bind]
})
export class Dock extends BaseComponent<DockPassThrough> {
    componentName = 'Dock';

    /**
     * Current id state as a string.
     * @group Props
     */
    readonly id = input<string | undefined>(undefined);
    /**
     * Class of the element.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    readonly styleClass = input<string | undefined>(undefined);
    /**
     * MenuModel instance to define the action items.
     * @group Props
     */
    readonly model = input<MenuItem[] | undefined | null>(null);
    /**
     * Position of element.
     * @group Props
     */
    readonly position = input<'bottom' | 'top' | 'left' | 'right'>('bottom');
    /**
     * Defines a string that labels the input for accessibility.
     * @group Props
     */
    readonly ariaLabel = input<string | undefined>(undefined);
    /**
     * The breakpoint to define the maximum width boundary.
     * @defaultValue 960px
     * @group Props
     */
    readonly breakpoint = input<string | undefined>('960px');
    /**
     * Defines a string that labels the dropdown button for accessibility.
     * @group Props
     */
    readonly ariaLabelledBy = input<string | undefined>(undefined);
    /**
     * Callback to execute when button is focused.
     * @param {FocusEvent} event - Focus event.
     * @group Emits
     */
    onFocus = output<FocusEvent>();
    /**
     * Callback to invoke when the component loses focus.
     * @param {FocusEvent} event - Focus event.
     * @group Emits
     */
    onBlur = output<FocusEvent>();

    readonly listViewChild = viewChild<Nullable<ElementRef>>('list');

    /** Id actually rendered: the `id` input, or a generated one. */
    readonly _id = linkedSignal(() => this.id() || uuid('pn_id_'));

    currentIndex: number = -3;

    tabindex: number = 0;

    focused: boolean = false;

    focusedOptionIndex: string | number = -1;

    _componentStyle = inject(DockStyle);

    bindDirectiveInstance = inject(Bind, { self: true });

    $pcDock: Dock | undefined = inject(DOCK_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    matchMediaListener: any;

    private unlistenMatchMedia: (() => void) | null = null;

    query: any;

    queryMatches = signal<boolean>(false);

    mobileActive = signal<boolean>(false);

    get focusedOptionId() {
        return this.focusedOptionIndex !== -1 && this.focusedOptionIndex !== '-1' ? String(this.focusedOptionIndex) : null;
    }

    onInit() {
        this.bindMatchMediaListener();
    }

    onDestroy() {
        this.unbindMatchMediaListener();
    }

    /**
     * Custom item template.
     * @param {DockItemTemplateContext} context - item template context.
     * @group Templates
     */
    readonly itemTemplate = contentChild<TemplateRef<DockItemTemplateContext>>('item');

    _itemTemplate: TemplateRef<DockItemTemplateContext> | undefined;

    getItemId(item, index) {
        return item && item?.id ? item.id : `${index}`;
    }

    getItemProp(processedItem, name) {
        return processedItem && processedItem.item ? resolve(processedItem.item[name]) : undefined;
    }

    disabled(item) {
        return typeof item.disabled === 'function' ? item.disabled() : item.disabled || false;
    }

    isItemActive(id) {
        return String(id) === String(this.focusedOptionIndex);
    }

    onListMouseLeave() {
        this.currentIndex = -3;
        this.cd.markForCheck();
    }

    onItemMouseEnter(index: number) {
        this.currentIndex = index;

        this.cd.markForCheck();
    }

    onItemClick(e: Event, item: MenuItem) {
        if (item.command) {
            item.command({ originalEvent: e, item });
        }
    }

    onListFocus(event) {
        this.focused = true;
        this.changeFocusedOptionIndex(0);
        this.onFocus.emit(event);
    }

    onListBlur(event) {
        this.focused = false;
        this.focusedOptionIndex = -1;
        this.onBlur.emit(event);
    }

    onListKeyDown(event) {
        switch (event.code) {
            case 'ArrowDown': {
                const position = this.position();
                if (position === 'left' || position === 'right') this.onArrowDownKey();
                event.preventDefault();
                break;
            }

            case 'ArrowUp': {
                const position = this.position();
                if (position === 'left' || position === 'right') this.onArrowUpKey();
                event.preventDefault();
                break;
            }

            case 'ArrowRight': {
                const position = this.position();
                if (position === 'top' || position === 'bottom') this.onArrowDownKey();
                event.preventDefault();
                break;
            }

            case 'ArrowLeft': {
                const position = this.position();
                if (position === 'top' || position === 'bottom') this.onArrowUpKey();
                event.preventDefault();
                break;
            }

            case 'Home': {
                this.onHomeKey();
                event.preventDefault();
                break;
            }

            case 'End': {
                this.onEndKey();
                event.preventDefault();
                break;
            }

            case 'Enter':

            case 'Space': {
                this.onSpaceKey();
                event.preventDefault();
                break;
            }

            default:
                break;
        }
    }

    onArrowDownKey() {
        const optionIndex = this.findNextOptionIndex(this.focusedOptionIndex);

        this.changeFocusedOptionIndex(optionIndex);
    }

    onArrowUpKey() {
        const optionIndex = this.findPrevOptionIndex(this.focusedOptionIndex);

        this.changeFocusedOptionIndex(optionIndex);
    }

    onHomeKey() {
        this.changeFocusedOptionIndex(0);
    }

    onEndKey() {
        this.changeFocusedOptionIndex(find(this.listViewChild()?.nativeElement, 'li[data-pc-section="item"][data-p-disabled="false"]').length - 1);
    }

    onSpaceKey() {
        const element = <HTMLElement>findSingle(this.listViewChild()?.nativeElement, `li[id="${`${this.focusedOptionIndex}`}"]`);
        const anchorElement = element && <HTMLElement>findSingle(element, 'a,button');

        anchorElement ? anchorElement.click() : element && element.click();
    }

    findNextOptionIndex(index) {
        const menuitems = find(this.listViewChild()?.nativeElement, 'li[data-pc-section="item"][data-p-disabled="false"]');
        const matchedOptionIndex = [...menuitems].findIndex((link) => link.id === index);

        return matchedOptionIndex > -1 ? matchedOptionIndex + 1 : 0;
    }

    changeFocusedOptionIndex(index) {
        const menuitems = <any>find(this.listViewChild()?.nativeElement, 'li[data-pc-section="item"][data-p-disabled="false"]');

        let order = index >= menuitems.length ? menuitems.length - 1 : index < 0 ? 0 : index;

        this.focusedOptionIndex = menuitems[order]?.getAttribute('id');
    }

    findPrevOptionIndex(index) {
        const menuitems = find(this.listViewChild()?.nativeElement, 'li[data-pc-section="item"][data-p-disabled="false"]');
        const matchedOptionIndex = [...menuitems].findIndex((link) => link.id === index);

        return matchedOptionIndex > -1 ? matchedOptionIndex - 1 : 0;
    }

    isClickableRouterLink(item: any) {
        return !!item.routerLink && !this.disabled(item);
    }

    readonly templates = contentChildren(PrimeTemplate);

    onAfterContentInit() {
        this.templates()?.forEach((item) => {
            switch (item.getType()) {
                case 'item':
                    this._itemTemplate = item.template;
                    break;

                default:
                    this._itemTemplate = item.template;
                    break;
            }
        });
    }

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    getPTOptions(item: MenuItem, index: number, key: string) {
        return this.ptm(key, {
            context: {
                item,
                index
            }
        });
    }

    bindMatchMediaListener() {
        if (!this.matchMediaListener && isPlatformBrowser(this.platformId)) {
            const query = window.matchMedia(`(max-width: ${this.breakpoint()})`);
            this.query = query;
            this.queryMatches.set(query.matches);

            this.matchMediaListener = () => {
                this.queryMatches.set(query.matches);
                this.mobileActive.set(false);
            };

            this.unlistenMatchMedia = this.renderer.listen(this.query, 'change', this.matchMediaListener);
        }
    }

    unbindMatchMediaListener() {
        if (this.matchMediaListener) {
            this.unlistenMatchMedia?.();
            this.unlistenMatchMedia = null;
            this.matchMediaListener = null;
            this.query = null;
        }
    }
}

@NgModule({
    imports: [Dock, SharedModule],
    exports: [Dock, SharedModule]
})
export class DockModule {}

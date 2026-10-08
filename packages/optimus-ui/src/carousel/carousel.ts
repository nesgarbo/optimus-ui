import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, ElementRef, inject, NgModule, NgZone, numberAttribute, output, SimpleChanges, TemplateRef, ViewEncapsulation, input, viewChild, contentChild, contentChildren } from '@angular/core';
import { addClass, find, findSingle, getAttribute, removeClass, setAttribute, uuid } from '@openng/optimus-ui-utils';
import { Footer, Header, PrimeTemplate, SharedModule } from '@openng/optimus-ui/api';
import { BaseComponent, PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { Bind, BindModule } from '@openng/optimus-ui/bind';
import { ButtonModule, ButtonProps } from '@openng/optimus-ui/button';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from '@openng/optimus-ui/icons';
import { CarouselItemTemplateContext, CarouselPageEvent, CarouselResponsiveOptions } from '@openng/optimus-ui/types/carousel';
import { CarouselStyle } from './style/carouselstyle';

/**
 * Carousel is a content slider featuring various customization options.
 * @group Components
 */
@Component({
    selector: 'p-carousel',
    standalone: true,
    imports: [NgTemplateOutlet, ChevronRightIcon, ButtonModule, ChevronLeftIcon, ChevronDownIcon, ChevronUpIcon, SharedModule, BindModule],
    template: `
        @if (headerFacet() || headerTemplate()) {
            <div [class]="cx('header')" [pBind]="ptm('header')">
                <ng-content select="p-header"></ng-content>
                <ng-container *ngTemplateOutlet="headerTemplate()"></ng-container>
            </div>
        }
        <div [class]="cn(cx('contentContainer'), contentClass())" [pBind]="ptm('contentContainer')">
            <div [class]="cx('content')" [attr.aria-live]="allowAutoplay ? 'polite' : 'off'" [pBind]="ptm('content')">
                @if (showNavigators()) {
                    <p-button
                        [class]="cx('pcPrevButton')"
                        [attr.aria-label]="ariaPrevButtonLabel()"
                        (click)="navBackward($event)"
                        [text]="true"
                        [buttonProps]="prevButtonProps()"
                        [pt]="ptm('pcPrevButton')"
                        [unstyled]="unstyled()"
                        attr.data-pc-group-section="navigator"
                    >
                        <ng-template #icon>
                            @if (!previousIconTemplate() && !_previousIconTemplate && !prevButtonProps()?.icon) {
                                @if (!isVertical()) {
                                    <svg data-p-icon="chevron-left" />
                                }
                                @if (isVertical()) {
                                    <svg data-p-icon="chevron-up" />
                                }
                            }
                            @if ((previousIconTemplate() || _previousIconTemplate) && !prevButtonProps()?.icon) {
                                <ng-template *ngTemplateOutlet="previousIconTemplate() || _previousIconTemplate"></ng-template>
                            }
                        </ng-template>
                    </p-button>
                }
                <div [class]="cx('viewport')" [style]="{ height: isVertical() ? verticalViewPortHeight() : 'auto' }" (touchend)="onTouchEnd($event)" (touchstart)="onTouchStart($event)" (touchmove)="onTouchMove($event)" [pBind]="ptm('viewport')">
                    <div #itemsContainer [class]="cx('itemList')" (transitionend)="onTransitionEnd()" [pBind]="ptm('itemList')">
                        @for (item of clonedItemsForStarting; track $index; let index = $index) {
                            <div
                                [class]="cx('itemClone', { index })"
                                [attr.aria-hidden]="!(totalShiftedItems * -1 === value()!.length)"
                                [attr.aria-label]="ariaSlideNumber(index)"
                                [attr.aria-roledescription]="ariaSlideLabel()"
                                [attr.data-p-carousel-item-active]="totalShiftedItems * -1 === value()!.length + _numVisible"
                                [attr.data-p-carousel-item-start]="index === 0"
                                [attr.data-p-carousel-item-end]="clonedItemsForStarting && clonedItemsForStarting.length - 1 === index"
                                [pBind]="ptm('itemClone')"
                            >
                                <ng-container *ngTemplateOutlet="itemTemplate() || _itemTemplate; context: { $implicit: item }"></ng-container>
                            </div>
                        }
                        @for (item of value(); track $index; let index = $index) {
                            <div
                                [class]="cx('item', { index })"
                                role="group"
                                [attr.aria-hidden]="!(firstIndex() <= index && lastIndex() >= index)"
                                [attr.aria-label]="ariaSlideNumber(index)"
                                [attr.aria-roledescription]="ariaSlideLabel()"
                                [attr.data-p-carousel-item-active]="firstIndex() <= index && lastIndex() >= index"
                                [attr.data-p-carousel-item-start]="firstIndex() === index"
                                [attr.data-p-carousel-item-end]="lastIndex() === index"
                                [pBind]="getItemPTOptions('item', index)"
                            >
                                <ng-container *ngTemplateOutlet="itemTemplate() || _itemTemplate; context: { $implicit: item }"></ng-container>
                            </div>
                        }
                        @for (item of clonedItemsForFinishing; track $index; let index = $index) {
                            <div [class]="cx('itemClone', { index })" [attr.data-p-carousel-item-active]="false" [attr.data-p-carousel-item-start]="false" [attr.data-p-carousel-item-end]="false" [pBind]="ptm('itemClone')">
                                <ng-container *ngTemplateOutlet="itemTemplate() || _itemTemplate; context: { $implicit: item }"></ng-container>
                            </div>
                        }
                    </div>
                </div>
                @if (showNavigators()) {
                    <p-button
                        type="button"
                        [class]="cx('pcNextButton')"
                        (click)="navForward($event)"
                        [attr.aria-label]="ariaNextButtonLabel()"
                        [buttonProps]="nextButtonProps()"
                        [text]="true"
                        [pt]="ptm('pcNextButton')"
                        [unstyled]="unstyled()"
                        attr.data-pc-group-section="navigator"
                    >
                        <ng-template #icon>
                            @if (!nextIconTemplate() && !_nextIconTemplate && !nextButtonProps()?.icon) {
                                @if (!isVertical()) {
                                    <svg data-p-icon="chevron-right" />
                                }
                                @if (isVertical()) {
                                    <svg data-p-icon="chevron-down" />
                                }
                            }
                            @if (nextIconTemplate() || (_nextIconTemplate && !nextButtonProps()?.icon)) {
                                <span>
                                    <ng-template *ngTemplateOutlet="nextIconTemplate() || _nextIconTemplate"></ng-template>
                                </span>
                            }
                        </ng-template>
                    </p-button>
                }
            </div>
            @if (showIndicators()) {
                <ul #indicatorContent [class]="cx('indicatorList')" [style]="indicatorsContentStyle()" (keydown)="onIndicatorKeydown($event)" [pBind]="ptm('indicatorList')">
                    @for (totalDot of totalDotsArray(); track $index; let i = $index) {
                        <li [class]="cx('indicator', { index: i })" [attr.data-p-active]="_page === i" [pBind]="getIndicatorPTOptions('indicator', i)">
                            <button
                                type="button"
                                [class]="cx('indicatorButton')"
                                (click)="onDotClick($event, i)"
                                [style]="indicatorStyle()"
                                [attr.aria-label]="ariaPageLabel(i + 1)"
                                [attr.aria-current]="_page === i ? 'page' : undefined"
                                [tabindex]="_page === i ? 0 : -1"
                                [pBind]="getIndicatorPTOptions('indicatorButton', i)"
                            ></button>
                        </li>
                    }
                </ul>
            }
        </div>
        @if (footerFacet() || footerTemplate() || _footerTemplate) {
            <div [class]="cx('footer')" [pBind]="ptm('footer')">
                <ng-content select="p-footer"></ng-content>
                <ng-container *ngTemplateOutlet="footerTemplate() || _footerTemplate"></ng-container>
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [CarouselStyle, { provide: PARENT_INSTANCE, useExisting: Carousel }],
    hostDirectives: [Bind],
    host: {
        '[attr.id]': 'id',
        '[attr.role]': "'region'",
        '[class]': "cn(cx('root'), styleClass())"
    }
})
export class Carousel extends BaseComponent {
    componentName = 'Carousel';

    bindDirectiveInstance = inject(Bind, { self: true });

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptm('root'));
    }

    /**
     * Index of the first item.
     * @defaultValue 0
     * @group Props
     */
    readonly page = input<number>(0);

    /**
     * Number of items per page.
     * @defaultValue 1
     * @group Props
     */
    readonly numVisible = input<number>(1);

    /**
     * Number of items to scroll.
     * @defaultValue 1
     * @group Props
     */
    readonly numScroll = input<number>(1);

    /**
     * An array of options for responsive design.
     * @see {CarouselResponsiveOptions}
     * @group Props
     */
    readonly responsiveOptions = input<CarouselResponsiveOptions[] | undefined>(undefined);
    /**
     * Specifies the layout of the component.
     * @group Props
     */
    readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
    /**
     * Height of the viewport in vertical layout.
     * @group Props
     */
    readonly verticalViewPortHeight = input<string>('300px');
    /**
     * Style class of main content.
     * @group Props
     */
    readonly contentClass = input<string>('');
    /**
     * Style class of the indicator items.
     * @group Props
     */
    readonly indicatorsContentClass = input<string>('');
    /**
     * Inline style of the indicator items.
     * @group Props
     */
    readonly indicatorsContentStyle = input<
        | {
              [klass: string]: any;
          }
        | null
        | undefined
    >(undefined);
    /**
     * Style class of the indicators.
     * @group Props
     */
    readonly indicatorStyleClass = input<string>('');
    /**
     * Style of the indicators.
     * @group Props
     */
    readonly indicatorStyle = input<
        | {
              [klass: string]: any;
          }
        | null
        | undefined
    >(undefined);

    /**
     * An array of objects to display.
     * @defaultValue null
     * @group Props
     */
    readonly value = input<any[] | null | undefined>(undefined);

    /**
     * Defines if scrolling would be infinite.
     * @group Props
     */
    readonly circular = input<boolean, unknown>(false, { transform: booleanAttribute });
    /**
     * Whether to display indicator container.
     * @group Props
     */
    readonly showIndicators = input<boolean, unknown>(true, { transform: booleanAttribute });
    /**
     * Whether to display navigation buttons in container.
     * @group Props
     */
    readonly showNavigators = input<boolean, unknown>(true, { transform: booleanAttribute });
    /**
     * Time in milliseconds to scroll items automatically.
     * @group Props
     */
    readonly autoplayInterval = input<number, unknown>(0, { transform: numberAttribute });
    /**
     * Style class of the viewport container.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    readonly styleClass = input<string | undefined>(undefined);
    /**
     * Used to pass all properties of the ButtonProps to the Button component.
     * @group Props
     */
    readonly prevButtonProps = input<ButtonProps>({
        severity: 'secondary',
        text: true,
        rounded: true
    });
    /**
     * Used to pass all properties of the ButtonProps to the Button component.
     * @group Props
     */
    readonly nextButtonProps = input<ButtonProps>({
        severity: 'secondary',
        text: true,
        rounded: true
    });
    /**
     * Callback to invoke after scroll.
     * @param {CarouselPageEvent} event - Custom page event.
     * @group Emits
     */
    onPage = output<CarouselPageEvent>();

    readonly itemsContainer = viewChild<ElementRef>('itemsContainer');

    readonly indicatorContent = viewChild<ElementRef>('indicatorContent');

    readonly headerFacet = contentChild(Header);

    readonly footerFacet = contentChild(Footer);

    _numVisible: number = 1;

    _numScroll: number = 1;

    _oldNumScroll: number = 0;

    prevState: any = {
        numScroll: 0,
        numVisible: 0,
        value: []
    };

    defaultNumScroll: number = 1;

    defaultNumVisible: number = 1;

    _page: number = 0;

    carouselStyle: any;

    id: string | undefined;

    totalShiftedItems;

    isRemainingItemsAdded: boolean = false;

    animationTimeout: any;

    translateTimeout: any;

    remainingItems: number = 0;

    _items: any[] | undefined;

    startPos: any;

    documentResizeListener: any;

    clonedItemsForStarting: any[] | undefined;

    clonedItemsForFinishing: any[] | undefined;

    allowAutoplay: boolean | undefined;

    interval: any;

    isCreated: boolean | undefined;

    swipeThreshold: number = 20;

    /**
     * Custom item template.
     * @group Templates
     */
    readonly itemTemplate = contentChild<TemplateRef<CarouselItemTemplateContext>>('item', { descendants: false });

    /**
     * Custom header template.
     * @group Templates
     */
    readonly headerTemplate = contentChild<TemplateRef<void>>('header', { descendants: false });

    /**
     * Custom footer template.
     * @group Templates
     */
    readonly footerTemplate = contentChild<TemplateRef<void>>('footer', { descendants: false });

    /**
     * Custom previous icon template.
     * @group Templates
     */
    readonly previousIconTemplate = contentChild<TemplateRef<void>>('previousicon', { descendants: false });

    /**
     * Custom next icon template.
     * @group Templates
     */
    readonly nextIconTemplate = contentChild<TemplateRef<void>>('nexticon', { descendants: false });

    _itemTemplate: TemplateRef<CarouselItemTemplateContext> | undefined;

    _headerTemplate: TemplateRef<void> | undefined;

    _footerTemplate: TemplateRef<void> | undefined;

    _previousIconTemplate: TemplateRef<void> | undefined;

    _nextIconTemplate: TemplateRef<void> | undefined;

    window: Window;

    _componentStyle = inject(CarouselStyle);

    el: ElementRef = inject(ElementRef);

    zone: NgZone = inject(NgZone);

    constructor() {
        super();
        this.totalShiftedItems = 0;
        this.window = this.document.defaultView as Window;
    }

    onChanges(simpleChange: SimpleChanges) {
        if (simpleChange.numVisible) {
            this._numVisible = this.numVisible();
        }

        if (simpleChange.numScroll) {
            this._numScroll = this.numScroll();
        }

        if (simpleChange.page) {
            const val = this.page();
            if (this.isCreated && val !== this._page) {
                if (this.autoplayInterval()) {
                    this.stopAutoplay();
                }

                if (val > this._page && val <= this.totalDots() - 1) {
                    this.step(-1, val);
                } else if (val < this._page) {
                    this.step(1, val);
                }
            }

            this._page = val;
        }

        if (isPlatformBrowser(this.platformId)) {
            if (simpleChange.value) {
                if (this.circular() && this.value()) {
                    this.setCloneItems();
                }
            }

            if (this.isCreated) {
                const responsiveOptions = this.responsiveOptions();
                if (simpleChange.numVisible) {
                    if (responsiveOptions) {
                        this.defaultNumVisible = this._numVisible;
                    }

                    if (this.isCircular()) {
                        this.setCloneItems();
                    }

                    this.createStyle();
                    this.calculatePosition();
                }

                if (simpleChange.numScroll) {
                    if (responsiveOptions) {
                        this.defaultNumScroll = this._numScroll;
                    }
                }
            }
        }
        this.cd.markForCheck();
    }

    readonly templates = contentChildren(PrimeTemplate);

    onAfterContentInit() {
        this.id = uuid('pn_id_');
        if (isPlatformBrowser(this.platformId)) {
            this.allowAutoplay = !!this.autoplayInterval();

            if (this.circular()) {
                this.setCloneItems();
            }

            const responsiveOptions = this.responsiveOptions();
            if (responsiveOptions) {
                this.defaultNumScroll = this._numScroll;
                this.defaultNumVisible = this._numVisible;
            }

            this.createStyle();
            this.calculatePosition();

            if (responsiveOptions) {
                this.bindDocumentListeners();
            }
        }

        this.templates()?.forEach((item) => {
            switch (item.getType()) {
                case 'item':
                    this._itemTemplate = item.template;
                    break;

                case 'header':
                    this._headerTemplate = item.template;
                    break;

                case 'footer':
                    this._footerTemplate = item.template;
                    break;

                case 'previousicon':
                    this._previousIconTemplate = item.template;
                    break;

                case 'nexticon':
                    this._nextIconTemplate = item.template;
                    break;

                default:
                    this._itemTemplate = item.template;
                    break;
            }
        });

        this.cd.detectChanges();
    }

    onAfterContentChecked() {
        if (isPlatformBrowser(this.platformId)) {
            const isCircular = this.isCircular();
            let totalShiftedItems = this.totalShiftedItems;

            const itemsContainer = this.itemsContainer();
            if (this.value() && itemsContainer && (this.prevState.numScroll !== this._numScroll || this.prevState.numVisible !== this._numVisible || this.prevState.value.length !== this.value()!.length)) {
                const autoplayInterval = this.autoplayInterval();
                if (autoplayInterval) {
                    this.stopAutoplay(false);
                }

                this.remainingItems = (this.value()!.length - this._numVisible) % this._numScroll;

                let page = this._page;
                if (this.totalDots() !== 0 && page >= this.totalDots()) {
                    page = this.totalDots() - 1;
                    this._page = page;
                    this.onPage.emit({
                        page: this._page
                    });
                }

                totalShiftedItems = page * this._numScroll * -1;
                if (isCircular) {
                    totalShiftedItems -= this._numVisible;
                }

                if (page === this.totalDots() - 1 && this.remainingItems > 0) {
                    totalShiftedItems += -1 * this.remainingItems + this._numScroll;
                    this.isRemainingItemsAdded = true;
                } else {
                    this.isRemainingItemsAdded = false;
                }

                if (totalShiftedItems !== this.totalShiftedItems) {
                    this.totalShiftedItems = totalShiftedItems;
                }

                this._oldNumScroll = this._numScroll;
                this.prevState.numScroll = this._numScroll;
                this.prevState.numVisible = this._numVisible;
                this.prevState.value = [...(this.value() as any[])];

                if (this.totalDots() > 0 && itemsContainer.nativeElement) {
                    itemsContainer.nativeElement.style.transform = this.isVertical() ? `translate3d(0, ${totalShiftedItems * (100 / this._numVisible)}%, 0)` : `translate3d(${totalShiftedItems * (100 / this._numVisible)}%, 0, 0)`;
                }

                this.isCreated = true;

                if (autoplayInterval && this.isAutoplay()) {
                    this.startAutoplay();
                }
            }

            if (isCircular) {
                if (this._page === 0) {
                    totalShiftedItems = -1 * this._numVisible;
                } else if (totalShiftedItems === 0) {
                    totalShiftedItems = -1 * this.value()!.length;
                    if (this.remainingItems > 0) {
                        this.isRemainingItemsAdded = true;
                    }
                }

                if (totalShiftedItems !== this.totalShiftedItems) {
                    this.totalShiftedItems = totalShiftedItems;
                }
            }
        }
    }

    createStyle() {
        if (!this.carouselStyle) {
            this.carouselStyle = this.renderer.createElement('style');
            this.carouselStyle.type = 'text/css';
            setAttribute(this.carouselStyle, 'nonce', this.config?.csp()?.nonce);
            this.renderer.appendChild(this.document.head, this.carouselStyle);
            setAttribute(this.carouselStyle, 'nonce', this.config?.csp()?.nonce);
        }

        let innerHTML = `
            #${this.id} .p-carousel-item {
				flex: 1 0 ${100 / this._numVisible}%
			}
        `;

        const responsiveOptions = this.responsiveOptions();
        if (responsiveOptions && !this.$unstyled()) {
            responsiveOptions.sort((data1, data2) => {
                const value1 = data1.breakpoint;
                const value2 = data2.breakpoint;
                let result: number | null = null;

                if (value1 == null && value2 != null) result = -1;
                else if (value1 != null && value2 == null) result = 1;
                else if (value1 == null && value2 == null) result = 0;
                else if (typeof value1 === 'string' && typeof value2 === 'string') result = value1.localeCompare(value2, undefined, { numeric: true });
                else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

                return -1 * result;
            });

            for (let i = 0; i < responsiveOptions.length; i++) {
                let res = responsiveOptions[i];

                innerHTML += `
                    @media screen and (max-width: ${res.breakpoint}) {
                        #${this.id} .p-carousel-item {
                            flex: 1 0 ${100 / res.numVisible}%
                        }
                    }
                `;
            }
        }

        this.carouselStyle.innerHTML = innerHTML;
    }

    calculatePosition() {
        const responsiveOptions = this.responsiveOptions();
        if (responsiveOptions) {
            let matchedResponsiveData = {
                numVisible: this.defaultNumVisible,
                numScroll: this.defaultNumScroll
            };

            if (typeof window !== 'undefined') {
                let windowWidth = window.innerWidth;
                for (let i = 0; i < responsiveOptions.length; i++) {
                    let res = responsiveOptions[i];

                    if (parseInt(res.breakpoint, 10) >= windowWidth) {
                        matchedResponsiveData = res;
                    }
                }
            }

            if (this._numScroll !== matchedResponsiveData.numScroll) {
                let page = this._page;
                page = Math.floor((page * this._numScroll) / matchedResponsiveData.numScroll);

                let totalShiftedItems = matchedResponsiveData.numScroll * this._page * -1;

                if (this.isCircular()) {
                    totalShiftedItems -= matchedResponsiveData.numVisible;
                }

                this.totalShiftedItems = totalShiftedItems;
                this._numScroll = matchedResponsiveData.numScroll;

                this._page = page;
                this.zone.run(() => {
                    this.onPage.emit({
                        page: this._page
                    });
                });
            }

            if (this._numVisible !== matchedResponsiveData.numVisible) {
                this._numVisible = matchedResponsiveData.numVisible;
                this.setCloneItems();
            }

            this.cd.markForCheck();
        }
    }

    setCloneItems() {
        this.clonedItemsForStarting = [];
        this.clonedItemsForFinishing = [];
        if (this.isCircular()) {
            this.clonedItemsForStarting.push(...this.value()!.slice(-1 * this._numVisible));
            this.clonedItemsForFinishing.push(...this.value()!.slice(0, this._numVisible));
        }
    }

    firstIndex() {
        return this.isCircular() ? -1 * (this.totalShiftedItems + this._numVisible) : this.totalShiftedItems * -1 + 0;
    }

    lastIndex() {
        return this.firstIndex() + this._numVisible - 1;
    }

    totalDots() {
        return this.value()?.length ? Math.ceil((this.value()!.length - this._numVisible) / this._numScroll) + 1 : 0;
    }

    totalDotsArray() {
        const totalDots = this.totalDots();
        return totalDots <= 0 ? [] : Array(totalDots).fill(0);
    }

    isVertical() {
        return this.orientation() === 'vertical';
    }

    isCircular() {
        return this.circular() && this.value() && this.value()!.length >= this._numVisible;
    }

    isAutoplay() {
        return this.autoplayInterval() && this.allowAutoplay;
    }

    isForwardNavDisabled() {
        return this.isEmpty() || (this._page >= this.totalDots() - 1 && !this.isCircular());
    }

    isBackwardNavDisabled() {
        return this.isEmpty() || (this._page <= 0 && !this.isCircular());
    }

    isEmpty() {
        return !this.value() || this.value()!.length === 0;
    }

    navForward(e: MouseEvent | TouchEvent, index?: number) {
        if (this.isCircular() || this._page < this.totalDots() - 1) {
            this.step(-1, index);
        }

        if (this.autoplayInterval()) {
            this.stopAutoplay();
        }

        if (e && e.cancelable) {
            e.preventDefault();
        }
    }

    navBackward(e: MouseEvent | TouchEvent, index?: number) {
        if (this.isCircular() || this._page !== 0) {
            this.step(1, index);
        }

        if (this.autoplayInterval()) {
            this.stopAutoplay();
        }

        if (e && e.cancelable) {
            e.preventDefault();
        }
    }

    onDotClick(e: MouseEvent, index: number) {
        let page = this._page;

        if (this.autoplayInterval()) {
            this.stopAutoplay();
        }

        if (index > page) {
            this.navForward(e, index);
        } else if (index < page) {
            this.navBackward(e, index);
        }
    }

    onIndicatorKeydown(event: KeyboardEvent) {
        switch (event.code) {
            case 'ArrowRight':
                this.onRightKey();
                break;

            case 'ArrowLeft':
                this.onLeftKey();
                break;
        }
    }

    onRightKey() {
        const indicators = [...find(this.indicatorContent()?.nativeElement, '[data-pc-section="indicator"]')];
        const activeIndex = this.findFocusedIndicatorIndex();

        this.changedFocusedIndicator(activeIndex, activeIndex + 1 === indicators.length ? indicators.length - 1 : activeIndex + 1);
    }

    onLeftKey() {
        const activeIndex = this.findFocusedIndicatorIndex();

        this.changedFocusedIndicator(activeIndex, activeIndex - 1 <= 0 ? 0 : activeIndex - 1);
    }

    onHomeKey() {
        const activeIndex = this.findFocusedIndicatorIndex();

        this.changedFocusedIndicator(activeIndex, 0);
    }

    onEndKey() {
        const indicators = [...find(this.indicatorContent()?.nativeElement, '[data-pc-section="indicator"]')];
        const activeIndex = this.findFocusedIndicatorIndex();

        this.changedFocusedIndicator(activeIndex, indicators.length - 1);
    }

    onTabKey() {
        const indicatorContent = this.indicatorContent();
        const indicators = <any>[...find(indicatorContent?.nativeElement, '[data-pc-section="indicator"]')];
        const highlightedIndex = indicators.findIndex((ind) => getAttribute(ind, 'data-p-highlight') === true);

        const activeIndicator = <any>findSingle(indicatorContent?.nativeElement, '[data-pc-section="indicator"] > button[tabindex="0"]');
        const activeIndex = indicators.findIndex((ind) => ind === activeIndicator.parentElement);

        indicators[activeIndex].children[0].tabIndex = '-1';
        indicators[highlightedIndex].children[0].tabIndex = '0';
    }

    findFocusedIndicatorIndex() {
        const indicatorContent = this.indicatorContent();
        const indicators = [...find(indicatorContent?.nativeElement, '[data-pc-section="indicator"]')];
        const activeIndicator = findSingle(indicatorContent?.nativeElement, '[data-pc-section="indicator"] > button[tabindex="0"]');

        return indicators.findIndex((ind) => ind === activeIndicator?.parentElement);
    }

    changedFocusedIndicator(prevInd, nextInd) {
        const indicators = <any>[...find(this.indicatorContent()?.nativeElement, '[data-pc-section="indicator"]')];

        indicators[prevInd].children[0].tabIndex = '-1';
        indicators[nextInd].children[0].tabIndex = '0';
        indicators[nextInd].children[0].focus();
    }

    step(dir: number, page?: number) {
        let totalShiftedItems = this.totalShiftedItems;
        const isCircular = this.isCircular();

        if (page != null) {
            totalShiftedItems = this._numScroll * page * -1;

            if (isCircular) {
                totalShiftedItems -= this._numVisible;
            }

            this.isRemainingItemsAdded = false;
        } else {
            totalShiftedItems += this._numScroll * dir;
            if (this.isRemainingItemsAdded) {
                totalShiftedItems += this.remainingItems - this._numScroll * dir;
                this.isRemainingItemsAdded = false;
            }

            let originalShiftedItems = isCircular ? totalShiftedItems + this._numVisible : totalShiftedItems;
            page = Math.abs(Math.floor(originalShiftedItems / this._numScroll));
        }

        if (isCircular && this._page === this.totalDots() - 1 && dir === -1) {
            totalShiftedItems = -1 * (this.value()!.length + this._numVisible);
            page = 0;
        } else if (isCircular && this._page === 0 && dir === 1) {
            totalShiftedItems = 0;
            page = this.totalDots() - 1;
        } else if (page === this.totalDots() - 1 && this.remainingItems > 0) {
            totalShiftedItems += this.remainingItems * -1 - this._numScroll * dir;
            this.isRemainingItemsAdded = true;
        }

        const itemsContainer = this.itemsContainer();
        if (itemsContainer) {
            !this.$unstyled() && removeClass(itemsContainer.nativeElement, 'p-items-hidden');
            itemsContainer.nativeElement.style.transform = this.isVertical() ? `translate3d(0, ${totalShiftedItems * (100 / this._numVisible)}%, 0)` : `translate3d(${totalShiftedItems * (100 / this._numVisible)}%, 0, 0)`;
            itemsContainer.nativeElement.style.transition = 'transform 500ms ease 0s';
        }

        this.totalShiftedItems = totalShiftedItems;
        this._page = page;
        this.onPage.emit({
            page: this._page
        });
        this.cd.markForCheck();
    }

    startAutoplay() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }

        // The timer runs outside the zone: only a visible page change re-enters it.
        this.zone.runOutsideAngular(() => {
            this.interval = setInterval(() => {
                // Do not slide while the tab is hidden.
                if (this.document.hidden || this.totalDots() <= 0) {
                    return;
                }

                this.zone.run(() => {
                    if (this._page === this.totalDots() - 1) {
                        this.step(-1, 0);
                    } else {
                        this.step(-1, this._page + 1);
                    }
                });
            }, this.autoplayInterval());
        });
        this.allowAutoplay = true;
        this.cd.markForCheck();
    }

    stopAutoplay(changeAllow: boolean = true) {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
            if (changeAllow) {
                this.allowAutoplay = false;
            }
        }
        this.cd.markForCheck();
    }

    isPlaying(): boolean {
        return !!this.interval;
    }

    onTransitionEnd() {
        const itemsContainer = this.itemsContainer();
        if (itemsContainer) {
            !this.$unstyled() && addClass(itemsContainer.nativeElement, 'p-items-hidden');
            itemsContainer.nativeElement.style.transition = '';

            if ((this._page === 0 || this._page === this.totalDots() - 1) && this.isCircular()) {
                itemsContainer.nativeElement.style.transform = this.isVertical() ? `translate3d(0, ${this.totalShiftedItems * (100 / this._numVisible)}%, 0)` : `translate3d(${this.totalShiftedItems * (100 / this._numVisible)}%, 0, 0)`;
            }
        }
    }

    onTouchStart(e: TouchEvent) {
        let touchobj = e.changedTouches[0];

        this.startPos = {
            x: touchobj.pageX,
            y: touchobj.pageY
        };
    }

    onTouchMove(e: TouchEvent | MouseEvent) {
        if (e.cancelable) {
            e.preventDefault();
        }
    }

    onTouchEnd(e: TouchEvent) {
        let touchobj = e.changedTouches[0];

        if (this.isVertical()) {
            this.changePageOnTouch(e, touchobj.pageY - this.startPos.y);
        } else {
            this.changePageOnTouch(e, touchobj.pageX - this.startPos.x);
        }
    }

    changePageOnTouch(e: TouchEvent | MouseEvent, diff: number) {
        if (Math.abs(diff) > this.swipeThreshold) {
            if (diff < 0) {
                this.navForward(e);
            } else {
                this.navBackward(e);
            }
        }
    }

    ariaPrevButtonLabel() {
        return this.config.translation.aria ? this.config.translation.aria?.prevPageLabel : undefined;
    }

    ariaSlideLabel() {
        return this.config.translation.aria ? this.config.translation.aria?.slide : undefined;
    }

    ariaNextButtonLabel() {
        return this.config.translation.aria ? this.config.translation.aria?.nextPageLabel : undefined;
    }

    ariaSlideNumber(value) {
        return this.config.translation.aria ? this.config.translation.aria?.slideNumber?.replace(/{slideNumber}/g, value) : undefined;
    }

    ariaPageLabel(value) {
        return this.config.translation.aria ? this.config.translation.aria?.pageLabel?.replace(/{page}/g, value) : undefined;
    }

    getIndicatorPTOptions(key: string, index: number) {
        return this.ptm(key, {
            context: {
                highlighted: index === this._page
            }
        });
    }

    getItemPTOptions(key: string, index: number) {
        return this.ptm(key, {
            context: {
                index,
                active: this.firstIndex() <= index && this.lastIndex() >= index,
                start: this.firstIndex() === index,
                end: this.lastIndex() === index
            }
        });
    }

    bindDocumentListeners() {
        if (isPlatformBrowser(this.platformId)) {
            if (!this.documentResizeListener) {
                this.zone.runOutsideAngular(() => {
                    this.documentResizeListener = this.renderer.listen(this.window, 'resize', () => {
                        this.calculatePosition();
                    });
                });
            }
        }
    }

    unbindDocumentListeners() {
        if (isPlatformBrowser(this.platformId)) {
            if (this.documentResizeListener) {
                this.documentResizeListener();
                this.documentResizeListener = null;
            }
        }
    }

    onDestroy() {
        this.unbindDocumentListeners();

        // Unconditional: a timer started by `startAutoplay` must never outlive the component.
        this.stopAutoplay();

        if (this.carouselStyle) {
            this.carouselStyle.remove?.();
            this.carouselStyle = undefined;
        }
    }
}

@NgModule({
    imports: [Carousel, SharedModule],
    exports: [Carousel, SharedModule]
})
export class CarouselModule {}

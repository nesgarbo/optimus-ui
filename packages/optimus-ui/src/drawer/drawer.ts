import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    ElementRef,
    inject,
    InjectionToken,
    input,
    NgModule,
    NgZone,
    numberAttribute,
    output,
    signal,
    untracked,
    TemplateRef,
    ViewEncapsulation,
    viewChild,
    contentChild,
    contentChildren
} from '@angular/core';
import { MotionEvent, MotionOptions } from '@openng/optimus-ui-motion';
import { addClass, appendChild, removeClass, setAttribute } from '@openng/optimus-ui-utils';
import { PrimeTemplate, SharedModule } from '@openng/optimus-ui/api';
import { BaseComponent, PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { Bind } from '@openng/optimus-ui/bind';
import { Button, ButtonProps } from '@openng/optimus-ui/button';
import { blockBodyScroll, unblockBodyScroll } from '@openng/optimus-ui/dom';
import { FocusTrapModule } from '@openng/optimus-ui/focustrap';
import { TimesIcon } from '@openng/optimus-ui/icons';
import { MotionModule } from '@openng/optimus-ui/motion';
import { Nullable, VoidListener } from '@openng/optimus-ui/ts-helpers';
import { DrawerPassThrough } from '@openng/optimus-ui/types/drawer';
import { ZIndexUtils } from '@openng/optimus-ui/utils';
import { DrawerStyle } from './style/drawerstyle';

const DRAWER_INSTANCE = new InjectionToken<Drawer>('DRAWER_INSTANCE');

/**
 * Sidebar is a panel component displayed as an overlay at the edges of the screen.
 * @group Components
 */
@Component({
    selector: 'p-drawer',
    standalone: true,
    imports: [NgTemplateOutlet, Button, TimesIcon, SharedModule, Bind, FocusTrapModule, MotionModule],
    providers: [DrawerStyle, { provide: DRAWER_INSTANCE, useExisting: Drawer }, { provide: PARENT_INSTANCE, useExisting: Drawer }],
    hostDirectives: [Bind],
    template: `
        @if (modalVisible()) {
            <div
                #container
                [pBind]="ptm('root')"
                [pMotion]="visible()"
                [pMotionAppear]="true"
                [pMotionEnterActiveClass]="$enterAnimation()"
                [pMotionLeaveActiveClass]="$leaveAnimation()"
                [pMotionOptions]="computedMotionOptions()"
                (pMotionOnBeforeEnter)="onBeforeEnter($event)"
                (pMotionOnAfterLeave)="onAfterLeave($event)"
                [class]="cn(cx('root'), styleClass())"
                [style]="style()"
                role="complementary"
                (keydown)="onKeyDown($event)"
                pFocusTrap
                [attr.data-p]="dataP"
                [attr.data-p-open]="visible()"
            >
                @if (headlessTemplate() || _headlessTemplate) {
                    <ng-container *ngTemplateOutlet="headlessTemplate() || _headlessTemplate"></ng-container>
                } @else {
                    <div [pBind]="ptm('header')" [class]="cx('header')" [attr.data-pc-section]="'header'">
                        <ng-container *ngTemplateOutlet="headerTemplate() || _headerTemplate"></ng-container>
                        @if (header()) {
                            <div [pBind]="ptm('title')" [class]="cx('title')">{{ header() }}</div>
                        }
                        @if (showCloseIcon() && closable()) {
                            <p-button
                                [pt]="ptm('pcCloseButton')"
                                [class]="cx('pcCloseButton')"
                                (onClick)="close($event)"
                                (keydown.enter)="close($event)"
                                [buttonProps]="closeButtonProps()"
                                [ariaLabel]="ariaCloseLabel()"
                                [attr.data-pc-group-section]="'iconcontainer'"
                                [unstyled]="unstyled()"
                            >
                                <ng-template #icon>
                                    @if (!closeIconTemplate() && !_closeIconTemplate) {
                                        <svg data-p-icon="times" [attr.data-pc-section]="'closeicon'" />
                                    }
                                    <ng-container *ngTemplateOutlet="closeIconTemplate() || _closeIconTemplate"></ng-container>
                                </ng-template>
                            </p-button>
                        }
                    </div>

                    <div [pBind]="ptm('content')" [class]="cx('content')" [attr.data-pc-section]="'content'">
                        <ng-content></ng-content>
                        <ng-container *ngTemplateOutlet="contentTemplate() || _contentTemplate"></ng-container>
                    </div>

                    @if (footerTemplate() || _footerTemplate) {
                        <div [pBind]="ptm('footer')" [class]="cx('footer')" [attr.data-pc-section]="'footer'">
                            <ng-container *ngTemplateOutlet="footerTemplate() || _footerTemplate"></ng-container>
                        </div>
                    }
                }
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class Drawer extends BaseComponent<DrawerPassThrough> {
    componentName = 'Drawer';

    $pcDrawer: Drawer | undefined = inject(DRAWER_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptm('host'));
    }
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
     * Whether to block scrolling of the document when drawer is active.
     * @group Props
     */
    readonly blockScroll = input<boolean, unknown>(false, { transform: booleanAttribute });
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
    /**
     * Style class of the component.
     * @group Props
     */
    readonly styleClass = input<string | undefined>(undefined);
    /**
     * Aria label of the close icon.
     * @group Props
     */
    readonly ariaCloseLabel = input<string | undefined>(undefined);
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
     * Whether an overlay mask is displayed behind the drawer.
     * @group Props
     */
    readonly modal = input<boolean, unknown>(true, { transform: booleanAttribute });
    /**
     * Used to pass all properties of the ButtonProps to the Button component.
     * @group Props
     */
    readonly closeButtonProps = input<ButtonProps>({ severity: 'secondary', text: true, rounded: true });
    /**
     * Whether to dismiss drawer on click of the mask.
     * @group Props
     */
    readonly dismissible = input<boolean, unknown>(true, { transform: booleanAttribute });
    /**
     * Whether to display the close icon.
     * @group Props
     * @deprecated use 'closable' instead.
     */
    readonly showCloseIcon = input<boolean, unknown>(true, { transform: booleanAttribute });
    /**
     * Specifies if pressing escape key should hide the drawer.
     * @group Props
     */
    readonly closeOnEscape = input<boolean, unknown>(true, { transform: booleanAttribute });
    /**
     * Transition options of the animation.
     * @group Props
     * @deprecated since v21.0.0. Use `motionOptions` instead.
     */
    readonly transitionOptions = input<string>('150ms cubic-bezier(0, 0, 0.2, 1)');
    /**
     * The visible property is an input that determines the visibility of the component.
     * @defaultValue false
     * @group Props
     */
    readonly visible = input<boolean>(false);

    /**
     * Specifies the position of the drawer, valid values are "left", "right", "bottom" and "top".
     * @defaultValue 'left'
     * @group Props
     */
    readonly position = input<'left' | 'right' | 'bottom' | 'top' | 'full'>('left');
    /**
     * Adds a close icon to the header to hide the dialog.
     * @defaultValue false
     * @group Props
     */
    readonly fullScreen = input<boolean>(false);

    readonly $enterAnimation = computed(() => (this.fullScreen() ? 'p-drawer-enter-full' : `p-drawer-enter-${this.position()}`));

    readonly $leaveAnimation = computed(() => (this.fullScreen() ? 'p-drawer-leave-full' : `p-drawer-leave-${this.position()}`));

    /**
     * Title content of the dialog.
     * @group Props
     */
    readonly header = input<string | undefined>(undefined);
    /**
     * Style of the mask.
     * @group Props
     */
    readonly maskStyle = input<
        | {
              [klass: string]: any;
          }
        | null
        | undefined
    >(undefined);
    /**
     * Whether to display close button.
     * @group Props
     * @defaultValue true
     */
    readonly closable = input<boolean, unknown>(true, { transform: booleanAttribute });
    /**
     * Callback to invoke when dialog is shown.
     * @group Emits
     */
    onShow = output<any>();
    /**
     * Callback to invoke when dialog is hidden.
     * @group Emits
     */
    onHide = output<any>();
    /**
     * Callback to invoke when dialog visibility is changed.
     * @param {boolean} value - Visible value.
     * @group Emits
     */
    visibleChange = output<boolean>();

    constructor() {
        super();
        effect(() => {
            if (this.visible() && !untracked(() => this.modalVisible())) {
                untracked(() => this.modalVisible.set(true));
            }
        });
    }

    readonly containerViewChild = viewChild<ElementRef>('container');

    readonly closeButtonViewChild = viewChild<ElementRef>('closeButton');

    initialized: boolean | undefined;

    _position: string = 'left';

    _fullScreen: boolean = false;

    readonly modalVisible = signal<boolean>(false);

    container: Nullable<HTMLDivElement>;

    mask: Nullable<HTMLDivElement>;

    maskClickListener: VoidListener;

    documentEscapeListener: VoidListener;

    animationEndListener: VoidListener;

    _componentStyle = inject(DrawerStyle);

    private zone: NgZone = inject(NgZone);

    onAfterViewInit() {
        this.initialized = true;
    }
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
     * Custom content template.
     * @group Templates
     */
    readonly contentTemplate = contentChild<TemplateRef<void>>('content', { descendants: false });
    /**
     * Custom close icon template.
     * @group Templates
     */
    readonly closeIconTemplate = contentChild<TemplateRef<void>>('closeicon', { descendants: false });
    /**
     * Custom headless template to replace the entire drawer content.
     * @group Templates
     */
    readonly headlessTemplate = contentChild<TemplateRef<void>>('headless', { descendants: false });

    readonly $appendTo = computed(() => this.appendTo() || this.config.overlayAppendTo());

    _headerTemplate: TemplateRef<void> | undefined;

    _footerTemplate: TemplateRef<void> | undefined;

    _contentTemplate: TemplateRef<void> | undefined;

    _closeIconTemplate: TemplateRef<void> | undefined;

    _headlessTemplate: TemplateRef<void> | undefined;

    readonly templates = contentChildren(PrimeTemplate);

    onAfterContentInit() {
        this.templates()?.forEach((item) => {
            switch (item.getType()) {
                case 'content':
                    this._contentTemplate = item.template;
                    break;
                case 'header':
                    this._headerTemplate = item.template;
                    break;
                case 'footer':
                    this._footerTemplate = item.template;
                    break;
                case 'closeicon':
                    this._closeIconTemplate = item.template;
                    break;
                case 'headless':
                    this._headlessTemplate = item.template;
                    break;

                default:
                    this._contentTemplate = item.template;
                    break;
            }
        });
    }

    onKeyDown(event: KeyboardEvent) {
        if (event.code === 'Escape') {
            this.hide(false);
        }
    }

    show() {
        this.container?.setAttribute(this.$attrSelector, '');

        if (this.autoZIndex()) {
            ZIndexUtils.set('modal', this.container, this.baseZIndex() || this.config.zIndex.modal);
        }

        if (this.modal()) {
            this.enableModality();
        }

        this.onShow.emit({});
        this.visibleChange.emit(true);
    }

    hide(emit: boolean = true) {
        if (emit) {
            this.onHide.emit({});
        }

        if (this.modal()) {
            this.disableModality();
        }
    }

    close(event: Event) {
        this.hide();
        this.visibleChange.emit(false);
        this.cd.markForCheck();
        event.preventDefault();
    }

    enableModality() {
        const activeDrawers = this.document.querySelectorAll('[data-p-open="true"]');
        const activeDrawersLength = activeDrawers.length;
        const zIndex = activeDrawersLength == 1 ? String(parseInt((this.container as HTMLDivElement).style.zIndex) - 1) : String(parseInt((activeDrawers[activeDrawersLength - 1] as HTMLElement).style.zIndex) - 1);

        if (!this.mask) {
            this.mask = this.renderer.createElement('div');

            if (this.mask) {
                const style = `z-index: ${zIndex};${this.getMaskStyle()}`;
                setAttribute(this.mask, 'style', style);
                setAttribute(this.mask, 'data-p', this.dataP);
                addClass(this.mask, this.cx('mask'));
            }

            if (this.dismissible()) {
                this.maskClickListener = this.renderer.listen(this.mask, 'click', (event: any) => {
                    if (this.dismissible()) {
                        this.close(event);
                    }
                });
            }

            this.renderer.appendChild(this.document.body, this.mask);
            if (this.blockScroll()) {
                blockBodyScroll();
            }
        }
    }

    getMaskStyle() {
        const maskStyle = this.maskStyle();
        return maskStyle
            ? Object.entries(maskStyle)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join('; ')
            : '';
    }

    disableModality() {
        if (this.mask) {
            !this.$unstyled() && removeClass(this.mask, 'p-overlay-mask-enter-active');
            !this.$unstyled() && addClass(this.mask, 'p-overlay-mask-leave-active');
            this.animationEndListener = this.renderer.listen(this.mask, 'animationend', this.destroyModal.bind(this));
        }
    }

    destroyModal() {
        this.unbindMaskClickListener();

        if (this.mask) {
            this.renderer.removeChild(this.document.body, this.mask);
        }

        if (this.blockScroll()) {
            unblockBodyScroll();
        }

        this.unbindAnimationEndListener();
        this.mask = null;
    }

    onBeforeEnter(event: MotionEvent) {
        this.container = event.element as HTMLDivElement;
        this.appendContainer();
        this.show();

        if (this.closeOnEscape()) {
            this.bindDocumentEscapeListener();
        }
    }

    onAfterLeave() {
        this.hide(false);
        ZIndexUtils.clear(this.container);
        this.unbindGlobalListeners();
        this.modalVisible.set(false);
        this.container = null;
    }

    appendContainer() {
        if (this.$appendTo() && this.$appendTo() !== 'self') {
            if (this.$appendTo() === 'body') {
                appendChild(this.document.body, this.container!);
            } else {
                appendChild(this.$appendTo(), this.container!);
            }
        }
    }

    bindDocumentEscapeListener() {
        const documentTarget: any = this.el ? this.el.nativeElement.ownerDocument : this.document;

        // Outside the zone so unrelated key presses do not trigger change detection; only a real close re-enters it.
        this.zone.runOutsideAngular(() => {
            this.documentEscapeListener = this.renderer.listen(documentTarget, 'keydown', (event) => {
                if (event.which == 27) {
                    if (parseInt((this.container as HTMLDivElement)?.style.zIndex) === ZIndexUtils.get(this.container)) {
                        this.zone.run(() => this.close(event));
                    }
                }
            });
        });
    }

    unbindDocumentEscapeListener() {
        if (this.documentEscapeListener) {
            this.documentEscapeListener();
            this.documentEscapeListener = null;
        }
    }

    unbindMaskClickListener() {
        if (this.maskClickListener) {
            this.maskClickListener();
            this.maskClickListener = null;
        }
    }

    unbindGlobalListeners() {
        this.unbindMaskClickListener();
        this.unbindDocumentEscapeListener();
    }

    unbindAnimationEndListener() {
        if (this.animationEndListener && this.mask) {
            this.animationEndListener();
            this.animationEndListener = null;
        }
    }

    onDestroy() {
        this.initialized = false;

        if (this.mask || (this.visible() && this.modal())) {
            this.destroyModal();
        }

        if (this.$appendTo() && this.container) {
            this.renderer.appendChild(this.el.nativeElement, this.container);
        }

        if (this.container && this.autoZIndex()) {
            ZIndexUtils.clear(this.container);
        }

        this.container = null;
        this.unbindGlobalListeners();
        this.unbindAnimationEndListener();
    }

    get dataP() {
        return this.cn({
            'full-screen': this.position() === 'full',
            [this.position()]: this.position(),
            open: this.visible(),
            modal: this.modal()
        });
    }
}

@NgModule({
    imports: [Drawer, SharedModule],
    exports: [Drawer, SharedModule]
})
export class DrawerModule {}

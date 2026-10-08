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
    signal,
    TemplateRef,
    untracked,
    viewChild,
    ViewEncapsulation,
    contentChild,
    contentChildren
} from '@angular/core';
import { MotionEvent, MotionOptions } from '@openng/optimus-ui-motion';
import { absolutePosition, addClass, appendChild, findSingle, focus, getOffset, isIOS, isTouchDevice } from '@openng/optimus-ui-utils';
import { Confirmation, ConfirmationService, OverlayService, PrimeTemplate, SharedModule, TranslationKeys } from '@openng/optimus-ui/api';
import { BaseComponent, PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { Bind } from '@openng/optimus-ui/bind';
import { ButtonModule } from '@openng/optimus-ui/button';
import { ConnectedOverlayScrollHandler } from '@openng/optimus-ui/dom';
import { FocusTrap } from '@openng/optimus-ui/focustrap';
import { MotionModule } from '@openng/optimus-ui/motion';
import { Nullable, VoidListener } from '@openng/optimus-ui/ts-helpers';
import { ConfirmPopupContentTemplateContext, ConfirmPopupHeadlessTemplateContext, ConfirmPopupPassThrough } from '@openng/optimus-ui/types/confirmpopup';
import { ZIndexUtils } from '@openng/optimus-ui/utils';
import { Subject, Subscription } from 'rxjs';
import { ConfirmPopupStyle } from './style/confirmpopupstyle';

/**
 * Minimal replacement of the EventEmitter used by Confirmation.acceptEvent/rejectEvent: a Subject that keeps the emit() method.
 */
class ConfirmationEvent<T = any> extends Subject<T> {
    emit(value?: T): void {
        this.next(value as T);
    }
}

const CONFIRMPOPUP_INSTANCE = new InjectionToken<ConfirmPopup>('CONFIRMPOPUP_INSTANCE');

/**
 * ConfirmPopup displays a confirmation overlay displayed relatively to its target.
 * @group Components
 */
@Component({
    selector: 'p-confirmpopup',
    standalone: true,
    imports: [NgTemplateOutlet, SharedModule, ButtonModule, FocusTrap, Bind, MotionModule],
    providers: [ConfirmPopupStyle, { provide: CONFIRMPOPUP_INSTANCE, useExisting: ConfirmPopup }, { provide: PARENT_INSTANCE, useExisting: ConfirmPopup }],
    hostDirectives: [Bind],
    host: {
        '(document:keydown.escape)': 'onEscapeKeydown($event)'
    },
    template: `
        @if (render()) {
            <div
                [pMotion]="computedVisible()"
                [pMotionAppear]="true"
                [pMotionName]="'p-anchored-overlay'"
                [pMotionOptions]="computedMotionOptions()"
                (pMotionOnBeforeEnter)="onBeforeEnter($event)"
                (pMotionOnAfterLeave)="onAfterLeave()"
                pFocusTrap
                [pBind]="ptm('root')"
                [class]="cn(cx('root'), styleClass())"
                [style]="style()"
                role="alertdialog"
                (click)="onOverlayClick($event)"
            >
                @if (headlessTemplate() || _headlessTemplate) {
                    <ng-container *ngTemplateOutlet="headlessTemplate() || _headlessTemplate; context: { $implicit: confirmation }"></ng-container>
                } @else {
                    <div #content [pBind]="ptm('content')" [class]="cx('content')">
                        @if (contentTemplate() || _contentTemplate) {
                            <ng-container *ngTemplateOutlet="contentTemplate() || _contentTemplate; context: { $implicit: confirmation }"></ng-container>
                        } @else {
                            @if (confirmation?.icon) {
                                <i [pBind]="ptm('icon')" [class]="cx('icon')"></i>
                            }
                            <span [pBind]="ptm('message')" [class]="cx('message')">{{ confirmation?.message }}</span>
                        }
                    </div>
                    <div [pBind]="ptm('footer')" [class]="cx('footer')">
                        @if (confirmation?.rejectVisible !== false) {
                            <p-button
                                type="button"
                                [label]="rejectButtonLabel"
                                (onClick)="onReject()"
                                #rejectButton
                                [pt]="ptm('pcRejectButton')"
                                [class]="cx('pcRejectButton')"
                                [styleClass]="confirmation?.rejectButtonStyleClass"
                                [size]="confirmation?.rejectButtonProps?.size || 'small'"
                                [text]="confirmation?.rejectButtonProps?.text || false"
                                [attr.aria-label]="rejectButtonLabel"
                                [buttonProps]="getRejectButtonProps()"
                                [autofocus]="autoFocusReject"
                                [unstyled]="unstyled()"
                            >
                                <ng-template #icon>
                                    @if (confirmation?.rejectIcon) {
                                        <i [class]="confirmation?.rejectIcon"></i>
                                    } @else {
                                        <ng-container *ngTemplateOutlet="rejectIconTemplate() || _rejectIconTemplate"></ng-container>
                                    }
                                </ng-template>
                            </p-button>
                        }
                        @if (confirmation?.acceptVisible !== false) {
                            <p-button
                                type="button"
                                [label]="acceptButtonLabel"
                                (onClick)="onAccept()"
                                #acceptButton
                                [pt]="ptm('pcAcceptButton')"
                                [class]="cx('pcAcceptButton')"
                                [styleClass]="confirmation?.acceptButtonStyleClass"
                                [size]="confirmation?.acceptButtonProps?.size || 'small'"
                                [attr.aria-label]="acceptButtonLabel"
                                [buttonProps]="getAcceptButtonProps()"
                                [autofocus]="autoFocusAccept"
                                [unstyled]="unstyled()"
                            >
                                <ng-template #icon>
                                    @if (confirmation?.acceptIcon) {
                                        <i [class]="confirmation?.acceptIcon"></i>
                                    } @else {
                                        <ng-container *ngTemplateOutlet="acceptIconTemplate() || _acceptIconTemplate"></ng-container>
                                    }
                                </ng-template>
                            </p-button>
                        }
                    </div>
                }
            </div>
        }
    `,

    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ConfirmPopup extends BaseComponent<ConfirmPopupPassThrough> {
    componentName = 'ConfirmPopup';

    $pcConfirmPopup: ConfirmPopup | undefined = inject(CONFIRMPOPUP_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptm('host'));
    }

    /**
     * Optional key to match the key of confirm object, necessary to use when component tree has multiple confirm dialogs.
     * @group Props
     */
    readonly key = input<string | undefined>(undefined);
    /**
     * Element to receive the focus when the popup gets visible, valid values are "accept", "reject", and "none".
     * @group Props
     */
    readonly defaultFocus = input<string>('accept');
    /**
     * Transition options of the show animation.
     * @group Props
     * @deprecated since v21.0.0. Use `motionOptions` instead.
     */
    readonly showTransitionOptions = input<string>('.12s cubic-bezier(0, 0, 0.2, 1)');
    /**
     * Transition options of the hide animation.
     * @group Props
     * @deprecated since v21.0.0. Use `motionOptions` instead.
     */
    readonly hideTransitionOptions = input<string>('.1s linear');
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
     * Defines if the component is visible.
     * @group Props
     */
    visible = input<boolean>();

    private _visible = signal<boolean>(false);

    computedVisible = computed(() => this.visible() ?? this._visible());

    render = signal<boolean>(false);

    /**
     * The motion options.
     * @group Props
     */
    motionOptions = input<MotionOptions | undefined>(undefined);

    computedMotionOptions = computed<MotionOptions>(() => {
        return {
            ...this.ptm('motion'),
            ...this.motionOptions()
        };
    });
    /**
     * Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name).
     * @defaultValue 'body'
     * @group Props
     */
    appendTo = input<HTMLElement | ElementRef | TemplateRef<any> | 'self' | 'body' | null | undefined | any>('body');

    $appendTo = computed(() => this.appendTo() || this.config.overlayAppendTo());

    container: HTMLElement | null;

    subscription: Subscription;

    confirmation: Nullable<Confirmation>;

    autoFocusAccept: boolean = false;

    autoFocusReject: boolean = false;

    /**
     * Custom content template.
     * @group Templates
     */
    readonly contentTemplate = contentChild<Nullable<TemplateRef<ConfirmPopupContentTemplateContext>>>('content', { descendants: false });

    /**
     * Custom accept icon template.
     * @group Templates
     */
    readonly acceptIconTemplate = contentChild<Nullable<TemplateRef<void>>>('accepticon', { descendants: false });

    /**
     * Custom reject icon template.
     * @group Templates
     */
    readonly rejectIconTemplate = contentChild<Nullable<TemplateRef<void>>>('rejecticon', { descendants: false });

    /**
     * Custom headless template.
     * @group Templates
     */
    readonly headlessTemplate = contentChild<Nullable<TemplateRef<ConfirmPopupHeadlessTemplateContext>>>('headless', { descendants: false });

    acceptButtonViewChild = viewChild('acceptButton', { read: ElementRef });

    rejectButtonViewChild = viewChild('rejectButton', { read: ElementRef });

    _contentTemplate: TemplateRef<ConfirmPopupContentTemplateContext> | undefined;

    _acceptIconTemplate: TemplateRef<void> | undefined;

    _rejectIconTemplate: TemplateRef<void> | undefined;

    _headlessTemplate: TemplateRef<ConfirmPopupHeadlessTemplateContext> | undefined;

    documentClickListener: VoidListener;

    documentResizeListener: VoidListener;

    scrollHandler: Nullable<ConnectedOverlayScrollHandler>;

    private window: Window;

    _componentStyle = inject(ConfirmPopupStyle);

    private confirmationService: ConfirmationService = inject(ConfirmationService);

    overlayService: OverlayService = inject(OverlayService);

    private zone: NgZone = inject(NgZone);

    private alignFrame: number | undefined;

    private listenersTimeout: ReturnType<typeof setTimeout> | undefined;

    constructor() {
        super();
        this.window = this.document.defaultView as Window;
        this.subscription = this.confirmationService.requireConfirmation$.subscribe((confirmation) => {
            if (!confirmation) {
                this.hide();
                return;
            }

            if (this.computedVisible()) {
                cancelAnimationFrame(this.alignFrame!);
                this.alignFrame = requestAnimationFrame(() => {
                    this.alignFrame = undefined;
                    if (this.container) {
                        this.alignOverlay();
                    }
                    this.cd.markForCheck();
                });
            }

            if (confirmation.key === this.key()) {
                this.confirmation = confirmation;
                this.cd.markForCheck();

                if (this.confirmation.accept) {
                    const acceptEvent = new ConfirmationEvent();
                    this.confirmation.acceptEvent = acceptEvent as any;
                    acceptEvent.subscribe(this.confirmation.accept as (value?: any) => void);
                }

                if (this.confirmation.reject) {
                    const rejectEvent = new ConfirmationEvent();
                    this.confirmation.rejectEvent = rejectEvent as any;
                    rejectEvent.subscribe(this.confirmation.reject as (value?: any) => void);
                }

                this._visible.set(true);
            }
        });

        effect(() => {
            if (this.computedVisible()) {
                untracked(() => {
                    if (!this.render()) {
                        this.render.set(true);
                    }
                });
            }
        });
    }

    readonly templates = contentChildren(PrimeTemplate);

    onAfterContentInit() {
        this.templates()?.forEach((item) => {
            switch (item.getType()) {
                case 'content':
                    this._contentTemplate = item.template;
                    break;

                case 'rejecticon':
                    this._rejectIconTemplate = item.template;
                    break;

                case 'accepticon':
                    this._acceptIconTemplate = item.template;
                    break;

                case 'headless':
                    this._headlessTemplate = item.template;
                    break;
            }
        });
    }

    option(name: string, k?: string) {
        const confirmation: { [key: string]: any } = this.confirmation ?? {};
        const source: { [key: string]: any } = Object.prototype.hasOwnProperty.call(confirmation, name) ? confirmation : this;

        if (Object.prototype.hasOwnProperty.call(source, name)) {
            // A property of the component is a signal (input): read its value. A property of the confirmation is plain data.
            const value = source === this && typeof source[name] === 'function' ? source[name]() : source[name];

            return k ? value?.[k] : value;
        }

        return undefined;
    }

    onEscapeKeydown(event: KeyboardEvent) {
        if (this.confirmation && this.confirmation.closeOnEscape !== false) {
            this.onReject();
        }
    }

    onBeforeEnter(event: MotionEvent) {
        if (this.confirmation) {
            const focus = this.option('defaultFocus');
            this.autoFocusAccept = focus === 'accept';
            this.autoFocusReject = focus === 'reject';
        }

        this.container = event.element as HTMLElement;
        this.appendOverlay();
        this.alignOverlay();
        this.alignArrow();
        this.setZIndex();
        this.handleFocus();
        this.bindListeners();
    }

    handleFocus() {
        const defaultFocus = this.option('defaultFocus');

        if (defaultFocus && (this.acceptButtonViewChild() || this.rejectButtonViewChild())) {
            const focusEl = <HTMLButtonElement>(defaultFocus === 'accept' ? findSingle(this.acceptButtonViewChild()?.nativeElement, '[data-pc-section="root"]') : findSingle(this.rejectButtonViewChild()?.nativeElement, '[data-pc-section="root"]'));
            focusEl?.focus();
        }
    }

    onAfterLeave() {
        this.autoFocusAccept = false;
        this.autoFocusReject = false;
        this.restoreAppend();
        this.onContainerDestroy();
    }

    getAcceptButtonProps() {
        return this.option('acceptButtonProps');
    }

    getRejectButtonProps() {
        return this.option('rejectButtonProps');
    }

    alignOverlay() {
        if (!this.confirmation || !this.confirmation.target) {
            return;
        }

        absolutePosition(this.container!, this.confirmation?.target as HTMLElement, false);
    }

    setZIndex() {
        if (this.autoZIndex()) {
            ZIndexUtils.set('overlay', this.container, this.config.zIndex.overlay);
        }
    }

    alignArrow() {
        const containerOffset = <any>getOffset(this.container);
        const targetOffset = <any>getOffset(this.confirmation?.target as any);
        let arrowLeft = 0;

        if (containerOffset && targetOffset && containerOffset.left < targetOffset.left) {
            arrowLeft = targetOffset.left - containerOffset.left;
        }
        if (this.container) {
            (this.container as HTMLDivElement).style.setProperty('--p-confirmpopup-arrow-left', `${arrowLeft}px`);
        }

        if (containerOffset && targetOffset && containerOffset.top < targetOffset.top) {
            (this.container as HTMLElement).setAttribute('data-p-confirmpopup-flipped', 'true');
            !this.$unstyled() && addClass(this.container as HTMLDivElement, 'p-confirm-popup-flipped');
        }
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

    restoreAppend() {
        if (this.container && this.$appendTo() !== 'self') {
            appendChild(this.el.nativeElement, this.container);
        }

        this.onContainerDestroy();
    }

    hide() {
        this._visible.set(false);
    }

    onAccept() {
        if (this.confirmation?.acceptEvent) {
            this.confirmation.acceptEvent.emit();
        }

        this.hide();
        focus(this.confirmation?.target as any);
    }

    onReject() {
        if (this.confirmation?.rejectEvent) {
            this.confirmation.rejectEvent.emit();
        }

        this.hide();
        focus(this.confirmation?.target as any);
    }

    onOverlayClick(event: MouseEvent) {
        this.overlayService.add({
            originalEvent: event,
            target: this.el.nativeElement
        });
    }

    bindListeners(): void {
        /*
         * Called inside `setTimeout` to avoid listening to the click event that appears when `confirm` is first called(bubbling).
         * Need wait when bubbling event up and hang the handler on the next tick.
         * This is the case when eventTarget and confirmation.target do not match when the `confirm` method is called.
         */
        clearTimeout(this.listenersTimeout);
        this.listenersTimeout = setTimeout(() => {
            this.listenersTimeout = undefined;
            this.bindDocumentClickListener();
            this.bindDocumentResizeListener();
            this.bindScrollListener();
        });
    }

    unbindListeners() {
        clearTimeout(this.listenersTimeout);
        this.listenersTimeout = undefined;
        this.unbindDocumentClickListener();
        this.unbindDocumentResizeListener();
        this.unbindScrollListener();
    }

    bindDocumentClickListener() {
        if (!this.documentClickListener) {
            let documentEvent = isIOS() ? 'touchstart' : 'click';
            const documentTarget: any = this.el ? this.el.nativeElement.ownerDocument : this.document;

            // Outside the zone: only a real dismiss writes the visibility signal.
            this.zone.runOutsideAngular(() => {
                this.documentClickListener = this.renderer.listen(documentTarget, documentEvent, (event) => {
                    if (this.confirmation && this.confirmation.dismissableMask !== false) {
                        let targetElement = <HTMLElement>this.confirmation.target;
                        if (this.container !== event.target && !this.container?.contains(event.target) && targetElement !== event.target && !targetElement.contains(event.target)) {
                            this.hide();
                        }
                    }
                });
            });
        }
    }

    unbindDocumentClickListener() {
        if (this.documentClickListener) {
            this.documentClickListener();
            this.documentClickListener = null;
        }
    }

    onWindowResize() {
        if (this.computedVisible() && !isTouchDevice()) {
            this.hide();
        }
    }

    bindDocumentResizeListener() {
        if (!this.documentResizeListener) {
            this.zone.runOutsideAngular(() => {
                this.documentResizeListener = this.renderer.listen(this.window, 'resize', this.onWindowResize.bind(this));
            });
        }
    }

    unbindDocumentResizeListener() {
        if (this.documentResizeListener) {
            this.documentResizeListener();
            this.documentResizeListener = null;
        }
    }

    bindScrollListener() {
        if (!this.scrollHandler) {
            this.scrollHandler = new ConnectedOverlayScrollHandler(
                this.confirmation?.target,
                () => {
                    if (this.computedVisible()) {
                        this.hide();
                    }
                },
                this.zone
            );
        }

        this.scrollHandler.bindScrollListener();
    }

    unbindScrollListener() {
        if (this.scrollHandler) {
            this.scrollHandler.unbindScrollListener();
        }
    }

    unsubscribeConfirmationSubscriptions() {
        if (this.confirmation) {
            if (this.confirmation.acceptEvent) {
                this.confirmation.acceptEvent.unsubscribe();
            }

            if (this.confirmation.rejectEvent) {
                this.confirmation.rejectEvent.unsubscribe();
            }
        }
    }

    onContainerDestroy() {
        this.unbindListeners();
        this.unsubscribeConfirmationSubscriptions();

        if (this.autoZIndex()) {
            ZIndexUtils.clear(this.container);
        }

        this.confirmation = null;
        this.render.set(false);
        this.container = null;
    }

    get acceptButtonLabel(): string {
        return this.confirmation?.acceptLabel || this.confirmation?.acceptButtonProps?.label || this.config.getTranslation(TranslationKeys.ACCEPT);
    }

    get rejectButtonLabel(): string {
        return this.confirmation?.rejectLabel || this.confirmation?.rejectButtonProps?.label || this.config.getTranslation(TranslationKeys.REJECT);
    }

    onDestroy() {
        // The frame only exists in the browser, so the server never reaches cancelAnimationFrame.
        if (this.alignFrame != null) cancelAnimationFrame(this.alignFrame);
        this.scrollHandler?.destroy();
        this.scrollHandler = null;
        this.restoreAppend();

        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}

@NgModule({
    imports: [ConfirmPopup, SharedModule],
    exports: [ConfirmPopup, SharedModule]
})
export class ConfirmPopupModule {}

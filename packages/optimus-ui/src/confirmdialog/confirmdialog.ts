import { NgTemplateOutlet } from '@angular/common';
import {
    AfterContentInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    inject,
    InjectionToken,
    input,
    model,
    NgModule,
    NgZone,
    numberAttribute,
    OnDestroy,
    OnInit,
    output,
    TemplateRef,
    ViewEncapsulation,
    contentChild,
    contentChildren
} from '@angular/core';
import { findSingle, setAttribute, uuid } from '@openng/optimus-ui-utils';
import { Confirmation, ConfirmationService, ConfirmEventType, Footer, PrimeTemplate, SharedModule, TranslationKeys } from '@openng/optimus-ui/api';
import { BaseComponent, PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { Bind } from '@openng/optimus-ui/bind';
import { Button } from '@openng/optimus-ui/button';
import { Dialog } from '@openng/optimus-ui/dialog';
import { Nullable } from '@openng/optimus-ui/ts-helpers';
import { ConfirmDialogHeadlessTemplateContext, ConfirmDialogMessageTemplateContext, ConfirmDialogPassThrough } from '@openng/optimus-ui/types/confirmdialog';
import { Subject, Subscription } from 'rxjs';
import { ConfirmDialogStyle } from './style/confirmdialogstyle';

/**
 * Minimal replacement of the EventEmitter used by Confirmation.acceptEvent/rejectEvent: a Subject that keeps the emit() method.
 */
class ConfirmationEvent<T = any> extends Subject<T> {
    emit(value?: T): void {
        this.next(value as T);
    }
}

const CONFIRMDIALOG_INSTANCE = new InjectionToken<ConfirmDialog>('CONFIRMDIALOG_INSTANCE');

/**
 * ConfirmDialog uses a Dialog UI that is integrated with the Confirmation API.
 * @group Components
 */
@Component({
    selector: 'p-confirmDialog, p-confirmdialog, p-confirm-dialog',
    standalone: true,
    imports: [NgTemplateOutlet, Button, Dialog, SharedModule, Bind],
    template: `
        <p-dialog
            [pt]="pt"
            #dialog
            [visible]="visible()"
            (visibleChange)="onVisibleChange($event)"
            role="alertdialog"
            [closable]="option('closable')"
            [styleClass]="cn(cx('root'), styleClass())"
            [modal]="option('modal')"
            [header]="option('header')"
            [closeOnEscape]="option('closeOnEscape')"
            [blockScroll]="option('blockScroll')"
            [appendTo]="$appendTo()"
            [position]="option('position')"
            [style]="style()"
            [dismissableMask]="option('dismissableMask')"
            [draggable]="draggable()"
            [baseZIndex]="baseZIndex()"
            [autoZIndex]="autoZIndex()"
            [maskStyleClass]="cn(cx('mask'), maskStyleClass())"
            [unstyled]="unstyled()"
            (onHide)="onDialogHide()"
        >
            @if (headlessTemplate() || _headlessTemplate) {
                <ng-template #headless>
                    <ng-container
                        *ngTemplateOutlet="
                            headlessTemplate() || _headlessTemplate;
                            context: {
                                $implicit: confirmation,
                                onAccept: onAccept.bind(this),
                                onReject: onReject.bind(this)
                            }
                        "
                    ></ng-container>
                </ng-template>
            } @else {
                @if (headerTemplate() || _headerTemplate) {
                    <ng-template #header>
                        <ng-container *ngTemplateOutlet="headerTemplate() || _headerTemplate"></ng-container>
                    </ng-template>
                }

                <ng-template #content>
                    @if (iconTemplate() || _iconTemplate) {
                        <ng-container *ngTemplateOutlet="iconTemplate() || _iconTemplate"></ng-container>
                    } @else if (!iconTemplate() && !_iconTemplate && !_messageTemplate && !messageTemplate()) {
                        @if (option('icon')) {
                            <i [class]="cn(cx('icon'), option('icon'))" [pBind]="ptm('icon')"></i>
                        }
                    }
                    @if (messageTemplate() || _messageTemplate) {
                        <ng-container *ngTemplateOutlet="messageTemplate() || _messageTemplate; context: { $implicit: confirmation }"></ng-container>
                    } @else {
                        <span [class]="cx('message')" [pBind]="ptm('message')" [innerHTML]="option('message')"> </span>
                    }
                </ng-template>
            }
            <ng-template #footer>
                @if (footerTemplate() || _footerTemplate) {
                    <ng-content select="p-footer"></ng-content>
                    <ng-container *ngTemplateOutlet="footerTemplate() || _footerTemplate"></ng-container>
                }
                @if (!footerTemplate() && !_footerTemplate) {
                    @if (option('rejectVisible')) {
                        <p-button
                            [pt]="ptm('pcRejectButton')"
                            [label]="rejectButtonLabel"
                            (onClick)="onReject()"
                            [styleClass]="getButtonStyleClass('pcRejectButton', 'rejectButtonStyleClass')"
                            [ariaLabel]="option('rejectButtonProps', 'ariaLabel')"
                            [buttonProps]="getRejectButtonProps()"
                            [unstyled]="unstyled()"
                        >
                            <ng-template #icon>
                                @if (option('rejectIcon') && !rejectIconTemplate() && !_rejectIconTemplate) {
                                    <i [class]="option('rejectIcon')" [pBind]="ptm('pcRejectButton')['icon']"></i>
                                }
                                <ng-container *ngTemplateOutlet="rejectIconTemplate() || _rejectIconTemplate"></ng-container>
                            </ng-template>
                        </p-button>
                    }
                    @if (option('acceptVisible')) {
                        <p-button
                            [pt]="ptm('pcAcceptButton')"
                            [label]="acceptButtonLabel"
                            (onClick)="onAccept()"
                            [styleClass]="getButtonStyleClass('pcAcceptButton', 'acceptButtonStyleClass')"
                            [ariaLabel]="option('acceptButtonProps', 'ariaLabel')"
                            [buttonProps]="getAcceptButtonProps()"
                            [unstyled]="unstyled()"
                        >
                            <ng-template #icon>
                                @if (option('acceptIcon') && !_acceptIconTemplate && !acceptIconTemplate()) {
                                    <i [class]="option('acceptIcon')" [pBind]="ptm('pcAcceptButton')['icon']"></i>
                                }
                                <ng-container *ngTemplateOutlet="acceptIconTemplate() || _acceptIconTemplate"></ng-container>
                            </ng-template>
                        </p-button>
                    }
                }
            </ng-template>
        </p-dialog>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [ConfirmDialogStyle, { provide: CONFIRMDIALOG_INSTANCE, useExisting: ConfirmDialog }, { provide: PARENT_INSTANCE, useExisting: ConfirmDialog }],
    hostDirectives: [Bind]
})
export class ConfirmDialog extends BaseComponent<ConfirmDialogPassThrough> implements OnInit, AfterContentInit, OnDestroy {
    componentName = 'ConfirmDialog';

    $pcConfirmDialog: ConfirmDialog | undefined = inject(CONFIRMDIALOG_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptm('host'));
    }

    /**
     * Title text of the dialog.
     * @group Props
     */
    readonly header = input<string | undefined>(undefined);
    /**
     * Icon to display next to message.
     * @group Props
     */
    readonly icon = input<string | undefined>(undefined);
    /**
     * Message of the confirmation.
     * @group Props
     */
    readonly message = input<string | undefined>(undefined);
    /**
     * Inline style of the element.
     * @group Props
     */
    readonly style = input<{ [klass: string]: any } | null | undefined>(undefined);
    /**
     * Class of the element.
     * @group Props
     */
    readonly styleClass = input<string | undefined>(undefined);
    /**
     * Specify the CSS class(es) for styling the mask element
     * @group Props
     */
    readonly maskStyleClass = input<string | undefined>(undefined);
    /**
     * Icon of the accept button.
     * @group Props
     */
    readonly acceptIcon = input<string | undefined>(undefined);
    /**
     * Label of the accept button.
     * @group Props
     */
    readonly acceptLabel = input<string | undefined>(undefined);
    /**
     * Defines a string that labels the close button for accessibility.
     * @group Props
     */
    readonly closeAriaLabel = input<string | undefined>(undefined);
    /**
     * Defines a string that labels the accept button for accessibility.
     * @group Props
     */
    readonly acceptAriaLabel = input<string | undefined>(undefined);
    /**
     * Visibility of the accept button.
     * @group Props
     */
    readonly acceptVisible = input<boolean, unknown>(true, { transform: booleanAttribute });
    /**
     * Icon of the reject button.
     * @group Props
     */
    readonly rejectIcon = input<string | undefined>(undefined);
    /**
     * Label of the reject button.
     * @group Props
     */
    readonly rejectLabel = input<string | undefined>(undefined);
    /**
     * Defines a string that labels the reject button for accessibility.
     * @group Props
     */
    readonly rejectAriaLabel = input<string | undefined>(undefined);
    /**
     * Visibility of the reject button.
     * @group Props
     */
    readonly rejectVisible = input<boolean, unknown>(true, { transform: booleanAttribute });
    /**
     * Style class of the accept button.
     * @group Props
     */
    readonly acceptButtonStyleClass = input<string | undefined>(undefined);
    /**
     * Style class of the reject button.
     * @group Props
     */
    readonly rejectButtonStyleClass = input<string | undefined>(undefined);
    /**
     * Specifies if pressing escape key should hide the dialog.
     * @group Props
     */
    readonly closeOnEscape = input<boolean, unknown>(true, { transform: booleanAttribute });
    /**
     * Specifies if clicking the modal background should hide the dialog.
     * @group Props
     */
    readonly dismissableMask = input<boolean | undefined, unknown>(undefined, { transform: booleanAttribute });
    /**
     * Determines whether scrolling behavior should be blocked within the component.
     * @group Props
     */
    readonly blockScroll = input<boolean, unknown>(true, { transform: booleanAttribute });
    /**
     * When enabled dialog is displayed in RTL direction.
     * @group Props
     */
    readonly rtl = input<boolean, unknown>(false, { transform: booleanAttribute });
    /**
     * Adds a close icon to the header to hide the dialog.
     * @group Props
     */
    readonly closable = input<boolean, unknown>(true, { transform: booleanAttribute });
    /**
     * Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name).
     * @defaultValue 'body'
     * @group Props
     */
    appendTo = input<HTMLElement | ElementRef | TemplateRef<any> | 'self' | 'body' | null | undefined | any>('body');
    /**
     * Optional key to match the key of confirm object, necessary to use when component tree has multiple confirm dialogs.
     * @group Props
     */
    readonly key = input<string | undefined>(undefined);
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
     * Transition options of the animation.
     * @group Props
     */
    readonly transitionOptions = input<string>('150ms cubic-bezier(0, 0, 0.2, 1)');
    /**
     * When enabled, can only focus on elements inside the confirm dialog.
     * @group Props
     */
    readonly focusTrap = input<boolean, unknown>(true, { transform: booleanAttribute });
    /**
     * Element to receive the focus when the dialog gets visible.
     * @group Props
     */
    readonly defaultFocus = input<'accept' | 'reject' | 'close' | 'none'>('accept');
    /**
     * Object literal to define widths per screen size.
     * @group Props
     */
    readonly breakpoints = input<any>(undefined);
    /**
     * Defines if background should be blocked when dialog is displayed.
     * @group Props
     */
    readonly modal = input<boolean, unknown>(true, { transform: booleanAttribute });
    /**
     * Current visible state as a boolean.
     * @group Props
     */
    readonly visible = model<boolean>(false);
    /**
     *  Allows getting the position of the component.
     * @group Props
     */
    readonly position = input<'center' | 'top' | 'bottom' | 'left' | 'right' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright'>('center');
    /**
     * Enables dragging to change the position using header.
     * @group Props
     */
    readonly draggable = input<boolean, unknown>(true, { transform: booleanAttribute });
    /**
     * Callback to invoke when dialog is hidden.
     * @param {ConfirmEventType} enum - Custom confirm event.
     * @group Emits
     */
    onHide = output<ConfirmEventType>();

    readonly footer = contentChild(Footer);

    _componentStyle = inject(ConfirmDialogStyle);

    /**
     * Custom header template.
     * @group Templates
     */
    readonly headerTemplate = contentChild<Nullable<TemplateRef<void>>>('header', { descendants: false });

    /**
     * Custom footer template.
     * @group Templates
     */
    readonly footerTemplate = contentChild<Nullable<TemplateRef<void>>>('footer', { descendants: false });

    /**
     * Custom reject icon template.
     * @group Templates
     */
    readonly rejectIconTemplate = contentChild<Nullable<TemplateRef<void>>>('rejecticon', { descendants: false });

    /**
     * Custom accept icon template.
     * @group Templates
     */
    readonly acceptIconTemplate = contentChild<Nullable<TemplateRef<void>>>('accepticon', { descendants: false });

    /**
     * Custom message template.
     * @group Templates
     */
    readonly messageTemplate = contentChild<Nullable<TemplateRef<ConfirmDialogMessageTemplateContext>>>('message', { descendants: false });

    /**
     * Custom icon template.
     * @group Templates
     */
    readonly iconTemplate = contentChild<Nullable<TemplateRef<void>>>('icon', { descendants: false });

    /**
     * Custom headless template.
     * @group Templates
     */
    readonly headlessTemplate = contentChild<Nullable<TemplateRef<ConfirmDialogHeadlessTemplateContext>>>('headless', { descendants: false });

    readonly templates = contentChildren(PrimeTemplate);

    $appendTo = computed(() => this.appendTo() || this.config.overlayAppendTo());

    _headerTemplate: TemplateRef<void> | undefined;

    _footerTemplate: TemplateRef<void> | undefined;

    _rejectIconTemplate: TemplateRef<void> | undefined;

    _acceptIconTemplate: TemplateRef<void> | undefined;

    _messageTemplate: TemplateRef<ConfirmDialogMessageTemplateContext> | undefined;

    _iconTemplate: TemplateRef<void> | undefined;

    _headlessTemplate: TemplateRef<ConfirmDialogHeadlessTemplateContext> | undefined;

    confirmation: Nullable<Confirmation>;

    dialog: Nullable<Dialog>;

    wrapper: Nullable<HTMLElement>;

    contentContainer: Nullable<HTMLDivElement>;

    subscription: Subscription;

    preWidth: number | undefined;

    styleElement: any;

    id = uuid('pn_id_');

    ariaLabelledBy: string | null = this.getAriaLabelledBy();

    translationSubscription: Subscription | undefined;

    private confirmationService: ConfirmationService = inject(ConfirmationService);

    zone: NgZone = inject(NgZone);

    constructor() {
        super();
        this.subscription = this.confirmationService.requireConfirmation$.subscribe((confirmation) => {
            if (!confirmation) {
                this.hide();
                return;
            }
            if (confirmation.key === this.key()) {
                this.confirmation = confirmation;

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

                this.visible.set(true);
            }
        });
    }

    onInit() {
        if (this.breakpoints()) {
            this.createStyle();
        }

        this.translationSubscription = this.config.translationObserver.subscribe(() => {
            if (this.visible()) {
                this.cd.markForCheck();
            }
        });
    }

    onAfterContentInit() {
        this.templates()?.forEach((item) => {
            switch (item.getType()) {
                case 'header':
                    this._headerTemplate = item.template;
                    break;

                case 'footer':
                    this._footerTemplate = item.template;
                    break;

                case 'message':
                    this._messageTemplate = item.template;
                    break;

                case 'icon':
                    this._iconTemplate = item.template;
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

    getAriaLabelledBy() {
        return this.header() !== null ? uuid('pn_id_') + '_header' : null;
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

    getButtonStyleClass(cx: string, opt: string): string {
        const cxClass = this.cx(cx);
        const optionClass = this.option(opt);

        return [cxClass, optionClass].filter(Boolean).join(' ');
    }

    getElementToFocus() {
        if (!this.dialog?.el?.nativeElement) return;

        switch (this.option('defaultFocus')) {
            case 'accept':
                return findSingle(this.dialog.el.nativeElement, '.p-confirm-dialog-accept');

            case 'reject':
                return findSingle(this.dialog.el.nativeElement, '.p-confirm-dialog-reject');

            case 'close':
                return findSingle(this.dialog.el.nativeElement, '.p-dialog-header-close');

            case 'none':
                return null;

            //backward compatibility
            default:
                return findSingle(this.dialog.el.nativeElement, '.p-confirm-dialog-accept');
        }
    }

    createStyle() {
        if (!this.styleElement) {
            this.styleElement = this.document.createElement('style');
            this.styleElement.type = 'text/css';
            setAttribute(this.styleElement, 'nonce', this.config?.csp()?.nonce);
            this.document.head.appendChild(this.styleElement);
            let innerHTML = '';
            for (let breakpoint in this.breakpoints()) {
                innerHTML += `
                    @media screen and (max-width: ${breakpoint}) {
                        .p-dialog[${this.id}] {
                            width: ${this.breakpoints()[breakpoint]} !important;
                        }
                    }
                `;
            }

            this.styleElement.innerHTML = innerHTML;
            setAttribute(this.styleElement, 'nonce', this.config?.csp()?.nonce);
        }
    }

    close() {
        if (this.confirmation?.rejectEvent) {
            this.confirmation.rejectEvent.emit(ConfirmEventType.CANCEL);
        }

        this.hide(ConfirmEventType.CANCEL);
    }

    hide(type?: ConfirmEventType) {
        this.onHide.emit(type as ConfirmEventType);
        this.visible.set(false);
        // Unsubscribe from confirmation events when the dialogue is closed, because events are created when the dialogue is opened.
        this.unsubscribeConfirmationEvents();
    }

    onDialogHide() {
        this.confirmation = null;
    }

    destroyStyle() {
        if (this.styleElement) {
            this.document.head.removeChild(this.styleElement);
            this.styleElement = null;
        }
    }

    onDestroy() {
        this.subscription.unsubscribe();
        // Unsubscribe from confirmation events if the dialogue is opened and this component is somehow destroyed.
        this.unsubscribeConfirmationEvents();

        if (this.translationSubscription) {
            this.translationSubscription.unsubscribe();
        }

        this.destroyStyle();
    }

    onVisibleChange(value: boolean) {
        if (!value) {
            this.close();
        } else {
            this.visible.set(value);
        }
    }

    onAccept() {
        if (this.confirmation && this.confirmation.acceptEvent) {
            this.confirmation.acceptEvent.emit();
        }
        this.hide(ConfirmEventType.ACCEPT);
    }

    onReject() {
        if (this.confirmation && this.confirmation.rejectEvent) {
            this.confirmation.rejectEvent.emit(ConfirmEventType.REJECT);
        }

        this.hide(ConfirmEventType.REJECT);
    }

    unsubscribeConfirmationEvents() {
        if (this.confirmation) {
            this.confirmation.acceptEvent?.unsubscribe();
            this.confirmation.rejectEvent?.unsubscribe();
        }
    }

    get acceptButtonLabel(): string {
        return this.option('acceptLabel') || this.getAcceptButtonProps()?.label || this.config.getTranslation(TranslationKeys.ACCEPT);
    }

    get rejectButtonLabel(): string {
        return this.option('rejectLabel') || this.getRejectButtonProps()?.label || this.config.getTranslation(TranslationKeys.REJECT);
    }

    getAcceptButtonProps() {
        return this.option('acceptButtonProps');
    }

    getRejectButtonProps() {
        return this.option('rejectButtonProps');
    }
}

@NgModule({
    imports: [ConfirmDialog, SharedModule],
    exports: [ConfirmDialog, SharedModule]
})
export class ConfirmDialogModule {}

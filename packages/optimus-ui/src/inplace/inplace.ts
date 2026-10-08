import { NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, contentChild, contentChildren, inject, InjectionToken, input, linkedSignal, NgModule, output, TemplateRef, ViewEncapsulation } from '@angular/core';
import { PrimeTemplate, SharedModule } from '@openng/optimus-ui/api';
import { BaseComponent, PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { Bind } from '@openng/optimus-ui/bind';
import { ButtonModule } from '@openng/optimus-ui/button';
import { TimesIcon } from '@openng/optimus-ui/icons';
import { Ripple } from '@openng/optimus-ui/ripple';
import { InplaceContentTemplateContext, InplacePassThrough } from '@openng/optimus-ui/types/inplace';
import { InplaceStyle } from './style/inplacestyle';

const INPLACE_INSTANCE = new InjectionToken<Inplace>('INPLACE_INSTANCE');

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'p-inplacedisplay, p-inplaceDisplay',
    standalone: true,
    imports: [],
    template: '<ng-content></ng-content>'
})
export class InplaceDisplay extends BaseComponent {}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'p-inplacecontent, p-inplaceContent',
    standalone: true,
    imports: [],
    template: '<ng-content></ng-content>'
})
export class InplaceContent extends BaseComponent {}
/**
 * Inplace provides an easy to do editing and display at the same time where clicking the output displays the actual content.
 * @group Components
 */
@Component({
    selector: 'p-inplace',
    standalone: true,
    imports: [NgTemplateOutlet, ButtonModule, TimesIcon, SharedModule, Ripple, Bind],
    template: `
        @if (!_active()) {
            <div [class]="cx('display')" [pBind]="ptm('display')" (click)="onActivateClick($event)" tabindex="0" role="button" (keydown)="onKeydown($event)" [attr.data-p-disabled]="disabled()">
                <ng-content select="[pInplaceDisplay]"></ng-content>
                <ng-container *ngTemplateOutlet="displayTemplate() || _displayTemplate"></ng-container>
            </div>
        }
        @if (_active()) {
            <div [class]="cx('content')" [pBind]="ptm('content')">
                <ng-content select="[pInplaceContent]"></ng-content>
                <ng-container *ngTemplateOutlet="contentTemplate() || _contentTemplate; context: { closeCallback: onDeactivateClick.bind(this) }"></ng-container>
                @if (closable()) {
                    @if (closeIcon()) {
                        <p-button [pt]="ptm('pcButton')" type="button" [icon]="closeIcon()" pRipple (click)="onDeactivateClick($event)" [attr.aria-label]="closeAriaLabel()"></p-button>
                    }
                    @if (!closeIcon()) {
                        <p-button [pt]="ptm('pcButton')" type="button" pRipple (click)="onDeactivateClick($event)" [attr.aria-label]="closeAriaLabel()">
                            <ng-template #icon>
                                @if (!closeIconTemplate() && !_closeIconTemplate) {
                                    <svg data-p-icon="times" />
                                }
                            </ng-template>
                            <ng-template *ngTemplateOutlet="closeIconTemplate() || _closeIconTemplate"></ng-template>
                        </p-button>
                    }
                }
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [InplaceStyle, { provide: INPLACE_INSTANCE, useExisting: Inplace }, { provide: PARENT_INSTANCE, useExisting: Inplace }],
    host: {
        '[attr.aria-live]': "'polite'",
        '[class]': "cn(cx('root'), styleClass())"
    },
    hostDirectives: [Bind]
})
export class Inplace extends BaseComponent<InplacePassThrough> {
    componentName = 'Inplace';

    $pcInplace: Inplace | undefined = inject(INPLACE_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    /**
     * Whether the content is displayed or not.
     * @group Props
     */
    readonly active = input<boolean | undefined, unknown>(false, { transform: booleanAttribute });
    /**
     * Internal state of the display: follows the `active` input and changes when the inplace is activated or deactivated.
     */
    readonly _active = linkedSignal<boolean | undefined>(() => this.active());
    /**
     * Displays a button to switch back to display mode.
     * @deprecated since v20.0.0, use `closeCallback` within content template.
     * @group Props
     */
    readonly closable = input<boolean | undefined, unknown>(false, { transform: booleanAttribute });
    /**
     * When present, it specifies that the element should be disabled.
     * @group Props
     */
    readonly disabled = input<boolean | undefined, unknown>(false, { transform: booleanAttribute });
    /**
     * Allows to prevent clicking.
     * @group Props
     */
    readonly preventClick = input<boolean | undefined, unknown>(undefined, { transform: booleanAttribute });
    /**
     * Class of the element.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    readonly styleClass = input<string | undefined>(undefined);
    /**
     * Icon to display in the close button.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    readonly closeIcon = input<string | undefined>(undefined);
    /**
     * Establishes a string value that labels the close button.
     * @group Props
     */
    readonly closeAriaLabel = input<string | undefined>(undefined);
    /**
     * Callback to invoke when inplace is opened.
     * @param {Event} event - Browser event.
     * @group Emits
     */
    readonly onActivate = output<Event | undefined>();
    /**
     * Callback to invoke when inplace is closed.
     * @param {Event} event - Browser event.
     * @group Emits
     */
    readonly onDeactivate = output<Event | undefined>();

    hover!: boolean;
    /**
     * Custom display template.
     * @group Templates
     */
    readonly displayTemplate = contentChild<TemplateRef<void>>('display', { descendants: false });
    /**
     * Custom content template.
     * @group Templates
     */
    readonly contentTemplate = contentChild<TemplateRef<InplaceContentTemplateContext>>('content', { descendants: false });
    /**
     * Custom close icon template.
     * @group Templates
     */
    readonly closeIconTemplate = contentChild<TemplateRef<void>>('closeicon', { descendants: false });

    _componentStyle = inject(InplaceStyle);

    onActivateClick(event: MouseEvent) {
        if (!this.preventClick()) this.activate(event);
    }

    onDeactivateClick(event: MouseEvent) {
        if (!this.preventClick()) this.deactivate(event);
    }
    /**
     * Activates the content.
     * @param {Event} event - Browser event.
     * @group Method
     */
    activate(event?: Event) {
        if (!this.disabled()) {
            this._active.set(true);
            this.onActivate.emit(event);
            this.cd.markForCheck();
        }
    }
    /**
     * Deactivates the content.
     * @param {Event} event - Browser event.
     * @group Method
     */
    deactivate(event?: Event) {
        if (!this.disabled()) {
            this._active.set(false);
            this.hover = false;
            this.onDeactivate.emit(event);
            this.cd.markForCheck();
        }
    }

    onKeydown(event: KeyboardEvent) {
        if (event.code === 'Enter') {
            this.activate(event);
            event.preventDefault();
        }
    }

    readonly templates = contentChildren(PrimeTemplate);

    _displayTemplate: TemplateRef<void> | undefined;

    _closeIconTemplate: TemplateRef<void> | undefined;

    _contentTemplate: TemplateRef<InplaceContentTemplateContext> | undefined;

    onAfterContentInit() {
        this.templates()?.forEach((item) => {
            switch (item.getType()) {
                case 'display':
                    this._displayTemplate = item.template;
                    break;

                case 'closeicon':
                    this._closeIconTemplate = item.template;
                    break;

                case 'content':
                    this._contentTemplate = item.template;
                    break;
            }
        });
    }
}

@NgModule({
    imports: [Inplace, InplaceContent, InplaceDisplay, SharedModule],
    exports: [Inplace, InplaceContent, InplaceDisplay, SharedModule]
})
export class InplaceModule {}

import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    inject,
    InjectionToken,
    input,
    NgModule,
    output,
    numberAttribute,
    signal,
    TemplateRef,
    ViewEncapsulation,
    viewChild,
    contentChild,
    contentChildren
} from '@angular/core';
import { MotionOptions } from '@openng/optimus-ui-motion';
import { uuid } from '@openng/optimus-ui-utils';
import { MenuItem, PrimeTemplate, SharedModule, TooltipOptions } from '@openng/optimus-ui/api';
import { AutoFocus } from '@openng/optimus-ui/autofocus';
import { BaseComponent, PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { Bind } from '@openng/optimus-ui/bind';
import { ButtonDirective } from '@openng/optimus-ui/button';
import { ChevronDownIcon } from '@openng/optimus-ui/icons';
import { Ripple } from '@openng/optimus-ui/ripple';
import { TieredMenu } from '@openng/optimus-ui/tieredmenu';
import { TooltipModule } from '@openng/optimus-ui/tooltip';
import type { ButtonSeverity } from '@openng/optimus-ui/types/button';
import { ButtonProps, MenuButtonProps, SplitButtonPassThrough } from '@openng/optimus-ui/types/splitbutton';
import { SplitButtonStyle } from './style/splitbuttonstyle';

const SPLITBUTTON_INSTANCE = new InjectionToken<SplitButton>('SPLITBUTTON_INSTANCE');

type SplitButtonIconPosition = 'left' | 'right';
/**
 * SplitButton groups a set of commands in an overlay with a default command.
 * @group Components
 */
@Component({
    selector: 'p-splitbutton, p-splitButton, p-split-button',
    standalone: true,
    imports: [NgTemplateOutlet, ButtonDirective, TieredMenu, AutoFocus, ChevronDownIcon, Ripple, TooltipModule, SharedModule],
    template: `
        @if (contentTemplate() || _contentTemplate) {
            <button
                [class]="cx('pcButton')"
                type="button"
                pButton
                pRipple
                [severity]="severity()"
                [text]="text()"
                [outlined]="outlined()"
                [size]="size()"
                [icon]="icon()"
                [iconPos]="iconPos()"
                (click)="onDefaultButtonClick($event)"
                [disabled]="disabled()"
                [attr.tabindex]="tabindex()"
                [attr.aria-label]="buttonProps()?.['ariaLabel'] || label()"
                [pAutoFocus]="autofocus()"
                [pTooltip]="tooltip()"
                [pTooltipUnstyled]="unstyled()"
                [tooltipOptions]="tooltipOptions()"
                [pt]="ptm('pcButton')"
                [unstyled]="unstyled()"
            >
                <ng-container *ngTemplateOutlet="contentTemplate() || _contentTemplate"></ng-container>
            </button>
        } @else {
            <button
                #defaultbtn
                [class]="cx('pcButton')"
                type="button"
                pButton
                pRipple
                [severity]="severity()"
                [text]="text()"
                [outlined]="outlined()"
                [size]="size()"
                [icon]="icon()"
                [iconPos]="iconPos()"
                [label]="label()"
                (click)="onDefaultButtonClick($event)"
                [disabled]="_buttonDisabled()"
                [attr.tabindex]="tabindex()"
                [attr.aria-label]="buttonProps()?.['ariaLabel']"
                [pAutoFocus]="autofocus()"
                [pTooltip]="tooltip()"
                [pTooltipUnstyled]="unstyled()"
                [tooltipOptions]="tooltipOptions()"
                [pt]="ptm('pcButton')"
                [unstyled]="unstyled()"
            ></button>
        }
        <button
            type="button"
            pButton
            pRipple
            [size]="size()"
            [severity]="severity()"
            [text]="text()"
            [outlined]="outlined()"
            [class]="cx('pcDropdown')"
            (click)="onDropdownButtonClick($event)"
            (keydown)="onDropdownButtonKeydown($event)"
            [disabled]="_menuButtonDisabled()"
            [attr.aria-label]="menuButtonProps()?.['ariaLabel'] || expandAriaLabel()"
            [attr.aria-haspopup]="menuButtonProps()?.['ariaHasPopup'] || true"
            [attr.aria-expanded]="menuButtonProps()?.['ariaExpanded'] || isExpanded()"
            [attr.aria-controls]="menuButtonProps()?.['ariaControls'] || ariaId"
            [pt]="ptm('pcDropdown')"
            [unstyled]="unstyled()"
        >
            @if (dropdownIcon()) {
                <span [class]="dropdownIcon()"></span>
            }
            @if (!dropdownIcon()) {
                @if (!dropdownIconTemplate() && !_dropdownIconTemplate) {
                    <svg data-p-icon="chevron-down" />
                }
                <ng-template *ngTemplateOutlet="dropdownIconTemplate() || _dropdownIconTemplate"></ng-template>
            }
        </button>
        <p-tieredmenu
            [id]="ariaId"
            #menu
            [popup]="true"
            [model]="model()"
            [style]="menuStyle()"
            [styleClass]="menuStyleClass()"
            [appendTo]="$appendTo()"
            [motionOptions]="computedMotionOptions()"
            (onHide)="onHide()"
            (onShow)="onShow()"
            [pt]="ptm('pcMenu')"
            [unstyled]="unstyled()"
        ></p-tieredmenu>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [SplitButtonStyle, { provide: SPLITBUTTON_INSTANCE, useExisting: SplitButton }, { provide: PARENT_INSTANCE, useExisting: SplitButton }],
    encapsulation: ViewEncapsulation.None,
    host: {
        '[class]': "cn(cx('root'), styleClass())",
        '[attr.data-p-severity]': 'severity()'
    },
    hostDirectives: [Bind]
})
export class SplitButton extends BaseComponent<SplitButtonPassThrough> {
    componentName = 'SplitButton';
    $pcSplitButton: SplitButton | undefined = inject(SPLITBUTTON_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }
    /**
     * MenuModel instance to define the overlay items.
     * @group Props
     */
    readonly model = input<MenuItem[] | undefined>(undefined);
    /**
     * Defines the style of the button.
     * @group Props
     */
    readonly severity = input<ButtonSeverity>(undefined);
    /**
     * Add a shadow to indicate elevation.
     * @group Props
     */
    readonly raised = input<boolean, unknown>(false, { transform: booleanAttribute });
    /**
     * Add a circular border radius to the button.
     * @group Props
     */
    readonly rounded = input<boolean, unknown>(false, { transform: booleanAttribute });
    /**
     * Add a textual class to the button without a background initially.
     * @group Props
     */
    readonly text = input<boolean, unknown>(false, { transform: booleanAttribute });
    /**
     * Add a border class without a background initially.
     * @group Props
     */
    readonly outlined = input<boolean, unknown>(false, { transform: booleanAttribute });
    /**
     * Defines the size of the button.
     * @group Props
     */
    readonly size = input<'small' | 'large' | undefined | null>(null);
    /**
     * Add a plain textual class to the button without a background initially.
     * @group Props
     */
    readonly plain = input<boolean, unknown>(false, { transform: booleanAttribute });
    /**
     * Name of the icon.
     * @group Props
     */
    readonly icon = input<string | undefined>(undefined);
    /**
     * Position of the icon.
     * @group Props
     */
    readonly iconPos = input<SplitButtonIconPosition>('left');
    /**
     * Text of the button.
     * @group Props
     */
    readonly label = input<string | undefined>(undefined);
    /**
     * Tooltip for the main button.
     * @group Props
     */
    readonly tooltip = input<string | undefined>(undefined);
    /**
     * Tooltip options for the main button.
     * @group Props
     */
    readonly tooltipOptions = input<TooltipOptions | undefined>(undefined);
    /**
     * Class of the element.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    readonly styleClass = input<string | undefined>(undefined);
    /**
     * Inline style of the overlay menu.
     * @group Props
     */
    readonly menuStyle = input<
        | {
              [klass: string]: any;
          }
        | null
        | undefined
    >(undefined);
    /**
     * Style class of the overlay menu.
     * @group Props
     */
    readonly menuStyleClass = input<string | undefined>(undefined);
    /**
     * Name of the dropdown icon.
     * @group Props
     */
    readonly dropdownIcon = input<string | undefined>(undefined);
    /**
     * Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name).
     * @defaultValue 'body'
     * @group Props
     */
    readonly appendTo = input<HTMLElement | ElementRef | TemplateRef<any> | 'self' | 'body' | null | undefined | any>('body');
    /**
     * Indicates the direction of the element.
     * @group Props
     */
    readonly dir = input<string | undefined>(undefined);
    /**
     * Defines a string that labels the expand button for accessibility.
     * @group Props
     */
    readonly expandAriaLabel = input<string | undefined>(undefined);
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
     * Button Props
     */
    readonly buttonProps = input<ButtonProps | undefined>(undefined);
    /**
     * Menu Button Props
     */
    readonly menuButtonProps = input<MenuButtonProps | undefined>(undefined);
    /**
     * When present, it specifies that the component should automatically get focus on load.
     * @group Props
     */
    readonly autofocus = input<boolean | undefined, unknown>(undefined, { transform: booleanAttribute });
    /**
     * When present, it specifies that the element should be disabled.
     * @group Props
     */
    readonly disabled = input<boolean | undefined, unknown>(undefined, { transform: booleanAttribute });
    /**
     * Index of the element in tabbing order.
     * @group Props
     */
    readonly tabindex = input<number | undefined, unknown>(undefined, { transform: numberAttribute });
    /**
     * When present, it specifies that the menu button element should be disabled.
     * @group Props
     */
    readonly menuButtonDisabled = input<boolean, unknown>(false, { transform: booleanAttribute });
    /**
     * When present, it specifies that the button element should be disabled.
     * @group Props
     */
    readonly buttonDisabled = input<boolean, unknown>(false, { transform: booleanAttribute });
    /**
     * Callback to invoke when default command button is clicked.
     * @param {MouseEvent} event - Mouse event.
     * @group Emits
     */
    onClick = output<MouseEvent>();
    /**
     * Callback to invoke when overlay menu is hidden.
     * @group Emits
     */
    readonly onMenuHide = output<any>();
    /**
     * Callback to invoke when overlay menu is shown.
     * @group Emits
     */
    readonly onMenuShow = output<any>();
    /**
     * Callback to invoke when dropdown button is clicked.
     * @param {MouseEvent} event - Mouse event.
     * @group Emits
     */
    readonly onDropdownClick = output<MouseEvent | undefined>();

    readonly buttonViewChild = viewChild<ElementRef>('defaultbtn');

    readonly menu = viewChild<TieredMenu>('menu');
    /**
     * Custom content template.
     * @group Templates
     */
    readonly contentTemplate = contentChild<TemplateRef<void>>('content', { descendants: false });
    /**
     * Custom dropdown icon template.
     * @group Templates
     **/
    readonly dropdownIconTemplate = contentChild<TemplateRef<void>>('dropdownicon', { descendants: false });

    readonly templates = contentChildren(PrimeTemplate);

    ariaId: string | undefined;

    readonly isExpanded = signal<boolean>(false);

    _componentStyle = inject(SplitButtonStyle);

    _contentTemplate: TemplateRef<void> | undefined;

    _dropdownIconTemplate: TemplateRef<void> | undefined;

    /** The whole component disabled also disables both buttons. */
    readonly _buttonDisabled = computed(() => !!this.disabled() || this.buttonDisabled());

    readonly _menuButtonDisabled = computed(() => !!this.disabled() || this.menuButtonDisabled());

    readonly $appendTo = computed(() => this.appendTo() || this.config.overlayAppendTo());

    onInit() {
        this.ariaId = uuid('pn_id_');
    }

    onAfterContentInit() {
        this.templates()?.forEach((item) => {
            switch (item.getType()) {
                case 'content':
                    this._contentTemplate = item.template;
                    break;

                case 'dropdownicon':
                    this._dropdownIconTemplate = item.template;
                    break;

                default:
                    this._contentTemplate = item.template;
                    break;
            }
        });
    }

    onDefaultButtonClick(event: MouseEvent) {
        this.onClick?.emit(event);
        this.menu()?.hide();
    }

    onDropdownButtonClick(event?: MouseEvent) {
        this.onDropdownClick.emit(event);
        this.menu()?.toggle({ currentTarget: this.el?.nativeElement, relativeAlign: this.$appendTo() == 'self' });
    }

    onDropdownButtonKeydown(event: KeyboardEvent) {
        if (event.code === 'ArrowDown' || event.code === 'ArrowUp') {
            this.onDropdownButtonClick();
            event.preventDefault();
        }
    }

    onHide() {
        this.isExpanded.set(false);
        this.onMenuHide.emit(undefined);
    }

    onShow() {
        this.isExpanded.set(true);
        this.onMenuShow.emit(undefined);
    }
}

@NgModule({
    imports: [SplitButton, SharedModule],
    exports: [SplitButton, SharedModule]
})
export class SplitButtonModule {}

import { booleanAttribute, computed, Directive, effect, Injector, HostListener, inject, InjectionToken, input, Input, NgModule } from '@angular/core';
import { NgControl } from '@angular/forms';
import { FORM_FIELD } from '@angular/forms/signals';
import { PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { BaseModelHolder } from '@openng/optimus-ui/basemodelholder';
import { Bind } from '@openng/optimus-ui/bind';
import { Fluid } from '@openng/optimus-ui/fluid';
import { InputTextPassThrough } from '@openng/optimus-ui/types/inputtext';
import { InputTextStyle } from './style/inputtextstyle';

const INPUTTEXT_INSTANCE = new InjectionToken<InputText>('INPUTTEXT_INSTANCE');

/**
 * InputText directive is an extension to standard input element with theming.
 * @group Components
 */
@Directive({
    selector: '[pInputText]',
    standalone: true,
    host: {
        '[class]': "cx('root')",
        '[attr.data-p]': 'dataP'
    },
    providers: [InputTextStyle, { provide: INPUTTEXT_INSTANCE, useExisting: InputText }, { provide: PARENT_INSTANCE, useExisting: InputText }],
    hostDirectives: [Bind]
})
export class InputText extends BaseModelHolder<InputTextPassThrough> {
    componentName = 'InputText';

    @Input() hostName: any = '';

    /**
     * Used to pass attributes to DOM elements inside the InputText component.
     * @defaultValue undefined
     * @deprecated use pInputTextPT instead.
     * @group Props
     */
    ptInputText = input<InputTextPassThrough>();
    /**
     * Used to pass attributes to DOM elements inside the InputText component.
     * @defaultValue undefined
     * @group Props
     */
    pInputTextPT = input<InputTextPassThrough>();
    /**
     * Indicates whether the component should be rendered without styles.
     * @defaultValue undefined
     * @group Props
     */
    pInputTextUnstyled = input<boolean | undefined>();

    bindDirectiveInstance = inject(Bind, { self: true });

    $pcInputText: InputText | undefined = inject(INPUTTEXT_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    ngControl = inject(NgControl, { optional: true, self: true });

    pcFluid: Fluid | null = inject(Fluid, { optional: true, host: true, skipSelf: true });

    /**
     * Defines the size of the component.
     * @group Props
     */
    @Input('pSize') pSize: 'large' | 'small' | undefined;
    /**
     * Specifies the input variant of the component.
     * @defaultValue undefined
     * @group Props
     */
    variant = input<'filled' | 'outlined' | undefined>();
    /**
     * Spans 100% width of the container when enabled.
     * @defaultValue undefined
     * @group Props
     */
    fluid = input(undefined, { transform: booleanAttribute });
    /**
     * When present, it specifies that the component should have invalid state style.
     * @defaultValue false
     * @group Props
     */
    invalid = input(undefined, { transform: booleanAttribute });
    /**
     * Whether the user has interacted with the field. A signal form (`[formField]`) sets it, so the invalid state shows only after the field is touched.
     * @defaultValue undefined
     * @group Props
     */
    touched = input(undefined, { transform: booleanAttribute });

    /** The invalid state to render: with `[formField]`, the field state counts only once the field is touched. */
    $invalid = computed(() => (this.injector.get(FORM_FIELD, null, { optional: true, self: true }) ? !!this.invalid() && !!this.touched() : !!this.invalid()));

    $variant = computed(() => this.variant() || this.config.inputStyle() || this.config.inputVariant());

    _componentStyle = inject(InputTextStyle);

    constructor() {
        super();
        effect(() => {
            const pt = this.ptInputText() || this.pInputTextPT();
            pt && this.directivePT.set(pt);
        });

        effect(() => {
            this.pInputTextUnstyled() && this.directiveUnstyled.set(this.pInputTextUnstyled());
        });
    }

    onAfterViewInit() {
        this.writeModelValue(this.ngControl?.value ?? this.el.nativeElement.value);
        this.cd.detectChanges();
    }

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptm('root'));
    }

    onDoCheck() {
        this.writeModelValue(this.ngControl?.value ?? this.el.nativeElement.value);
    }

    @HostListener('input')
    onInput() {
        this.writeModelValue(this.ngControl?.value ?? this.el.nativeElement.value);
    }

    get hasFluid() {
        return this.fluid() ?? !!this.pcFluid;
    }

    get dataP() {
        return this.cn({
            invalid: this.$invalid(),
            fluid: this.hasFluid,
            filled: this.$variant() === 'filled',
            [this.pSize as string]: this.pSize
        });
    }
}

@NgModule({
    imports: [InputText],
    exports: [InputText]
})
export class InputTextModule {}

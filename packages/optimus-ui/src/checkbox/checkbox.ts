import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    forwardRef,
    inject,
    InjectionToken,
    input,
    linkedSignal,
    NgModule,
    numberAttribute,
    output,
    TemplateRef,
    ViewEncapsulation,
    viewChild,
    contentChild,
    contentChildren
} from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { contains, equals } from '@openng/optimus-ui-utils';
import { PrimeTemplate, SharedModule } from '@openng/optimus-ui/api';
import { PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { BaseEditableHolder } from '@openng/optimus-ui/baseeditableholder';
import { Bind, BindModule } from '@openng/optimus-ui/bind';
import { CheckIcon } from '@openng/optimus-ui/icons/check';
import { MinusIcon } from '@openng/optimus-ui/icons/minus';
import { Nullable } from '@openng/optimus-ui/ts-helpers';
import { CheckboxChangeEvent, CheckboxIconTemplateContext, CheckboxPassThrough } from '@openng/optimus-ui/types/checkbox';
import { CheckboxStyle } from './style/checkboxstyle';

const CHECKBOX_INSTANCE = new InjectionToken<Checkbox>('CHECKBOX_INSTANCE');

export const CHECKBOX_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Checkbox),
    multi: true
};
/**
 * Checkbox is an extension to standard checkbox element with theming.
 * @group Components
 */
@Component({
    selector: 'p-checkbox, p-checkBox, p-check-box',
    standalone: true,
    imports: [NgTemplateOutlet, SharedModule, CheckIcon, MinusIcon, BindModule],
    template: `
        <input
            #input
            [attr.id]="inputId()"
            type="checkbox"
            [attr.value]="value()"
            [attr.name]="name()"
            [checked]="checked"
            [attr.tabindex]="tabindex()"
            [attr.required]="required() ? '' : undefined"
            [attr.readonly]="readonly() ? '' : undefined"
            [attr.disabled]="$disabled() ? '' : undefined"
            [attr.aria-labelledby]="ariaLabelledBy()"
            [attr.aria-label]="ariaLabel()"
            [style]="inputStyle()"
            [class]="cn(cx('input'), inputClass())"
            [pBind]="ptm('input')"
            (focus)="onInputFocus($event)"
            (blur)="onInputBlur($event)"
            (change)="handleChange($event)"
        />
        <div [class]="cx('box')" [pBind]="ptm('box')" [attr.data-p]="dataP">
            @if (!checkboxIconTemplate() && !_checkboxIconTemplate) {
                @if (checked) {
                    @if (checkboxIcon()) {
                        <span [class]="cn(cx('icon'), checkboxIcon())" [pBind]="ptm('icon')" [attr.data-p]="dataP"></span>
                    }
                    @if (!checkboxIcon()) {
                        <svg data-p-icon="check" [class]="cx('icon')" [pBind]="ptm('icon')" [attr.data-p]="dataP" />
                    }
                }
                @if (_indeterminate()) {
                    <svg data-p-icon="minus" [class]="cx('icon')" [pBind]="ptm('icon')" [attr.data-p]="dataP" />
                }
            }
            <ng-template *ngTemplateOutlet="checkboxIconTemplate() || _checkboxIconTemplate; context: { checked: checked, class: cx('icon'), dataP: dataP }"></ng-template>
        </div>
    `,
    providers: [CHECKBOX_VALUE_ACCESSOR, CheckboxStyle, { provide: CHECKBOX_INSTANCE, useExisting: Checkbox }, { provide: PARENT_INSTANCE, useExisting: Checkbox }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[class]': "cn(cx('root'), styleClass())",
        '[attr.data-p-highlight]': 'checked',
        '[attr.data-p-checked]': 'checked',
        '[attr.data-p-disabled]': '$disabled()',
        '[attr.data-p]': 'dataP'
    },
    hostDirectives: [Bind]
})
export class Checkbox extends BaseEditableHolder<CheckboxPassThrough> {
    componentName = 'Checkbox';

    readonly hostName = input<any>('');
    /**
     * Value of the checkbox.
     * @group Props
     */
    readonly value = input<any>(undefined);
    /**
     * Allows to select a boolean value instead of multiple values.
     * @group Props
     */
    readonly binary = input<boolean | undefined, unknown>(undefined, { transform: booleanAttribute });
    /**
     * Establishes relationships between the component and label(s) where its value should be one or more element IDs.
     * @group Props
     */
    readonly ariaLabelledBy = input<string | undefined>(undefined);
    /**
     * Used to define a string that labels the input element.
     * @group Props
     */
    readonly ariaLabel = input<string | undefined>(undefined);
    /**
     * Index of the element in tabbing order.
     * @group Props
     */
    readonly tabindex = input<number | undefined, unknown>(undefined, { transform: numberAttribute });
    /**
     * Identifier of the focus input to match a label defined for the component.
     * @group Props
     */
    readonly inputId = input<string | undefined>(undefined);
    /**
     * Inline style of the input element.
     * @group Props
     */
    readonly inputStyle = input<
        | {
              [klass: string]: any;
          }
        | null
        | undefined
    >(undefined);
    /**
     * Style class of the component.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    readonly styleClass = input<string | undefined>(undefined);
    /**
     * Style class of the input element.
     * @group Props
     */
    readonly inputClass = input<string | undefined>(undefined);
    /**
     * When present, it specifies input state as indeterminate.
     * @group Props
     */
    readonly indeterminate = input<boolean, unknown>(false, { transform: booleanAttribute });
    /**
     * Form control value.
     * @group Props
     */
    readonly formControl = input<FormControl | undefined>(undefined);
    /**
     * Icon class of the checkbox icon.
     * @group Props
     */
    readonly checkboxIcon = input<string | undefined>(undefined);
    /**
     * When present, it specifies that the component cannot be edited.
     * @group Props
     */
    readonly readonly = input<boolean | undefined, unknown>(undefined, { transform: booleanAttribute });
    /**
     * When present, it specifies that the component should automatically get focus on load.
     * @group Props
     */
    readonly autofocus = input<boolean | undefined, unknown>(undefined, { transform: booleanAttribute });
    /**
     * Value in checked state.
     * @group Props
     */
    readonly trueValue = input<any>(true);
    /**
     * Value in unchecked state.
     * @group Props
     */
    readonly falseValue = input<any>(false);
    /**
     * Specifies the input variant of the component.
     * @defaultValue undefined
     * @group Props
     */
    variant = input<'filled' | 'outlined' | undefined>();
    /**
     * Specifies the size of the component.
     * @defaultValue undefined
     * @group Props
     */
    size = input<'large' | 'small' | undefined>();
    /**
     * Callback to invoke on value change.
     * @param {CheckboxChangeEvent} event - Custom value change event.
     * @group Emits
     */
    onChange = output<CheckboxChangeEvent>();
    /**
     * Callback to invoke when the receives focus.
     * @param {Event} event - Browser event.
     * @group Emits
     */
    onFocus = output<Event>();
    /**
     * Callback to invoke when the loses focus.
     * @param {Event} event - Browser event.
     * @group Emits
     */
    onBlur = output<Event>();

    readonly inputViewChild = viewChild<Nullable<ElementRef>>('input');

    get checked() {
        return this._indeterminate() ? false : this.binary() ? this.modelValue() === this.trueValue() : contains(this.value(), this.modelValue());
    }

    _indeterminate = linkedSignal<any>(() => this.indeterminate());
    /**
     * Custom checkbox icon template.
     * @group Templates
     */
    readonly checkboxIconTemplate = contentChild<TemplateRef<CheckboxIconTemplateContext>>('icon', { descendants: false });

    readonly templates = contentChildren(PrimeTemplate);

    _checkboxIconTemplate: TemplateRef<CheckboxIconTemplateContext> | undefined;

    focused: boolean = false;

    _componentStyle = inject(CheckboxStyle);

    bindDirectiveInstance = inject(Bind, { self: true });

    $pcCheckbox: Checkbox | undefined = inject(CHECKBOX_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    $variant = computed(() => this.variant() || this.config.inputStyle() || this.config.inputVariant());

    onAfterContentInit() {
        this.templates()?.forEach((item) => {
            switch (item.getType()) {
                case 'icon':
                    this._checkboxIconTemplate = item.template;
                    break;
                case 'checkboxicon':
                    this._checkboxIconTemplate = item.template;
                    break;
            }
        });
    }

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    updateModel(event) {
        let newModelValue;

        /*
         * When `formControlName` or `formControl` is used - `writeValue` is not called after control changes.
         * Otherwise it is causing multiple references to the actual value: there is one array reference inside the component and another one in the control value.
         * `selfControl` is the source of truth of references, it is made to avoid reference loss.
         * */
        const selfControl = this.injector.get<NgControl | null>(NgControl, null, { optional: true, self: true });

        const currentModelValue = selfControl && !this.formControl() ? selfControl.value : this.modelValue();

        if (!this.binary()) {
            if (this.checked || this._indeterminate()) newModelValue = currentModelValue.filter((val) => !equals(val, this.value()));
            else newModelValue = currentModelValue ? [...currentModelValue, this.value()] : [this.value()];

            this.onModelChange(newModelValue);
            this.writeModelValue(newModelValue);

            const formControl = this.formControl();
            if (formControl) {
                formControl.setValue(newModelValue);
            }
        } else {
            newModelValue = this._indeterminate() ? this.trueValue() : this.checked ? this.falseValue() : this.trueValue();
            this.writeModelValue(newModelValue);
            this.onModelChange(newModelValue);
        }

        if (this._indeterminate()) {
            this._indeterminate.set(false);
        }

        this.onChange.emit({ checked: newModelValue, originalEvent: event });
    }

    handleChange(event) {
        if (!this.readonly()) {
            this.updateModel(event);
        }
    }

    onInputFocus(event) {
        this.focused = true;
        this.onFocus.emit(event);
    }

    onInputBlur(event) {
        this.focused = false;
        this.onBlur.emit(event);
        this.onModelTouched();
    }

    focus() {
        this.inputViewChild()?.nativeElement.focus();
    }

    /**
     * @override
     *
     * @see {@link BaseEditableHolder.writeControlValue}
     * Writes the value to the control.
     */
    writeControlValue(value: any, setModelValue: (value: any) => void): void {
        setModelValue(value);
        this.cd.markForCheck();
    }

    get dataP() {
        return this.cn({
            invalid: this.$invalid(),
            checked: this.checked,
            disabled: this.$disabled(),
            filled: this.$variant() === 'filled',
            [this.size() as string]: this.size()
        });
    }
}

@NgModule({
    imports: [Checkbox, SharedModule],
    exports: [Checkbox, SharedModule]
})
export class CheckboxModule {}

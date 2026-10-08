import { booleanAttribute, computed, Directive, input, signal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { FORM_FIELD } from '@angular/forms/signals';
import { BaseModelHolder } from '@openng/optimus-ui/basemodelholder';

@Directive({ standalone: true })
export class BaseEditableHolder<PT = any> extends BaseModelHolder<PT> implements ControlValueAccessor {
    /**
     * The `[formField]` directive of a signal form, when the component is bound to one. It is read on first use, not at construction,
     * because the `[formField]` directive injects this component as its value accessor.
     */
    protected get formField() {
        return this.injector.get(FORM_FIELD, null, { optional: true, self: true });
    }

    /**
     * There must be a value (if set).
     * @defaultValue false
     * @group Props
     */
    required = input(undefined, { transform: booleanAttribute });
    /**
     * When present, it specifies that the component should have invalid state style.
     * @defaultValue false
     * @group Props
     */
    invalid = input(undefined, { transform: booleanAttribute });
    /**
     * When present, it specifies that the component should have disabled state style.
     * @defaultValue false
     * @group Props
     */
    disabled = input(undefined, { transform: booleanAttribute });
    /**
     * When present, it specifies that the name of the input.
     * @defaultValue undefined
     * @group Props
     */
    name = input<string | undefined>();
    /**
     * Whether the user has interacted with the component. A signal form (`[formField]`) sets it, so the invalid state shows only after the field is touched.
     * @defaultValue undefined
     * @group Props
     */
    touched = input(undefined, { transform: booleanAttribute });

    _disabled = signal<boolean>(false);

    $disabled = computed(() => this.disabled() || this._disabled());

    /**
     * The invalid state to render. The `invalid` input is the field state when the component is bound with `[formField]`, which is true from the start,
     * so the error waits for `touched`, as `ng-invalid.ng-touched` does with `formControl`. Without `[formField]`, `invalid` is used as is.
     */
    $invalid = computed(() => (this.formField ? !!this.invalid() && !!this.touched() : !!this.invalid()));

    onModelChange: Function = () => {};

    onModelTouched: Function = () => {};

    writeDisabledState(value: boolean) {
        this._disabled.set(value);
    }

    writeControlValue(value: any, setModelValue?: (value: any) => void) {
        // NOOP - this method should be overridden in the derived classes
    }

    /**** Angular ControlValueAccessors ****/
    writeValue(value: any) {
        this.writeControlValue(value, this.writeModelValue.bind(this));
    }

    registerOnChange(fn: Function) {
        this.onModelChange = fn;
    }

    registerOnTouched(fn: Function) {
        this.onModelTouched = fn;
    }

    setDisabledState(val: boolean) {
        this.writeDisabledState(val);
        this.cd.markForCheck();
    }
}

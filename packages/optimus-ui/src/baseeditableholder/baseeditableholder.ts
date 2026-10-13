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
    readonly required = input(undefined, { transform: booleanAttribute });
    /**
     * When present, it specifies that the component should have invalid state style.
     * @defaultValue false
     * @group Props
     */
    readonly invalid = input(undefined, { transform: booleanAttribute });
    /**
     * When present, it specifies that the component should have disabled state style.
     * @defaultValue false
     * @group Props
     */
    readonly disabled = input(undefined, { transform: booleanAttribute });
    /**
     * When present, it specifies that the name of the input.
     * @defaultValue undefined
     * @group Props
     */
    readonly name = input<string | undefined>();
    /**
     * Whether the user has interacted with the component. A signal form (`[formField]`) sets it, so the invalid state shows only after the field is touched.
     * @defaultValue undefined
     * @group Props
     */
    readonly touched = input(undefined, { transform: booleanAttribute });

    readonly _disabled = signal<boolean>(false);

    readonly $disabled = computed(() => this.disabled() || this._disabled());

    /** Whether the user changed the value, which is told to the form through `onModelChange`. */
    private readonly edited = signal(false);

    /**
     * The invalid state to render. The `invalid` input is the field state when the component is bound with `[formField]`, which is true from the start,
     * so the error waits for the user to interact: to change the value, which shows it while typing, or to leave the field (`touched`).
     * Without `[formField]`, `invalid` is used as is.
     */
    readonly $invalid = computed(() => (this.formField ? !!this.invalid() && (!!this.touched() || this.edited()) : !!this.invalid()));

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
        this.onModelChange = (value: any) => {
            this.edited.set(true);

            return fn(value);
        };
    }

    registerOnTouched(fn: Function) {
        this.onModelTouched = fn;
    }

    setDisabledState(val: boolean) {
        this.writeDisabledState(val);
        this.cd.markForCheck();
    }
}

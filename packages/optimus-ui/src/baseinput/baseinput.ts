import { booleanAttribute, computed, Directive, inject, input, numberAttribute } from '@angular/core';
import { BaseEditableHolder } from '@openng/optimus-ui/baseeditableholder';
import { Fluid } from '@openng/optimus-ui/fluid';

@Directive({ standalone: true })
export class BaseInput<PT = any> extends BaseEditableHolder<PT> {
    pcFluid: Fluid | null = inject(Fluid, { optional: true, host: true, skipSelf: true });

    /**
     * Spans 100% width of the container when enabled.
     * @defaultValue false
     * @group Props
     */
    readonly fluid = input(undefined, { transform: booleanAttribute });
    /**
     * Specifies the input variant of the component.
     * @defaultValue 'outlined'
     * @group Props
     */
    readonly variant = input<'filled' | 'outlined' | undefined>();
    /**
     * Specifies the size of the component.
     * @defaultValue undefined
     * @group Props
     */
    readonly size = input<'large' | 'small' | undefined>();
    /**
     * Specifies the visible width of the input element in characters.
     * @defaultValue undefined
     * @group Props
     */
    readonly inputSize = input<number | null | undefined>();
    /**
     * Specifies the value must match the pattern.
     * @defaultValue undefined
     * @group Props
     */
    readonly pattern = input<string | RegExp | readonly RegExp[] | null | undefined>();
    /**
     * The value must be greater than or equal to the value.
     * @defaultValue undefined
     * @group Props
     */
    readonly min = input<number | string | Date | null | undefined, unknown>(undefined, { transform: asLimit });
    /**
     * The value must be less than or equal to the value.
     * @defaultValue undefined
     * @group Props
     */
    readonly max = input<number | string | Date | null | undefined, unknown>(undefined, { transform: asLimit });
    /**
     * Unless the step is set to the any literal, the value must be min + an integral multiple of the step.
     * @defaultValue undefined
     * @group Props
     */
    readonly step = input<number | null | undefined>();
    /**
     * The number of characters (code points) must not be less than the value of the attribute, if non-empty.
     * @defaultValue undefined
     * @group Props
     */
    readonly minlength = input<number | null | undefined>();
    /**
     * The number of characters (code points) must not exceed the value of the attribute.
     * @defaultValue undefined
     * @group Props
     */
    readonly maxlength = input<number | null | undefined>();
    /**
     * Same as `minlength`, with the name a signal form (`[formField]`) binds.
     * @defaultValue undefined
     * @group Props
     */
    readonly minLength = input<number | null | undefined, unknown>(undefined, { transform: nullableNumber });
    /**
     * Same as `maxlength`, with the name a signal form (`[formField]`) binds.
     * @defaultValue undefined
     * @group Props
     */
    readonly maxLength = input<number | null | undefined, unknown>(undefined, { transform: nullableNumber });

    /** `min` as a number, or null when it is not numeric (a signal form binds the field type, such as a `Date`). */
    readonly $min = computed(() => toNumber(this.min()));

    /** `max` as a number, or null when it is not numeric. */
    readonly $max = computed(() => toNumber(this.max()));

    /** `pattern` as the string of the native attribute: the first regular expression of a signal form. */
    readonly $pattern = computed(() => {
        const pattern = this.pattern();
        const first = Array.isArray(pattern) ? pattern[0] : pattern;

        return first instanceof RegExp ? first.source : ((first as string | null | undefined) ?? null);
    });

    readonly $minlength = computed(() => this.minlength() ?? this.minLength() ?? null);

    readonly $maxlength = computed(() => this.maxlength() ?? this.maxLength() ?? null);

    readonly $variant = computed(() => this.variant() || this.config.inputStyle() || this.config.inputVariant());

    get hasFluid() {
        return this.fluid() ?? !!this.pcFluid;
    }
}

/** A signal form binds the limit with the type of the field value, which can be any (an object for a `p-select`). Only numbers are used as limits. */
function asLimit(value: unknown): number | string | Date | null | undefined {
    return value as number | string | Date | null | undefined;
}

function nullableNumber(value: unknown): number | null | undefined {
    return value == null ? (value as null | undefined) : numberAttribute(value);
}

function toNumber(value: number | string | Date | null | undefined): number | null {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);

        return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
}

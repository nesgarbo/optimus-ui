import { NgTemplateOutlet } from '@angular/common';
import { afterNextRender, booleanAttribute, ChangeDetectionStrategy, Component, computed, Directive, DoCheck, effect, ElementRef, inject, input, NgModule, OnDestroy, signal, TemplateRef, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { AbstractControl, NgControl } from '@angular/forms';
import { FORM_FIELD } from '@angular/forms/signals';
import { Optimus } from '@openng/optimus-ui/config';
import { MessageModule } from '@openng/optimus-ui/message';

/**
 * When the errors of the field are shown: once the user changed the field or left it (`interacted`, in real time while typing),
 * only after the user left it (`touched`), only after the user changed it (`dirty`), or always.
 * @group Types
 */
export type FieldErrorShowWhen = 'interacted' | 'touched' | 'dirty' | 'always';

/**
 * An error of a field, with the same shape for a signal form and for a classic form (`formControl`, `formControlName`, `ngModel`).
 * `kind` is the name of the rule: `required`, `email`, `min`, `max`, `minLength`, `maxLength`, `pattern`, or the key of a custom validator.
 * @group Types
 */
export interface FieldErrorItem {
    kind: string;
    /** The message of the rule, when it has one. */
    message?: string;
    /** The limit of the rule, such as the 3 of `minLength(3)`. */
    limit?: unknown;
}

/**
 * A message for an error kind: a text, or a function of the error. `{0}` in a text is replaced with the limit of the rule.
 * @group Types
 */
export type FieldErrorMessages = Record<string, string | ((error: FieldErrorItem) => string)>;

/**
 * The context of a custom template: the errors to show, each with its resolved `message`.
 * @group Types
 */
export interface FieldErrorTemplateContext {
    $implicit: (FieldErrorItem & { message: string })[];
}

/**
 * What `p-fielderror` reads from a signal form field: any `FieldTree`, whatever the type of its value, satisfies it.
 * @group Types
 */
export type FieldErrorField = () => {
    invalid(): boolean;
    touched(): boolean;
    dirty(): boolean;
    errors(): readonly { kind: string; message?: string }[];
};

/** Names of the Validators of a classic form, mapped to the names of a signal form, and the property that holds their limit. */
const CLASSIC_RULES: Record<string, [kind: string, limit?: string]> = {
    required: ['required'],
    email: ['email'],
    minlength: ['minLength', 'requiredLength'],
    maxlength: ['maxLength', 'requiredLength'],
    min: ['min', 'min'],
    max: ['max', 'max'],
    pattern: ['pattern']
};

/** Elements that wrap a control together with an icon, an addon or a label. */
const FIELD_WRAPPERS = 'p-iconfield, p-iconField, p-icon-field, p-inputgroup, p-inputGroup, p-input-group, p-floatlabel, p-floatLabel, p-float-label, p-iftalabel, p-iftaLabel, p-ifta-label';

let nextId = 0;

function formatLimit(limit: unknown): string {
    return limit instanceof Date ? limit.toLocaleDateString() : limit == null || typeof limit === 'object' ? '' : String(limit);
}

/**
 * FieldError shows the validation errors of a form field with a message, once the user has changed the field or left it.
 * It reads a signal form field (`[field]`) or a classic control (`[control]`), and the `pFieldError` directive adds it after a control.
 * @group Components
 */
@Component({
    selector: 'p-fielderror, p-fieldError, p-field-error',
    standalone: true,
    imports: [MessageModule, NgTemplateOutlet],
    template: `
        @if (template(); as custom) {
            @if (visible()) {
                <ng-container *ngTemplateOutlet="custom; context: { $implicit: resolved() }"></ng-container>
            }
        } @else {
            @for (error of resolved(); track $index) {
                <p-message [severity]="severity()" [size]="size()" [variant]="variant()">{{ error.message }}</p-message>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[attr.id]': 'id()',
        '[attr.aria-live]': '"polite"',
        '[style.display]': 'visible() ? null : "none"'
    }
})
export class FieldError {
    private readonly config = inject(Optimus);

    /**
     * The field of a signal form, such as `form.email`.
     * @defaultValue undefined
     * @group Props
     */
    field = input<FieldErrorField>();
    /**
     * A control of a classic form: a `FormControl`, or the `NgControl` of `formControl`, `formControlName` or `ngModel`.
     * @defaultValue undefined
     * @group Props
     */
    control = input<AbstractControl | NgControl | null>();
    /**
     * When the errors are shown.
     * @defaultValue 'interacted'
     * @group Props
     */
    showWhen = input<FieldErrorShowWhen>('interacted');
    /**
     * Shows every error of the field. The first one is shown by default.
     * @defaultValue false
     * @group Props
     */
    showAll = input(false, { transform: booleanAttribute });
    /**
     * Messages by error kind, which take precedence over the message of the rule and over the translation.
     * @defaultValue undefined
     * @group Props
     */
    messages = input<FieldErrorMessages>();
    /**
     * A template that replaces the message, to show the errors in any other way, such as a list or a tooltip.
     * @defaultValue undefined
     * @group Props
     */
    template = input<TemplateRef<FieldErrorTemplateContext>>();
    /**
     * Severity of the message.
     * @defaultValue 'error'
     * @group Props
     */
    severity = input<'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast'>('error');
    /**
     * Size of the message.
     * @defaultValue 'small'
     * @group Props
     */
    size = input<'small' | 'large' | undefined>('small');
    /**
     * Variant of the message.
     * @defaultValue 'simple'
     * @group Props
     */
    variant = input<'outlined' | 'text' | 'simple'>('simple');
    /**
     * Id of the element, which a control can reference with `aria-describedby`.
     * @defaultValue undefined
     * @group Props
     */
    id = input<string>(`p-fielderror-${++nextId}`);

    /** Bumped on each event of a classic control, which is not a signal. */
    private readonly classicVersion = signal(0);

    private readonly classicControl = computed(() => {
        const control = this.control();

        return (control instanceof NgControl ? control.control : control) ?? null;
    });

    private readonly shown = computed<FieldErrorItem[]>(() => {
        const when = this.showWhen();
        const isShown = (invalid: boolean, touched: boolean, dirty: boolean) => invalid && (when === 'always' || (when === 'touched' ? touched : when === 'dirty' ? dirty : touched || dirty));
        const field = this.field();
        let errors: FieldErrorItem[] = [];

        if (field) {
            const state = field();

            if (isShown(state.invalid(), state.touched(), state.dirty())) {
                errors = state.errors().map((error) => ({ kind: error.kind, message: error.message, limit: (error as unknown as Record<string, unknown>)[error.kind] }));
            }
        } else {
            const control = this.classicControl();

            this.classicVersion();

            if (control && isShown(control.invalid, control.touched, control.dirty)) {
                errors = Object.entries(control.errors ?? {}).map(([key, value]) => {
                    const [kind, limit] = CLASSIC_RULES[key] ?? [key];

                    return { kind, message: typeof value === 'string' ? value : undefined, limit: limit && value ? (value as Record<string, unknown>)[limit] : undefined };
                });
            }
        }

        return this.showAll() ? errors : errors.slice(0, 1);
    });

    /** The errors to show, each with its message resolved. */
    protected readonly resolved = computed(() => this.shown().map((error) => ({ ...error, message: this.text(error) })));

    /** Whether there are errors to show now. */
    readonly visible = computed(() => this.shown().length > 0);

    constructor() {
        effect((onCleanup) => {
            const control = this.classicControl();

            if (!control) return;

            const subscription = control.events.subscribe(() => this.classicVersion.update((version) => version + 1));

            onCleanup(() => subscription.unsubscribe());
        });
    }

    private text(error: FieldErrorItem): string {
        const custom = this.messages()?.[error.kind];
        const translation = this.config.translation.validation as Record<string, string> | undefined;
        const message = typeof custom === 'function' ? custom(error) : (custom ?? error.message ?? translation?.[error.kind] ?? translation?.['invalid'] ?? '');

        return message.replace(/\{0\}/g, formatLimit(error.limit));
    }
}

/**
 * The directive adds a `p-fielderror` after a control bound with `[formField]`, `formControl`, `formControlName` or `ngModel`, so the control shows
 * its errors with no markup. It also sets `aria-describedby` on a native input while the errors are shown.
 * @group Components
 */
@Directive({
    selector: '[pFieldError]',
    standalone: true,
    host: {
        '[attr.aria-describedby]': 'describedBy()'
    }
})
export class FieldErrorDirective implements DoCheck, OnDestroy {
    private readonly formField = inject(FORM_FIELD, { self: true, optional: true });
    private readonly ngControl = inject(NgControl, { self: true, optional: true });
    private readonly container = inject(ViewContainerRef);
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    private readonly native = this.host.matches('input, textarea, select');
    private lastControl: AbstractControl | null | undefined;
    private readonly errorId = `p-fielderror-${++nextId}`;

    /**
     * When the errors are shown. An empty value means `interacted`.
     * @defaultValue 'interacted'
     * @group Props
     */
    pFieldError = input<FieldErrorShowWhen | ''>('');
    /**
     * Messages by error kind, which take precedence over the message of the rule and over the translation.
     * @defaultValue undefined
     * @group Props
     */
    pFieldErrorMessages = input<FieldErrorMessages>();
    /**
     * Shows every error of the field. The first one is shown by default.
     * @defaultValue false
     * @group Props
     */
    pFieldErrorAll = input(false, { transform: booleanAttribute });
    /**
     * A template that replaces the message, to show the errors in any other way.
     * @defaultValue undefined
     * @group Props
     */
    pFieldErrorTemplate = input<TemplateRef<FieldErrorTemplateContext>>();

    private readonly ref = (() => {
        const ref = this.container.createComponent(FieldError);

        ref.setInput('id', this.errorId);

        return ref;
    })();

    protected readonly describedBy = computed(() => (this.native && this.ref.instance.visible() ? this.errorId : null));

    constructor() {
        effect(() => {
            if (this.formField) this.ref.setInput('field', this.formField.field());

            this.ref.setInput('showWhen', this.pFieldError() || 'interacted');
            this.ref.setInput('messages', this.pFieldErrorMessages());
            this.ref.setInput('showAll', this.pFieldErrorAll());
            this.ref.setInput('template', this.pFieldErrorTemplate());
        });

        afterNextRender(() => {
            // A control inside one of these wrappers shares its box with an icon or a label, so the message goes after the wrapper.
            const wrapper = this.host.closest(FIELD_WRAPPERS);

            if (wrapper) wrapper.after(this.ref.location.nativeElement);
        });
    }

    /** A classic control can be replaced at any time (`[formControl]="other"`), and it is not a signal. */
    ngDoCheck(): void {
        if (this.formField) return;

        const control = this.ngControl?.control ?? null;

        if (control !== this.lastControl) {
            this.lastControl = control;
            this.ref.setInput('control', control);
        }
    }

    ngOnDestroy(): void {
        this.ref.destroy();
    }
}

@NgModule({
    imports: [FieldError, FieldErrorDirective],
    exports: [FieldError, FieldErrorDirective]
})
export class FieldErrorModule {}

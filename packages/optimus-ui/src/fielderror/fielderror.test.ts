import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { email, form, FormField, maxLength, minLength, required, validate } from '@angular/forms/signals';
import { provideOptimus } from '@openng/optimus-ui/config';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { SelectModule } from '@openng/optimus-ui/select';
import { beforeEach, describe, expect, it } from 'vitest';
import { FieldErrorModule } from './fielderror';

@Component({
    standalone: true,
    imports: [FormField, InputTextModule, SelectModule, FieldErrorModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <input id="plain" pInputText [formField]="f.plain" />
        <p-fielderror id="explicit" [field]="f.plain" />

        <input id="email" pInputText [formField]="f.email" pFieldError />
        <input id="short" pInputText [formField]="f.short" pFieldError [pFieldErrorAll]="true" />
        <input id="always" pInputText [formField]="f.always" pFieldError="always" />
        <input id="custom" pInputText [formField]="f.custom" pFieldError [pFieldErrorMessages]="{ required: 'Fill me in', minLength: lengthMessage }" />
        <p-select id="select" [options]="['a', 'b']" [formField]="f.select" pFieldError />
        @if (toggled()) {
            <div id="toggledBox"><input pInputText [formField]="f.plain" pFieldError /></div>
        }
    `
})
class Host {
    readonly toggled = signal(true);
    readonly lengthMessage = (error: { kind: string }) => `custom ${error.kind}`;
    readonly model = signal({ plain: '', email: '', short: '', always: '', custom: '', select: null as string | null });
    readonly f = form(this.model, (p) => {
        required(p.plain, { message: 'Plain is required' });
        required(p.email);
        email(p.email);
        required(p.short);
        minLength(p.short, 3);
        maxLength(p.short, 5);
        required(p.always);
        required(p.custom);
        minLength(p.custom, 4);
        validate(p.select, ({ value }) => (value() ? null : { kind: 'required' }));
    });
}

describe('FieldError', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    const el = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;
    const next = (id: string) => el(id).nextElementSibling as HTMLElement | null;
    const messages = (target: Element | null) => Array.from(target?.querySelectorAll('p-message') ?? []).map((m) => m.textContent?.trim());
    const settle = async () => {
        fixture.detectChanges();
        await fixture.whenStable();
    };
    const configure = async (...providers: unknown[]) => {
        TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(), ...(providers as never[])] });
        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        await settle();
    };

    describe('component', () => {
        beforeEach(() => configure());

        it('shows nothing until the field is touched', async () => {
            expect(host.f.plain().invalid()).toBe(true);
            expect(messages(el('explicit'))).toEqual([]);
        });

        it('shows the message of the rule once the field is touched', async () => {
            host.f.plain().markAsTouched();
            await settle();
            expect(messages(el('explicit'))).toEqual(['Plain is required']);
        });

        it('hides the message when the field becomes valid', async () => {
            host.f.plain().markAsTouched();
            host.f.plain().value.set('ok');
            await settle();
            expect(messages(el('explicit'))).toEqual([]);
        });
    });

    describe('directive', () => {
        beforeEach(() => configure());

        it('adds the message element right after the control', async () => {
            expect(next('email')?.tagName.toLowerCase()).toBe('p-fielderror');
            expect(next('select')?.tagName.toLowerCase()).toBe('p-fielderror');
        });

        it('shows the translated default message for a rule without message, once touched', async () => {
            expect(messages(next('email'))).toEqual([]);
            host.f.email().markAsTouched();
            await settle();
            expect(messages(next('email'))).toEqual(['This field is required']);

            host.f.email().value.set('nope');
            await settle();
            expect(messages(next('email'))).toEqual(['Enter a valid email address']);
        });

        it('replaces {0} with the limit of the rule, and shows every error with pFieldErrorAll', async () => {
            host.f.short().value.set('ab');
            host.f.short().markAsTouched();
            await settle();
            expect(messages(next('short'))).toEqual(['At least 3 characters are required']);

            host.f.short().value.set('abcdefg');
            await settle();
            expect(messages(next('short'))).toEqual(['At most 5 characters are allowed']);
        });

        it('shows the errors before touch with pFieldError="always"', async () => {
            expect(messages(next('always'))).toEqual(['This field is required']);
        });

        it('uses the messages given by kind, as text or as a function', async () => {
            host.f.custom().markAsTouched();
            await settle();
            expect(messages(next('custom'))).toEqual(['Fill me in']);

            host.f.custom().value.set('ab');
            await settle();
            expect(messages(next('custom'))).toEqual(['custom minLength']);
        });

        it('works after a component control, like p-select', async () => {
            host.f.select().markAsTouched();
            await settle();
            expect(messages(next('select'))).toEqual(['This field is required']);
        });

        it('links a native input to the message with aria-describedby only while it is shown', async () => {
            expect(el('email').getAttribute('aria-describedby')).toBeNull();
            host.f.email().markAsTouched();
            await settle();

            const id = el('email').getAttribute('aria-describedby');

            expect(id).toBeTruthy();
            expect(next('email')?.id).toBe(id);

            host.f.email().value.set('a@b.co');
            await settle();
            expect(el('email').getAttribute('aria-describedby')).toBeNull();
        });

        it('removes the message element with the control', async () => {
            const box = () => el('toggledBox');

            expect(box().querySelectorAll('p-fielderror').length).toBe(1);
            host.toggled.set(false);
            await settle();
            expect(fixture.nativeElement.querySelector('#toggledBox')).toBeNull();
            host.toggled.set(true);
            await settle();
            expect(box().querySelectorAll('p-fielderror').length).toBe(1);
        });
    });

    describe('translation', () => {
        it('takes the default messages from the configuration', async () => {
            await configure(provideOptimus({ translation: { validation: { required: 'Obligatorio' } } }));
            host.f.email().markAsTouched();
            await settle();
            expect(messages(next('email'))).toEqual(['Obligatorio']);
        });
    });
});

@Component({
    standalone: true,
    imports: [ReactiveFormsModule, FormsModule, InputTextModule, SelectModule, FieldErrorModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <input id="control" pInputText [formControl]="control" pFieldError />
        <form [formGroup]="group">
            <input id="named" pInputText formControlName="name" pFieldError [pFieldErrorAll]="true" />
        </form>
        <input id="model" pInputText [(ngModel)]="text" required minlength="3" pFieldError />
        <p-select id="select" [options]="['a', 'b']" [formControl]="choice" pFieldError />
        <input id="templated" pInputText [formControl]="control" pFieldError [pFieldErrorTemplate]="list" />
        <ng-template #list let-errors>
            <ul id="list">
                @for (error of errors; track error.kind) {
                    <li>{{ error.kind }}: {{ error.message }}</li>
                }
            </ul>
        </ng-template>
    `
})
class ClassicHost {
    readonly control = new FormControl('', [Validators.required, Validators.email]);
    readonly choice = new FormControl<string | null>(null, Validators.required);
    readonly group = new FormGroup({ name: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern(/^a/)]) });
    text = '';
}

describe('FieldError with classic forms', () => {
    let fixture: ComponentFixture<ClassicHost>;
    let host: ClassicHost;

    const el = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;
    const next = (id: string) => el(id).nextElementSibling as HTMLElement | null;
    const messages = (target: Element | null) => Array.from(target?.querySelectorAll('p-message') ?? []).map((m) => m.textContent?.trim());
    const settle = async () => {
        for (let i = 0; i < 2; i++) {
            fixture.detectChanges();
            await fixture.whenStable();
        }
    };

    beforeEach(async () => {
        TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
        fixture = TestBed.createComponent(ClassicHost);
        host = fixture.componentInstance;
        await settle();
    });

    it('shows the errors of a formControl only after it is touched', async () => {
        expect(messages(next('control'))).toEqual([]);
        host.control.markAsTouched();
        await settle();
        expect(messages(next('control'))).toEqual(['This field is required']);

        host.control.setValue('nope');
        await settle();
        expect(messages(next('control'))).toEqual(['Enter a valid email address']);

        host.control.setValue('a@b.co');
        await settle();
        expect(messages(next('control'))).toEqual([]);
    });

    it('shows the errors on a blur of the real input', async () => {
        el('control').dispatchEvent(new Event('blur'));
        await settle();
        expect(messages(next('control'))).toEqual(['This field is required']);
    });

    it('works with formControlName, maps the rule names and the limits, and shows every error', async () => {
        host.group.controls.name.setValue('b');
        host.group.controls.name.markAsTouched();
        await settle();
        expect(messages(next('named'))).toEqual(['At least 3 characters are required', 'The format is not valid']);
    });

    it('works with ngModel', async () => {
        expect(messages(next('model'))).toEqual([]);
        el('model').dispatchEvent(new Event('blur'));
        await settle();
        expect(messages(next('model'))).toEqual(['This field is required']);
    });

    it('works after a component control, like p-select', async () => {
        host.choice.markAsTouched();
        await settle();
        expect(messages(next('select'))).toEqual(['This field is required']);
    });

    it('replaces the message with a custom template', async () => {
        host.control.markAsTouched();
        await settle();
        expect(next('templated')?.querySelector('#list li')?.textContent?.trim()).toBe('required: This field is required');
        expect(next('templated')?.querySelector('p-message')).toBeNull();
    });

    it('links a native input to the message with aria-describedby', async () => {
        host.control.markAsTouched();
        await settle();
        expect(el('control').getAttribute('aria-describedby')).toBe(next('control')?.id);
    });
});

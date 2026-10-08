import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { email, form, FormField, maxLength, minLength, required, validate } from '@angular/forms/signals';
import { provideOptimus } from '@openng/optimus-ui/config';
import { FloatLabelModule } from '@openng/optimus-ui/floatlabel';
import { IconFieldModule } from '@openng/optimus-ui/iconfield';
import { InputIconModule } from '@openng/optimus-ui/inputicon';
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

@Component({
    standalone: true,
    imports: [FormField, ReactiveFormsModule, InputTextModule, FieldErrorModule, IconFieldModule, InputIconModule, FloatLabelModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <input id="live" pInputText [formField]="f.live" pFieldError />
        <input id="blurOnly" pInputText [formField]="f.blurOnly" pFieldError="touched" />
        <input id="swap" pInputText [formControl]="current()" pFieldError />
        <p-iconfield id="wrapper"><input id="inWrapper" pInputText [formField]="f.wrapped" pFieldError /></p-iconfield>
        <p-floatlabel id="floatWrapper"><input id="inFloat" pInputText [formField]="f.floated" pFieldError /></p-floatlabel>
    `
})
class RealtimeHost {
    readonly first = new FormControl('', Validators.required);
    readonly second = new FormControl('x', Validators.email);
    readonly current = signal(this.first);
    readonly model = signal({ live: '', blurOnly: '', wrapped: '', floated: '' });
    readonly f = form(this.model, (p) => {
        for (const field of [p.live, p.blurOnly, p.wrapped, p.floated]) {
            validate(field, ({ value }) => (value() === 'ok' ? null : { kind: 'required' }));
        }
    });
}

describe('FieldError in real time and placement', () => {
    let fixture: ComponentFixture<RealtimeHost>;
    let host: RealtimeHost;

    const el = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;
    const next = (id: string) => el(id).nextElementSibling as HTMLElement | null;
    const messages = (target: Element | null) => Array.from(target?.querySelectorAll('p-message') ?? []).map((m) => m.textContent?.trim());
    const settle = async () => {
        for (let i = 0; i < 2; i++) {
            fixture.detectChanges();
            await fixture.whenStable();
        }
    };
    const type = async (id: string, value: string) => {
        const input = el(id) as HTMLInputElement;

        input.focus();
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await settle();
    };

    beforeEach(async () => {
        TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
        fixture = TestBed.createComponent(RealtimeHost);
        host = fixture.componentInstance;
        await settle();
    });

    it('shows no error before the user touches the field, and not for a value set by the code', async () => {
        expect(messages(next('live'))).toEqual([]);
        host.f.live().value.set('set by code');
        await settle();
        expect(messages(next('live'))).toEqual([]);
    });

    it('shows the error while the user types, without leaving the field', async () => {
        await type('live', 'o');
        expect(host.f.live().touched()).toBe(false);
        expect(messages(next('live'))).toEqual(['This field is required']);
        expect(el('live').classList).toContain('p-invalid');

        await type('live', 'ok');
        expect(messages(next('live'))).toEqual([]);
        expect(el('live').classList).not.toContain('p-invalid');
    });

    it('waits for the blur with pFieldError="touched"', async () => {
        await type('blurOnly', 'o');
        expect(messages(next('blurOnly'))).toEqual([]);

        el('blurOnly').dispatchEvent(new Event('blur'));
        await settle();
        expect(messages(next('blurOnly'))).toEqual(['This field is required']);
    });

    it('shows the error of a classic control while the user types', async () => {
        await type('swap', 'a');
        expect(host.first.touched).toBe(false);
        expect(host.first.dirty).toBe(true);
        host.first.setValue('');
        await settle();
        expect(messages(next('swap'))).toEqual(['This field is required']);
    });

    it('follows a formControl that is replaced', async () => {
        host.first.markAsDirty();
        await settle();
        expect(messages(next('swap'))).toEqual(['This field is required']);

        host.current.set(host.second);
        await settle();
        expect(messages(next('swap'))).toEqual([]);

        host.second.markAsDirty();
        await settle();
        expect(messages(next('swap'))).toEqual(['Enter a valid email address']);
    });

    it('puts the message after the wrapper of a control inside p-iconfield or p-floatlabel', async () => {
        await type('inWrapper', 'o');
        await type('inFloat', 'o');

        expect(el('wrapper').querySelector('p-fielderror')).toBeNull();
        expect(next('wrapper')?.tagName.toLowerCase()).toBe('p-fielderror');
        expect(messages(next('wrapper'))).toEqual(['This field is required']);
        expect(el('floatWrapper').querySelector('p-fielderror')).toBeNull();
        expect(next('floatWrapper')?.tagName.toLowerCase()).toBe('p-fielderror');
    });
});

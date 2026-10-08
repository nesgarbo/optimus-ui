import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { disabled, form, FormField, readonly } from '@angular/forms/signals';
import { InputMaskModule } from '@openng/optimus-ui/inputmask';
import { InputOtpModule } from '@openng/optimus-ui/inputotp';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { PasswordModule } from '@openng/optimus-ui/password';
import { TextareaModule } from '@openng/optimus-ui/textarea';
import { describe, expect, it } from 'vitest';

@Component({
    standalone: true,
    imports: [FormField, InputTextModule, TextareaModule, PasswordModule, InputMaskModule, InputOtpModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <input id="text" pInputText [formField]="f.text" />
        <textarea id="area" pTextarea [formField]="f.area"></textarea>
        <p-password id="pass" [feedback]="false" [formField]="f.pass" />
        <p-inputmask id="mask" mask="99-99" [formField]="f.mask" />
        <p-inputotp id="otp" [length]="4" [formField]="f.otp" />
    `
})
class Host {
    readonly lock = signal(false);
    readonly freeze = signal(false);
    readonly model = signal({ text: '', area: '', pass: '', mask: '', otp: '' });
    readonly f = form(this.model, (p) => {
        for (const field of [p.text, p.area, p.pass, p.mask, p.otp]) {
            disabled(field as never, () => this.lock());
            readonly(field as never, () => this.freeze());
        }
    });
}

describe('forms interop: text controls with [formField]', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    const el = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;
    const inner = (id: string) => {
        const root = el(id);

        return (root.matches('input, textarea') ? root : root.querySelector('input')) as HTMLInputElement;
    };
    const settle = async () => {
        fixture.detectChanges();
        await fixture.whenStable();
    };
    const type = async (input: HTMLInputElement | HTMLTextAreaElement, value: string) => {
        input.focus();
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await settle();
    };
    const blur = async (input: HTMLElement) => {
        input.dispatchEvent(new Event('blur'));
        input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
        await settle();
    };

    const setup = async () => {
        TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        await settle();
    };

    for (const [id, key] of [
        ['text', 'text'],
        ['area', 'area'],
        ['pass', 'pass']
    ] as const) {
        describe(id, () => {
            it('shows the field value', async () => {
                await setup();
                host.f[key]().value.set('hello');
                await settle();
                expect(inner(id).value).toBe('hello');
            });

            it('writes typing to the field and marks it touched on blur', async () => {
                await setup();
                await type(inner(id), 'abc');
                expect(host.f[key]().value()).toBe('abc');

                await blur(inner(id));
                expect(host.f[key]().touched()).toBe(true);
            });

            it('follows disabled and readonly of the field', async () => {
                await setup();
                host.lock.set(true);
                await settle();
                expect(inner(id).disabled).toBe(true);
                host.lock.set(false);
                host.freeze.set(true);
                await settle();
                expect(inner(id).readOnly).toBe(true);
            });
        });
    }

    describe('inputmask', () => {
        it('shows the field value', async () => {
            await setup();
            host.f.mask().value.set('12-34');
            await settle();
            expect(inner('mask').value).toBe('12-34');
        });

        it('writes the masked text to the field and marks it touched on blur', async () => {
            await setup();
            const input = inner('mask');

            input.focus();
            for (const char of '1234') {
                const code = char.charCodeAt(0);

                input.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, cancelable: true, charCode: code, keyCode: code, which: code } as KeyboardEventInit));
            }
            await new Promise((resolve) => setTimeout(resolve, 20));
            await settle();
            expect(host.f.mask().value()).toBe('12-34');

            await blur(inner('mask'));
            expect(host.f.mask().touched()).toBe(true);
        });

        it('follows disabled of the field', async () => {
            await setup();
            host.lock.set(true);
            await settle();
            expect(inner('mask').disabled).toBe(true);
        });
    });

    describe('inputotp', () => {
        const boxes = () => Array.from(el('otp').querySelectorAll('input')) as HTMLInputElement[];

        it('shows the field value across the boxes', async () => {
            await setup();
            host.f.otp().value.set('1234');
            await settle();
            expect(boxes().map((b) => b.value)).toEqual(['1', '2', '3', '4']);
        });

        it('writes the code to the field and marks it touched on blur', async () => {
            await setup();
            await type(boxes()[0], '1');
            expect(host.f.otp().value()).toBe('1');

            await blur(boxes()[0]);
            expect(host.f.otp().touched()).toBe(true);
        });

        it('follows disabled of the field', async () => {
            await setup();
            host.lock.set(true);
            await settle();
            expect(boxes().every((b) => b.disabled)).toBe(true);
        });
    });
});

@Component({
    standalone: true,
    imports: [ReactiveFormsModule, FormsModule, InputTextModule, TextareaModule, PasswordModule, InputMaskModule, InputOtpModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <input id="text" pInputText [formControl]="text" />
        <textarea id="area" pTextarea [(ngModel)]="area"></textarea>
        <p-password id="pass" [feedback]="false" [formControl]="pass" />
        <p-inputmask id="mask" mask="99-99" [formControl]="mask" />
        <p-inputotp id="otp" [length]="4" [formControl]="otp" />
    `
})
class ClassicHost {
    readonly text = new FormControl('a');
    readonly pass = new FormControl('b');
    readonly mask = new FormControl('12-34');
    readonly otp = new FormControl('1234');
    area = 'c';
}

describe('forms interop: text controls with classic forms', () => {
    it('keep writing the value both ways and marking touched', async () => {
        TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
        const fixture = TestBed.createComponent(ClassicHost);
        const host = fixture.componentInstance;

        for (let i = 0; i < 2; i++) {
            fixture.detectChanges();
            await fixture.whenStable();
        }

        const q = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;
        const input = (id: string) => (q(id).matches('input, textarea') ? q(id) : q(id).querySelector('input')) as HTMLInputElement;

        expect(input('text').value).toBe('a');
        expect(input('area').value).toBe('c');
        expect(input('pass').value).toBe('b');
        expect(input('mask').value).toBe('12-34');
        expect(Array.from(q('otp').querySelectorAll('input')).map((i) => (i as HTMLInputElement).value)).toEqual(['1', '2', '3', '4']);

        input('text').value = 'z';
        input('text').dispatchEvent(new Event('input', { bubbles: true }));
        input('text').dispatchEvent(new Event('blur'));
        expect(host.text.value).toBe('z');
        expect(host.text.touched).toBe(true);
    });
});

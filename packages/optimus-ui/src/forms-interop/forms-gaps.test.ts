import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, FormField } from '@angular/forms/signals';
import { By } from '@angular/platform-browser';
import { ColorPicker, ColorPickerModule } from '@openng/optimus-ui/colorpicker';
import { Editor, EditorModule } from '@openng/optimus-ui/editor';
import { InputMaskModule } from '@openng/optimus-ui/inputmask';
import { describe, expect, it } from 'vitest';

@Component({
    standalone: true,
    imports: [FormField, ColorPickerModule, EditorModule, InputMaskModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <p-colorpicker id="color" [inline]="true" [formField]="f.color" />
        <p-editor id="editor" [style]="{ height: '80px' }" [formField]="f.html" />
        <input id="directive" pInputMask="99-99" [formField]="f.masked" />
    `
})
class Host {
    readonly model = signal({ color: '#1976d2', html: '<p>Hello</p>', masked: '' });
    readonly f = form(this.model);
}

describe('forms interop: colorpicker, editor and the mask directive with [formField]', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    const instance = <T>(id: string) => fixture.debugElement.query(By.css(`#${id}`)).componentInstance as T;
    const settle = async () => {
        fixture.detectChanges();
        await fixture.whenStable();
    };
    const until = async (condition: () => boolean) => {
        for (let i = 0; i < 100 && !condition(); i++) {
            await new Promise((resolve) => setTimeout(resolve, 20));
        }
    };
    const setup = async () => {
        TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        await settle();
    };

    describe('colorpicker', () => {
        it('writes the picked color to the field as hex', async () => {
            await setup();
            const picker = instance<ColorPicker>('color');

            picker.value = { h: 0, s: 100, b: 100 };
            picker.updateModel();
            await settle();
            expect(host.f.color().value()).toBe('#ff0000');
        });

        it('shows a color written to the field', async () => {
            await setup();
            host.f.color().value.set('#00ff00');
            await settle();
            expect(instance<ColorPicker>('color').value).toEqual({ h: 120, s: 100, b: 100 });
        });
    });

    describe('editor', () => {
        const quill = () => instance<Editor>('editor').quill;

        it('shows the field value in the editor and writes edits to the field', async () => {
            await setup();
            await until(() => !!quill());
            expect(quill()).toBeTruthy();
            expect(quill().root.innerHTML).toContain('Hello');

            host.f.html().value.set('<p>Changed</p>');
            await settle();
            await until(() => quill().root.innerHTML.includes('Changed'));
            expect(quill().root.innerHTML).toContain('Changed');

            quill().insertText(0, 'Typed ', 'user');
            await settle();
            expect(host.f.html().value()).toContain('Typed');
        });

        it('marks the field touched on blur, not on each edit', async () => {
            await setup();
            await until(() => !!quill());
            quill().insertText(0, 'x', 'user');
            await settle();
            expect(host.f.html().touched()).toBe(false);

            quill().root.dispatchEvent(new Event('blur'));
            await settle();
            expect(host.f.html().touched()).toBe(true);
        });
    });

    describe('pInputMask directive on a native input', () => {
        it('shows the field value in the masked input', async () => {
            await setup();
            const input = fixture.nativeElement.querySelector('#directive') as HTMLInputElement;

            host.f.masked().value.set('12-34');
            await settle();
            expect(input.value).toBe('12-34');
        });

        it('writes the typed text to the field and marks it touched on blur', async () => {
            await setup();
            const input = fixture.nativeElement.querySelector('#directive') as HTMLInputElement;

            input.focus();
            for (const char of '1234') {
                const code = char.charCodeAt(0);

                input.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, cancelable: true, charCode: code, keyCode: code, which: code } as KeyboardEventInit));
            }
            await new Promise((resolve) => setTimeout(resolve, 20));
            await settle();
            expect(host.f.masked().value()).toBe('12-34');

            input.dispatchEvent(new Event('blur'));
            await settle();
            expect(host.f.masked().touched()).toBe(true);
        });
    });
});

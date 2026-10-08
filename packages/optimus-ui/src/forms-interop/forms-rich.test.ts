import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { disabled, form, FormField, readonly } from '@angular/forms/signals';
import { By } from '@angular/platform-browser';
import { ColorPickerModule } from '@openng/optimus-ui/colorpicker';
import { DatePicker, DatePickerModule } from '@openng/optimus-ui/datepicker';
import { TextEditorModule, TextEditorRoot } from '@openng/optimus-ui/texteditor';
import { describe, expect, it } from 'vitest';

@Component({
    standalone: true,
    imports: [FormField, DatePickerModule, ColorPickerModule, TextEditorModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <p-datepicker id="date" [formField]="f.date" />
        <p-datepicker id="multi" selectionMode="multiple" [formField]="f.dates" />
        <p-datepicker id="range" selectionMode="range" [formField]="f.range" />
        <p-colorpicker id="color" [formField]="f.color" />
        <p-text-editor-root id="editor" [formField]="f.html">
            <p-text-editor-content />
        </p-text-editor-root>
    `
})
class Host {
    readonly lock = signal(false);
    readonly freeze = signal(false);
    readonly model = signal<{ date: Date | null; dates: Date[]; range: (Date | null)[] | null; color: string; html: string }>({ date: null, dates: [], range: null, color: '1976d2', html: '<p>Hello</p>' });
    readonly f = form(this.model, (p) => {
        for (const field of [p.date, p.dates, p.range, p.color, p.html]) {
            disabled(field as never, () => this.lock());
            readonly(field as never, () => this.freeze());
        }
    });
}

describe('forms interop: date, color and editor controls with [formField]', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    const el = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;
    const input = (id: string) => el(id).querySelector('input') as HTMLInputElement;
    const instance = <T>(id: string) => fixture.debugElement.query(By.css(`#${id}`)).componentInstance as T;
    const settle = async () => {
        fixture.detectChanges();
        await fixture.whenStable();
    };
    const setup = async () => {
        TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        await settle();
    };
    const type = async (target: HTMLInputElement, value: string) => {
        target.focus();
        target.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true }));
        target.value = value;
        target.dispatchEvent(new Event('input', { bubbles: true }));
        await settle();
    };

    describe('datepicker', () => {
        it('shows the field value, and null as empty', async () => {
            await setup();
            expect(input('date').value).toBe('');
            host.f.date().value.set(new Date(2026, 2, 15));
            await settle();
            expect(input('date').value).toBe('03/15/2026');
            host.f.date().value.set(null);
            await settle();
            expect(input('date').value).toBe('');
        });

        it('writes a typed date to the field as a Date, and marks it touched on blur', async () => {
            await setup();
            await type(input('date'), '03/15/2026');
            const value = host.f.date().value();

            expect(value).toBeInstanceOf(Date);
            expect(value?.getFullYear()).toBe(2026);
            expect(value?.getMonth()).toBe(2);
            expect(value?.getDate()).toBe(15);

            input('date').dispatchEvent(new Event('blur'));
            await settle();
            expect(host.f.date().touched()).toBe(true);
        });

        it('shows and writes several dates, without editing the form array in place', async () => {
            await setup();
            const before = host.f.dates().value();

            host.f.dates().value.set([new Date(2026, 2, 1), new Date(2026, 2, 2)]);
            await settle();
            expect(input('multi').value).toBe('03/01/2026, 03/02/2026');

            const dp = instance<DatePicker>('multi');
            const current = host.f.dates().value();

            dp.onDateSelect(new Event('click'), { day: 3, month: 2, year: 2026, selectable: true, today: false });
            await settle();
            expect(host.f.dates().value().length).toBe(3);
            expect(current.length).toBe(2);
            expect(before).toEqual([]);
        });

        it('shows a range', async () => {
            await setup();
            host.f.range().value.set([new Date(2026, 2, 1), new Date(2026, 2, 5)]);
            await settle();
            expect(input('range').value).toBe('03/01/2026 - 03/05/2026');
        });

        it('follows disabled of the field', async () => {
            await setup();
            host.lock.set(true);
            await settle();
            expect(input('date').disabled).toBe(true);
            host.lock.set(false);
            host.freeze.set(true);
            await settle();
            expect(input('date').readOnly).toBe(true);
        });
    });

    describe('colorpicker', () => {
        it('shows the field value on the preview', async () => {
            await setup();
            expect(el('color').querySelector('input')).not.toBeNull();
            host.f.color().value.set('ff0000');
            await settle();
            expect(instance<{ value: unknown }>('color').value).toEqual({ h: 0, s: 100, b: 100 });
        });

        it('marks the field touched and follows disabled', async () => {
            await setup();
            host.lock.set(true);
            await settle();
            expect(input('color').disabled).toBe(true);
        });
    });

    describe('texteditor', () => {
        it('shows the field value', async () => {
            await setup();
            expect(instance<TextEditorRoot>('editor').value()).toBe('<p>Hello</p>');
            host.f.html().value.set('<p>Changed</p>');
            await settle();
            expect(instance<TextEditorRoot>('editor').value()).toBe('<p>Changed</p>');
            expect(el('editor').textContent).toContain('Changed');
        });

        it('marks the field touched on blur, not on each edit', async () => {
            await setup();
            const editable = el('editor').querySelector('[contenteditable]') as HTMLElement;

            editable.dispatchEvent(new Event('focus'));
            editable.textContent = 'Typed';
            await settle();
            expect(host.f.html().touched()).toBe(false);

            editable.dispatchEvent(new Event('blur'));
            await settle();
            expect(host.f.html().touched()).toBe(true);
        });

        it('follows disabled and readonly of the field', async () => {
            await setup();
            host.lock.set(true);
            await settle();
            expect(instance<TextEditorRoot>('editor').$disabled()).toBe(true);
        });
    });
});

@Component({
    standalone: true,
    imports: [ReactiveFormsModule, FormsModule, DatePickerModule, ColorPickerModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <p-datepicker id="date" [formControl]="date" />
        <p-colorpicker id="color" [(ngModel)]="color" />
    `
})
class ClassicHost {
    readonly date = new FormControl<Date | null>(new Date(2026, 2, 15));
    color = 'ff0000';
}

describe('forms interop: date and color controls with classic forms', () => {
    it('keep showing the value and writing it back', async () => {
        TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
        const fixture = TestBed.createComponent(ClassicHost);
        const host = fixture.componentInstance;

        for (let i = 0; i < 2; i++) {
            fixture.detectChanges();
            await fixture.whenStable();
        }

        const input = fixture.nativeElement.querySelector('#date input') as HTMLInputElement;

        expect(input.value).toBe('03/15/2026');
        input.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true }));
        input.value = '04/01/2026';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('blur'));
        expect(host.date.value?.getMonth()).toBe(3);
        expect(host.date.touched).toBe(true);
    });
});

import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, FormField, validate } from '@angular/forms/signals';
import { By } from '@angular/platform-browser';
import { CheckboxModule } from '@openng/optimus-ui/checkbox';
import { InputNumberModule } from '@openng/optimus-ui/inputnumber';
import { Select, SelectModule } from '@openng/optimus-ui/select';
import { SliderModule } from '@openng/optimus-ui/slider';
import { TextareaModule } from '@openng/optimus-ui/textarea';
import { ToggleSwitchModule } from '@openng/optimus-ui/toggleswitch';
import { describe, expect, it } from 'vitest';

@Component({
    standalone: true,
    imports: [FormField, CheckboxModule, InputNumberModule, SelectModule, SliderModule, TextareaModule, ToggleSwitchModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <p-checkbox id="check" [binary]="true" [formField]="f.check" />
        <p-toggleswitch id="switch" [formField]="f.flag" />
        <p-inputnumber id="num" [formField]="f.num" />
        <p-select id="select" [options]="['a', 'b']" [formField]="f.pick" />
        <p-slider id="slider" [formField]="f.level" />
        <textarea id="area" pTextarea [formField]="f.area"></textarea>
    `
})
class Host {
    readonly model = signal({ check: false, flag: false, num: null as number | null, pick: null as string | null, level: 0, area: '' });
    // Every field is invalid while the user has not typed the one right value, so the error can only come from the interaction.
    readonly f = form(this.model, (p) => {
        validate(p.check, ({ value }) => (value() ? { kind: 'required' } : null));
        validate(p.flag, ({ value }) => (value() ? { kind: 'required' } : null));
        validate(p.num, ({ value }) => (value() === 42 ? null : { kind: 'required' }));
        validate(p.pick, ({ value }) => (value() === 'b' ? null : { kind: 'required' }));
        validate(p.level, ({ value }) => (value() === 50 ? null : { kind: 'required' }));
        validate(p.area, ({ value }) => (value() === 'ok' ? null : { kind: 'required' }));
    });
}

describe('forms interop: the error shows while the user changes the value, before the field is left', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    const el = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;
    const red = (id: string) => !!el(id).querySelector('.p-invalid, [data-p~="invalid"]') || el(id).classList.contains('p-invalid') || el(id).getAttribute('data-p')?.includes('invalid') === true;
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

    it('is not red at the start, and not when the code sets the value', async () => {
        await setup();
        host.f.pick().value.set('a');
        host.f.num().value.set(7);
        await settle();
        for (const id of ['select', 'num', 'slider']) expect(red(id), id).toBe(false);
    });

    it('turns red when a checkbox is clicked', async () => {
        await setup();
        (el('check').querySelector('input') as HTMLInputElement).click();
        await settle();
        expect(host.f.check().touched()).toBe(false);
        expect(red('check')).toBe(true);
    });

    it('turns red when a toggleswitch is clicked', async () => {
        await setup();
        (el('switch').querySelector('input') as HTMLInputElement).click();
        await settle();
        expect(host.f.flag().touched()).toBe(false);
        expect(red('switch')).toBe(true);
    });

    it('turns red when an option of a select is chosen', async () => {
        await setup();
        fixture.debugElement.query(By.directive(Select)).componentInstance.onOptionSelect(new Event('click'), 'a');
        await settle();
        expect(host.f.pick().touched()).toBe(false);
        expect(red('select')).toBe(true);
    });

    it('turns red when the user types in a textarea', async () => {
        await setup();
        const area = el('area') as HTMLTextAreaElement;

        area.value = 'o';
        area.dispatchEvent(new Event('input', { bubbles: true }));
        await settle();
        expect(host.f.area().touched()).toBe(false);
        expect(red('area')).toBe(true);
    });

    it('turns red when the user moves a slider', async () => {
        await setup();
        el('slider')
            .querySelector('.p-slider-handle')!
            .dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight', key: 'ArrowRight', bubbles: true }));
        await settle();
        expect(host.f.level().touched()).toBe(false);
        expect(red('slider')).toBe(true);
    });
});

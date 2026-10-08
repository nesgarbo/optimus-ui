import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { disabled, form, FormField, readonly } from '@angular/forms/signals';
import { InputNumberModule } from '@openng/optimus-ui/inputnumber';
import { KnobModule } from '@openng/optimus-ui/knob';
import { RatingModule } from '@openng/optimus-ui/rating';
import { SliderModule } from '@openng/optimus-ui/slider';
import { describe, expect, it } from 'vitest';

@Component({
    standalone: true,
    imports: [FormField, InputNumberModule, KnobModule, RatingModule, SliderModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <p-inputnumber id="num" [formField]="f.num" />
        <p-slider id="slider" [formField]="f.slider" />
        <p-slider id="range" [range]="true" [formField]="f.range" />
        <p-knob id="knob" [formField]="f.knob" />
        <p-rating id="rating" [formField]="f.rating" />
    `
})
class Host {
    readonly lock = signal(false);
    readonly freeze = signal(false);
    readonly model = signal<{ num: number | null; slider: number; range: number[]; knob: number; rating: number | null }>({ num: null, slider: 10, range: [20, 60], knob: 5, rating: null });
    readonly f = form(this.model, (p) => {
        for (const field of [p.num, p.slider, p.range, p.knob, p.rating]) {
            disabled(field as never, () => this.lock());
            readonly(field as never, () => this.freeze());
        }
    });
}

@Component({
    standalone: true,
    imports: [ReactiveFormsModule, FormsModule, KnobModule, SliderModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <p-slider id="slider" [formControl]="sliderControl" />
        <p-slider id="range" [range]="true" [formControl]="rangeControl" />
        <p-knob id="knob" [(ngModel)]="knob" />
    `
})
class ClassicHost {
    readonly sliderControl = new FormControl(10);
    readonly rangeControl = new FormControl([20, 60]);
    knob = 5;
}

describe('forms interop: numeric controls with classic forms', () => {
    it('slider, range slider and knob keep working, and slider marks the control touched on blur', async () => {
        TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
        const fixture = TestBed.createComponent(ClassicHost);
        const host = fixture.componentInstance;

        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        await fixture.whenStable();

        const handle = fixture.nativeElement.querySelector('#slider .p-slider-handle') as HTMLElement;
        const range = fixture.nativeElement.querySelectorAll('#range .p-slider-handle');

        expect(handle.getAttribute('aria-valuenow')).toBe('10');
        expect(range[1].getAttribute('aria-valuenow')).toBe('60');
        expect(fixture.nativeElement.querySelector('#knob svg').getAttribute('aria-valuenow')).toBe('5');

        handle.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight', key: 'ArrowRight', bubbles: true }));
        handle.dispatchEvent(new Event('blur'));
        expect(host.sliderControl.value).toBe(11);
        expect(host.sliderControl.touched).toBe(true);

        const model = host.rangeControl.value;

        range[0].dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight', key: 'ArrowRight', bubbles: true }));
        expect(model).toEqual([20, 60]);
        expect(host.rangeControl.value).toEqual([21, 60]);
    });
});

describe('forms interop: numeric controls with [formField]', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    const el = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;
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

    describe('inputnumber', () => {
        it('shows the field value, and null as empty', async () => {
            await setup();
            const input = el('num').querySelector('input') as HTMLInputElement;

            expect(input.value).toBe('');
            host.f.num().value.set(42);
            await settle();
            expect(input.value).toBe('42');
            host.f.num().value.set(null);
            await settle();
            expect(input.value).toBe('');
        });

        it('writes a typed number to the field and marks it touched on blur', async () => {
            await setup();
            const input = el('num').querySelector('input') as HTMLInputElement;

            input.focus();
            input.value = '7';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('blur'));
            await settle();

            expect(host.f.num().value()).toBe(7);
            expect(typeof host.f.num().value()).toBe('number');
            expect(host.f.num().touched()).toBe(true);
        });

        it('follows disabled and readonly of the field', async () => {
            await setup();
            const input = el('num').querySelector('input') as HTMLInputElement;

            host.lock.set(true);
            await settle();
            expect(input.disabled).toBe(true);
            host.lock.set(false);
            host.freeze.set(true);
            await settle();
            expect(input.readOnly).toBe(true);
        });
    });

    describe('slider', () => {
        const handle = () => el('slider').querySelector('.p-slider-handle') as HTMLElement;

        it('shows the field value', async () => {
            await setup();
            expect(handle().getAttribute('aria-valuenow')).toBe('10');
            host.f.slider().value.set(30);
            await settle();
            expect(handle().getAttribute('aria-valuenow')).toBe('30');
        });

        it('writes the keyboard value to the field and marks it touched on blur', async () => {
            await setup();
            handle().dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight', key: 'ArrowRight', bubbles: true }));
            await settle();
            expect(host.f.slider().value()).toBe(11);

            handle().dispatchEvent(new Event('blur'));
            await settle();
            expect(host.f.slider().touched()).toBe(true);
        });

        it('supports a range value', async () => {
            await setup();
            const handles = el('range').querySelectorAll('.p-slider-handle');

            expect(handles[0].getAttribute('aria-valuenow')).toBe('20');
            expect(handles[1].getAttribute('aria-valuenow')).toBe('60');
            host.f.range().value.set([10, 80]);
            await settle();
            expect(handles[0].getAttribute('aria-valuenow')).toBe('10');
            expect(handles[1].getAttribute('aria-valuenow')).toBe('80');
        });

        it('follows disabled of the field', async () => {
            await setup();
            host.lock.set(true);
            await settle();
            expect(el('slider').className).toContain('p-disabled');
        });
    });

    describe('knob', () => {
        const svg = () => el('knob').querySelector('svg') as SVGElement;

        it('shows the field value', async () => {
            await setup();
            expect(svg().getAttribute('aria-valuenow')).toBe('5');
            host.f.knob().value.set(40);
            await settle();
            expect(svg().getAttribute('aria-valuenow')).toBe('40');
        });

        it('writes the keyboard value to the field and marks it touched on blur', async () => {
            await setup();
            svg().dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp', key: 'ArrowUp', bubbles: true }));
            await settle();
            expect(host.f.knob().value()).toBe(6);

            svg().dispatchEvent(new Event('blur'));
            await settle();
            expect(host.f.knob().touched()).toBe(true);
        });

        it('ignores the keyboard when the field is readonly', async () => {
            await setup();
            host.freeze.set(true);
            await settle();
            svg().dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp', key: 'ArrowUp', bubbles: true }));
            await settle();
            expect(host.f.knob().value()).toBe(5);
        });
    });

    describe('rating', () => {
        it('shows the field value and null as no stars', async () => {
            await setup();
            const checked = () => el('rating').querySelectorAll('input:checked').length;

            expect(checked()).toBe(0);
            host.f.rating().value.set(3);
            await settle();
            expect((el('rating').querySelector('input:checked') as HTMLInputElement)?.value).toBe('3');
        });

        it('writes the chosen star to the field', async () => {
            await setup();
            (el('rating').querySelectorAll('.p-rating-option')[2] as HTMLElement).click();
            await settle();
            expect(host.f.rating().value()).toBe(3);
            expect(host.f.rating().touched()).toBe(true);
        });

        it('does not rate when the field is disabled', async () => {
            await setup();
            host.lock.set(true);
            await settle();
            (el('rating').querySelectorAll('.p-rating-option')[2] as HTMLElement).click();
            await settle();
            expect(host.f.rating().value()).toBe(null);
        });
    });
});

import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { disabled, form, FormField, readonly } from '@angular/forms/signals';
import { CheckboxModule } from '@openng/optimus-ui/checkbox';
import { ToggleButtonModule } from '@openng/optimus-ui/togglebutton';
import { ToggleSwitchModule } from '@openng/optimus-ui/toggleswitch';
import { describe, expect, it } from 'vitest';

@Component({
    standalone: true,
    imports: [FormField, CheckboxModule, ToggleSwitchModule, ToggleButtonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <p-checkbox id="check" [binary]="true" [formField]="f.check" />
        <p-checkbox id="red" value="red" [formField]="f.colors" />
        <p-checkbox id="blue" value="blue" [formField]="f.colors" />
        <p-toggleswitch id="switch" [formField]="f.switch" />
        <p-togglebutton id="toggle" onLabel="On" offLabel="Off" [formField]="f.toggle" />
    `
})
class Host {
    readonly lock = signal(false);
    readonly freeze = signal(false);
    readonly model = signal({ check: false, colors: [] as string[], switch: false, toggle: false });
    readonly f = form(this.model, (p) => {
        for (const field of [p.check, p.colors, p.switch, p.toggle]) {
            disabled(field as never, () => this.lock());
            readonly(field as never, () => this.freeze());
        }
    });
}

describe('forms interop: boolean controls with [formField]', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    const el = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;
    const input = (id: string) => el(id).querySelector('input') as HTMLInputElement;
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

    describe('checkbox', () => {
        it('shows the field value', async () => {
            await setup();
            expect(input('check').checked).toBe(false);
            host.f.check().value.set(true);
            await settle();
            expect(input('check').checked).toBe(true);
        });

        it('writes a click to the field and marks it touched on blur', async () => {
            await setup();
            input('check').click();
            await settle();
            expect(host.f.check().value()).toBe(true);

            input('check').dispatchEvent(new Event('blur'));
            await settle();
            expect(host.f.check().touched()).toBe(true);
        });

        it('follows disabled and readonly of the field', async () => {
            await setup();
            host.lock.set(true);
            await settle();
            expect(input('check').disabled).toBe(true);
            host.lock.set(false);
            host.freeze.set(true);
            await settle();
            input('check').click();
            await settle();
            expect(host.f.check().value()).toBe(false);
        });

        it('builds an array value from a group, without editing the form array in place', async () => {
            await setup();
            const before = host.f.colors().value();

            input('red').click();
            await settle();
            input('blue').click();
            await settle();
            expect(host.f.colors().value()).toEqual(['red', 'blue']);
            expect(before).toEqual([]);

            host.f.colors().value.set(['blue']);
            await settle();
            expect(input('red').checked).toBe(false);
            expect(input('blue').checked).toBe(true);
        });
    });

    describe('toggleswitch', () => {
        it('shows the field value', async () => {
            await setup();
            expect(input('switch').checked).toBe(false);
            host.f.switch().value.set(true);
            await settle();
            expect(input('switch').checked).toBe(true);
        });

        it('writes a click to the field and marks it touched on blur', async () => {
            await setup();
            input('switch').click();
            await settle();
            expect(host.f.switch().value()).toBe(true);

            input('switch').dispatchEvent(new Event('blur'));
            await settle();
            expect(host.f.switch().touched()).toBe(true);
        });

        it('follows disabled and readonly of the field', async () => {
            await setup();
            host.lock.set(true);
            await settle();
            expect(input('switch').disabled).toBe(true);
            host.lock.set(false);
            host.freeze.set(true);
            await settle();
            input('switch').click();
            await settle();
            expect(host.f.switch().value()).toBe(false);
        });
    });

    describe('togglebutton', () => {
        const button = () => el('toggle');

        it('shows the field value as the label and pressed state', async () => {
            await setup();
            expect(button().textContent).toContain('Off');
            host.f.toggle().value.set(true);
            await settle();
            expect(button().textContent).toContain('On');
        });

        it('writes a click to the field and marks it touched on blur', async () => {
            await setup();
            button().click();
            await settle();
            expect(host.f.toggle().value()).toBe(true);

            (button().querySelector('input') ?? button()).dispatchEvent(new Event('blur'));
            await settle();
            expect(host.f.toggle().touched()).toBe(true);
        });

        it('follows disabled of the field', async () => {
            await setup();
            host.lock.set(true);
            await settle();
            button().click();
            await settle();
            expect(host.f.toggle().value()).toBe(false);
        });
    });
});

@Component({
    standalone: true,
    imports: [ReactiveFormsModule, FormsModule, CheckboxModule, ToggleSwitchModule, ToggleButtonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <p-checkbox id="check" [binary]="true" [formControl]="check" />
        <p-toggleswitch id="switch" [(ngModel)]="on" />
        <p-togglebutton id="toggle" onLabel="On" offLabel="Off" [formControl]="toggle" />
    `
})
class ClassicHost {
    readonly check = new FormControl(true);
    readonly toggle = new FormControl(false);
    on = true;
}

describe('forms interop: boolean controls with classic forms', () => {
    it('keep writing the value both ways and marking touched', async () => {
        TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
        const fixture = TestBed.createComponent(ClassicHost);
        const host = fixture.componentInstance;

        for (let i = 0; i < 2; i++) {
            fixture.detectChanges();
            await fixture.whenStable();
        }

        const input = (id: string) => fixture.nativeElement.querySelector(`#${id} input`) as HTMLInputElement;

        expect(input('check').checked).toBe(true);
        expect(input('switch').checked).toBe(true);

        input('check').click();
        input('check').dispatchEvent(new Event('blur'));
        expect(host.check.value).toBe(false);
        expect(host.check.touched).toBe(true);
    });
});

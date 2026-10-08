import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import type { SignatureChangeEvent } from '@openng/optimus-ui/types/signature';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Signature, SignatureModule } from './signature';

@Component({
    standalone: true,
    imports: [SignatureModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<p-signature #pad [(value)]="value" [readonly]="locked()" backgroundColor="#ffffff" strokeColor="#123456" (changed)="events.push($event)" style="width: 300px; height: 150px" />`
})
class Host {
    readonly pad = viewChild.required<Signature>('pad');
    readonly value = signal<string | null>(null);
    readonly locked = signal(false);
    readonly events: SignatureChangeEvent[] = [];
}

@Component({
    standalone: true,
    imports: [SignatureModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<p-signature [(value)]="value" [valueDebounce]="40" (changed)="events.push($event)" style="width: 300px; height: 150px" />`
})
class DebouncedHost {
    readonly value = signal<string | null>(null);
    readonly events: SignatureChangeEvent[] = [];
}

@Component({
    standalone: true,
    imports: [SignatureModule, FormField],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<p-signature [formField]="f.sig" style="width: 300px; height: 150px" />`
})
class SignalFormHost {
    readonly model = signal<{ sig: string | null }>({ sig: null });
    readonly f = form(this.model);
}

@Component({
    standalone: true,
    imports: [SignatureModule, ReactiveFormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<p-signature [formControl]="control" style="width: 300px; height: 150px" />`
})
class ReactiveHost {
    readonly control = new FormControl<string | null>(null);
}

const fire = (canvas: HTMLCanvasElement, type: string, x: number, y: number, t: number) =>
    canvas.dispatchEvent(new PointerEvent(type, { pointerId: 1, pointerType: 'mouse', button: 0, clientX: canvas.getBoundingClientRect().left + x, clientY: canvas.getBoundingClientRect().top + y, bubbles: true, cancelable: true }));

function stroke(canvas: HTMLCanvasElement, points: [number, number][]) {
    fire(canvas, 'pointerdown', points[0][0], points[0][1], 0);
    points.slice(1).forEach(([x, y], i) => fire(canvas, 'pointermove', x, y, (i + 1) * 10));
    fire(canvas, 'pointerup', points.at(-1)![0], points.at(-1)![1], 100);
}

describe('Signature', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    const canvas = () => fixture.nativeElement.querySelector('canvas') as HTMLCanvasElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [Host, DebouncedHost, SignalFormHost, ReactiveHost], providers: [provideZonelessChangeDetection()] }).compileComponents();

        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('starts empty and labelled', () => {
        expect(host.pad().isEmpty()).toBe(true);
        expect(canvas().getAttribute('aria-label')).toBe('Signature pad');
        expect(canvas().width).toBeGreaterThan(0);
        expect(fixture.nativeElement.querySelector('p-signature').classList).toContain('p-signature-empty');
    });

    it('captures a stroke and publishes a PNG data URL', async () => {
        stroke(canvas(), [
            [10, 10],
            [40, 30],
            [80, 20]
        ]);
        await fixture.whenStable();

        expect(host.pad().isEmpty()).toBe(false);
        expect(host.value()).toMatch(/^data:image\/png;base64,/);
        expect(host.events.at(-1)).toEqual({ type: 'draw', empty: false });
    });

    it('undoes, redoes and clears', async () => {
        stroke(canvas(), [
            [10, 10],
            [40, 30]
        ]);
        stroke(canvas(), [
            [50, 50],
            [90, 60]
        ]);

        const pad = host.pad();

        expect(pad.canUndo()).toBe(true);
        pad.undo();
        expect(pad.canRedo()).toBe(true);
        expect(pad.isEmpty()).toBe(false);
        pad.undo();
        expect(pad.isEmpty()).toBe(true);
        expect(host.value()).toBeNull();
        pad.redo();
        expect(pad.isEmpty()).toBe(false);
        pad.clear();
        await fixture.whenStable();
        expect(pad.isEmpty()).toBe(true);
        expect(host.events.map((e) => e.type)).toEqual(['draw', 'draw', 'undo', 'undo', 'redo', 'clear']);
    });

    it('draws a dot from a tap', () => {
        stroke(canvas(), [[20, 20]]);

        expect(host.pad().isEmpty()).toBe(false);
    });

    it('exports every format, and svg carries the strokes', async () => {
        stroke(canvas(), [
            [10, 10],
            [40, 30],
            [80, 20]
        ]);

        const pad = host.pad();

        expect(pad.getSignature('png')).toMatch(/^data:image\/png/);
        expect(pad.getSignature('jpeg')).toMatch(/^data:image\/jpeg/);
        expect(decodeURIComponent(pad.getSignature('svg'))).toContain('<path');
        expect(decodeURIComponent(pad.getSignature('svg'))).toContain('stroke="#123456"');
        expect((await pad.saveAsBlob('png')).type).toBe('image/png');
    });

    it('lets beforeSave cancel the export', () => {
        const pad = host.pad();

        stroke(canvas(), [
            [10, 10],
            [40, 30]
        ]);
        pad.beforeSave.subscribe((e) => (e.cancel = true));

        expect(pad.save()).toBeNull();
    });

    it('loads an image and types a signature', async () => {
        const pad = host.pad();

        pad.draw('Ada');
        await fixture.whenStable();

        expect(pad.isEmpty()).toBe(false);
        expect(host.value()).toMatch(/^data:image\/png/);

        const url = host.value()!;

        pad.clear();
        await pad.loadSignature(url);
        expect(pad.isEmpty()).toBe(false);
    });

    it('draws nothing when read-only', async () => {
        host.locked.set(true);
        await fixture.whenStable();

        stroke(canvas(), [
            [10, 10],
            [40, 30]
        ]);

        expect(host.pad().isEmpty()).toBe(true);
        expect(canvas().getAttribute('aria-readonly')).toBe('true');
    });

    it('answers the keyboard', () => {
        stroke(canvas(), [
            [10, 10],
            [40, 30]
        ]);
        canvas().dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }));

        expect(host.pad().isEmpty()).toBe(true);

        canvas().dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true, bubbles: true }));
        expect(host.pad().isEmpty()).toBe(false);

        canvas().dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
        expect(host.pad().isEmpty()).toBe(true);
    });

    it('shows a value that arrives from outside', async () => {
        host.pad().draw('Ada');

        const url = host.value()!;

        host.pad().clear();
        host.value.set(url);
        await new Promise((r) => setTimeout(r, 50));
        await fixture.whenStable();

        expect(host.pad().isEmpty()).toBe(false);
    });

    it('binds to a signal form and a reactive form', async () => {
        const s = TestBed.createComponent(SignalFormHost);

        await s.whenStable();
        stroke(s.nativeElement.querySelector('canvas'), [
            [10, 10],
            [60, 40]
        ]);
        await s.whenStable();
        expect(s.componentInstance.model().sig).toMatch(/^data:image\/png/);

        const r = TestBed.createComponent(ReactiveHost);

        await r.whenStable();
        stroke(r.nativeElement.querySelector('canvas'), [
            [10, 10],
            [60, 40]
        ]);
        expect(r.componentInstance.control.value).toMatch(/^data:image\/png/);
    });

    it('brings a cleared signature back with undo', () => {
        stroke(canvas(), [
            [10, 10],
            [40, 30]
        ]);

        const pad = host.pad();

        canvas().dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }));
        expect(pad.isEmpty()).toBe(true);
        expect(pad.canUndo()).toBe(true);
        pad.undo();
        expect(pad.isEmpty()).toBe(false);
    });

    it('joins the strokes into one encoding when valueDebounce is set', async () => {
        const debounced = TestBed.createComponent(DebouncedHost);

        await debounced.whenStable();

        const pad = debounced.nativeElement.querySelector('canvas') as HTMLCanvasElement;

        stroke(pad, [
            [10, 10],
            [40, 30]
        ]);
        stroke(pad, [
            [50, 50],
            [80, 60]
        ]);

        // The events go out right away; the PNG waits for the pause.
        expect(debounced.componentInstance.events.filter((event) => event.type === 'draw').length).toBe(2);
        expect(debounced.componentInstance.value()).toBeNull();

        await new Promise((resolve) => setTimeout(resolve, 120));
        await debounced.whenStable();

        expect(debounced.componentInstance.value()).toMatch(/^data:image\/png/);
    });

    it('drops the pending write when the pad is destroyed before the pause ends', async () => {
        const debounced = TestBed.createComponent(DebouncedHost);

        await debounced.whenStable();
        stroke(debounced.nativeElement.querySelector('canvas'), [
            [10, 10],
            [40, 30]
        ]);

        const component = debounced.componentInstance;
        const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        debounced.destroy();
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(component.value()).toBeNull();
        expect(errors).not.toHaveBeenCalled();
        errors.mockRestore();
    });
});

import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { CircularAxis, GaugePointerEvent, LinearAxis } from '@openng/optimus-ui/types/gauges';
import { beforeEach, describe, expect, it } from 'vitest';
import { CircularGauge, CircularGaugeModule } from './circular-gauge';
import { LinearGauge, LinearGaugeModule } from './linear-gauge';

@Component({
    standalone: true,
    imports: [CircularGaugeModule, LinearGaugeModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div style="width: 300px">
            <p-circulargauge
                #cg
                [(value)]="speed"
                [minimum]="0"
                [maximum]="200"
                [animate]="false"
                title="Speed"
                [enablePointerDrag]="drag()"
                format="{value} km/h"
                [ranges]="[
                    { start: 0, end: 120, color: '#22c55e' },
                    { start: 120, end: 200, color: '#ef4444' }
                ]"
                (pointerChange)="changes.push($event)"
                (loaded)="loads = loads + 1"
            />
        </div>
        <div style="width: 300px">
            <p-circulargauge #multi [axes]="axes()" [animate]="false" />
        </div>
        <div style="width: 300px">
            <p-lineargauge #lg [(value)]="level" [animate]="false" [enablePointerDrag]="true" [container]="{ type: kind() }" orientation="horizontal" [ranges]="[{ start: 0, end: 50, color: '#22c55e' }]" />
        </div>
        <div style="width: 120px">
            <p-lineargauge #vg [animate]="false" orientation="vertical" [axes]="vaxes" />
        </div>
    `
})
class Host {
    readonly cg = viewChild.required<CircularGauge>('cg');
    readonly multi = viewChild.required<CircularGauge>('multi');
    readonly lg = viewChild.required<LinearGauge>('lg');
    readonly vg = viewChild.required<LinearGauge>('vg');
    readonly speed = signal(50);
    readonly level = signal(25);
    readonly drag = signal(false);
    readonly kind = signal<'normal' | 'thermometer' | 'roundedRectangle'>('normal');
    readonly changes: GaugePointerEvent[] = [];
    loads = 0;
    readonly axes = signal<CircularAxis[]>([
        {
            minimum: 0,
            maximum: 10,
            startAngle: -90,
            endAngle: 90,
            majorTicks: { interval: 5 },
            minorTicks: { interval: 1 },
            ranges: [{ start: 0, end: 5, color: 'green', startWidth: 4, endWidth: 12 }],
            pointers: [
                { value: 3, type: 'needle' },
                { value: 7, type: 'marker', markerShape: 'diamond' },
                { value: 5, type: 'rangeBar' }
            ],
            annotations: [{ content: 'Load', angle: 180, radius: '40%' }]
        }
    ]);
    readonly vaxes: LinearAxis[] = [{ minimum: 0, maximum: 100, pointers: [{ value: 40, type: 'marker', markerShape: 'triangle' }], majorTicks: { interval: 25 } }];
}

describe('gauges', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    const el = (n: number) => fixture.nativeElement.querySelectorAll('p-circulargauge, p-lineargauge')[n] as HTMLElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [Host], providers: [provideZonelessChangeDetection()] }).compileComponents();

        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        document.body.appendChild(fixture.nativeElement);
        await fixture.whenStable();
    });

    describe('circular', () => {
        it('draws the dial and names it', () => {
            const svg = el(0).querySelector('svg')!;

            expect(el(0).querySelector('.p-gauge-title')!.textContent).toBe('Speed');
            expect(svg.getAttribute('role')).toBe('meter');
            expect(svg.getAttribute('aria-valuenow')).toBe('50');
            expect(svg.getAttribute('aria-valuemax')).toBe('200');
            expect(svg.getAttribute('aria-valuetext')).toBe('50 km/h');
            expect(el(0).querySelectorAll('.p-gauge-range')).toHaveLength(2);
            expect(el(0).querySelectorAll('.p-gauge-tick:not(.p-gauge-tick-minor)').length).toBeGreaterThan(4);
            expect(el(0).querySelector('.p-gauge-label')!.textContent!.trim()).toBe('0 km/h');
            expect(host.loads).toBe(1);
        });

        it('turns the needle to the value', async () => {
            const angle = () => /rotate\(([-\d.]+) /.exec(el(0).querySelector('.p-gauge-pointer-needle path')!.getAttribute('transform')!)![1];

            // 200 degrees to 160 degrees clockwise is 320 of sweep: 50 of 200 is a quarter of it
            expect(Number(angle())).toBeCloseTo(200 + 80);

            host.speed.set(200);
            await fixture.whenStable();
            expect(Number(angle())).toBeCloseTo(520);
            expect(el(0).querySelector('svg')!.getAttribute('aria-valuenow')).toBe('200');
        });

        it('keeps to the range', async () => {
            host.speed.set(999);
            await fixture.whenStable();

            expect(el(0).querySelector('svg')!.getAttribute('aria-valuenow')).toBe('200');
        });

        it('draws several pointers, ranges, minor ticks and an annotation from axes', () => {
            const g = el(1);

            expect(g.querySelectorAll('.p-gauge-pointer')).toHaveLength(3);
            expect(g.querySelector('.p-gauge-pointer-needle')).toBeTruthy();
            expect(g.querySelector('.p-gauge-pointer-marker path')!.getAttribute('d')).toMatch(/^M0 -5L5 0L0 5L-5 0Z$/);
            expect(g.querySelector('.p-gauge-pointer-rangeBar path')!.getAttribute('d')).toMatch(/^M/);
            expect(g.querySelectorAll('.p-gauge-tick-minor').length).toBeGreaterThan(5);
            expect(g.querySelector('.p-gauge-annotation')!.textContent).toBe('Load');
            expect(g.querySelector('svg')!.getAttribute('role')).toBe('img');
            // a half dial is cropped to its own box
            const [, , w, h] = g.querySelector('svg')!.getAttribute('viewBox')!.split(' ').map(Number);

            expect(w).toBeGreaterThan(h);
        });

        it('paints a user color over the theme', () => {
            expect(el(0).querySelector<SVGPathElement>('.p-gauge-range')!.style.fill).toBe('rgb(34, 197, 94)');
        });

        it('moves with the keyboard only when it can be dragged', async () => {
            const svg = el(0).querySelector('svg')!;

            svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
            expect(host.speed()).toBe(50);

            host.drag.set(true);
            await fixture.whenStable();
            expect(svg.getAttribute('role')).toBe('slider');
            expect(svg.getAttribute('tabindex')).toBe('0');

            svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
            expect(host.speed()).toBeCloseTo(52);
            svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
            expect(host.speed()).toBe(200);
            svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }));
            expect(host.speed()).toBe(0);
            expect(host.changes.at(-1)).toEqual({ axisIndex: 0, pointerIndex: 0, value: 0, dragging: false });
        });

        it('follows a drag of the needle', async () => {
            host.drag.set(true);
            await fixture.whenStable();

            const svg = el(0).querySelector('svg')!;
            const needle = el(0).querySelector('.p-gauge-pointer-needle')!;
            const ctm = svg.getScreenCTM()!;
            // the point at 90 degrees (three o'clock) on the dial: the middle of the axis (200 to 520 degrees, so 450 is 78% of the way)
            const at = (deg: number, r = 60) => {
                const p = svg.createSVGPoint();

                p.x = 100 + r * Math.sin((deg * Math.PI) / 180);
                p.y = 100 - r * Math.cos((deg * Math.PI) / 180);

                return p.matrixTransform(ctm);
            };
            const down = at(280);
            const move = at(90);

            needle.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 3, pointerType: 'mouse', button: 0, clientX: down.x, clientY: down.y, bubbles: true, cancelable: true }));
            svg.dispatchEvent(new PointerEvent('pointermove', { pointerId: 3, pointerType: 'mouse', clientX: move.x, clientY: move.y, bubbles: true }));
            svg.dispatchEvent(new PointerEvent('pointerup', { pointerId: 3, pointerType: 'mouse', clientX: move.x, clientY: move.y, bubbles: true }));
            await fixture.whenStable();

            // 90 degrees is 90 + 360 - 200 = 250 degrees into a 320 degree sweep
            expect(host.speed()).toBeCloseTo((250 / 320) * 200, 0);
            expect(host.changes.some((c) => c.dragging)).toBe(true);
            expect(host.changes.at(-1)!.dragging).toBe(false);
        });

        it('sets a pointer from code', async () => {
            host.multi().setPointerValue(0, 0, 9);
            await fixture.whenStable();

            expect(el(1).querySelector('svg')).toBeTruthy();
            expect(/rotate\(([-\d.]+) /.exec(el(1).querySelector('.p-gauge-pointer-needle path')!.getAttribute('transform')!)![1]).toBe(String(-90 + 0.9 * 180));
        });
    });

    describe('linear', () => {
        it('fills a bar to the value, in a container, with a range', () => {
            const g = el(2);

            expect(g.querySelector('.p-gauge-container')).toBeTruthy();
            expect(g.querySelectorAll('.p-gauge-range')).toHaveLength(1);
            expect(g.querySelector('.p-gauge-pointer-bar path')!.getAttribute('d')).toMatch(/^M/);
            expect(g.querySelector('svg')!.getAttribute('role')).toBe('slider');
            expect(g.querySelector('svg')!.getAttribute('aria-orientation')).toBe('horizontal');
            expect(g.querySelector('svg')!.getAttribute('aria-valuenow')).toBe('25');
            expect(g.querySelectorAll('.p-gauge-label').length).toBe(11); // 0 to 100 in steps of 10
        });

        it('grows the bar with the value', async () => {
            const width = () => el(2).querySelector<SVGPathElement>('.p-gauge-pointer-bar path')!.getBBox().width;
            const before = width();

            host.level.set(100);
            await fixture.whenStable();

            expect(width()).toBeGreaterThan(before * 3);
        });

        it('draws a thermometer bulb and a rounded container', async () => {
            expect(el(2).querySelector('circle.p-gauge-container')).toBeNull();

            host.kind.set('thermometer');
            await fixture.whenStable();
            expect(el(2).querySelector('circle.p-gauge-container')).toBeTruthy();

            host.kind.set('roundedRectangle');
            await fixture.whenStable();
            expect(el(2).querySelector('circle.p-gauge-container')).toBeNull();
            expect(el(2).querySelector('path.p-gauge-container')!.getAttribute('d')).toContain('A');
        });

        it('lies the scale up for a vertical gauge, with a marker', () => {
            const g = el(3);
            const [, , w, h] = g.querySelector('svg')!.getAttribute('viewBox')!.split(' ').map(Number);

            expect(h).toBeGreaterThan(w);
            expect(g.querySelector('.p-gauge-pointer-marker path')!.getAttribute('transform')).toMatch(/rotate\(90\)/);
            expect(g.querySelectorAll('.p-gauge-label')).toHaveLength(5);
        });

        it('follows a drag and the keyboard', async () => {
            const svg = el(2).querySelector('svg')!;
            const bar = el(2).querySelector('.p-gauge-pointer-bar')!;
            const ctm = svg.getScreenCTM()!;
            const p = svg.createSVGPoint();

            p.x = 150; // half way along a scale 300 long
            p.y = 0;

            const target = p.matrixTransform(ctm);

            bar.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 5, pointerType: 'mouse', button: 0, clientX: target.x - 50, clientY: target.y, bubbles: true, cancelable: true }));
            svg.dispatchEvent(new PointerEvent('pointermove', { pointerId: 5, pointerType: 'mouse', clientX: target.x, clientY: target.y, bubbles: true }));
            svg.dispatchEvent(new PointerEvent('pointerup', { pointerId: 5, pointerType: 'mouse', clientX: target.x, clientY: target.y, bubbles: true }));
            await fixture.whenStable();

            expect(host.level()).toBeCloseTo(50, 0);

            svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageUp', bubbles: true, cancelable: true }));
            expect(host.level()).toBeCloseTo(60, 0);
        });
    });
});

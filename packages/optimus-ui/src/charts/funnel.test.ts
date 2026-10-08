import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ChartsModule } from './charts.module';

@Component({
    standalone: true,
    imports: [ChartsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <p-chart-svg [width]="400" [height]="320" id="funnel">
            <p-chart-funnel [data]="data" valueField="users" categoryField="step" sort="value-desc" [gap]="4" />
            <p-chart-legend />
            <p-chart-data-labels display="value" />
        </p-chart-svg>
        <p-chart-svg [width]="400" [height]="320" id="pyramid">
            <p-chart-pyramid [data]="data" valueField="users" categoryField="step" [mode]="mode()" />
            <p-chart-data-labels display="percentage" />
        </p-chart-svg>
    `
})
class Host {
    readonly mode = signal<'linear' | 'surface'>('linear');
    readonly data = [
        { step: 'Visited', users: 5000 },
        { step: 'Signed up', users: 1800 },
        { step: 'Activated', users: 900 },
        { step: 'Paid', users: 300 }
    ];
}

describe('funnel and pyramid series', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    const root = () => fixture.nativeElement as HTMLElement;
    const slices = (chart: string) => [...root().querySelectorAll(`#${chart} path[data-slot="chart-slice"]`)] as SVGPathElement[];
    const heightOf = (p: SVGPathElement) => p.getBBox().height;

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [Host], providers: [provideZonelessChangeDetection()] }).compileComponents();

        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        document.body.appendChild(fixture.nativeElement);
        await fixture.whenStable();
        await new Promise((r) => setTimeout(r, 800)); // the entry animation
        await fixture.whenStable();
    });

    it('draws one slice per item, stacked top to bottom, each as tall as its share', () => {
        const s = slices('funnel');

        expect(s).toHaveLength(4);
        expect(s.map((p) => p.dataset['category'])).toEqual(['Visited', 'Signed up', 'Activated', 'Paid']);

        const h = s.map(heightOf);

        expect(h[0]).toBeGreaterThan(h[1]);
        expect(h[1]).toBeGreaterThan(h[2]);
        expect(h[2]).toBeGreaterThan(h[3]);
        // 5000 : 1800 is about 2.8 : 1, less the gaps
        expect(h[0] / h[1]).toBeGreaterThan(2.5);
        expect(h[0] / h[1]).toBeLessThan(3.1);

        // the top of each slice is the bottom of the one above, less the gap
        const tops = s.map((p) => p.getBBox().y);

        expect(tops[1] - (tops[0] + h[0])).toBeCloseTo(4, 0);
    });

    it('narrows from the mouth to the neck', () => {
        const s = slices('funnel');

        expect(s[0].getBBox().width).toBeGreaterThan(s[3].getBBox().width * 2);
    });

    it('draws a pyramid as a triangle of the same slices, and by area when asked', async () => {
        const s = slices('pyramid');

        expect(s).toHaveLength(4);
        // the last slice is the widest: the base
        expect(s[3].getBBox().width).toBeGreaterThan(s[0].getBBox().width);

        const linear = s.map(heightOf);

        host.mode.set('surface');
        await fixture.whenStable();
        await new Promise((r) => setTimeout(r, 100));

        expect(slices('pyramid').map(heightOf)).not.toEqual(linear);
    });

    it('lists the slices in the legend and re-proportions the rest when one is hidden', async () => {
        const rows = [...root().querySelectorAll('#funnel .p-chart-legend [role="button"], #funnel .p-chart-legend button, #funnel .p-chart-legend-item')];

        expect(rows.length).toBeGreaterThanOrEqual(4);
        expect(root().querySelector('#funnel .p-chart-legend')!.textContent).toContain('Signed up');

        (rows[0] as HTMLElement).click();
        await fixture.whenStable();
        await new Promise((r) => setTimeout(r, 100));

        expect(slices('funnel')).toHaveLength(3);
    });

    it('labels each slice with its value, and shares in the pyramid', () => {
        const texts = [...root().querySelectorAll('#funnel text')].map((t) => t.textContent!.trim()).join(' ');

        // compact numbers, and a slice too thin for its label has none
        expect(texts).toContain('5K');
        expect(texts).toContain('1.8K');

        const pyramid = [...root().querySelectorAll('#pyramid text')].map((t) => t.textContent!.trim()).join(' ');

        expect(pyramid).toMatch(/%/);
    });
});

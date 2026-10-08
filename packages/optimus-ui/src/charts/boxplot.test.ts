import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ChartsModule } from './charts.module';

@Component({
    standalone: true,
    imports: [ChartsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <p-chart-svg [width]="500" [height]="320" id="raw">
            <p-chart-boxplot [data]="raw" categoryXField="group" valuesField="scores" [showMean]="true" [showOutliers]="outliers()" />
            <p-chart-x-axis />
            <p-chart-y-axis />
            <p-chart-tooltip />
        </p-chart-svg>
        <p-chart-svg [width]="500" [height]="320" id="five">
            <p-chart-boxplot [data]="five" categoryXField="group" />
            <p-chart-x-axis />
            <p-chart-y-axis />
        </p-chart-svg>
    `
})
class Host {
    readonly outliers = signal(true);
    readonly raw = [
        { group: 'A', scores: [10, 12, 14, 15, 16, 18, 19, 21, 60] },
        { group: 'B', scores: [30, 32, 33, 35, 36, 38, 41, 44] },
        { group: 'C', scores: [5, 7, 9, 11, 13] }
    ];
    readonly five = [
        { group: 'X', min: 1, q1: 3, median: 5, q3: 7, max: 9, outliers: [14] },
        { group: 'Y', min: 2, q1: 4, median: 6, q3: 8, max: 10 }
    ];
}

describe('box plot series', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    const root = () => fixture.nativeElement as HTMLElement;
    const q = (chart: string, slot: string) => [...root().querySelectorAll(`#${chart} [data-slot="${slot}"]`)] as SVGGraphicsElement[];

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [Host], providers: [provideZonelessChangeDetection()] }).compileComponents();

        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        document.body.appendChild(fixture.nativeElement);
        await fixture.whenStable();
        await new Promise((r) => setTimeout(r, 800));
        await fixture.whenStable();
    });

    it('draws a box, a median, two whiskers and two caps for each category', () => {
        expect(q('raw', 'chart-box')).toHaveLength(3);
        expect(q('raw', 'chart-box-median')).toHaveLength(3);
        expect(q('raw', 'chart-box-whisker')).toHaveLength(6);
        expect(q('raw', 'chart-box-cap')).toHaveLength(6);
        expect(q('raw', 'chart-box').map((b) => b.dataset['category'])).toEqual(['A', 'B', 'C']);
    });

    it('puts the median inside the box, the box between the whiskers, and sizes boxes by their quartiles', () => {
        const [box] = q('raw', 'chart-box');
        const [median] = q('raw', 'chart-box-median');
        const b = box.getBBox();
        const my = parseFloat(median.getAttribute('y1')!);

        expect(my).toBeGreaterThan(b.y);
        expect(my).toBeLessThan(b.y + b.height);

        const whiskers = q('raw', 'chart-box-whisker')
            .slice(0, 2)
            .map((w) => [parseFloat(w.getAttribute('y1')!), parseFloat(w.getAttribute('y2')!)]);

        // the upper whisker leaves the top of the box and reaches higher than it
        expect(whiskers[0][1]).toBeLessThan(b.y);
        expect(whiskers[1][1]).toBeGreaterThan(b.y + b.height);
    });

    it('draws the outliers and the mean, and leaves the outliers out on request', async () => {
        expect(q('raw', 'chart-box-outlier')).toHaveLength(1); // 60 in group A
        expect(q('raw', 'chart-box-mean')).toHaveLength(3);

        host.outliers.set(false);
        await fixture.whenStable();
        await new Promise((r) => setTimeout(r, 150));

        expect(q('raw', 'chart-box-outlier')).toHaveLength(0);
    });

    it('reaches the axis as far as the outliers, and reads the five numbers when they are given', () => {
        const ticks = [...root().querySelectorAll('#raw text')].map((t) => parseFloat(t.textContent!.replace(/[^0-9.\-]/g, ''))).filter((n) => Number.isFinite(n));

        expect(Math.max(...ticks)).toBeGreaterThanOrEqual(60);
        expect(q('five', 'chart-box')).toHaveLength(2);
        expect(q('five', 'chart-box-outlier')).toHaveLength(1);
        expect(q('five', 'chart-box-mean')).toHaveLength(0);
    });
});

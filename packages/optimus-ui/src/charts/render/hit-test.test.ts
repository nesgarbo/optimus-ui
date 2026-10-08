import { computed, signal } from '@angular/core';
import { describe, expect, it } from 'vitest';
import type { AxisScale, ChartTheme } from '@openng/optimus-ui/types/charts';
import type { ChartContext, SeriesRegistration } from '../charts-registry';
import type { ResolvedSeries, SeriesPoint } from '../charts-state';
import { defaultLightTheme, LIGHT_SERIES_PALETTE, seriesColorAt } from '../core/palette';
import { bandScale, linearScale } from '../core/scale';
import { hitTest, lowerBound, memoProjection } from './hit-test';
import type { DrawContext } from './scene';

const AREA = { x: 0, y: 0, width: 1000, height: 200 };

function context(hidden: ReadonlyMap<string, ReadonlySet<number>> = new Map()): ChartContext {
    return {
        isItemVisible: (datasetId: string, index: number) => !hidden.get(datasetId)?.has(index),
        hiddenItems: signal(hidden)
    } as unknown as ChartContext;
}

function drawContext(scales: Map<string, AxisScale>): DrawContext {
    return {
        area: AREA,
        scales,
        theme: defaultLightTheme as ChartTheme,
        isDark: false,
        fontFamily: 'sans-serif',
        fontSize: 12,
        direction: 'ltr',
        locale: 'en-US',
        progress: 1,
        hover: null,
        hoverEffect: null,
        isItemVisible: () => true,
        chartId: 'c',
        measureText: (text, size) => text.length * size * 0.6,
        seriesColor: (index) => seriesColorAt(LIGHT_SERIES_PALETTE, index)
    };
}

function series(id: string, type: ResolvedSeries['type'], points: SeriesPoint[], overrides: Partial<ResolvedSeries> = {}): ResolvedSeries {
    const registration: SeriesRegistration = { id, type, props: computed(() => ({})) as never, seriesIndex: signal(0) };

    return {
        id,
        type,
        seriesIndex: 0,
        points,
        categories: points.map((point) => point.category),
        yCategories: [],
        xAxisId: 'default',
        yAxisId: 'default',
        categoryAxis: 'x',
        continuousX: false,
        visible: true,
        registration,
        ...overrides
    };
}

/** A line over `count` categories, with value `i` at category `i`. */
function lineOf(count: number, id = 'line'): { entry: ResolvedSeries; scales: Map<string, AxisScale> } {
    const categories = Array.from({ length: count }, (_, i) => `c${i}`);
    const points = categories.map((category, i) => ({ category, value: i % 50, base: 0, dataIndex: i }));
    const scales = new Map<string, AxisScale>([
        ['x:default', bandScale(categories, { start: 0, end: 1000 }, 0, 0)],
        ['y:default', linearScale(0, 50, { start: 200, end: 0 })]
    ]);

    return { entry: series(id, 'line', points), scales };
}

describe('lowerBound', () => {
    const placed = [1, 3, 3, 3, 8].map((px) => ({ px }));

    it('finds the first position not before the target', () => {
        expect(lowerBound(placed, 0)).toBe(0);
        expect(lowerBound(placed, 3)).toBe(1);
        expect(lowerBound(placed, 4)).toBe(4);
        expect(lowerBound(placed, 9)).toBe(5);
        expect(lowerBound([], 1)).toBe(0);
    });
});

describe('hit-testing a line', () => {
    it('snaps to the point nearest in x', () => {
        const { entry, scales } = lineOf(10);
        const dc = drawContext(scales);
        const x = (scales.get('x:default') as AxisScale).scale('c6');
        const hit = hitTest(context(), [entry], dc, x + 3, 100);

        expect(hit?.datasetId).toBe('line');
        expect(hit?.index).toBe(6);
    });

    it('agrees with a scan of every point, wherever the pointer is', () => {
        const { entry, scales } = lineOf(2000);
        const dc = drawContext(scales);
        const xScale = scales.get('x:default') as AxisScale;
        const yScale = scales.get('y:default') as AxisScale;
        const centres = entry.points.map((point) => xScale.scale(point.category));
        const heights = entry.points.map((point) => yScale.scale(point.value as number));

        for (let x = 0; x <= 1000; x += 37) {
            // The reference is a plain scan: nearest in x, then nearest in y, then the earlier point.
            let best = 0;

            centres.forEach((centre, i) => {
                const dx = Math.abs(centre - x);
                const bestDx = Math.abs(centres[best] - x);

                if (dx < bestDx || (dx === bestDx && Math.abs(heights[i] - 100) < Math.abs(heights[best] - 100))) best = i;
            });

            expect(hitTest(context(), [entry], dc, x, 100)?.index).toBe(best);
        }
    });

    it('skips a hidden point and takes the next nearest', () => {
        const { entry, scales } = lineOf(10);
        const dc = drawContext(scales);
        const x = (scales.get('x:default') as AxisScale).scale('c4');

        expect(hitTest(context(), [entry], dc, x, 100)?.index).toBe(4);
        expect(hitTest(context(new Map([['line', new Set([4])]])), [entry], dc, x, 100)?.index).not.toBe(4);
    });

    it('ignores a point with no value', () => {
        const { entry, scales } = lineOf(5);
        const dc = drawContext(scales);
        const x = (scales.get('x:default') as AxisScale).scale('c2');
        const gap = { ...entry, points: entry.points.map((point) => (point.dataIndex === 2 ? { ...point, value: null } : point)) };

        expect(hitTest(context(), [gap], dc, x, 100)?.index).not.toBe(2);
    });

    it('answers nothing outside the plot area', () => {
        const { entry, scales } = lineOf(5);

        expect(hitTest(context(), [entry], drawContext(scales), -10, 100)).toBeNull();
    });

    it('breaks a tie in x between series on the distance in y', () => {
        const a = lineOf(5, 'a');
        const b = lineOf(5, 'b');
        const high = { ...b.entry, points: b.entry.points.map((point) => ({ ...point, value: 40 })) };
        const dc = drawContext(a.scales);
        const x = (a.scales.get('x:default') as AxisScale).scale('c1');

        // The pointer is level with series b (value 40 is near the top of the plot).
        expect(hitTest(context(), [a.entry, high], dc, x, 40)?.datasetId).toBe('b');
        // And near the bottom, series a (value 1) is the closer one.
        expect(hitTest(context(), [a.entry, high], dc, x, 195)?.datasetId).toBe('a');
    });
});

describe('hit-testing a scatter', () => {
    it('measures a real distance, so the pointer picks the point it is near in y as well', () => {
        const scales = new Map<string, AxisScale>([
            ['x:default', linearScale(0, 100, { start: 0, end: 1000 })],
            ['y:default', linearScale(0, 100, { start: 200, end: 0 })]
        ]);
        // Two points at the same x, far apart in y.
        const points: SeriesPoint[] = [
            { category: 'p0', value: 10, base: 0, dataIndex: 0, xValue: 50 },
            { category: 'p1', value: 90, base: 0, dataIndex: 1, xValue: 50 }
        ];
        const entry = series('s', 'scatter', points, { continuousX: true, categoryAxis: null });
        const dc = drawContext(scales);

        expect(hitTest(context(), [entry], dc, 500, 20)?.index).toBe(1);
        expect(hitTest(context(), [entry], dc, 500, 180)?.index).toBe(0);
    });
});

describe('memoProjection', () => {
    it('reuses the projection while its dependencies are the same objects', () => {
        const { entry } = lineOf(3);
        const dependency = {};
        let runs = 0;
        const compute = () => ({ run: ++runs });

        const first = memoProjection(entry, 'kind', [dependency], compute);
        const second = memoProjection(entry, 'kind', [dependency], compute);

        expect(second).toBe(first);
        expect(runs).toBe(1);
    });

    it('recomputes when a dependency is a different object', () => {
        const { entry } = lineOf(3);
        let runs = 0;
        const compute = () => ({ run: ++runs });

        memoProjection(entry, 'kind', [{}], compute);
        memoProjection(entry, 'kind', [{}], compute);

        expect(runs).toBe(2);
    });

    it('keeps one slot per kind of projection', () => {
        const { entry } = lineOf(3);
        const dependency = {};

        const a = memoProjection(entry, 'a', [dependency], () => ({}));
        const b = memoProjection(entry, 'b', [dependency], () => ({}));

        expect(a).not.toBe(b);
        expect(memoProjection(entry, 'a', [dependency], () => ({}))).toBe(a);
    });

    it('does not re-project the line between pointer moves over the same scales', () => {
        const { entry, scales } = lineOf(3000);
        const dc = drawContext(scales);
        // A scale whose `scale` is counted shows whether the points were placed again.
        const xScale = scales.get('x:default') as AxisScale;
        let calls = 0;
        const counted = { ...xScale, scale: (value: unknown) => (calls++, xScale.scale(value as never)) } as AxisScale;
        const countedScales = new Map(scales).set('x:default', counted);
        const cdc = drawContext(countedScales);

        hitTest(context(), [entry], cdc, 100, 100);
        const afterFirst = calls;

        hitTest(context(), [entry], cdc, 400, 100);
        hitTest(context(), [entry], cdc, 700, 100);

        expect(afterFirst).toBeGreaterThanOrEqual(3000);
        expect(calls).toBe(afterFirst);
        void dc;
    });
});

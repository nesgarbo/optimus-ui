import { describe, expect, it } from 'vitest';
import { aggregate, aggregateOhlc, decimateSeriesPoints } from './decimate';

type Point = { value: number | null; xValue?: number | null; dataIndex: number };

const SETTINGS = { algorithm: 'lttb' as const, samples: 50, threshold: 100 };

function wave(count: number): Point[] {
    return Array.from({ length: count }, (_, i) => ({ value: Math.sin(i / 7) * 10, dataIndex: i }));
}

describe('decimateSeriesPoints', () => {
    it('leaves a series at or under the threshold alone', () => {
        const points = wave(100);

        expect(decimateSeriesPoints(points, SETTINGS, false, 'line')).toBe(points);
    });

    it('thins a long series down to about the requested sample count', () => {
        const kept = decimateSeriesPoints(wave(2000), SETTINGS, false, 'line');

        expect(kept.length).toBeLessThanOrEqual(50);
        expect(kept.length).toBeGreaterThan(10);
        // The ends always survive, so the line still spans the whole domain.
        expect(kept[0].dataIndex).toBe(0);
        expect(kept[kept.length - 1].dataIndex).toBe(1999);
    });

    it('keeps the datum each surviving point came from', () => {
        const points = wave(500);
        const kept = decimateSeriesPoints(points, SETTINGS, false, 'line');

        for (const point of kept) expect(points[point.dataIndex]).toBe(point);
    });

    it('keeps a null value, which is a gap in the line, instead of drawing across it', () => {
        const points = wave(500);

        points[250] = { value: null, dataIndex: 250 };

        const kept = decimateSeriesPoints(points, SETTINGS, false, 'line');

        expect(kept.some((point) => point.dataIndex === 250 && point.value === null)).toBe(true);
    });

    it('places a continuous-x series by its x value rather than by its position', () => {
        // x runs backwards against the array order: by position the spike is in the middle, by x it
        // is at the start. LTTB keeps it either way, but only a correct x makes the buckets sane.
        const points: Point[] = Array.from({ length: 400 }, (_, i) => ({ value: i === 399 ? 1000 : 1, xValue: 400 - i, dataIndex: i }));
        const kept = decimateSeriesPoints(points, SETTINGS, true, 'scatter');

        expect(kept.some((point) => point.value === 1000)).toBe(true);
    });

    it('drops a continuous-x point that has no x, since it cannot be placed', () => {
        const points: Point[] = Array.from({ length: 300 }, (_, i) => ({ value: i, xValue: i === 5 ? null : i, dataIndex: i }));
        const kept = decimateSeriesPoints(points, { ...SETTINGS, samples: 299 }, true, 'scatter');

        expect(kept.some((point) => point.dataIndex === 5)).toBe(false);
    });

    it('does not thin the families whose points are summaries of their own', () => {
        for (const type of ['heatmap', 'boxplot', 'candlestick']) {
            const points = wave(500);

            expect(decimateSeriesPoints(points, SETTINGS, false, type)).toBe(points);
        }
    });

    it('returns the series as it is when every value is null', () => {
        const points: Point[] = Array.from({ length: 300 }, (_, i) => ({ value: null, dataIndex: i }));

        expect(decimateSeriesPoints(points, SETTINGS, false, 'line')).toBe(points);
    });

    it('supports the min-max algorithm', () => {
        const kept = decimateSeriesPoints(wave(2000), { algorithm: 'min-max', samples: 40, threshold: 100 }, false, 'line');

        expect(kept.length).toBeLessThanOrEqual(40);
    });
});

describe('aggregate on large input', () => {
    // `Math.min(...values)` throws a RangeError once the list passes the engine's argument limit.
    const huge = Array.from({ length: 400_000 }, (_, i) => i - 200_000);

    it('finds the min and the max of a very long list', () => {
        expect(aggregate(huge, 'min')).toBe(-200_000);
        expect(aggregate(huge, 'max')).toBe(199_999);
    });

    it('combines a very long run of candles', () => {
        const candles = huge.map((value) => ({ open: value, high: value + 1, low: value - 1, close: value }));

        expect(aggregateOhlc(candles)).toEqual({ open: -200_000, high: 200_000, low: -200_001, close: 199_999 });
    });
});

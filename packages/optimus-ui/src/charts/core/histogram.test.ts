import { describe, expect, it } from 'vitest';
import { binCount, histogram } from './histogram';

describe('histogram', () => {
    it('counts into equal bins, the top edge in the last one', () => {
        const bins = histogram([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], { bins: 2 });

        expect(bins.map((b) => [b.x0, b.x1, b.count])).toEqual([
            [0, 5, 5],
            [5, 10, 6]
        ]);
        expect(bins[0].label).toBe('0–5');
    });

    it('densities integrate to one, also for bins of different widths', () => {
        const bins = histogram([1, 2, 2, 3, 3, 3, 8, 9], { thresholds: [4] });
        const area = bins.reduce((s, b) => s + b.density * (b.x1 - b.x0), 0);

        expect(area).toBeCloseTo(1);
        expect(bins.map((b) => b.count)).toEqual([6, 2]);
    });

    it('ignores what is not a number, and values outside the domain', () => {
        const bins = histogram([1, 2, NaN, 'x', null, Infinity, 50, -50], { domain: [0, 10], bins: 2 });

        expect(bins.reduce((s, b) => s + b.count, 0)).toBe(2);
        expect(histogram([])).toEqual([]);
        expect(histogram(['a', NaN])).toEqual([]);
    });

    it('keeps one bin when every value is equal', () => {
        const bins = histogram([5, 5, 5]);

        expect(bins).toHaveLength(1);
        expect(bins[0]).toMatchObject({ count: 3, x0: 4.5, x1: 5.5, density: 3 / 3 / 1 });
    });

    it('rounds the edges when asked', () => {
        const bins = histogram([3, 14, 27, 41, 56, 68, 79, 93], { bins: 5, nice: true });

        expect(bins[0].x0).toBe(0);
        expect(bins.at(-1)!.x1).toBe(100);
        expect(bins.map((b) => b.x1 - b.x0).every((w) => w === 20)).toBe(true);
    });

    it('labels as asked', () => {
        expect(histogram([1, 9], { bins: 1, label: (a, b) => `${a} to ${b}` })[0].label).toBe('1 to 9');
    });
});

describe('binCount', () => {
    const sorted = Array.from({ length: 100 }, (_, i) => i);

    it('follows the rules', () => {
        expect(binCount(sorted, 'sturges')).toBe(8);
        expect(binCount(sorted, 'sqrt')).toBe(10);
        expect(binCount(sorted, 'scott')).toBeGreaterThan(3);
        expect(binCount(sorted, 'freedman-diaconis')).toBeGreaterThan(3);
        expect(binCount([5], 'sturges')).toBe(1);
        expect(binCount([5, 5, 5], 'scott')).toBe(1);
    });

    it('never asks for more bins than it can draw', () => {
        expect(
            binCount(
                Array.from({ length: 1e6 }, (_, i) => i),
                'sqrt'
            )
        ).toBe(200);
    });
});

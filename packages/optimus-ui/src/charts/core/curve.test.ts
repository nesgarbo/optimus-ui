import { describe, expect, it } from 'vitest';
import type { ComputedPoint } from '@openng/optimus-ui/types/charts';
import { areaPath, baselineOf, curvePath, isPlaced, linearPath, monotonePath, splinePath, splitAtGaps, stepAfterPath, stepBeforePath, stepPath } from './curve';

const pts = [
    { x: 0, y: 10 },
    { x: 10, y: 0 },
    { x: 20, y: 10 }
];

describe('path generators', () => {
    it('emit an empty path for no points', () => {
        for (const fn of [linearPath, monotonePath, splinePath, stepPath, stepBeforePath, stepAfterPath]) expect(fn([])).toBe('');
        expect(areaPath([], [])).toBe('');
    });

    it('draws straight segments for a linear curve', () => {
        expect(linearPath(pts)).toBe('M 0 10 L 10 0 L 20 10');
        expect(linearPath([pts[0]])).toBe('M 0 10');
    });

    it('draws the three step flavours at the right corners', () => {
        const two = [pts[0], pts[1]];

        expect(stepPath(two)).toBe('M 0 10 L 5 10 L 5 0 L 10 0');
        expect(stepBeforePath(two)).toBe('M 0 10 L 0 0 L 10 0');
        expect(stepAfterPath(two)).toBe('M 0 10 L 10 10 L 10 0');
    });

    it('uses cubic segments for smooth and spline, and degrades with fewer than three points', () => {
        expect(monotonePath(pts)).toMatch(/^M 0 10( C [^C]+){2}$/);
        expect(splinePath(pts)).toMatch(/^M 0 10( C [^C]+){2}$/);
        expect(monotonePath(pts.slice(0, 2))).toBe(linearPath(pts.slice(0, 2)));
        expect(splinePath(pts, 0)).toBe(linearPath(pts));
    });

    it('never lets a monotone curve overshoot the data', () => {
        const rising = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 20, y: 10 },
            { x: 30, y: 10 }
        ];
        const numbers = (monotonePath(rising).match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
        const ys = numbers.filter((_, i) => i % 2 === 1);

        expect(Math.min(...ys)).toBeGreaterThanOrEqual(0);
        expect(Math.max(...ys)).toBeLessThanOrEqual(10);
    });

    it('dispatches on the curve type and defaults to linear', () => {
        expect(curvePath(pts)).toBe(linearPath(pts));
        expect(curvePath(pts, 'step')).toBe(stepPath(pts));
        expect(curvePath(pts, 'step-before')).toBe(stepBeforePath(pts));
        expect(curvePath(pts, 'step-after')).toBe(stepAfterPath(pts));
        expect(curvePath(pts, 'smooth')).toBe(monotonePath(pts));
        expect(curvePath(pts, 'spline', 0.3)).toBe(splinePath(pts, 0.3));
    });
});

describe('areaPath', () => {
    it('closes against a flat baseline walking the lower edge in reverse', () => {
        const area = areaPath(pts, baselineOf(pts, 50));

        expect(area).toBe('M 0 10 L 10 0 L 20 10 L 20 50 L 10 50 L 0 50 Z');
    });

    it('closes straight away with no lower edge', () => {
        expect(areaPath(pts, [])).toBe(`${linearPath(pts)} Z`);
    });
});

describe('gaps', () => {
    const point = (x: number, y: number, value: number | null) => ({ x, y, value }) as unknown as ComputedPoint;

    it('treats a missing value or a NaN position as not placed', () => {
        expect(isPlaced(point(1, 2, 3))).toBe(true);
        expect(isPlaced(point(1, 2, null))).toBe(false);
        expect(isPlaced(point(NaN, 2, 3))).toBe(false);
        expect(isPlaced(point(1, Infinity, 3))).toBe(false);
    });

    it('splits a series into runs at the gaps', () => {
        const runs = splitAtGaps([point(0, 0, 1), point(1, 1, 2), point(2, NaN, 3), point(3, 3, 4), point(4, 4, null)]);

        expect(runs.map((r) => r.length)).toEqual([2, 1]);
        expect(splitAtGaps([])).toEqual([]);
    });
});

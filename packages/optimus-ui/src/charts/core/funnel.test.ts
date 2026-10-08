import { describe, expect, it } from 'vitest';
import { insideSlice, layoutFunnel, outlineWidth, polygonPathData } from './funnel';

const box = { x: 10, y: 20, width: 200, height: 300 };

describe('outline', () => {
    it('is the mouth at the top of a funnel, narrows through the taper and keeps the neck', () => {
        const o = { shape: 'funnel' as const, ...box, neckWidth: 0.25, neckHeight: 0.2 };

        expect(outlineWidth(o, 0)).toBe(200);
        expect(outlineWidth(o, 120)).toBe(125); // half way down the taper, which ends at 240
        expect(outlineWidth(o, 240)).toBe(50);
        expect(outlineWidth(o, 300)).toBe(50);
    });

    it('is a point at the top of a pyramid, and the base at the bottom', () => {
        expect(outlineWidth({ shape: 'pyramid', ...box }, 0)).toBe(0);
        expect(outlineWidth({ shape: 'pyramid', ...box }, 150)).toBe(100);
        expect(outlineWidth({ shape: 'pyramid', ...box }, 300)).toBe(200);
        expect(outlineWidth({ shape: 'pyramid', ...box, inverted: true }, 0)).toBe(200);
    });
});

describe('layoutFunnel', () => {
    it('stacks slices as tall as their share, from the top of the box', () => {
        const slices = layoutFunnel([50, 30, 20], { shape: 'funnel', ...box, neckHeight: 0 });

        expect(slices.map((s) => Math.round(s.y1 - s.y0))).toEqual([150, 90, 60]);
        expect(slices[0].y0).toBe(20);
        expect(slices[2].y1).toBeCloseTo(320);
        // each slice starts where the last ended
        expect(slices[1].y0).toBeCloseTo(slices[0].y1);
    });

    it('takes the gap out of the heights and not out of the total', () => {
        const slices = layoutFunnel([1, 1], { shape: 'funnel', ...box, gap: 10 });

        expect(slices[1].y0 - slices[0].y1).toBeCloseTo(10);
        expect(slices[0].y1 - slices[0].y0).toBeCloseTo(145);
        expect(slices[1].y1).toBeCloseTo(320);
    });

    it('draws a slice that crosses the end of the taper with a corner there', () => {
        const [slice] = layoutFunnel([1], { shape: 'funnel', ...box, neckWidth: 0.25, neckHeight: 0.2 });

        expect(slice.polygon).toHaveLength(6);
        expect(slice.polygon[1][1]).toBeCloseTo(260); // 20 + 240
        expect(slice.polygon[0]).toEqual([10, 20]);
        expect(slice.polygon[5]).toEqual([210, 20]);
        const [a, b] = layoutFunnel([1, 1], { shape: 'funnel', ...box, neckHeight: 0.2 });

        expect(a.polygon).toHaveLength(4);
        expect(b.polygon.length).toBeGreaterThanOrEqual(4);
    });

    it('makes the top slice of a pyramid a triangle, and a slice a trapezoid after it', () => {
        const [top, bottom] = layoutFunnel([1, 3], { shape: 'pyramid', ...box });

        expect(top.polygon[0][0]).toBeCloseTo(top.polygon[3][0]); // both top corners at the apex
        expect(top.midWidth).toBeLessThan(bottom.midWidth);
        expect(bottom.polygon).toHaveLength(4);
        expect(bottom.polygon[2][0] - bottom.polygon[1][0]).toBeCloseTo(200); // the base of the pyramid
    });

    it('lets a pyramid read by area: the share of the area, not of the height', () => {
        const linear = layoutFunnel([1, 3], { shape: 'pyramid', ...box, mode: 'linear' });
        const surface = layoutFunnel([1, 3], { shape: 'pyramid', ...box, mode: 'surface' });
        const area = (s: { polygon: [number, number][] }) => {
            let a = 0;

            s.polygon.forEach(([x, y], i) => {
                const [x2, y2] = s.polygon[(i + 1) % s.polygon.length];

                a += x * y2 - x2 * y;
            });

            return Math.abs(a) / 2;
        };

        expect(linear[0].y1 - linear[0].y0).toBeCloseTo(75);
        // in a surface pyramid the first slice is a quarter of the area, and so of the whole triangle
        expect(area(surface[0]) / (area(surface[0]) + area(surface[1]))).toBeCloseTo(0.25, 3);
        expect(area(linear[0]) / (area(linear[0]) + area(linear[1]))).toBeLessThan(0.1);
    });

    it('turns a pyramid over', () => {
        const [first] = layoutFunnel([1, 1], { shape: 'pyramid', ...box, inverted: true });

        expect(first.polygon[0][0]).toBeCloseTo(10); // the top of the first slice is the base: full width
        expect(first.midWidth).toBeGreaterThan(100);
    });

    it('treats missing and negative values as no height, and an empty input as nothing', () => {
        expect(layoutFunnel([], { shape: 'funnel', ...box })).toEqual([]);
        expect(layoutFunnel([0, 0], { shape: 'funnel', ...box })).toEqual([]);
        expect(layoutFunnel([NaN, -4, 10], { shape: 'funnel', ...box }).map((s) => Math.round(s.y1 - s.y0))).toEqual([0, 0, 300]);
    });
});

describe('hit testing', () => {
    it('finds the slice under a point, and nothing outside the outline', () => {
        const slices = layoutFunnel([1, 1], { shape: 'funnel', ...box, neckHeight: 0 });

        expect(insideSlice(slices[0], 110, 80)).toBe(true);
        expect(insideSlice(slices[1], 110, 80)).toBe(false);
        expect(insideSlice(slices[1], 110, 250)).toBe(true);
        // left of the narrowing outline
        expect(insideSlice(slices[1], 12, 300)).toBe(false);
        expect(insideSlice(slices[0], 5, 20)).toBe(false);
        expect(insideSlice(slices[0], 110, 5)).toBe(false);
    });

    it('writes a path', () => {
        expect(
            polygonPathData([
                [0, 0],
                [10.123, 5],
                [10, 10]
            ])
        ).toBe('M0 0L10.12 5L10 10Z');
        expect(polygonPathData([])).toBe('');
    });
});

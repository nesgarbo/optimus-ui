import { describe, expect, it } from 'vitest';
import { angleFrom, angleToValue, arcBounds, arcLine, axisTicks, formatLabel, markerShapePath, needlePath, niceInterval, polar, rangeColorAt, resolveLength, ringPath, sweepOf, taperedPath, valueToAngle, viewBoxOf } from './gauge-engine';

const near = (a: { x: number; y: number }, x: number, y: number) => {
    expect(a.x).toBeCloseTo(x, 3);
    expect(a.y).toBeCloseTo(y, 3);
};

describe('dial geometry', () => {
    it("reads angles from twelve o'clock, clockwise", () => {
        near(polar(100, 100, 50, 0), 100, 50);
        near(polar(100, 100, 50, 90), 150, 100);
        near(polar(100, 100, 50, 180), 100, 150);
        near(polar(100, 100, 50, 270), 50, 100);
        expect(angleFrom(100, 100, 150, 100)).toBeCloseTo(90);
        expect(angleFrom(100, 100, 100, 50)).toBeCloseTo(0);
        expect(angleFrom(100, 100, 50, 100)).toBeCloseTo(270);
    });

    it('sweeps the short way round the gap, or all the way when start equals end', () => {
        expect(sweepOf(200, 160)).toBe(320);
        expect(sweepOf(-90, 90)).toBe(180);
        expect(sweepOf(0, 0)).toBe(360);
        expect(sweepOf(0, 360)).toBe(360);
    });

    it('maps values to angles and back', () => {
        expect(valueToAngle(0, 0, 100, 200, 160)).toBe(200);
        expect(valueToAngle(100, 0, 100, 200, 160)).toBe(520);
        expect(valueToAngle(50, 0, 100, -90, 90)).toBe(0);
        expect(valueToAngle(500, 0, 100, -90, 90)).toBe(90); // clamped
        expect(valueToAngle(25, 0, 100, 0, 0, false)).toBe(-90); // anticlockwise
        expect(angleToValue(0, 0, 100, -90, 90)).toBeCloseTo(50);
        expect(angleToValue(45, 0, 100, -90, 90)).toBeCloseTo(75);
        expect(angleToValue(180, 0, 100, -90, 90)).toBe(0); // dead centre of the gap: snaps to the start
        expect(angleToValue(200, 0, 100, 200, 160)).toBeCloseTo(0);
        expect(angleToValue(520 % 360, 0, 100, 200, 160)).toBeCloseTo(100);
    });
});

describe('paths', () => {
    it('draws a ring segment with the right arc flags', () => {
        const d = ringPath(100, 100, 60, 80, -90, 90);

        expect(d.startsWith('M')).toBe(true);
        expect(d.endsWith('Z')).toBe(true);
        expect(d).toMatch(/A80 80 0 0 1/); // 180 degrees is not "large"
        expect(ringPath(100, 100, 60, 80, 0, 270)).toMatch(/A80 80 0 1 1/);
        expect(ringPath(100, 100, 60, 80, 90, 90)).toBe('');
        expect(ringPath(100, 100, 60, 80, 0, 360).match(/A80/g)).toHaveLength(2);
    });

    it('draws the axis line, closed when it is a full circle', () => {
        expect(arcLine(100, 100, 80, -90, 90)).toMatch(/^M20 100A80 80 0 0 1 180 100$/);
        expect(arcLine(100, 100, 80, 0, 360).match(/A80/g)).toHaveLength(2);
    });

    it('tapers a band', () => {
        const d = taperedPath(100, 100, 80, 4, 20, 0, 90);

        expect(d.startsWith('M')).toBe(true);
        expect(d.split('L').length).toBeGreaterThan(10);
        expect(taperedPath(100, 100, 80, 10, 10, 0, 90)).toBe(ringPath(100, 100, 70, 80, 0, 90));
    });

    it('draws a needle, markers and boxes', () => {
        expect(needlePath(100, 100, 70, 6, 10)).toBe('M97 110L97 100L100 30L103 100L103 110Z');
        expect(markerShapePath('triangle', 10, 8)).toBe('M0 -4L5 4H-5Z');
        expect(markerShapePath('rectangle', 4, 4)).toBe('M-2 -2H2V2H-2Z');
        expect(markerShapePath('circle', 6, 6)).toContain('A3 3');

        const b = arcBounds(100, 100, 50, -90, 90);

        expect(b.minX).toBeCloseTo(50);
        expect(b.maxX).toBeCloseTo(150);
        expect(b.minY).toBeCloseTo(50); // passes through 0 degrees
        expect(b.maxY).toBeCloseTo(100);
        expect(viewBoxOf(b)).toBe('50 50 100 50');
    });
});

describe('ticks, labels and lengths', () => {
    it('picks round intervals', () => {
        expect(niceInterval(100)).toBe(10);
        expect(niceInterval(1)).toBeCloseTo(0.1);
        expect(niceInterval(240)).toBe(20);
        expect(niceInterval(0)).toBe(1);
    });

    it('lists major and minor ticks without floating-point tails', () => {
        const t = axisTicks(0, 100, 20, 5);

        expect(t.major).toEqual([0, 20, 40, 60, 80, 100]);
        expect(t.minor).toHaveLength(21 - 6);
        expect(t.minor).not.toContain(20);
        expect(axisTicks(0, 1, 0.1).major).toHaveLength(11);
        expect(axisTicks(0, 1, 0.1).major[3]).toBe(0.3);
        expect(axisTicks(0, 100).major[1]).toBe(10);
    });

    it('formats labels', () => {
        expect(formatLabel(25, '{value}°C', 'en')).toBe('25°C');
        expect(formatLabel(1234.5, undefined, 'en')).toBe('1,234.5');
        expect(formatLabel(5, (v) => `<${v}>`)).toBe('<5>');
    });

    it('resolves lengths and range colors', () => {
        expect(resolveLength('80%', 50, 0)).toBe(40);
        expect(resolveLength(12, 50, 0)).toBe(12);
        expect(resolveLength('7px', 50, 0)).toBe(7);
        expect(resolveLength(undefined, 50, 9)).toBe(9);
        expect(resolveLength('x', 50, 9)).toBe(9);
        expect(
            rangeColorAt(
                75,
                [
                    { start: 0, end: 50, color: 'g' },
                    { start: 50, end: 100, color: 'r' }
                ],
                'x'
            )
        ).toBe('r');
        expect(rangeColorAt(150, [{ start: 0, end: 50, color: 'g' }], 'x')).toBe('x');
    });
});

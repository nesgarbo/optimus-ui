import { describe, expect, it } from 'vitest';
import { bandScale, isDrawable, linearScale, logScale, padDomain, sortTicks, timeScale, toNumber, unionCategories } from './scale';

describe('toNumber', () => {
    it('reads numbers, numeric strings and dates, and rejects the rest', () => {
        expect(toNumber(3)).toBe(3);
        expect(toNumber(' 4.5 ')).toBe(4.5);
        expect(toNumber(new Date(1000))).toBe(1000);
        expect(toNumber('')).toBeNull();
        expect(toNumber('abc')).toBeNull();
        expect(toNumber(NaN)).toBeNull();
        expect(toNumber(Infinity)).toBeNull();
        expect(toNumber(null)).toBeNull();
        expect(toNumber({})).toBeNull();
    });
});

describe('linearScale', () => {
    it('maps the domain onto the range and back', () => {
        const scale = linearScale(0, 10, { start: 0, end: 100 });

        expect(scale.scale(0)).toBe(0);
        expect(scale.scale(5)).toBe(50);
        expect(scale.scale('10')).toBe(100);
        expect(scale.invert(25)).toBe(2.5);
    });

    it('supports an inverted range, as a y axis uses', () => {
        const scale = linearScale(0, 10, { start: 100, end: 0 });

        expect(scale.scale(0)).toBe(100);
        expect(scale.scale(10)).toBe(0);
    });

    it('returns NaN for a value that is not a number', () => {
        expect(linearScale(0, 1, { start: 0, end: 1 }).scale('x')).toBeNaN();
    });

    it('widens a flat domain so a flat series lands mid plot', () => {
        const scale = linearScale(5, 5, { start: 0, end: 100 });

        expect(scale.domain[0]).toBeLessThan(5);
        expect(scale.domain[1]).toBeGreaterThan(5);
        expect(scale.scale(5)).toBeCloseTo(50);
        expect(linearScale(0, 0, { start: 0, end: 10 }).domain).toEqual([-1, 1]);
    });

    it('falls back to 0..1 on a non finite domain', () => {
        expect(linearScale(NaN, 3, { start: 0, end: 10 }).domain).toEqual([0, 1]);
    });
});

describe('logScale', () => {
    it('places each decade at an even distance', () => {
        const scale = logScale(1, 1000, { start: 0, end: 300 });

        expect(scale.scale(1)).toBeCloseTo(0);
        expect(scale.scale(10)).toBeCloseTo(100);
        expect(scale.scale(1000)).toBeCloseTo(300);
        expect(scale.invert(200)).toBeCloseTo(100);
    });

    it('clamps a non positive lower bound and refuses non positive values', () => {
        const scale = logScale(0, 100, { start: 0, end: 10 });

        expect(scale.domain[0]).toBeGreaterThan(0);
        expect(scale.scale(0)).toBeNaN();
        expect(scale.scale(-5)).toBeNaN();
    });
});

describe('timeScale', () => {
    it('accepts dates for the domain and for the values', () => {
        const scale = timeScale(new Date(0), new Date(1000), { start: 0, end: 10 });

        expect(scale.type).toBe('time');
        expect(scale.scale(new Date(500))).toBe(5);
        expect(scale.scale(1000)).toBe(10);
    });
});

describe('bandScale', () => {
    const scale = bandScale(['a', 'b', 'c'], { start: 0, end: 300 }, 0, 0);

    it('gives each category an equal step and centres the scaled value in the band', () => {
        expect(scale.step).toBe(100);
        expect(scale.bandwidth).toBe(100);
        expect(scale.scale('a')).toBe(50);
        expect(scale.scale('c')).toBe(250);
        expect(scale.bandStart('b')).toBe(100);
    });

    it('returns NaN for an unknown category', () => {
        expect(scale.scale('z')).toBeNaN();
        expect(scale.bandStart('z')).toBeNaN();
    });

    it('resolves a pixel back to the category under it, clamped to the ends', () => {
        expect(scale.invert(10)).toBe('a');
        expect(scale.invert(150)).toBe('b');
        expect(scale.invert(-50)).toBe('a');
        expect(scale.invert(999)).toBe('c');
        expect(scale.indexAt(299)).toBe(2);
    });

    it('keeps a positive bandwidth on an inverted range', () => {
        const inverted = bandScale(['a', 'b'], { start: 200, end: 0 }, 0, 0);

        expect(inverted.bandwidth).toBe(100);
        expect(inverted.scale('a')).toBe(150);
        expect(inverted.bandStart('a')).toBe(100);
    });

    it('collapses duplicated categories onto the first band and applies padding', () => {
        const padded = bandScale(['a', 'b', 'a'], { start: 0, end: 100 }, 0.5, 0);

        expect(padded.scale('a')).toBe(padded.bandStart('a') + padded.bandwidth / 2);
        expect(padded.bandwidth).toBeCloseTo(padded.step * 0.5);
    });

    it('does not divide by zero with no categories', () => {
        const empty = bandScale([], { start: 0, end: 100 });

        expect(Number.isFinite(empty.step)).toBe(true);
    });
});

describe('scale helpers', () => {
    it('pads a domain by a fraction of its span', () => {
        expect(padDomain(0, 10, 0.1)).toEqual([-1, 11]);
        expect(padDomain(5, 5, 0.1)).toEqual([4.5, 5.5]);
        expect(padDomain(0, 0, 0.1)).toEqual([-0.1, 0.1]);
    });

    it('tells a drawable pixel from a NaN one', () => {
        expect(isDrawable(3)).toBe(true);
        expect(isDrawable(NaN)).toBe(false);
        expect(isDrawable(Infinity)).toBe(false);
    });

    it('unions categories in first seen order', () => {
        expect(
            unionCategories([
                ['a', 'b'],
                ['b', 'c'],
                ['a', 'd']
            ])
        ).toEqual(['a', 'b', 'c', 'd']);
    });

    it('sorts tick values numerically', () => {
        expect(sortTicks([10, 2, 33, 1])).toEqual([1, 2, 10, 33]);
    });
});

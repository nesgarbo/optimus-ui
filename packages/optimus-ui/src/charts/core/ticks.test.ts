import { describe, expect, it } from 'vitest';
import { addUnit, floorToUnit, linearTicks, logTicks, niceDomain, niceStep, pickTimeStep, roundToStep, skipCollisions, timeTicks } from './ticks';

describe('niceStep', () => {
    it('snaps to the nearest 1, 2, 5 or 10 times a power of ten', () => {
        expect(niceStep(1)).toBe(1);
        expect(niceStep(2.5)).toBe(2);
        expect(niceStep(3.7)).toBe(5);
        expect(niceStep(8)).toBe(10);
        expect(niceStep(0.03)).toBeCloseTo(0.02);
        expect(niceStep(430)).toBe(500);
    });

    it('falls back to 1 for a step that is not usable', () => {
        expect(niceStep(0)).toBe(1);
        expect(niceStep(-4)).toBe(1);
        expect(niceStep(NaN)).toBe(1);
    });
});

describe('linearTicks', () => {
    it('lands on round numbers that cover the domain', () => {
        const ticks = linearTicks(0, 100, 5);

        expect(ticks[0]).toBeLessThanOrEqual(0);
        expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(100);
        expect(ticks).toEqual([0, 20, 40, 60, 80, 100]);
    });

    it('does not leave floating point drift on the labels', () => {
        expect(linearTicks(0, 1, 10)).toEqual([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]);
    });

    it('handles flat and non finite domains', () => {
        expect(linearTicks(4, 4)).toEqual([4]);
        expect(linearTicks(NaN, 4)).toEqual([]);
    });

    it('works across negative values', () => {
        const ticks = linearTicks(-50, 50, 4);

        expect(ticks).toContain(0);
        expect(ticks[0]).toBeLessThanOrEqual(-50);
    });
});

describe('roundToStep and niceDomain', () => {
    it('trims the floating point tail', () => {
        expect(roundToStep(0.30000000000000004, 0.1)).toBe(0.3);
    });

    it('rounds a domain outward to the step', () => {
        expect(niceDomain(3, 97, 5)).toEqual([0, 100]);
        expect(niceDomain(2, 2)).toEqual([2, 2]);
    });
});

describe('logTicks', () => {
    it('emits one tick per decade across a wide domain', () => {
        expect(logTicks(1, 100000)).toEqual([1, 10, 100, 1000, 10000, 100000]);
    });

    it('adds intermediate ticks on a short domain', () => {
        const ticks = logTicks(1, 10);

        expect(ticks).toContain(2);
        expect(ticks).toContain(5);
    });

    it('stays sorted and positive for a domain touching zero', () => {
        const ticks = logTicks(0, 100);

        expect(ticks.every((t) => t > 0)).toBe(true);
        expect([...ticks].sort((a, b) => a - b)).toEqual(ticks);
    });
});

describe('time ticks', () => {
    const DAY = 86_400_000;

    it('picks a coarser unit for a longer span', () => {
        expect(pickTimeStep(60_000, 6).unit).toBe('second');
        expect(pickTimeStep(DAY, 6).unit).toBe('hour');
        expect(pickTimeStep(400 * DAY, 6).unit).toBe('month');
        expect(pickTimeStep(Number.MAX_SAFE_INTEGER, 6)).toEqual({ unit: 'year', step: 10 });
    });

    it('floors and advances on calendar boundaries', () => {
        const t = new Date(2024, 4, 17, 13, 45).getTime();

        expect(floorToUnit(t, 'day', 1)).toBe(new Date(2024, 4, 17).getTime());
        expect(floorToUnit(t, 'month', 1)).toBe(new Date(2024, 4, 1).getTime());
        expect(floorToUnit(t, 'quarter', 1)).toBe(new Date(2024, 3, 1).getTime());
        expect(floorToUnit(t, 'year', 5)).toBe(new Date(2020, 0, 1).getTime());
        expect(floorToUnit(t, 'week', 1)).toBe(new Date(2024, 4, 12).getTime());
        expect(addUnit(new Date(2024, 11, 1).getTime(), 'month', 1)).toBe(new Date(2025, 0, 1).getTime());
        expect(addUnit(new Date(2024, 0, 1).getTime(), 'year', 2)).toBe(new Date(2026, 0, 1).getTime());
        expect(addUnit(0, 'hour', 2)).toBe(2 * 3_600_000);
    });

    it('generates ticks inside the range, in order, on boundaries', () => {
        const min = new Date(2024, 0, 15).getTime();
        const max = new Date(2024, 6, 15).getTime();
        const ticks = timeTicks(min, max, 6, { unit: 'month' });

        expect(ticks.length).toBe(6);
        expect(ticks[0]).toBe(new Date(2024, 1, 1).getTime());
        expect(ticks.every((t) => t >= min && t <= max)).toBe(true);
    });

    it('degrades to a single tick on an empty range', () => {
        expect(timeTicks(5, 5)).toEqual([5]);
        expect(timeTicks(5, 1)).toEqual([5]);
    });
});

describe('skipCollisions', () => {
    it('keeps the first tick, drops close ones and lets the end label replace its predecessor', () => {
        expect(skipCollisions([0, 1, 2, 3, 4, 5], (t) => t * 10, 25)).toEqual([0, 5]);
    });

    it('keeps the end label in place of its predecessor on collision', () => {
        expect(skipCollisions([0, 10, 12], (t) => t, 5)).toEqual([0, 12]);
    });

    it('returns everything when nothing can collide', () => {
        expect(skipCollisions([1, 2, 3], (t) => t, 0)).toEqual([1, 2, 3]);
        expect(skipCollisions([1], (t) => t, 10)).toEqual([1]);
    });
});

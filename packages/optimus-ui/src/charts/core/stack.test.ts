import { describe, expect, it } from 'vitest';
import { aggregateCategory, sortCategories, stackedDomain, stackSeries, waterfallDomain, waterfallSteps } from './stack';
import type { StackInput } from './stack';

const input = (id: string, order: number, entries: Record<string, number | null>): StackInput => ({ id, order, values: new Map(Object.entries(entries)) });

describe('stackSeries', () => {
    const a = input('a', 0, { x: 10, y: 5 });
    const b = input('b', 1, { x: 20, y: -4 });

    it('stacks positives upward and negatives downward from zero', () => {
        const result = stackSeries([a, b], ['x', 'y']);

        expect(result.get('a')!.get('x')).toEqual({ base: 0, top: 10 });
        expect(result.get('b')!.get('x')).toEqual({ base: 10, top: 30 });
        expect(result.get('b')!.get('y')).toEqual({ base: 0, top: -4 });
    });

    it('respects the order field rather than the array order', () => {
        const result = stackSeries([b, a], ['x']);

        expect(result.get('a')!.get('x')).toEqual({ base: 0, top: 10 });
        expect(result.get('b')!.get('x')!.base).toBe(10);
    });

    it('draws every series from zero in none mode', () => {
        const result = stackSeries([a, b], ['x'], 'none');

        expect(result.get('b')!.get('x')).toEqual({ base: 0, top: 20 });
    });

    it('normalises to 100 in percent mode, mixed signs included', () => {
        const result = stackSeries([input('p', 0, { x: 30 }), input('n', 1, { x: -70 })], ['x'], 'percent');

        expect(result.get('p')!.get('x')).toEqual({ base: 0, top: 30 });
        expect(result.get('n')!.get('x')).toEqual({ base: 0, top: -70 });

        const two = stackSeries([input('p', 0, { x: 1 }), input('q', 1, { x: 3 })], ['x'], 'percent');

        expect(two.get('q')!.get('x')).toEqual({ base: 25, top: 100 });
    });

    it('skips a hole instead of treating it as zero', () => {
        const result = stackSeries([input('a', 0, { x: null }), input('b', 1, { x: 4 })], ['x', 'y']);

        expect(result.get('a')!.has('x')).toBe(false);
        expect(result.get('b')!.get('x')).toEqual({ base: 0, top: 4 });
        expect(result.get('b')!.has('y')).toBe(false);
    });
});

describe('stackedDomain', () => {
    it('always includes zero and spans every segment', () => {
        const result = stackSeries([input('a', 0, { x: 10, y: -3 }), input('b', 1, { x: 5, y: -2 })], ['x', 'y']);

        expect(stackedDomain(result)).toEqual([-5, 15]);
        expect(stackedDomain(new Map())).toEqual([0, 0]);
    });
});

describe('waterfallSteps', () => {
    it('chains deltas and reports totals from zero to the running value', () => {
        const steps = waterfallSteps([100, -30, 20, null, null], [false, false, false, false, true]);

        expect(steps[0]).toEqual({ base: 0, top: 100, isTotal: false, isNegative: false });
        expect(steps[1]).toEqual({ base: 100, top: 70, isTotal: false, isNegative: true });
        expect(steps[2]).toEqual({ base: 70, top: 90, isTotal: false, isNegative: false });
        expect(steps[3]).toEqual({ base: 90, top: 90, isTotal: false, isNegative: false });
        expect(steps[4]).toEqual({ base: 0, top: 90, isTotal: true, isNegative: false });
    });

    it('marks a negative total', () => {
        expect(waterfallSteps([-5, null], [false, true])[1].isNegative).toBe(true);
    });

    it('computes the domain of its steps', () => {
        expect(waterfallDomain(waterfallSteps([10, -30], [false, false]))).toEqual([-20, 10]);
    });
});

describe('aggregateCategory and sortCategories', () => {
    it('combines values and ignores nulls', () => {
        expect(aggregateCategory([1, 2, null, 7])).toBe(10);
        expect(aggregateCategory([1, 2, null, 7], 'max')).toBe(7);
        expect(aggregateCategory([4, 2, 7], 'min')).toBe(2);
        expect(aggregateCategory([null, 4, 2], 'first')).toBe(4);
        expect(aggregateCategory([null])).toBe(0);
    });

    it('sorts by value or label without mutating the input', () => {
        const categories = ['b', 'a', 'c'];
        const value = (c: string) => ({ a: 3, b: 1, c: 2 })[c as 'a'];

        expect(sortCategories(categories, value, 'value-asc')).toEqual(['b', 'c', 'a']);
        expect(sortCategories(categories, value, 'value-desc')).toEqual(['a', 'c', 'b']);
        expect(sortCategories(categories, value, 'label-asc')).toEqual(['a', 'b', 'c']);
        expect(sortCategories(categories, value, 'label-desc')).toEqual(['c', 'b', 'a']);
        expect(categories).toEqual(['b', 'a', 'c']);
    });
});

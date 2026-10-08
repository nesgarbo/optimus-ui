import { describe, expect, it } from 'vitest';
import { boxStatsFromValues, quartiles, readBoxStats } from './boxplot';

const seven = [1, 2, 3, 4, 5, 6, 7];
const eight = [1, 2, 3, 4, 5, 6, 7, 8];

describe('quartiles', () => {
    it('take the median of each half, leaving the median out or keeping it in', () => {
        expect(quartiles(seven, 'exclusive')).toEqual([2, 4, 6]);
        expect(quartiles(seven, 'inclusive')).toEqual([2.5, 4, 5.5]);
        expect(quartiles(eight, 'exclusive')).toEqual([2.5, 4.5, 6.5]);
        expect(quartiles(eight, 'inclusive')).toEqual([2.5, 4.5, 6.5]); // even counts have no median to leave out
    });

    it('interpolate between ranks, as spreadsheets do', () => {
        expect(quartiles(seven, 'linear')).toEqual([2.5, 4, 5.5]);
        expect(quartiles(eight, 'linear')).toEqual([2.75, 4.5, 6.25]);
    });

    it('survive one value and none', () => {
        expect(quartiles([9])).toEqual([9, 9, 9]);
        expect(quartiles([]).every(Number.isNaN)).toBe(true);
    });
});

describe('boxStatsFromValues', () => {
    it('puts the whiskers on the last values inside the fences and the rest in outliers', () => {
        const s = boxStatsFromValues([1, 2, 3, 4, 5, 6, 7, 40])!;

        expect([s.q1, s.median, s.q3]).toEqual([2.5, 4.5, 6.5]);
        // fences: 2.5 - 1.5 * 4 = -3.5 and 6.5 + 6 = 12.5
        expect(s.whiskerLow).toBe(1);
        expect(s.whiskerHigh).toBe(7);
        expect(s.outliers).toEqual([40]);
        expect([s.min, s.max, s.lowest, s.highest]).toEqual([1, 40, 1, 40]);
        expect(s.mean).toBeCloseTo(8.5);
    });

    it('has no outliers in a tight set, and takes a longer reach when asked', () => {
        expect(boxStatsFromValues(seven)!.outliers).toEqual([]);
        expect(boxStatsFromValues([1, 2, 3, 4, 5, 6, 7, 40], 'exclusive', 100)!.outliers).toEqual([]);
        expect(boxStatsFromValues([1, 2, 3, 4, 5, 6, 7, 40], 'exclusive', 0)!.outliers.length).toBeGreaterThan(1);
    });

    it('ignores what is not a number, and gives nothing for nothing', () => {
        expect(boxStatsFromValues([1, 'a', null, NaN, 3, undefined, Infinity])!.max).toBe(3);
        expect(boxStatsFromValues([])).toBeNull();
        expect(boxStatsFromValues(['x'])).toBeNull();
    });
});

describe('readBoxStats', () => {
    it('computes from an array of values', () => {
        expect(readBoxStats({ values: seven }, {})!.median).toBe(4);
        expect(readBoxStats({ scores: seven }, { valuesField: 'scores', quartileMethod: 'inclusive' })!.q1).toBe(2.5);
    });

    it('reads five numbers and the outliers, from the names it is told', () => {
        const s = readBoxStats({ lo: 1, a: 2, mid: 3, b: 4, hi: 5, odd: [9, '12', 'x'], avg: 3.1 }, { minField: 'lo', q1Field: 'a', medianField: 'mid', q3Field: 'b', maxField: 'hi', outliersField: 'odd', meanField: 'avg' })!;

        expect([s.min, s.q1, s.median, s.q3, s.max]).toEqual([1, 2, 3, 4, 5]);
        expect(s.outliers).toEqual([9, 12]);
        expect(s.highest).toBe(12);
        expect(s.mean).toBe(3.1);
        expect(s.whiskerLow).toBe(1);
    });

    it('gives nothing when a number is missing, and reads nested paths and numeric strings', () => {
        expect(readBoxStats({ min: 1, q1: 2, median: 3, q3: 4 }, {})).toBeNull();
        expect(readBoxStats(null, {})).toBeNull();
        expect(readBoxStats({ s: { min: '1', q1: 2, median: 3, q3: 4, max: 5 } }, { minField: 's.min', q1Field: 's.q1', medianField: 's.median', q3Field: 's.q3', maxField: 's.max' })!.min).toBe(1);
    });
});

import { describe, expect, it } from 'vitest';
import { categoryOf, indexOfCategory, valueOf } from './tooltip-read';

const DATA = [
    { month: 'Jan', amount: 10, extra: '7' },
    { month: 'Feb', amount: 20, extra: 'x' },
    { month: 'Mar', amount: null, extra: '3.5' }
];

describe('tooltip reads', () => {
    it('reads a field name, as it always did', () => {
        const props = { categoryXField: 'month', valueYField: 'amount' };

        expect(categoryOf(props, DATA[1], 1, 0, 's')).toBe('Feb');
        expect(valueOf(props, DATA[1], 1, 0, 's')).toBe(20);
    });

    it('reads a function accessor, which the chart itself draws with', () => {
        const props = { categoryXField: (ctx: { datum: { month: string } }) => ctx.datum.month.toUpperCase(), valueYField: (ctx: { datum: { amount: number } }) => ctx.datum.amount * 2 };

        expect(categoryOf(props, DATA[0], 0, 0, 's')).toBe('JAN');
        expect(valueOf(props, DATA[0], 0, 0, 's')).toBe(20);
    });

    it('falls back to the documented default fields', () => {
        expect(categoryOf({}, { category: 'A', value: 3 }, 0, 0, 's')).toBe('A');
        expect(valueOf({}, { category: 'A', value: 3 }, 0, 0, 's')).toBe(3);
    });

    it('reads a numeric string as a number and a missing value as none, not as zero', () => {
        expect(valueOf({ valueYField: 'extra' }, DATA[0], 0, 0, 's')).toBe(7);
        expect(valueOf({ valueYField: 'extra' }, DATA[1], 1, 0, 's')).toBeNull();
        expect(valueOf({ valueYField: 'amount' }, DATA[2], 2, 0, 's')).toBeNull();
    });

    it('uses the index when a datum has no category', () => {
        expect(categoryOf({ categoryXField: 'nope' }, DATA[0], 4, 0, 's')).toBe('4');
    });

    it('finds the first row of a category, and caches the lookup per data array', () => {
        const props = { categoryXField: 'month' };

        expect(indexOfCategory(props, DATA, 'Mar', 0, 's')).toBe(2);
        expect(indexOfCategory(props, DATA, 'Nope', 0, 's')).toBe(-1);

        // The cached table is keyed on the data array, so a second lookup must not re-read the rows.
        let reads = 0;
        const counted = DATA.map((row) => ({
            get month() {
                reads++;

                return row.month;
            }
        }));

        indexOfCategory(props, counted, 'Jan', 0, 's');
        const afterFirst = reads;

        indexOfCategory(props, counted, 'Feb', 0, 's');
        indexOfCategory(props, counted, 'Mar', 0, 's');

        expect(reads).toBe(afterFirst);
    });
});

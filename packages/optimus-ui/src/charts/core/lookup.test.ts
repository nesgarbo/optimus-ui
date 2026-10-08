import { describe, expect, it } from 'vitest';
import { dataIndexMap, indexMap, pushAll } from './lookup';

describe('lookup tables', () => {
    it('maps each item to its first position', () => {
        const map = indexMap(['a', 'b', 'a', 'c']);

        expect(map.get('a')).toBe(0);
        expect(map.get('c')).toBe(3);
        expect(map.get('z')).toBeUndefined();
    });

    it('maps a data index to its place in the series, which a decimated series no longer matches', () => {
        const map = dataIndexMap([{ dataIndex: 0 }, { dataIndex: 40 }, { dataIndex: 99 }]);

        expect(map.get(40)).toBe(1);
        expect(map.get(99)).toBe(2);
    });

    it('appends a very long list without overflowing the stack', () => {
        const target: number[] = [];

        pushAll(
            target,
            Array.from({ length: 500_000 }, (_, i) => i)
        );

        expect(target).toHaveLength(500_000);
    });
});

import { describe, expect, it } from 'vitest';
import { parseDay } from './gantt-calendar';
import { indentData, insertData, outdentData, patchFor, removeData, updateData, updateManyData, writeDay } from './gantt-data';

const d = (iso: string) => parseDay(iso)!;

const nested = () => {
    const k1 = { id: 3, name: 'k1' };
    const k2 = { id: 4, name: 'k2' };
    const p = { id: 2, name: 'p', child: [k1, k2] };
    const a = { id: 1, name: 'a' };

    return { data: [a, p] as any[], a, p, k1, k2 };
};

const flat = () => {
    const a = { id: 1, name: 'a' };
    const p = { id: 2, name: 'p' };
    const k1 = { id: 3, name: 'k1', parentID: 2 };
    const k2 = { id: 4, name: 'k2', parentID: 2 };
    const z = { id: 5, name: 'z' };

    return { data: [a, p, k1, k2, z], a, p, k1, k2, z };
};

describe('dates in the data', () => {
    it('writes a date in the shape of the one it replaces', () => {
        expect(writeDay('2026-10-05', d('2026-10-09'))).toBe('2026-10-09');
        expect(writeDay('2026-10-05T08:30:00', d('2026-10-09'))).toBe('2026-10-09T08:30:00');
        expect(writeDay(new Date(2026, 9, 5), d('2026-10-09'))).toEqual(new Date(2026, 9, 9));
        expect(writeDay(new Date(2026, 9, 5).getTime(), d('2026-10-09'))).toBe(new Date(2026, 9, 9).getTime());
        expect(writeDay(undefined, d('2026-10-09'))).toEqual(new Date(2026, 9, 9));
    });

    it('writes the end or the duration, whichever the item uses', () => {
        expect(patchFor({ startDate: '2026-10-05', duration: 3 }, {}, { start: d('2026-10-06'), end: d('2026-10-08'), duration: 3 })).toEqual({ startDate: '2026-10-06', duration: 3 });
        expect(patchFor({ startDate: '2026-10-05', endDate: '2026-10-07' }, {}, { start: d('2026-10-06'), end: d('2026-10-08'), duration: 3 })).toEqual({ startDate: '2026-10-06', endDate: '2026-10-08' });
        expect(patchFor({ startDate: '2026-10-05' }, {}, { end: d('2026-10-08'), duration: 3 })).toEqual({ endDate: new Date(2026, 9, 8), duration: 3 });
        expect(patchFor({}, { startDate: 'from', progress: 'done' }, { start: d('2026-10-06'), progress: 40 })).toEqual({ from: new Date(2026, 9, 6), done: 40 });
    });
});

describe('editing nested data', () => {
    it('updates by identity and shares what did not change', () => {
        const { data, a, p, k1, k2 } = nested();
        const out = updateData(data, {}, k1, { name: 'K1' });

        expect(out[0]).toBe(a);
        expect(out[1]).not.toBe(p);
        expect(out[1].child[0]).toEqual({ id: 3, name: 'K1' });
        expect(out[1].child[1]).toBe(k2);
        expect(data[1].child[0].name).toBe('k1');
        expect(updateData(data, {}, { id: 'stranger' }, { name: 'x' })).toBe(data);
    });

    it('updates several at once', () => {
        const { data, a, k2 } = nested();
        const out = updateManyData(
            data,
            {},
            new Map<any, any>([
                [a, { name: 'A' }],
                [k2, { name: 'K2' }]
            ])
        );

        expect(out[0].name).toBe('A');
        expect(out[1].child[1].name).toBe('K2');
    });

    it('removes, inserts, indents and outdents', () => {
        const { data, a, p, k1, k2 } = nested();

        expect(removeData(data, {}, k1)[1].child).toEqual([k2]);
        expect(removeData(data, {}, p)).toEqual([a]);

        const item = { id: 9, name: 'new' };

        expect(insertData(data, {}, item, null)).toEqual([a, p, item]);
        expect(insertData(data, {}, item, null, 0)[0]).toBe(item);
        expect(insertData(data, {}, item, p)[1].child.map((c: any) => c.id)).toEqual([3, 4, 9]);
        expect(insertData(data, {}, item, p, 1)[1].child.map((c: any) => c.id)).toEqual([3, 9, 4]);
        expect(insertData(data, {}, item, a)[0].child).toEqual([item]);

        const indented = indentData(data, {}, p, a);

        expect(indented).toHaveLength(1);
        expect(indented[0].child.map((c: any) => c.id)).toEqual([2]);

        const outdented = outdentData(data, {}, k1, p);

        expect(outdented.map((r: any) => r.id)).toEqual([1, 2, 3]);
        expect(outdented[1].child.map((c: any) => c.id)).toEqual([4]);
    });
});

describe('editing flat data', () => {
    it('removes a parent with its children', () => {
        const { data, a, z } = flat();

        expect(removeData(data, {}, data[1])).toEqual([a, z]);
    });

    it('inserts under a parent after its last descendant, and at a position among siblings', () => {
        const { data, p, k1, k2 } = flat();
        const item = { id: 9, name: 'n' };
        const last = insertData(data, {}, item, p);

        expect(last.map((r: any) => r.id)).toEqual([1, 2, 3, 4, 9, 5]);
        expect(last[4].parentID).toBe(2);
        expect(insertData(data, {}, item, p, 0).map((r: any) => r.id)).toEqual([1, 2, 9, 3, 4, 5]);
        expect(insertData(data, {}, item, null).at(-1)).toBe(item);
        void k1;
        void k2;
    });

    it('indents and outdents by changing the parent', () => {
        const { data, a, p, k1 } = flat();

        expect(indentData(data, {}, p, a).find((r: any) => r.id === 2).parentID).toBe(1);
        expect('parentID' in outdentData(data, {}, k1, p).find((r: any) => r.id === 3)).toBe(false);

        const deeper = [{ id: 1 }, { id: 2, parentID: 1 }, { id: 3, parentID: 2 }];

        expect(outdentData(deeper, {}, deeper[2], deeper[1]).find((r: any) => r.id === 3).parentID).toBe(1);
    });
});

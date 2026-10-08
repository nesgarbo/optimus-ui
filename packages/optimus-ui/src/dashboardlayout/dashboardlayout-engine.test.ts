import type { PanelModel } from '@openng/optimus-ui/types/dashboardlayout';
import { describe, expect, it } from 'vitest';
import { clampPanel, findSpot, heightOf, metrics, moveTo, overlaps, resizeTo, resolve, rowsOf, sameLayout, stack, uniqueIds, toCell, toPixels, toSpan, type GridPanel } from './dashboardlayout-engine';

const p = (id: string, row: number, col: number, sizeX = 1, sizeY = 1, extra: Partial<PanelModel> = {}): GridPanel => ({ id, row, col, sizeX, sizeY, ...extra });
const at = (panels: PanelModel[], id: string) => panels.find((x) => x.id === id)!;

describe('overlaps and clamping', () => {
    it('knows when two areas share a cell', () => {
        expect(overlaps({ row: 0, col: 0, sizeX: 2, sizeY: 2 }, { row: 1, col: 1, sizeX: 2, sizeY: 2 })).toBe(true);
        expect(overlaps({ row: 0, col: 0, sizeX: 2, sizeY: 2 }, { row: 2, col: 0, sizeX: 1, sizeY: 1 })).toBe(false);
        expect(overlaps({ row: 0, col: 0, sizeX: 2, sizeY: 1 }, { row: 0, col: 2, sizeX: 1, sizeY: 1 })).toBe(false);
    });

    it('keeps a panel inside the grid and its own limits', () => {
        expect(clampPanel(p('a', -2, 9, 3, 1), 4)).toMatchObject({ row: 0, col: 1, sizeX: 3 });
        expect(clampPanel(p('a', 0, 0, 9, 1), 4).sizeX).toBe(4);
        expect(clampPanel({ id: 'a', row: 0, col: 0 }, 4)).toMatchObject({ sizeX: 1, sizeY: 1 });
        expect(clampPanel(p('a', 0, 0, 1, 1, { minSizeX: 2, minSizeY: 3 }), 4)).toMatchObject({ sizeX: 2, sizeY: 3 });
        expect(clampPanel(p('a', 0, 0, 4, 9, { maxSizeX: 2, maxSizeY: 3 }), 4)).toMatchObject({ sizeX: 2, sizeY: 3 });
    });
});

describe('resolve', () => {
    it('pushes an overlapping panel below the one in its way', () => {
        const out = resolve([p('a', 0, 0, 2, 2), p('b', 1, 1, 2, 1)], 4, false);

        expect(at(out, 'a')).toMatchObject({ row: 0, col: 0 });
        expect(at(out, 'b')).toMatchObject({ row: 2, col: 1 });
    });

    it('floats panels up into a gap, and stops at the first obstacle', () => {
        const out = resolve([p('a', 0, 0, 2, 1), p('b', 5, 0, 2, 1), p('c', 7, 3, 1, 1)], 4, true);

        expect(at(out, 'b').row).toBe(1);
        expect(at(out, 'c').row).toBe(0);
        // without floating nothing moves
        expect(at(resolve([p('b', 5, 0)], 4, false), 'b').row).toBe(5);
    });

    it('lets the priority panel keep its place', () => {
        const out = resolve([p('a', 0, 0, 2, 1), p('b', 0, 0, 2, 1)], 4, true, 'b');

        expect(at(out, 'b')).toMatchObject({ row: 0, col: 0 });
        expect(at(out, 'a').row).toBe(1);
    });

    it('settles a chain of pushes', () => {
        const out = resolve([p('a', 0, 0, 1, 2), p('b', 1, 0, 1, 2), p('c', 2, 0, 1, 2)], 2, false);

        expect(out.map((x) => x.row)).toEqual([0, 2, 4]);
        expect(out.some((x, i) => out.some((y, j) => i !== j && overlaps(x, y)))).toBe(false);
    });

    it('keeps the order of the input and does not touch it', () => {
        const input = [p('b', 3, 0), p('a', 0, 0)];
        const out = resolve(input, 2, true);

        expect(out.map((x) => x.id)).toEqual(['b', 'a']);
        expect(input[0].row).toBe(3);
    });
});

describe('moving and resizing', () => {
    const base = [p('a', 0, 0, 2, 2), p('b', 0, 2, 2, 2), p('c', 2, 0, 4, 1)];

    it('moves one panel and the others make way', () => {
        const out = moveTo(base, 'a', 0, 2, 4);

        expect(at(out, 'a')).toMatchObject({ row: 0, col: 2 });
        expect(at(out, 'b').row).toBeGreaterThanOrEqual(2);
        expect(out.some((x, i) => out.some((y, j) => i !== j && overlaps(x, y)))).toBe(false);
    });

    it('resizes within limits', () => {
        const out = resizeTo([p('a', 0, 0, 1, 1, { maxSizeX: 2 }), p('b', 1, 0)], 'a', { row: 0, col: 0, sizeX: 3, sizeY: 2 }, 4);

        expect(at(out, 'a')).toMatchObject({ sizeX: 2, sizeY: 2 });
        expect(at(out, 'b').row).toBe(2);
    });

    it('counts rows and finds a free spot', () => {
        expect(rowsOf(base)).toBe(3);
        expect(findSpot(base, 2, 1, 4)).toEqual({ row: 3, col: 0 });
        expect(findSpot([p('a', 0, 0, 2, 1)], 2, 1, 4)).toEqual({ row: 0, col: 2 });
        expect(findSpot([], 9, 1, 4)).toEqual({ row: 0, col: 0 });
    });
});

describe('stacking and pixels', () => {
    it('stacks in reading order at full width', () => {
        const out = stack([p('b', 0, 2, 2, 2), p('a', 0, 0, 2, 1), p('c', 4, 0, 1, 3)]);

        expect(out.map((x) => [x.id, x.row, x.sizeY])).toEqual([
            ['b', 1, 2],
            ['a', 0, 1],
            ['c', 3, 3]
        ]);
        expect(out.every((x) => x.col === 0 && x.sizeX === 1)).toBe(true);
    });

    it('converts between cells and pixels', () => {
        const g = metrics(1000, 4, 10, 10, 1);

        expect(g.cellW).toBeCloseTo(242.5);
        expect(g.cellH).toBeCloseTo(242.5);
        expect(toPixels({ row: 1, col: 2, sizeX: 2, sizeY: 1 }, g)).toEqual({ x: 2 * 252.5, y: 252.5, w: 2 * 242.5 + 10, h: 242.5 });
        expect(toCell(2 * 252.5 + 20, 252.5 - 30, g)).toEqual({ col: 2, row: 1 });
        expect(toSpan(2 * 242.5 + 10, 242.5, g)).toEqual({ sizeX: 2, sizeY: 1 });
        expect(heightOf(2, g)).toBeCloseTo(495);
        expect(heightOf(0, g)).toBe(0);
        expect(metrics(400, 2, 0, 0, 2).cellH).toBe(100);
    });

    it('compares layouts', () => {
        expect(sameLayout([p('a', 0, 0)] as any, [p('a', 0, 0)] as any)).toBe(true);
        expect(sameLayout([p('a', 0, 0)] as any, [p('a', 1, 0)] as any)).toBe(false);
    });
});

describe('ids and scale', () => {
    it('gives a repeated id a name of its own, and places both panels', () => {
        expect(uniqueIds([p('a', 0, 0), p('a', 0, 1), p('a', 0, 2)]).map((x) => x.id)).toEqual(['a', 'a~2', 'a~3']);

        const out = resolve([p('a', 0, 0, 2), p('a', 0, 0, 2)], 4, false);

        expect(out.map((x) => x.id)).toEqual(['a', 'a~2']);
        expect(out[1].row).toBe(1);
    });

    it('settles many panels with the same result as one by one', () => {
        const panels = Array.from({ length: 400 }, (_, i) => p(`p${i}`, 0, (i % 4) * 3, 3, 1 + (i % 3)));
        const out = resolve(panels, 12, true);

        for (let i = 0; i < out.length; i++) for (let j = i + 1; j < out.length; j++) expect(overlaps(out[i], out[j])).toBe(false);
    });
});

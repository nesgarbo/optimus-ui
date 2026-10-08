import { describe, expect, it } from 'vitest';
import { parseDay } from './gantt-calendar';
import { ZOOM_LEVELS, dayWidthFor, formatDay, nearestZoom, nextUnit, polylinePath, routeDependency, startOfUnit, tierCells } from './gantt-timeline';

const d = (iso: string) => parseDay(iso)!;

describe('zoom', () => {
    it('is ordered from wide to narrow, and picks the nearest', () => {
        expect(ZOOM_LEVELS.map((z) => z.dayWidth)).toEqual([...ZOOM_LEVELS.map((z) => z.dayWidth)].sort((a, b) => a - b));
        expect(nearestZoom(1)).toBe(0);
        expect(nearestZoom(24)).toBe(4);
        expect(nearestZoom(1000)).toBe(ZOOM_LEVELS.length - 1);
    });

    it('turns a unit width into a day width', () => {
        expect(dayWidthFor('day', 33)).toBe(33);
        expect(dayWidthFor('week', 70)).toBe(10);
        expect(dayWidthFor('month', 304.4)).toBeCloseTo(10);
    });
});

describe('units', () => {
    it('finds the start of a week, a month and a year', () => {
        expect(startOfUnit(d('2026-10-08'), 'week')).toBe(d('2026-10-05')); // Thursday -> Monday
        expect(startOfUnit(d('2026-10-08'), 'week', 0)).toBe(d('2026-10-04')); // weeks that start on Sunday
        expect(startOfUnit(d('2026-10-08'), 'month')).toBe(d('2026-10-01'));
        expect(startOfUnit(d('2026-10-08'), 'year')).toBe(d('2026-01-01'));
        expect(nextUnit(d('2026-12-15'), 'month')).toBe(d('2027-01-01'));
        expect(nextUnit(d('2026-12-15'), 'year')).toBe(d('2027-01-01'));
    });

    it('writes dates by pattern and by options', () => {
        expect(formatDay(d('2026-10-08'), 'dd/MM/yyyy', 'day', 'en')).toBe('08/10/2026');
        expect(formatDay(d('2026-10-08'), 'EEE d MMM', 'day', 'en')).toBe('Thu 8 Oct');
        expect(formatDay(d('2026-10-08'), undefined, 'month', 'en')).toBe('Oct');
        expect(formatDay(d('2026-10-08'), { month: 'long', year: 'numeric' }, 'month', 'en')).toBe('October 2026');
    });
});

describe('tierCells', () => {
    it('cuts the first and the last cell at the edges of the range', () => {
        const cells = tierCells(d('2026-10-20'), d('2026-12-05'), { unit: 'month' }, 2, 1, 'en');

        expect(cells.map((c) => [c.label, c.width])).toEqual([
            ['Oct', 12 * 2],
            ['Nov', 30 * 2],
            ['Dec', 4 * 2]
        ]);
        expect(cells[0].x).toBe(0);
        expect(cells[1].x).toBe(24);
        expect(cells.reduce((s, c) => s + c.width, 0)).toBe((d('2026-12-05') - d('2026-10-20')) * 2);
    });

    it('lists days and weeks', () => {
        expect(tierCells(d('2026-10-05'), d('2026-10-12'), { unit: 'day' }, 10, 1, 'en')).toHaveLength(7);
        expect(tierCells(d('2026-10-05'), d('2026-10-19'), { unit: 'week' }, 5, 1, 'en').map((c) => c.label)).toEqual(['Oct 5', 'Oct 12']);
    });
});

describe('routeDependency', () => {
    const row = 40;

    it('goes straight along a row when the target is ahead', () => {
        expect(routeDependency({ x: 100, y: 20, dir: 1 }, { x: 160, y: 20, dir: -1 }, row)).toEqual([
            [100, 20],
            [160, 20]
        ]);
    });

    it('takes one elbow to a row below when the target is ahead', () => {
        const pts = routeDependency({ x: 100, y: 20, dir: 1 }, { x: 200, y: 60, dir: -1 }, row);

        expect(pts[0]).toEqual([100, 20]);
        expect(pts.at(-1)).toEqual([200, 60]);
        expect(pts).toHaveLength(4);
        // every segment is horizontal or vertical
        pts.slice(1).forEach((p, i) => expect(p[0] === pts[i][0] || p[1] === pts[i][1]).toBe(true));
    });

    it('goes round when the target is behind the source', () => {
        const pts = routeDependency({ x: 200, y: 20, dir: 1 }, { x: 120, y: 60, dir: -1 }, row);

        expect(pts.length).toBeGreaterThan(4);
        expect(pts.some(([, y]) => y === 40)).toBe(true); // through the gap between the rows
        pts.slice(1).forEach((p, i) => expect(p[0] === pts[i][0] || p[1] === pts[i][1]).toBe(true));
    });

    it('works upward and for start-anchored sources', () => {
        const pts = routeDependency({ x: 100, y: 100, dir: -1 }, { x: 60, y: 20, dir: 1 }, row);

        expect(pts[0]).toEqual([100, 100]);
        expect(pts.at(-1)).toEqual([60, 20]);
        pts.slice(1).forEach((p, i) => expect(p[0] === pts[i][0] || p[1] === pts[i][1]).toBe(true));
    });

    it('writes a path', () => {
        expect(
            polylinePath([
                [0, 0],
                [10.123456, 5]
            ])
        ).toBe('M0 0L10.12 5');
    });
});

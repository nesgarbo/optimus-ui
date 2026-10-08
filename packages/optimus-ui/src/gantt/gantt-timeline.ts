import type { GanttTier } from '@openng/optimus-ui/types/gantt';
import { fromDay, weekdayOf, type Day } from './gantt-calendar';

/**
 * The horizontal axis of the chart: how wide a day is, which cells the header has, where a date falls
 * in pixels and how a dependency line is routed.
 *
 * Pure.
 *
 * @module gantt-timeline
 */

export type TierUnit = 'year' | 'month' | 'week' | 'day';

/** One zoom level: a width for a day, and the tiers that read well at it. */
export interface ZoomLevel {
    /** Pixels in one day. */
    dayWidth: number;
    top: TierUnit;
    bottom: TierUnit;
}

/** The zoom levels, from the whole project at a glance to a single week. */
export const ZOOM_LEVELS: readonly ZoomLevel[] = [
    { dayWidth: 1, top: 'year', bottom: 'month' },
    { dayWidth: 2.5, top: 'year', bottom: 'month' },
    { dayWidth: 5, top: 'month', bottom: 'week' },
    { dayWidth: 10, top: 'month', bottom: 'week' },
    { dayWidth: 22, top: 'week', bottom: 'day' },
    { dayWidth: 40, top: 'week', bottom: 'day' },
    { dayWidth: 72, top: 'month', bottom: 'day' }
];

/** The zoom level closest to a day width. */
export function nearestZoom(dayWidth: number): number {
    let best = 0;

    ZOOM_LEVELS.forEach((z, i) => {
        if (Math.abs(Math.log(z.dayWidth / dayWidth)) < Math.abs(Math.log(ZOOM_LEVELS[best].dayWidth / dayWidth))) best = i;
    });

    return best;
}

const AVERAGE_DAYS: Record<TierUnit, number> = { year: 365.25, month: 30.44, week: 7, day: 1 };

/** The width of a day when one unit of the bottom tier is `unitWidth` pixels. */
export const dayWidthFor = (unit: TierUnit, unitWidth: number): number => unitWidth / AVERAGE_DAYS[unit];

/** One cell of a header tier. `from` is the first day, `to` the first day after. */
export interface TierCell {
    from: Day;
    to: Day;
    label: string;
    /** Pixels from the left of the chart. */
    x: number;
    width: number;
}

/** The first day of the unit that contains `day`. */
export function startOfUnit(day: Day, unit: TierUnit, weekStart = 1): Day {
    const date = fromDay(day);

    switch (unit) {
        case 'year':
            return Math.round(Date.UTC(date.getFullYear(), 0, 1) / 86_400_000);
        case 'month':
            return Math.round(Date.UTC(date.getFullYear(), date.getMonth(), 1) / 86_400_000);
        case 'week':
            return day - ((weekdayOf(day) - weekStart + 7) % 7);
        default:
            return day;
    }
}

/** The first day of the unit after the one `day` starts. */
export function nextUnit(day: Day, unit: TierUnit): Day {
    const date = fromDay(day);

    switch (unit) {
        case 'year':
            return Math.round(Date.UTC(date.getFullYear() + 1, 0, 1) / 86_400_000);
        case 'month':
            return Math.round(Date.UTC(date.getFullYear(), date.getMonth() + 1, 1) / 86_400_000);
        case 'week':
            return day + 7;
        default:
            return day + 1;
    }
}

const FORMATS: Record<TierUnit, Intl.DateTimeFormatOptions> = {
    year: { year: 'numeric' },
    month: { month: 'short' },
    week: { month: 'short', day: 'numeric' },
    day: { day: 'numeric' }
};

/** Writes a date by a pattern (`yyyy`, `MMMM`, `MMM`, `MM`, `dd`, `d`, `EEEE`, `EEE`) or by `Intl` options. */
export function formatDay(day: Day, format: string | Intl.DateTimeFormatOptions | undefined, unit: TierUnit, locale?: string): string {
    const date = fromDay(day);

    if (typeof format === 'string' && format) {
        const names = (opt: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, opt).format(date);
        const tokens: Record<string, () => string> = {
            yyyy: () => String(date.getFullYear()),
            MMMM: () => names({ month: 'long' }),
            MMM: () => names({ month: 'short' }),
            MM: () => String(date.getMonth() + 1).padStart(2, '0'),
            EEEE: () => names({ weekday: 'long' }),
            EEE: () => names({ weekday: 'short' }),
            dd: () => String(date.getDate()).padStart(2, '0'),
            d: () => String(date.getDate())
        };

        return format.replace(/yyyy|MMMM|MMM|MM|EEEE|EEE|dd|d/g, (t) => tokens[t]());
    }

    return new Intl.DateTimeFormat(locale, typeof format === 'object' ? format : FORMATS[unit]).format(date);
}

/** The cells of a tier over `from` to `to` (the first day after), at `dayWidth` pixels a day. A cell is cut at the edges of the range. */
export function tierCells(from: Day, to: Day, tier: GanttTier & { unit: TierUnit }, dayWidth: number, weekStart = 1, locale?: string): TierCell[] {
    const cells: TierCell[] = [];

    for (let s = startOfUnit(from, tier.unit, weekStart); s < to;) {
        const next = nextUnit(s, tier.unit);
        const a = Math.max(s, from);
        const b = Math.min(next, to);

        if (b > a) cells.push({ from: a, to: b, label: formatDay(s, tier.format, tier.unit, locale), x: (a - from) * dayWidth, width: (b - a) * dayWidth });

        s = next;
    }

    return cells;
}

/** An anchor of a bar: where a line leaves or enters, and which way the line goes. */
export interface Anchor {
    x: number;
    y: number;
    /** 1 when the line goes right of the point, -1 when left. */
    dir: 1 | -1;
}

/**
 * The points of an orthogonal line from one anchor to another, with room to turn.
 *
 * It leaves its source along `dir`, rises or falls to the target row and enters along the direction
 * of the target. When the target lies behind the source, it goes round through the gap between rows.
 */
export function routeDependency(from: Anchor, to: Anchor, rowHeight: number, gap = 10): [number, number][] {
    const out: [number, number][] = [[from.x, from.y]];
    const exit = from.x + from.dir * gap;
    const enter = to.x + to.dir * gap;

    if (from.y === to.y) {
        // Same row: straight when the target is ahead, a hop round the bar when not.
        if ((to.x - from.x) * from.dir >= gap * 2 && from.dir === -to.dir) {
            out.push([to.x, to.y]);

            return out;
        }

        const above = from.y - rowHeight / 2;

        out.push([exit, from.y], [exit, above], [enter, above], [enter, to.y], [to.x, to.y]);

        return out;
    }

    const down = to.y > from.y ? 1 : -1;
    const clear = (enter - exit) * from.dir > 0 && from.dir === -to.dir;

    if (clear) {
        // The target is ahead and faces the source: one elbow.
        const mid = from.dir === 1 ? Math.max(exit, Math.min(enter, (exit + enter) / 2)) : exit;

        out.push([mid, from.y], [mid, to.y], [to.x, to.y]);

        return out;
    }

    // Round the long way: out, to the gap between the rows, across, then in.
    const laneY = from.y + down * (rowHeight / 2);

    out.push([exit, from.y], [exit, laneY], [enter, laneY], [enter, to.y], [to.x, to.y]);

    return out;
}

/** An SVG path of a polyline. */
export const polylinePath = (points: [number, number][]): string => points.map(([x, y], i) => `${i ? 'L' : 'M'}${Math.round(x * 100) / 100} ${Math.round(y * 100) / 100}`).join('');

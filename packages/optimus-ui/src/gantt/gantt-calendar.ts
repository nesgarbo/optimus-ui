/**
 * The calendar a project runs on: which days are worked, and how to count and step in working days.
 *
 * Dates are whole days. A day is a number, the days since 1 January 1970 of the calendar date, so
 * that adding a day never meets a daylight-saving jump.
 *
 * @module gantt-calendar
 */

/** A calendar date, as the days since 1970-01-01. */
export type Day = number;

const DAY_MS = 86_400_000;

/** The calendar date of a `Date` in its local time. */
export const toDay = (date: Date): Day => Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS);

/** A local `Date` at midnight of a day. */
export function fromDay(day: Day): Date {
    const u = new Date(day * DAY_MS);

    return new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate());
}

/** The weekday of a day, 0 for Sunday. */
export const weekdayOf = (day: Day): number => (((day + 4) % 7) + 7) % 7;

/** Reads a date from a `Date`, a timestamp or a string. `YYYY-MM-DD` is the local date, not UTC midnight. */
export function parseDay(value: unknown): Day | null {
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : toDay(value);
    if (typeof value === 'number') return Number.isFinite(value) ? toDay(new Date(value)) : null;

    if (typeof value === 'string') {
        const m = /^(\d{4})-(\d{2})-(\d{2})(?:$|[T ])/.exec(value.trim());

        if (m) return toDay(new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])));

        const d = new Date(value);

        return Number.isNaN(d.getTime()) ? null : toDay(d);
    }

    return null;
}

/** The minutes after midnight a value carries, or `null` when it is a date alone. */
export function minutesOfDay(value: unknown): number | null {
    // A midnight is how a date alone is written as a `Date`: it carries no time.
    if (value instanceof Date) return value.getHours() * 60 + value.getMinutes() || null;
    if (typeof value === 'number') return minutesOfDay(new Date(value));

    if (typeof value === 'string') {
        const m = /[T ](\d{1,2}):(\d{2})/.exec(value);

        return m ? Number(m[1]) * 60 + Number(m[2]) : null;
    }

    return null;
}

/** A stretch of days with no work, both ends included. */
export interface DayRange {
    from: Day;
    to: Day;
}

/** Options of {@link WorkCalendar}. */
export interface WorkCalendarOptions {
    /** The weekdays that are worked, 0 for Sunday. Default Monday to Friday. */
    workWeek?: number[];
    holidays?: DayRange[];
    /** The unit durations are written in, in the data and on screen. It sets the slots of a day unless `slots` is given. Default `day`. */
    durationUnit?: 'day' | 'hour' | 'minute';
    /** The hours of a worked day: where it starts and where it ends. Default 8 to 16. */
    workingHours?: [number, number];
    /**
     * How many slots a worked day has. A slot is the smallest step of time the plan knows: with 1, a day; with 8, an hour of an
     * eight hour day; with 480, a minute. Every method below counts in slots, a day being `slots` of them. Default 1.
     */
    slots?: number;
}

const SAFETY = 20_000;

/**
 * Which days are worked, and arithmetic over time that is counted in slots.
 *
 * A unit is a slot: unit `n` is the slot `n % slots` of the day `floor(n / slots)`. With one slot a day, a unit is a day, which is
 * how the plan was first written. Slots of a day with no work are not worked either, so adding worked time steps over them.
 */
export class WorkCalendar {
    private readonly week: Set<number>;
    private readonly holidays: DayRange[];
    /** Slots in a worked day. */
    readonly slots: number;
    /** The unit durations are written in. */
    readonly durationUnit: 'day' | 'hour' | 'minute';
    /** Hours in a worked day. */
    readonly hoursPerDay: number;
    /** Minutes after midnight at which a worked day starts. */
    readonly dayStartMinutes: number;
    /** Minutes in a slot. */
    readonly slotMinutes: number;

    constructor(options: WorkCalendarOptions = {}) {
        const week = options.workWeek?.length ? options.workWeek : [1, 2, 3, 4, 5];
        const [from, to] = options.workingHours ?? [8, 16];

        this.week = new Set(week);
        this.holidays = options.holidays ?? [];
        this.durationUnit = options.durationUnit ?? 'day';
        this.hoursPerDay = Math.max(1, to > from ? to - from : 8);
        this.dayStartMinutes = Math.round(from * 60);
        this.slots = Math.max(1, Math.round(options.slots ?? (this.durationUnit === 'hour' ? this.hoursPerDay : this.durationUnit === 'minute' ? this.hoursPerDay * 60 : 1)));
        this.slotMinutes = (this.hoursPerDay * 60) / this.slots;
    }

    /** How many slots one unit of a duration is: a day is `slots` of them, an hour `slots / hoursPerDay`. */
    unitsPer(unit: 'day' | 'hour' | 'minute' = this.durationUnit): number {
        return unit === 'day' ? this.slots : unit === 'hour' ? this.slots / this.hoursPerDay : this.slots / (this.hoursPerDay * 60);
    }

    /** The date a unit stands for. A start is when the slot begins; an end, when it ends. With a day to a slot, a start is midnight and an end is the day itself. */
    toDate(unit: number, edge: 'start' | 'end' = 'start'): Date {
        const day = fromDay(this.dayOf(unit));

        if (this.slots === 1) return day;

        const slot = unit - this.dayOf(unit) * this.slots + (edge === 'end' ? 1 : 0);

        day.setMinutes(this.dayStartMinutes + Math.round(slot * this.slotMinutes));

        return day;
    }

    /** Reads a date into a unit. A date without a time is the whole day: its first slot for a start, its last for an end. */
    parseUnit(value: unknown, edge: 'start' | 'end' = 'start'): number | null {
        const day = parseDay(value);

        if (day === null) return null;

        const first = day * this.slots;

        if (this.slots === 1) return first;

        const minutes = minutesOfDay(value);

        if (minutes === null) return edge === 'end' ? first + this.slots - 1 : first;

        const into = (minutes - this.dayStartMinutes) / this.slotMinutes;
        const slot = edge === 'end' ? Math.ceil(into - 1e-9) - 1 : Math.floor(into + 1e-9);

        return first + Math.min(Math.max(slot, 0), this.slots - 1);
    }

    /** The day a unit falls on. */
    dayOf(unit: number): Day {
        return Math.floor(unit / this.slots);
    }

    /** The first unit of a day. */
    unitOf(day: Day): number {
        return day * this.slots;
    }

    /** `true` when work happens on a day. */
    isWorkingDay(day: Day): boolean {
        return this.week.has(weekdayOf(day)) && !this.holidays.some((h) => day >= h.from && day <= h.to);
    }

    /** `true` when work happens in a unit. */
    isWorking(unit: number): boolean {
        return this.isWorkingDay(this.dayOf(unit));
    }

    private nextWorkingDay(day: Day): Day {
        for (let i = 0; i < SAFETY; i++, day++) if (this.isWorkingDay(day)) return day;

        return day;
    }

    private prevWorkingDay(day: Day): Day {
        for (let i = 0; i < SAFETY; i++, day--) if (this.isWorkingDay(day)) return day;

        return day;
    }

    /** `unit` itself when it is worked, else the first unit of the next worked day. */
    nextWorking(unit: number): number {
        return this.isWorking(unit) ? unit : this.nextWorkingDay(this.dayOf(unit)) * this.slots;
    }

    /** `unit` itself when it is worked, else the last unit of the last worked day before it. */
    prevWorking(unit: number): number {
        return this.isWorking(unit) ? unit : (this.prevWorkingDay(this.dayOf(unit)) + 1) * this.slots - 1;
    }

    /** The unit `n` worked units after `unit` (before, when `n` is negative). `unit` is first moved to a worked one. */
    addWorking(unit: number, n: number): number {
        let u = this.nextWorking(unit);
        let left = Math.abs(Math.trunc(n));

        if (n < 0) {
            while (left > 0) {
                const k = u - this.dayOf(u) * this.slots; // slots of the day before this one

                if (left <= k) return u - left;

                left -= k + 1;
                u = this.prevWorking(this.dayOf(u) * this.slots - 1);

                if (u < -1e12) break;
            }

            return u;
        }

        while (left > 0) {
            const room = (this.dayOf(u) + 1) * this.slots - 1 - u; // slots of the day after this one

            if (left <= room) return u + left;

            left -= room + 1;
            u = this.nextWorking((this.dayOf(u) + 1) * this.slots);
        }

        return u;
    }

    /** How many worked units lie in `from` to `to`, both included. Zero when `to` is before `from`. */
    countWorking(from: number, to: number): number {
        if (to < from) return 0;

        const first = this.dayOf(from);
        const last = this.dayOf(to);
        let n = 0;

        for (let day = first; day <= last; day++) {
            if (!this.isWorkingDay(day)) continue;

            const a = day === first ? from : day * this.slots;
            const b = day === last ? to : (day + 1) * this.slots - 1;

            n += b - a + 1;
        }

        return n;
    }

    /** The last unit of a task of `duration` worked units that starts at `start`. A milestone ends where it starts. */
    endFor(start: number, duration: number): number {
        const s = this.nextWorking(start);

        return duration <= 1 ? s : this.addWorking(s, duration - 1);
    }

    /** The first unit of a task of `duration` worked units that ends at `end`. */
    startFor(end: number, duration: number): number {
        const e = this.prevWorking(end);

        return duration <= 1 ? e : this.addWorking(e, -(duration - 1));
    }

    /** The runs of days with no work between two days, for shading. */
    nonWorkingRuns(from: Day, to: Day): DayRange[] {
        const runs: DayRange[] = [];
        let start: Day | null = null;

        for (let d = from; d <= to; d++) {
            if (!this.isWorkingDay(d)) {
                start ??= d;
            } else if (start !== null) {
                runs.push({ from: start, to: d - 1 });
                start = null;
            }
        }

        if (start !== null) runs.push({ from: start, to });

        return runs;
    }
}

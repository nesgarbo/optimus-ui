import { describe, expect, it } from 'vitest';
import { WorkCalendar, fromDay, parseDay, toDay, weekdayOf } from './gantt-calendar';

const d = (iso: string) => parseDay(iso)!;
const iso = (day: number) => {
    const x = fromDay(day);

    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

describe('days', () => {
    it('round-trips local dates, also across a daylight-saving change', () => {
        expect(iso(d('2026-03-29'))).toBe('2026-03-29');
        expect(d('2026-03-30') - d('2026-03-29')).toBe(1);
        expect(iso(toDay(new Date(2026, 9, 25, 23, 59)))).toBe('2026-10-25');
    });

    it('knows the weekday', () => {
        expect(weekdayOf(d('2026-10-08'))).toBe(4); // Thursday
        expect(weekdayOf(d('2026-10-11'))).toBe(0); // Sunday
        expect(weekdayOf(d('1969-12-31'))).toBe(3);
    });

    it('reads dates, timestamps and strings, and refuses the rest', () => {
        expect(parseDay(new Date(2026, 0, 5))).toBe(d('2026-01-05'));
        expect(parseDay('2026-01-05T10:00:00')).toBe(d('2026-01-05'));
        expect(parseDay(new Date(2026, 0, 5).getTime())).toBe(d('2026-01-05'));
        expect(parseDay('January 5, 2026')).toBe(d('2026-01-05'));
        expect(parseDay('nope')).toBeNull();
        expect(parseDay(null)).toBeNull();
        expect(parseDay(new Date('x'))).toBeNull();
    });
});

describe('WorkCalendar', () => {
    const cal = new WorkCalendar();

    it('works Monday to Friday by default', () => {
        expect(cal.isWorking(d('2026-10-09'))).toBe(true); // Friday
        expect(cal.isWorking(d('2026-10-10'))).toBe(false);
        expect(cal.isWorking(d('2026-10-11'))).toBe(false);
        expect(cal.nextWorking(d('2026-10-10'))).toBe(d('2026-10-12'));
        expect(cal.prevWorking(d('2026-10-11'))).toBe(d('2026-10-09'));
    });

    it('steps over weekends, both ways', () => {
        expect(iso(cal.addWorking(d('2026-10-09'), 1))).toBe('2026-10-12');
        expect(iso(cal.addWorking(d('2026-10-09'), 5))).toBe('2026-10-16');
        expect(iso(cal.addWorking(d('2026-10-12'), -1))).toBe('2026-10-09');
        expect(iso(cal.addWorking(d('2026-10-10'), 0))).toBe('2026-10-12');
    });

    it('counts, and gives the end and start of a task', () => {
        expect(cal.countWorking(d('2026-10-05'), d('2026-10-11'))).toBe(5);
        expect(cal.countWorking(d('2026-10-11'), d('2026-10-05'))).toBe(0);
        expect(iso(cal.endFor(d('2026-10-08'), 3))).toBe('2026-10-12'); // Thu, Fri, Mon
        expect(iso(cal.endFor(d('2026-10-10'), 1))).toBe('2026-10-12'); // starts on a day off: moves
        expect(iso(cal.startFor(d('2026-10-12'), 3))).toBe('2026-10-08');
        expect(cal.endFor(d('2026-10-08'), 0)).toBe(d('2026-10-08')); // milestone
    });

    it('honours holidays and a different week', () => {
        const withHoliday = new WorkCalendar({ holidays: [{ from: d('2026-10-12'), to: d('2026-10-12') }] });

        expect(withHoliday.isWorking(d('2026-10-12'))).toBe(false);
        expect(iso(withHoliday.addWorking(d('2026-10-09'), 1))).toBe('2026-10-13');

        const sixDays = new WorkCalendar({ workWeek: [1, 2, 3, 4, 5, 6] });

        expect(sixDays.isWorking(d('2026-10-10'))).toBe(true);
        expect(sixDays.isWorking(d('2026-10-11'))).toBe(false);
    });

    it('lists the runs of days off', () => {
        expect(cal.nonWorkingRuns(d('2026-10-05'), d('2026-10-18'))).toEqual([
            { from: d('2026-10-10'), to: d('2026-10-11') },
            { from: d('2026-10-17'), to: d('2026-10-18') }
        ]);
        expect(cal.nonWorkingRuns(d('2026-10-10'), d('2026-10-10'))).toEqual([{ from: d('2026-10-10'), to: d('2026-10-10') }]);
    });
});

describe('WorkCalendar with slots in a day', () => {
    const cal = new WorkCalendar({ slots: 8 });
    const fri = d('2026-10-09');
    const mon = d('2026-10-12');
    const u = (day: number, slot: number) => day * 8 + slot;

    it('knows the day and the first unit of a day', () => {
        expect(cal.dayOf(u(fri, 5))).toBe(fri);
        expect(cal.unitOf(fri)).toBe(u(fri, 0));
        expect(cal.isWorking(u(fri, 7))).toBe(true);
        expect(cal.isWorking(u(fri + 1, 0))).toBe(false);
    });

    it('steps over the night and the weekend, both ways', () => {
        expect(cal.addWorking(u(fri, 6), 1)).toBe(u(fri, 7));
        expect(cal.addWorking(u(fri, 7), 1)).toBe(u(mon, 0));
        expect(cal.addWorking(u(fri, 2), 20)).toBe(u(mon + 1, 6)); // 5 left on Friday, 8 on Monday, then 7 into Tuesday
        expect(cal.addWorking(u(mon, 0), -1)).toBe(u(fri, 7));
        expect(cal.addWorking(u(mon + 1, 3), -12)).toBe(u(fri, 7)); // 3 to Tuesday's start, 1 to the end of Monday, 7 to its start, 1 to the end of Friday
    });

    it('counts and finds the ends of a task in hours', () => {
        expect(cal.countWorking(u(fri, 4), u(mon, 3))).toBe(4 + 4);
        expect(cal.endFor(u(fri, 6), 4)).toBe(u(mon, 1)); // Fri 6 and 7, Mon 0 and 1
        expect(cal.startFor(u(mon, 1), 4)).toBe(u(fri, 6));
        expect(cal.nextWorking(u(fri + 1, 5))).toBe(u(mon, 0));
        expect(cal.prevWorking(u(fri + 1, 5))).toBe(u(fri, 7));
    });

    it('agrees with the day calendar when a day has one slot', () => {
        const days = new WorkCalendar();

        for (const n of [-7, -1, 0, 1, 3, 9]) expect(days.addWorking(fri, n)).toBe(new WorkCalendar({ slots: 1 }).addWorking(fri, n));
    });
});

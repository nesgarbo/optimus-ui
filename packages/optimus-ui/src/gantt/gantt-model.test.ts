import { describe, expect, it } from 'vitest';
import { WorkCalendar, fromDay, parseDay } from './gantt-calendar';
import { buildProject, findCycles, findOverallocated, formatDependencies, markCritical, parseDependencies, readProject, schedule, toTask, visibleNodes } from './gantt-model';

const cal = new WorkCalendar();
const d = (iso: string) => parseDay(iso)!;
const iso = (day: number) => {
    const x = fromDay(day);

    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};
const START = d('2026-10-05'); // a Monday
const project = (data: any[]) => buildProject(data, {}, cal, START);
const node = (p: ReturnType<typeof project>, id: string) => p.byId.get(id)!;
const span = (p: ReturnType<typeof project>, id: string) => [iso(node(p, id).start), iso(node(p, id).end)];

describe('dependencies text', () => {
    it('parses types and offsets', () => {
        expect(parseDependencies('2FS+1d, 3SS, 4ff-2d,5SF')).toEqual([
            { id: '2', type: 'FS', offset: 1 },
            { id: '3', type: 'SS', offset: 0 },
            { id: '4', type: 'FF', offset: -2 },
            { id: '5', type: 'SF', offset: 0 }
        ]);
        expect(parseDependencies('7')).toEqual([{ id: '7', type: 'FS', offset: 0 }]);
        expect(parseDependencies('task-1')).toEqual([{ id: 'task-1', type: 'FS', offset: 0 }]);
        expect(parseDependencies('A1FS+2days')).toEqual([{ id: 'A1', type: 'FS', offset: 2 }]);
        expect(parseDependencies('')).toEqual([]);
        expect(parseDependencies(null)).toEqual([]);
    });

    it('writes them back', () => {
        expect(formatDependencies(parseDependencies('2FS+1d, 3SS, 4FF-2d'))).toBe('2FS+1d,3SS,4FF-2d');
    });
});

describe('reading the data', () => {
    it('reads a nested list, with dates from a start and a duration or an end', () => {
        const p = project([
            { id: 1, name: 'Plan', startDate: '2026-10-05', duration: 5 },
            { id: 2, name: 'Build', startDate: '2026-10-05', endDate: '2026-10-09', child: [{ id: 3, name: 'Walls', startDate: '2026-10-05', duration: 2 }] }
        ]);

        expect(span(p, '1')).toEqual(['2026-10-05', '2026-10-09']);
        expect(node(p, '1').duration).toBe(5);
        expect(node(p, '2').duration).toBe(2); // rolled up from its one child
        expect(p.nodes.map((n) => [n.id, n.level, n.parentId])).toEqual([
            ['1', 0, null],
            ['2', 0, null],
            ['3', 1, '2']
        ]);
    });

    it('reads a flat list by parentID, in the order given', () => {
        const p = project([
            { id: 'a', parentID: null, startDate: '2026-10-05', duration: 1 },
            { id: 'a2', parentID: 'a', startDate: '2026-10-06', duration: 2 },
            { id: 'a1', parentID: 'a', startDate: '2026-10-05', duration: 1 },
            { id: 'b', startDate: '2026-10-07', duration: 1 }
        ]);

        expect(p.nodes.map((n) => n.id)).toEqual(['a', 'a2', 'a1', 'b']);
        expect(node(p, 'a').childIds).toEqual(['a2', 'a1']);
        expect(span(p, 'a')).toEqual(['2026-10-05', '2026-10-07']);
    });

    it('counts days off out of a duration, makes milestones, and places a task with no start', () => {
        const p = project([
            { id: 1, startDate: '2026-10-08', duration: 3 },
            { id: 2, startDate: '2026-10-08', duration: 0 },
            { id: 3, duration: 2 }
        ]);

        expect(span(p, '1')).toEqual(['2026-10-08', '2026-10-12']);
        expect(toTask(node(p, '2'), true).isMilestone).toBe(true);
        expect(node(p, '3').placed).toBe(true);
        expect(iso(node(p, '3').start)).toBe('2026-10-05');
    });

    it('reports a duplicate id and a missing predecessor, and drops what cannot work', () => {
        const p = project([
            { id: 1, dependency: '9, 1' },
            { id: 1, startDate: '2026-10-06' }
        ]);

        expect(p.problems.map((x) => x.kind).sort()).toEqual(['duplicateId', 'missingPredecessor']);
        expect(node(p, '1').deps).toEqual([]);
        expect(p.nodes).toHaveLength(2);
    });

    it('does not let a task wait on its parent or its child', () => {
        const p = project([{ id: 'p', dependency: 'c', child: [{ id: 'c', dependency: 'p' }] }]);

        expect(node(p, 'p').deps).toEqual([]);
        expect(node(p, 'c').deps).toEqual([]);
    });
});

describe('scheduling', () => {
    const a = { id: 'a', startDate: '2026-10-05', duration: 3 }; // Mon-Wed

    it('pushes a finish-to-start successor to the day after, over a weekend', () => {
        const p = project([
            { ...a, duration: 5 },
            { id: 'b', startDate: '2026-10-05', duration: 2, dependency: 'a' }
        ]);

        expect(span(p, 'b')).toEqual(['2026-10-12', '2026-10-13']);
    });

    it('applies offsets, and never pulls a task earlier', () => {
        const p = project([a, { id: 'b', startDate: '2026-10-05', duration: 1, dependency: 'aFS+2d' }, { id: 'c', startDate: '2026-10-20', duration: 1, dependency: 'a' }]);

        expect(span(p, 'b')).toEqual(['2026-10-12', '2026-10-12']); // the day after Wed is Thu, and two worked days on is Mon
        expect(iso(node(p, 'c').start)).toBe('2026-10-20'); // already later than it must be
    });

    it('does start-to-start, finish-to-finish and start-to-finish', () => {
        const p = project([a, { id: 'ss', startDate: '2026-10-05', duration: 2, dependency: 'aSS+1d' }, { id: 'ff', startDate: '2026-10-05', duration: 2, dependency: 'aFF' }, { id: 'sf', startDate: '2026-10-05', duration: 2, dependency: 'aSF+4d' }]);

        expect(span(p, 'ss')).toEqual(['2026-10-06', '2026-10-07']);
        expect(span(p, 'ff')).toEqual(['2026-10-06', '2026-10-07']); // must end when a ends (Wed)
        expect(span(p, 'sf')).toEqual(['2026-10-08', '2026-10-09']); // a starts Mon, +4 working days = Fri: it must end then
    });

    it('chains, and rolls the parents up and their progress', () => {
        const p = project([
            {
                id: 'p',
                name: 'Phase',
                child: [
                    { id: 'x', startDate: '2026-10-05', duration: 2, progress: 100 },
                    { id: 'y', startDate: '2026-10-05', duration: 2, progress: 0, dependency: 'x' }
                ]
            },
            { id: 'z', startDate: '2026-10-05', duration: 1, dependency: 'p' }
        ]);

        expect(span(p, 'y')).toEqual(['2026-10-07', '2026-10-08']);
        expect(span(p, 'p')).toEqual(['2026-10-05', '2026-10-08']);
        expect(node(p, 'p').progress).toBe(50);
        expect(iso(node(p, 'z').start)).toBe('2026-10-09');
    });

    it('shifts the children of a parent that has a predecessor', () => {
        const p = project([
            { id: 'a', startDate: '2026-10-05', duration: 3 },
            {
                id: 'p',
                dependency: 'a',
                child: [
                    { id: 'k1', startDate: '2026-10-05', duration: 1 },
                    { id: 'k2', startDate: '2026-10-06', duration: 1 }
                ]
            }
        ]);

        expect(iso(node(p, 'k1').start)).toBe('2026-10-08');
        expect(iso(node(p, 'k2').start)).toBe('2026-10-09');
    });

    it('survives a loop, and says so', () => {
        const p = project([
            { id: 'a', startDate: '2026-10-05', duration: 1, dependency: 'b' },
            { id: 'b', startDate: '2026-10-05', duration: 1, dependency: 'a' }
        ]);

        expect(p.problems.some((x) => x.kind === 'cycle')).toBe(true);
        expect(
            findCycles(
                readProject(
                    [
                        { id: 'a', dependency: 'b' },
                        { id: 'b', dependency: 'a' }
                    ],
                    {},
                    cal,
                    START
                )
            )
        ).toHaveLength(1);
    });

    it('moves nothing when nothing is in the way', () => {
        const p = readProject([a], {}, cal, START);

        expect(schedule(p, cal)).toEqual([]);
    });
});

describe('critical path', () => {
    it('marks the longest chain and leaves the slack tasks alone', () => {
        const p = project([
            { id: 'a', startDate: '2026-10-05', duration: 2 },
            { id: 'b', startDate: '2026-10-05', duration: 5, dependency: 'a' }, // long branch
            { id: 'c', startDate: '2026-10-05', duration: 1, dependency: 'a' }, // short branch
            { id: 'd', startDate: '2026-10-05', duration: 1, dependency: 'b, c' }
        ]);

        expect(['a', 'b', 'd'].every((id) => node(p, id).critical)).toBe(true);
        expect(node(p, 'c').critical).toBe(false);
    });

    it('marks a parent when a child is critical, and ignores a task off to one side', () => {
        const p = project([
            {
                id: 'p',
                child: [
                    { id: 'k1', startDate: '2026-10-05', duration: 3 },
                    { id: 'k2', startDate: '2026-10-05', duration: 1, dependency: 'k1' }
                ]
            },
            { id: 'solo', startDate: '2026-10-05', duration: 1 }
        ]);

        expect(node(p, 'p').critical).toBe(true);
        expect(node(p, 'solo').critical).toBe(false);
    });

    it('respects the type of the link', () => {
        const p = project([
            { id: 'a', startDate: '2026-10-05', duration: 4 },
            { id: 'b', startDate: '2026-10-05', duration: 2, dependency: 'aSS' },
            { id: 'end', startDate: '2026-10-09', duration: 1, dependency: 'aFS' }
        ]);

        markCritical(p, cal);
        expect(node(p, 'a').critical).toBe(true);
        expect(node(p, 'end').critical).toBe(true);
        expect(node(p, 'b').critical).toBe(false);
    });
});

describe('visibility', () => {
    it('hides what lies under a collapsed parent, at any depth', () => {
        const p = project([
            {
                id: 'p',
                child: [
                    { id: 'q', child: [{ id: 'r', startDate: '2026-10-05' }] },
                    { id: 's', startDate: '2026-10-05' }
                ]
            },
            { id: 't', startDate: '2026-10-05' }
        ]);

        expect(visibleNodes(p, new Set()).map((n) => n.id)).toEqual(['p', 'q', 'r', 's', 't']);
        expect(visibleNodes(p, new Set(['q'])).map((n) => n.id)).toEqual(['p', 'q', 's', 't']);
        expect(visibleNodes(p, new Set(['p'])).map((n) => n.id)).toEqual(['p', 't']);
    });
});

describe('critical path to a milestone', () => {
    it('counts the day between a task and the milestone that follows it', () => {
        const p = project([
            { id: 'a', startDate: '2026-10-05', duration: 3 },
            { id: 'b', startDate: '2026-10-05', duration: 2, dependency: 'a' },
            { id: 'm', startDate: '2026-10-05', duration: 0, dependency: 'b' }
        ]);

        expect(iso(node(p, 'm').start)).toBe('2026-10-12'); // b ends Fri 9: the next worked day is Mon
        expect(['a', 'b', 'm'].every((id) => node(p, id).critical)).toBe(true);
    });
});

describe('tasks counted in hours', () => {
    const hours = new WorkCalendar({ durationUnit: 'hour' }); // 8 to 16: eight slots a day
    const at = (day: string, time: string) => `${day}T${time}`;
    const build = (data: any[]) => buildProject(data, {}, hours, d('2026-10-05'));
    const clock = (n: { start: number; end: number }) => {
        const f = (u: number, e: 'start' | 'end') => {
            const x = hours.toDate(u, e);

            return `${iso(Math.floor(Date.UTC(x.getFullYear(), x.getMonth(), x.getDate()) / 86_400_000))} ${String(x.getHours()).padStart(2, '0')}:${String(x.getMinutes()).padStart(2, '0')}`;
        };

        return [f(n.start, 'start'), f(n.end, 'end')];
    };

    it('reads times into slots and lengths in hours', () => {
        const p = build([
            { id: 'a', startDate: at('2026-10-05', '08:00'), duration: 4 },
            { id: 'b', startDate: at('2026-10-05', '10:00'), duration: 1.5 }
        ]);

        expect(clock(node(p, 'a'))).toEqual(['2026-10-05 08:00', '2026-10-05 12:00']);
        expect(node(p, 'a').duration).toBe(4);
        expect(toTask(node(p, 'a'), true, hours).duration).toBe(4);
        expect(node(p, 'b').duration).toBe(2); // rounded to a whole hour: that is a slot
    });

    it('starts a successor at the hour the predecessor ends, and gives it a gap in hours', () => {
        const p = build([
            { id: 'a', startDate: at('2026-10-05', '08:00'), duration: 4 },
            { id: 'b', startDate: at('2026-10-05', '08:00'), duration: 2, dependency: 'a' },
            { id: 'c', startDate: at('2026-10-05', '08:00'), duration: 1, dependency: 'bFS+2h' }
        ]);

        expect(clock(node(p, 'b'))).toEqual(['2026-10-05 12:00', '2026-10-05 14:00']);
        expect(clock(node(p, 'c'))).toEqual(['2026-10-06 08:00', '2026-10-06 09:00']);
    });

    it('carries a task over the night and the weekend', () => {
        const p = build([{ id: 'a', startDate: at('2026-10-09', '15:00'), duration: 3 }]);

        expect(clock(node(p, 'a'))).toEqual(['2026-10-09 15:00', '2026-10-12 10:00']);
    });

    it('rolls a parent up in hours', () => {
        const p = build([
            {
                id: 'p',
                child: [
                    { id: 'k1', startDate: at('2026-10-05', '08:00'), duration: 2 },
                    { id: 'k2', startDate: at('2026-10-05', '14:00'), duration: 2 }
                ]
            }
        ]);

        expect(clock(node(p, 'p'))).toEqual(['2026-10-05 08:00', '2026-10-05 16:00']);
        expect(node(p, 'p').duration).toBe(8);
    });

    it('lets two half shares of a resource overlap in an hour, and not three', () => {
        const f = { resourceInfo: 'who' };
        const data = [
            { id: 'a', startDate: at('2026-10-05', '08:00'), duration: 3, who: 'x' },
            { id: 'b', startDate: at('2026-10-05', '10:00'), duration: 3, who: 'x' },
            { id: 'c', startDate: at('2026-10-05', '14:00'), duration: 2, who: 'x' }
        ];
        const p = buildProject(data, f, hours, d('2026-10-05'));

        expect([...findOverallocated(p, [{ id: 'x', name: 'X' }])].sort()).toEqual(['a', 'b']); // a and b share 10:00-11:00; c is alone
        expect(findOverallocated(p, [{ id: 'x', name: 'X', unit: 50 }]).size).toBe(0);
    });
});

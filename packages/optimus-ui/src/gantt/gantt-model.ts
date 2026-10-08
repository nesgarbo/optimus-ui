import type { GanttDependency, GanttDependencyType, GanttInvalidEvent, GanttResource, GanttTask, GanttTaskFields } from '@openng/optimus-ui/types/gantt';
import { WorkCalendar, type Day } from './gantt-calendar';

/**
 * The project: reading tasks out of data, scheduling them by their dependencies, rolling the parents
 * up from their children, and finding the critical path.
 *
 * Pure. Dates are whole days, counted in worked days as the calendar says.
 *
 * @module gantt-model
 */

/** A task with its dates as day numbers, which is what the arithmetic wants. */
export interface Node {
    id: string;
    index: number;
    level: number;
    parentId: string | null;
    childIds: string[];
    name: string;
    start: Day;
    end: Day;
    duration: number;
    progress: number;
    deps: GanttDependency[];
    critical: boolean;
    notes?: string;
    data: any;
    /** `true` when the data gave no start and the project had to place it. */
    placed: boolean;
    /** The plan: its first and last day, when the data has them. */
    baselineStart: Day | null;
    baselineEnd: Day | null;
    /** Ids of what is assigned. */
    resourceIds: string[];
}

/** The fields, with Syncfusion's names where the caller names none. */
export const DEFAULT_FIELDS: Required<Pick<GanttTaskFields, 'id' | 'name' | 'startDate' | 'endDate' | 'duration' | 'progress' | 'dependency' | 'parentID' | 'child'>> = {
    id: 'id',
    name: 'name',
    startDate: 'startDate',
    endDate: 'endDate',
    duration: 'duration',
    progress: 'progress',
    dependency: 'dependency',
    parentID: 'parentID',
    child: 'child'
};

/** Reads `2FS+1d, 3SS, 4` into dependencies. What does not parse is left out. */
export function parseDependencies(text: unknown): GanttDependency[] {
    if (text === null || text === undefined || text === '') return [];

    const out: GanttDependency[] = [];

    for (const part of String(text).split(',')) {
        const m = /^\s*(.+?)\s*(FS|SS|FF|SF)?\s*(?:([+-])\s*(\d+(?:\.\d+)?)\s*(d|day|days|h|hr|hrs|hour|hours|m|min|mins|minute|minutes))?\s*$/i.exec(part);

        if (!m || !m[1]) continue;

        // The offset needs its unit, so that an id like `task-1` is an id and not `task` less one day.
        const id = m[1].trim();
        const type = (m[2]?.toUpperCase() ?? 'FS') as GanttDependencyType;
        const offset = m[4] ? (m[3] === '-' ? -1 : 1) * Number(m[4]) : 0;
        const unitChar = (m[5] ?? 'd')[0].toLowerCase();

        out.push(unitChar === 'h' ? { id, type, offset, offsetUnit: 'h' } : unitChar === 'm' ? { id, type, offset, offsetUnit: 'm' } : { id, type, offset });
    }

    return out;
}

/** Writes dependencies back as text. */
export const formatDependencies = (deps: readonly GanttDependency[]): string => deps.map((d) => `${d.id}${d.type}${d.offset ? `${d.offset > 0 ? '+' : '-'}${Math.abs(d.offset)}${d.offsetUnit ?? 'd'}` : ''}`).join(',');

/** The result of reading the data. */
export interface Project {
    nodes: Node[];
    byId: Map<string, Node>;
    problems: GanttInvalidEvent[];
}

/** Reads the ids of the resources of a task: a list, or a comma separated string, of ids or of objects with an `id`. */
export function readResourceIds(value: unknown): string[] {
    const list = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : value === undefined || value === null || value === '' ? [] : [value];

    return list
        .map((v) => (v !== null && typeof v === 'object' ? (v as any).id : v))
        .filter((v) => v !== undefined && v !== null && String(v).trim() !== '')
        .map((v) => String(v).trim());
}

const num = (v: unknown, fallback: number) => {
    const n = typeof v === 'string' ? parseFloat(v) : (v as number);

    return typeof n === 'number' && Number.isFinite(n) ? n : fallback;
};

/** Reads data items into tasks. Handles a nested `child` list and a flat `parentID` list, in the order given. */
export function readProject(data: readonly any[], fieldsIn: GanttTaskFields, calendar: WorkCalendar, defaultStart: Day): Project {
    const f = { ...DEFAULT_FIELDS, ...fieldsIn };
    const nodes: Node[] = [];
    const byId = new Map<string, Node>();
    const problems: GanttInvalidEvent[] = [];
    let auto = 0;

    const make = (raw: any, level: number, parentId: string | null): Node => {
        let id = raw?.[f.id] === undefined || raw?.[f.id] === null ? `task-${++auto}` : String(raw[f.id]);

        if (byId.has(id)) {
            problems.push({ kind: 'duplicateId', ids: [id], message: `The task id "${id}" is used more than once` });
            id = `${id}#${++auto}`;
        }

        const startGiven = calendar.parseUnit(raw?.[f.startDate], 'start');
        const endGiven = calendar.parseUnit(raw?.[f.endDate], 'end');
        const durationGiven = raw?.[f.duration];
        let start = startGiven ?? calendar.unitOf(defaultStart);
        let end: number;
        let duration: number;

        if (endGiven !== null && endGiven >= start) {
            end = endGiven;
            duration = calendar.countWorking(start, end);
            // A task that lies wholly on days off still takes one.
            if (duration === 0 && durationGiven !== 0) duration = 1;
        } else {
            // The data writes a length in the unit of the gantt; the arithmetic counts slots.
            duration = Math.max(0, Math.round(num(durationGiven, 1) * calendar.unitsPer()));
            start = duration === 0 ? start : calendar.nextWorking(start);
            end = calendar.endFor(start, duration);
        }

        const node: Node = {
            id,
            index: nodes.length,
            level,
            parentId,
            childIds: [],
            name: String(raw?.[f.name] ?? ''),
            start,
            end,
            duration,
            progress: Math.min(Math.max(num(raw?.[f.progress], 0), 0), 100),
            deps: parseDependencies(raw?.[f.dependency]),
            critical: false,
            notes: fieldsIn.notes ? raw?.[fieldsIn.notes] : undefined,
            data: raw,
            placed: startGiven === null,
            baselineStart: fieldsIn.baselineStartDate ? calendar.parseUnit(raw?.[fieldsIn.baselineStartDate], 'start') : null,
            baselineEnd: fieldsIn.baselineEndDate ? calendar.parseUnit(raw?.[fieldsIn.baselineEndDate], 'end') : null,
            resourceIds: fieldsIn.resourceInfo ? readResourceIds(raw?.[fieldsIn.resourceInfo]) : []
        };

        nodes.push(node);
        byId.set(id, node);

        if (parentId) byId.get(parentId)!.childIds.push(id);

        return node;
    };

    const nested = (items: readonly any[], level: number, parentId: string | null) => {
        for (const raw of items) {
            const node = make(raw, level, parentId);
            const kids = raw?.[f.child];

            if (Array.isArray(kids) && kids.length) nested(kids, level + 1, node.id);
        }
    };

    const usesParentIds = data.some((r) => r?.[f.parentID] !== undefined && r?.[f.parentID] !== null && r?.[f.parentID] !== '');

    if (!usesParentIds) {
        nested(data, 0, null);
    } else {
        // Flat: place each item under its parent, keeping the order of the data among siblings.
        const raws = data.map((raw) => ({ raw, id: raw?.[f.id], parent: raw?.[f.parentID] }));
        const kidsOf = new Map<string, typeof raws>();
        const roots: typeof raws = [];
        const known = new Set(raws.map((r) => String(r.id)));

        for (const r of raws) {
            const p = r.parent === undefined || r.parent === null || r.parent === '' ? null : String(r.parent);

            if (p === null || !known.has(p)) roots.push(r);
            else kidsOf.set(p, [...(kidsOf.get(p) ?? []), r]);
        }

        const walk = (items: typeof raws, level: number, parentId: string | null, seen: Set<string>) => {
            for (const r of items) {
                if (seen.has(String(r.id))) continue; // a parent cycle

                seen.add(String(r.id));

                const node = make(r.raw, level, parentId);

                walk(kidsOf.get(String(r.id)) ?? [], level + 1, node.id, seen);
            }
        };

        walk(roots, 0, null, new Set());
    }

    for (const n of nodes) {
        for (const d of n.deps) {
            if (!byId.has(d.id)) problems.push({ kind: 'missingPredecessor', ids: [n.id, d.id], message: `Task "${n.id}" depends on "${d.id}", which does not exist` });
        }

        // Dependencies on itself, on a missing task or on a parent of itself are dropped.
        n.deps = n.deps.filter((d) => d.id !== n.id && byId.has(d.id) && !isAncestor(byId, d.id, n.id) && !isAncestor(byId, n.id, d.id));
    }

    return { nodes, byId, problems };
}

function isAncestor(byId: Map<string, Node>, ancestorId: string, id: string): boolean {
    for (let p = byId.get(id)?.parentId; p; p = byId.get(p)?.parentId) if (p === ancestorId) return true;

    return false;
}

/** Ids of tasks that wait on themselves through a chain of dependencies, one chain at a time. */
export function findCycles(project: Project): string[][] {
    const state = new Map<string, 0 | 1 | 2>();
    const cycles: string[][] = [];
    const stack: string[] = [];

    const visit = (id: string) => {
        state.set(id, 1);
        stack.push(id);

        for (const d of project.byId.get(id)!.deps) {
            if (state.get(d.id) === 1) cycles.push(stack.slice(stack.indexOf(d.id)));
            else if (!state.get(d.id)) visit(d.id);
        }

        stack.pop();
        state.set(id, 2);
    };

    for (const n of project.nodes) if (!state.get(n.id)) visit(n.id);

    return cycles;
}

/** Sets the dates of every parent from its children. */
export function rollUp(project: Project, calendar: WorkCalendar): void {
    // Preorder reversed visits children before their parent.
    for (let i = project.nodes.length - 1; i >= 0; i--) {
        const n = project.nodes[i];

        if (!n.childIds.length) continue;

        const kids = n.childIds.map((id) => project.byId.get(id)!);

        n.start = Math.min(...kids.map((k) => k.start));
        n.end = Math.max(...kids.map((k) => k.end));
        n.duration = calendar.countWorking(n.start, n.end);

        const weight = kids.reduce((s, k) => s + Math.max(k.duration, 1), 0);

        n.progress = Math.round((kids.reduce((s, k) => s + k.progress * Math.max(k.duration, 1), 0) / weight) * 100) / 100;
    }
}

/** The gap of a dependency in units of time. */
export function offsetUnits(dep: GanttDependency, calendar: WorkCalendar): number {
    return Math.round(dep.offset * calendar.unitsPer(dep.offsetUnit === 'h' ? 'hour' : dep.offsetUnit === 'm' ? 'minute' : 'day'));
}

/** The earliest start a predecessor allows a task. */
function earliestStart(n: Node, pred: Node, dep: GanttDependency, calendar: WorkCalendar): number {
    const off = offsetUnits(dep, calendar);

    switch (dep.type) {
        case 'SS':
            return calendar.addWorking(pred.start, off);
        case 'FF':
            return n.duration === 0 ? calendar.addWorking(pred.end, off) : calendar.startFor(calendar.addWorking(pred.end, off), n.duration);
        case 'SF':
            return n.duration === 0 ? calendar.addWorking(pred.start, off) : calendar.startFor(calendar.addWorking(pred.start, off), n.duration);
        default:
            // Finish to start: the first worked unit after the predecessor ends, then the gap. A milestone predecessor ends where it is.
            return calendar.addWorking(calendar.nextWorking(pred.end + (pred.duration === 0 ? 0 : 1)), off);
    }
}

/**
 * Moves every task later when a predecessor demands it, and rolls the parents up. A task never moves
 * earlier: a gap the plan leaves is the plan's.
 *
 * Tasks that sit in a cycle are not moved. Returns the ids of the tasks whose dates changed.
 */
export function schedule(project: Project, calendar: WorkCalendar): string[] {
    const moved = new Set<string>();
    const limit = project.nodes.length + 2;

    rollUp(project, calendar);

    for (let pass = 0; pass < limit; pass++) {
        let changed = false;

        for (const n of project.nodes) {
            if (n.childIds.length || !n.deps.length) continue;

            let want = n.start;

            for (const d of n.deps) want = Math.max(want, earliestStart(n, project.byId.get(d.id)!, d, calendar));

            if (want > n.start) {
                n.start = want;
                n.end = calendar.endFor(want, n.duration);
                moved.add(n.id);
                changed = true;
            }
        }

        rollUp(project, calendar);

        // A parent with a predecessor pushes all of its children.
        for (const n of project.nodes) {
            if (!n.childIds.length || !n.deps.length) continue;

            let want = n.start;

            for (const d of n.deps) want = Math.max(want, earliestStart(n, project.byId.get(d.id)!, d, calendar));

            if (want > n.start) {
                const shift = calendar.countWorking(n.start, want) - 1;

                shiftSubtree(project, n, shift, calendar, moved);
                changed = true;
            }
        }

        if (!changed) break;
    }

    return [...moved];
}

function shiftSubtree(project: Project, parent: Node, workingDays: number, calendar: WorkCalendar, moved: Set<string>): void {
    for (const id of parent.childIds) {
        const k = project.byId.get(id)!;

        if (k.childIds.length) {
            shiftSubtree(project, k, workingDays, calendar, moved);
        } else {
            k.start = calendar.addWorking(k.start, workingDays);
            k.end = calendar.endFor(k.start, k.duration);
            moved.add(k.id);
        }
    }

    rollUp(project, calendar);
}

/**
 * Marks the tasks that have no slack: a delay of one delays the project. Leaf tasks that are linked into
 * the network are measured by a forward and a backward pass; a parent is critical when a child is.
 */
export function markCritical(project: Project, calendar: WorkCalendar): void {
    const leaves = project.nodes.filter((n) => !n.childIds.length);

    for (const n of project.nodes) n.critical = false;

    if (!leaves.length) return;

    const finish = Math.max(...leaves.map((n) => n.end));
    const successors = new Map<string, { node: Node; dep: GanttDependency }[]>();

    // A dependency on a parent stands for its children: the leaves carry it.
    const leafIds = (n: Node): Node[] => (n.childIds.length ? n.childIds.flatMap((id) => leafIds(project.byId.get(id)!)) : [n]);

    for (const n of project.nodes) {
        for (const dep of n.deps) {
            const pred = project.byId.get(dep.id)!;

            for (const from of leafIds(pred)) for (const to of leafIds(n)) successors.set(from.id, [...(successors.get(from.id) ?? []), { node: to, dep }]);
        }
    }

    // Latest finish and latest start of each leaf, found from the last task back. Cycles are cut by the visit set.
    const lateFinish = new Map<string, number>();
    const lateStart = new Map<string, number>();
    const done = new Set<string>();

    const late = (n: Node): void => {
        if (done.has(n.id)) return;

        done.add(n.id);

        let lf = finish;
        let ls = n.duration === 0 ? finish : calendar.startFor(finish, n.duration);

        for (const { node: succ, dep } of successors.get(n.id) ?? []) {
            late(succ);

            const sls = lateStart.get(succ.id);
            const slf = lateFinish.get(succ.id);

            if (sls === undefined || slf === undefined) continue; // part of a cycle

            let candidateFinish: number;

            switch (dep.type) {
                case 'SS':
                    candidateFinish = n.duration === 0 ? calendar.addWorking(sls, -offsetUnits(dep, calendar)) : calendar.addWorking(calendar.addWorking(sls, -offsetUnits(dep, calendar)), n.duration - 1);
                    break;
                case 'FF':
                    candidateFinish = calendar.addWorking(slf, -offsetUnits(dep, calendar));
                    break;
                case 'SF':
                    candidateFinish = n.duration === 0 ? calendar.addWorking(slf, -offsetUnits(dep, calendar)) : calendar.addWorking(calendar.addWorking(slf, -offsetUnits(dep, calendar)), n.duration - 1);
                    break;
                default:
                    // A milestone predecessor lets its successor start the same day; any other ends the day before.
                    candidateFinish = calendar.addWorking(calendar.prevWorking(sls - (n.duration === 0 ? 0 : 1)), -offsetUnits(dep, calendar));
            }

            if (candidateFinish < lf) {
                lf = candidateFinish;
                ls = n.duration === 0 ? lf : calendar.startFor(lf, n.duration);
            }
        }

        lateFinish.set(n.id, lf);
        lateStart.set(n.id, ls);
    };

    for (const n of leaves) late(n);

    for (const n of leaves) {
        const ls = lateStart.get(n.id);

        // No slack: it cannot start later than it does, and still end the project on time.
        n.critical = ls !== undefined && calendar.countWorking(n.start, ls) <= 1;
    }

    // A parent is critical when a child is.
    for (let i = project.nodes.length - 1; i >= 0; i--) {
        const n = project.nodes[i];

        if (n.childIds.length) n.critical = n.childIds.some((id) => project.byId.get(id)!.critical);
    }
}

/** Reads, schedules and marks, in one call. */
export function buildProject(data: readonly any[], fields: GanttTaskFields, calendar: WorkCalendar, defaultStart: Day): Project {
    const project = readProject(data, fields, calendar, defaultStart);

    for (const cycle of findCycles(project)) {
        project.problems.push({ kind: 'cycle', ids: cycle, message: `Tasks wait on each other in a loop: ${cycle.join(' → ')}` });

        // Cut the loop where it closes, so scheduling can finish.
        const last = project.byId.get(cycle[cycle.length - 1])!;

        last.deps = last.deps.filter((d) => d.id !== cycle[0]);
    }

    schedule(project, calendar);
    markCritical(project, calendar);

    return project;
}

/** The public view of a node. `resources` are those the project knows; `overallocated` the ids of tasks that share a resource at the same time. */
export function toTask(n: Node, expanded: boolean, calendar: WorkCalendar = new WorkCalendar(), resources: readonly GanttResource[] = [], overallocated: ReadonlySet<string> = new Set()): GanttTask {
    const planned = n.baselineEnd;
    const per = calendar.unitsPer();
    const late = planned === null ? null : n.end === planned ? 0 : n.end > planned ? calendar.countWorking(planned + 1, n.end) : -calendar.countWorking(n.end + 1, planned);
    const variance = late === null ? null : Math.round((late / per) * 100) / 100;

    return {
        id: n.id,
        index: n.index,
        level: n.level,
        parentId: n.parentId,
        childIds: n.childIds,
        name: n.name,
        startDate: calendar.toDate(n.start, 'start'),
        endDate: calendar.toDate(n.end, 'end'),
        duration: Math.round((n.duration / per) * 100) / 100,
        progress: n.progress,
        dependencies: n.deps,
        isParent: n.childIds.length > 0,
        isMilestone: n.duration === 0 && !n.childIds.length,
        isCritical: n.critical,
        expanded,
        notes: n.notes,
        baselineStartDate: n.baselineStart === null ? null : calendar.toDate(n.baselineStart, 'start'),
        baselineEndDate: n.baselineEnd === null ? null : calendar.toDate(n.baselineEnd, 'end'),
        variance,
        resources: n.resourceIds.map((id) => resources.find((r) => String(r.id) === id) ?? { id, name: id }),
        isOverallocated: overallocated.has(n.id),
        data: n.data
    };
}

/**
 * The ids of the tasks that need a resource while another task needs it too. A resource whose `unit` leaves room
 * (two tasks of 50% each) is not over-allocated.
 */
export function findOverallocated(project: Project, resources: readonly GanttResource[]): Set<string> {
    const out = new Set<string>();
    const leaves = project.nodes.filter((n) => !n.childIds.length && n.resourceIds.length && n.duration > 0);

    for (const r of new Set(leaves.flatMap((n) => n.resourceIds))) {
        const share = resources.find((x) => String(x.id) === r)?.unit ?? 100;
        const mine = leaves.filter((n) => n.resourceIds.includes(r));

        if (mine.length * share <= 100 + 1e-9) continue;

        // Sweep the edges of the tasks: between two edges the load is the sum of the shares of the tasks that cover them.
        const edges = [...new Set(mine.flatMap((n) => [n.start, n.end + 1]))].sort((a, b) => a - b);

        for (let i = 0; i < edges.length - 1; i++) {
            const here = mine.filter((n) => n.start <= edges[i] && n.end + 1 >= edges[i + 1]);

            if (here.length * share > 100 + 1e-9) here.forEach((n) => out.add(n.id));
        }
    }

    return out;
}

/** The tasks that are shown: those whose parents are all expanded. */
export function visibleNodes(project: Project, collapsed: ReadonlySet<string>): Node[] {
    return project.nodes.filter((n) => {
        for (let p = n.parentId; p; p = project.byId.get(p)!.parentId) if (collapsed.has(p)) return false;

        return true;
    });
}

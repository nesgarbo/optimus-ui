import type { GanttTaskFields } from '@openng/optimus-ui/types/gantt';
import { fromDay, WorkCalendar, type Day } from './gantt-calendar';
import { DEFAULT_FIELDS } from './gantt-model';

/**
 * Editing the data a Gantt was given, without touching it: every function returns a new array that
 * shares what did not change. Items are found by identity, so a list with no ids can be edited.
 *
 * Both shapes are understood: nested (`child`) and flat (`parentID`).
 *
 * @module gantt-data
 */

type Fields = Required<Pick<GanttTaskFields, 'id' | 'parentID' | 'child' | 'startDate' | 'endDate' | 'duration' | 'progress' | 'dependency'>>;

const fieldsOf = (f: GanttTaskFields): Fields => ({ ...DEFAULT_FIELDS, ...f });

const has = (v: unknown) => v !== undefined && v !== null && v !== '';

/** `true` when the data is a flat list that points at parents. */
export const isFlat = (data: readonly any[], f: GanttTaskFields): boolean => data.some((r) => has(r?.[fieldsOf(f).parentID]));

/** A date written the way the data keeps its dates: a string stays a string, a timestamp a timestamp. */
export function writeDay(previous: unknown, day: Day): Date | string | number {
    const date = fromDay(day);

    if (typeof previous === 'string') {
        const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        // Keep a time of day if the string had one.
        return /[T ]\d/.test(previous) ? `${iso}${previous.slice(10)}` : iso;
    }

    return typeof previous === 'number' ? date.getTime() : date;
}

/** A moment written the way the data keeps its dates: a string stays a string, a timestamp a timestamp, a date a date. */
export function writeUnit(previous: unknown, unit: number, calendar: WorkCalendar, edge: 'start' | 'end' = 'start'): Date | string | number {
    const date = calendar.toDate(unit, edge);

    if (typeof previous === 'string') {
        const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const time = `T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

        // Within a day the time matters; across days a string that had one keeps its own.
        return calendar.slots > 1 ? `${iso}${time}` : /[T ]\d/.test(previous) ? `${iso}${previous.slice(10)}` : iso;
    }

    return typeof previous === 'number' ? date.getTime() : date;
}

/**
 * What to write into a data item after its dates, length or progress changed. `start` and `end` are units of time of the
 * calendar, `duration` a count of them. Only fields the item uses are written, and the ones the dates need.
 */
export function patchFor(raw: any, f: GanttTaskFields, change: { start?: number; end?: number; duration?: number; progress?: number }, calendar: WorkCalendar = new WorkCalendar()): Record<string, any> {
    const k = fieldsOf(f);
    const patch: Record<string, any> = {};

    if (change.start !== undefined) patch[k.startDate] = writeUnit(raw?.[k.startDate], change.start, calendar, 'start');

    // The end is written when the item has one, or has no duration to say it instead.
    if (change.end !== undefined && (has(raw?.[k.endDate]) || !has(raw?.[k.duration]))) patch[k.endDate] = writeUnit(raw?.[k.endDate], change.end, calendar, 'end');
    if (change.duration !== undefined && (has(raw?.[k.duration]) || !has(raw?.[k.endDate]))) patch[k.duration] = Math.round((change.duration / calendar.unitsPer()) * 100) / 100;
    if (change.progress !== undefined) patch[k.progress] = change.progress;

    return patch;
}

function mapTree(items: readonly any[], key: string, fn: (item: any) => any | null | undefined | any[]): any[] {
    let changed = false;
    const out: any[] = [];

    for (const item of items) {
        const replaced = fn(item);

        if (replaced === null) {
            changed = true;
            continue;
        }

        if (Array.isArray(replaced)) {
            changed = true;
            out.push(...replaced);
            continue;
        }

        let next = replaced ?? item;

        if (Array.isArray(next?.[key])) {
            const kids = mapTree(next[key], key, fn);

            if (kids !== next[key]) next = { ...next, [key]: kids };
        }

        if (next !== item) changed = true;

        out.push(next);
    }

    return changed ? out : (items as any[]);
}

/** Merges `patch` into `target`. */
export function updateData(data: readonly any[], f: GanttTaskFields, target: any, patch: Record<string, any>): any[] {
    const k = fieldsOf(f);

    return mapTree(data, k.child, (item) => (item === target ? { ...item, ...patch } : undefined));
}

/** Applies several patches in one pass, keyed by the item they belong to. */
export function updateManyData(data: readonly any[], f: GanttTaskFields, patches: Map<any, Record<string, any>>): any[] {
    const k = fieldsOf(f);

    return mapTree(data, k.child, (item) => (patches.has(item) ? { ...item, ...patches.get(item) } : undefined));
}

/** Removes an item, and what hangs under it. */
export function removeData(data: readonly any[], f: GanttTaskFields, target: any): any[] {
    const k = fieldsOf(f);

    if (!isFlat(data, f)) return mapTree(data, k.child, (item) => (item === target ? null : undefined));

    const drop = new Set<any>([target]);

    for (let grew = true; grew;) {
        grew = false;

        for (const item of data) {
            if (!drop.has(item) && has(item?.[k.parentID]) && [...drop].some((d) => has(d?.[k.id]) && String(d[k.id]) === String(item[k.parentID]))) {
                drop.add(item);
                grew = true;
            }
        }
    }

    return data.filter((item) => !drop.has(item));
}

/** Adds an item as the last child of `parent`, or at the top level when there is none; `index` places it among its siblings. */
export function insertData(data: readonly any[], f: GanttTaskFields, item: any, parent: any | null, index?: number): any[] {
    const k = fieldsOf(f);

    if (isFlat(data, f) || (parent && !data.some((r) => Array.isArray(r?.[k.child])) && has(parent?.[k.id]) && !findNested(data, k.child, parent))) {
        const next = parent ? { ...item, [k.parentID]: parent[k.id] } : item;
        const siblings = data.filter((r) => (parent ? String(r?.[k.parentID]) === String(parent[k.id]) : !has(r?.[k.parentID])));
        const at = index === undefined || index >= siblings.length ? undefined : siblings[Math.max(index, 0)];

        if (at) return [...data.slice(0, data.indexOf(at)), next, ...data.slice(data.indexOf(at))];

        // After the last descendant of the parent, so the children stay together.
        let last = parent ? data.indexOf(parent) : data.length - 1;

        if (parent) for (let i = last + 1; i < data.length; i++) if (isDescendantFlat(data, k, data[i], parent)) last = i;

        return [...data.slice(0, last + 1), next, ...data.slice(last + 1)];
    }

    if (!parent) {
        const list = [...data];

        list.splice(index === undefined ? list.length : Math.min(Math.max(index, 0), list.length), 0, item);

        return list;
    }

    return mapTree(data, k.child, (r) => {
        if (r !== parent) return undefined;

        const kids = [...(r[k.child] ?? [])];

        kids.splice(index === undefined ? kids.length : Math.min(Math.max(index, 0), kids.length), 0, item);

        return { ...r, [k.child]: kids };
    });
}

function findNested(items: readonly any[], key: string, target: any): boolean {
    return items.some((i) => i === target || (Array.isArray(i?.[key]) && findNested(i[key], key, target)));
}

function isDescendantFlat(data: readonly any[], k: Fields, item: any, ancestor: any): boolean {
    for (let p = item, guard = 0; has(p?.[k.parentID]) && guard < 1000; guard++) {
        const up = data.find((r) => String(r?.[k.id]) === String(p[k.parentID]));

        if (!up) return false;
        if (up === ancestor) return true;

        p = up;
    }

    return false;
}

/** Makes `target` the last child of the sibling before it, `previous`. */
export function indentData(data: readonly any[], f: GanttTaskFields, target: any, previous: any): any[] {
    const k = fieldsOf(f);

    if (isFlat(data, f)) return updateData(data, f, target, { [k.parentID]: previous[k.id] });

    const removed = removeData(data, f, target);

    return insertData(removed, f, target, previous);
}

/** Makes `target` a sibling placed right after its parent. */
export function outdentData(data: readonly any[], f: GanttTaskFields, target: any, parent: any): any[] {
    const k = fieldsOf(f);

    if (isFlat(data, f)) {
        const grand = has(parent?.[k.parentID]) ? parent[k.parentID] : null;

        return data.map((r) =>
            r === target
                ? (() => {
                      const { [k.parentID]: _drop, ...rest } = r;

                      return grand === null ? rest : { ...rest, [k.parentID]: grand };
                  })()
                : r
        );
    }

    // Nested: the parent loses the child, and the child follows it in the list the parent is in.
    return mapTree(data, k.child, (item) => (item === parent ? [{ ...item, [k.child]: (item[k.child] ?? []).filter((c: any) => c !== target) }, target] : undefined));
}

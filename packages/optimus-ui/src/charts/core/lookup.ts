/**
 * Lookup tables.
 *
 * Painters resolve a point's slot or category once per point; a `findIndex` or `indexOf` inside that
 * loop makes the whole pass quadratic, which is the difference between a smooth and a stalled chart
 * once a series passes a few thousand points.
 */

/** Maps each item to the index of its first occurrence. */
export function indexMap<T>(list: readonly T[]): Map<T, number> {
    const map = new Map<T, number>();

    for (let i = 0; i < list.length; i++) if (!map.has(list[i])) map.set(list[i], i);

    return map;
}

/** Maps each point's `dataIndex` to its position in the series. */
export function dataIndexMap(points: readonly { dataIndex: number }[]): Map<number, number> {
    const map = new Map<number, number>();

    for (let i = 0; i < points.length; i++) if (!map.has(points[i].dataIndex)) map.set(points[i].dataIndex, i);

    return map;
}

/** Appends a list to another without spreading it, which overflows the call stack on a large one. */
export function pushAll<T>(target: T[], items: readonly T[]): void {
    for (let i = 0; i < items.length; i++) target.push(items[i]);
}

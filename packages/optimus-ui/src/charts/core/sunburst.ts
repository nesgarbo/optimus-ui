import type { TreemapNode } from './treemap';
import { totalValue } from './treemap';

/**
 * The geometry of a sunburst: a hierarchy laid out as rings of arcs, the first generation innermost, each arc as wide as the sum of
 * what is under it.
 *
 * Pure. Angles are degrees in the convention of the charts: 0 at three o'clock, running clockwise.
 *
 * @module sunburst
 */

/** One arc. */
export interface SunburstArc<T = unknown> {
    node: TreemapNode<T>;
    depth: number;
    startAngle: number;
    endAngle: number;
    innerRadius: number;
    outerRadius: number;
    /** Position of the top-level ancestor, so that a descendant is coloured from its family. */
    groupIndex: number;
    /** The share of the whole this arc is. */
    fraction: number;
}

/** Options of {@link layoutSunburst}. */
export interface SunburstOptions {
    startAngle: number;
    sweepAngle: number;
    /** The hole in the middle, and the outer edge, in pixels. */
    innerRadius: number;
    outerRadius: number;
    /** Space between rings, in pixels. */
    ringGap?: number;
    /** Deepest generation drawn, from 1; omitted, every one. */
    maxDepth?: number;
}

/** How many generations a forest has. */
export function depthOf<T>(roots: readonly TreemapNode<T>[]): number {
    return roots.reduce((deepest, node) => Math.max(deepest, 1 + (node.children?.length ? depthOf(node.children) : 0)), 0);
}

/** Lays out a forest of nodes as arcs. Nodes of no value take no angle and are left out. */
export function layoutSunburst<T>(roots: readonly TreemapNode<T>[], options: SunburstOptions): SunburstArc<T>[] {
    const total = roots.reduce((sum, node) => sum + totalValue(node), 0);

    if (total <= 0 || options.outerRadius <= options.innerRadius) return [];

    const generations = Math.min(depthOf(roots), options.maxDepth ?? Infinity);
    const gap = options.ringGap ?? 0;
    const ring = (options.outerRadius - options.innerRadius) / generations;
    const arcs: SunburstArc<T>[] = [];

    const place = (nodes: readonly TreemapNode<T>[], depth: number, start: number, span: number, parentTotal: number, group: number | null) => {
        let cursor = start;

        nodes.forEach((node, i) => {
            const value = totalValue(node);

            if (value <= 0) return;

            const width = parentTotal > 0 ? (value / parentTotal) * span : 0;
            const g = group ?? i;
            const inner = options.innerRadius + depth * ring + (depth > 0 ? gap / 2 : 0);
            const outer = options.innerRadius + (depth + 1) * ring - (depth < generations - 1 ? gap / 2 : 0);

            arcs.push({ node, depth, startAngle: cursor, endAngle: cursor + width, innerRadius: inner, outerRadius: outer, groupIndex: g, fraction: value / total });

            if (node.children?.length && depth + 1 < generations) place(node.children, depth + 1, cursor, width, value, g);

            cursor += width;
        });
    };

    place(roots, 0, options.startAngle, options.sweepAngle, total, null);

    return arcs;
}

/** Whether a point is inside an arc. */
export function insideArc(arc: SunburstArc, cx: number, cy: number, x: number, y: number): boolean {
    const dx = x - cx;
    const dy = y - cy;
    const distance = Math.hypot(dx, dy);

    if (distance < arc.innerRadius || distance > arc.outerRadius) return false;

    const angle = ((((Math.atan2(dy, dx) * 180) / Math.PI) % 360) + 360) % 360;
    const start = ((arc.startAngle % 360) + 360) % 360;
    const span = arc.endAngle - arc.startAngle;

    if (span >= 360 - 1e-6) return true;

    const delta = (angle - start + 360) % 360;

    return delta <= span;
}

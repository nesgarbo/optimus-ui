/**
 * The geometry of a Sankey diagram: nodes in columns, as tall as the flow through them, and links as wide as the flow they carry.
 *
 * Pure. Links that would close a loop are left out and reported, since a flow that returns to where it began has no column to go in.
 *
 * @module sankey
 */

/** A flow between two nodes. */
export interface SankeyLinkInput {
    source: string;
    target: string;
    value: number;
}

/** Where a node sits. */
export interface SankeyNode {
    id: string;
    index: number;
    /** Column, from 0. */
    layer: number;
    x0: number;
    x1: number;
    y0: number;
    y1: number;
    /** The flow through the node: the larger of what comes in and what goes out. */
    value: number;
    incoming: number;
    outgoing: number;
}

/** A laid-out flow. */
export interface SankeyLink {
    /** Position in the input links. */
    index: number;
    source: SankeyNode;
    target: SankeyNode;
    value: number;
    /** Thickness in pixels. */
    width: number;
    /** Where the centre of the link meets the source and the target, in y. */
    sourceY: number;
    targetY: number;
}

/** Options of {@link layoutSankey}. */
export interface SankeyOptions {
    x: number;
    y: number;
    width: number;
    height: number;
    nodeWidth?: number;
    nodePadding?: number;
    /** Passes that move nodes towards the nodes they are linked to. Default 8. */
    iterations?: number;
    /** `justify` pushes a node with no outgoing flow to the last column; `left` keeps it as early as it can go. */
    align?: 'justify' | 'left';
}

/** The result. */
export interface SankeyLayout {
    nodes: SankeyNode[];
    links: SankeyLink[];
    /** Input links that were left out, with the reason. */
    skipped: { index: number; reason: 'loop' | 'value' | 'self' }[];
}

/** Lays out a Sankey diagram. */
export function layoutSankey(inputs: readonly SankeyLinkInput[], options: SankeyOptions): SankeyLayout {
    const nodeWidth = options.nodeWidth ?? 14;
    const padding = options.nodePadding ?? 10;
    const skipped: SankeyLayout['skipped'] = [];
    const ids: string[] = [];
    const indexOf = new Map<string, number>();
    const add = (id: string) => {
        if (!indexOf.has(id)) {
            indexOf.set(id, ids.length);
            ids.push(id);
        }

        return indexOf.get(id)!;
    };

    // Links that carry nothing, or go from a node to itself, or close a loop, are not drawn.
    const accepted: { index: number; s: number; t: number; value: number }[] = [];
    const reaches = (from: number, to: number): boolean => {
        const stack = [from];
        const seen = new Set<number>();

        while (stack.length) {
            const n = stack.pop()!;

            if (n === to) return true;
            if (seen.has(n)) continue;

            seen.add(n);
            accepted.forEach((l) => l.s === n && stack.push(l.t));
        }

        return false;
    };

    inputs.forEach((link, index) => {
        const value = Number(link.value);

        if (!Number.isFinite(value) || value <= 0) return void skipped.push({ index, reason: 'value' });

        const s = add(String(link.source));
        const t = add(String(link.target));

        if (s === t) return void skipped.push({ index, reason: 'self' });
        if (reaches(t, s)) return void skipped.push({ index, reason: 'loop' });

        accepted.push({ index, s, t, value });
    });

    const n = ids.length;

    if (!n || !accepted.length) return { nodes: [], links: [], skipped };

    const incoming = new Array<number>(n).fill(0);
    const outgoing = new Array<number>(n).fill(0);

    for (const l of accepted) {
        outgoing[l.s] += l.value;
        incoming[l.t] += l.value;
    }

    // Column: the longest path from a node with no inflow.
    const layer = new Array<number>(n).fill(0);

    for (let pass = 0; pass < n; pass++) {
        let changed = false;

        for (const l of accepted) {
            if (layer[l.t] < layer[l.s] + 1) {
                layer[l.t] = layer[l.s] + 1;
                changed = true;
            }
        }

        if (!changed) break;
    }

    const last = Math.max(...layer);

    if ((options.align ?? 'justify') === 'justify') for (let i = 0; i < n; i++) if (outgoing[i] === 0) layer[i] = last;

    const columns: number[][] = Array.from({ length: last + 1 }, () => []);

    layer.forEach((c, i) => columns[c].push(i));

    const flow = ids.map((_, i) => Math.max(incoming[i], outgoing[i]));
    // One scale for the whole diagram, set by the column that is most crowded, so that a node as tall as another carries as much.
    const ky = Math.min(...columns.filter((c) => c.length).map((c) => (options.height - (c.length - 1) * padding) / c.reduce((s, i) => s + flow[i], 0)));
    const scale = Number.isFinite(ky) && ky > 0 ? ky : 0;
    const step = last > 0 ? (options.width - nodeWidth) / last : 0;
    const top = new Array<number>(n).fill(0);

    // First placement: stacked from the top, in the order the nodes were met.
    for (const col of columns) {
        let y = options.y;

        for (const i of col) {
            top[i] = y;
            y += flow[i] * scale + padding;
        }
    }

    const centre = (i: number) => top[i] + (flow[i] * scale) / 2;

    // Move each node towards the weighted centre of the nodes it is linked to, then clear the overlaps, alternating directions.
    const relax = (cols: number[][], towards: 'sources' | 'targets') => {
        for (const col of cols) {
            for (const i of col) {
                let weight = 0;
                let sum = 0;

                for (const l of accepted) {
                    const other = towards === 'sources' ? (l.t === i ? l.s : -1) : l.s === i ? l.t : -1;

                    if (other < 0) continue;

                    weight += l.value;
                    sum += centre(other) * l.value;
                }

                if (weight > 0) top[i] += sum / weight - centre(i);
            }

            separate(col);
        }
    };

    const separate = (col: number[]) => {
        const sorted = [...col].sort((a, b) => top[a] - top[b]);
        let y = options.y;

        for (const i of sorted) {
            if (top[i] < y) top[i] = y;

            y = top[i] + flow[i] * scale + padding;
        }

        // Pushed past the bottom: shift back up, from the last node.
        const bottom = options.y + options.height;
        let overflow = top[sorted[sorted.length - 1]] + flow[sorted[sorted.length - 1]] * scale - bottom;

        for (let k = sorted.length - 1; k >= 0 && overflow > 0; k--) {
            const i = sorted[k];
            const minTop = options.y + k * 0; // the stack above resets below

            top[i] -= overflow;
            void minTop;

            if (k > 0) {
                const above = sorted[k - 1];
                const limit = top[i] - padding - flow[above] * scale;

                overflow = top[above] - limit;
            } else {
                overflow = 0;
            }
        }

        // The shift can open an overlap at the top: one more pass downwards settles it.
        let floor = options.y;

        for (const i of sorted) {
            if (top[i] < floor) top[i] = floor;

            floor = top[i] + flow[i] * scale + padding;
        }
    };

    const iterations = options.iterations ?? 8;

    for (let k = 0; k < iterations; k++) {
        relax(columns.slice(1), 'sources');
        relax([...columns].slice(0, -1).reverse(), 'targets');
    }

    for (const col of columns) separate(col);

    const nodes: SankeyNode[] = ids.map((id, i) => ({
        id,
        index: i,
        layer: layer[i],
        x0: options.x + layer[i] * step,
        x1: options.x + layer[i] * step + nodeWidth,
        y0: top[i],
        y1: top[i] + flow[i] * scale,
        value: flow[i],
        incoming: incoming[i],
        outgoing: outgoing[i]
    }));

    // Links leave and arrive in the order of the nodes they join, so that they do not cross where they need not.
    const usedOut = new Array<number>(n).fill(0);
    const usedIn = new Array<number>(n).fill(0);
    const bySource = [...accepted].sort((a, b) => a.s - b.s || top[a.t] - top[b.t] || a.index - b.index);
    const sourceY = new Map<number, number>();

    for (const l of bySource) {
        const w = l.value * scale;

        sourceY.set(l.index, nodes[l.s].y0 + usedOut[l.s] + w / 2);
        usedOut[l.s] += w;
    }

    const byTarget = [...accepted].sort((a, b) => a.t - b.t || top[a.s] - top[b.s] || a.index - b.index);
    const targetY = new Map<number, number>();

    for (const l of byTarget) {
        const w = l.value * scale;

        targetY.set(l.index, nodes[l.t].y0 + usedIn[l.t] + w / 2);
        usedIn[l.t] += w;
    }

    const links: SankeyLink[] = accepted.map((l) => ({ index: l.index, source: nodes[l.s], target: nodes[l.t], value: l.value, width: l.value * scale, sourceY: sourceY.get(l.index)!, targetY: targetY.get(l.index)! }));

    return { nodes, links, skipped };
}

/** The curve of a link: a cubic from the right edge of the source to the left edge of the target, level where it leaves and arrives. */
export function linkPath(link: SankeyLink): string {
    const x0 = link.source.x1;
    const x1 = link.target.x0;
    const mid = (x0 + x1) / 2;
    const r = (n: number) => Math.round(n * 100) / 100;

    return `M${r(x0)} ${r(link.sourceY)}C${r(mid)} ${r(link.sourceY)} ${r(mid)} ${r(link.targetY)} ${r(x1)} ${r(link.targetY)}`;
}

/** Whether a point is on a link: within half its thickness of the curve. */
export function onLink(link: SankeyLink, x: number, y: number): boolean {
    const x0 = link.source.x1;
    const x1 = link.target.x0;

    if (x < x0 || x > x1) return false;

    // The curve is a function of x, monotone, so walk it by parameter and take the nearest sample.
    const mid = (x0 + x1) / 2;
    const bez = (t: number) => {
        const u = 1 - t;

        return { x: u * u * u * x0 + 3 * u * u * t * mid + 3 * u * t * t * mid + t * t * t * x1, y: u * u * u * link.sourceY + 3 * u * u * t * link.sourceY + 3 * u * t * t * link.targetY + t * t * t * link.targetY };
    };
    let lo = 0;
    let hi = 1;

    for (let i = 0; i < 24; i++) {
        const m = (lo + hi) / 2;

        if (bez(m).x < x) lo = m;
        else hi = m;
    }

    return Math.abs(bez((lo + hi) / 2).y - y) <= link.width / 2;
}

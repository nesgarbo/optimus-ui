import type { PanelModel } from '@openng/optimus-ui/types/dashboardlayout';

/**
 * The grid: whether tiles collide, where one goes when another is in the way, and how a drag or a
 * resize turns into a new layout.
 *
 * Pure. Every function returns new panels and leaves its input alone.
 *
 * @module dashboardlayout-engine
 */

/** A panel with its sizes filled in. */
export type GridPanel = PanelModel & { sizeX: number; sizeY: number };

/** The area a panel takes. */
export interface GridRect {
    row: number;
    col: number;
    sizeX: number;
    sizeY: number;
}

/** `true` when two panels share a cell. */
export const overlaps = (a: GridRect, b: GridRect): boolean => a.col < b.col + b.sizeX && b.col < a.col + a.sizeX && a.row < b.row + b.sizeY && b.row < a.row + a.sizeY;

/** Fills in the sizes of a panel and keeps it inside the grid and within its own limits. */
export function clampPanel(panel: PanelModel, columns: number): GridPanel {
    const minX = Math.max(1, panel.minSizeX ?? 1);
    const minY = Math.max(1, panel.minSizeY ?? 1);
    const maxX = Math.min(columns, panel.maxSizeX ?? columns);
    const maxY = panel.maxSizeY ?? Infinity;
    const sizeX = Math.min(Math.max(Math.round(panel.sizeX ?? 1), Math.min(minX, columns)), Math.max(maxX, 1));
    const sizeY = Math.min(Math.max(Math.round(panel.sizeY ?? 1), minY), Math.max(maxY, minY));
    const col = Math.min(Math.max(Math.round(panel.col ?? 0), 0), Math.max(columns - sizeX, 0));
    const row = Math.max(Math.round(panel.row ?? 0), 0);

    return { ...panel, col, row, sizeX, sizeY };
}

/**
 * Gives every panel an id of its own. A later panel that repeats an id is renamed `id~2`, `id~3`... so that it still has a place on the
 * grid and can be told from the first one. The same array when there is nothing to rename.
 */
export function uniqueIds<T extends { id: string }>(panels: T[]): T[] {
    const seen = new Set<string>();
    let renamed: T[] | null = null;

    panels.forEach((p, index) => {
        let id = p.id;

        for (let n = 2; seen.has(id); n++) id = `${p.id}~${n}`;

        seen.add(id);

        if (id !== p.id) {
            renamed ??= panels.slice();
            renamed[index] = { ...p, id };
        }
    });

    return renamed ?? panels;
}

/** How many rows the panels take. */
export const rowsOf = (panels: GridRect[]): number => panels.reduce((max, p) => Math.max(max, p.row + p.sizeY), 0);

/**
 * Settles a set of panels so that none overlaps another.
 *
 * Panels are placed in reading order. One that lands on an earlier one is pushed down below it. With
 * `floating`, a panel first rises as far as it can, so no gap is left above it. `priority` names a panel
 * that keeps its place and makes the others give way, which is what a drag needs.
 */
export function resolve(panels: PanelModel[], columns: number, floating = true, priority?: string): GridPanel[] {
    const input = uniqueIds(panels);
    const clamped = input.map((p, index) => ({ panel: clampPanel(p, columns), index }));
    const first = priority ? clamped.filter((c) => c.panel.id === priority) : [];
    const rest = clamped.filter((c) => c.panel.id !== priority).sort((a, b) => a.panel.row - b.panel.row || a.panel.col - b.panel.col || a.index - b.index);
    // The placed panels by column: a panel is only compared with those that share one of its columns.
    const lanes: GridPanel[][] = Array.from({ length: columns }, () => []);
    const out = new Array<GridPanel>(input.length);
    const hits = (p: GridRect): GridPanel[] => {
        const found: GridPanel[] = [];

        for (let c = Math.max(p.col, 0); c < Math.min(p.col + p.sizeX, columns); c++) {
            for (const q of lanes[c]) {
                // A panel spanning several of the columns is met in each: it counts once.
                if (overlaps(p, q) && !found.includes(q)) found.push(q);
            }
        }

        return found;
    };

    for (const { panel, index } of [...first, ...rest]) {
        const next = { ...panel };

        if (floating && next.id !== priority) while (next.row > 0 && !hits({ ...next, row: next.row - 1 }).length) next.row--;

        // Pushed below whatever is in the way, repeating because the new row can meet something else.
        for (let found = hits(next); found.length; found = hits(next)) next.row = Math.max(...found.map((q) => q.row + q.sizeY));

        for (let c = next.col; c < next.col + next.sizeX; c++) lanes[c]?.push(next);

        out[index] = next;
    }

    // The caller's order is kept, so that the result lines up with the input.
    return out;
}

/** The layout with `id` moved to `row` and `col`, the others making way. */
export function moveTo(panels: PanelModel[], id: string, row: number, col: number, columns: number, floating = true): GridPanel[] {
    return resolve(
        panels.map((p) => (p.id === id ? { ...p, row, col } : p)),
        columns,
        floating,
        id
    );
}

/** The layout with `id` taking a new area, the others making way. */
export function resizeTo(panels: PanelModel[], id: string, rect: GridRect, columns: number, floating = true): GridPanel[] {
    return resolve(
        panels.map((p) => (p.id === id ? { ...p, ...rect } : p)),
        columns,
        floating,
        id
    );
}

/** The first free place of `sizeX` by `sizeY`, scanning rows from the top. */
export function findSpot(panels: GridRect[], sizeX: number, sizeY: number, columns: number): { row: number; col: number } {
    const w = Math.min(Math.max(sizeX, 1), columns);

    for (let row = 0; ; row++) {
        for (let col = 0; col + w <= columns; col++) {
            if (!panels.some((p) => overlaps({ row, col, sizeX: w, sizeY }, p))) return { row, col };
        }
    }
}

/** The layout as a single column: reading order, full width, original heights. For a narrow screen. */
export function stack(source: PanelModel[]): GridPanel[] {
    const panels = uniqueIds(source);
    const order = panels.map((p, index) => ({ p, index })).sort((a, b) => (a.p.row ?? 0) - (b.p.row ?? 0) || (a.p.col ?? 0) - (b.p.col ?? 0) || a.index - b.index);
    let row = 0;
    const out = new Map<string, GridPanel>();

    for (const { p } of order) {
        const sizeY = Math.max(1, Math.round(p.sizeY ?? 1));

        out.set(p.id, { ...p, col: 0, row, sizeX: 1, sizeY });
        row += sizeY;
    }

    return panels.map((p) => out.get(p.id)!);
}

/** Pixel geometry of a grid. */
export interface GridMetrics {
    cellW: number;
    cellH: number;
    gapX: number;
    gapY: number;
}

/** The metrics of a grid of `columns` in `width` pixels. A cell is `cellAspectRatio` times as wide as it is tall. */
export function metrics(width: number, columns: number, gapX: number, gapY: number, cellAspectRatio: number): GridMetrics {
    const cellW = Math.max(0, (width - gapX * (columns - 1)) / columns);

    return { cellW, cellH: cellW / (cellAspectRatio || 1), gapX, gapY };
}

/** The pixel box of an area. */
export function toPixels(rect: GridRect, g: GridMetrics) {
    return {
        x: rect.col * (g.cellW + g.gapX),
        y: rect.row * (g.cellH + g.gapY),
        w: rect.sizeX * g.cellW + (rect.sizeX - 1) * g.gapX,
        h: rect.sizeY * g.cellH + (rect.sizeY - 1) * g.gapY
    };
}

/** The pixel height of `rows` rows. */
export const heightOf = (rows: number, g: GridMetrics): number => (rows ? rows * g.cellH + (rows - 1) * g.gapY : 0);

/** The nearest column and row for a pixel position. */
export function toCell(x: number, y: number, g: GridMetrics): { col: number; row: number } {
    return { col: Math.round(x / (g.cellW + g.gapX)), row: Math.round(y / (g.cellH + g.gapY)) };
}

/** The size in cells nearest to a pixel size. */
export function toSpan(w: number, h: number, g: GridMetrics): { sizeX: number; sizeY: number } {
    return { sizeX: Math.max(1, Math.round((w + g.gapX) / (g.cellW + g.gapX))), sizeY: Math.max(1, Math.round((h + g.gapY) / (g.cellH + g.gapY))) };
}

/** `true` when two layouts put every panel in the same place at the same size. */
export function sameLayout(a: GridRect[] & { id?: string }[], b: GridRect[] & { id?: string }[]): boolean {
    return a.length === b.length && a.every((p, i) => p.row === b[i].row && p.col === b[i].col && p.sizeX === b[i].sizeX && p.sizeY === b[i].sizeY && (p as any).id === (b[i] as any).id);
}

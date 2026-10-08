/**
 * The geometry of a funnel and of a pyramid: the polygons the slices are, from their values.
 *
 * Pure. A funnel is wide at the top and narrows to a neck; a pyramid is a triangle. In both the slices are stacked top to bottom in
 * the order given, each as tall as its share of the values, so a long slice is a big value.
 *
 * @module funnel
 */

/** The shape of the whole. */
export type FunnelShape = 'funnel' | 'pyramid';

/** How a pyramid's values become slices: by height (`linear`), or by area (`surface`), which is what a triangle's eye reads. */
export type PyramidMode = 'linear' | 'surface';

/** What to lay out. */
export interface FunnelOptions {
    shape: FunnelShape;
    /** Where the box starts and how big it is, in pixels. */
    x: number;
    y: number;
    width: number;
    height: number;
    /** The neck of a funnel, as a share of the width: 0.2 is a neck a fifth as wide as the mouth. */
    neckWidth?: number;
    /** The neck of a funnel, as a share of the height: the straight part at the bottom. */
    neckHeight?: number;
    /** Space between slices, in pixels. */
    gap?: number;
    mode?: PyramidMode;
    /** Flips a pyramid so that its point is at the bottom. */
    inverted?: boolean;
}

/** A slice. */
export interface FunnelSlice {
    /** Position in the values given. */
    index: number;
    /** The slice, clockwise from the top left. */
    polygon: [number, number][];
    /** Top and bottom of the slice. */
    y0: number;
    y1: number;
    /** The middle, where a label goes. */
    cx: number;
    cy: number;
    /** How wide the slice is at its middle: what a label must fit in. */
    midWidth: number;
}

/** The outline of the whole: how wide it is at a height, measured from the top of the box. */
export function outlineWidth(options: Pick<FunnelOptions, 'shape' | 'width' | 'height' | 'neckWidth' | 'neckHeight' | 'inverted'>, y: number): number {
    const { shape, width, height } = options;

    if (shape === 'pyramid') {
        const t = Math.min(Math.max(y / height, 0), 1);

        return width * (options.inverted ? 1 - t : t);
    }

    const neck = width * clamp01(options.neckWidth ?? 0.2);
    const taperEnd = height * (1 - clamp01(options.neckHeight ?? 0.2));

    if (taperEnd <= 0) return neck;

    return y >= taperEnd ? neck : width + ((neck - width) * y) / taperEnd;
}

const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1);

/** Lays out the slices of a funnel or a pyramid. Values are magnitudes: a negative or missing one is a slice of no height. */
export function layoutFunnel(values: readonly number[], options: FunnelOptions): FunnelSlice[] {
    const v = values.map((x) => (Number.isFinite(x) && x > 0 ? x : 0));
    const total = v.reduce((s, x) => s + x, 0);

    if (!v.length || total <= 0 || options.width <= 0 || options.height <= 0) return [];

    const n = v.length;
    const gap = Math.max(options.gap ?? 0, 0);
    const surface = options.shape === 'pyramid' && options.mode === 'surface';
    const spans: [number, number][] = [];

    if (surface) {
        // Area grows with the square of the height from the point, so the cumulative share of the area is the square of the height.
        let cumulative = 0;

        for (let i = 0; i < n; i++) {
            const a = cumulative / total;

            cumulative += v[i];

            const b = cumulative / total;
            const from = options.inverted ? 1 - Math.sqrt(1 - a) : Math.sqrt(a);
            const to = options.inverted ? 1 - Math.sqrt(1 - b) : Math.sqrt(b);

            spans.push([from * options.height, to * options.height]);
        }

        // A gap is taken out of each side of the line between two slices.
        spans.forEach((s, i) => {
            if (i > 0) s[0] += gap / 2;
            if (i < n - 1) s[1] -= gap / 2;
        });
    } else {
        const usable = Math.max(options.height - gap * (n - 1), 0);
        let y = 0;

        for (let i = 0; i < n; i++) {
            const h = (usable * v[i]) / total;

            spans.push([y, y + h]);
            y += h + gap;
        }
    }

    const cx = options.x + options.width / 2;
    const taperEnd = options.height * (1 - clamp01(options.neckHeight ?? 0.2));

    return spans.map(([y0, y1], index) => {
        const top = options.y + y0;
        const bottom = options.y + Math.max(y1, y0);
        const half = (y: number) => outlineWidth(options, y) / 2;
        const left: [number, number][] = [[cx - half(y0), top]];
        const right: [number, number][] = [[cx + half(y0), top]];

        // A funnel bends where the taper meets the neck: a slice that crosses it has a corner there.
        if (options.shape === 'funnel' && y0 < taperEnd && y1 > taperEnd) {
            left.push([cx - half(taperEnd), options.y + taperEnd]);
            right.push([cx + half(taperEnd), options.y + taperEnd]);
        }

        left.push([cx - half(y1), bottom]);
        right.push([cx + half(y1), bottom]);

        const mid = (y0 + y1) / 2;

        return { index, polygon: [...left, ...right.reverse()], y0: top, y1: bottom, cx, cy: options.y + mid, midWidth: outlineWidth(options, mid) };
    });
}

/** Whether a point is inside a slice. The slices are convex, and a slice wider at the bottom than the top (an inverted pyramid) is too. */
export function insideSlice(slice: FunnelSlice, x: number, y: number): boolean {
    if (y < slice.y0 || y > slice.y1) return false;

    const p = slice.polygon;
    let inside = false;

    for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
        const [xi, yi] = p[i];
        const [xj, yj] = p[j];

        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }

    return inside;
}

/** A polygon as SVG path data. */
export const polygonPathData = (points: readonly [number, number][]): string => (points.length ? `M${points.map(([x, y]) => `${Math.round(x * 100) / 100} ${Math.round(y * 100) / 100}`).join('L')}Z` : '');

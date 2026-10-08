/**
 * The geometry of the PDF editor, without a PDF in it.
 *
 * An annotation is placed in the page as it is shown: points, from the top left, after the page's rotation. The file wants user space
 * -- from the bottom left of the unrotated page -- so the two are tied by a matrix that depends on the rotation.
 *
 * @module pdf-model
 */
import type { PdfAnnotation, PdfRotation } from '@openng/optimus-ui/types/pdfeditor';

/** The six numbers of a PDF transformation matrix. */
export type Matrix = [number, number, number, number, number, number];

/** A rectangle, from its top left. */
export interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
}

/** How far a font's letters rise above the baseline, as a share of the font size: where the first line of a text sits. */
export const ASCENT: Record<'helvetica' | 'times' | 'courier', number> = { helvetica: 0.718, times: 0.683, courier: 0.629 };

/** Normalises any angle to 0, 90, 180 or 270. */
export function normalizeRotation(angle: number): PdfRotation {
    const turns = ((Math.round(angle / 90) % 4) + 4) % 4;

    return (turns * 90) as PdfRotation;
}

/** The size of a page as it is shown: swapped when it is turned a quarter. */
export function shownSize(width: number, height: number, rotation: PdfRotation): { width: number; height: number } {
    return rotation === 90 || rotation === 270 ? { width: height, height: width } : { width, height };
}

/**
 * The matrix that takes a point of the page as it is shown, measured from its bottom left and going up, to user space.
 * `width` and `height` are those of the unrotated page; `x0` and `y0` are the origin of its media box.
 */
export function shownToUser(width: number, height: number, rotation: PdfRotation, x0 = 0, y0 = 0): Matrix {
    switch (rotation) {
        case 90:
            return [0, 1, -1, 0, width + x0, y0];
        case 180:
            return [-1, 0, 0, -1, width + x0, height + y0];
        case 270:
            return [0, -1, 1, 0, x0, height + y0];
        default:
            return [1, 0, 0, 1, x0, y0];
    }
}

/** Applies a matrix to a point. */
export function transformPoint(m: Matrix, x: number, y: number): [number, number] {
    return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}

/** The box a rectangle of user space takes in the page as it is shown, from its top left. */
export function userBoxToShown(box: { x: number; y: number; width: number; height: number }, width: number, height: number, rotation: PdfRotation, x0 = 0, y0 = 0): Box {
    const shown = shownSize(width, height, rotation);
    const corner = (ux: number, uy: number): [number, number] => {
        const rx = ux - x0;
        const ry = uy - y0;
        // From user space to the shown page, measured up from its bottom left, then flipped to count down from the top.
        let sx: number;
        let sy: number;

        switch (rotation) {
            case 90:
                sx = ry;
                sy = width - rx;
                break;
            case 180:
                sx = width - rx;
                sy = height - ry;
                break;
            case 270:
                sx = height - ry;
                sy = rx;
                break;
            default:
                sx = rx;
                sy = ry;
        }

        return [sx, shown.height - sy];
    };
    const a = corner(box.x, box.y);
    const b = corner(box.x + box.width, box.y + box.height);

    return { x: Math.min(a[0], b[0]), y: Math.min(a[1], b[1]), width: Math.abs(a[0] - b[0]), height: Math.abs(a[1] - b[1]) };
}

/** The smallest box that holds an annotation. */
export function boundsOf(a: PdfAnnotation): Box {
    switch (a.type) {
        case 'line':
        case 'arrow': {
            const pad = a.strokeWidth / 2;

            return { x: Math.min(a.x1, a.x2) - pad, y: Math.min(a.y1, a.y2) - pad, width: Math.abs(a.x2 - a.x1) + a.strokeWidth, height: Math.abs(a.y2 - a.y1) + a.strokeWidth };
        }
        case 'draw': {
            const xs = a.points.map((p) => p[0]);
            const ys = a.points.map((p) => p[1]);
            const pad = a.strokeWidth / 2;

            if (!xs.length) return { x: 0, y: 0, width: 0, height: 0 };

            return { x: Math.min(...xs) - pad, y: Math.min(...ys) - pad, width: Math.max(...xs) - Math.min(...xs) + a.strokeWidth, height: Math.max(...ys) - Math.min(...ys) + a.strokeWidth };
        }
        default:
            return { x: a.x, y: a.y, width: a.width, height: a.height };
    }
}

/** Whether an annotation has a box that can be resized by its corners. */
export function isBoxed(a: PdfAnnotation): a is Extract<PdfAnnotation, { width: number }> {
    return 'width' in a;
}

/** Distance from a point to a segment. */
export function distanceToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = dx * dx + dy * dy;
    const t = length === 0 ? 0 : Math.min(Math.max(((px - x1) * dx + (py - y1) * dy) / length, 0), 1);

    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

/** Whether a point is on an annotation, with a few points of slack so thin lines can be picked. */
export function hitAnnotation(a: PdfAnnotation, x: number, y: number, slack = 4): boolean {
    switch (a.type) {
        case 'line':
        case 'arrow':
            return distanceToSegment(x, y, a.x1, a.y1, a.x2, a.y2) <= a.strokeWidth / 2 + slack;
        case 'draw':
            for (let i = 1; i < a.points.length; i++) if (distanceToSegment(x, y, a.points[i - 1][0], a.points[i - 1][1], a.points[i][0], a.points[i][1]) <= a.strokeWidth / 2 + slack) return true;

            return a.points.length === 1 && Math.hypot(x - a.points[0][0], y - a.points[0][1]) <= a.strokeWidth / 2 + slack;
        case 'rectangle':
        case 'ellipse': {
            const inside = a.type === 'rectangle' ? x >= a.x && x <= a.x + a.width && y >= a.y && y <= a.y + a.height : ((x - (a.x + a.width / 2)) / (a.width / 2 || 1)) ** 2 + ((y - (a.y + a.height / 2)) / (a.height / 2 || 1)) ** 2 <= 1;

            if (a.fillColor) return inside;

            // A hollow shape is picked by its outline only, so what is inside it can be picked too.
            const grown = a.type === 'rectangle' ? x >= a.x - slack && x <= a.x + a.width + slack && y >= a.y - slack && y <= a.y + a.height + slack : true;
            const shrunk =
                a.type === 'rectangle'
                    ? x >= a.x + slack && x <= a.x + a.width - slack && y >= a.y + slack && y <= a.y + a.height - slack
                    : ((x - (a.x + a.width / 2)) / (a.width / 2 - slack || 1)) ** 2 + ((y - (a.y + a.height / 2)) / (a.height / 2 - slack || 1)) ** 2 < 1;

            return a.type === 'rectangle' ? grown && !shrunk : !shrunk && ((x - (a.x + a.width / 2)) / (a.width / 2 + slack)) ** 2 + ((y - (a.y + a.height / 2)) / (a.height / 2 + slack)) ** 2 <= 1;
        }
        default:
            return x >= a.x && x <= a.x + a.width && y >= a.y && y <= a.y + a.height;
    }
}

/** The topmost annotation under a point: the last one drawn. */
export function pickAnnotation(list: readonly PdfAnnotation[], page: number, x: number, y: number): PdfAnnotation | null {
    for (let i = list.length - 1; i >= 0; i--) if (list[i].page === page && hitAnnotation(list[i], x, y)) return list[i];

    return null;
}

/** An annotation moved by an offset. */
export function moveAnnotation<T extends PdfAnnotation>(a: T, dx: number, dy: number): T {
    switch (a.type) {
        case 'line':
        case 'arrow':
            return { ...a, x1: a.x1 + dx, y1: a.y1 + dy, x2: a.x2 + dx, y2: a.y2 + dy };
        case 'draw':
            return { ...a, points: a.points.map(([px, py]) => [px + dx, py + dy] as [number, number]) };
        default:
            return { ...a, x: (a as any).x + dx, y: (a as any).y + dy };
    }
}

/** A boxed annotation sized to a new box. A picture keeps its proportions when `keepRatio` is set. */
export function resizeAnnotation<T extends PdfAnnotation>(a: T, box: Box, keepRatio = false): T {
    if (!isBoxed(a)) return a;

    let { width, height } = box;

    if (keepRatio && a.width > 0 && a.height > 0) {
        const ratio = a.width / a.height;

        if (width / ratio > height) width = height * ratio;
        else height = width / ratio;
    }

    return { ...a, x: box.x, y: box.y, width: Math.max(width, 4), height: Math.max(height, 4) };
}

/** Where annotations go when a page is deleted: its own are dropped and the later pages move up. */
export function afterDeletePage(list: readonly PdfAnnotation[], page: number): PdfAnnotation[] {
    return list.filter((a) => a.page !== page).map((a) => (a.page > page ? { ...a, page: a.page - 1 } : a));
}

/** Where annotations go when a page moves from one position to another. */
export function afterMovePage(list: readonly PdfAnnotation[], from: number, to: number): PdfAnnotation[] {
    const remap = (p: number) => {
        if (p === from) return to;
        if (from < to && p > from && p <= to) return p - 1;
        if (from > to && p >= to && p < from) return p + 1;

        return p;
    };

    return list.map((a) => ({ ...a, page: remap(a.page) }));
}

/** Where annotations go when a page is inserted: the later pages move down. */
export function afterInsertPage(list: readonly PdfAnnotation[], at: number, count = 1): PdfAnnotation[] {
    return list.map((a) => (a.page >= at ? { ...a, page: a.page + count } : a));
}

let counter = 0;

/** A new id for an annotation. */
export function nextAnnotationId(): string {
    return `pdf-a${Date.now().toString(36)}-${(counter++).toString(36)}`;
}

/** Parses `#rgb`, `#rrggbb`, `rgb()` or `rgba()` into 0..1 channels. Anything else is black. */
export function parseColor(color: string): { r: number; g: number; b: number } {
    const text = (color || '').trim().toLowerCase();
    let m = /^#([0-9a-f]{3})$/.exec(text);

    if (m) return { r: parseInt(m[1][0] + m[1][0], 16) / 255, g: parseInt(m[1][1] + m[1][1], 16) / 255, b: parseInt(m[1][2] + m[1][2], 16) / 255 };

    m = /^#([0-9a-f]{6})(?:[0-9a-f]{2})?$/.exec(text);

    if (m) return { r: parseInt(m[1].slice(0, 2), 16) / 255, g: parseInt(m[1].slice(2, 4), 16) / 255, b: parseInt(m[1].slice(4, 6), 16) / 255 };

    const rgb = /^rgba?\(\s*(\d+(?:\.\d+)?)[ ,]+(\d+(?:\.\d+)?)[ ,]+(\d+(?:\.\d+)?)/.exec(text);

    if (rgb) return { r: Math.min(+rgb[1], 255) / 255, g: Math.min(+rgb[2], 255) / 255, b: Math.min(+rgb[3], 255) / 255 };

    return { r: 0, g: 0, b: 0 };
}

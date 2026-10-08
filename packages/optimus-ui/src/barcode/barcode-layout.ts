import type { BarcodeDisplayText, BarcodeMargin, BarcodeType } from '@openng/optimus-ui/types/barcode';
import { textGroups } from './barcode-linear';

/**
 * Where everything goes: from a symbol and a box to the rectangles and the text to paint, and from
 * those to an SVG document. Display and export share it, so what is drawn is what is saved.
 *
 * @module barcode-layout
 */

/** One filled rectangle, in pixels. */
export interface LayoutRect {
    x: number;
    y: number;
    w: number;
    h: number;
}

/** One piece of text, in pixels. `y` is the baseline. */
export interface LayoutText {
    x: number;
    y: number;
    text: string;
    anchor: 'start' | 'middle' | 'end';
    size: number;
}

/** A picture drawn over the middle of a symbol. */
export interface LayoutLogo extends LayoutRect {
    src: string;
    /** The clear box drawn behind it, so that modules do not show through the transparent parts. */
    pad: LayoutRect;
}

/** Everything a painter needs. */
export interface BarcodeLayout {
    width: number;
    height: number;
    rects: LayoutRect[];
    texts: LayoutText[];
    font: string;
    logo?: LayoutLogo;
}

/** What to lay out. */
export interface LayoutInput {
    width: number;
    height: number;
    margin?: BarcodeMargin;
    displayText?: BarcodeDisplayText | null;
    /** Text drawn when `displayText.text` is not set. */
    defaultText: string;
}

export interface LinearInput extends LayoutInput {
    kind: 'linear';
    type: BarcodeType;
    modules: boolean[];
}

export interface MatrixInput extends LayoutInput {
    kind: 'matrix';
    modules: boolean[][];
    /** Fixed side of one module in pixels; omitted, the symbol fills the box. */
    moduleSize?: number;
    /** Modules of quiet zone round the symbol. Default 4. */
    quiet?: number;
    /** A picture for the middle, in pixels. It is made smaller until it covers no more than a quarter of the symbol. */
    logo?: { src: string; width: number; height: number };
}

/** The largest share of the area of a symbol a logo may cover: what a QR Code at its highest level of correction can lose and still be read. */
export const LOGO_MAX_AREA = 0.25;

/** Quiet zone, in modules, on each side of a linear symbol. EAN and UPC need room for the digit that sits outside the bars. */
const quiet = (type: BarcodeType) => (type === 'ean13' || type === 'upcA' ? { left: 11, right: 9 } : type === 'ean8' ? { left: 7, right: 7 } : { left: 10, right: 10 });

/** The quiet zone of a QR Code, in modules. */
export const QR_QUIET = 4;

const DEFAULT_FONT = 'system-ui, sans-serif';

const m = (margin: BarcodeMargin | undefined) => ({ l: margin?.left ?? 0, r: margin?.right ?? 0, t: margin?.top ?? 0, b: margin?.bottom ?? 0 });

/** Joins adjacent dark modules of a row into one rectangle. */
function runs(row: boolean[], x0: number, y: number, moduleW: number, h: number, out: LayoutRect[]): void {
    for (let i = 0; i < row.length;) {
        if (!row[i]) {
            i++;
            continue;
        }

        let j = i;

        while (j < row.length && row[j]) j++;

        out.push({ x: x0 + i * moduleW, y, w: (j - i) * moduleW, h });
        i = j;
    }
}

function textBlock(input: LayoutInput, kind: 'linear' | 'matrix'): { size: number; margin: number; position: 'top' | 'bottom'; text: string; visible: boolean; font: string; alignment: 'start' | 'center' | 'end' } {
    const d = input.displayText;
    const visible = d ? d.visibility !== false : false;

    return {
        visible: visible && !!(d?.text ?? input.defaultText),
        text: d?.text ?? input.defaultText,
        size: d?.size ?? (kind === 'linear' ? 14 : 12),
        margin: d?.margin ?? 4,
        position: d?.position ?? 'bottom',
        font: d?.font ?? DEFAULT_FONT,
        alignment: d?.alignment ?? 'center'
    };
}

/** Lays out a one-dimensional symbol. */
export function layoutLinear(input: LinearInput): BarcodeLayout {
    const { l, r, t, b } = m(input.margin);
    const text = textBlock(input, 'linear');
    const q = quiet(input.type);
    const total = input.modules.length + q.left + q.right;
    const moduleW = Math.max(0, (input.width - l - r) / total);
    const textH = text.visible ? text.size + text.margin * 2 : 0;
    const barsH = Math.max(0, input.height - t - b - textH);
    const barsY = t + (text.visible && text.position === 'top' ? textH : 0);
    const x0 = l + q.left * moduleW;
    const rects: LayoutRect[] = [];
    const texts: LayoutText[] = [];

    runs(input.modules, x0, barsY, moduleW, barsH, rects);

    if (text.visible) {
        const y = text.position === 'top' ? t + text.margin + text.size * 0.8 : barsY + barsH + text.margin + text.size * 0.8;
        const groups = !input.displayText?.text ? textGroups(input.type, input.defaultText) : null;

        if (groups) {
            for (const g of groups) texts.push({ x: x0 + ((g.from + g.to) / 2) * moduleW, y, text: g.text, anchor: 'middle', size: text.size });
        } else {
            const symbolW = input.modules.length * moduleW;
            const anchor = text.alignment === 'start' ? 'start' : text.alignment === 'end' ? 'end' : 'middle';
            const x = anchor === 'start' ? x0 : anchor === 'end' ? x0 + symbolW : x0 + symbolW / 2;

            texts.push({ x, y, text: text.text, anchor, size: text.size });
        }
    }

    return { width: input.width, height: input.height, rects, texts, font: text.font };
}

/** Lays out a matrix symbol: a QR Code, a Data Matrix, a PDF417. It need not be square. */
export function layoutMatrix(input: MatrixInput): BarcodeLayout {
    const { l, r, t, b } = m(input.margin);
    const text = textBlock(input, 'matrix');
    const rowsN = input.modules.length;
    const colsN = input.modules[0]?.length ?? 0;
    const quiet = input.quiet ?? QR_QUIET;
    const textH = text.visible ? text.size + text.margin * 2 : 0;
    const availW = input.width - l - r;
    const availH = input.height - t - b - textH;
    const fit = Math.max(0, Math.min(availW / (colsN + quiet * 2), availH / (rowsN + quiet * 2)));
    // A whole number of pixels per module keeps the edges sharp; below one pixel there is nothing to round.
    const size = input.moduleSize && input.moduleSize > 0 ? input.moduleSize : fit >= 1 ? Math.floor(fit) : fit;
    const sideW = colsN * size;
    const sideH = rowsN * size;
    const left = l + (availW - sideW) / 2;
    const top = t + (text.visible && text.position === 'top' ? textH : 0) + (availH - sideH) / 2;
    const rects: LayoutRect[] = [];

    input.modules.forEach((row, y) => runs(row, left, top + y * size, size, size, rects));

    const texts: LayoutText[] = [];

    if (text.visible) {
        const y = text.position === 'top' ? t + text.margin + text.size * 0.8 : top + sideH + (availH - sideH) / 2 + text.margin + text.size * 0.8;

        texts.push({ x: left + sideW / 2, y, text: text.text, anchor: 'middle', size: text.size });
    }

    const layout: BarcodeLayout = { width: input.width, height: input.height, rects, texts, font: text.font };

    if (input.logo && input.logo.width > 0 && input.logo.height > 0) {
        // No more than a quarter of the area, and always a whole number of modules clear round it.
        const limit = Math.sqrt((LOGO_MAX_AREA * sideW * sideH) / (input.logo.width * input.logo.height));
        const k = Math.min(1, limit);
        const w = input.logo.width * k;
        const h = input.logo.height * k;
        const x = left + (sideW - w) / 2;
        const y = top + (sideH - h) / 2;
        const pad = size;

        layout.logo = { src: input.logo.src, x, y, w, h, pad: { x: x - pad, y: y - pad, w: w + pad * 2, h: h + pad * 2 } };
    }

    return layout;
}

const round = (n: number) => Math.round(n * 1000) / 1000;
const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The path data of a layout: one `M x y h w v h h -w z` per rectangle. */
export const layoutPath = (rects: LayoutRect[]): string => rects.map((q) => `M${round(q.x)} ${round(q.y)}h${round(q.w)}v${round(q.h)}h${round(-q.w)}z`).join('');

/** The layout as a standalone SVG document. */
export function layoutToSvg(layout: BarcodeLayout, foreColor: string, backgroundColor: string, textColor = foreColor): string {
    const { width, height } = layout;
    const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${round(width)}" height="${round(height)}" viewBox="0 0 ${round(width)} ${round(height)}">`];

    if (backgroundColor) parts.push(`<rect width="100%" height="100%" fill="${escape(backgroundColor)}"/>`);

    parts.push(`<path d="${layoutPath(layout.rects)}" fill="${escape(foreColor)}" shape-rendering="crispEdges"/>`);

    if (layout.logo) {
        const g = layout.logo;

        parts.push(
            `<rect x="${round(g.pad.x)}" y="${round(g.pad.y)}" width="${round(g.pad.w)}" height="${round(g.pad.h)}" fill="${escape(backgroundColor || '#fff')}"/>`,
            `<image href="${escape(g.src)}" x="${round(g.x)}" y="${round(g.y)}" width="${round(g.w)}" height="${round(g.h)}" preserveAspectRatio="xMidYMid meet"/>`
        );
    }

    for (const t of layout.texts) {
        parts.push(`<text x="${round(t.x)}" y="${round(t.y)}" text-anchor="${t.anchor}" font-size="${t.size}" font-family="${escape(layout.font)}" fill="${escape(textColor)}">${escape(t.text)}</text>`);
    }

    parts.push('</svg>');

    return parts.join('');
}

/** The subset of the 2D context the painter uses. */
export interface PaintContext {
    fillStyle: string | CanvasGradient | CanvasPattern;
    font: string;
    textAlign: CanvasTextAlign;
    fillRect(x: number, y: number, w: number, h: number): void;
    fillText(text: string, x: number, y: number): void;
    drawImage?(image: CanvasImageSource, x: number, y: number, w: number, h: number): void;
}

/** Paints a layout on a canvas context. */
export function paintLayout(ctx: PaintContext, layout: BarcodeLayout, foreColor: string, backgroundColor: string, textColor = foreColor, logoImage?: CanvasImageSource | null): void {
    if (backgroundColor) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, layout.width, layout.height);
    }

    ctx.fillStyle = foreColor;

    for (const q of layout.rects) ctx.fillRect(q.x, q.y, q.w, q.h);

    if (layout.logo) {
        const g = layout.logo;

        ctx.fillStyle = backgroundColor || '#fff';
        ctx.fillRect(g.pad.x, g.pad.y, g.pad.w, g.pad.h);

        // The picture needs to have loaded; until it has, the clear box shows.
        if (logoImage) ctx.drawImage?.(logoImage, g.x, g.y, g.w, g.h);
    }

    ctx.fillStyle = textColor;

    for (const t of layout.texts) {
        ctx.font = `${t.size}px ${layout.font}`;
        ctx.textAlign = t.anchor === 'middle' ? 'center' : t.anchor === 'start' ? 'left' : 'right';
        ctx.fillText(t.text, t.x, t.y);
    }
}

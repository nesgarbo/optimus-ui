import type { SignaturePoint, SignatureStroke } from '@openng/optimus-ui/types/signature';

/**
 * The geometry of a signature: how a sampled pen path becomes a line of varying width, and how a set
 * of strokes is written out as canvas calls or as an SVG document.
 *
 * Pure, no DOM. The component feeds it points and hands it a 2D context.
 *
 * @module signature-engine
 */

/** One smoothed piece of a stroke: a quadratic curve between two midpoints, drawn at one width. */
export interface SignatureSegment {
    fromX: number;
    fromY: number;
    ctrlX: number;
    ctrlY: number;
    toX: number;
    toY: number;
    width: number;
}

/**
 * The pen width at every point. A fast pen thins the line and a slow one thickens it, between
 * `minWidth` and `maxWidth`. `velocity` is how much of the newest speed reaches the width: 0 holds
 * the old width, 1 follows the pen exactly.
 */
export function strokeWidths(points: SignaturePoint[], minWidth: number, maxWidth: number, velocity: number): number[] {
    if (!points.length) return [];

    const widths: number[] = [(minWidth + maxWidth) / 2];
    let filtered = 0;

    for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i - 1].x;
        const dy = points[i].y - points[i - 1].y;
        const dt = Math.max(1, points[i].t - points[i - 1].t);
        const speed = Math.hypot(dx, dy) / dt;

        filtered = velocity * speed + (1 - velocity) * filtered;

        const target = Math.max(maxWidth / (filtered + 1), minWidth);

        // A width that jumps from one sample to the next draws as beads: ease towards the target.
        widths.push(widths[i - 1] * 0.6 + target * 0.4);
    }

    return widths;
}

/** The curve segments of a stroke. A stroke of one point has none: it is a dot. */
export function strokeSegments(stroke: SignatureStroke): SignatureSegment[] {
    const { points } = stroke;

    if (points.length < 2) return [];

    const widths = strokeWidths(points, stroke.minWidth, stroke.maxWidth, stroke.velocity);
    const mid = (a: SignaturePoint, b: SignaturePoint) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
    const segments: SignatureSegment[] = [];

    for (let i = 0; i < points.length - 1; i++) {
        const from = i === 0 ? points[0] : mid(points[i - 1], points[i]);
        const to = i === points.length - 2 ? points[points.length - 1] : mid(points[i], points[i + 1]);

        segments.push({ fromX: from.x, fromY: from.y, ctrlX: points[i].x, ctrlY: points[i].y, toX: to.x, toY: to.y, width: widths[i + 1] });
    }

    return segments;
}

/** The radius of the dot a one-point stroke leaves. */
export const dotRadius = (stroke: SignatureStroke): number => (stroke.minWidth + stroke.maxWidth) / 4;

/** The 2D calls the engine needs. A real `CanvasRenderingContext2D` satisfies it. */
export interface SignatureContext {
    strokeStyle: string | CanvasGradient | CanvasPattern;
    fillStyle: string | CanvasGradient | CanvasPattern;
    lineWidth: number;
    lineCap: CanvasLineCap;
    lineJoin: CanvasLineJoin;
    beginPath(): void;
    moveTo(x: number, y: number): void;
    quadraticCurveTo(cx: number, cy: number, x: number, y: number): void;
    stroke(): void;
    arc(x: number, y: number, r: number, a: number, b: number): void;
    fill(): void;
}

/** Draws one stroke. */
export function drawStroke(ctx: SignatureContext, stroke: SignatureStroke): void {
    if (!stroke.points.length) return;

    if (stroke.points.length === 1) {
        ctx.fillStyle = stroke.color;
        ctx.beginPath();
        ctx.arc(stroke.points[0].x, stroke.points[0].y, dotRadius(stroke), 0, Math.PI * 2);
        ctx.fill();

        return;
    }

    ctx.strokeStyle = stroke.color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const s of strokeSegments(stroke)) {
        ctx.lineWidth = s.width;
        ctx.beginPath();
        ctx.moveTo(s.fromX, s.fromY);
        ctx.quadraticCurveTo(s.ctrlX, s.ctrlY, s.toX, s.toY);
        ctx.stroke();
    }
}

const round = (n: number) => Math.round(n * 100) / 100;
/** Escapes text for an XML attribute written between double quotes. */
export const escapeAttr = (text: string): string => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&apos;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Options of {@link toSvg}. */
export interface ToSvgOptions {
    width: number;
    height: number;
    /** Fill drawn behind the strokes. */
    background?: string | null;
    /** Image drawn behind the strokes and over the background: a loaded or a typed signature. */
    image?: string | null;
}

/** The strokes as a standalone SVG document. */
export function toSvg(strokes: SignatureStroke[], options: ToSvgOptions): string {
    const { width, height } = options;
    const parts: string[] = [`<svg xmlns="http://www.w3.org/2000/svg" width="${round(width)}" height="${round(height)}" viewBox="0 0 ${round(width)} ${round(height)}">`];

    if (options.background) parts.push(`<rect width="100%" height="100%" fill="${escapeAttr(options.background)}"/>`);
    if (options.image) parts.push(`<image href="${escapeAttr(options.image)}" width="${round(width)}" height="${round(height)}"/>`);

    for (const stroke of strokes) {
        if (stroke.points.length === 1) {
            const p = stroke.points[0];

            parts.push(`<circle cx="${round(p.x)}" cy="${round(p.y)}" r="${round(dotRadius(stroke))}" fill="${escapeAttr(stroke.color)}"/>`);
            continue;
        }

        for (const s of strokeSegments(stroke)) {
            parts.push(`<path d="M${round(s.fromX)} ${round(s.fromY)}Q${round(s.ctrlX)} ${round(s.ctrlY)} ${round(s.toX)} ${round(s.toY)}" fill="none" stroke="${escapeAttr(stroke.color)}" stroke-width="${round(s.width)}" stroke-linecap="round"/>`);
        }
    }

    parts.push('</svg>');

    return parts.join('');
}

/** The data URL of an SVG document. */
export const svgToDataUrl = (svg: string): string => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

/** Scales every point of a set of strokes, for a pad that was resized. */
export function scaleStrokes(strokes: SignatureStroke[], fx: number, fy: number): SignatureStroke[] {
    if (fx === 1 && fy === 1) return strokes;

    const f = Math.sqrt(fx * fy);

    return strokes.map((s) => ({ ...s, minWidth: s.minWidth * f, maxWidth: s.maxWidth * f, points: s.points.map((p) => ({ ...p, x: p.x * fx, y: p.y * fy })) }));
}

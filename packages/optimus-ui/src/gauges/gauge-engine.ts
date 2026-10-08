import type { GaugeLabels, GaugeMarkerShape, GaugeRange } from '@openng/optimus-ui/types/gauges';

/**
 * The geometry of a gauge: where a value sits on a dial, how a ring, a tapered band, a needle and a
 * marker are drawn, and which ticks and labels an axis has.
 *
 * Pure. Angles are degrees clockwise from twelve o'clock, which is how a dial is read, and not the
 * three-o'clock convention of the charts.
 *
 * @module gauge-engine
 */

const rad = (deg: number) => (deg * Math.PI) / 180;
const round = (n: number) => Math.round(n * 1000) / 1000;

/** A point on a circle. 0 degrees is straight up, and angles run clockwise. */
export function polar(cx: number, cy: number, r: number, deg: number): { x: number; y: number } {
    return { x: cx + r * Math.sin(rad(deg)), y: cy - r * Math.cos(rad(deg)) };
}

/** How many degrees an axis sweeps. Equal start and end is a full circle. */
export function sweepOf(startAngle: number, endAngle: number): number {
    const sweep = (((endAngle - startAngle) % 360) + 360) % 360;

    return sweep === 0 ? 360 : sweep;
}

/** The angle a value sits at. */
export function valueToAngle(value: number, min: number, max: number, startAngle: number, endAngle: number, clockwise = true): number {
    const span = max - min || 1;
    const t = Math.min(Math.max((value - min) / span, 0), 1);
    const sweep = sweepOf(startAngle, endAngle);

    return startAngle + (clockwise ? 1 : -1) * t * sweep;
}

/** The value an angle stands for, the nearest end when the angle is in the gap. */
export function angleToValue(angle: number, min: number, max: number, startAngle: number, endAngle: number, clockwise = true): number {
    const sweep = sweepOf(startAngle, endAngle);
    let delta = clockwise ? angle - startAngle : startAngle - angle;

    delta = ((delta % 360) + 360) % 360;

    if (delta > sweep) {
        // In the gap: snap to the closer end.
        delta = delta - sweep < (360 - sweep) / 2 ? sweep : 0;
    }

    return min + (delta / sweep) * (max - min);
}

/** The angle of a point seen from a center, clockwise from the top, in 0 to 360. */
export function angleFrom(cx: number, cy: number, x: number, y: number): number {
    return ((Math.atan2(x - cx, cy - y) * 180) / Math.PI + 360) % 360;
}

/** A ring segment between two radii, from one angle to another, along the direction the axis runs. */
export function ringPath(cx: number, cy: number, inner: number, outer: number, fromAngle: number, toAngle: number): string {
    const span = toAngle - fromAngle;

    if (Math.abs(span) < 1e-6) return '';

    // A full turn cannot be one arc: split it in two halves.
    if (Math.abs(span) >= 360 - 1e-6) return `${ringPath(cx, cy, inner, outer, fromAngle, fromAngle + span / 2)}${ringPath(cx, cy, inner, outer, fromAngle + span / 2, toAngle)}`;

    const large = Math.abs(span) > 180 ? 1 : 0;
    const sweepFlag = span > 0 ? 1 : 0;
    const a = polar(cx, cy, outer, fromAngle);
    const b = polar(cx, cy, outer, toAngle);
    const c = polar(cx, cy, inner, toAngle);
    const d = polar(cx, cy, inner, fromAngle);

    return `M${round(a.x)} ${round(a.y)}A${round(outer)} ${round(outer)} 0 ${large} ${sweepFlag} ${round(b.x)} ${round(b.y)}L${round(c.x)} ${round(c.y)}A${round(inner)} ${round(inner)} 0 ${large} ${1 - sweepFlag} ${round(d.x)} ${round(d.y)}Z`;
}

/** An open arc along one radius: the axis line. */
export function arcLine(cx: number, cy: number, r: number, fromAngle: number, toAngle: number): string {
    const span = toAngle - fromAngle;

    if (Math.abs(span) >= 360 - 1e-6) {
        const a = polar(cx, cy, r, fromAngle);
        const b = polar(cx, cy, r, fromAngle + 180);

        return `M${round(a.x)} ${round(a.y)}A${round(r)} ${round(r)} 0 1 1 ${round(b.x)} ${round(b.y)}A${round(r)} ${round(r)} 0 1 1 ${round(a.x)} ${round(a.y)}`;
    }

    const a = polar(cx, cy, r, fromAngle);
    const b = polar(cx, cy, r, toAngle);

    return `M${round(a.x)} ${round(a.y)}A${round(r)} ${round(r)} 0 ${Math.abs(span) > 180 ? 1 : 0} ${span > 0 ? 1 : 0} ${round(b.x)} ${round(b.y)}`;
}

/** A band that grows or shrinks from `startWidth` to `endWidth` along its length, drawn from its outer radius inward. */
export function taperedPath(cx: number, cy: number, outer: number, startWidth: number, endWidth: number, fromAngle: number, toAngle: number): string {
    if (startWidth === endWidth) return ringPath(cx, cy, Math.max(outer - startWidth, 0), outer, fromAngle, toAngle);

    const steps = Math.max(2, Math.ceil(Math.abs(toAngle - fromAngle) / 3));
    const outerPoints: string[] = [];
    const innerPoints: string[] = [];

    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const angle = fromAngle + (toAngle - fromAngle) * t;
        const width = startWidth + (endWidth - startWidth) * t;
        const o = polar(cx, cy, outer, angle);
        const n = polar(cx, cy, Math.max(outer - width, 0), angle);

        outerPoints.push(`${round(o.x)} ${round(o.y)}`);
        innerPoints.unshift(`${round(n.x)} ${round(n.y)}`);
    }

    return `M${outerPoints.join('L')}L${innerPoints.join('L')}Z`;
}

/** A needle of `length` from the center, `width` at the base, with a tail behind the center. Drawn pointing up, to be rotated. */
export function needlePath(cx: number, cy: number, length: number, width: number, tail = 0): string {
    const half = width / 2;

    return `M${round(cx - half)} ${round(cy + tail)}L${round(cx - half)} ${round(cy)}L${round(cx)} ${round(cy - length)}L${round(cx + half)} ${round(cy)}L${round(cx + half)} ${round(cy + tail)}Z`;
}

/** A marker shape of `w` by `h`, centered on the origin, pointing up. */
export function markerShapePath(shape: GaugeMarkerShape, w: number, h: number): string {
    const hw = w / 2;
    const hh = h / 2;

    switch (shape) {
        case 'circle':
            return `M${-hw} 0A${hw} ${hh} 0 1 0 ${hw} 0A${hw} ${hh} 0 1 0 ${-hw} 0Z`;
        case 'rectangle':
            return `M${-hw} ${-hh}H${hw}V${hh}H${-hw}Z`;
        case 'diamond':
            return `M0 ${-hh}L${hw} 0L0 ${hh}L${-hw} 0Z`;
        case 'invertedTriangle':
            return `M${-hw} ${-hh}H${hw}L0 ${hh}Z`;
        default:
            return `M0 ${-hh}L${hw} ${hh}H${-hw}Z`;
    }
}

/** The values the ticks of an axis stand at. */
export interface AxisTicks {
    major: number[];
    minor: number[];
}

const decimals = (n: number) => (Math.abs(n) >= 1 ? 0 : Math.min(Math.ceil(-Math.log10(Math.abs(n) || 1)) + 1, 10));

/** A round step for `span`, about `count` steps to a span. */
export function niceInterval(span: number, count = 10): number {
    if (!(span > 0)) return 1;

    const raw = span / count;
    const pow = Math.pow(10, Math.floor(Math.log10(raw)));
    const f = raw / pow;

    return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * pow;
}

/** Major ticks every `interval` (a round step when omitted), minor ticks every `minorInterval` (none when omitted). */
export function axisTicks(min: number, max: number, interval?: number, minorInterval?: number): AxisTicks {
    const step = interval && interval > 0 ? interval : niceInterval(max - min);
    const fix = Math.max(decimals(step), minorInterval ? decimals(minorInterval) : 0);
    const clean = (v: number) => Number(v.toFixed(Math.min(fix + 1, 12)));
    const walk = (by: number) => {
        const out: number[] = [];

        for (let i = 0, v = min; v <= max + by * 1e-9 && i < 5000; i++, v = clean(min + i * by)) out.push(clean(v));

        return out;
    };
    const major = walk(step);
    const minorAll = minorInterval && minorInterval > 0 ? walk(minorInterval) : [];

    return { major, minor: minorAll.filter((v) => !major.some((m) => Math.abs(m - v) < step * 1e-6)) };
}

/** The text of a label. */
export function formatLabel(value: number, format: GaugeLabels['format'] | undefined, locale?: string): string {
    if (typeof format === 'function') return format(value);

    const text = new Intl.NumberFormat(locale, { maximumFractionDigits: 6 }).format(value);

    return typeof format === 'string' && format ? format.replace('{value}', text) : text;
}

/** A length that is a number of pixels or a percentage (`'80%'`) of `of`. */
export function resolveLength(value: string | number | undefined, of: number, fallback: number): number {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value === 'number') return value;

    const m = /^\s*(-?[\d.]+)\s*(%|px)?\s*$/.exec(value);

    if (!m) return fallback;

    return m[2] === '%' ? (Number(m[1]) / 100) * of : Number(m[1]);
}

/** The color of the range a value falls in. */
export function rangeColorAt(value: number, ranges: readonly GaugeRange[] | undefined, fallback: string): string {
    const range = ranges?.find((r) => value >= Math.min(r.start, r.end) && value <= Math.max(r.start, r.end));

    return range?.color ?? fallback;
}

/** A box. */
export interface Bounds {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

/** The box around an arc of radius `r`, from one angle to another: its ends and every quarter turn between them. */
export function arcBounds(cx: number, cy: number, r: number, fromAngle: number, toAngle: number, into?: Bounds): Bounds {
    const b: Bounds = into ?? { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    const lo = Math.min(fromAngle, toAngle);
    const hi = Math.max(fromAngle, toAngle);
    const angles = [fromAngle, toAngle];

    for (let a = Math.ceil(lo / 90) * 90; a <= hi; a += 90) angles.push(a);

    for (const a of angles) {
        const p = polar(cx, cy, r, a);

        b.minX = Math.min(b.minX, p.x);
        b.maxX = Math.max(b.maxX, p.x);
        b.minY = Math.min(b.minY, p.y);
        b.maxY = Math.max(b.maxY, p.y);
    }

    return b;
}

/** Widens a box by `pad` on every side. */
export const padBounds = (b: Bounds, pad: number): Bounds => ({ minX: b.minX - pad, minY: b.minY - pad, maxX: b.maxX + pad, maxY: b.maxY + pad });

/** A box as an SVG `viewBox`. */
export const viewBoxOf = (b: Bounds): string => `${round(b.minX)} ${round(b.minY)} ${round(b.maxX - b.minX)} ${round(b.maxY - b.minY)}`;

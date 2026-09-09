/**
 * Mark geometry: markers, arcs, rounded rectangles and the polar mapping.
 *
 * Everything here emits SVG path data or plain numbers, so a shape is defined once and both
 * renderers draw the same thing.
 */
import type { BorderRadius, BorderRadiusConfig, PointStyle } from '@openng/optimus-ui/types/charts';

/** The built-in marker names, so a renderer can tell an enum value from a custom path. */
export const MARKER_SHAPE_NAMES: readonly PointStyle[] = ['circle', 'square', 'triangle', 'cross', 'star'];

/** True when a `markerShape` value names a built-in shape rather than carrying path data. */
export function isMarkerShapeName(value: string): value is PointStyle {
    return (MARKER_SHAPE_NAMES as readonly string[]).includes(value);
}

/**
 * Path data for a built-in marker, centered on the origin so the renderer can translate and rotate
 * it freely. `size` is a radius, which keeps a marker's visual weight consistent across shapes.
 */
export function markerPath(shape: PointStyle, size: number): string {
    const r = Math.max(size, 0);

    switch (shape) {
        case 'square':
            return `M ${-r} ${-r} L ${r} ${-r} L ${r} ${r} L ${-r} ${r} Z`;
        case 'triangle': {
            // Sized so the triangle's area is close to the circle's, or it reads as smaller.
            const h = r * 1.4;

            return `M 0 ${-h} L ${h * 0.866} ${h * 0.5} L ${-h * 0.866} ${h * 0.5} Z`;
        }
        case 'cross': {
            const arm = r * 0.35;

            return `M ${-arm} ${-r} L ${arm} ${-r} L ${arm} ${-arm} L ${r} ${-arm} L ${r} ${arm} L ${arm} ${arm} L ${arm} ${r} L ${-arm} ${r} L ${-arm} ${arm} L ${-r} ${arm} L ${-r} ${-arm} L ${-arm} ${-arm} Z`;
        }
        case 'star':
            return starPath(r, r * 0.45, 5);
        default:
            return circlePath(r);
    }
}

/** A circle as path data, so every marker shape goes down one code path. */
export function circlePath(r: number): string {
    return `M ${-r} 0 A ${r} ${r} 0 1 0 ${r} 0 A ${r} ${r} 0 1 0 ${-r} 0 Z`;
}

/** An n-pointed star as path data. */
export function starPath(outerRadius: number, innerRadius: number, points: number): string {
    const step = Math.PI / points;
    let d = '';

    for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = i * step - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        d += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
    }

    return `${d}Z`;
}

/** Normalizes a border radius into its four corners. */
export function resolveBorderRadius(radius: BorderRadius | undefined): Required<BorderRadiusConfig> {
    if (radius == null) return { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 };

    if (typeof radius === 'number') {
        return { topLeft: radius, topRight: radius, bottomLeft: radius, bottomRight: radius };
    }

    return {
        topLeft: radius.topLeft ?? 0,
        topRight: radius.topRight ?? 0,
        bottomLeft: radius.bottomLeft ?? 0,
        bottomRight: radius.bottomRight ?? 0
    };
}

/**
 * A rounded rectangle as path data. Each corner radius is capped at half the shorter side, so a
 * radius larger than the bar cannot invert the geometry into a shape that self-intersects.
 */
export function roundedRectPath(x: number, y: number, width: number, height: number, radius: BorderRadius | undefined): string {
    const w = Math.max(width, 0);
    const h = Math.max(height, 0);

    if (w === 0 || h === 0) return '';

    const corners = resolveBorderRadius(radius);
    const cap = Math.min(w, h) / 2;
    const tl = Math.min(corners.topLeft, cap);
    const tr = Math.min(corners.topRight, cap);
    const br = Math.min(corners.bottomRight, cap);
    const bl = Math.min(corners.bottomLeft, cap);

    if (tl === 0 && tr === 0 && br === 0 && bl === 0) {
        return `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
    }

    return (
        `M ${x + tl} ${y} ` +
        `L ${x + w - tr} ${y} ` +
        (tr ? `A ${tr} ${tr} 0 0 1 ${x + w} ${y + tr} ` : '') +
        `L ${x + w} ${y + h - br} ` +
        (br ? `A ${br} ${br} 0 0 1 ${x + w - br} ${y + h} ` : '') +
        `L ${x + bl} ${y + h} ` +
        (bl ? `A ${bl} ${bl} 0 0 1 ${x} ${y + h - bl} ` : '') +
        `L ${x} ${y + tl} ` +
        (tl ? `A ${tl} ${tl} 0 0 1 ${x + tl} ${y} ` : '') +
        'Z'
    );
}

/** Degrees to radians. */
export function toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

/** Radians to degrees. */
export function toDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
}

/** A point on a circle, with 0 degrees at three o'clock and angles running clockwise. */
export function polarToCartesian(cx: number, cy: number, radius: number, degrees: number): { x: number; y: number } {
    const radians = toRadians(degrees);

    return { x: cx + Math.cos(radians) * radius, y: cy + Math.sin(radians) * radius };
}

/** The angle of a point relative to a center, normalized into 0 to 360 degrees. */
export function angleOf(cx: number, cy: number, x: number, y: number): number {
    const degrees = toDegrees(Math.atan2(y - cy, x - cx));

    return (degrees + 360) % 360;
}

/** Whether an angle falls inside a sweep, handling the case where the sweep crosses zero. */
export function angleInSweep(angle: number, startAngle: number, endAngle: number): boolean {
    const normalized = (angle + 360) % 360;
    const start = (startAngle + 360) % 360;
    const end = (endAngle + 360) % 360;

    if (start <= end) return normalized >= start && normalized <= end;

    return normalized >= start || normalized <= end;
}

/**
 * An arc, or a ring segment when `innerRadius` is above zero, as path data.
 *
 * A full circle is drawn as two half arcs, because a single arc whose start and end coincide is
 * degenerate and renders as nothing at all — which is how a one-slice pie disappears.
 */
export function arcPath(cx: number, cy: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number, cornerRadius = 0): string {
    const sweep = endAngle - startAngle;

    if (Math.abs(sweep) < 1e-6) return '';

    if (Math.abs(sweep) >= 359.999) {
        return fullRingPath(cx, cy, innerRadius, outerRadius);
    }

    const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
    const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);
    const largeArc = Math.abs(sweep) > 180 ? 1 : 0;
    const direction = sweep > 0 ? 1 : 0;

    if (innerRadius <= 0) {
        if (cornerRadius > 0) {
            return roundedWedgePath(cx, cy, outerRadius, startAngle, endAngle, cornerRadius);
        }

        return `M ${cx} ${cy} L ${outerStart.x} ${outerStart.y} A ${outerRadius} ${outerRadius} 0 ${largeArc} ${direction} ${outerEnd.x} ${outerEnd.y} Z`;
    }

    const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
    const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);

    return (
        `M ${outerStart.x} ${outerStart.y} ` +
        `A ${outerRadius} ${outerRadius} 0 ${largeArc} ${direction} ${outerEnd.x} ${outerEnd.y} ` +
        `L ${innerEnd.x} ${innerEnd.y} ` +
        `A ${innerRadius} ${innerRadius} 0 ${largeArc} ${direction === 1 ? 0 : 1} ${innerStart.x} ${innerStart.y} Z`
    );
}

/** A full circle, or a full ring, drawn as two half arcs. */
export function fullRingPath(cx: number, cy: number, innerRadius: number, outerRadius: number): string {
    const outer = `M ${cx - outerRadius} ${cy} A ${outerRadius} ${outerRadius} 0 1 0 ${cx + outerRadius} ${cy} A ${outerRadius} ${outerRadius} 0 1 0 ${cx - outerRadius} ${cy} Z`;

    if (innerRadius <= 0) return outer;

    // The hole is wound the other way so the even-odd fill knocks it out.
    const inner = `M ${cx - innerRadius} ${cy} A ${innerRadius} ${innerRadius} 0 1 1 ${cx + innerRadius} ${cy} A ${innerRadius} ${innerRadius} 0 1 1 ${cx - innerRadius} ${cy} Z`;

    return `${outer} ${inner}`;
}

/** A wedge with its outer corners rounded. */
function roundedWedgePath(cx: number, cy: number, outerRadius: number, startAngle: number, endAngle: number, cornerRadius: number): string {
    const sweep = endAngle - startAngle;
    // Cap the radius so two rounded corners on a narrow slice cannot overlap.
    const arcLength = (Math.abs(sweep) / 360) * 2 * Math.PI * outerRadius;
    const r = Math.min(cornerRadius, arcLength / 2, outerRadius / 2);
    const angleInset = toDegrees(r / outerRadius);
    const start = polarToCartesian(cx, cy, outerRadius, startAngle + angleInset);
    const end = polarToCartesian(cx, cy, outerRadius, endAngle - angleInset);
    const largeArc = Math.abs(sweep) > 180 ? 1 : 0;

    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${outerRadius} ${outerRadius} 0 ${largeArc} ${sweep > 0 ? 1 : 0} ${end.x} ${end.y} Z`;
}

/** A regular polygon, which is what a polygon-shaped radar grid ring is. */
export function polygonPath(cx: number, cy: number, radius: number, sides: number, rotationDegrees = -90): string {
    if (sides < 3 || radius <= 0) return '';

    let d = '';

    for (let i = 0; i < sides; i++) {
        const angle = rotationDegrees + (360 / sides) * i;
        const point = polarToCartesian(cx, cy, radius, angle);

        d += `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y} `;
    }

    return `${d}Z`;
}

/** The vertices of a radar or polar chart's spokes. */
export function spokeAngles(count: number, startDegrees = -90, sweepDegrees = 360): number[] {
    if (count <= 0) return [];

    const step = sweepDegrees / count;

    return Array.from({ length: count }, (_, i) => startDegrees + step * i);
}

/** Squared distance, for comparing distances without paying for the square root. */
export function distanceSquared(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;

    return dx * dx + dy * dy;
}

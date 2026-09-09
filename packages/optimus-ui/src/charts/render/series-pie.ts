/**
 * The pie painter: pie, donut, gauge and nightingale.
 *
 * All four are one shape with different parameters. A donut is a pie with an inner radius, a gauge
 * is a donut with a sweep under 360 degrees, and a nightingale is a pie whose slices have their own
 * outer radii. Treating them as one series with `innerRadius`, `sweepAngle` and `sliceRadiusValue`
 * rather than as four types is what keeps every other input — the labels, the hover, the slice
 * template — working across all of them.
 */
import type { ItemContext, PieSeriesProps, SliceRenderContext, SvgNode } from '@openng/optimus-ui/types/charts';
import { itemContext, readPath, resolveColorAccessor, resolveDashAccessor, resolveScalarAccessor } from '../core/accessor';
import { arcPath, polarToCartesian } from '../core/geometry';
import { seriesColorClass } from '../core/palette';
import { sortCategories } from '../core/stack';
import type { ResolvedSeries } from '../charts-state';
import { centerOf, radiusOf } from '../core/layout';
import { isHovered, markOpacity, slotGroup, type DrawContext } from './scene';
import { dashAttr } from './series-line';

/** One slice, resolved into angles and radii. */
export interface SliceGeometry {
    label: string;
    value: number;
    percentage: number;
    startAngle: number;
    endAngle: number;
    innerRadius: number;
    outerRadius: number;
    dataIndex: number;
    /**
     * Radial offset, which is what pulls a slice out of an exploded pie.
     */
    offset: number;
}

/** Where a pie is drawn and how big it is. */
export interface PieFrame {
    center: { x: number; y: number };
    radius: number;
}

/** Works out the circle a radial series is drawn on. */
export function pieFrame(ctx: DrawContext): PieFrame {
    return { center: centerOf(ctx.area), radius: radiusOf(ctx.area) };
}

/**
 * Projects a pie series into slices.
 *
 * Only the visible slices contribute to the total, so hiding one through the legend re-proportions
 * the rest into a full circle rather than leaving a wedge-shaped hole. That is the right behaviour
 * for a part-to-whole chart: the whole is whatever is currently shown.
 */
export function projectSlices(ctx: DrawContext, series: ResolvedSeries, props: PieSeriesProps, frame: PieFrame): SliceGeometry[] {
    const data = (props.data as Record<string, unknown>[] | undefined) ?? [];
    const valueField = typeof props.valueField === 'string' ? props.valueField : 'value';
    const categoryField = typeof props.categoryField === 'string' ? props.categoryField : 'category';

    const entries = data
        .map((datum, dataIndex) => {
            const raw = readPath(datum, valueField);
            const value = typeof raw === 'number' ? raw : Number(raw);

            return {
                dataIndex,
                datum,
                label: String(readPath(datum, categoryField) ?? dataIndex),
                // A negative value has no meaning in a part-to-whole chart, so its magnitude is
                // used rather than letting it subtract from the total and distort every other slice.
                value: Number.isFinite(value) ? Math.abs(value) : 0
            };
        })
        .filter((entry) => ctx.isItemVisible(series.id, entry.dataIndex) && entry.value > 0);

    if (entries.length === 0) return [];

    const ordered = props.sort ? sortBySlice(entries, props.sort) : entries;
    const total = ordered.reduce((sum, entry) => sum + entry.value, 0);

    if (total <= 0) return [];

    const innerRatio = clamp01(props.innerRadius ?? 0);
    const outerRatio = clamp01(props.outerRadius ?? 1);
    const startAngle = props.startAngle ?? -90;
    const sweep = props.sweepAngle ?? 360;
    const spacing = props.spacing ?? 0;

    const outerRadius = frame.radius * outerRatio;
    const innerRadius = outerRadius * innerRatio;

    // The spacing between slices is taken out of each slice's own sweep, expressed as the angle that
    // gap subtends at the mid-radius -- so the visual gap stays constant rather than pinching at the
    // inner edge of a thin ring.
    const midRadius = (outerRadius + innerRadius) / 2 || outerRadius;
    const gapAngle = spacing > 0 && midRadius > 0 ? Math.min((spacing / (2 * Math.PI * midRadius)) * 360, sweep / ordered.length / 2) : 0;

    const slices: SliceGeometry[] = [];
    let cursor = startAngle;

    for (const entry of ordered) {
        const fraction = entry.value / total;
        // Progress sweeps the pie open rather than fading it in, so a partially drawn pie shows a
        // real fraction of the data instead of the whole thing at low opacity.
        const span = fraction * sweep * ctx.progress;
        const context: ItemContext<unknown> = itemContext(entry.datum, entry.dataIndex, series.seriesIndex, series.id, entry.value, entry.label);
        const sliceRadius = props.sliceRadiusValue != null ? (resolveScalarAccessor(props.sliceRadiusValue, context) as number | undefined) : undefined;
        const hovered = isHovered(ctx, series.id, entry.dataIndex);
        const explode = (resolveScalarAccessor(props.offset, context, 0) as number) ?? 0;
        const hoverOffset = hovered && ctx.hoverEffect?.offset ? ctx.hoverEffect.offset : 0;

        slices.push({
            label: entry.label,
            value: entry.value,
            percentage: fraction * 100,
            startAngle: cursor + gapAngle / 2,
            endAngle: cursor + span - gapAngle / 2,
            innerRadius,
            // A nightingale scales each slice's radius by its own value, which is what encodes the
            // magnitude in the radius as well as in the angle.
            outerRadius: sliceRadius != null ? scaleSliceRadius(sliceRadius, ordered, outerRadius, innerRadius) : outerRadius,
            dataIndex: entry.dataIndex,
            offset: explode + hoverOffset
        });

        cursor += span;
    }

    return slices;
}

/** Sorts the slices before they are laid out. */
function sortBySlice<T extends { label: string; value: number }>(entries: T[], order: NonNullable<PieSeriesProps['sort']>): T[] {
    const byLabel = new Map(entries.map((entry) => [entry.label, entry]));
    const labels = sortCategories(
        entries.map((entry) => entry.label),
        (label) => byLabel.get(label)?.value ?? 0,
        order
    );

    return labels.map((label) => byLabel.get(label)!).filter(Boolean);
}

/** Maps a nightingale radius value onto the available radial band. */
function scaleSliceRadius(value: number, entries: readonly { value: number }[], outerRadius: number, innerRadius: number): number {
    const max = Math.max(...entries.map((entry) => entry.value), value);

    if (max <= 0) return outerRadius;

    return innerRadius + (outerRadius - innerRadius) * Math.min(Math.max(value / max, 0), 1);
}

/** Paints a pie, donut, gauge or nightingale series. */
export function paintPieSeries(ctx: DrawContext, series: ResolvedSeries, props: PieSeriesProps, frame: PieFrame): SvgNode[] {
    const slices = projectSlices(ctx, series, props, frame);
    const data = (props.data as unknown[] | undefined) ?? [];
    const nodes: SvgNode[] = [];

    for (const slice of slices) {
        const context: ItemContext<unknown> = itemContext(data[slice.dataIndex], slice.dataIndex, series.seriesIndex, series.id, slice.value, slice.label);
        const hovered = isHovered(ctx, series.id, slice.dataIndex);
        // A slice's colour comes from its own index, not the series' -- a pie is one series whose
        // slices are the categories, so the palette has to vary per slice.
        const fallback = ctx.seriesColor(slice.dataIndex);
        const hoverFill = hovered ? (resolveColorAccessor(props.hoverColor, context) as string | undefined) : undefined;
        const fill = hoverFill ?? (resolveColorAccessor(props.color, context, fallback) as string) ?? fallback;
        const stroke = hovered
            ? ((resolveColorAccessor(props.hoverBorderColor, context) as string | undefined) ?? (resolveColorAccessor(props.borderColor, context) as string | undefined))
            : (resolveColorAccessor(props.borderColor, context) as string | undefined);
        const radius = (resolveScalarAccessor(props.borderRadius, context, 0) as number) ?? 0;
        const opacity = (resolveScalarAccessor(props.opacity, context, 1) as number) ?? 1;
        const mid = (slice.startAngle + slice.endAngle) / 2;
        const shift = slice.offset > 0 ? polarToCartesian(0, 0, slice.offset, mid) : { x: 0, y: 0 };
        const scale = hovered && ctx.hoverEffect?.scale && ctx.hoverEffect.scale !== 1 ? ctx.hoverEffect.scale : 1;

        nodes.push({
            tag: 'path',
            attrs: {
                class: `p-chart-slice ${seriesColorClass(slice.dataIndex)}${hovered ? ' p-chart-point-hover' : ''}`,
                'data-slot': 'chart-slice',
                'data-series': series.id,
                'data-index': slice.dataIndex,
                'data-category': slice.label,
                'data-state': hovered ? 'hovered' : null,
                d: arcPath(frame.center.x, frame.center.y, slice.innerRadius, slice.outerRadius, slice.startAngle, slice.endAngle, typeof radius === 'number' ? radius : 0),
                fill,
                'fill-opacity': opacity,
                stroke: stroke ?? null,
                'stroke-width': (resolveScalarAccessor(props.borderStrokeWidth, context) as number | undefined) ?? null,
                'stroke-linejoin': props.borderJoinStyle ?? null,
                'stroke-dasharray': dashAttr(resolveDashAccessor(props.borderDash, context)),
                opacity: markOpacity(ctx, series.id, slice.dataIndex),
                transform: shift.x || shift.y || scale !== 1 ? `translate(${shift.x} ${shift.y})${scale !== 1 ? ` scale(${scale})` : ''}` : null
            },
            children: []
        });
    }

    return [slotGroup('chart-series', { class: 'p-chart-series p-chart-series-pie', 'data-series': series.id, 'data-series-type': 'pie' }, nodes)];
}

/** Builds the context a slice template or render function receives. */
export function sliceRenderContext(ctx: DrawContext, series: ResolvedSeries, slice: SliceGeometry, frame: PieFrame, color: string, data: readonly unknown[]): SliceRenderContext {
    const mid = (slice.startAngle + slice.endAngle) / 2;
    const midRadius = (slice.innerRadius + slice.outerRadius) / 2;
    const point = polarToCartesian(frame.center.x, frame.center.y, midRadius, mid);

    return {
        index: slice.dataIndex,
        data: data[slice.dataIndex],
        value: slice.value,
        percentage: slice.percentage,
        label: slice.label,
        color,
        center: frame.center,
        // x and y are the arc's midpoint, deliberately distinct from `center`: content inside a
        // slice anchors here, while a donut-hole label anchors at the centre.
        x: point.x,
        y: point.y,
        angle: mid,
        isHovered: isHovered(ctx, series.id, slice.dataIndex),
        isVisible: ctx.isItemVisible(series.id, slice.dataIndex),
        fontFamily: ctx.fontFamily
    };
}

/** Clamps a ratio into 0 to 1. */
function clamp01(value: number): number {
    return Math.min(Math.max(value, 0), 1);
}

/** Whether the pointer is over a slice, and which one. */
export function hitTestSlices(slices: readonly SliceGeometry[], frame: PieFrame, x: number, y: number): SliceGeometry | null {
    const dx = x - frame.center.x;
    const dy = y - frame.center.y;
    const distance = Math.hypot(dx, dy);
    const angle = ((((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360) + 360) % 360;

    for (const slice of slices) {
        if (distance < slice.innerRadius || distance > slice.outerRadius) continue;

        const start = ((slice.startAngle % 360) + 360) % 360;
        const end = ((slice.endAngle % 360) + 360) % 360;
        const inside = start <= end ? angle >= start && angle <= end : angle >= start || angle <= end;

        if (inside) return slice;
    }

    return null;
}

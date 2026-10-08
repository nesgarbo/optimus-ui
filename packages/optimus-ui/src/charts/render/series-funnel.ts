/**
 * The funnel and pyramid painter.
 *
 * A funnel has no axes: the height of a slice carries the value, and the outline carries nothing but the shape. It reads its data
 * the way a pie does -- one category and one value per slice, hidden ones left out and the rest sharing the whole -- so the legend,
 * the tooltip, the labels and the hover treat it as the part-to-whole chart it is.
 */
import type { FunnelSeriesProps, ItemContext, SvgNode } from '@openng/optimus-ui/types/charts';
import { itemContext, readPath, resolveColorAccessor, resolveDashAccessor, resolveScalarAccessor } from '../core/accessor';
import { insideSlice, layoutFunnel, polygonPathData, type FunnelShape, type FunnelSlice } from '../core/funnel';
import { seriesColorClass } from '../core/palette';
import { sortCategories } from '../core/stack';
import type { ResolvedSeries } from '../charts-state';
import { isHovered, markOpacity, slotGroup, type DrawContext } from './scene';
import { dashAttr } from './series-line';

/** One slice of a funnel, with the data it stands for. */
export interface FunnelItem extends FunnelSlice {
    label: string;
    value: number;
    percentage: number;
    dataIndex: number;
}

const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1);

/** Projects a funnel or pyramid series into slices. Only the visible items count, so hiding one through the legend re-proportions the rest. */
export function projectFunnel(ctx: DrawContext, series: ResolvedSeries, props: FunnelSeriesProps): FunnelItem[] {
    const data = (props.data as Record<string, unknown>[] | undefined) ?? [];
    const valueField = typeof props.valueField === 'string' ? props.valueField : 'value';
    const categoryField = typeof props.categoryField === 'string' ? props.categoryField : 'category';

    const entries = data
        .map((datum, dataIndex) => {
            const raw = readPath(datum, valueField);
            const value = typeof raw === 'number' ? raw : Number(raw);

            return { dataIndex, label: String(readPath(datum, categoryField) ?? dataIndex), value: Number.isFinite(value) ? Math.abs(value) : 0 };
        })
        .filter((entry) => ctx.isItemVisible(series.id, entry.dataIndex));

    if (!entries.length) return [];

    let ordered = entries;

    if (props.sort) {
        const byLabel = new Map(entries.map((entry) => [entry.label, entry]));

        ordered = sortCategories(
            entries.map((entry) => entry.label),
            (label) => byLabel.get(label)?.value ?? 0,
            props.sort
        )
            .map((label) => byLabel.get(label)!)
            .filter(Boolean);
    }

    const total = ordered.reduce((sum, entry) => sum + entry.value, 0);

    if (total <= 0) return [];

    const widthRatio = clamp01(props.widthRatio ?? 0.9);
    const heightRatio = clamp01(props.heightRatio ?? 1);
    const width = ctx.area.width * widthRatio;
    // The shape grows in from the top as the chart animates, so a half drawn funnel shows real slices rather than faded ones.
    const fullHeight = ctx.area.height * heightRatio;
    const slices = layoutFunnel(
        ordered.map((entry) => entry.value),
        {
            shape: series.type as FunnelShape,
            x: ctx.area.x + (ctx.area.width - width) / 2,
            y: ctx.area.y + (ctx.area.height - fullHeight) / 2,
            width,
            height: fullHeight,
            neckWidth: props.neckWidth,
            neckHeight: props.neckHeight,
            gap: props.gap,
            mode: props.mode,
            inverted: props.inverted
        }
    );

    return slices.map((slice, i) => ({ ...slice, label: ordered[i].label, value: ordered[i].value, percentage: (ordered[i].value / total) * 100, dataIndex: ordered[i].dataIndex }));
}

/** The colour of one slice. */
export function funnelColor(ctx: DrawContext, series: ResolvedSeries, item: FunnelItem, props: FunnelSeriesProps, data: readonly unknown[]): string {
    const context: ItemContext<unknown> = itemContext(data[item.dataIndex], item.dataIndex, series.seriesIndex, series.id, item.value, item.label);
    const fallback = ctx.seriesColor(item.dataIndex);

    return (resolveColorAccessor(props.color, context, fallback) as string) ?? fallback;
}

/** Paints a funnel or a pyramid. */
export function paintFunnelSeries(ctx: DrawContext, series: ResolvedSeries, props: FunnelSeriesProps): SvgNode[] {
    const items = projectFunnel(ctx, series, props);
    const data = (props.data as unknown[] | undefined) ?? [];
    const nodes: SvgNode[] = [];

    for (const item of items) {
        const context: ItemContext<unknown> = itemContext(data[item.dataIndex], item.dataIndex, series.seriesIndex, series.id, item.value, item.label);
        const hovered = isHovered(ctx, series.id, item.dataIndex);
        const hoverFill = hovered ? (resolveColorAccessor(props.hoverColor, context) as string | undefined) : undefined;
        const fill = hoverFill ?? funnelColor(ctx, series, item, props, data);
        const stroke = hovered
            ? ((resolveColorAccessor(props.hoverBorderColor, context) as string | undefined) ?? (resolveColorAccessor(props.borderColor, context) as string | undefined))
            : (resolveColorAccessor(props.borderColor, context) as string | undefined);
        const opacity = (resolveScalarAccessor(props.opacity, context, 1) as number) ?? 1;

        nodes.push({
            tag: 'path',
            attrs: {
                class: `p-chart-slice p-chart-funnel-slice ${seriesColorClass(item.dataIndex)}${hovered ? ' p-chart-point-hover' : ''}`,
                'data-slot': 'chart-slice',
                'data-series': series.id,
                'data-index': item.dataIndex,
                'data-category': item.label,
                'data-state': hovered ? 'hovered' : null,
                d: polygonPathData(item.polygon),
                fill,
                'fill-opacity': opacity,
                stroke: stroke ?? null,
                'stroke-width': (resolveScalarAccessor(props.borderStrokeWidth, context) as number | undefined) ?? null,
                'stroke-linejoin': props.borderJoinStyle ?? 'round',
                'stroke-dasharray': dashAttr(resolveDashAccessor(props.borderDash, context)),
                opacity: markOpacity(ctx, series.id, item.dataIndex, ctx.progress)
            },
            children: []
        });
    }

    return [slotGroup('chart-series', { class: `p-chart-series p-chart-series-${series.type}`, 'data-series': series.id, 'data-series-type': series.type }, nodes)];
}

/** The slice under a point. */
export function hitTestFunnel(items: readonly FunnelItem[], x: number, y: number): FunnelItem | null {
    return items.find((item) => insideSlice(item, x, y)) ?? null;
}

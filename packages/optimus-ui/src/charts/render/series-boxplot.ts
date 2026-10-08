/**
 * The box plot painter.
 *
 * Each category is a box from the first to the third quartile with a line at the median, whiskers to the last values inside the
 * fences, and the values beyond them as markers. The numbers come from `readBoxStats`, which is also what the axis and the tooltip
 * read, so what is drawn, what is measured and what is said agree.
 */
import type { BoxplotSeriesProps, ItemContext, SvgNode } from '@openng/optimus-ui/types/charts';
import { itemContext, resolveColorAccessor, resolveScalarAccessor } from '../core/accessor';
import { readBoxStats, type BoxStats } from '../core/boxplot';
import { roundedRectPath } from '../core/geometry';
import type { ResolvedSeries } from '../charts-state';
import { isHovered, markOpacity, scaleFor, slotGroup, type DrawContext } from './scene';

/** One box, resolved into pixels. */
export interface BoxMark {
    x: number;
    width: number;
    stats: BoxStats;
    category: string;
    dataIndex: number;
    /** Pixel positions. */
    minY: number;
    maxY: number;
    q1Y: number;
    q3Y: number;
    medianY: number;
    meanY: number | null;
    whiskerLowY: number;
    whiskerHighY: number;
    outlierYs: number[];
}

/** The fields the statistics are read through. */
export function boxFieldsOf(props: BoxplotSeriesProps) {
    return {
        valuesField: props.valuesField,
        minField: props.minField,
        q1Field: props.q1Field,
        medianField: props.medianField,
        q3Field: props.q3Field,
        maxField: props.maxField,
        meanField: props.meanField,
        outliersField: props.outliersField,
        quartileMethod: props.quartileMethod,
        whiskerReach: props.whiskerReach
    };
}

/** The statistics of every datum of a series, by data index. */
export function boxStatsOf(props: BoxplotSeriesProps, datum: unknown): BoxStats | null {
    return readBoxStats(datum, boxFieldsOf(props));
}

/** Projects a box plot series. */
export function projectBoxes(ctx: DrawContext, series: ResolvedSeries, props: BoxplotSeriesProps): BoxMark[] {
    const categoryScale = scaleFor(ctx, 'x', series.xAxisId);
    const valueScale = scaleFor(ctx, 'y', series.yAxisId);

    if (!categoryScale || categoryScale.type !== 'band' || !valueScale || valueScale.type === 'band') return [];

    const data = (props.data as unknown[] | undefined) ?? [];
    const width = Math.max(categoryScale.bandwidth * (props.boxWidthRatio ?? 0.6), 2);
    const boxes: BoxMark[] = [];

    for (const point of series.points) {
        if (!ctx.isItemVisible(series.id, point.dataIndex)) continue;

        const stats = boxStatsOf(props, data[point.dataIndex]);
        const centre = categoryScale.scale(point.category);

        if (!stats || !Number.isFinite(centre)) continue;

        const y = (v: number) => valueScale.scale(v);

        boxes.push({
            x: centre,
            width,
            stats,
            category: point.category,
            dataIndex: point.dataIndex,
            minY: y(stats.min),
            maxY: y(stats.max),
            q1Y: y(stats.q1),
            q3Y: y(stats.q3),
            medianY: y(stats.median),
            meanY: stats.mean === undefined ? null : y(stats.mean),
            whiskerLowY: y(stats.whiskerLow),
            whiskerHighY: y(stats.whiskerHigh),
            outlierYs: stats.outliers.map(y)
        });
    }

    return boxes;
}

/** Paints a box plot series. */
export function paintBoxplotSeries(ctx: DrawContext, series: ResolvedSeries, props: BoxplotSeriesProps): SvgNode[] {
    const boxes = projectBoxes(ctx, series, props);
    const data = (props.data as unknown[] | undefined) ?? [];
    const nodes: SvgNode[] = [];
    const marker = props.markerSize ?? 3;

    for (const box of boxes) {
        const context: ItemContext<unknown> = itemContext(data[box.dataIndex], box.dataIndex, series.seriesIndex, series.id, box.stats.median, box.category);
        const hovered = isHovered(ctx, series.id, box.dataIndex);
        const base = (resolveColorAccessor(props.color, context, ctx.seriesColor(series.seriesIndex)) as string) ?? ctx.seriesColor(series.seriesIndex);
        const color = (hovered ? (resolveColorAccessor(props.hoverColor, context) as string | undefined) : undefined) ?? base;
        const strokeWidth = (resolveScalarAccessor(props.borderStrokeWidth, context, 1.5) as number) ?? 1.5;
        const medianColor = typeof props.medianColor === 'string' ? props.medianColor : color;
        const opacity = markOpacity(ctx, series.id, box.dataIndex, ctx.progress);
        const cap = box.width / 2;
        const top = Math.min(box.q1Y, box.q3Y);
        const height = Math.max(Math.abs(box.q1Y - box.q3Y), 1);
        const line = (slot: string, x1: number, y1: number, x2: number, y2: number, stroke = color, widthPx = strokeWidth): SvgNode => ({
            tag: 'line',
            attrs: { class: `p-chart-box-${slot}`, 'data-slot': `chart-box-${slot}`, 'data-series': series.id, 'data-index': box.dataIndex, x1, y1, x2, y2, stroke, 'stroke-width': widthPx, opacity },
            children: []
        });

        // The whiskers run from the box out to their caps.
        nodes.push(line('whisker', box.x, box.q3Y, box.x, box.whiskerHighY), line('whisker', box.x, box.q1Y, box.x, box.whiskerLowY));
        nodes.push(line('cap', box.x - cap / 2, box.whiskerHighY, box.x + cap / 2, box.whiskerHighY), line('cap', box.x - cap / 2, box.whiskerLowY, box.x + cap / 2, box.whiskerLowY));

        nodes.push({
            tag: 'path',
            attrs: {
                class: `p-chart-box${hovered ? ' p-chart-point-hover' : ''}`,
                'data-slot': 'chart-box',
                'data-series': series.id,
                'data-index': box.dataIndex,
                'data-category': box.category,
                'data-state': hovered ? 'hovered' : null,
                d: roundedRectPath(box.x - box.width / 2, top, box.width, height, (resolveScalarAccessor(props.borderRadius, context, 0) as number) ?? 0),
                fill: color,
                'fill-opacity': props.fillOpacity ?? 0.35,
                stroke: color,
                'stroke-width': strokeWidth,
                opacity
            },
            children: []
        });

        nodes.push(line('median', box.x - box.width / 2, box.medianY, box.x + box.width / 2, box.medianY, medianColor, strokeWidth * 1.6));

        if (props.showMean && box.meanY !== null) {
            const m = marker + 1;

            nodes.push({
                tag: 'path',
                attrs: {
                    class: 'p-chart-box-mean',
                    'data-slot': 'chart-box-mean',
                    'data-series': series.id,
                    'data-index': box.dataIndex,
                    d: `M${box.x - m} ${box.meanY - m}L${box.x + m} ${box.meanY + m}M${box.x - m} ${box.meanY + m}L${box.x + m} ${box.meanY - m}`,
                    fill: 'none',
                    stroke: color,
                    'stroke-width': 1.5,
                    opacity
                },
                children: []
            });
        }

        if (props.showOutliers !== false) {
            for (const y of box.outlierYs) {
                nodes.push({
                    tag: 'circle',
                    attrs: { class: 'p-chart-box-outlier', 'data-slot': 'chart-box-outlier', 'data-series': series.id, 'data-index': box.dataIndex, cx: box.x, cy: y, r: marker, fill: 'none', stroke: color, 'stroke-width': 1.25, opacity },
                    children: []
                });
            }
        }
    }

    return [slotGroup('chart-series', { class: 'p-chart-series p-chart-series-boxplot', 'data-series': series.id, 'data-series-type': 'boxplot' }, nodes)];
}

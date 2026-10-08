/**
 * The sunburst painter.
 *
 * It reads its data as a treemap does -- a flat list that names each node's parent, or an array of nodes -- and draws the same
 * hierarchy as rings: the first generation innermost, each arc as wide as everything under it. A descendant takes the colour of
 * its first ancestor, a little paler for each generation, so a family reads as one.
 */
import type { ItemContext, SunburstSeriesProps, SvgNode, TreemapSeriesProps } from '@openng/optimus-ui/types/charts';
import { itemContext, resolveColorAccessor, resolveScalarAccessor } from '../core/accessor';
import { arcPath, polarToCartesian } from '../core/geometry';
import { centerOf, radiusOf } from '../core/layout';
import { insideArc, layoutSunburst, type SunburstArc } from '../core/sunburst';
import type { ResolvedSeries } from '../charts-state';
import { isHovered, markOpacity, slotGroup, type DrawContext } from './scene';
import { treemapNodes } from './series-treemap';

const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1);

/** Where the sunburst is drawn. */
export function sunburstFrame(ctx: DrawContext, props: SunburstSeriesProps): { cx: number; cy: number; outer: number; inner: number } {
    const center = centerOf(ctx.area);
    const outer = radiusOf(ctx.area) * clamp01(props.outerRadius ?? 1);

    return { cx: center.x, cy: center.y, outer, inner: outer * clamp01(props.innerRadius ?? 0.15) };
}

/** Projects a sunburst series into arcs. Hidden items are left out, and what is left shares the circle. */
export function projectSunburst(ctx: DrawContext, series: ResolvedSeries, props: SunburstSeriesProps): SunburstArc[] {
    const frame = sunburstFrame(ctx, props);
    const nodes = treemapNodes(series, props as unknown as TreemapSeriesProps).filter((node) => ctx.isItemVisible(series.id, node.dataIndex));

    return layoutSunburst(nodes, { startAngle: props.startAngle ?? -90, sweepAngle: (props.sweepAngle ?? 360) * ctx.progress, innerRadius: frame.inner, outerRadius: frame.outer, ringGap: props.ringGap, maxDepth: props.maxDepth });
}

/** The arc under a point; the deepest one wins, which is the one on top. */
export function hitTestSunburst(arcs: readonly SunburstArc[], cx: number, cy: number, x: number, y: number): SunburstArc | null {
    let best: SunburstArc | null = null;

    for (const arc of arcs) if (insideArc(arc, cx, cy, x, y) && (!best || arc.depth >= best.depth)) best = arc;

    return best;
}

/** Paints a sunburst. */
export function paintSunburstSeries(ctx: DrawContext, series: ResolvedSeries, props: SunburstSeriesProps): SvgNode[] {
    const frame = sunburstFrame(ctx, props);
    const arcs = projectSunburst(ctx, series, props);
    const nodes: SvgNode[] = [];
    const labels: SvgNode[] = [];
    const spacing = props.spacing ?? 1;

    for (const arc of arcs) {
        const node = arc.node;
        const context: ItemContext<unknown> = itemContext(node.datum, node.dataIndex, series.seriesIndex, series.id, node.value, node.label);
        const hovered = isHovered(ctx, series.id, node.dataIndex);
        const explicit = resolveColorAccessor(props.color, context);
        const hoverFill = hovered ? (resolveColorAccessor(props.hoverColor, context) as string | undefined) : undefined;
        const fill = hoverFill ?? (typeof explicit === 'string' ? explicit : ctx.seriesColor(arc.groupIndex));
        // Paler for each generation: an opacity, because a palette colour under SVG is a `var()` that cannot be mixed.
        const base = (resolveScalarAccessor(props.opacity, context, 1) as number) ?? 1;
        const shade = typeof explicit === 'string' || hoverFill ? 1 : Math.max(1 - arc.depth * 0.18, 0.4);
        const stroke = (resolveColorAccessor(props.borderColor, context) as string | undefined) ?? null;

        nodes.push({
            tag: 'path',
            attrs: {
                class: `p-chart-sunburst-arc${hovered ? ' p-chart-point-hover' : ''}`,
                'data-slot': 'chart-sunburst-arc',
                'data-series': series.id,
                'data-index': node.dataIndex,
                'data-depth': arc.depth,
                'data-category': node.label,
                'data-state': hovered ? 'hovered' : null,
                d: arcPath(frame.cx, frame.cy, arc.innerRadius, arc.outerRadius, arc.startAngle, arc.endAngle, 0, spacing),
                fill,
                'fill-opacity': base * shade,
                stroke,
                'stroke-width': (resolveScalarAccessor(props.borderStrokeWidth, context) as number | undefined) ?? null,
                opacity: markOpacity(ctx, series.id, node.dataIndex)
            },
            children: []
        });

        if (props.showLabels === false) continue;

        // A name is written only where it fits: along the arc when the arc is long enough, across the ring when the ring is.
        const size = Math.max(ctx.fontSize - 2, 9);
        const textLength = node.label.length * size * 0.58;
        const mid = (arc.startAngle + arc.endAngle) / 2;
        const midRadius = (arc.innerRadius + arc.outerRadius) / 2;
        const arcLength = ((arc.endAngle - arc.startAngle) * Math.PI * midRadius) / 180;
        const thickness = arc.outerRadius - arc.innerRadius;
        const tangent = arcLength >= textLength + 6 && thickness >= size + 4;
        const radial = !tangent && thickness >= textLength + 6 && arcLength >= size + 4;

        if (!tangent && !radial) continue;

        const point = polarToCartesian(frame.cx, frame.cy, midRadius, mid);
        // Text is turned so that it is never upside down: past the middle of the lower half it flips.
        const turn = tangent ? mid + 90 : mid;
        const normal = ((turn % 360) + 360) % 360;
        const rotation = normal > 90 && normal < 270 ? turn + 180 : turn;
        // The arcs are the soft colours of the palette, paler still with depth: a dark name reads on all of them, in a dark theme too.
        const labelColor = (resolveColorAccessor(props.labelColor, context) as string | undefined) ?? '#0f172a';

        labels.push({
            tag: 'text',
            attrs: {
                class: 'p-chart-sunburst-label',
                'data-slot': 'chart-sunburst-label',
                x: point.x,
                y: point.y,
                transform: `rotate(${rotation} ${point.x} ${point.y})`,
                fill: labelColor,
                'font-size': size,
                'font-family': ctx.fontFamily,
                'font-weight': 600,
                'text-anchor': 'middle',
                'dominant-baseline': 'central',
                'pointer-events': 'none'
            },
            children: [node.label]
        });
    }

    return [slotGroup('chart-series', { class: 'p-chart-series p-chart-series-sunburst', 'data-series': series.id, 'data-series-type': 'sunburst' }, [...nodes, ...labels])];
}

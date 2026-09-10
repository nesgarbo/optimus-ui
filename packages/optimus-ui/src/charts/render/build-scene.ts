/**
 * Composes the scene from the registered parts.
 *
 * This is the single place that decides what a chart is made of and in what order it stacks. Both
 * roots call it, so there is exactly one answer to "what does this chart look like" and the
 * renderers only differ in how they put it on screen.
 */
import type {
    AxisPosition,
    AxisType,
    BarSeriesProps,
    BaseAxisProps,
    CandlestickSeriesProps,
    ChartDataLabelsProps,
    ChartHoverProps,
    ChartReferenceBandProps,
    ChartRangeProps,
    ChartReferenceLineProps,
    ChartTooltipProps,
    ColorValue,
    CrosshairConfig,
    HeatmapSeriesProps,
    LineSeriesProps,
    PieSeriesProps,
    PolarSeriesProps,
    RadarSeriesProps,
    ScatterSeriesProps,
    SvgNode,
    TreemapSeriesProps
} from '@openng/optimus-ui/types/charts';
import { isGradient, isLinearGradient } from '../core/color';
import type { ChartContext } from '../charts-registry';
import type { ResolvedSeries } from '../charts-state';
import { isCartesian, isRadial } from '../charts-state';
import { axisOfPosition, defaultPosition, paintAxis, paintGrid, resolveAxis, type AxisRender } from './axis';
import { paintAxisGroups } from './axis-groups';
import { bandSlotFor, groupedBars, paintBarSeries, shouldGroup } from './series-bar';
import { paintLineSeries } from './series-line';
import { paintPieSeries, pieFrame, type PieFrame } from './series-pie';
import { paintPolarSeries, paintRadarSeries, paintRadialGrid, radialFrame, resolveRadialAxis } from './series-radial';
import { paintScatterSeries } from './series-scatter';
import { paintCandlestickSeries } from './series-candlestick';
import { paintHeatmapSeries, resolveHeatmapScale } from './series-heatmap';
import { paintTreemapSeries } from './series-treemap';
import { paintDataLabels } from './data-labels';
import { paintRangeBand } from './range-band';
import { collectLabels, type LabelSource } from './label-targets';
import { paintReferenceBand, paintReferenceLine } from './references';
import { createScene, plotClip, plotClipRef, type DrawContext, type SceneLayer } from './scene';

/** What a built scene carries back to the root. */
export interface BuiltScene {
    /**
     * The layers, in draw order.
     */
    layers: SceneLayer[];
    /**
     * Definitions the layers reference: the plot clip and any gradients.
     */
    defs: SvgNode[];
    /**
     * Each axis' resolved geometry, so the root can reserve the space they asked for.
     */
    axisRenders: Map<string, AxisRender>;
}

/** Builds the draw context a painter reads. */
export function buildDrawContext(context: ChartContext, chartId: string, measureText: DrawContext['measureText'], seriesColor: DrawContext['seriesColor']): DrawContext {
    const hoverFeature = context.feature<ChartHoverProps>('hover')();
    const hoverProps = hoverFeature?.props();

    return {
        area: context.chartArea(),
        scales: context.scales(),
        theme: context.theme(),
        isDark: context.isDark(),
        fontFamily: context.fontFamily(),
        fontSize: context.fontSize(),
        direction: context.direction(),
        locale: context.locale(),
        progress: context.progress(),
        hover: context.hover(),
        // With no ChartHover present there is no hover treatment at all, which is what makes hover
        // an opt-in part rather than a behaviour every chart pays for.
        hoverEffect: hoverProps
            ? {
                  brightness: hoverProps.brightness ?? 1.1,
                  dimOpacity: hoverProps.dimOpacity ?? 1,
                  offset: hoverProps.offset ?? 0,
                  scale: hoverProps.scale ?? 1,
                  radiusMultiplier: hoverProps.radiusMultiplier ?? 1.3,
                  backgroundColor: hoverProps.backgroundColor
              }
            : null,
        isItemVisible: (datasetId, index) => context.isItemVisible(datasetId, index),
        chartId,
        measureText,
        seriesColor
    };
}

/** Builds the whole scene. */
export function buildScene(context: ChartContext, series: readonly ResolvedSeries[], drawContext: DrawContext): BuiltScene {
    const scene = createScene();
    const defs: SvgNode[] = [plotClip(drawContext)];
    const axisRenders = new Map<string, AxisRender>();
    /*
     * What each series was drawn with, kept so the data labels can be placed against the same
     * geometry rather than a second guess at it. Collected only when a ChartDataLabels is present,
     * so a chart without labels pays nothing for them.
     */
    const labelsFeature = context.feature<ChartDataLabelsProps>('dataLabels')();
    const labelSources: LabelSource[] = [];

    if (drawContext.area.width <= 0 || drawContext.area.height <= 0) {
        return { layers: [], defs, axisRenders };
    }

    /* --- Axes and grid ------------------------------------------------------------------------ */

    // A chart whose only series are radial has no cartesian axes to draw. Skipping them here rather
    // than letting them render empty is what stops a pie chart growing a stray x axis when someone
    // leaves a <p-chart-x-axis /> in the template.
    const cartesian = series.some((entry) => entry.visible && isCartesian(entry.type));

    for (const registration of cartesian ? context.axes() : []) {
        const props = registration.props() as BaseAxisProps & { position?: AxisPosition };
        const scale = drawContext.scales.get(`${registration.axis}:${registration.id}`);

        if (!scale) continue;

        const position = props.position ?? defaultPosition(registration.axis);
        // The scale already embodies whatever the state resolved the role to be, so it is the
        // authority here rather than the prop -- which may legitimately be unset.
        const type = (props.type as AxisType | undefined) ?? (scale.type === 'band' ? 'category' : scale.type);
        const render = resolveAxis(drawContext, scale, props, position, type);

        axisRenders.set(`${registration.axis}:${registration.id}`, render);

        // The grid belongs to the axis that generated it but draws under the marks, so the two are
        // painted into different layers from one resolution pass.
        scene.add('grid', ...paintGrid(drawContext, render, props, position, registration.id, type));
        scene.add('axes', ...paintAxis(drawContext, render, props, position, registration.id));
        // The group rows sit outside the tick row, so they need to know how far out that already
        // reaches -- which is exactly what the axis reserved for itself.
        scene.add('axes', ...paintAxisGroups(drawContext, scale, (props as { axisGroups?: { props: Record<string, unknown>; depth: number }[] }).axisGroups, position, render.reservation));
    }

    /* --- References --------------------------------------------------------------------------- */

    /*
     * Several of each can coexist, so they are read off the whole feature list rather than looked
     * up by name. The placement decides the layer: a band is context the data sits over, a line is
     * a threshold the data is read against, and the defaults differ accordingly.
     */
    for (const registration of context.features()) {
        if (registration.type.startsWith('referenceBand')) {
            const props = registration.props() as ChartReferenceBandProps;

            scene.add(props.placement === 'afterData' ? 'bandsAbove' : 'bandsBelow', ...paintReferenceBand(drawContext, props));
            continue;
        }

        if (!registration.type.startsWith('referenceLine')) continue;

        const props = registration.props() as ChartReferenceLineProps;

        scene.add(props.placement === 'beforeData' ? 'bandsBelow' : 'references', ...paintReferenceLine(drawContext, props));
    }

    /* --- Range bands ------------------------------------------------------------------------- */

    /*
     * Painted before the lines rather than after, so the band sits under the edges that bound it.
     * A fill drawn over its own outline would soften the very lines the reader is comparing.
     */
    for (const registration of context.features()) {
        if (!registration.type.startsWith('range:')) continue;

        const props = registration.props() as ChartRangeProps;
        const id = registration.type.slice('range:'.length);
        const pair = series.filter((entry) => entry.visible && entry.registration.rangeId === id);

        // Fewer than two edges is not a band, and more than two is ambiguous about which pair to
        // fill, so the documented answer is the first two.
        if (pair.length < 2) continue;

        scene.add('marks', ...paintRangeBand(drawContext, [pair[0], pair[1]], props));
    }

    /* --- Marks -------------------------------------------------------------------------------- */

    const grouped = shouldGroup(series);
    const groupMembers = grouped ? groupedBars(series) : [];
    const rings = radialRings(series);
    const frame = pieFrame(drawContext);
    const spoked = series.filter((entry) => entry.visible && (entry.type === 'radar' || entry.type === 'polar'));
    const polarMembers = spoked.filter((entry) => entry.type === 'polar' && entry.registration.stackId == null);

    // Radar and polar share one radial value axis and one concentric grid, taken from ChartYAxis:
    // the rings are the axis, so several series drawn on them must be measured against the same
    // scale or their shapes cannot be compared.
    if (spoked.length > 0) {
        const yAxis = context.axes().find((axis) => axis.axis === 'y');
        const axisProps = (yAxis?.props() ?? {}) as BaseAxisProps & { gridShape?: 'polygon' | 'circle' };
        const radialAxis = resolveRadialAxis(spoked, axisProps);
        // Inset for the spoke labels, which sit outside the outer ring where there is no axis edge
        // to reserve against.
        const spokeFrame = radialFrame(drawContext, radialAxis.categories);

        scene.add('grid', ...paintRadialGrid(drawContext, radialAxis, axisProps, spokeFrame, spoked.some((entry) => entry.type === 'radar') ? 'polygon' : 'circle'));

        for (const entry of spoked) {
            if (entry.type === 'radar') {
                scene.add('marks', ...paintRadarSeries(drawContext, entry, entry.registration.props() as RadarSeriesProps, radialAxis, spokeFrame));

                if (labelsFeature) labelSources.push({ kind: 'radar', series: entry, axis: radialAxis, frame: spokeFrame });

                continue;
            }

            const position = polarMembers.indexOf(entry);
            const sectorIndex = position < 0 ? 0 : position;

            scene.add('marks', ...paintPolarSeries(drawContext, entry, entry.registration.props() as PolarSeriesProps, radialAxis, spokeFrame, polarMembers.length || 1, sectorIndex));

            if (labelsFeature) labelSources.push({ kind: 'polar', series: entry, axis: radialAxis, frame: spokeFrame, sectorCount: polarMembers.length || 1, sectorIndex });
        }
    }

    for (const entry of series) {
        if (!entry.visible || entry.points.length === 0) continue;

        switch (entry.type) {
            case 'line':
                scene.add('marks', ...paintLineSeries(drawContext, entry, entry.registration.props() as LineSeriesProps));

                if (labelsFeature) labelSources.push({ kind: 'line', series: entry });

                break;
            case 'bar': {
                const props = entry.registration.props() as BarSeriesProps;
                const horizontal = props.categoryYField != null;
                const categoryScale = drawContext.scales.get(`${horizontal ? 'y' : 'x'}:${horizontal ? entry.yAxisId : entry.xAxisId}`);
                const bandwidth = categoryScale?.type === 'band' ? categoryScale.bandwidth : 0;
                const position = groupMembers.indexOf(entry);
                const slot = bandSlotFor(bandwidth, groupMembers.length || 1, position < 0 ? 0 : position, props, grouped && position >= 0);

                scene.add('marks', ...paintBarSeries(drawContext, entry, props, slot, horizontal));

                // A stacked segment has a neighbour immediately past its end, so its label goes
                // inside rather than beside it -- which is why the stack id has to reach the
                // collector.
                if (labelsFeature) labelSources.push({ kind: 'bar', series: entry, slot, horizontal, stacked: entry.registration.stackId != null });

                break;
            }
            case 'scatter':
                scene.add('marks', ...paintScatterSeries(drawContext, entry, entry.registration.props() as ScatterSeriesProps));

                if (labelsFeature) labelSources.push({ kind: 'scatter', series: entry });

                break;
            case 'candlestick':
                scene.add('marks', ...paintCandlestickSeries(drawContext, entry, entry.registration.props() as CandlestickSeriesProps));

                if (labelsFeature) labelSources.push({ kind: 'candlestick', series: entry });

                break;
            case 'heatmap': {
                const props = entry.registration.props() as HeatmapSeriesProps;

                scene.add('marks', ...paintHeatmapSeries(drawContext, entry, props, resolveHeatmapScale(entry, props)));

                if (labelsFeature) labelSources.push({ kind: 'heatmap', series: entry });

                break;
            }
            case 'treemap':
                scene.add('marks', ...paintTreemapSeries(drawContext, entry, entry.registration.props() as TreemapSeriesProps));

                if (labelsFeature) labelSources.push({ kind: 'treemap', series: entry });

                break;
            case 'radar':
            case 'polar':
                // Already drawn above, against the shared radial axis.
                break;
            case 'pie':
            case 'donut':
            case 'pie3d': {
                const props = entry.registration.props() as PieSeriesProps;
                const ringFrame = ringFrameFor(frame, entry, rings, props);

                scene.add('marks', ...paintPieSeries(drawContext, entry, props, ringFrame));

                if (labelsFeature) labelSources.push({ kind: 'pie', series: entry, frame: ringFrame });

                break;
            }
            default:
                // The remaining families land here as they are implemented. Skipping an unknown
                // type keeps a chart with one unsupported series rendering the rest of itself.
                break;
        }

        const gradient = gradientDefFor(entry);

        if (gradient) defs.push(gradient);
    }

    /* --- Data labels ------------------------------------------------------------------------- */

    // One pass over every label in the chart, because collision resolution cannot work on a
    // per-series view of them.
    if (labelsFeature) {
        const props = labelsFeature.props();

        scene.add('dataLabels', ...paintDataLabels(drawContext, props, collectLabels(drawContext, props, labelSources)));
    }

    /* --- Crosshair ---------------------------------------------------------------------------- */

    const tooltip = context.feature<ChartTooltipProps>('tooltip')()?.props();

    if (tooltip?.crosshair && drawContext.hover) {
        scene.add('crosshair', ...paintCrosshair(drawContext, tooltip.crosshair));
    }

    return { layers: scene.toLayers(), defs, axisRenders };
}

/**
 * Paints the crosshair at the hovered position.
 *
 * It is drawn from the hover's own pixel coordinates rather than re-derived from the scales,
 * because the hover already resolved which mark it snapped to -- recomputing would risk the line
 * and the tooltip disagreeing by a pixel.
 */
function paintCrosshair(ctx: DrawContext, config: true | CrosshairConfig): SvgNode[] {
    const hover = ctx.hover as { x?: number; y?: number } | null;

    if (!hover) return [];

    const options: CrosshairConfig = config === true ? {} : config;
    const color = options.color ?? ctx.theme.crosshairColor ?? 'currentColor';
    const width = options.width ?? 1;
    const dash = (options.dashArray ?? [4, 4]).join(' ');
    const nodes: SvgNode[] = [];

    if ((options.x ?? true) && Number.isFinite(hover.x)) {
        nodes.push({
            tag: 'line',
            attrs: { class: 'p-chart-crosshair', 'data-slot': 'chart-crosshair', 'data-axis': 'x', x1: hover.x!, y1: ctx.area.y, x2: hover.x!, y2: ctx.area.y + ctx.area.height, stroke: color, 'stroke-width': width, 'stroke-dasharray': dash },
            children: []
        });
    }

    if ((options.y ?? true) && Number.isFinite(hover.y)) {
        nodes.push({
            tag: 'line',
            attrs: { class: 'p-chart-crosshair', 'data-slot': 'chart-crosshair', 'data-axis': 'y', x1: ctx.area.x, y1: hover.y!, x2: ctx.area.x + ctx.area.width, y2: hover.y!, stroke: color, 'stroke-width': width, 'stroke-dasharray': dash },
            children: []
        });
    }

    return nodes;
}

/** Builds the gradient definition a series' colour needs, when it is a gradient rather than a colour. */
function gradientDefFor(series: ResolvedSeries): SvgNode | null {
    const props = series.registration.props() as { color?: ColorValue };
    const color = props.color;

    if (!isGradient(color)) return null;

    const id = `line-area-${series.id}-grad`;
    const stops = color.stops.map((stop) => ({ tag: 'stop', attrs: { offset: stop.offset, 'stop-color': stop.color, 'stop-opacity': stop.opacity ?? null }, children: [] }) satisfies SvgNode);

    if (isLinearGradient(color)) {
        const axis = color.linearGradient;
        // The `direction` shorthand is the common case written the short way, so it resolves to the
        // same four numbers rather than being a second code path through the painter.
        const { x1, y1, x2, y2 } = 'direction' in axis ? (axis.direction === 'horizontal' ? { x1: 0, y1: 0, x2: 1, y2: 0 } : { x1: 0, y1: 0, x2: 0, y2: 1 }) : axis;

        return { tag: 'linearGradient', attrs: { id, x1, y1, x2, y2 }, children: stops };
    }

    const { cx = 0.5, cy = 0.5, r = 0.5 } = color.radialGradient;

    return { tag: 'radialGradient', attrs: { id, cx, cy, r }, children: stops };
}

/**
 * The radial series that share a centre as concentric rings.
 *
 * Stacked pies are rings rather than overlapping discs, so each one needs its own slice of the
 * radius. Only the stacked ones are collected: several unstacked pies in one chart legitimately
 * overlap, and re-arranging them into rings would be inventing a layout the author did not ask for.
 */
function radialRings(series: readonly ResolvedSeries[]): ResolvedSeries[] {
    return series.filter((entry) => entry.visible && (entry.type === 'pie' || entry.type === 'donut' || entry.type === 'pie3d') && entry.registration.stackId != null);
}

/**
 * Narrows the full circle down to one ring's band.
 *
 * The series' own `innerRadius` and `outerRadius` are ratios of whatever band it is given, so a
 * donut inside a stack keeps its hole proportionally rather than punching through the ring inside
 * it.
 */
function ringFrameFor(frame: PieFrame, entry: ResolvedSeries, rings: readonly ResolvedSeries[], props: PieSeriesProps): PieFrame {
    const index = rings.indexOf(entry);

    if (index < 0 || rings.length <= 1) return frame;

    const band = frame.radius / rings.length;
    // Order 0 is the innermost ring, matching the documented stacking order.
    const outer = band * (index + 1);

    return { center: frame.center, radius: outer };
}

/** The layers whose contents are clipped to the plot area. */
const CLIPPED_LAYERS = new Set(['marks', 'bandsBelow', 'bandsAbove', 'references', 'annotations']);

/** Whether a layer's group carries the plot clip. */
export function isClipped(layer: string): boolean {
    return CLIPPED_LAYERS.has(layer);
}

/** The clip reference a clipped layer uses. */
export function clipRefFor(drawContext: DrawContext): string {
    return plotClipRef(drawContext);
}

/** Whether any registered series can be placed against cartesian axes. */
export function hasCartesianSeries(series: readonly ResolvedSeries[]): boolean {
    return series.some((entry) => isCartesian(entry.type));
}

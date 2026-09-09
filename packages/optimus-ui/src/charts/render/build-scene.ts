/**
 * Composes the scene from the registered parts.
 *
 * This is the single place that decides what a chart is made of and in what order it stacks. Both
 * roots call it, so there is exactly one answer to "what does this chart look like" and the
 * renderers only differ in how they put it on screen.
 */
import type { AxisPosition, AxisType, BarSeriesProps, BaseAxisProps, ChartHoverProps, ColorValue, LineSeriesProps, SvgNode } from '@openng/optimus-ui/types/charts';
import { isGradient, isLinearGradient } from '../core/color';
import type { ChartContext } from '../charts-registry';
import type { ResolvedSeries } from '../charts-state';
import { isCartesian } from '../charts-state';
import { axisOfPosition, defaultPosition, paintAxis, paintGrid, resolveAxis, type AxisRender } from './axis';
import { bandSlotFor, groupedBars, paintBarSeries, shouldGroup } from './series-bar';
import { paintLineSeries } from './series-line';
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
export function buildDrawContext(context: ChartContext, chartId: string, measureText: DrawContext['measureText']): DrawContext {
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
        measureText
    };
}

/** Builds the whole scene. */
export function buildScene(context: ChartContext, series: readonly ResolvedSeries[], drawContext: DrawContext): BuiltScene {
    const scene = createScene();
    const defs: SvgNode[] = [plotClip(drawContext)];
    const axisRenders = new Map<string, AxisRender>();

    if (drawContext.area.width <= 0 || drawContext.area.height <= 0) {
        return { layers: [], defs, axisRenders };
    }

    /* --- Axes and grid ------------------------------------------------------------------------ */

    for (const registration of context.axes()) {
        const props = registration.props() as BaseAxisProps & { position?: AxisPosition };
        const scale = drawContext.scales.get(`${registration.axis}:${registration.id}`);

        if (!scale) continue;

        const position = props.position ?? defaultPosition(registration.axis);
        const type = (props.type as AxisType | undefined) ?? (scale.type === 'band' ? 'category' : scale.type);
        const render = resolveAxis(drawContext, scale, props, position, type);

        axisRenders.set(`${registration.axis}:${registration.id}`, render);

        // The grid belongs to the axis that generated it but draws under the marks, so the two are
        // painted into different layers from one resolution pass.
        scene.add('grid', ...paintGrid(drawContext, render, props, position, registration.id));
        scene.add('axes', ...paintAxis(drawContext, render, props, position, registration.id));
    }

    /* --- Marks -------------------------------------------------------------------------------- */

    const grouped = shouldGroup(series);
    const groupMembers = grouped ? groupedBars(series) : [];

    for (const entry of series) {
        if (!entry.visible || entry.points.length === 0) continue;

        switch (entry.type) {
            case 'line':
                scene.add('marks', ...paintLineSeries(drawContext, entry, entry.registration.props() as LineSeriesProps));
                break;
            case 'bar': {
                const props = entry.registration.props() as BarSeriesProps;
                const horizontal = props.categoryYField != null;
                const categoryScale = drawContext.scales.get(`${horizontal ? 'y' : 'x'}:${horizontal ? entry.yAxisId : entry.xAxisId}`);
                const bandwidth = categoryScale?.type === 'band' ? categoryScale.bandwidth : 0;
                const position = groupMembers.indexOf(entry);
                const slot = bandSlotFor(bandwidth, groupMembers.length || 1, position < 0 ? 0 : position, props, grouped && position >= 0);

                scene.add('marks', ...paintBarSeries(drawContext, entry, props, slot, horizontal));
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

    return { layers: scene.toLayers(), defs, axisRenders };
}

/** Builds the gradient definition a series' colour needs, when it is a gradient rather than a colour. */
function gradientDefFor(series: ResolvedSeries): SvgNode | null {
    const props = series.registration.props() as { color?: ColorValue };
    const color = props.color;

    if (!isGradient(color)) return null;

    const id = `line-area-${series.id}-grad`;
    const stops = color.stops.map((stop) => ({ tag: 'stop', attrs: { offset: stop.offset, 'stop-color': stop.color }, children: [] }) satisfies SvgNode);

    if (isLinearGradient(color)) {
        const { x1, y1, x2, y2 } = color.linearGradient;

        return { tag: 'linearGradient', attrs: { id, x1, y1, x2, y2 }, children: stops };
    }

    const { cx, cy, r } = color.radialGradient;

    return { tag: 'radialGradient', attrs: { id, cx, cy, r }, children: stops };
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

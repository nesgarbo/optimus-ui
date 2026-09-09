/**
 * Hit-testing: working out what the pointer is over.
 *
 * This runs against the resolved geometry rather than against the DOM, for two reasons. Canvas has
 * no elements to hit at all, so it is the only option there. And even under SVG the nearest mark is
 * often not the one under the cursor: a line chart wants the nearest point along the x axis so the
 * tooltip follows the series between vertices, which no `elementFromPoint` can tell you.
 *
 * Both roots share this, so hover behaves identically in the two renderers.
 */
import type { HoverState, PieSeriesProps } from '@openng/optimus-ui/types/charts';
import { isRadial, type ResolvedSeries } from '../charts-state';
import type { ChartContext } from '../charts-registry';
import { containsPoint } from '../core/layout';
import type { DrawContext } from './scene';
import { scaleFor } from './scene';
import { hitTestSlices, pieFrame, projectSlices } from './series-pie';

/** A hit, with the pixel position of the mark that was hit. */
export type ChartHit = HoverState;

/**
 * Finds what the pointer is over, or `null`.
 *
 * The pointer has to be inside the plot area for a cartesian chart. A radial chart is tested
 * against its slices instead, since its marks are not bounded by the axes.
 */
export function hitTest(context: ChartContext, series: readonly ResolvedSeries[], drawContext: DrawContext, x: number, y: number): ChartHit | null {
    const radial = series.filter((entry) => entry.visible && isRadial(entry.type));

    if (radial.length > 0) {
        const hit = hitTestRadial(radial, drawContext, x, y);

        if (hit) return hit;
    }

    if (!containsPoint(drawContext.area, x, y)) return null;

    return hitTestCartesian(context, series, drawContext, x, y);
}

/**
 * Finds the nearest cartesian mark.
 *
 * Distance is measured along x alone, which is what makes a tooltip snap to the category the cursor
 * is over rather than to whichever series happens to pass closest to the cursor's height. That is
 * the documented default for line, area and bar; scatter overrides it because a scatter plot has no
 * category to snap to.
 */
function hitTestCartesian(context: ChartContext, series: readonly ResolvedSeries[], drawContext: DrawContext, x: number, y: number): ChartHit | null {
    let best: ChartHit | null = null;
    let bestDistance = Infinity;

    for (const entry of series) {
        if (!entry.visible || isRadial(entry.type)) continue;

        const xScale = scaleFor(drawContext, 'x', entry.xAxisId);
        const yScale = scaleFor(drawContext, 'y', entry.yAxisId);

        if (!xScale) continue;

        const euclidean = entry.type === 'scatter';

        for (const point of entry.points) {
            if (point.value == null || !context.isItemVisible(entry.id, point.dataIndex)) continue;

            const px = xScale.scale(point.category);

            if (!Number.isFinite(px)) continue;

            const py = yScale && yScale.type !== 'band' ? yScale.scale(point.value) : Number.NaN;
            const distance = euclidean && Number.isFinite(py) ? Math.hypot(px - x, py - y) : Math.abs(px - x);

            if (distance >= bestDistance) continue;

            bestDistance = distance;
            best = { datasetId: entry.id, index: point.dataIndex, x: px, y: Number.isFinite(py) ? py : y };
        }
    }

    return best;
}

/** Finds the slice under the pointer, testing the topmost ring first. */
function hitTestRadial(series: readonly ResolvedSeries[], drawContext: DrawContext, x: number, y: number): ChartHit | null {
    const frame = pieFrame(drawContext);

    // Reversed so the last-drawn series wins, matching what the reader sees where rings overlap.
    for (const entry of [...series].reverse()) {
        const slices = projectSlices(drawContext, entry, entry.registration.props() as PieSeriesProps, frame);
        const slice = hitTestSlices(slices, frame, x, y);

        if (slice) return { datasetId: entry.id, index: slice.dataIndex, x, y };
    }

    return null;
}

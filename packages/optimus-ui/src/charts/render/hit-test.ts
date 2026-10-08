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
import type { BarSeriesProps, BoxplotSeriesProps, SunburstSeriesProps, SankeySeriesProps, CandlestickSeriesProps, FunnelSeriesProps, HeatmapSeriesProps, HoverState, PieSeriesProps, TreemapSeriesProps } from '@openng/optimus-ui/types/charts';
import { isRadial, type ResolvedSeries } from '../charts-state';
import type { ChartContext } from '../charts-registry';
import { containsPoint } from '../core/layout';
import type { DrawContext } from './scene';
import { scaleFor } from './scene';
import { bandSlotFor, groupedBars, projectBars, shouldGroup } from './series-bar';
import { projectCandles } from './series-candlestick';
import { hitTestHeatmap, projectHeatmap, resolveHeatmapScale } from './series-heatmap';
import { hitTestSlices, pieFrame, projectSlices } from './series-pie';
import { projectBoxes } from './series-boxplot';
import { hitTestFunnel, projectFunnel } from './series-funnel';
import { hitTestSankey, projectSankey } from './series-sankey';
import { hitTestSunburst, projectSunburst, sunburstFrame } from './series-sunburst';
import { hitTestTreemap, projectTreemap } from './series-treemap';

/**
 * Projections kept between pointer moves.
 *
 * A pointer move asks the same question of the same geometry over and over, and projecting a series
 * into pixels is the expensive half of answering it. The geometry only changes when the series, its
 * props, the scales, the theme or the item visibility do, so it is keyed on exactly those and
 * recomputed only when one of them is a different object.
 */
const PROJECTIONS = new WeakMap<ResolvedSeries, Map<string, { deps: readonly unknown[]; value: unknown }>>();

/** Returns the memoized value for a series and a kind of projection, recomputing when a dependency changed. */
export function memoProjection<T>(entry: ResolvedSeries, kind: string, deps: readonly unknown[], compute: () => T): T {
    let byKind = PROJECTIONS.get(entry);

    if (!byKind) {
        byKind = new Map();
        PROJECTIONS.set(entry, byKind);
    }

    const cached = byKind.get(kind);

    if (cached && cached.deps.length === deps.length && cached.deps.every((value, i) => value === deps[i])) return cached.value as T;

    const value = compute();

    byKind.set(kind, { deps, value });

    return value;
}

/** What a projection reads from the draw context, other than the hover. */
function geometryDeps(context: ChartContext, drawContext: DrawContext, entry: ResolvedSeries): unknown[] {
    return [entry.registration.props(), drawContext.area, drawContext.scales, drawContext.theme, drawContext.fontFamily, drawContext.fontSize, drawContext.direction, drawContext.locale, drawContext.progress, context.hiddenItems()];
}

/** One placed point of a cartesian series, with where it sits in the series. */
interface PlacedPoint {
    px: number;
    py: number;
    dataIndex: number;
    position: number;
}

/**
 * A series' points placed in pixels and sorted by x.
 *
 * Sorting is what turns "which point is nearest" from a scan of every point into a binary search,
 * so hovering a hundred-thousand-point line costs the same as hovering a hundred-point one.
 */
function placedPoints(drawContext: DrawContext, entry: ResolvedSeries): PlacedPoint[] | null {
    const xScale = scaleFor(drawContext, 'x', entry.xAxisId);
    const yScale = scaleFor(drawContext, 'y', entry.yAxisId);

    if (!xScale) return null;

    return memoProjection(entry, 'placed', [entry, xScale, yScale], () => {
        const placed: PlacedPoint[] = [];

        entry.points.forEach((point, position) => {
            if (point.value == null) return;

            const px = entry.continuousX ? xScale.scale(point.xValue) : xScale.scale(point.category);

            if (!Number.isFinite(px)) return;

            placed.push({ px, py: yScale && yScale.type !== 'band' ? yScale.scale(point.value) : Number.NaN, dataIndex: point.dataIndex, position });
        });

        // A stable sort, so points sharing an x keep the order the series gave them.
        return placed.sort((a, b) => a.px - b.px || a.position - b.position);
    });
}

/** Index of the first placed point whose x is not less than `x`. */
export function lowerBound(placed: readonly { px: number }[], x: number): number {
    let low = 0;
    let high = placed.length;

    while (low < high) {
        const mid = (low + high) >>> 1;

        if (placed[mid].px < x) low = mid + 1;
        else high = mid;
    }

    return low;
}

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
        const hit = hitTestRadial(context, radial, drawContext, x, y);

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
/**
 * One series' answer to "is the pointer on me".
 *
 * `inside` is the important field. A mark the pointer is actually within always wins over one it is
 * merely near, which is what makes a heatmap cell and a bar hover the mark under the cursor rather
 * than the nearest column centre.
 */
interface Candidate {
    hit: ChartHit;
    inside: boolean;
    dx: number;
    dy: number;
}

/** Whether a candidate beats the best so far. */
function better(candidate: Candidate, best: Candidate | null): boolean {
    if (!best) return true;
    if (candidate.inside !== best.inside) return candidate.inside;
    if (candidate.dx !== best.dx) return candidate.dx < best.dx;

    return candidate.dy < best.dy;
}

/**
 * Finds the cartesian mark under the pointer.
 *
 * Distance alone is not enough, and measuring only the x distance -- which is what this used to
 * do -- is wrong in two ways that show up immediately. Every cell in a heatmap column shares an x,
 * so the whole column tied and the first cell always won, whatever row the pointer was on. And in a
 * combo chart the nearest point in x wins even when its series is at the other end of the plot, so
 * the highlight landed on a series the pointer was nowhere near.
 *
 * So each family is asked the question its own geometry answers: a cell, a bar and a treemap
 * rectangle test containment; a scatter point measures a real distance; a line measures x and then
 * breaks the tie on y, which is what keeps a tooltip following one series between its vertices.
 */
function hitTestCartesian(context: ChartContext, series: readonly ResolvedSeries[], drawContext: DrawContext, x: number, y: number): ChartHit | null {
    let best: Candidate | null = null;
    const grouped = shouldGroup(series);
    const groupMembers = grouped ? groupedBars(series) : [];

    for (const entry of series) {
        if (!entry.visible || isRadial(entry.type)) continue;

        const props = entry.registration.props() as Record<string, unknown>;
        let candidate: Candidate | null = null;

        switch (entry.type) {
            case 'heatmap': {
                const heatmapProps = props as unknown as HeatmapSeriesProps;
                const cell = hitTestHeatmap(
                    memoProjection(entry, 'heatmap', geometryDeps(context, drawContext, entry), () => projectHeatmap(drawContext, entry, heatmapProps, resolveHeatmapScale(entry, heatmapProps))),
                    x,
                    y
                );

                if (cell) candidate = { hit: { datasetId: entry.id, index: cell.dataIndex, x: cell.x + cell.width / 2, y: cell.y + cell.height / 2 }, inside: true, dx: 0, dy: 0 };

                break;
            }
            case 'sunburst': {
                const sunburstProps = props as unknown as SunburstSeriesProps;
                const frame = sunburstFrame(drawContext, sunburstProps);
                const arc = hitTestSunburst(
                    memoProjection(entry, 'sunburst', geometryDeps(context, drawContext, entry), () => projectSunburst(drawContext, entry, sunburstProps)),
                    frame.cx,
                    frame.cy,
                    x,
                    y
                );

                if (arc) candidate = { hit: { datasetId: entry.id, index: arc.node.dataIndex, x, y }, inside: true, dx: 0, dy: 0 };

                break;
            }
            case 'sankey': {
                const link = hitTestSankey(
                    drawContext,
                    entry,
                    props as unknown as SankeySeriesProps,
                    x,
                    y,
                    memoProjection(entry, 'sankey', geometryDeps(context, drawContext, entry), () => projectSankey(drawContext, entry, props as unknown as SankeySeriesProps))
                );

                if (link) candidate = { hit: { datasetId: entry.id, index: link.index, x, y }, inside: true, dx: 0, dy: 0 };

                break;
            }
            case 'boxplot': {
                for (const box of memoProjection(entry, 'boxplot', geometryDeps(context, drawContext, entry), () => projectBoxes(drawContext, entry, props as unknown as BoxplotSeriesProps))) {
                    const half = Math.max(box.width / 2, 2);

                    if (Math.abs(box.x - x) > half) continue;

                    const top = box.outlierYs.reduce((low, value) => Math.min(low, value), Math.min(box.whiskerHighY, box.whiskerLowY));
                    const bottom = box.outlierYs.reduce((high, value) => Math.max(high, value), Math.max(box.whiskerHighY, box.whiskerLowY));
                    const inside = y >= top && y <= bottom;

                    candidate = { hit: { datasetId: entry.id, index: box.dataIndex, x: box.x, y: box.medianY }, inside, dx: Math.abs(box.x - x), dy: inside ? 0 : Math.abs(box.medianY - y) };
                    break;
                }

                break;
            }
            case 'funnel':
            case 'pyramid': {
                const item = hitTestFunnel(
                    memoProjection(entry, 'funnel', geometryDeps(context, drawContext, entry), () => projectFunnel(drawContext, entry, props as unknown as FunnelSeriesProps)),
                    x,
                    y
                );

                if (item) candidate = { hit: { datasetId: entry.id, index: item.dataIndex, x: item.cx, y: item.cy }, inside: true, dx: 0, dy: 0 };

                break;
            }
            case 'treemap': {
                const cell = hitTestTreemap(
                    memoProjection(entry, 'treemap', geometryDeps(context, drawContext, entry), () => projectTreemap(drawContext, entry, props as unknown as TreemapSeriesProps)),
                    x,
                    y
                );

                if (cell) candidate = { hit: { datasetId: entry.id, index: cell.node.dataIndex, x: cell.x + cell.width / 2, y: cell.y + cell.height / 2 }, inside: true, dx: 0, dy: 0 };

                break;
            }
            case 'bar': {
                const barProps = props as unknown as BarSeriesProps;
                const horizontal = barProps.categoryYField != null;
                const categoryScale = scaleFor(drawContext, horizontal ? 'y' : 'x', horizontal ? entry.yAxisId : entry.xAxisId);
                const bandwidth = categoryScale?.type === 'band' ? categoryScale.bandwidth : 0;
                const position = groupMembers.indexOf(entry);
                const slot = bandSlotFor(bandwidth, groupMembers.length || 1, position < 0 ? 0 : position, barProps, grouped && position >= 0);

                for (const bar of memoProjection(entry, 'bar', [...geometryDeps(context, drawContext, entry), series, horizontal], () => projectBars(drawContext, entry, barProps, slot, horizontal))) {
                    // A bar's band is the whole column, so a pointer above a short bar still hovers
                    // it: that is what `snap: 'category'` means, and it is why the cross-axis test
                    // is generous while the along-axis one is exact.
                    const withinBand = horizontal ? y >= bar.y && y <= bar.y + bar.height : x >= bar.x && x <= bar.x + bar.width;

                    if (!withinBand) continue;

                    const centre = { x: bar.x + bar.width / 2, y: bar.y + (bar.isNegative ? bar.height : 0) };
                    const inside = x >= bar.x && x <= bar.x + bar.width && y >= bar.y && y <= bar.y + bar.height;
                    const next: Candidate = { hit: { datasetId: entry.id, index: bar.dataIndex, x: centre.x, y: centre.y }, inside, dx: 0, dy: inside ? 0 : Math.abs(centre.y - y) };

                    if (better(next, candidate)) candidate = next;
                }

                break;
            }
            case 'candlestick': {
                for (const candle of memoProjection(entry, 'candles', geometryDeps(context, drawContext, entry), () => projectCandles(drawContext, entry, props as unknown as CandlestickSeriesProps))) {
                    const half = Math.max(candle.width / 2, 2);

                    if (Math.abs(candle.x - x) > half) continue;

                    const inside = y >= Math.min(candle.highY, candle.lowY) && y <= Math.max(candle.highY, candle.lowY);

                    candidate = { hit: { datasetId: entry.id, index: candle.dataIndex, x: candle.x, y: candle.closeY }, inside, dx: Math.abs(candle.x - x), dy: inside ? 0 : Math.abs(candle.closeY - y) };
                    break;
                }

                break;
            }
            default: {
                const placed = placedPoints(drawContext, entry);

                if (!placed || placed.length === 0) break;

                const scatter = entry.type === 'scatter';
                let found: Candidate | null = null;
                let foundPosition = Infinity;
                let left = lowerBound(placed, x) - 1;
                let right = left + 1;

                // Walk outward from the pointer. A side stops once its x distance alone exceeds the
                // best distance found, since no point further out can beat it.
                while (left >= 0 || right < placed.length) {
                    const reach: number = found ? found.dx : Infinity;
                    const leftGap = left >= 0 ? x - placed[left].px : Infinity;
                    const rightGap = right < placed.length ? placed[right].px - x : Infinity;

                    if (leftGap > reach && rightGap > reach) break;

                    const point = leftGap <= rightGap ? placed[left--] : placed[right++];

                    if (!context.isItemVisible(entry.id, point.dataIndex)) continue;

                    const py = point.py;
                    // A scatter point is placed by two numbers, so both count. A line is placed by
                    // one, so x decides and y only breaks a tie between series.
                    const dx = scatter && Number.isFinite(py) ? Math.hypot(point.px - x, py - y) : Math.abs(point.px - x);
                    const dy = Number.isFinite(py) ? Math.abs(py - y) : 0;
                    const next: Candidate = { hit: { datasetId: entry.id, index: point.dataIndex, x: point.px, y: Number.isFinite(py) ? py : y }, inside: false, dx, dy };

                    // On an exact tie the earlier point in the series wins, as it did when every
                    // point was visited in order.
                    if (!found || better(next, found) || (next.dx === found.dx && next.dy === found.dy && point.position < foundPosition)) {
                        found = next;
                        foundPosition = point.position;
                    }
                }

                candidate = found;
            }
        }

        if (candidate && better(candidate, best)) best = candidate;
    }

    return best?.hit ?? null;
}

/** Finds the slice under the pointer, testing the topmost ring first. */
function hitTestRadial(context: ChartContext, series: readonly ResolvedSeries[], drawContext: DrawContext, x: number, y: number): ChartHit | null {
    const frame = pieFrame(drawContext);

    // Reversed so the last-drawn series wins, matching what the reader sees where rings overlap.
    for (const entry of [...series].reverse()) {
        const slices = memoProjection(entry, 'slices', [...geometryDeps(context, drawContext, entry), frame.center.x, frame.center.y, frame.radius], () => projectSlices(drawContext, entry, entry.registration.props() as PieSeriesProps, frame));
        const slice = hitTestSlices(slices, frame, x, y);

        if (slice) return { datasetId: entry.id, index: slice.dataIndex, x, y };
    }

    return null;
}

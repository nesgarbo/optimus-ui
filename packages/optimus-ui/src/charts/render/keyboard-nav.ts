/**
 * Keyboard navigation between data points.
 *
 * A chart drawn into one canvas, or into an SVG whose marks are not focusable, has nothing for the
 * keyboard to land on. So navigation moves the chart's own hover instead: the tooltip, the
 * crosshair and the highlight follow it exactly as they follow a pointer, and a keyboard user gets
 * the same reading a mouse user does.
 *
 * It is a pure function of the series and the key, so it can be tested without a DOM.
 */
import type { HoverState, KeyboardNavigationConfig } from '@openng/optimus-ui/types/charts';
import type { ResolvedSeries } from '../charts-state';
import { scaleFor, type DrawContext } from './scene';

/** What the chart should do after a key. */
export type NavigationResult = { kind: 'focus'; datasetId: string; index: number } | { kind: 'clear' } | { kind: 'none' };

/** The inputs navigation needs besides the key itself. */
export interface NavigationOptions {
    config: KeyboardNavigationConfig | undefined;
    rtl: boolean;
    isItemVisible: (datasetId: string, index: number) => boolean;
    /**
     * The last point focused in each series, kept by the caller between keys.
     */
    remembered?: Map<string, number>;
}

/** A navigable point, flattened with the series it belongs to. */
interface Stop {
    seriesPosition: number;
    datasetId: string;
    index: number;
}

/** The keys this navigation reacts to. */
export const NAVIGATION_KEYS: readonly string[] = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Escape'];

/** Works out where a key moves the focus. */
export function navigate(series: readonly ResolvedSeries[], current: Pick<HoverState, 'datasetId' | 'index'> | null, key: string, options: NavigationOptions): NavigationResult {
    const config = options.config ?? {};

    if (config.enabled === false || !NAVIGATION_KEYS.includes(key)) return { kind: 'none' };
    if (key === 'Escape') return current ? { kind: 'clear' } : { kind: 'none' };

    const navigation = config.seriesNavigation ?? {};
    const skipNull = navigation.skipNullPoints ?? true;
    const threshold = navigation.pointNavigationEnabledThreshold;
    const serialize = navigation.mode === 'serialize';
    const wrap = config.wrapAround === true;
    const lists: Stop[][] = [];

    series.forEach((entry) => {
        if (!entry.visible) return;
        if (threshold != null && entry.points.length > threshold) return;

        const stops: Stop[] = [];

        for (const point of entry.points) {
            if (skipNull && point.value == null) continue;
            if (!options.isItemVisible(entry.id, point.dataIndex)) continue;

            stops.push({ seriesPosition: lists.length, datasetId: entry.id, index: point.dataIndex });
        }

        if (stops.length > 0) lists.push(stops);
    });

    if (lists.length === 0) return { kind: 'none' };

    const focus = (stop: Stop | undefined): NavigationResult => (stop ? { kind: 'focus', datasetId: stop.datasetId, index: stop.index } : { kind: 'none' });
    const at = current ? lists.findIndex((stops) => stops[0].datasetId === current.datasetId) : -1;
    const position = at < 0 ? -1 : lists[at].findIndex((stop) => stop.index === current!.index);

    // Nothing focused yet: any navigation key lands on the first point, and End on the last.
    if (!current || at < 0 || position < 0) {
        if (key === 'End') return focus(serialize ? lists[lists.length - 1].at(-1) : lists[0].at(-1));

        return focus(lists[0][0]);
    }

    const step = (list: readonly Stop[], from: number, delta: number): Stop | undefined => {
        const next = from + delta;

        if (next >= 0 && next < list.length) return list[next];
        if (!wrap) return list[from];

        return list[(next + list.length) % list.length];
    };
    const forward = options.rtl ? 'ArrowLeft' : 'ArrowRight';
    const backward = options.rtl ? 'ArrowRight' : 'ArrowLeft';

    if (key === forward || key === backward) {
        const delta = key === forward ? 1 : -1;

        if (serialize) {
            const flat = lists.flat();
            const flatPosition = flat.findIndex((stop) => stop.datasetId === current.datasetId && stop.index === current.index);

            return focus(step(flat, flatPosition, delta));
        }

        return focus(step(lists[at], position, delta));
    }

    if (key === 'Home' || key === 'End') {
        const list = serialize ? lists.flat() : lists[at];

        return focus(key === 'Home' ? list[0] : list[list.length - 1]);
    }

    // Up and down change series. In serialize mode every point is already in one list, so they have
    // nowhere further to go.
    if (serialize) return { kind: 'none' };

    const target = (at + (key === 'ArrowDown' ? 1 : -1) + lists.length) % lists.length;

    if (target === at || (!wrap && ((key === 'ArrowDown' && at === lists.length - 1) || (key === 'ArrowUp' && at === 0)))) return focus(lists[at][position]);

    options.remembered?.set(current.datasetId, current.index);

    const list = lists[target];
    const remembered = navigation.rememberPointFocus ? options.remembered?.get(list[0].datasetId) : undefined;
    const rememberedStop = remembered == null ? undefined : list.find((stop) => stop.index === remembered);

    return focus(rememberedStop ?? list[Math.min(position, list.length - 1)]);
}

/**
 * Where a focused point sits, so the crosshair and the tooltip can be placed on it.
 *
 * A pointer supplies this for free; a key does not, so it is read off the scales the way the
 * hit-test does. A series with no cartesian position (a pie slice) falls back to the middle of the
 * plot, which still lands the tooltip inside the chart.
 */
export function pointPosition(drawContext: Pick<DrawContext, 'scales' | 'area'>, entry: ResolvedSeries, dataIndex: number): { x: number; y: number } {
    const point = entry.points.find((candidate) => candidate.dataIndex === dataIndex);
    const centre = { x: drawContext.area.x + drawContext.area.width / 2, y: drawContext.area.y + drawContext.area.height / 2 };

    if (!point) return centre;

    const xScale = scaleFor(drawContext as DrawContext, 'x', entry.xAxisId);
    const yScale = scaleFor(drawContext as DrawContext, 'y', entry.yAxisId);
    const x = xScale ? xScale.scale(entry.continuousX ? point.xValue : point.category) : Number.NaN;
    const y = yScale && yScale.type !== 'band' && point.value != null ? yScale.scale(point.value) : Number.NaN;

    return { x: Number.isFinite(x) ? x : centre.x, y: Number.isFinite(y) ? y : centre.y };
}

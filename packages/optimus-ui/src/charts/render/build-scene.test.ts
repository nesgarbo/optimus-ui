import { computed, signal } from '@angular/core';
import { describe, expect, it } from 'vitest';
import type { AxisScale, BaseAxisProps, ChartTheme, SvgNode } from '@openng/optimus-ui/types/charts';
import type { ChartContext, SeriesRegistration } from '../charts-registry';
import type { ResolvedSeries } from '../charts-state';
import { bandScale, linearScale } from '../core/scale';
import { defaultLightTheme, LIGHT_SERIES_PALETTE, seriesColorAt } from '../core/palette';
import { buildScene } from './build-scene';
import type { DrawContext } from './scene';

const AREA = { x: 40, y: 10, width: 400, height: 200 };
const CATEGORIES = ['Jan', 'Feb', 'Mar'];
const SCALES = new Map<string, AxisScale>([
    ['x:default', bandScale(CATEGORIES, { start: AREA.x, end: AREA.x + AREA.width }, 0.2, 0.1)],
    ['y:default', linearScale(0, 100, { start: AREA.y + AREA.height, end: AREA.y })]
]);

function drawContext(overrides: Partial<DrawContext> = {}): DrawContext {
    return {
        area: AREA,
        scales: SCALES,
        theme: defaultLightTheme as ChartTheme,
        isDark: false,
        fontFamily: 'sans-serif',
        fontSize: 12,
        direction: 'ltr',
        locale: 'en-US',
        progress: 1,
        hover: null,
        hoverEffect: null,
        isItemVisible: () => true,
        chartId: 'chart-1',
        measureText: (text, size) => text.length * size * 0.6,
        seriesColor: (index) => seriesColorAt(LIGHT_SERIES_PALETTE, index),
        ...overrides
    };
}

function lineSeries(id: string, index: number, values: number[], props: object = {}): ResolvedSeries {
    const registration: SeriesRegistration = { id, type: 'line', props: signal(props) as never, seriesIndex: signal(index) };

    return {
        id,
        type: 'line',
        seriesIndex: index,
        points: values.map((value, i) => ({ category: CATEGORIES[i], value, base: 0, dataIndex: i })),
        categories: CATEGORIES,
        yCategories: [],
        xAxisId: 'default',
        yAxisId: 'default',
        categoryAxis: 'x',
        continuousX: false,
        visible: true,
        registration
    };
}

function fakeContext(features: { type: string; props: object }[] = []): ChartContext {
    const registrations = features.map((entry) => ({ type: entry.type, props: signal(entry.props) }));

    return {
        axes: signal([] as BaseAxisProps[]),
        features: signal(registrations as never),
        feature: ((type: string) => computed(() => registrations.find((entry) => entry.type === type))) as never,
        hiddenItems: signal(new Map()),
        hiddenDatasets: signal(new Set<string>()),
        isItemVisible: () => true
    } as unknown as ChartContext;
}

/** The nodes of the marks layer. */
function marks(scene: ReturnType<typeof buildScene>): SvgNode[] {
    return scene.layers.find((layer) => layer.key === 'marks')?.nodes ?? [];
}

/** The nodes of one series: its group carries `data-series`. */
function nodesOf(scene: ReturnType<typeof buildScene>, seriesId: string): SvgNode[] {
    return marks(scene).filter((node) => JSON.stringify(node).includes(`"data-series":"${seriesId}"`));
}

describe('series cache in the scene', () => {
    it('reuses the marks of a series the hover does not touch', () => {
        const context = fakeContext();
        const a = lineSeries('a', 0, [10, 20, 30]);
        const b = lineSeries('b', 1, [40, 50, 60]);
        const series = [a, b];

        const idle = buildScene(context, series, drawContext());
        const hovered = buildScene(context, series, drawContext({ hover: { datasetId: 'a', index: 1 } }));

        // Series b was not hovered, so what it painted is the very same node objects.
        expect(nodesOf(hovered, 'b').length).toBeGreaterThan(0);
        nodesOf(hovered, 'b').forEach((node, i) => expect(node).toBe(nodesOf(idle, 'b')[i]));
        // Series a was repainted with its hover state.
        nodesOf(hovered, 'a').forEach((node, i) => expect(node).not.toBe(nodesOf(idle, 'a')[i]));
    });

    it('repaints the hovered series with the hover applied', () => {
        const context = fakeContext([{ type: 'hover', props: {} }]);
        const a = lineSeries('a', 0, [10, 20, 30], { markerSize: 4 });
        const idle = buildScene(context, [a], drawContext({ hoverEffect: { brightness: 1.1, dimOpacity: 1, offset: 0, scale: 1, radiusMultiplier: 2 } }));
        const hovered = buildScene(context, [a], drawContext({ hover: { datasetId: 'a', index: 1 }, hoverEffect: { brightness: 1.1, dimOpacity: 1, offset: 0, scale: 1, radiusMultiplier: 2 } }));

        // Not served from the cache: the hover is part of what this series paints.
        expect(nodesOf(hovered, 'a')[0]).not.toBe(nodesOf(idle, 'a')[0]);
    });

    it('does not reuse anything while a dimming hover is on, since every series fades', () => {
        const context = fakeContext();
        const a = lineSeries('a', 0, [10, 20, 30]);
        const b = lineSeries('b', 1, [40, 50, 60]);
        const effect = { brightness: 1, dimOpacity: 0.3, offset: 0, scale: 1, radiusMultiplier: 1 };

        const idle = buildScene(context, [a, b], drawContext({ hoverEffect: effect }));
        const dimmed = buildScene(context, [a, b], drawContext({ hover: { datasetId: 'a', index: 1 }, hoverEffect: effect }));

        nodesOf(dimmed, 'b').forEach((node, i) => expect(node).not.toBe(nodesOf(idle, 'b')[i]));
    });

    it('repaints when the series changes, even with no hover', () => {
        const context = fakeContext();
        const before = lineSeries('a', 0, [10, 20, 30]);
        const after = lineSeries('a', 0, [90, 20, 30]);

        const first = buildScene(context, [before], drawContext());
        const second = buildScene(context, [after], drawContext());

        expect(nodesOf(second, 'a')[0]).not.toBe(nodesOf(first, 'a')[0]);
    });

    it('repaints when the plot is resized', () => {
        const context = fakeContext();
        const a = lineSeries('a', 0, [10, 20, 30]);
        const first = buildScene(context, [a], drawContext());
        const resized = buildScene(context, [a], drawContext({ area: { ...AREA, width: 300 } }));

        expect(nodesOf(resized, 'a')[0]).not.toBe(nodesOf(first, 'a')[0]);
    });

    it('repaints while the entrance animation runs', () => {
        const context = fakeContext();
        const a = lineSeries('a', 0, [10, 20, 30]);
        const half = buildScene(context, [a], drawContext({ progress: 0.5 }));
        const done = buildScene(context, [a], drawContext({ progress: 1 }));

        expect(nodesOf(done, 'a')[0]).not.toBe(nodesOf(half, 'a')[0]);
    });
});

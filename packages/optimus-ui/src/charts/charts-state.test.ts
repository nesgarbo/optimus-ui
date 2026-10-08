import { computed, signal, type Signal } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import type { ChartDecimationProps } from '@openng/optimus-ui/types/charts';
import type { SeriesRegistration } from './charts-registry';
import { createChartState } from './charts-state';

// The state is the half of the chart that decides what is drawn, with no DOM in it, so it can be
// driven directly: register a series the way a part would and read what the renderers would read.

function makeState() {
    const renderRequests = vi.fn();
    const state = createChartState({
        renderer: 'svg',
        width: signal(600),
        height: signal(300),
        theme: signal(undefined),
        isDark: signal(false),
        fontFamily: signal('sans-serif'),
        fontSize: signal(12),
        direction: signal<'ltr' | 'rtl'>('ltr'),
        locale: signal('en-US'),
        numberFormat: signal(undefined),
        text: signal(undefined),
        container: () => null,
        exportChart: async () => {},
        requestRender: renderRequests
    });

    return { state, renderRequests };
}

type Datum = Record<string, unknown>;

function addSeries(state: ReturnType<typeof makeState>['state'], id: string, props: Signal<Record<string, unknown>>, type: SeriesRegistration['type'] = 'line', extra: Partial<SeriesRegistration> = {}): SeriesRegistration {
    const registration: SeriesRegistration = { id, type, props: props as never, seriesIndex: signal(0), ...extra };

    state.context.registerSeries(registration);

    return registration;
}

function months(values: (number | string | null)[], field = 'value'): Datum[] {
    return values.map((value, i) => ({ month: `M${i}`, [field]: value }));
}

describe('resolved series', () => {
    it('reads categories and values through the field bindings', () => {
        const { state } = makeState();

        addSeries(state, 's', signal({ data: months([3, 5, 8]), categoryXField: 'month', valueYField: 'value' }));

        const [resolved] = state.resolvedSeries();

        expect(resolved.categories).toEqual(['M0', 'M1', 'M2']);
        expect(resolved.points.map((point) => point.value)).toEqual([3, 5, 8]);
    });

    it('reads a numeric string as a number instead of dropping it', () => {
        const { state } = makeState();

        addSeries(state, 's', signal({ data: months(['3', ' 5.5 ', 'x', '', null]), categoryXField: 'month', valueYField: 'value' }));

        expect(state.resolvedSeries()[0].points.map((point) => point.value)).toEqual([3, 5.5, null, null, null]);
    });

    it('re-reads only the series whose props changed', () => {
        const { state } = makeState();
        const aData = signal<Datum[]>(months([1, 2, 3]));
        const bProps = signal<Record<string, unknown>>({ data: months([4, 5, 6]), categoryXField: 'month', valueYField: 'value' });
        const bReads = vi.fn(() => bProps());

        addSeries(
            state,
            'a',
            computed(() => ({ data: aData(), categoryXField: 'month', valueYField: 'value' }))
        );
        addSeries(state, 'b', computed(bReads));

        const first = state.resolvedSeries();
        const readsAfterFirst = bReads.mock.calls.length;

        aData.set(months([9, 9, 9]));

        const second = state.resolvedSeries();

        // Series b was not re-read, so its points are the very objects it had.
        expect(bReads.mock.calls.length).toBe(readsAfterFirst);
        expect(second[1].points).toBe(first[1].points);
        expect(second[0].points).not.toBe(first[0].points);
    });
});

describe('decimation in the state', () => {
    function withDecimation(decimation: ChartDecimationProps) {
        const { state } = makeState();
        const props = signal(decimation);

        state.context.registerFeature({ type: 'decimation', props: props as never });

        return { state, props };
    }

    const long = (n: number): Datum[] => Array.from({ length: n }, (_, i) => ({ month: `M${i}`, value: Math.sin(i / 9) * 10 }));

    it('thins a long series and keeps the original index on every survivor', () => {
        const { state } = withDecimation({ samples: 60, threshold: 100 });

        addSeries(state, 's', signal({ data: long(3000), categoryXField: 'month', valueYField: 'value' }));

        const points = state.resolvedSeries()[0].points;

        expect(points.length).toBeLessThanOrEqual(60);
        expect(points[0].dataIndex).toBe(0);
        expect(points[points.length - 1].dataIndex).toBe(2999);
    });

    it('leaves a series under the threshold alone', () => {
        const { state } = withDecimation({ samples: 60, threshold: 5000 });

        addSeries(state, 's', signal({ data: long(3000), categoryXField: 'month', valueYField: 'value' }));

        expect(state.resolvedSeries()[0].points).toHaveLength(3000);
    });

    it('keeps the null that is a gap in the line', () => {
        const { state } = withDecimation({ samples: 60, threshold: 100 });
        const data = long(2000);

        data[1000] = { month: 'M1000', value: null };
        addSeries(state, 's', signal({ data, categoryXField: 'month', valueYField: 'value' }));

        expect(state.resolvedSeries()[0].points.some((point) => point.dataIndex === 1000 && point.value === null)).toBe(true);
    });

    it('places a scatter by its x value', () => {
        const { state } = withDecimation({ samples: 50, threshold: 100 });
        const data = Array.from({ length: 1000 }, (_, i) => ({ x: 1000 - i, y: i === 999 ? 500 : 1 }));

        addSeries(state, 's', signal({ data, valueXField: 'x', valueYField: 'y' }), 'scatter');

        const resolved = state.resolvedSeries()[0];

        expect(resolved.continuousX).toBe(true);
        expect(resolved.points.some((point) => point.value === 500)).toBe(true);
        expect(resolved.points.length).toBeLessThanOrEqual(50);
    });

    it('does not re-decimate a series when another one changes', () => {
        const { state } = withDecimation({ samples: 60, threshold: 100 });
        const other = signal<Datum[]>(months([1, 2, 3]));

        addSeries(state, 'big', signal({ data: long(3000), categoryXField: 'month', valueYField: 'value' }));
        addSeries(
            state,
            'small',
            computed(() => ({ data: other(), categoryXField: 'month', valueYField: 'value' }))
        );

        const before = state.resolvedSeries()[0].points;

        other.set(months([4, 5, 6]));

        expect(state.resolvedSeries()[0].points).toBe(before);
    });

    it('re-decimates when the settings change', () => {
        const { state, props } = withDecimation({ samples: 60, threshold: 100 });

        addSeries(state, 's', signal({ data: long(3000), categoryXField: 'month', valueYField: 'value' }));

        expect(state.resolvedSeries()[0].points.length).toBeLessThanOrEqual(60);

        props.set({ samples: 60, threshold: 10_000 });

        expect(state.resolvedSeries()[0].points).toHaveLength(3000);
    });
});

describe('category sorting', () => {
    it('orders categories by their total value without summing inside the comparator', () => {
        const { state } = makeState();

        state.context.registerAxis({ id: 'default', axis: 'x', props: signal({ type: 'category', sort: 'value-desc' }) as never });
        addSeries(
            state,
            'a',
            signal({
                data: [
                    { c: 'x', v: 1 },
                    { c: 'y', v: 9 },
                    { c: 'z', v: 4 }
                ],
                categoryXField: 'c',
                valueYField: 'v'
            }),
            'bar'
        );
        addSeries(
            state,
            'b',
            signal({
                data: [
                    { c: 'x', v: 1 },
                    { c: 'y', v: 1 },
                    { c: 'z', v: 10 }
                ],
                categoryXField: 'c',
                valueYField: 'v'
            }),
            'bar'
        );

        const domain = state.domains().get('x:default');

        expect(domain?.kind === 'category' && domain.categories).toEqual(['z', 'y', 'x']);
    });
});

describe('the data table and CSV', () => {
    it('has one row per category and one column per series', () => {
        const { state } = makeState();

        addSeries(state, 'a', signal({ name: 'Sales', data: months([1, 2]), categoryXField: 'month', valueYField: 'value' }));
        addSeries(state, 'b', signal({ data: months([3, null]), categoryXField: 'month', valueYField: 'value' }));

        const table = state.context.table!();

        expect(table.headings).toEqual(['Category', 'Sales', 'Series 2']);
        expect(table.rows).toEqual([
            ['M0', 1, 3],
            ['M1', 2, null]
        ]);
        expect(state.context.toCsv()).toBe('Category,Sales,Series 2\nM0,1,3\nM1,2,');
    });

    it('is empty when nothing is drawn', () => {
        const { state } = makeState();

        expect(state.context.toCsv()).toBe('');
        expect(state.context.table!()).toEqual({ headings: [], rows: [] });
    });

    it('defuses a category or a series name that a spreadsheet would run as a formula', () => {
        const { state } = makeState();

        addSeries(
            state,
            'a',
            signal({
                name: '=HYPERLINK("http://x","y")',
                data: [
                    { c: '@SUM(1)', v: 1 },
                    { c: '-5', v: 2 },
                    { c: '+cmd', v: 3 }
                ],
                categoryXField: 'c',
                valueYField: 'v'
            })
        );

        const rows = state.context.toCsv().split('\n');

        expect(rows[0]).toBe('Category,"\'=HYPERLINK(""http://x"",""y"")"');
        expect(rows[1]).toBe("'@SUM(1),1");
        // A plain negative number is data, not a formula.
        expect(rows[2]).toBe('-5,2');
        expect(rows[3]).toBe("'+cmd,3");
    });

    it('quotes a category that holds a comma or a line break', () => {
        const { state } = makeState();

        addSeries(
            state,
            'a',
            signal({
                data: [
                    { c: 'a,b', v: 1 },
                    { c: 'two\nlines', v: 2 }
                ],
                categoryXField: 'c',
                valueYField: 'v'
            })
        );

        expect(state.context.toCsv()).toBe('Category,Series 1\n"a,b",1\n"two\nlines",2');
    });

    it('leaves out a hidden series', () => {
        const { state } = makeState();

        addSeries(state, 'a', signal({ data: months([1]), categoryXField: 'month', valueYField: 'value' }));
        addSeries(state, 'b', signal({ data: months([2]), categoryXField: 'month', valueYField: 'value' }));
        state.context.toggleDataset('b');

        expect(state.context.table!().headings).toHaveLength(2);
    });

    it('builds a long table without a quadratic scan', () => {
        const { state } = makeState();
        const data = Array.from({ length: 20_000 }, (_, i) => ({ c: `c${i}`, v: i }));

        for (let s = 0; s < 3; s++) addSeries(state, `s${s}`, signal({ data, categoryXField: 'c', valueYField: 'v' }));

        const started = performance.now();
        const table = state.context.table!();

        expect(table.rows).toHaveLength(20_000);
        // A `find` per cell would be 20,000 x 20,000 x 3 comparisons and take many seconds.
        expect(performance.now() - started).toBeLessThan(2000);
    });
});

describe('hover and render requests', () => {
    it('records the hover and asks for a repaint', () => {
        const { state, renderRequests } = makeState();

        renderRequests.mockClear();
        state.context.setHover({ datasetId: 's', index: 1, x: 10, y: 20 });

        expect(state.context.hover()).toEqual({ datasetId: 's', index: 1, x: 10, y: 20 });
        expect(renderRequests).toHaveBeenCalledTimes(1);
    });

    it('drops the hover when a dataset is toggled off', () => {
        const { state } = makeState();

        state.context.setHover({ datasetId: 's', index: 1, x: 0, y: 0 });
        state.context.toggleDataset('s');

        expect(state.context.hover()).toBeNull();
        expect(state.context.isDatasetVisible('s')).toBe(false);
    });
});

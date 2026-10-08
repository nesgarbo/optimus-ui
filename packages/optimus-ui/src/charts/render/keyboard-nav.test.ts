import { computed, signal } from '@angular/core';
import { describe, expect, it } from 'vitest';
import type { AxisScale } from '@openng/optimus-ui/types/charts';
import type { SeriesRegistration } from '../charts-registry';
import type { ResolvedSeries } from '../charts-state';
import { bandScale, linearScale } from '../core/scale';
import { navigate, pointPosition, type NavigationOptions } from './keyboard-nav';

function line(id: string, values: (number | null)[], visible = true): ResolvedSeries {
    const registration: SeriesRegistration = { id, type: 'line', props: computed(() => ({})) as never, seriesIndex: signal(0) };

    return {
        id,
        type: 'line',
        seriesIndex: 0,
        points: values.map((value, i) => ({ category: `c${i}`, value, base: 0, dataIndex: i })),
        categories: values.map((_, i) => `c${i}`),
        yCategories: [],
        xAxisId: 'default',
        yAxisId: 'default',
        categoryAxis: 'x',
        continuousX: false,
        visible,
        registration
    };
}

const base: NavigationOptions = { config: undefined, rtl: false, isItemVisible: () => true };
const at = (datasetId: string, index: number) => ({ datasetId, index });

describe('keyboard navigation', () => {
    const a = line('a', [1, 2, 3, 4]);
    const b = line('b', [5, 6, 7, 8]);

    it('lands on the first point from any arrow key when nothing is focused', () => {
        expect(navigate([a, b], null, 'ArrowRight', base)).toEqual({ kind: 'focus', datasetId: 'a', index: 0 });
        expect(navigate([a, b], null, 'ArrowDown', base)).toEqual({ kind: 'focus', datasetId: 'a', index: 0 });
    });

    it('lands on the last point with End', () => {
        expect(navigate([a, b], null, 'End', base)).toEqual({ kind: 'focus', datasetId: 'a', index: 3 });
    });

    it('moves along the series with left and right', () => {
        expect(navigate([a, b], at('a', 1), 'ArrowRight', base)).toEqual({ kind: 'focus', datasetId: 'a', index: 2 });
        expect(navigate([a, b], at('a', 1), 'ArrowLeft', base)).toEqual({ kind: 'focus', datasetId: 'a', index: 0 });
    });

    it('reverses left and right in a right-to-left chart', () => {
        expect(navigate([a], at('a', 1), 'ArrowRight', { ...base, rtl: true })).toEqual({ kind: 'focus', datasetId: 'a', index: 0 });
    });

    it('stops at the ends, or wraps when asked', () => {
        expect(navigate([a], at('a', 3), 'ArrowRight', base)).toEqual({ kind: 'focus', datasetId: 'a', index: 3 });
        expect(navigate([a], at('a', 3), 'ArrowRight', { ...base, config: { wrapAround: true } })).toEqual({ kind: 'focus', datasetId: 'a', index: 0 });
        expect(navigate([a], at('a', 0), 'ArrowLeft', { ...base, config: { wrapAround: true } })).toEqual({ kind: 'focus', datasetId: 'a', index: 3 });
    });

    it('jumps to the ends of the series with Home and End', () => {
        expect(navigate([a], at('a', 2), 'Home', base)).toEqual({ kind: 'focus', datasetId: 'a', index: 0 });
        expect(navigate([a], at('a', 1), 'End', base)).toEqual({ kind: 'focus', datasetId: 'a', index: 3 });
    });

    it('switches series with up and down, keeping the position', () => {
        expect(navigate([a, b], at('a', 2), 'ArrowDown', base)).toEqual({ kind: 'focus', datasetId: 'b', index: 2 });
        expect(navigate([a, b], at('b', 2), 'ArrowUp', base)).toEqual({ kind: 'focus', datasetId: 'a', index: 2 });
    });

    it('stays put on the last series unless it wraps', () => {
        expect(navigate([a, b], at('b', 1), 'ArrowDown', base)).toEqual({ kind: 'focus', datasetId: 'b', index: 1 });
        expect(navigate([a, b], at('b', 1), 'ArrowDown', { ...base, config: { wrapAround: true } })).toEqual({ kind: 'focus', datasetId: 'a', index: 1 });
    });

    it('walks every point as one list in serialize mode', () => {
        const options = { ...base, config: { seriesNavigation: { mode: 'serialize' as const } } };

        expect(navigate([a, b], at('a', 3), 'ArrowRight', options)).toEqual({ kind: 'focus', datasetId: 'b', index: 0 });
        expect(navigate([a, b], at('b', 0), 'ArrowLeft', options)).toEqual({ kind: 'focus', datasetId: 'a', index: 3 });
        expect(navigate([a, b], at('a', 1), 'End', options)).toEqual({ kind: 'focus', datasetId: 'b', index: 3 });
    });

    it('remembers the point of the series it left when asked to', () => {
        const remembered = new Map<string, number>([['b', 0]]);
        const options = { ...base, remembered, config: { seriesNavigation: { rememberPointFocus: true } } };

        expect(navigate([a, b], at('a', 3), 'ArrowDown', options)).toEqual({ kind: 'focus', datasetId: 'b', index: 0 });
        expect(remembered.get('a')).toBe(3);
    });

    it('skips null points, unless told not to', () => {
        const gappy = line('g', [1, null, 3]);

        expect(navigate([gappy], at('g', 0), 'ArrowRight', base)).toEqual({ kind: 'focus', datasetId: 'g', index: 2 });
        expect(navigate([gappy], at('g', 0), 'ArrowRight', { ...base, config: { seriesNavigation: { skipNullPoints: false } } })).toEqual({ kind: 'focus', datasetId: 'g', index: 1 });
    });

    it('skips a hidden series and a hidden item', () => {
        const hidden = line('h', [1, 2], false);

        expect(navigate([hidden, a], null, 'ArrowRight', base)).toEqual({ kind: 'focus', datasetId: 'a', index: 0 });
        expect(navigate([a], at('a', 0), 'ArrowRight', { ...base, isItemVisible: (_, index) => index !== 1 })).toEqual({ kind: 'focus', datasetId: 'a', index: 2 });
    });

    it('turns point navigation off for a series past the threshold', () => {
        const options = { ...base, config: { seriesNavigation: { pointNavigationEnabledThreshold: 3 } } };

        expect(navigate([a], null, 'ArrowRight', options)).toEqual({ kind: 'none' });
    });

    it('clears on Escape, and ignores keys it does not own', () => {
        expect(navigate([a], at('a', 1), 'Escape', base)).toEqual({ kind: 'clear' });
        expect(navigate([a], null, 'Escape', base)).toEqual({ kind: 'none' });
        expect(navigate([a], at('a', 1), 'q', base)).toEqual({ kind: 'none' });
    });

    it('does nothing when the application turned it off', () => {
        expect(navigate([a], at('a', 1), 'ArrowRight', { ...base, config: { enabled: false } })).toEqual({ kind: 'none' });
    });

    it('starts over when the focused point is gone', () => {
        expect(navigate([a], at('a', 9), 'ArrowRight', base)).toEqual({ kind: 'focus', datasetId: 'a', index: 0 });
        expect(navigate([a], at('gone', 0), 'ArrowRight', base)).toEqual({ kind: 'focus', datasetId: 'a', index: 0 });
    });
});

describe('pointPosition', () => {
    const scales = new Map<string, AxisScale>([
        ['x:default', bandScale(['c0', 'c1', 'c2', 'c3'], { start: 0, end: 400 }, 0, 0)],
        ['y:default', linearScale(0, 10, { start: 100, end: 0 })]
    ]);
    const area = { x: 0, y: 0, width: 400, height: 100 };

    it('places a point on its category and its value', () => {
        const position = pointPosition({ scales, area }, line('a', [5, 10, 0, 2]), 1);

        expect(position.x).toBeCloseTo(150);
        expect(position.y).toBeCloseTo(0);
    });

    it('falls back to the middle of the plot for a point with no cartesian place', () => {
        const position = pointPosition({ scales: new Map(), area }, line('a', [1]), 0);

        expect(position).toEqual({ x: 200, y: 50 });
    });
});

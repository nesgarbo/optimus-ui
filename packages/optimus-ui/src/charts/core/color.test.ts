import { describe, expect, it } from 'vitest';
import { brighten, contrastingTextColor, contrastRatio, evenStops, formatColor, interpolateScale, isGradient, isLinearGradient, isRadialGradient, mixColors, parseColor, relativeLuminance, resolveColorScale, withOpacity } from './color';

describe('parseColor', () => {
    it('reads short and long hex, with and without alpha', () => {
        expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
        expect(parseColor('#336699')).toEqual({ r: 51, g: 102, b: 153, a: 1 });
        expect(parseColor('#00000080')?.a).toBeCloseTo(128 / 255);
        expect(parseColor('#0008')?.a).toBeCloseTo(136 / 255);
    });

    it('reads rgb and rgba functions, comma or space separated, percent included', () => {
        expect(parseColor('rgb(10, 20, 30)')).toEqual({ r: 10, g: 20, b: 30, a: 1 });
        expect(parseColor('rgba(10,20,30,0.5)')).toEqual({ r: 10, g: 20, b: 30, a: 0.5 });
        expect(parseColor('rgb(10 20 30 / 50%)')?.a).toBe(0.5);
        expect(parseColor('rgb(100%, 0%, 0%)')?.r).toBe(255);
    });

    it('returns null for what it cannot read', () => {
        for (const v of ['red', 'var(--x)', 'hsl(0 0% 0%)', '#12', 'transparent']) expect(parseColor(v)).toBeNull();
    });
});

describe('formatColor and transforms', () => {
    it('formats opaque colours as rgb and others as rgba, clamping channels', () => {
        expect(formatColor({ r: 1, g: 2, b: 3, a: 1 })).toBe('rgb(1, 2, 3)');
        expect(formatColor({ r: 300, g: -5, b: 3.4, a: 0.5 })).toBe('rgba(255, 0, 3, 0.5)');
    });

    it('brightens and fades, leaving unreadable colours alone', () => {
        expect(brighten('#646464', 2)).toBe('rgb(200, 200, 200)');
        expect(brighten('#646464', 1)).toBe('#646464');
        expect(brighten('var(--x)', 2)).toBe('var(--x)');
        expect(withOpacity('rgb(1, 2, 3)', 0.5)).toBe('rgba(1, 2, 3, 0.5)');
        expect(withOpacity('rgb(1, 2, 3)', 1)).toBe('rgb(1, 2, 3)');
        expect(withOpacity('red', 0.5)).toBe('red');
    });

    it('mixes in sRGB and picks the nearer end when it cannot parse', () => {
        expect(mixColors('#000000', '#ffffff', 0.5)).toBe('rgb(128, 128, 128)');
        expect(mixColors('#000000', '#ffffff', 0)).toBe('rgb(0, 0, 0)');
        expect(mixColors('red', 'blue', 0.2)).toBe('red');
        expect(mixColors('red', 'blue', 0.8)).toBe('blue');
    });
});

describe('contrast', () => {
    it('computes WCAG luminance and ratio extremes', () => {
        expect(relativeLuminance('#000')).toBe(0);
        expect(relativeLuminance('#fff')).toBeCloseTo(1);
        expect(relativeLuminance('red')).toBeNull();
        expect(contrastRatio('#000', '#fff')).toBeCloseTo(21);
        expect(contrastRatio('#123456', '#123456')).toBeCloseTo(1);
        expect(contrastRatio('red', '#fff')).toBeNull();
    });

    it('picks the label colour that reads better, mid blue included', () => {
        expect(contrastingTextColor('#ffffff')).toBe('#0f172a');
        expect(contrastingTextColor('#000000')).toBe('#ffffff');
        expect(contrastingTextColor('#5daeea')).toBe('#0f172a');
        expect(contrastingTextColor('var(--x)')).toBe('#0f172a');
        expect(contrastingTextColor('#000', '#111111', '#eeeeee')).toBe('#eeeeee');
    });
});

describe('colour scales', () => {
    it('interpolates between stops and clamps outside the domain', () => {
        const scale = [0, 10];
        const range = ['#000000', '#ffffff'];

        expect(interpolateScale(5, scale, range)).toBe('rgb(128, 128, 128)');
        expect(interpolateScale(-5, scale, range)).toBe('#000000');
        expect(interpolateScale(50, scale, range)).toBe('#ffffff');
        expect(interpolateScale(5, [0, 10], [])).toBe('transparent');
        expect(interpolateScale(5, [0], ['#111'])).toBe('#111');
    });

    it('handles multiple stops', () => {
        expect(interpolateScale(15, [0, 10, 20], ['#000000', '#646464', '#c8c8c8'])).toBe('rgb(150, 150, 150)');
    });

    it('spreads even stops', () => {
        expect(evenStops(0, 10, 3)).toEqual([0, 5, 10]);
        expect(evenStops(2, 9, 1)).toEqual([2]);
    });

    it('resolves in the documented order', () => {
        const base = { min: 0, max: 10, fallbackRange: ['#a', '#b'] };

        expect(resolveColorScale({ ...base, colorScale: [0, 4], colorRange: ['#1', '#2'], color: '#3' })).toEqual({ scale: [0, 4], range: ['#1', '#2'], opacityMapped: false });
        expect(resolveColorScale({ ...base, colorRange: ['#1', '#2', '#3'] })).toEqual({ scale: [0, 5, 10], range: ['#1', '#2', '#3'], opacityMapped: false });
        expect(resolveColorScale({ ...base, color: '#3' })).toEqual({ scale: [0, 10], range: ['#3', '#3'], opacityMapped: true });
        expect(resolveColorScale(base)).toEqual({ scale: [0, 10], range: ['#a', '#b'], opacityMapped: false });
    });
});

describe('gradient guards', () => {
    it('tells gradients from plain colours', () => {
        const linear = { linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 }, stops: [] } as never;
        const radial = { radialGradient: { cx: 0, cy: 0, r: 1 }, stops: [] } as never;

        expect(isGradient('#fff')).toBe(false);
        expect(isGradient(undefined)).toBe(false);
        expect(isGradient(linear)).toBe(true);
        expect(isLinearGradient(linear)).toBe(true);
        expect(isRadialGradient(radial)).toBe(true);
        expect(isRadialGradient(linear)).toBe(false);
    });
});

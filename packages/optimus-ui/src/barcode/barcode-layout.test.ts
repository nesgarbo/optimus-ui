import { describe, expect, it } from 'vitest';
import { layoutLinear, layoutMatrix, layoutPath, layoutToSvg, paintLayout, QR_QUIET } from './barcode-layout';
import { encodeEan13, encodeCode128 } from './barcode-linear';
import { encodeQr } from './barcode-qr';

describe('linear layout', () => {
    it('spreads the modules over the width and leaves the quiet zone', () => {
        const symbol = encodeCode128('Hi');
        const layout = layoutLinear({ kind: 'linear', type: 'code128', modules: symbol.modules, width: 400, height: 100, defaultText: 'Hi', displayText: { visibility: false } });
        const moduleW = 400 / (symbol.modules.length + 20);

        expect(layout.rects[0].x).toBeCloseTo(10 * moduleW);
        expect(layout.rects[0].h).toBe(100);
        expect(layout.texts).toEqual([]);
        // the bars never run past the quiet zone on the right
        const last = layout.rects.at(-1)!;

        expect(last.x + last.w).toBeLessThanOrEqual(400 - 10 * moduleW + 1e-6);
    });

    it('merges neighbouring bars into one rectangle', () => {
        const layout = layoutLinear({ kind: 'linear', type: 'code128', modules: [true, true, false, true], width: 28, height: 10, defaultText: '' });

        expect(layout.rects).toHaveLength(2);
        expect(layout.rects[0].w).toBeCloseTo(layout.rects[1].w * 2);
    });

    it('reserves room for the text, above or below', () => {
        const base = { kind: 'linear' as const, type: 'code128' as const, modules: encodeCode128('Hi').modules, width: 300, height: 100, defaultText: 'Hi' };
        const below = layoutLinear({ ...base, displayText: { size: 10, margin: 5 } });
        const above = layoutLinear({ ...base, displayText: { size: 10, margin: 5, position: 'top' } });

        expect(below.rects[0].h).toBe(100 - 20);
        expect(below.rects[0].y).toBe(0);
        expect(below.texts[0].y).toBeGreaterThan(80);
        expect(above.rects[0].y).toBe(20);
        expect(above.texts[0].y).toBeLessThan(20);
    });

    it('splits an EAN-13 text into the three groups under the bars', () => {
        const symbol = encodeEan13('4006381333931');
        const layout = layoutLinear({ kind: 'linear', type: 'ean13', modules: symbol.modules, width: 300, height: 100, defaultText: symbol.text, displayText: {} });

        expect(layout.texts.map((t) => t.text)).toEqual(['4', '006381', '333931']);
        expect(layout.texts[0].x).toBeLessThan(layout.rects[0].x);
    });

    it('takes the margin out of the box', () => {
        const layout = layoutLinear({ kind: 'linear', type: 'code128', modules: [true], width: 100, height: 50, defaultText: '', margin: { left: 10, right: 10, top: 5, bottom: 5 } });

        expect(layout.rects[0].y).toBe(5);
        expect(layout.rects[0].h).toBe(40);
    });
});

describe('matrix layout', () => {
    it('centres whole-pixel modules in the box', () => {
        const q = encodeQr('hello');
        const layout = layoutMatrix({ kind: 'matrix', modules: q.modules, width: 200, height: 200, defaultText: '' });
        const size = Math.floor(200 / (q.size + QR_QUIET * 2));

        expect(Number.isInteger(layout.rects[0].w / size)).toBe(true);
        expect(layout.rects.every((r) => r.h === size)).toBe(true);
        expect(layout.rects[0].x).toBeGreaterThan(0);
    });

    it('honours a fixed module size', () => {
        const layout = layoutMatrix({ kind: 'matrix', modules: encodeQr('hello').modules, width: 300, height: 300, defaultText: '', moduleSize: 3 });

        expect(layout.rects.every((r) => r.h === 3)).toBe(true);
    });
});

describe('writing out', () => {
    const layout = layoutLinear({ kind: 'linear', type: 'code128', modules: encodeCode128('A&B').modules, width: 200, height: 80, defaultText: 'A&B', displayText: {} });

    it('makes a standalone SVG, escaping the text', () => {
        const svg = layoutToSvg(layout, '#000', '#fff');

        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg).toContain('width="200"');
        expect(svg).toContain('fill="#fff"');
        expect(svg).toContain('A&amp;B');
        expect(svg).toContain(layoutPath(layout.rects));
    });

    it('paints the same rectangles on a canvas context', () => {
        const calls: string[] = [];
        const ctx: any = { fillRect: () => calls.push('rect'), fillText: (t: string) => calls.push(`text:${t}`) };

        paintLayout(ctx, layout, '#000', '#fff');

        expect(calls.filter((c) => c === 'rect')).toHaveLength(layout.rects.length + 1);
        expect(calls).toContain('text:A&B');
    });
});

describe('matrix layout beyond the square', () => {
    it('fits a wide symbol in a box by its width, and centres it', () => {
        const modules = Array.from({ length: 12 }, () => new Array<boolean>(120).fill(true));
        const layout = layoutMatrix({ kind: 'matrix', modules, width: 600, height: 300, defaultText: '', quiet: 2 });
        const size = Math.floor(600 / (120 + 4));

        expect(layout.rects).toHaveLength(12); // each row is one run
        expect(layout.rects[0].w).toBe(120 * size);
        expect(layout.rects[0].h).toBe(size);
        expect(layout.rects[0].x).toBeCloseTo((600 - 120 * size) / 2);
    });

    it('takes the quiet zone it is given', () => {
        const modules = [
            [true, true],
            [true, true]
        ];
        const wide = layoutMatrix({ kind: 'matrix', modules, width: 100, height: 100, defaultText: '', quiet: 4 });
        const tight = layoutMatrix({ kind: 'matrix', modules, width: 100, height: 100, defaultText: '', quiet: 1 });

        expect(tight.rects[0].h).toBeGreaterThan(wide.rects[0].h);
    });

    it('places a logo in the middle, and keeps it to a quarter of the symbol', () => {
        const modules = encodeQr('logo').modules;
        const layout = layoutMatrix({ kind: 'matrix', modules, width: 300, height: 300, defaultText: '', logo: { src: 'x.png', width: 500, height: 500 } });
        const g = layout.logo!;
        const symbol = (layout.rects[0].h * modules.length) ** 2;

        expect(g.w * g.h).toBeLessThanOrEqual(0.25 * symbol + 1e-6);
        expect(g.x + g.w / 2).toBeCloseTo(150, 0);
        expect(g.y + g.h / 2).toBeCloseTo(150, 0);
        expect(g.pad.w).toBeGreaterThan(g.w);
        expect(layoutMatrix({ kind: 'matrix', modules, width: 300, height: 300, defaultText: '', logo: { src: 'x.png', width: 10, height: 10 } }).logo!.w).toBe(10);
        expect(layoutMatrix({ kind: 'matrix', modules, width: 300, height: 300, defaultText: '' }).logo).toBeUndefined();
    });

    it('writes the logo in the SVG and draws it on the canvas when it is loaded', () => {
        const layout = layoutMatrix({ kind: 'matrix', modules: encodeQr('logo').modules, width: 300, height: 300, defaultText: '', logo: { src: 'data:image/png;base64,AAA', width: 40, height: 40 } });

        expect(layoutToSvg(layout, '#000', '#fff')).toContain('<image href="data:image/png;base64,AAA"');

        const calls: string[] = [];
        const ctx: any = { fillRect: () => calls.push('rect'), fillText: () => calls.push('text'), drawImage: () => calls.push('image') };

        paintLayout(ctx, layout, '#000', '#fff');
        expect(calls).not.toContain('image'); // not loaded yet: the clear box shows
        paintLayout(ctx, layout, '#000', '#fff', '#000', {} as any);
        expect(calls).toContain('image');
    });
});

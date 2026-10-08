import type { SignatureStroke } from '@openng/optimus-ui/types/signature';
import { describe, expect, it } from 'vitest';
import { drawStroke, escapeAttr, scaleStrokes, strokeSegments, strokeWidths, toSvg } from './signature-engine';

const stroke = (points: [number, number, number][]): SignatureStroke => ({ points: points.map(([x, y, t]) => ({ x, y, t })), color: '#111', minWidth: 0.5, maxWidth: 2.5, velocity: 0.7 });

describe('signature engine', () => {
    it('thins the line when the pen is fast and thickens it when slow', () => {
        const slow = strokeWidths(
            stroke([
                [0, 0, 0],
                [1, 0, 50],
                [2, 0, 100],
                [3, 0, 150]
            ]).points,
            0.5,
            2.5,
            0.7
        );
        const fast = strokeWidths(
            stroke([
                [0, 0, 0],
                [50, 0, 5],
                [100, 0, 10],
                [150, 0, 15]
            ]).points,
            0.5,
            2.5,
            0.7
        );

        expect(slow.at(-1)!).toBeGreaterThan(fast.at(-1)!);
        expect(Math.min(...fast)).toBeGreaterThanOrEqual(0.5);
        expect(Math.max(...slow)).toBeLessThanOrEqual(2.5);
        expect(strokeWidths([], 1, 2, 0.5)).toEqual([]);
    });

    it('turns n points into n-1 segments joined end to end, and a dot into none', () => {
        const segments = strokeSegments(
            stroke([
                [0, 0, 0],
                [10, 0, 10],
                [20, 10, 20],
                [30, 10, 30]
            ])
        );

        expect(segments).toHaveLength(3);
        expect(segments[0]).toMatchObject({ fromX: 0, fromY: 0 });
        expect(segments[1].fromX).toBe(segments[0].toX);
        expect(segments[2]).toMatchObject({ toX: 30, toY: 10 });
        expect(strokeSegments(stroke([[5, 5, 0]]))).toEqual([]);
    });

    it('draws segments and dots through the context', () => {
        const calls: string[] = [];
        const ctx: any = new Proxy(
            {},
            {
                get:
                    (_t, name: string) =>
                    (...args: any[]) =>
                        calls.push(name),
                set: () => true
            }
        );

        drawStroke(
            ctx,
            stroke([
                [0, 0, 0],
                [5, 5, 10],
                [10, 0, 20]
            ])
        );
        expect(calls.filter((c) => c === 'quadraticCurveTo')).toHaveLength(2);

        calls.length = 0;
        drawStroke(ctx, stroke([[5, 5, 0]]));
        expect(calls).toContain('arc');
    });

    it('writes SVG, escaping what it embeds', () => {
        const svg = toSvg(
            [
                stroke([
                    [0, 0, 0],
                    [5, 5, 10]
                ]),
                stroke([[9, 9, 0]])
            ],
            { width: 100, height: 50, background: 'white', image: 'data:image/png;base64,"x' }
        );

        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg).toContain('viewBox="0 0 100 50"');
        expect(svg).toContain('<rect');
        expect(svg).toContain('<circle');
        expect(svg).toContain('<path');
        expect(svg).toContain('&quot;x');
    });

    it('scales strokes with the pad', () => {
        const [s] = scaleStrokes(
            [
                stroke([
                    [10, 10, 0],
                    [20, 20, 5]
                ])
            ],
            2,
            2
        );

        expect(s.points[1]).toMatchObject({ x: 40, y: 40 });
        expect(s.maxWidth).toBe(5);
    });
});

describe('escapeAttr', () => {
    it('escapes every character that can leave an attribute', () => {
        expect(escapeAttr(`a&b"c'd<e>f`)).toBe('a&amp;b&quot;c&apos;d&lt;e&gt;f');
    });
});

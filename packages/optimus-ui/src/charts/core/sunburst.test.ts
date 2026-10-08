import { describe, expect, it } from 'vitest';
import { depthOf, insideArc, layoutSunburst } from './sunburst';
import { buildHierarchy, type TreemapNode } from './treemap';

const leaf = (label: string, value: number, dataIndex: number): TreemapNode => ({ label, value, dataIndex });

const tree: TreemapNode[] = [
    { label: 'A', value: 0, dataIndex: 0, children: [leaf('A1', 30, 1), leaf('A2', 10, 2)] },
    { label: 'B', value: 0, dataIndex: 3, children: [{ label: 'B1', value: 0, dataIndex: 4, children: [leaf('B1a', 40, 5), leaf('B1b', 20, 6)] }] }
];

const opts = { startAngle: 0, sweepAngle: 360, innerRadius: 20, outerRadius: 140 };

describe('layoutSunburst', () => {
    it('gives every generation a ring, the first innermost', () => {
        expect(depthOf(tree)).toBe(3);

        const arcs = layoutSunburst(tree, opts);
        const ringAt = (depth: number) => arcs.find((a) => a.depth === depth)!;

        expect(ringAt(0).innerRadius).toBe(20);
        expect(ringAt(0).outerRadius).toBe(60);
        expect(ringAt(1).innerRadius).toBe(60);
        expect(ringAt(2).outerRadius).toBe(140);
    });

    it('sizes an arc by what is under it, and a family fills the arc of its parent', () => {
        const arcs = layoutSunburst(tree, opts);
        const byLabel = (label: string) => arcs.find((a) => a.node.label === label)!;
        const span = (label: string) => byLabel(label).endAngle - byLabel(label).startAngle;

        expect(span('A')).toBeCloseTo(360 * (40 / 100));
        expect(span('B')).toBeCloseTo(360 * (60 / 100));
        expect(span('A1') + span('A2')).toBeCloseTo(span('A'));
        expect(span('A1') / span('A2')).toBeCloseTo(3);
        expect(byLabel('A1').startAngle).toBeCloseTo(byLabel('A').startAngle);
        expect(byLabel('B1b').endAngle).toBeCloseTo(byLabel('B').endAngle);
        expect(byLabel('A1').fraction).toBeCloseTo(0.3);
    });

    it('colours a descendant from the family of its first ancestor', () => {
        const arcs = layoutSunburst(tree, opts);

        expect(arcs.filter((a) => a.node.label.startsWith('B')).every((a) => a.groupIndex === 1)).toBe(true);
        expect(arcs.filter((a) => a.node.label.startsWith('A')).every((a) => a.groupIndex === 0)).toBe(true);
    });

    it('can start anywhere, cover part of a circle, stop at a depth and leave a gap between rings', () => {
        const half = layoutSunburst(tree, { ...opts, startAngle: -90, sweepAngle: 180 });

        expect(Math.min(...half.map((a) => a.startAngle))).toBe(-90);
        expect(Math.max(...half.map((a) => a.endAngle))).toBeCloseTo(90);

        const shallow = layoutSunburst(tree, { ...opts, maxDepth: 2 });

        expect(Math.max(...shallow.map((a) => a.depth))).toBe(1);
        expect(shallow.find((a) => a.depth === 0)!.outerRadius).toBe(80);

        const gapped = layoutSunburst(tree, { ...opts, ringGap: 4 });

        expect(gapped.find((a) => a.depth === 0)!.outerRadius).toBe(58);
        expect(gapped.find((a) => a.depth === 1)!.innerRadius).toBe(62);
    });

    it('leaves out what has no value, and returns nothing for nothing', () => {
        expect(layoutSunburst([leaf('x', 0, 0), leaf('y', 5, 1)], opts).map((a) => a.node.label)).toEqual(['y']);
        expect(layoutSunburst([], opts)).toEqual([]);
        expect(layoutSunburst(tree, { ...opts, outerRadius: 10 })).toEqual([]);
    });

    it('reads a hierarchy built from a flat list', () => {
        const flat = buildHierarchy([
            { label: 'root', value: 0, dataIndex: 0, nodeId: 'r' },
            { label: 'kid', value: 5, dataIndex: 1, nodeId: 'k', parentId: 'r' },
            { label: 'kid2', value: 15, dataIndex: 2, nodeId: 'k2', parentId: 'r' }
        ]);

        expect(layoutSunburst(flat, opts).map((a) => a.node.label)).toEqual(['root', 'kid', 'kid2']);
    });
});

describe('insideArc', () => {
    const [a] = layoutSunburst([leaf('x', 1, 0), leaf('y', 1, 1)], { ...opts, startAngle: 0 });

    it('tests the ring and the angle, wrapping through 360', () => {
        // the first of two arcs covers 0 to 180 degrees: the lower half, since angles run clockwise from three o'clock
        expect(insideArc(a, 100, 100, 100, 100 + 80)).toBe(true);
        expect(insideArc(a, 100, 100, 100, 100 - 80)).toBe(false);
        expect(insideArc(a, 100, 100, 100, 100 + 5)).toBe(false); // in the hole
        expect(insideArc(a, 100, 100, 100, 100 + 200)).toBe(false); // outside
        const [wrap] = layoutSunburst([leaf('z', 1, 0), leaf('w', 3, 1)], { ...opts, startAngle: 300 });

        expect(insideArc(wrap, 0, 0, 80, 0)).toBe(true); // 0 degrees is inside 300 to 390
    });
});

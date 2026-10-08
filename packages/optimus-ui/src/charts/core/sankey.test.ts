import { describe, expect, it } from 'vitest';
import { layoutSankey, linkPath, onLink } from './sankey';

const box = { x: 0, y: 0, width: 400, height: 200 };
const energy = [
    { source: 'Coal', target: 'Power', value: 40 },
    { source: 'Gas', target: 'Power', value: 30 },
    { source: 'Wind', target: 'Power', value: 30 },
    { source: 'Power', target: 'Homes', value: 50 },
    { source: 'Power', target: 'Industry', value: 40 },
    { source: 'Power', target: 'Loss', value: 10 }
];

describe('layoutSankey', () => {
    it('puts each node in a column after the nodes that feed it', () => {
        const { nodes } = layoutSankey(energy, box);
        const layer = (id: string) => nodes.find((n) => n.id === id)!.layer;

        expect([layer('Coal'), layer('Gas'), layer('Wind')]).toEqual([0, 0, 0]);
        expect(layer('Power')).toBe(1);
        expect([layer('Homes'), layer('Industry'), layer('Loss')]).toEqual([2, 2, 2]);
    });

    it('makes a node as tall as the flow through it, on one scale for all', () => {
        const { nodes } = layoutSankey(energy, box);
        const height = (id: string) => {
            const n = nodes.find((x) => x.id === id)!;

            return n.y1 - n.y0;
        };

        expect(height('Power') / height('Coal')).toBeCloseTo(100 / 40);
        expect(height('Homes') / height('Loss')).toBeCloseTo(5);
        expect(nodes.find((n) => n.id === 'Power')!.value).toBe(100);
    });

    it('keeps nodes of a column apart and inside the box', () => {
        const { nodes } = layoutSankey(energy, { ...box, nodePadding: 12 });

        for (const layer of [0, 1, 2]) {
            const col = nodes.filter((n) => n.layer === layer).sort((a, b) => a.y0 - b.y0);

            col.forEach((n, i) => {
                expect(n.y0).toBeGreaterThanOrEqual(-1e-6);
                expect(n.y1).toBeLessThanOrEqual(200 + 1e-6);

                if (i) expect(n.y0 - col[i - 1].y1).toBeGreaterThanOrEqual(12 - 1e-6);
            });
        }
    });

    it('lays the columns across the width, the last ending at its edge', () => {
        const { nodes } = layoutSankey(energy, { ...box, nodeWidth: 20 });

        expect(Math.min(...nodes.map((n) => n.x0))).toBe(0);
        expect(Math.max(...nodes.map((n) => n.x1))).toBe(400);
        expect(nodes.find((n) => n.id === 'Power')!.x0).toBe(190);
    });

    it('stacks the links of a node without overlap, as thick as their value, from its top to its bottom', () => {
        const { nodes, links } = layoutSankey(energy, box);
        const power = nodes.find((n) => n.id === 'Power')!;
        const out = links.filter((l) => l.source === power).sort((a, b) => a.sourceY - b.sourceY);

        expect(out.reduce((s, l) => s + l.width, 0)).toBeCloseTo(power.y1 - power.y0);
        expect(out[0].sourceY - out[0].width / 2).toBeCloseTo(power.y0);
        out.forEach((l, i) => i && expect(l.sourceY - l.width / 2).toBeCloseTo(out[i - 1].sourceY + out[i - 1].width / 2));
        expect(links[3].width / links[5].width).toBeCloseTo(5);
    });

    it('leaves out a link that closes a loop, one to itself, and one with no value, and says so', () => {
        const { links, skipped, nodes } = layoutSankey(
            [
                { source: 'a', target: 'b', value: 5 },
                { source: 'b', target: 'c', value: 5 },
                { source: 'c', target: 'a', value: 5 },
                { source: 'a', target: 'a', value: 1 },
                { source: 'a', target: 'c', value: 0 },
                { source: 'a', target: 'c', value: -3 }
            ],
            box
        );

        expect(links).toHaveLength(2);
        expect(skipped.map((s) => s.reason)).toEqual(['loop', 'self', 'value', 'value']);
        expect(nodes.map((n) => n.id)).toEqual(['a', 'b', 'c']);
    });

    it('can keep a node with no outflow in the column it first reaches', () => {
        const flows = [
            { source: 'a', target: 'b', value: 5 },
            { source: 'b', target: 'c', value: 5 },
            { source: 'a', target: 'd', value: 2 }
        ];
        const justified = layoutSankey(flows, box).nodes.find((n) => n.id === 'd')!;
        const left = layoutSankey(flows, { ...box, align: 'left' }).nodes.find((n) => n.id === 'd')!;

        expect(justified.layer).toBe(2);
        expect(left.layer).toBe(1);
    });

    it('returns nothing for nothing', () => {
        expect(layoutSankey([], box)).toEqual({ nodes: [], links: [], skipped: [] });
    });
});

describe('links as curves', () => {
    it('are drawn from the right of the source to the left of the target', () => {
        const { links } = layoutSankey(energy, box);
        const d = linkPath(links[0]);

        expect(d.startsWith(`M${links[0].source.x1} `)).toBe(true);
        expect(d).toContain(`${links[0].target.x0} ${Math.round(links[0].targetY * 100) / 100}`);
    });

    it('are hit within half their thickness of the curve', () => {
        const { links } = layoutSankey(energy, box);
        const l = links[3];

        expect(onLink(l, l.source.x1 + 1, l.sourceY)).toBe(true);
        expect(onLink(l, l.source.x1 + 1, l.sourceY + l.width)).toBe(false);
        expect(onLink(l, l.source.x1 - 5, l.sourceY)).toBe(false);
        expect(onLink(l, (l.source.x1 + l.target.x0) / 2, (l.sourceY + l.targetY) / 2)).toBe(true);
    });
});

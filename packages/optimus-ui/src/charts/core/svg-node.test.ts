import { describe, expect, it } from 'vitest';
import { createSvgChildrenState, svgNode, svgNodeEqual, syncSvgChildren } from './svg-node';

const rect = (x: number) => svgNode('rect', { x, width: 4 });

describe('svgNodeEqual', () => {
    it('compares tag, attributes and children', () => {
        expect(svgNodeEqual(svgNode('g', { a: 1 }, [rect(1)]), svgNode('g', { a: 1 }, [rect(1)]))).toBe(true);
        expect(svgNodeEqual(svgNode('g', { a: 1 }, [rect(1)]), svgNode('g', { a: 1 }, [rect(2)]))).toBe(false);
        expect(svgNodeEqual(svgNode('g', { a: 1 }), svgNode('g', { a: 1, b: 2 }))).toBe(false);
        expect(svgNodeEqual(svgNode('text', {}, ['a']), svgNode('text', {}, ['b']))).toBe(false);
    });
});

describe('syncSvgChildren', () => {
    const parent = () => document.createElementNS('http://www.w3.org/2000/svg', 'g');

    it('keeps the elements of nodes that did not change and replaces the others', () => {
        const host = parent();
        const state = createSvgChildrenState();
        const shared = rect(1);

        syncSvgChildren(host, [shared, rect(2), rect(3)], document, state);

        const [a, b, c] = Array.from(host.children);

        syncSvgChildren(host, [shared, rect(2), rect(9)], document, state);

        expect(host.children[0]).toBe(a);
        expect(host.children[1]).toBe(b);
        expect(host.children[2]).not.toBe(c);
        expect(host.children[2].getAttribute('x')).toBe('9');
        expect(host.children.length).toBe(3);
    });

    it('follows a node that moved, and drops the ones that went away', () => {
        const host = parent();
        const state = createSvgChildrenState();
        const first = rect(1);
        const second = rect(2);

        syncSvgChildren(host, [first, second], document, state);

        const [a, b] = Array.from(host.children);

        syncSvgChildren(host, [second], document, state);
        expect(Array.from(host.children)).toEqual([b]);

        syncSvgChildren(host, [second, first, rect(5)], document, state);
        expect(host.children[0]).toBe(b);
        expect(host.children[1]).not.toBe(a);
        expect(host.children.length).toBe(3);
    });
});

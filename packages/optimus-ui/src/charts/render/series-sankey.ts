/**
 * The Sankey painter.
 *
 * Each datum is one flow, from a named source to a named target. Nodes are the names that appear, in columns after the nodes that
 * feed them, as tall as the flow through them; flows are curves as thick as their value. Hidden items are left out and the rest
 * re-share the height, so the legend and hover behave as for the other part-to-whole charts.
 */
import type { SankeySeriesProps, SvgNode } from '@openng/optimus-ui/types/charts';
import { readPath } from '../core/accessor';
import { layoutSankey, linkPath, onLink, type SankeyLayout, type SankeyLink, type SankeyLinkInput } from '../core/sankey';
import type { ResolvedSeries } from '../charts-state';
import { isHovered, markOpacity, slotGroup, type DrawContext } from './scene';

/** Lays out a Sankey series. A flow keeps its position in the data in `index`. */
export function projectSankey(ctx: DrawContext, series: ResolvedSeries, props: SankeySeriesProps): SankeyLayout {
    const data = (props.data as Record<string, unknown>[] | undefined) ?? [];
    const sourceField = props.sourceField ?? 'source';
    const targetField = props.targetField ?? 'target';
    const valueField = typeof props.valueField === 'string' ? props.valueField : 'value';
    const flows: SankeyLinkInput[] = [];
    const dataIndexes: number[] = [];

    data.forEach((datum, dataIndex) => {
        if (!ctx.isItemVisible(series.id, dataIndex)) return;

        const value = Number(readPath(datum, valueField));

        flows.push({ source: String(readPath(datum, sourceField) ?? ''), target: String(readPath(datum, targetField) ?? ''), value });
        dataIndexes.push(dataIndex);
    });

    const area = ctx.area;
    // Room on the right for the names of the last column, and on the left for the first.
    const margin = props.showLabels === false ? 0 : 80;
    const layout = layoutSankey(flows, {
        x: area.x + margin,
        y: area.y,
        width: Math.max(area.width - margin * 2, 40),
        height: area.height,
        nodeWidth: props.nodeWidth,
        nodePadding: props.nodePadding,
        iterations: props.iterations,
        align: props.align
    });

    // Back from the position among the visible flows to the position in the data.
    return { ...layout, links: layout.links.map((link) => ({ ...link, index: dataIndexes[link.index] })) };
}

/** The flow under a point, if any. */
export function hitTestSankey(ctx: DrawContext, series: ResolvedSeries, props: SankeySeriesProps, x: number, y: number, layout?: SankeyLayout): SankeyLink | null {
    const { links } = layout ?? projectSankey(ctx, series, props);

    for (let i = links.length - 1; i >= 0; i--) if (onLink(links[i], x, y)) return links[i];

    return null;
}

/** Paints a Sankey diagram. */
export function paintSankeySeries(ctx: DrawContext, series: ResolvedSeries, props: SankeySeriesProps): SvgNode[] {
    const { nodes, links } = projectSankey(ctx, series, props);

    if (!nodes.length) return [];

    const colorOf = (id: string, index: number) => props.nodeColors?.[id] ?? ctx.seriesColor(index);
    const mode = props.linkColor ?? 'gradient';
    const opacity = props.linkOpacity ?? 0.4;
    const defs: SvgNode[] = [];
    const linkNodes: SvgNode[] = links.map((link) => {
        const hovered = isHovered(ctx, series.id, link.index);
        const from = colorOf(link.source.id, link.source.index);
        const to = colorOf(link.target.id, link.target.index);
        let stroke = mode === 'target' ? to : from;

        if (mode === 'gradient') {
            const id = `${series.id}-sankey-${link.index}`;

            defs.push({
                tag: 'linearGradient',
                attrs: { id, gradientUnits: 'userSpaceOnUse', x1: link.source.x1, x2: link.target.x0, y1: 0, y2: 0 },
                children: [
                    { tag: 'stop', attrs: { offset: '0%', 'stop-color': from }, children: [] },
                    { tag: 'stop', attrs: { offset: '100%', 'stop-color': to }, children: [] }
                ]
            });
            stroke = `url(#${id})`;
        }

        return {
            tag: 'path',
            attrs: {
                class: `p-chart-sankey-link${hovered ? ' p-chart-point-hover' : ''}`,
                'data-slot': 'chart-sankey-link',
                'data-series': series.id,
                'data-index': link.index,
                'data-source': link.source.id,
                'data-target': link.target.id,
                'data-state': hovered ? 'hovered' : null,
                d: linkPath(link),
                fill: 'none',
                stroke,
                'stroke-width': Math.max(link.width, 1),
                'stroke-opacity': hovered ? Math.min(opacity + 0.3, 1) : opacity,
                opacity: markOpacity(ctx, series.id, link.index)
            },
            children: []
        } satisfies SvgNode;
    });

    const nodeNodes: SvgNode[] = nodes.map((node) => ({
        tag: 'rect',
        attrs: {
            class: 'p-chart-sankey-node',
            'data-slot': 'chart-sankey-node',
            'data-series': series.id,
            'data-node': node.id,
            x: node.x0,
            y: node.y0,
            width: node.x1 - node.x0,
            height: Math.max(node.y1 - node.y0, 1),
            fill: colorOf(node.id, node.index)
        },
        children: []
    }));

    const last = Math.max(...nodes.map((n) => n.layer));
    const size = Math.max(ctx.fontSize - 1, 10);
    const labels: SvgNode[] =
        props.showLabels === false
            ? []
            : nodes.map((node) => {
                  // Names go to the right of a node, except in the last column, where there is no room and they go to the left.
                  const left = node.layer === last && last > 0;

                  return {
                      tag: 'text',
                      attrs: {
                          class: 'p-chart-sankey-label',
                          'data-slot': 'chart-sankey-label',
                          x: left ? node.x0 - 6 : node.x1 + 6,
                          y: (node.y0 + node.y1) / 2,
                          fill: props.labelColor ?? null,
                          'font-size': size,
                          'font-family': ctx.fontFamily,
                          'text-anchor': left ? 'end' : 'start',
                          'dominant-baseline': 'central',
                          'pointer-events': 'none'
                      },
                      children: [node.id]
                  } satisfies SvgNode;
              });

    return [
        slotGroup('chart-series', { class: 'p-chart-series p-chart-series-sankey', 'data-series': series.id, 'data-series-type': 'sankey' }, [
            ...(defs.length ? [{ tag: 'defs', attrs: {}, children: defs } satisfies SvgNode] : []),
            ...linkNodes,
            ...nodeNodes,
            ...labels
        ])
    ];
}

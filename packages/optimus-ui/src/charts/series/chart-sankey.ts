/**
 * ChartSankey: flows between nodes.
 */
import { ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, booleanAttribute, computed, inject, input, numberAttribute } from '@angular/core';
import type { FieldAccessor, SankeySeriesProps } from '@openng/optimus-ui/types/charts';
import { CHART_CONTEXT, CHART_ITEM_HOST, nextDatasetId } from '../charts-registry';
import { createItemRegistry } from './chart-items';

/**
 * A Sankey series. Each datum is one flow, with a source, a target and a value. The nodes are the names that appear.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-sankey',
    standalone: true,
    template: '<ng-content />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { style: 'display: none' },
    providers: [{ provide: CHART_ITEM_HOST, useExisting: ChartSankey }]
})
export class ChartSankey<T = unknown> {
    private readonly context = inject(CHART_CONTEXT, { optional: true });

    private readonly destroyRef = inject(DestroyRef);

    /** Inline `ChartItem` children, which stand in for a `data` array. */
    protected readonly items = createItemRegistry();

    /** @internal Registers an inline item. Called through `CHART_ITEM_HOST`. */
    readonly registerItem = this.items.registerItem;

    /**
     * Data array, one flow per row. Mutually exclusive with `ChartItem` children.
     * @group Props
     */
    readonly data = input<T[] | undefined>(undefined);
    /**
     * Field holding the name of the node a flow leaves.
     * @defaultValue 'source'
     * @group Props
     */
    readonly sourceField = input('source');
    /**
     * Field holding the name of the node a flow reaches.
     * @defaultValue 'target'
     * @group Props
     */
    readonly targetField = input('target');
    /**
     * Field holding the size of the flow.
     * @defaultValue 'value'
     * @group Props
     */
    readonly valueField = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Colours of the nodes, by node name. A node with none takes the next colour of the palette.
     * @group Props
     */
    readonly nodeColors = input<Record<string, string> | undefined>(undefined);
    /**
     * Width of the node bars, in pixels.
     * @defaultValue 14
     * @group Props
     */
    readonly nodeWidth = input(14, { transform: numberAttribute });
    /**
     * Space between the nodes of a column, in pixels.
     * @defaultValue 10
     * @group Props
     */
    readonly nodePadding = input(10, { transform: numberAttribute });
    /**
     * Passes that move nodes towards the nodes they are linked to.
     * @defaultValue 8
     * @group Props
     */
    readonly iterations = input(8, { transform: numberAttribute });
    /**
     * `justify` puts a node with no outgoing flow in the last column; `left` keeps it where it first appears.
     * @defaultValue 'justify'
     * @group Props
     */
    readonly align = input<'justify' | 'left'>('justify');
    /**
     * What colours a flow: the node it leaves, the node it reaches, or a gradient between the two.
     * @defaultValue 'gradient'
     * @group Props
     */
    readonly linkColor = input<'source' | 'target' | 'gradient'>('gradient');
    /**
     * Fill opacity of the flows, from 0 to 1.
     * @defaultValue 0.4
     * @group Props
     */
    readonly linkOpacity = input(0.4, { transform: numberAttribute });
    /**
     * Writes the name of each node.
     * @defaultValue true
     * @group Props
     */
    readonly showLabels = input(true, { transform: booleanAttribute });
    /**
     * Colour of the labels.
     * @group Props
     */
    readonly labelColor = input<string | undefined>(undefined);
    /**
     * Series name, used in the tooltip.
     * @group Props
     */
    readonly name = input<string | undefined>(undefined);
    /**
     * Field that identifies a datum across updates.
     * @group Props
     */
    readonly keyField = input<string | undefined>(undefined);
    /**
     * Unique dataset identifier. Generated when unset.
     * @group Props
     */
    readonly id = input<string | undefined>(undefined);

    /** The dataset id, generated once so it survives every input change. */
    readonly datasetId = this.id() ?? nextDatasetId('sankey');

    /** The series' current inputs, as the root reads them. */
    readonly props = computed<SankeySeriesProps<T>>(() => ({
        data: this.data() ?? (this.items.data() as T[] | undefined),
        sourceField: this.sourceField(),
        targetField: this.targetField(),
        valueField: this.valueField(),
        nodeColors: this.nodeColors(),
        nodeWidth: this.nodeWidth(),
        nodePadding: this.nodePadding(),
        iterations: this.iterations(),
        align: this.align(),
        linkColor: this.linkColor(),
        linkOpacity: this.linkOpacity(),
        showLabels: this.showLabels(),
        labelColor: this.labelColor(),
        name: this.name(),
        keyField: this.keyField(),
        id: this.datasetId
    }));

    constructor() {
        if (!this.context) return;

        const remove = this.context.registerSeries({
            id: this.datasetId,
            type: 'sankey',
            props: this.props as never,
            seriesIndex: computed(() => this.context!.series().findIndex((entry) => entry.id === this.datasetId))
        });

        this.destroyRef.onDestroy(remove);
    }
}

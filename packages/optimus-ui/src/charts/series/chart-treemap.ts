/**
 * ChartTreemap: nested rectangles sized by value.
 *
 * A treemap has no axes at all -- position carries nothing and area carries the value -- which makes
 * the tiling algorithm the whole of the geometry.
 */
import { ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, booleanAttribute, computed, contentChild, inject, input, numberAttribute } from '@angular/core';
import type { DashAccessor, FieldAccessor, FillValue, TreemapCellContext, TreemapLevelConfig, TreemapSeriesProps } from '@openng/optimus-ui/types/charts';
import { CHART_CONTEXT, nextDatasetId } from '../charts-registry';
import { ChartTreemapCellDef } from '../features/chart-defs';

/**
 * A treemap series.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-treemap',
    standalone: true,
    template: '<ng-content />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { style: 'display: none' }
})
export class ChartTreemap<T = unknown> {
    private readonly context = inject(CHART_CONTEXT, { optional: true });

    private readonly destroyRef = inject(DestroyRef);

    /** A projected template that replaces the content of each cell. */
    readonly cellDef = contentChild(ChartTreemapCellDef);

    /**
     * Data array. Mutually exclusive with `ChartTreemapGroup` and `ChartItem` children.
     * @group Props
     */
    readonly data = input<T[] | undefined>(undefined);
    /**
     * Field name for the cell display label.
     * @defaultValue 'category'
     * @group Props
     */
    readonly categoryField = input<string | undefined>(undefined);
    /**
     * Field name for the numeric value that determines the cell area.
     * @defaultValue 'value'
     * @group Props
     */
    readonly valueField = input<string | undefined>(undefined);
    /**
     * Field name holding each item's own unique id. Pair it with `parentField` for a flat
     * adjacency-list hierarchy; without both, the data is read as a flat list.
     * @group Props
     */
    readonly nodeId = input<string | undefined>(undefined);
    /**
     * Field name holding each item's parent id.
     * @group Props
     */
    readonly parentField = input<string | undefined>(undefined);
    /**
     * Cell fill colour. An array cycles by group index.
     * @group Props
     */
    readonly color = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Cell fill opacity, from 0 to 1.
     * @defaultValue 1
     * @group Props
     */
    readonly opacity = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Field name for the numeric value that maps cells onto a colour gradient.
     * @group Props
     */
    readonly colorValueField = input<string | undefined>(undefined);
    /**
     * Multi-stop colour array. Without `colorScale`, the breakpoints come from the data extremes.
     * @group Props
     */
    readonly colorRange = input<string[] | undefined>(undefined);
    /**
     * Explicit breakpoints for the colour interpolation, one per `colorRange` stop.
     * @group Props
     */
    readonly colorScale = input<number[] | undefined>(undefined);
    /**
     * Cell border stroke colour.
     * @group Props
     */
    readonly borderColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Cell border stroke width in pixels.
     * @group Props
     */
    readonly borderStrokeWidth = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Cell border dash pattern. Also accepts the named shortcuts.
     * @group Props
     */
    readonly borderDash = input<DashAccessor<T> | undefined>(undefined);
    /**
     * Cell border dash phase offset.
     * @group Props
     */
    readonly borderDashOffset = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Label text colour. Defaults to whichever of dark or light reads against the cell fill.
     * @group Props
     */
    readonly labelColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Per-cell fill colour on hover.
     * @group Props
     */
    readonly hoverColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Per-cell border colour on hover.
     * @group Props
     */
    readonly hoverBorderColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Tiling algorithm. `squarify` keeps cells near square, which is what makes their areas
     * comparable; `slice` and `dice` cut along one axis only.
     * @defaultValue 'squarify'
     * @group Props
     */
    readonly layout = input<'squarify' | 'slice' | 'dice' | 'sliceDice'>('squarify');
    /**
     * Gap between sibling cells in pixels.
     * @defaultValue 2
     * @group Props
     */
    readonly spacing = input(2, { transform: numberAttribute });
    /**
     * Padding around parent container regions, in pixels.
     * @defaultValue 3
     * @group Props
     */
    readonly groupPadding = input(3, { transform: numberAttribute });
    /**
     * Per-depth styling overrides.
     * @group Props
     */
    readonly levels = input<TreemapLevelConfig[] | undefined>(undefined);
    /**
     * Corner radius of the cells, in pixels.
     * @defaultValue 2
     * @group Props
     */
    readonly borderRadius = input(2, { transform: numberAttribute });
    /**
     * Minimum cell dimension, in pixels, for the label to be drawn at all. A label clipped to a
     * cell too small for it is a fragment of a word, which is worse than no label.
     * @defaultValue 30
     * @group Props
     */
    readonly labelMinSize = input(30, { transform: numberAttribute });
    /**
     * Show the parent header labels. On by default once `parentField` is set.
     * @group Props
     */
    readonly showGroupLabel = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
    /**
     * Height of the parent header labels, in pixels.
     * @defaultValue 18
     * @group Props
     */
    readonly groupLabelHeight = input(18, { transform: numberAttribute });
    /**
     * Enable click-to-drill navigation into the parent groups.
     * @defaultValue false
     * @group Props
     */
    readonly drilldown = input(false, { transform: booleanAttribute });
    /**
     * `'nested'` keeps parent headers visible with children inside; `'flat'` draws parents as solid
     * cells you click to drill into.
     * @defaultValue 'nested'
     * @group Props
     */
    readonly drilldownMode = input<'nested' | 'flat'>('nested');
    /**
     * Top-level breadcrumb label.
     * @group Props
     */
    readonly rootLabel = input<string | undefined>(undefined);
    /**
     * In nested mode, hovering a leaf's label reports the leaf while hovering its background reports
     * the parent.
     * @defaultValue true
     * @group Props
     */
    readonly interactByLeaf = input(true, { transform: booleanAttribute });
    /**
     * Custom cell content renderer.
     * @group Props
     */
    readonly renderContent = input<((context: TreemapCellContext<T>) => unknown) | undefined>(undefined);
    /**
     * Dataset label, used in the tooltip.
     * @group Props
     */
    readonly name = input<string | undefined>(undefined);
    /**
     * Unique dataset identifier. Generated when unset.
     * @group Props
     */
    readonly id = input<string | undefined>(undefined);
    /**
     * Rendering z-order.
     * @group Props
     */
    readonly order = input<number | undefined, unknown>(undefined, { transform: optionalNumber });

    /** The dataset id, generated once so it survives every input change. */
    readonly datasetId = this.id() ?? nextDatasetId('treemap');

    /** The series' current inputs, as the root reads them. */
    readonly props = computed<TreemapSeriesProps<T>>(() => ({
        data: this.data(),
        categoryField: this.categoryField(),
        valueField: this.valueField(),
        nodeId: this.nodeId(),
        parentField: this.parentField(),
        color: this.color(),
        opacity: this.opacity(),
        colorValueField: this.colorValueField(),
        colorRange: this.colorRange(),
        colorScale: this.colorScale(),
        borderColor: this.borderColor(),
        borderStrokeWidth: this.borderStrokeWidth(),
        borderDash: this.borderDash(),
        borderDashOffset: this.borderDashOffset(),
        labelColor: this.labelColor(),
        hoverColor: this.hoverColor(),
        hoverBorderColor: this.hoverBorderColor(),
        layout: this.layout(),
        spacing: this.spacing(),
        groupPadding: this.groupPadding(),
        levels: this.levels(),
        borderRadius: this.borderRadius(),
        labelMinSize: this.labelMinSize(),
        showGroupLabel: this.showGroupLabel(),
        groupLabelHeight: this.groupLabelHeight(),
        drilldown: this.drilldown(),
        drilldownMode: this.drilldownMode(),
        rootLabel: this.rootLabel(),
        interactByLeaf: this.interactByLeaf(),
        renderContent: this.renderContent(),
        name: this.name(),
        id: this.datasetId,
        order: this.order()
    }));

    constructor() {
        if (!this.context) return;

        const remove = this.context.registerSeries({
            id: this.datasetId,
            type: 'treemap',
            props: this.props as never,
            seriesIndex: computed(() => this.context!.series().findIndex((entry) => entry.id === this.datasetId))
        });

        this.destroyRef.onDestroy(remove);
    }
}

/** Accepts a numeric input while letting `undefined` stay `undefined`. */
function optionalNumber(value: unknown): number | undefined {
    if (value == null || value === '') return undefined;

    const parsed = numberAttribute(value);

    return Number.isFinite(parsed) ? parsed : undefined;
}

/** Accepts a boolean input while letting `undefined` stay `undefined`, so a per-type default can win. */
function optionalBoolean(value: unknown): boolean | undefined {
    if (value == null || value === '') return undefined;

    return booleanAttribute(value);
}

/**
 * ChartSunburst: a hierarchy as rings of arcs.
 */
import { ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, booleanAttribute, computed, inject, input, numberAttribute } from '@angular/core';
import type { FieldAccessor, FillValue, SunburstSeriesProps } from '@openng/optimus-ui/types/charts';
import { CHART_CONTEXT, CHART_ITEM_HOST, nextDatasetId } from '../charts-registry';
import { createItemRegistry } from './chart-items';

/**
 * A sunburst series. The hierarchy is a flat list that names the parent of each node, with `nodeId` and `parentField`, or the same
 * data as a treemap takes.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-sunburst',
    standalone: true,
    template: '<ng-content />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { style: 'display: none' },
    providers: [{ provide: CHART_ITEM_HOST, useExisting: ChartSunburst }]
})
export class ChartSunburst<T = unknown> {
    private readonly context = inject(CHART_CONTEXT, { optional: true });

    private readonly destroyRef = inject(DestroyRef);

    /** Inline `ChartItem` children, which stand in for a `data` array. */
    protected readonly items = createItemRegistry();

    /** @internal Registers an inline item. Called through `CHART_ITEM_HOST`. */
    readonly registerItem = this.items.registerItem;

    /**
     * Data array. Mutually exclusive with `ChartItem` children.
     * @group Props
     */
    readonly data = input<T[] | undefined>(undefined);
    /**
     * Numeric value field. A node with children takes the sum of theirs.
     * @defaultValue 'value'
     * @group Props
     */
    readonly valueField = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Label field.
     * @defaultValue 'category'
     * @group Props
     */
    readonly categoryField = input<FieldAccessor<T, string> | undefined>(undefined);
    /**
     * Field holding the id of a node, for a flat list.
     * @group Props
     */
    readonly nodeId = input<string | undefined>(undefined);
    /**
     * Field holding the id of the parent of a node, for a flat list.
     * @group Props
     */
    readonly parentField = input<string | undefined>(undefined);
    /**
     * Per-node colors. By default a node takes the color of its first ancestor, paler for each generation.
     * @group Props
     */
    readonly color = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Per-node fill opacity, from 0 to 1.
     * @group Props
     */
    readonly opacity = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * The hole in the middle, as a share of the outer radius.
     * @defaultValue 0.15
     * @group Props
     */
    readonly innerRadius = input(0.15, { transform: numberAttribute });
    /**
     * Outer radius as a share of the available space.
     * @defaultValue 1
     * @group Props
     */
    readonly outerRadius = input(1, { transform: numberAttribute });
    /**
     * Where the first arc begins, in degrees. -90 is twelve o'clock.
     * @defaultValue -90
     * @group Props
     */
    readonly startAngle = input(-90, { transform: numberAttribute });
    /**
     * Angle the arcs cover, in degrees.
     * @defaultValue 360
     * @group Props
     */
    readonly sweepAngle = input(360, { transform: numberAttribute });
    /**
     * Space between arcs, in pixels.
     * @defaultValue 1
     * @group Props
     */
    readonly spacing = input(1, { transform: numberAttribute });
    /**
     * Space between rings, in pixels.
     * @defaultValue 0
     * @group Props
     */
    readonly ringGap = input(0, { transform: numberAttribute });
    /**
     * Generations drawn, from 1. Omitted, all of them.
     * @group Props
     */
    readonly maxDepth = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Writes the name of each arc that has room for it.
     * @defaultValue true
     * @group Props
     */
    readonly showLabels = input(true, { transform: booleanAttribute });
    /**
     * Color of the labels. Defaults to whichever of dark and light reads on the arc.
     * @group Props
     */
    readonly labelColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Arc border stroke colour.
     * @group Props
     */
    readonly borderColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Arc border stroke width in pixels.
     * @group Props
     */
    readonly borderStrokeWidth = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Per-arc fill colour on hover.
     * @group Props
     */
    readonly hoverColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Per-arc border colour on hover.
     * @group Props
     */
    readonly hoverBorderColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
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
    readonly datasetId = this.id() ?? nextDatasetId('sunburst');

    /** The series' current inputs, as the root reads them. */
    readonly props = computed<SunburstSeriesProps<T>>(() => ({
        data: this.data() ?? (this.items.data() as T[] | undefined),
        valueField: this.valueField(),
        categoryField: this.categoryField(),
        nodeId: this.nodeId(),
        parentField: this.parentField(),
        color: this.color() ?? this.items.overrides().color,
        opacity: this.opacity(),
        innerRadius: this.innerRadius(),
        outerRadius: this.outerRadius(),
        startAngle: this.startAngle(),
        sweepAngle: this.sweepAngle(),
        spacing: this.spacing(),
        ringGap: this.ringGap(),
        maxDepth: this.maxDepth(),
        showLabels: this.showLabels(),
        labelColor: this.labelColor(),
        borderColor: this.borderColor(),
        borderStrokeWidth: this.borderStrokeWidth(),
        hoverColor: this.hoverColor(),
        hoverBorderColor: this.hoverBorderColor(),
        name: this.name(),
        keyField: this.keyField(),
        id: this.datasetId
    }));

    constructor() {
        if (!this.context) return;

        const remove = this.context.registerSeries({
            id: this.datasetId,
            type: 'sunburst',
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

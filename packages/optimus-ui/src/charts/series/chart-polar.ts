/**
 * ChartPolar: radial bars proportional to value.
 *
 * As with radar, the concentric grid belongs to `ChartYAxis` rather than to the series.
 */
import { ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, computed, inject, input, numberAttribute } from '@angular/core';
import type { BorderRadius, DashAccessor, FieldAccessor, FillValue, PolarSeriesProps, SliceSortOrder } from '@openng/optimus-ui/types/charts';
import { CHART_CONTEXT, CHART_STACK, nextDatasetId } from '../charts-registry';

/**
 * A polar series. Without a `ChartStacked` wrapper, several polar series render side by side within
 * each sector.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-polar',
    standalone: true,
    template: '<ng-content />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { style: 'display: none' }
})
export class ChartPolar<T = unknown> {
    private readonly context = inject(CHART_CONTEXT, { optional: true });

    private readonly stack = inject(CHART_STACK, { optional: true });

    private readonly destroyRef = inject(DestroyRef);

    /**
     * Data array. Mutually exclusive with `ChartItem` children.
     * @group Props
     */
    readonly data = input<T[] | undefined>(undefined);
    /**
     * Category label for each angular sector.
     * @defaultValue 'category'
     * @group Props
     */
    readonly categoryXField = input<FieldAccessor<T, string> | undefined>(undefined);
    /**
     * Radial value field.
     * @defaultValue 'value'
     * @group Props
     */
    readonly valueYField = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Bar fill colour.
     * @group Props
     */
    readonly color = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Bar fill opacity, from 0 to 1.
     * @defaultValue 1
     * @group Props
     */
    readonly opacity = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Series name, used in the legend and the tooltip.
     * @group Props
     */
    readonly name = input<string | undefined>(undefined);
    /**
     * Field name giving each item a stable identity, used for animation matching.
     * @group Props
     */
    readonly keyField = input<string | undefined>(undefined);
    /**
     * Unique dataset identifier. Generated when unset.
     * @group Props
     */
    readonly id = input<string | undefined>(undefined);
    /**
     * Stacking order inside `ChartStacked`. 0 is the innermost.
     * @group Props
     */
    readonly order = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Hollow centre ratio, from 0 to 1. At 0 bars run from the centre.
     * @defaultValue 0
     * @group Props
     */
    readonly innerRadius = input(0, { transform: numberAttribute });
    /**
     * Gap between bars in pixels.
     * @defaultValue 8
     * @group Props
     */
    readonly spacing = input(8, { transform: numberAttribute });
    /**
     * Bar ordering applied before render.
     * @group Props
     */
    readonly sort = input<SliceSortOrder | undefined>(undefined);
    /**
     * Bar arc corner radius.
     * @group Props
     */
    readonly borderRadius = input<FieldAccessor<T, BorderRadius> | undefined>(undefined);
    /**
     * Bar border stroke colour.
     * @group Props
     */
    readonly borderColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Bar border stroke width in pixels.
     * @group Props
     */
    readonly borderStrokeWidth = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Dash pattern. Also accepts the named shortcuts.
     * @group Props
     */
    readonly borderDash = input<DashAccessor<T> | undefined>(undefined);
    /**
     * Offset into the dash pattern.
     * @group Props
     */
    readonly borderDashOffset = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Per-bar fill colour on hover.
     * @group Props
     */
    readonly hoverColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Per-bar border colour on hover.
     * @group Props
     */
    readonly hoverBorderColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);

    /** The dataset id, generated once so it survives every input change. */
    readonly datasetId = this.id() ?? nextDatasetId('polar');

    /** The series' current inputs, as the root reads them. */
    readonly props = computed<PolarSeriesProps<T>>(() => ({
        data: this.data(),
        categoryXField: this.categoryXField(),
        valueYField: this.valueYField(),
        color: this.color(),
        opacity: this.opacity(),
        name: this.name(),
        keyField: this.keyField(),
        id: this.datasetId,
        order: this.order(),
        innerRadius: this.innerRadius(),
        spacing: this.spacing(),
        sort: this.sort(),
        borderRadius: this.borderRadius(),
        borderColor: this.borderColor(),
        borderStrokeWidth: this.borderStrokeWidth(),
        borderDash: this.borderDash(),
        borderDashOffset: this.borderDashOffset(),
        hoverColor: this.hoverColor(),
        hoverBorderColor: this.hoverBorderColor()
    }));

    constructor() {
        if (!this.context) return;

        const remove = this.context.registerSeries({
            id: this.datasetId,
            type: 'polar',
            props: this.props as never,
            seriesIndex: computed(() => this.context!.series().findIndex((entry) => entry.id === this.datasetId)),
            stackId: this.stack?.id
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

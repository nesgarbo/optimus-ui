/**
 * ChartBoxplot: a box and whiskers for each category.
 *
 * It takes either the raw values of a category, from which it works the quartiles, whiskers and outliers out itself, or the five
 * numbers when they are already known.
 */
import { ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, booleanAttribute, computed, inject, input, numberAttribute } from '@angular/core';
import type { BorderRadius, BoxplotSeriesProps, FieldAccessor, FillValue } from '@openng/optimus-ui/types/charts';
import { CHART_CONTEXT, CHART_ITEM_HOST, nextDatasetId } from '../charts-registry';
import { createItemRegistry } from './chart-items';

/**
 * A box plot series.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-boxplot',
    standalone: true,
    template: '<ng-content />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { style: 'display: none' },
    providers: [{ provide: CHART_ITEM_HOST, useExisting: ChartBoxplot }]
})
export class ChartBoxplot<T = unknown> {
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
     * Category field for the x axis.
     * @group Props
     */
    readonly categoryXField = input<FieldAccessor<T, string> | undefined>(undefined);
    /**
     * A field holding the raw values of a category as an array. The quartiles, whiskers and outliers are worked out from them.
     * @defaultValue 'values'
     * @group Props
     */
    readonly valuesField = input<string | undefined>(undefined);
    /**
     * Field of the smallest value, when the numbers are already worked out.
     * @defaultValue 'min'
     * @group Props
     */
    readonly minField = input<string | undefined>(undefined);
    /**
     * Field of the first quartile.
     * @defaultValue 'q1'
     * @group Props
     */
    readonly q1Field = input<string | undefined>(undefined);
    /**
     * Field of the median.
     * @defaultValue 'median'
     * @group Props
     */
    readonly medianField = input<string | undefined>(undefined);
    /**
     * Field of the third quartile.
     * @defaultValue 'q3'
     * @group Props
     */
    readonly q3Field = input<string | undefined>(undefined);
    /**
     * Field of the largest value.
     * @defaultValue 'max'
     * @group Props
     */
    readonly maxField = input<string | undefined>(undefined);
    /**
     * Field of the mean.
     * @defaultValue 'mean'
     * @group Props
     */
    readonly meanField = input<string | undefined>(undefined);
    /**
     * A field holding the outliers as an array.
     * @defaultValue 'outliers'
     * @group Props
     */
    readonly outliersField = input<string | undefined>(undefined);
    /**
     * How the quartiles are found from raw values.
     * @defaultValue 'exclusive'
     * @group Props
     */
    readonly quartileMethod = input<'exclusive' | 'inclusive' | 'linear'>('exclusive');
    /**
     * How far the whiskers reach, in interquartile ranges, before a value is an outlier.
     * @defaultValue 1.5
     * @group Props
     */
    readonly whiskerReach = input(1.5, { transform: numberAttribute });
    /**
     * Width of a box as a share of its band.
     * @defaultValue 0.6
     * @group Props
     */
    readonly boxWidthRatio = input(0.6, { transform: numberAttribute });
    /**
     * Draws the mean as a marker.
     * @defaultValue false
     * @group Props
     */
    readonly showMean = input(false, { transform: booleanAttribute });
    /**
     * Draws the outliers.
     * @defaultValue true
     * @group Props
     */
    readonly showOutliers = input(true, { transform: booleanAttribute });
    /**
     * Per-box color.
     * @group Props
     */
    readonly color = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Fill opacity of the box, from 0 to 1.
     * @defaultValue 0.35
     * @group Props
     */
    readonly fillOpacity = input(0.35, { transform: numberAttribute });
    /**
     * Color of the median line. Defaults to the color of the box.
     * @group Props
     */
    readonly medianColor = input<FillValue | undefined>(undefined);
    /**
     * Border stroke width in pixels.
     * @group Props
     */
    readonly borderStrokeWidth = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Corner radius of the box.
     * @group Props
     */
    readonly borderRadius = input<FieldAccessor<T, BorderRadius> | undefined>(undefined);
    /**
     * Radius of an outlier or mean marker, in pixels.
     * @defaultValue 3
     * @group Props
     */
    readonly markerSize = input(3, { transform: numberAttribute });
    /**
     * Per-box fill colour on hover.
     * @group Props
     */
    readonly hoverColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Per-box border colour on hover.
     * @group Props
     */
    readonly hoverBorderColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Series name, used in the legend and the tooltip.
     * @group Props
     */
    readonly name = input<string | undefined>(undefined);
    /**
     * Unique dataset identifier. Generated when unset.
     * @group Props
     */
    readonly id = input<string | undefined>(undefined);
    /**
     * Bind to a specific x axis by id.
     * @group Props
     */
    readonly xAxisId = input<string | undefined>(undefined);
    /**
     * Bind to a specific y axis by id.
     * @group Props
     */
    readonly yAxisId = input<string | undefined>(undefined);
    /**
     * Rendering z-order.
     * @group Props
     */
    readonly order = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Field that identifies a datum across updates.
     * @group Props
     */
    readonly keyField = input<string | undefined>(undefined);

    /** The dataset id, generated once so it survives every input change. */
    readonly datasetId = this.id() ?? nextDatasetId('boxplot');

    /** The series' current inputs, as the root reads them. */
    readonly props = computed<BoxplotSeriesProps<T>>(() => ({
        data: this.data() ?? (this.items.data() as T[] | undefined),
        categoryXField: this.categoryXField(),
        valuesField: this.valuesField(),
        minField: this.minField(),
        q1Field: this.q1Field(),
        medianField: this.medianField(),
        q3Field: this.q3Field(),
        maxField: this.maxField(),
        meanField: this.meanField(),
        outliersField: this.outliersField(),
        quartileMethod: this.quartileMethod(),
        whiskerReach: this.whiskerReach(),
        boxWidthRatio: this.boxWidthRatio(),
        showMean: this.showMean(),
        showOutliers: this.showOutliers(),
        color: this.color() ?? this.items.overrides().color,
        fillOpacity: this.fillOpacity(),
        medianColor: this.medianColor(),
        borderStrokeWidth: this.borderStrokeWidth(),
        borderRadius: this.borderRadius(),
        markerSize: this.markerSize(),
        hoverColor: this.hoverColor(),
        hoverBorderColor: this.hoverBorderColor(),
        name: this.name(),
        id: this.datasetId,
        xAxisId: this.xAxisId(),
        yAxisId: this.yAxisId(),
        order: this.order(),
        keyField: this.keyField()
    }));

    constructor() {
        if (!this.context) return;

        const remove = this.context.registerSeries({
            id: this.datasetId,
            type: 'boxplot',
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

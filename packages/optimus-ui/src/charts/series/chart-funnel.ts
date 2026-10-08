/**
 * ChartFunnel: funnel and pyramid.
 *
 * One component for both, as `ChartPie` is for pie and donut: they differ in the outline the slices are cut from, and nothing else.
 * `p-chart-funnel` draws the funnel and `p-chart-pyramid` the pyramid.
 */
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, ViewEncapsulation, booleanAttribute, computed, inject, input, numberAttribute } from '@angular/core';
import type { BorderJoinStyle, DashAccessor, FieldAccessor, FillValue, FunnelSeriesProps, SliceSortOrder } from '@openng/optimus-ui/types/charts';
import { CHART_CONTEXT, CHART_ITEM_HOST, nextDatasetId } from '../charts-registry';
import { createItemRegistry } from './chart-items';

/**
 * A funnel or a pyramid series. Slices are stacked top to bottom in the order given, each as tall as its share of the values;
 * sort them `value-desc` for the usual funnel.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-funnel, p-chart-pyramid',
    standalone: true,
    template: '<ng-content />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { style: 'display: none' },
    providers: [{ provide: CHART_ITEM_HOST, useExisting: ChartFunnel }]
})
export class ChartFunnel<T = unknown> {
    private readonly context = inject(CHART_CONTEXT, { optional: true });

    private readonly destroyRef = inject(DestroyRef);

    /** `pyramid` when the element is `p-chart-pyramid`, `funnel` otherwise. */
    private readonly kind: 'funnel' | 'pyramid' = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.localName === 'p-chart-pyramid' ? 'pyramid' : 'funnel';

    /**
     * Inline `ChartItem` children, which stand in for a `data` array.
     */
    protected readonly items = createItemRegistry();

    /** @internal Registers an inline item. Called through `CHART_ITEM_HOST`. */
    readonly registerItem = this.items.registerItem;

    /**
     * Data array. Mutually exclusive with `ChartItem` children.
     * @group Props
     */
    readonly data = input<T[] | undefined>(undefined);
    /**
     * Numeric value field, which sets the height of a slice.
     * @defaultValue 'value'
     * @group Props
     */
    readonly valueField = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Slice label field.
     * @defaultValue 'category'
     * @group Props
     */
    readonly categoryField = input<FieldAccessor<T, string> | undefined>(undefined);
    /**
     * Per-slice colours.
     * @group Props
     */
    readonly color = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Per-slice fill opacity, from 0 to 1.
     * @defaultValue 1
     * @group Props
     */
    readonly opacity = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Width of the shape as a share of the plot area, from 0 to 1.
     * @defaultValue 0.9
     * @group Props
     */
    readonly widthRatio = input(0.9, { transform: numberAttribute });
    /**
     * Height of the shape as a share of the plot area, from 0 to 1.
     * @defaultValue 1
     * @group Props
     */
    readonly heightRatio = input(1, { transform: numberAttribute });
    /**
     * Width of the neck of a funnel as a share of its mouth.
     * @defaultValue 0.2
     * @group Props
     */
    readonly neckWidth = input(0.2, { transform: numberAttribute });
    /**
     * Height of the neck of a funnel as a share of the height.
     * @defaultValue 0.2
     * @group Props
     */
    readonly neckHeight = input(0.2, { transform: numberAttribute });
    /**
     * Space between slices, in pixels.
     * @defaultValue 2
     * @group Props
     */
    readonly gap = input(2, { transform: numberAttribute });
    /**
     * How a pyramid turns values into slices: by height, or by area.
     * @defaultValue 'linear'
     * @group Props
     */
    readonly mode = input<'linear' | 'surface'>('linear');
    /**
     * Turns a pyramid over, so that its point is at the bottom.
     * @defaultValue false
     * @group Props
     */
    readonly inverted = input(false, { transform: booleanAttribute });
    /**
     * Slice ordering applied before render.
     * @group Props
     */
    readonly sort = input<SliceSortOrder | undefined>(undefined);
    /**
     * Slice border stroke colour.
     * @group Props
     */
    readonly borderColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Slice border stroke width in pixels.
     * @group Props
     */
    readonly borderStrokeWidth = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Dash pattern.
     * @group Props
     */
    readonly borderDash = input<DashAccessor<T> | undefined>(undefined);
    /**
     * How border segments connect at slice corners.
     * @group Props
     */
    readonly borderJoinStyle = input<BorderJoinStyle | undefined>(undefined);
    /**
     * Per-slice fill colour on hover.
     * @group Props
     */
    readonly hoverColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Per-slice border colour on hover.
     * @group Props
     */
    readonly hoverBorderColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Dataset label, used in the legend.
     * @group Props
     */
    readonly name = input<string | undefined>(undefined);
    /**
     * Field name giving each item a stable identity.
     * @group Props
     */
    readonly keyField = input<string | undefined>(undefined);
    /**
     * Unique dataset identifier. Generated when unset.
     * @group Props
     */
    readonly id = input<string | undefined>(undefined);

    /** The dataset id, generated once so it survives every input change. */
    readonly datasetId = this.id() ?? nextDatasetId(this.kind);

    /** The series' current inputs, as the root reads them. */
    readonly props = computed<FunnelSeriesProps<T>>(() => ({
        data: this.data() ?? (this.items.data() as T[] | undefined),
        valueField: this.valueField(),
        categoryField: this.categoryField(),
        color: this.color() ?? this.items.overrides().color,
        opacity: this.opacity(),
        widthRatio: this.widthRatio(),
        heightRatio: this.heightRatio(),
        neckWidth: this.neckWidth(),
        neckHeight: this.neckHeight(),
        gap: this.gap(),
        mode: this.mode(),
        inverted: this.inverted(),
        sort: this.sort(),
        borderColor: this.borderColor(),
        borderStrokeWidth: this.borderStrokeWidth(),
        borderDash: this.borderDash(),
        borderJoinStyle: this.borderJoinStyle(),
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
            type: this.kind,
            props: this.props as never,
            seriesIndex: computed(() => this.context!.series().findIndex((entry) => entry.id === this.datasetId)),
            stackId: undefined
        });

        this.destroyRef.onDestroy(remove);
    }
}

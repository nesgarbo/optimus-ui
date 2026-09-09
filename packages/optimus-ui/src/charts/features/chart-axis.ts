/**
 * ChartXAxis and ChartYAxis.
 *
 * An axis does two things: it declares a scale for series to bind to, and it reserves the layout
 * space its labels need. The reservation is measured from the domain rather than from the scale,
 * because the scale is built from the plot area that the reservation itself determines -- measuring
 * from the domain is what breaks that loop.
 */
import { ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, booleanAttribute, computed, inject, input, numberAttribute } from '@angular/core';
import type { AxisTickMarkRenderContext, AxisTickRenderContext, AxisType, BaseAxisProps, DataGroupingConfig, DateTimeFormatConfig, TickStyle, TickValue, TimeTickConfig, TimeUnit } from '@openng/optimus-ui/types/charts';
import { formatTick } from '../render/axis';
import { generateTicks } from '../render/axis';
import { lineHeightOf, measureTextWidth, rotatedBounds } from '../core/layout';
import { CHART_CONTEXT } from '../charts-registry';

/** Inputs shared by the two axes. */
abstract class ChartAxisBase {
    protected readonly context = inject(CHART_CONTEXT, { optional: true });

    protected readonly destroyRef = inject(DestroyRef);

    /** Which of the two axes this is. */
    abstract readonly axis: 'x' | 'y';

    /**
     * Unique axis identifier, matched by `xAxisId` and `yAxisId` on the datasets.
     * @defaultValue 'default'
     * @group Props
     */
    readonly id = input('default');
    /**
     * Axis scale type.
     * @defaultValue 'category'
     * @group Props
     */
    readonly type = input<AxisType>('category');
    /**
     * Fixed axis minimum. A time axis also accepts a `Date` or an ISO string.
     * @group Props
     */
    readonly min = input<number | Date | string | 'auto' | undefined>(undefined);
    /**
     * Fixed axis maximum.
     * @group Props
     */
    readonly max = input<number | Date | string | 'auto' | undefined>(undefined);
    /**
     * Force the domain to include zero. On by default for bar, off for line.
     * @group Props
     */
    readonly startFromZero = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
    /**
     * Soft minimum: it extends the domain only when the data minimum sits above this value.
     * @group Props
     */
    readonly softMin = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Soft maximum.
     * @group Props
     */
    readonly softMax = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Flip the axis direction.
     * @defaultValue false
     * @group Props
     */
    readonly reversed = input(false, { transform: booleanAttribute });
    /**
     * Axis title, displayed alongside the axis.
     * @group Props
     */
    readonly label = input<string | undefined>(undefined);
    /**
     * Tick label formatter. An options object merges over the axis default; a function replaces the
     * formatting outright.
     * @group Props
     */
    readonly tickFormat = input<Intl.NumberFormatOptions | ((value: TickValue, index?: number) => string) | undefined>(undefined);
    /**
     * Approximate number of ticks.
     * @group Props
     */
    readonly tickCount = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Explicit tick step, which bypasses the automatic tick algorithm.
     * @group Props
     */
    readonly tickInterval = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Tick label rotation in degrees.
     * @defaultValue 0
     * @group Props
     */
    readonly tickRotation = input(0, { transform: numberAttribute });
    /**
     * Draw the tick marks inside or outside the chart area.
     * @defaultValue 'outside'
     * @group Props
     */
    readonly tickPosition = input<'inside' | 'outside'>('outside');
    /**
     * Tick mark and label styling: an object for a uniform style, a function for per-tick.
     * @group Props
     */
    readonly tickStyle = input<TickStyle | ((value: TickValue, index: number) => TickStyle) | undefined>(undefined);
    /**
     * Auto-rotate the labels when they would overlap. X axes only.
     * @defaultValue true
     * @group Props
     */
    readonly autoRotate = input(true, { transform: booleanAttribute });
    /**
     * Angle used when auto-rotation kicks in.
     * @defaultValue -45
     * @group Props
     */
    readonly autoRotateAngle = input(-45, { transform: numberAttribute });
    /**
     * Auto-skip labels to avoid overlap. Set it false to force every label visible.
     * @defaultValue true
     * @group Props
     */
    readonly autoSkip = input(true, { transform: booleanAttribute });
    /**
     * Minimum pixel distance between ticks while `autoSkip` is on.
     * @group Props
     */
    readonly minGridDistance = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Minimum pixel gap between adjacent labels after collision resolution.
     * @defaultValue 6
     * @group Props
     */
    readonly labelMinSpacing = input(6, { transform: numberAttribute });
    /**
     * Show the first tick label.
     * @defaultValue true
     * @group Props
     */
    readonly showFirstLabel = input(true, { transform: booleanAttribute });
    /**
     * Show the last tick label.
     * @defaultValue true
     * @group Props
     */
    readonly showLastLabel = input(true, { transform: booleanAttribute });
    /**
     * Show the axis line.
     * @defaultValue true
     * @group Props
     */
    readonly showLine = input(true, { transform: booleanAttribute });
    /**
     * Show the tick marks.
     * @defaultValue true
     * @group Props
     */
    readonly showTicks = input(true, { transform: booleanAttribute });
    /**
     * Show the tick labels.
     * @defaultValue true
     * @group Props
     */
    readonly showLabels = input(true, { transform: booleanAttribute });
    /**
     * Show the whole axis: line, ticks, labels and grid lines.
     * @defaultValue true
     * @group Props
     */
    readonly visible = input(true, { transform: booleanAttribute });
    /**
     * Axis line, tick mark, title and label colour.
     * @group Props
     */
    readonly color = input<string | undefined>(undefined);
    /**
     * Category scale type, read only when `type` is `'category'`.
     * @defaultValue 'band'
     * @group Props
     */
    readonly scale = input<'band' | 'point'>('band');
    /**
     * Show the major grid lines. On by default on the primary value axis.
     * @group Props
     */
    readonly gridLines = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
    /**
     * Major grid line colour.
     * @group Props
     */
    readonly gridColor = input<string | undefined>(undefined);
    /**
     * Major grid line dash style.
     * @defaultValue 'solid'
     * @group Props
     */
    readonly gridStyle = input<'solid' | 'dashed' | 'dotted'>('solid');
    /**
     * Major grid line stroke width.
     * @defaultValue 1
     * @group Props
     */
    readonly gridStrokeWidth = input(1, { transform: numberAttribute });
    /**
     * Major grid line opacity, from 0 to 1.
     * @defaultValue 1
     * @group Props
     */
    readonly gridOpacity = input(1, { transform: numberAttribute });
    /**
     * Show minor grid lines between the major ticks.
     * @defaultValue false
     * @group Props
     */
    readonly minorGridLines = input(false, { transform: booleanAttribute });
    /**
     * Minor grid line colour.
     * @group Props
     */
    readonly minorGridColor = input<string | undefined>(undefined);
    /**
     * Minor grid line stroke width.
     * @defaultValue 0.5
     * @group Props
     */
    readonly minorGridStrokeWidth = input(0.5, { transform: numberAttribute });
    /**
     * Minor grid line opacity, from 0 to 1.
     * @defaultValue 0.15
     * @group Props
     */
    readonly minorGridOpacity = input(0.15, { transform: numberAttribute });
    /**
     * Number of minor subdivisions between major ticks.
     * @defaultValue 4
     * @group Props
     */
    readonly minorGridCount = input(4, { transform: numberAttribute });
    /**
     * Minor grid line dash style.
     * @defaultValue 'solid'
     * @group Props
     */
    readonly minorGridStyle = input<'solid' | 'dashed' | 'dotted'>('solid');
    /**
     * Show minor tick marks at the minor grid positions.
     * @defaultValue false
     * @group Props
     */
    readonly minorTicks = input(false, { transform: booleanAttribute });
    /**
     * Minor tick mark length in pixels.
     * @defaultValue 3
     * @group Props
     */
    readonly minorTickLength = input(3, { transform: numberAttribute });
    /**
     * Minor tick mark colour.
     * @group Props
     */
    readonly minorTickColor = input<string | undefined>(undefined);
    /**
     * Minor tick mark stroke width.
     * @defaultValue 1
     * @group Props
     */
    readonly minorTickStrokeWidth = input(1, { transform: numberAttribute });
    /**
     * Fill colour for the alternating bands between grid lines.
     * @group Props
     */
    readonly alternateGridColor = input<string | undefined>(undefined);
    /**
     * Opacity of the alternating band fill, from 0 to 1.
     * @defaultValue 0.05
     * @group Props
     */
    readonly alternateGridOpacity = input(0.05, { transform: numberAttribute });
    /**
     * Ordinal mode: maps time data onto ordinal indices, skipping the gaps.
     * @defaultValue false
     * @group Props
     */
    readonly gapless = input(false, { transform: booleanAttribute });
    /**
     * Aggregate a large dataset by time interval.
     * @group Props
     */
    readonly grouping = input<DataGroupingConfig | undefined>(undefined);
    /**
     * IANA timezone for the time axis labels.
     * @defaultValue 'UTC'
     * @group Props
     */
    readonly timezone = input<string | undefined>(undefined);
    /**
     * Per-unit date format overrides for a time axis.
     * @group Props
     */
    readonly dateTimeFormats = input<DateTimeFormatConfig | undefined>(undefined);
    /**
     * Time tick configuration: forced interval and minimum spacing.
     * @group Props
     */
    readonly tickConfig = input<TimeTickConfig | undefined>(undefined);
    /**
     * Minimum time unit, which caps how far a zoom can descend.
     * @group Props
     */
    readonly minUnit = input<TimeUnit | undefined>(undefined);
    /**
     * Edge padding at the axis minimum, as a fraction of the pixel range.
     * @group Props
     */
    readonly chartPaddingMin = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Edge padding at the axis maximum, as a fraction of the pixel range.
     * @group Props
     */
    readonly chartPaddingMax = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Custom tick label renderer.
     * @group Props
     */
    readonly render = input<((context: AxisTickRenderContext) => unknown) | undefined>(undefined);
    /**
     * Custom tick mark renderer.
     * @group Props
     */
    readonly renderTick = input<((context: AxisTickMarkRenderContext) => unknown) | undefined>(undefined);

    /** The axis' current inputs, as the root reads them. */
    readonly props = computed<BaseAxisProps & { position?: string }>(() => ({
        id: this.id(),
        type: this.type(),
        min: this.min(),
        max: this.max(),
        startFromZero: this.startFromZero(),
        softMin: this.softMin(),
        softMax: this.softMax(),
        reversed: this.reversed(),
        label: this.label(),
        tickFormat: this.tickFormat(),
        tickCount: this.tickCount(),
        tickInterval: this.tickInterval(),
        tickRotation: this.tickRotation(),
        tickPosition: this.tickPosition(),
        tickStyle: this.tickStyle(),
        autoRotate: this.autoRotate(),
        autoRotateAngle: this.autoRotateAngle(),
        autoSkip: this.autoSkip(),
        minGridDistance: this.minGridDistance(),
        labelMinSpacing: this.labelMinSpacing(),
        showFirstLabel: this.showFirstLabel(),
        showLastLabel: this.showLastLabel(),
        showLine: this.showLine(),
        showTicks: this.showTicks(),
        showLabels: this.showLabels(),
        visible: this.visible(),
        color: this.color(),
        scale: this.scale(),
        gridLines: this.gridLines(),
        gridColor: this.gridColor(),
        gridStyle: this.gridStyle(),
        gridStrokeWidth: this.gridStrokeWidth(),
        gridOpacity: this.gridOpacity(),
        minorGridLines: this.minorGridLines(),
        minorGridColor: this.minorGridColor(),
        minorGridStrokeWidth: this.minorGridStrokeWidth(),
        minorGridOpacity: this.minorGridOpacity(),
        minorGridCount: this.minorGridCount(),
        minorGridStyle: this.minorGridStyle(),
        minorTicks: this.minorTicks(),
        minorTickLength: this.minorTickLength(),
        minorTickColor: this.minorTickColor(),
        minorTickStrokeWidth: this.minorTickStrokeWidth(),
        alternateGridColor: this.alternateGridColor(),
        alternateGridOpacity: this.alternateGridOpacity(),
        gapless: this.gapless(),
        grouping: this.grouping(),
        timezone: this.timezone(),
        dateTimeFormats: this.dateTimeFormats(),
        tickConfig: this.tickConfig(),
        minUnit: this.minUnit(),
        chartPaddingMin: this.chartPaddingMin(),
        chartPaddingMax: this.chartPaddingMax(),
        render: this.render(),
        renderTick: this.renderTick(),
        position: this.positionValue()
    }));

    /** The edge this axis sits on. */
    protected abstract positionValue(): string;

    /**
     * How much room the axis needs on its edge.
     *
     * Measured from the widest label the domain can produce, plus the tick marks, the padding and
     * the title. Estimating instead would either clip the labels or leave a visible gap, and both
     * are obvious once the chart is on screen.
     */
    protected readonly reservation = computed(() => {
        if (!this.context || !this.visible()) return 0;

        const domain = this.context.domains().get(`${this.axis}:${this.id()}`);

        if (!domain) return 0;

        const style = typeof this.tickStyle() === 'object' ? (this.tickStyle() as TickStyle) : {};
        const fontSize = style.fontSize ?? this.context.fontSize();
        const fontFamily = style.fontFamily ?? this.context.fontFamily();
        const tickLength = this.showTicks() ? (style.tickLength ?? 6) : 0;
        const padding = style.padding ?? 8;
        const titleHeight = this.label() ? lineHeightOf(fontSize) + 4 : 0;

        if (!this.showLabels()) return tickLength + titleHeight;

        const labels = this.candidateLabels(domain);
        const widest = labels.reduce((max, label) => Math.max(max, measureTextWidth(label, fontSize, fontFamily, this.measureContext())), 0);

        if (this.axis === 'x') {
            const rotation = this.tickRotation();
            const box = rotatedBounds(widest, lineHeightOf(fontSize), rotation);

            return tickLength + padding + box.height + titleHeight;
        }

        return tickLength + padding + widest + titleHeight;
    });

    /**
     * The labels the reservation measures.
     *
     * For a value axis this is the formatted ticks; for a category axis it is every category. Both
     * come from the domain, so neither needs the plot area.
     */
    private candidateLabels(domain: NonNullable<ReturnType<NonNullable<typeof this.context>['domains']> extends Map<string, infer D> ? D : never>): string[] {
        if (domain.kind === 'category') return domain.categories;

        const [min, max] = domain.extent;
        const props = this.props();
        // A synthetic scale is enough here: only the tick *values* matter, and those come from the
        // domain rather than from the pixel range.
        const synthetic = { type: domain.type === 'time' ? ('time' as const) : ('linear' as const), domain: [min, max] as [number, number], range: [0, 1] as [number, number], scale: () => 0, invert: () => 0 };
        const values = generateTicks(synthetic, props, domain.type);

        return values.map((value, index) => formatTick(value, index, props, domain.type, this.context?.locale(), max - min));
    }

    private measureCanvas: CanvasRenderingContext2D | null = null;

    /** A canvas context used only to measure text. */
    protected measureContext(): CanvasRenderingContext2D | null {
        if (this.measureCanvas) return this.measureCanvas;
        if (typeof document === 'undefined') return null;

        this.measureCanvas = document.createElement('canvas').getContext('2d');

        return this.measureCanvas;
    }

    /** Registers the axis and its reservation with the root. */
    protected register(): void {
        if (!this.context) return;

        const removeAxis = this.context.registerAxis({ id: this.id(), axis: this.axis, props: this.props as never });
        const releaseSpace = this.context.reserve(this.positionValue() as 'top' | 'right' | 'bottom' | 'left', this.reservation);

        this.destroyRef.onDestroy(() => {
            removeAxis();
            releaseSpace();
        });
    }
}

/**
 * The x axis. Add one to give the series a horizontal scale to bind to; remove it and the axis, its
 * ticks and its grid all go with it.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-x-axis',
    standalone: true,
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { style: 'display: none' }
})
export class ChartXAxis extends ChartAxisBase {
    readonly axis = 'x' as const;

    /**
     * Edge the axis sits on.
     * @defaultValue 'bottom'
     * @group Props
     */
    readonly position = input<'top' | 'bottom'>('bottom');

    protected positionValue(): string {
        return this.position();
    }

    constructor() {
        super();
        this.register();
    }
}

/**
 * The y axis. On a radial chart this is also where the concentric grid is configured, since the
 * rings are the axis rather than part of the series.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-y-axis',
    standalone: true,
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { style: 'display: none' }
})
export class ChartYAxis extends ChartAxisBase {
    readonly axis = 'y' as const;

    /**
     * Edge the axis sits on.
     * @defaultValue 'left'
     * @group Props
     */
    readonly position = input<'left' | 'right'>('left');
    /**
     * Concentric grid shape on a radial chart: smooth circles, or an angular polygon.
     * @group Props
     */
    readonly gridShape = input<'polygon' | 'circle' | undefined>(undefined);

    protected positionValue(): string {
        return this.position();
    }

    constructor() {
        super();
        this.register();
    }
}

/** Accepts a numeric input while letting `undefined` stay `undefined`. */
function optionalNumber(value: unknown): number | undefined {
    if (value == null || value === '') return undefined;

    const parsed = numberAttribute(value);

    return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Accepts a boolean input while letting `undefined` stay `undefined`.
 *
 * The distinction matters for the props whose default depends on the chart: `startFromZero` is on
 * for a bar and off for a line, so "not set" has to stay distinguishable from "set to false".
 */
function optionalBoolean(value: unknown): boolean | undefined {
    if (value == null || value === '') return undefined;

    return booleanAttribute(value);
}

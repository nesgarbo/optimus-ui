import { NgTemplateOutlet } from '@angular/common';
import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    ElementRef,
    inject,
    input,
    model,
    NgModule,
    numberAttribute,
    output,
    signal,
    TemplateRef,
    untracked,
    viewChild,
    ViewEncapsulation,
    booleanAttribute
} from '@angular/core';
import { SharedModule } from '@openng/optimus-ui/api';
import { PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { Bind } from '@openng/optimus-ui/bind';
import type { CircularAnnotation, CircularAxis, CircularPointer, GaugeRange, GaugePointerEvent } from '@openng/optimus-ui/types/gauges';
import { angleFrom, angleToValue, arcBounds, arcLine, axisTicks, formatLabel, markerShapePath, needlePath, padBounds, polar, rangeColorAt, resolveLength, ringPath, sweepOf, taperedPath, valueToAngle, viewBoxOf, type Bounds } from './gauge-engine';
import { GaugeBase } from './gauge-base';
import { GaugeStyle } from './style/gaugestyle';

const CENTER = 100;
const BASE_RADIUS = 100;

interface TickView {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color?: string;
    width: number;
}

interface LabelView {
    x: number;
    y: number;
    text: string;
    color?: string;
    size: number;
    family?: string;
    weight?: string | number;
}

interface RangeView {
    d: string;
    color?: string;
    text?: string;
}

interface PointerView {
    key: string;
    axisIndex: number;
    pointerIndex: number;
    type: 'needle' | 'marker' | 'rangeBar';
    value: number;
    color?: string;
    d: string;
    transform?: string;
    cap?: { r: number; color?: string; stroke?: string; strokeWidth?: number };
    description: string;
}

interface AnnotationView {
    x: number;
    y: number;
    content: string | TemplateRef<any>;
    zIndex: number;
    value: number | undefined;
}

interface AxisView {
    index: number;
    line: { d: string; width: number; color?: string };
    ranges: RangeView[];
    major: TickView[];
    minor: TickView[];
    labels: LabelView[];
    pointers: PointerView[];
    annotations: AnnotationView[];
}

interface View {
    viewBox: string;
    axes: AxisView[];
}

const DEFAULT_AXIS: Required<Pick<CircularAxis, 'minimum' | 'maximum' | 'startAngle' | 'endAngle'>> = { minimum: 0, maximum: 100, startAngle: 200, endAngle: 160 };

/**
 * CircularGauge shows one or more values on a dial: a needle, a marker or a filled bar over an axis with
 * ticks, labels and colored ranges.
 *
 * The API follows Syncfusion's CircularGauge: `axes` (each with `minimum`, `maximum`, `startAngle`, `endAngle`, `radius`,
 * `lineStyle`, `majorTicks`, `minorTicks`, `labelStyle`, `ranges`, `pointers` and `annotations`), `enablePointerDrag`, `title`,
 * the `loaded`, `animationComplete` and `pointerChange` events and the `setPointerValue` method. A gauge with a single needle needs
 * no `axes`: `value`, `minimum`, `maximum`, `startAngle`, `endAngle` and `ranges` describe it.
 *
 * Angles are degrees clockwise from twelve o'clock.
 *
 * @group Components
 */
@Component({
    selector: 'p-circulargauge, p-circularGauge, p-circular-gauge',
    standalone: true,
    imports: [NgTemplateOutlet, SharedModule, Bind],
    template: `
        @if (title(); as heading) {
            <div [class]="cx('title')">{{ heading }}</div>
        }
        <svg
            #svg
            [class]="cx('svg')"
            [attr.viewBox]="view().viewBox"
            [style.height]="svgHeight()"
            preserveAspectRatio="xMidYMid meet"
            [attr.role]="role()"
            [attr.aria-label]="ariaLabel() || title() || defaultLabel()"
            [attr.aria-valuemin]="reading()?.min"
            [attr.aria-valuemax]="reading()?.max"
            [attr.aria-valuenow]="reading()?.now"
            [attr.aria-valuetext]="reading()?.text"
            [attr.tabindex]="enablePointerDrag() ? 0 : null"
            [pBind]="ptm('svg')"
            (keydown)="onKeydown($event)"
            (pointerup)="onPointerUp($event)"
            (pointercancel)="onPointerUp($event)"
        >
            @for (axis of view().axes; track axis.index) {
                <g>
                    @for (r of axis.ranges; track $index) {
                        <path [class]="cx('range')" [attr.d]="r.d" [style.fill]="r.color">
                            <title>{{ r.text }}</title>
                        </path>
                    }
                    <path [class]="cx('line')" [attr.d]="axis.line.d" fill="none" [attr.stroke-width]="axis.line.width" [style.stroke]="axis.line.color" />
                    @for (t of axis.minor; track $index) {
                        <line [class]="cx('tick') + ' p-gauge-tick-minor'" [attr.x1]="t.x1" [attr.y1]="t.y1" [attr.x2]="t.x2" [attr.y2]="t.y2" [attr.stroke-width]="t.width" [style.stroke]="t.color" />
                    }
                    @for (t of axis.major; track $index) {
                        <line [class]="cx('tick')" [attr.x1]="t.x1" [attr.y1]="t.y1" [attr.x2]="t.x2" [attr.y2]="t.y2" [attr.stroke-width]="t.width" [style.stroke]="t.color" />
                    }
                    @for (l of axis.labels; track $index) {
                        <text [class]="cx('label')" [attr.x]="l.x" [attr.y]="l.y" text-anchor="middle" dominant-baseline="central" [attr.font-size]="l.size" [attr.font-family]="l.family" [attr.font-weight]="l.weight" [style.fill]="l.color">
                            {{ l.text }}
                        </text>
                    }
                    @for (p of axis.pointers; track p.key) {
                        <g [class]="cx('pointer') + ' p-gauge-pointer-' + p.type" [attr.data-pointer]="p.key" (pointerdown)="onPointerDown($event, p)">
                            <path [attr.d]="p.d" [attr.transform]="p.transform" [style.fill]="p.color" [style.stroke]="p.type === 'rangeBar' ? null : p.color">
                                <title>{{ p.description }}</title>
                            </path>
                            @if (p.cap; as cap) {
                                <circle [attr.cx]="100" [attr.cy]="100" [attr.r]="cap.r" [style.fill]="cap.color" [style.stroke]="cap.stroke" [attr.stroke-width]="cap.strokeWidth" />
                            }
                        </g>
                    }
                    @for (a of axis.annotations; track $index) {
                        @if (isText(a.content)) {
                            <text class="p-gauge-annotation" [attr.x]="a.x" [attr.y]="a.y" text-anchor="middle" dominant-baseline="central">{{ a.content }}</text>
                        } @else {
                            <foreignObject class="p-gauge-annotation" [attr.x]="a.x - 50" [attr.y]="a.y - 15" width="100" height="30">
                                <div class="p-gauge-annotation-box">
                                    <ng-container *ngTemplateOutlet="asTemplate(a.content); context: { $implicit: a, value: a.value }" />
                                </div>
                            </foreignObject>
                        }
                    }
                </g>
            }
        </svg>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [GaugeStyle, { provide: PARENT_INSTANCE, useExisting: CircularGauge }],
    host: { '[class]': 'cx("root")', 'data-scope': 'gauge', 'data-part': 'root', '[style.width]': 'hostWidth()' },
    hostDirectives: [Bind]
})
export class CircularGauge extends GaugeBase {
    componentName = 'CircularGauge';

    readonly kind = 'circular' as const;

    private readonly svgRef = viewChild.required<ElementRef<SVGSVGElement>>('svg');

    // ---------------------------------------------------------------------------------------------
    // Props
    // ---------------------------------------------------------------------------------------------

    /**
     * The axes. Each draws a dial; several make nested or opposed scales. Left empty, one axis is built from the simple inputs.
     * @group Props
     */
    readonly axes = input<CircularAxis[]>([]);
    /**
     * The value of the needle of the simple form. Supports `[(value)]`; dragging writes to it.
     * @group Props
     */
    readonly value = model<number>(0);
    /**
     * Least value of the simple form.
     * @group Props
     */
    readonly minimum = input(DEFAULT_AXIS.minimum, { transform: numberAttribute });
    /**
     * Greatest value of the simple form.
     * @group Props
     */
    readonly maximum = input(DEFAULT_AXIS.maximum, { transform: numberAttribute });
    /**
     * Where the simple form begins, in degrees clockwise from the top.
     * @group Props
     */
    readonly startAngle = input(DEFAULT_AXIS.startAngle, { transform: numberAttribute });
    /**
     * Where the simple form ends. Equal to `startAngle`, it is a full circle.
     * @group Props
     */
    readonly endAngle = input(DEFAULT_AXIS.endAngle, { transform: numberAttribute });
    /**
     * Colored bands of the simple form.
     * @group Props
     */
    readonly ranges = input<GaugeRange[]>([]);
    /**
     * The pointer of the simple form: a needle, a marker or a bar.
     * @group Props
     */
    readonly pointerType = input<'needle' | 'marker' | 'rangeBar'>('needle');
    /**
     * Lets the user drag a pointer, and move the first one with the keyboard: the arrows, Page Up and Page Down, Home and End.
     * @group Props
     */
    readonly enablePointerDrag = input(false, { transform: booleanAttribute });
    /**
     * Content over the dial for the simple form: text or a template with `$implicit` and `value`.
     * @group Props
     */
    readonly annotation = input<string | TemplateRef<any> | undefined>(undefined);
    /**
     * A pattern for the labels of the simple form, for example `{value}%`.
     * @group Props
     */
    readonly format = input<string | ((value: number) => string) | undefined>(undefined);
    /**
     * Locale of the labels.
     * @group Props
     */
    readonly locale = input<string | undefined>(undefined);

    // ---------------------------------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------------------------------

    /** Fires once, after the first draw. @group Emits */
    readonly loaded = output<void>();
    /** Fires when every pointer has reached its value. @group Emits */
    readonly animationComplete = output<void>();
    /** Fires as a pointer is dragged, moved by the keyboard or set with `setPointerValue`. @group Emits */
    readonly pointerChange = output<GaugePointerEvent>();

    // ---------------------------------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------------------------------

    /** Values the user or `setPointerValue` set, by pointer key. Cleared when `axes` changes. */
    private readonly overrides = signal<Record<string, number>>({});
    private drag: { key: string; axisIndex: number; pointerIndex: number; pointerId: number } | null = null;

    readonly interactive = () => this.enablePointerDrag();

    /** The axes as they are drawn: the input, or the one the simple inputs describe. */
    private readonly resolved = computed<CircularAxis[]>(() => {
        const axes = this.axes();

        if (axes.length) return axes;

        return [
            {
                minimum: this.minimum(),
                maximum: this.maximum(),
                startAngle: this.startAngle(),
                endAngle: this.endAngle(),
                ranges: this.ranges(),
                labelStyle: { format: this.format() },
                pointers: [{ value: this.value(), type: this.pointerType() }],
                annotations: this.annotation() ? [{ content: this.annotation()!, angle: 180, radius: '35%' }] : []
            }
        ];
    });

    private readonly simple = computed(() => !this.axes().length);

    private readonly keyOf = (ai: number, pi: number) => `${ai}:${pi}`;

    protected readonly targets = computed(() => {
        const out: Record<string, { value: number; start: number; duration: number }> = {};
        const overrides = this.overrides();

        this.resolved().forEach((axis, ai) => {
            const min = axis.minimum ?? DEFAULT_AXIS.minimum;
            const max = axis.maximum ?? DEFAULT_AXIS.maximum;

            (axis.pointers ?? []).forEach((p, pi) => {
                const key = this.keyOf(ai, pi);
                const raw = key in overrides ? overrides[key] : p.value;

                out[key] = { value: Math.min(Math.max(raw, min), max), start: min, duration: p.animation?.enable === false ? 0 : (p.animation?.duration ?? 600) };
            });
        });

        return out;
    });

    protected onAnimationDone(): void {
        this.animationComplete.emit();
    }

    /** The first pointer, for the accessible value. @internal */
    readonly reading = computed(() => {
        const axis = this.resolved()[0];
        const pointer = axis?.pointers?.[0];

        if (!axis || !pointer) return null;

        const min = axis.minimum ?? DEFAULT_AXIS.minimum;
        const max = axis.maximum ?? DEFAULT_AXIS.maximum;
        const now = this.targets()[this.keyOf(0, 0)]?.value ?? pointer.value;

        return { min, max, now, text: formatLabel(now, axis.labelStyle?.format, this.locale()) };
    });

    /** @internal */
    readonly role = computed(() => (this.enablePointerDrag() ? 'slider' : this.resolved().reduce((n, a) => n + (a.pointers?.length ?? 0), 0) === 1 ? 'meter' : 'img'));

    /** What is drawn. @internal */
    readonly view = computed<View>(() => {
        const shown = this.shown();
        const bounds: Bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
        const axes = this.resolved().map((axis, ai) => this.buildAxis(axis, ai, shown, bounds));

        if (!Number.isFinite(bounds.minX)) return { viewBox: '0 0 200 200', axes };

        return { viewBox: viewBoxOf(padBounds(bounds, 6)), axes };
    });

    constructor() {
        super();

        this.startAnimation();
        // A hover over the gauge is not a reason to run change detection: only a drag does.
        afterNextRender(() => this.followPointer(this.svgRef().nativeElement, (event) => this.onPointerMove(event)));

        // New axes are a new gauge: what the user dragged to is forgotten.
        effect(() => {
            this.axes();
            untracked(() => this.overrides.set({}));
        });

        let loaded = false;

        effect(() => {
            this.view();

            if (!loaded) {
                loaded = true;
                untracked(() => queueMicrotask(() => this.loaded.emit()));
            }
        });
    }

    // ---------------------------------------------------------------------------------------------
    // Drawing
    // ---------------------------------------------------------------------------------------------

    private buildAxis(axis: CircularAxis, ai: number, shown: Record<string, number>, bounds: Bounds): AxisView {
        const min = axis.minimum ?? DEFAULT_AXIS.minimum;
        const max = axis.maximum ?? DEFAULT_AXIS.maximum;
        const start = axis.startAngle ?? DEFAULT_AXIS.startAngle;
        const end = axis.endAngle ?? DEFAULT_AXIS.endAngle;
        const clockwise = axis.direction !== 'antiClockwise';
        const radius = resolveLength(axis.radius, BASE_RADIUS, BASE_RADIUS * 0.8);
        const at = (v: number) => valueToAngle(v, min, max, start, end, clockwise);
        const a0 = at(min);
        const a1 = at(max);
        const line = axis.lineStyle ?? {};
        const labelStyle = axis.labelStyle ?? {};
        const inside = (labelStyle.position ?? 'inside') === 'inside';
        const dir = inside ? -1 : 1;
        const ranges = axis.ranges ?? [];
        const rangeWidth = ranges.reduce((m, r) => Math.max(m, r.startWidth ?? 10, r.endWidth ?? 10), 0);

        arcBounds(CENTER, CENTER, radius + (inside ? 0 : 0), a0, a1, bounds);

        // Ranges.
        const rangeViews: RangeView[] = ranges.map((r) => {
            const outer = resolveLength(r.radius, radius, radius);
            const sw = r.startWidth ?? 10;
            const ew = r.endWidth ?? sw;
            const from = at(Math.max(Math.min(r.start, r.end), min));
            const to = at(Math.min(Math.max(r.start, r.end), max));

            return { d: taperedPath(CENTER, CENTER, outer, sw, ew, from, to), color: r.color, text: this.rangeLabel(r) };
        });

        // Ticks and labels sit beside the ranges, on the side the labels are on.
        const major = axis.majorTicks ?? {};
        const minor = axis.minorTicks ?? {};
        const ticks = axisTicks(min, max, major.interval, minor.interval);

        // On a full circle the last tick lands on the first: one is enough.
        if (sweepOf(start, end) >= 360 && ticks.major.length > 1) ticks.major.pop();
        const tickBase = radius + (inside ? -(rangeWidth ? rangeWidth + 2 : 0) : 0) + (major.offset ?? 0);
        const tick = (v: number, spec: typeof major, defaultHeight: number, defaultWidth: number): TickView => {
            const h = spec.height ?? defaultHeight;
            const p1 = polar(CENTER, CENTER, tickBase, at(v));
            const p2 = polar(CENTER, CENTER, tickBase + dir * h, at(v));

            return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, width: spec.width ?? defaultWidth, color: spec.useRangeColor ? rangeColorAt(v, ranges, spec.color ?? 'currentColor') : spec.color };
        };
        const majorViews = ticks.major.map((v) => tick(v, major, 8, 1.5));
        const minorViews = ticks.minor.map((v) => tick(v, minor, 4, 1));
        const majorHeight = major.height ?? 8;

        const font = labelStyle.font ?? {};
        const size = font.size ?? 9;
        const labelRadius = tickBase + dir * (majorHeight + (labelStyle.offset ?? 8) + (inside ? size / 2 : size / 2));
        const labels: LabelView[] = labelStyle.hidden
            ? []
            : ticks.major.map((v) => {
                  const p = polar(CENTER, CENTER, labelRadius, at(v));

                  return {
                      x: p.x,
                      y: p.y,
                      text: formatLabel(v, labelStyle.format, this.locale()),
                      size,
                      family: font.fontFamily,
                      weight: font.fontWeight,
                      color: labelStyle.useRangeColor ? rangeColorAt(v, ranges, font.color ?? 'currentColor') : font.color
                  };
              });

        if (!inside && !labelStyle.hidden) arcBounds(CENTER, CENTER, labelRadius + size, a0, a1, bounds);

        // Pointers.
        const pointers: PointerView[] = (axis.pointers ?? []).map((p, pi) => this.buildPointer(p, ai, pi, shown, { min, max, start, end, clockwise, radius, rangeWidth, at, bounds }));

        // Annotations.
        const firstValue = pointers[0]?.value;
        const annotations: AnnotationView[] = (axis.annotations ?? []).map((a: CircularAnnotation) => {
            const r = resolveLength(a.radius, radius, 0);
            const pt = polar(CENTER, CENTER, r, a.angle ?? 0);

            return { x: pt.x, y: pt.y, content: a.content, zIndex: a.zIndex ?? 0, value: firstValue };
        });

        annotations.sort((x, y) => x.zIndex - y.zIndex);

        return { index: ai, line: { d: arcLine(CENTER, CENTER, radius, a0, a1), width: line.width ?? 2, color: line.color }, ranges: rangeViews, major: majorViews, minor: minorViews, labels, pointers, annotations };
    }

    private buildPointer(
        p: CircularPointer,
        ai: number,
        pi: number,
        shown: Record<string, number>,
        g: { min: number; max: number; start: number; end: number; clockwise: boolean; radius: number; rangeWidth: number; at: (v: number) => number; bounds: Bounds }
    ): PointerView {
        const key = this.keyOf(ai, pi);
        const value = shown[key] ?? p.value;
        const angle = g.at(value);
        const type = p.type ?? 'needle';
        const description = p.description ?? `${formatLabel(this.targets()[key]?.value ?? p.value, undefined, this.locale())}`;
        const base = { key, axisIndex: ai, pointerIndex: pi, type, value, color: p.color, description };

        if (type === 'rangeBar') {
            const width = p.pointerWidth ?? 8;
            const outer = resolveLength(p.radius, g.radius, g.radius);

            return { ...base, d: ringPath(CENTER, CENTER, Math.max(outer - width, 0), outer, g.at(g.min), angle) };
        }

        if (type === 'marker') {
            const w = p.markerWidth ?? 10;
            const h = p.markerHeight ?? 10;
            const r = resolveLength(p.radius, g.radius, g.radius - (g.rangeWidth ? g.rangeWidth + 2 : 0)) + (p.offset ?? 0);
            const pt = polar(CENTER, CENTER, r, angle);

            arcBounds(CENTER, CENTER, Math.max(r + h, g.radius), angle, angle, g.bounds);

            return { ...base, d: markerShapePath(p.markerShape ?? 'triangle', w, h), transform: `translate(${pt.x} ${pt.y}) rotate(${angle})` };
        }

        const length = resolveLength(p.radius, g.radius, g.radius * 0.72);
        const tail = resolveLength(p.needleTail?.length, length, 0);
        const cap = p.cap ?? {};
        const capRadius = cap.radius ?? 7;

        g.bounds.minX = Math.min(g.bounds.minX, CENTER - capRadius);
        g.bounds.maxX = Math.max(g.bounds.maxX, CENTER + capRadius);
        g.bounds.minY = Math.min(g.bounds.minY, CENTER - capRadius);
        g.bounds.maxY = Math.max(g.bounds.maxY, CENTER + capRadius);

        return {
            ...base,
            d: needlePath(CENTER, CENTER, length, p.pointerWidth ?? 5, tail),
            transform: `rotate(${angle} ${CENTER} ${CENTER})`,
            cap: { r: capRadius, color: cap.color ?? p.color, stroke: cap.border?.color, strokeWidth: cap.border?.width }
        };
    }

    // ---------------------------------------------------------------------------------------------
    // Interaction
    // ---------------------------------------------------------------------------------------------

    /** @internal */
    isText(content: string | TemplateRef<any>): content is string {
        return typeof content === 'string';
    }

    /** @internal */
    asTemplate(content: string | TemplateRef<any>): TemplateRef<any> {
        return content as TemplateRef<any>;
    }

    private pointerOf(axisIndex: number, pointerIndex: number): { axis: CircularAxis; pointer: CircularPointer } | null {
        const axis = this.resolved()[axisIndex];
        const pointer = axis?.pointers?.[pointerIndex];

        return axis && pointer ? { axis, pointer } : null;
    }

    private setValue(axisIndex: number, pointerIndex: number, raw: number, dragging: boolean): void {
        const found = this.pointerOf(axisIndex, pointerIndex);

        if (!found) return;

        const min = found.axis.minimum ?? DEFAULT_AXIS.minimum;
        const max = found.axis.maximum ?? DEFAULT_AXIS.maximum;
        const value = Math.min(Math.max(raw, min), max);
        const key = this.keyOf(axisIndex, pointerIndex);

        this.overrides.update((o) => ({ ...o, [key]: value }));

        if (this.simple() && axisIndex === 0 && pointerIndex === 0) this.value.set(value);

        this.pointerChange.emit({ axisIndex, pointerIndex, value, dragging });
    }

    /** Sets the value of a pointer. Mirrors Syncfusion's `setPointerValue`. */
    setPointerValue(axisIndex: number, pointerIndex: number, value: number): void {
        this.setValue(axisIndex, pointerIndex, value, false);
    }

    /** Keeps the pointer events coming to the gauge while the drag leaves it. A pointer that is already gone is not worth failing for. */
    private capture(pointerId: number): void {
        try {
            this.svgRef().nativeElement.setPointerCapture?.(pointerId);
        } catch {
            /* the drag still works while the pointer stays over the gauge */
        }
    }

    /** @internal */
    onPointerDown(event: PointerEvent, p: PointerView): void {
        if (!this.enablePointerDrag() || (event.pointerType === 'mouse' && event.button !== 0)) return;

        event.preventDefault();
        this.drag = { key: p.key, axisIndex: p.axisIndex, pointerIndex: p.pointerIndex, pointerId: event.pointerId };
        this.capture(event.pointerId);
        this.svgRef().nativeElement.focus({ preventScroll: true });
    }

    /** @internal */
    onPointerMove(event: PointerEvent): void {
        const d = this.drag;

        if (!d || event.pointerId !== d.pointerId) return;

        const svg = this.svgRef().nativeElement;
        const ctm = svg.getScreenCTM();

        if (!ctm) return;

        const pt = svg.createSVGPoint();

        pt.x = event.clientX;
        pt.y = event.clientY;

        const local = pt.matrixTransform(ctm.inverse());
        const found = this.pointerOf(d.axisIndex, d.pointerIndex);

        if (!found) return;

        const { axis } = found;
        const value = angleToValue(
            angleFrom(CENTER, CENTER, local.x, local.y),
            axis.minimum ?? DEFAULT_AXIS.minimum,
            axis.maximum ?? DEFAULT_AXIS.maximum,
            axis.startAngle ?? DEFAULT_AXIS.startAngle,
            axis.endAngle ?? DEFAULT_AXIS.endAngle,
            axis.direction !== 'antiClockwise'
        );

        this.zone.run(() => this.setValue(d.axisIndex, d.pointerIndex, value, true));
    }

    /** @internal */
    onPointerUp(event: PointerEvent): void {
        const d = this.drag;

        if (!d || event.pointerId !== d.pointerId) return;

        this.drag = null;

        const value = this.targets()[d.key]?.value;

        if (value !== undefined) this.pointerChange.emit({ axisIndex: d.axisIndex, pointerIndex: d.pointerIndex, value, dragging: false });
    }

    /** @internal */
    onKeydown(event: KeyboardEvent): void {
        if (!this.enablePointerDrag()) return;

        const axis = this.resolved()[0];
        const key = this.keyOf(0, 0);
        const target = this.targets()[key];

        if (!axis || !target) return;

        const min = axis.minimum ?? DEFAULT_AXIS.minimum;
        const max = axis.maximum ?? DEFAULT_AXIS.maximum;
        const step = (max - min) / 100;
        const delta: Record<string, number> = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step, PageUp: step * 10, PageDown: -step * 10 };
        let next: number | undefined;

        if (event.key in delta) next = target.value + delta[event.key];
        else if (event.key === 'Home') next = min;
        else if (event.key === 'End') next = max;

        if (next === undefined) return;

        event.preventDefault();
        this.setValue(0, 0, next, false);
    }
}

/**
 * @group Modules
 */
@NgModule({
    imports: [CircularGauge, SharedModule],
    exports: [CircularGauge, SharedModule]
})
export class CircularGaugeModule {}

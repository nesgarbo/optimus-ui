import { afterNextRender, booleanAttribute, ChangeDetectionStrategy, Component, computed, effect, ElementRef, input, model, NgModule, numberAttribute, output, signal, untracked, viewChild, ViewEncapsulation } from '@angular/core';
import { SharedModule } from '@openng/optimus-ui/api';
import { PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { Bind } from '@openng/optimus-ui/bind';
import type { GaugePointerEvent, LinearAxis, LinearContainer, LinearPointer, LinearRange } from '@openng/optimus-ui/types/gauges';
import { axisTicks, formatLabel, markerShapePath, rangeColorAt } from './gauge-engine';
import { GaugeBase } from './gauge-base';
import { GaugeStyle } from './style/gaugestyle';

const LENGTH = 300;

interface Line {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    color?: string;
}

interface Text {
    x: number;
    y: number;
    text: string;
    anchor: 'start' | 'middle' | 'end';
    size: number;
    family?: string;
    weight?: string | number;
    color?: string;
}

interface Shape {
    d: string;
    color?: string;
    transform?: string;
    title?: string;
}

interface LinearPointerView extends Shape {
    key: string;
    axisIndex: number;
    pointerIndex: number;
    type: 'bar' | 'marker';
    value: number;
}

interface LinearAxisView {
    index: number;
    container?: Shape & { stroke?: string; strokeWidth?: number };
    bulb?: { cx: number; cy: number; r: number; color?: string };
    line: Line;
    ranges: Shape[];
    major: Line[];
    minor: Line[];
    labels: Text[];
    pointers: LinearPointerView[];
}

interface LinearView {
    viewBox: string;
    axes: LinearAxisView[];
}

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * LinearGauge shows one or more values on a straight scale, in a container: a bar that fills, or a marker that moves.
 *
 * The API covers `orientation`, `container` (`normal`, `thermometer` or `roundedRectangle`), and `axes` (each with
 * `minimum`, `maximum`, `lineStyle`, `majorTicks`, `minorTicks`, `labelStyle`, `ranges`, `pointers`, `opposedPosition` and `isInversed`).
 * A gauge with a single pointer needs no `axes`: `value`, `minimum`, `maximum` and `ranges` describe it.
 *
 * @group Components
 */
@Component({
    selector: 'p-lineargauge, p-linearGauge, p-linear-gauge',
    standalone: true,
    imports: [SharedModule, Bind],
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
            [attr.aria-orientation]="orientation()"
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
                    @if (axis.container; as c) {
                        <path class="p-gauge-container" [attr.d]="c.d" [style.fill]="c.color" [style.stroke]="c.stroke" [attr.stroke-width]="c.strokeWidth" />
                    }
                    @if (axis.bulb; as b) {
                        <circle class="p-gauge-container" [attr.cx]="b.cx" [attr.cy]="b.cy" [attr.r]="b.r" [style.fill]="b.color" />
                    }
                    @for (r of axis.ranges; track $index) {
                        <path [class]="cx('range')" [attr.d]="r.d" [style.fill]="r.color">
                            <title>{{ r.title }}</title>
                        </path>
                    }
                    <line [class]="cx('line')" [attr.x1]="axis.line.x1" [attr.y1]="axis.line.y1" [attr.x2]="axis.line.x2" [attr.y2]="axis.line.y2" [attr.stroke-width]="axis.line.width" [style.stroke]="axis.line.color" />
                    @for (t of axis.minor; track $index) {
                        <line [class]="cx('tick') + ' p-gauge-tick-minor'" [attr.x1]="t.x1" [attr.y1]="t.y1" [attr.x2]="t.x2" [attr.y2]="t.y2" [attr.stroke-width]="t.width" [style.stroke]="t.color" />
                    }
                    @for (t of axis.major; track $index) {
                        <line [class]="cx('tick')" [attr.x1]="t.x1" [attr.y1]="t.y1" [attr.x2]="t.x2" [attr.y2]="t.y2" [attr.stroke-width]="t.width" [style.stroke]="t.color" />
                    }
                    @for (l of axis.labels; track $index) {
                        <text [class]="cx('label')" [attr.x]="l.x" [attr.y]="l.y" [attr.text-anchor]="l.anchor" dominant-baseline="central" [attr.font-size]="l.size" [attr.font-family]="l.family" [attr.font-weight]="l.weight" [style.fill]="l.color">
                            {{ l.text }}
                        </text>
                    }
                    @for (p of axis.pointers; track p.key) {
                        <g [class]="cx('pointer') + ' p-gauge-pointer-' + p.type" [attr.data-pointer]="p.key" (pointerdown)="onPointerDown($event, p)">
                            <path [attr.d]="p.d" [attr.transform]="p.transform" [style.fill]="p.color">
                                <title>{{ p.title }}</title>
                            </path>
                        </g>
                    }
                </g>
            }
        </svg>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [GaugeStyle, { provide: PARENT_INSTANCE, useExisting: LinearGauge }],
    host: { '[class]': 'cx("root")', 'data-scope': 'gauge', 'data-part': 'root', '[style.width]': 'hostWidth()' },
    hostDirectives: [Bind]
})
export class LinearGauge extends GaugeBase {
    componentName = 'LinearGauge';

    readonly kind = 'linear' as const;

    private readonly svgRef = viewChild.required<ElementRef<SVGSVGElement>>('svg');

    /**
     * Lays the scale out across or up.
     * @group Props
     */
    readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
    /**
     * The frame the pointers move in.
     * @group Props
     */
    readonly container = input<LinearContainer>({});
    /**
     * The axes. Left empty, one axis is built from the simple inputs.
     * @group Props
     */
    readonly axes = input<LinearAxis[]>([]);
    /**
     * The value of the pointer of the simple form. Supports `[(value)]`; dragging writes to it.
     * @group Props
     */
    readonly value = model<number>(0);
    /**
     * Least value of the simple form.
     * @group Props
     */
    readonly minimum = input(0, { transform: numberAttribute });
    /**
     * Greatest value of the simple form.
     * @group Props
     */
    readonly maximum = input(100, { transform: numberAttribute });
    /**
     * Colored bands of the simple form.
     * @group Props
     */
    readonly ranges = input<LinearRange[]>([]);
    /**
     * The pointer of the simple form: a bar that fills or a marker.
     * @group Props
     */
    readonly pointerType = input<'bar' | 'marker'>('bar');
    /**
     * A pattern for the labels of the simple form, for example `{value}%`.
     * @group Props
     */
    readonly format = input<string | ((value: number) => string) | undefined>(undefined);
    /**
     * Lets the user drag a pointer, and move the first one with the keyboard.
     * @group Props
     */
    readonly enablePointerDrag = input(false, { transform: booleanAttribute });
    /**
     * Locale of the labels.
     * @group Props
     */
    readonly locale = input<string | undefined>(undefined);

    /** Fires once, after the first draw. @group Emits */
    readonly loaded = output<void>();
    /** Fires when every pointer has reached its value. @group Emits */
    readonly animationComplete = output<void>();
    /** Fires as a pointer is dragged, moved by the keyboard or set with `setPointerValue`. @group Emits */
    readonly pointerChange = output<GaugePointerEvent>();

    private readonly overrides = signal<Record<string, number>>({});
    private drag: { axisIndex: number; pointerIndex: number; pointerId: number } | null = null;

    readonly interactive = () => this.enablePointerDrag();

    private readonly simple = computed(() => !this.axes().length);

    private readonly resolved = computed<LinearAxis[]>(() => {
        const axes = this.axes();

        if (axes.length) return axes;

        return [{ minimum: this.minimum(), maximum: this.maximum(), ranges: this.ranges(), labelStyle: { format: this.format() }, pointers: [{ value: this.value(), type: this.pointerType() }] }];
    });

    private readonly keyOf = (ai: number, pi: number) => `${ai}:${pi}`;

    protected readonly targets = computed(() => {
        const out: Record<string, { value: number; start: number; duration: number }> = {};
        const overrides = this.overrides();

        this.resolved().forEach((axis, ai) => {
            const min = axis.minimum ?? 0;
            const max = axis.maximum ?? 100;

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

        const now = this.targets()[this.keyOf(0, 0)]?.value ?? pointer.value;

        return { min: axis.minimum ?? 0, max: axis.maximum ?? 100, now, text: formatLabel(now, axis.labelStyle?.format, this.locale()) };
    });

    /** @internal */
    readonly role = computed(() => (this.enablePointerDrag() ? 'slider' : this.resolved().reduce((n, a) => n + (a.pointers?.length ?? 0), 0) === 1 ? 'meter' : 'img'));

    /** What is drawn. @internal */
    readonly view = computed<LinearView>(() => {
        const shown = this.shown();
        const box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
        const horizontal = this.orientation() === 'horizontal';
        // Along the axis `u` runs from 0 to LENGTH; across it `v` is measured from the axis line.
        const pt = (u: number, v: number) => {
            const p = horizontal ? { x: u, y: v } : { x: v, y: LENGTH - u };

            box.minX = Math.min(box.minX, p.x);
            box.maxX = Math.max(box.maxX, p.x);
            box.minY = Math.min(box.minY, p.y);
            box.maxY = Math.max(box.maxY, p.y);

            return p;
        };
        const axes = this.resolved().map((axis, ai) => this.buildAxis(axis, ai, shown, horizontal, pt));

        if (!Number.isFinite(box.minX)) return { viewBox: '0 0 400 100', axes };

        const pad = 8;

        return { viewBox: `${round(box.minX - pad)} ${round(box.minY - pad)} ${round(box.maxX - box.minX + pad * 2)} ${round(box.maxY - box.minY + pad * 2)}`, axes };
    });

    constructor() {
        super();

        this.startAnimation();
        // A hover over the gauge is not a reason to run change detection: only a drag does.
        afterNextRender(() => this.followPointer(this.svgRef().nativeElement, (event) => this.onPointerMove(event)));

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

    private buildAxis(axis: LinearAxis, ai: number, shown: Record<string, number>, horizontal: boolean, pt: (u: number, v: number) => { x: number; y: number }): LinearAxisView {
        const min = axis.minimum ?? 0;
        const max = axis.maximum ?? 100;
        const span = max - min || 1;
        const s = axis.opposedPosition ? -1 : 1;
        const inverse = !!axis.isInversed;
        const u = (v: number) => ((inverse ? max - v : v - min) / span) * LENGTH;
        const c: LinearContainer = this.container();
        const ranges = axis.ranges ?? [];
        const pointers = axis.pointers ?? [];
        const widest = Math.max(...ranges.map((r) => Math.max(r.startWidth ?? 10, r.endWidth ?? 10)), ...pointers.map((p) => p.width ?? 8), 0);
        const type = c.type ?? 'normal';
        const thickness = c.width ?? Math.max(widest + 8, 20);
        const gap = 4 + (c.offset ?? 0);
        // The container lies on the side opposite the labels, next to the axis line.
        const cNear = -s * gap;
        const cFar = -s * (gap + thickness);
        const cMid = (cNear + cFar) / 2;
        const rect = (u0: number, u1: number, v0: number, v1: number, radius = 0) => {
            const a = pt(Math.min(u0, u1), v0);
            const b = pt(Math.max(u0, u1), v1);
            const x = Math.min(a.x, b.x);
            const y = Math.min(a.y, b.y);
            const w = Math.abs(b.x - a.x);
            const h = Math.abs(b.y - a.y);
            const r = Math.min(radius, w / 2, h / 2);

            return `M${round(x + r)} ${round(y)}H${round(x + w - r)}${r ? `A${round(r)} ${round(r)} 0 0 1 ${round(x + w)} ${round(y + r)}` : ''}V${round(y + h - r)}${r ? `A${round(r)} ${round(r)} 0 0 1 ${round(x + w - r)} ${round(y + h)}` : ''}H${round(x + r)}${r ? `A${round(r)} ${round(r)} 0 0 1 ${round(x)} ${round(y + h - r)}` : ''}V${round(y + r)}${r ? `A${round(r)} ${round(r)} 0 0 1 ${round(x + r)} ${round(y)}` : ''}Z`;
        };

        const out: LinearAxisView = { index: ai, line: this.lineOf(pt, 0, LENGTH, 0, axis.lineStyle?.width ?? 2, axis.lineStyle?.color), ranges: [], major: [], minor: [], labels: [], pointers: [] };
        const startAt = inverse ? LENGTH : 0;

        // Container.
        const round2 = type === 'roundedRectangle' || type === 'thermometer' ? thickness / 2 : 0;

        out.container = { d: rect(0, LENGTH, cNear, cFar, round2), color: c.backgroundColor, stroke: c.border?.color, strokeWidth: c.border?.width };

        // A thermometer has a bulb at the foot of the scale, and the bar grows out of it.
        let barStart = startAt;

        if (type === 'thermometer') {
            const r = thickness * 0.9;
            const away = inverse ? 1 : -1;
            const centreU = startAt + away * r * 0.6;
            const centre = pt(centreU, cMid);

            out.bulb = { cx: centre.x, cy: centre.y, r, color: pointers[0]?.color ?? c.backgroundColor };
            barStart = centreU;
            // Room for the bulb in the box.
            pt(centreU + away * r, cMid - r);
            pt(centreU + away * r, cMid + r);
        }

        // Ranges.
        out.ranges = ranges.map((r) => {
            const from = u(Math.max(Math.min(r.start, r.end), min));
            const to = u(Math.min(Math.max(r.start, r.end), max));
            const sw = r.startWidth ?? 10;
            const ew = r.endWidth ?? sw;
            const position = r.position ?? 'inside';
            const base = position === 'inside' ? -s * 0 : position === 'outside' ? 0 : (-sw / 2) * s;
            const dir = position === 'outside' ? s : -s;
            const a = pt(from, base);
            const b = pt(to, base);
            const a2 = pt(from, base + dir * sw);
            const b2 = pt(to, base + dir * ew);

            return { d: `M${round(a.x)} ${round(a.y)}L${round(b.x)} ${round(b.y)}L${round(b2.x)} ${round(b2.y)}L${round(a2.x)} ${round(a2.y)}Z`, color: r.color, title: this.rangeLabel(r) };
        });

        // Ticks and labels, on the side opposite the container.
        const major = axis.majorTicks ?? {};
        const minor = axis.minorTicks ?? {};
        const ticks = axisTicks(min, max, major.interval, minor.interval);
        const outsideRange = Math.max(0, ...ranges.filter((r) => r.position === 'outside').map((r) => Math.max(r.startWidth ?? 10, r.endWidth ?? 10)));
        const tickBase = s * (outsideRange + (major.offset ?? 0));
        const tick = (v: number, spec: typeof major, h: number, w: number): Line => this.lineOf(pt, u(v), u(v), tickBase, spec.width ?? w, spec.useRangeColor ? rangeColorAt(v, ranges, spec.color ?? 'currentColor') : spec.color, s * h);

        out.major = ticks.major.map((v) => tick(v, major, major.height ?? 8, 1.5));
        out.minor = ticks.minor.map((v) => tick(v, minor, minor.height ?? 4, 1));

        const labelStyle = axis.labelStyle ?? {};
        const font = labelStyle.font ?? {};
        const size = font.size ?? 10;

        if (!labelStyle.hidden) {
            const v = tickBase + s * ((major.height ?? 8) + (labelStyle.offset ?? 6) + (horizontal ? size / 2 : 0));

            out.labels = ticks.major.map((value) => {
                const p = pt(u(value), v + (horizontal ? 0 : s * 0));

                return {
                    x: p.x,
                    y: p.y,
                    text: formatLabel(value, labelStyle.format, this.locale()),
                    anchor: horizontal ? 'middle' : s > 0 ? 'start' : 'end',
                    size,
                    family: font.fontFamily,
                    weight: font.fontWeight,
                    color: labelStyle.useRangeColor ? rangeColorAt(value, ranges, font.color ?? 'currentColor') : font.color
                };
            });

            // The text runs past its anchor: room for it.
            if (!horizontal) pt(0, v + s * size * 3);
        }

        // Pointers.
        out.pointers = pointers.map((p: LinearPointer, pi) => {
            const key = this.keyOf(ai, pi);
            const value = shown[key] ?? p.value;
            const w = p.width ?? 8;
            const h = p.height ?? 12;
            const place = p.placement ?? 'center';
            const v0 = place === 'near' ? cNear : place === 'far' ? cFar : cMid;
            const description = p.description ?? formatLabel(this.targets()[key]?.value ?? p.value, undefined, this.locale());
            const base = { key, axisIndex: ai, pointerIndex: pi, type: (p.type ?? 'bar') as 'bar' | 'marker', value, color: p.color, title: description };

            if (base.type === 'bar') {
                const half = w / 2;
                const centre = v0 + (place === 'near' ? -s * half : place === 'far' ? s * half : 0) + (p.offset ?? 0);
                const reach = u(value);

                return { ...base, d: rect(Math.min(barStart, reach), Math.max(barStart, reach), centre - half, centre + half, p.roundedCornerRadius ?? (type === 'normal' ? 0 : half)) };
            }

            const pos = pt(u(value), v0 + (p.offset ?? 0));
            // The shape points up; turn it to point from the container towards the axis.
            const turn = horizontal ? (s > 0 ? 180 : 0) : s > 0 ? 90 : -90;

            return { ...base, d: markerShapePath(p.markerShape ?? 'triangle', h, w), transform: `translate(${round(pos.x)} ${round(pos.y)}) rotate(${turn})` };
        });

        return out;
    }

    private lineOf(pt: (u: number, v: number) => { x: number; y: number }, u0: number, u1: number, v: number, width: number, color?: string, length = 0): Line {
        const a = pt(u0, v);
        const b = pt(u1, v + length);

        return { x1: a.x, y1: a.y, x2: b.x, y2: b.y, width, color };
    }

    // ---------------------------------------------------------------------------------------------
    // Interaction
    // ---------------------------------------------------------------------------------------------

    private setValue(axisIndex: number, pointerIndex: number, raw: number, dragging: boolean): void {
        const axis = this.resolved()[axisIndex];

        if (!axis?.pointers?.[pointerIndex]) return;

        const value = Math.min(Math.max(raw, axis.minimum ?? 0), axis.maximum ?? 100);

        this.overrides.update((o) => ({ ...o, [this.keyOf(axisIndex, pointerIndex)]: value }));

        if (this.simple() && axisIndex === 0 && pointerIndex === 0) this.value.set(value);

        this.pointerChange.emit({ axisIndex, pointerIndex, value, dragging });
    }

    /** Sets the value of a pointer. */
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
    onPointerDown(event: PointerEvent, p: LinearPointerView): void {
        if (!this.enablePointerDrag() || (event.pointerType === 'mouse' && event.button !== 0)) return;

        event.preventDefault();
        this.drag = { axisIndex: p.axisIndex, pointerIndex: p.pointerIndex, pointerId: event.pointerId };
        this.capture(event.pointerId);
        this.svgRef().nativeElement.focus({ preventScroll: true });
    }

    /** @internal */
    onPointerMove(event: PointerEvent): void {
        const d = this.drag;

        if (!d || event.pointerId !== d.pointerId) return;

        const svg = this.svgRef().nativeElement;
        const ctm = svg.getScreenCTM();
        const axis = this.resolved()[d.axisIndex];

        if (!ctm || !axis) return;

        const point = svg.createSVGPoint();

        point.x = event.clientX;
        point.y = event.clientY;

        const local = point.matrixTransform(ctm.inverse());
        const along = this.orientation() === 'horizontal' ? local.x : LENGTH - local.y;
        const t = Math.min(Math.max(along / LENGTH, 0), 1);
        const min = axis.minimum ?? 0;
        const max = axis.maximum ?? 100;

        this.zone.run(() => this.setValue(d.axisIndex, d.pointerIndex, axis.isInversed ? max - t * (max - min) : min + t * (max - min), true));
    }

    /** @internal */
    onPointerUp(event: PointerEvent): void {
        const d = this.drag;

        if (!d || event.pointerId !== d.pointerId) return;

        this.drag = null;

        const value = this.targets()[this.keyOf(d.axisIndex, d.pointerIndex)]?.value;

        if (value !== undefined) this.pointerChange.emit({ axisIndex: d.axisIndex, pointerIndex: d.pointerIndex, value, dragging: false });
    }

    /** @internal */
    onKeydown(event: KeyboardEvent): void {
        if (!this.enablePointerDrag()) return;

        const axis = this.resolved()[0];
        const target = this.targets()[this.keyOf(0, 0)];

        if (!axis || !target) return;

        const min = axis.minimum ?? 0;
        const max = axis.maximum ?? 100;
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
    imports: [LinearGauge, SharedModule],
    exports: [LinearGauge, SharedModule]
})
export class LinearGaugeModule {}

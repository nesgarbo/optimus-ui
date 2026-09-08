import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, computed, input, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { SchedulerEvent, SchedulerResource, SchedulerTimelineScale, SchedulerViewType } from '@openng/optimus-ui/types/scheduler';
import { isResourceTimeline, timelineScaleOf, toDate } from './scheduler-date';
import { layoutTimeGrid } from './scheduler-layout';
import { buildTimelineAxis, placeOnAxis } from './scheduler-timeline-axis';
import { SchedulerViewBase } from './scheduler-view-base';

/**
 * The timeline: time laid out left to right instead of top to bottom.
 *
 * One renderer covers all eight timeline views, because they differ in only two dimensions — how
 * many lanes they have (`timeline*` is a single lane, `resourceTimeline*` is one per resource plus a
 * sticky rail of labels) and how far the axis spans (a day, a week, a month, a year). Splitting them
 * would duplicate the axis, the header, the scroll container and the positioning maths four times
 * over.
 *
 * The axis itself lives in {@link buildTimelineAxis}: on the day and week scales it is made of time
 * slots bounded by `dayStartHour`/`dayEndHour` and therefore skips the nights, so an event's
 * position is NOT a linear fraction of the range and has to be asked for.
 *
 * The rail is `position: sticky` rather than a separate scroller: two scrollers side by side have to
 * be synchronised by hand, and they drift the moment anything else scrolls the page.
 *
 * @module scheduler-timeline
 */
@Component({
    selector: 'p-scheduler-timeline-view',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        <div class="p-scheduler-timeline" [class.p-scheduler-timeline-resource]="grouped()" [attr.data-view]="view" [attr.data-scale]="scale()">
            <!-- ── Carril de recursos, pegado al inicio de la línea ───────────────────────────── -->
            @if (grouped()) {
                <div class="p-scheduler-resource-area" data-slot="scheduler-resource-area" [style.--p-scheduler-timeline-tiers]="tiers().length">
                    <div class="p-scheduler-resource-area-header" data-slot="scheduler-resource-area-header">
                        @if (resourceAreaHeaderDef(); as tpl) {
                            <ng-container *ngTemplateOutlet="tpl" />
                        } @else {
                            {{ labels().resources }}
                        }
                    </div>
                    <div class="p-scheduler-resource-list" data-slot="scheduler-resource-list">
                        @for (lane of lanes(); track lane.key) {
                            <div class="p-scheduler-resource" data-slot="scheduler-resource" [attr.data-resource-id]="lane.resource?.id" [attr.data-depth]="lane.depth" [attr.data-event-count]="lane.events.length">
                                @if (resourceRowDef() ?? resourceDef(); as tpl) {
                                    <ng-container *ngTemplateOutlet="tpl; context: lane.context" />
                                } @else {
                                    <span class="p-scheduler-resource-dot" [style.background]="lane.resource?.color" aria-hidden="true"></span>
                                    <span class="p-scheduler-resource-label">{{ lane.title }}</span>
                                    @if (lane.events.length) {
                                        <span class="p-scheduler-resource-count" data-slot="scheduler-resource-aggregate-badge">{{ lane.events.length }}</span>
                                    }
                                }
                            </div>
                        }
                    </div>
                </div>
            }

            <!-- ── Eje horizontal + carriles ──────────────────────────────────────────────────── -->
            <div #scroll class="p-scheduler-timeline-scroll" [attr.data-virtual]="virtualized() ? '' : null" [style.--p-scheduler-timeline-cols]="slots().length" [style.--p-scheduler-timeline-tiers]="tiers().length" (scroll)="onScroll()">
                <!-- Las bandas de contexto sobre las columnas: sin ellas un eje de horas no dice de
                     qué día son, y uno de días no dice de qué mes. Cada celda abarca las columnas
                     que le tocan a través de una plantilla de rejilla compartida, que es lo que las
                     mantiene cuadradas con el eje. -->
                @for (tier of tiers(); track tier.key) {
                    <div class="p-scheduler-timeline-tier" [attr.data-tier]="tier.key" [style.--p-scheduler-timeline-tier-index]="$index">
                        @for (cell of tier.cells; track cell.key) {
                            <!-- La etiqueta va en un span pegajoso, no suelta en la celda: una celda
                                 de periodo abarca treinta columnas y su texto se salía de la vista en
                                 cuanto el eje se desplazaba, dejando la banda en blanco. -->
                            <div class="p-scheduler-timeline-tier-cell" [attr.data-today]="cell.today && multiDay() ? '' : null" [style.--p-scheduler-timeline-span]="cell.span">
                                <span class="p-scheduler-timeline-tier-label">{{ cell.label }}</span>
                            </div>
                        }
                    </div>
                }

                <div class="p-scheduler-timeline-header">
                    <!-- Con virtualización solo se monta la ventana visible, así que cada celda dice
                         en qué columna va: sin grid-column-start, la primera celda montada caería en
                         la columna 1 y el eje entero se desplazaría al hacer scroll. -->
                    @for (slot of visibleSlots(); track slot.key) {
                        <div
                            class="p-scheduler-timeline-header-cell"
                            data-slot="scheduler-timeline-header-cell"
                            [attr.data-time]="slot.label"
                            [attr.data-major]="slot.major ? '' : null"
                            [attr.data-today]="slot.today && multiDay() ? '' : null"
                            [attr.data-col-index]="slot.index"
                            [style.grid-column-start]="slot.index + 1"
                        >
                            @if (timelineHeaderCellDef(); as tpl) {
                                <ng-container *ngTemplateOutlet="tpl; context: slot.context" />
                            } @else if (slot.major || !dense()) {
                                {{ slot.label }}
                            }
                        </div>
                    }
                </div>

                <div class="p-scheduler-timeline-body" data-slot="scheduler-timeline-body">
                    @for (lane of visibleLanes(); track lane.key) {
                        <div class="p-scheduler-timeline-lane" data-slot="scheduler-timeline-lane" [attr.data-resource-id]="lane.resource?.id" [style.--p-scheduler-timeline-rows]="lane.rowCount">
                            <div class="p-scheduler-timeline-cells">
                                @for (cell of lane.cells; track cell.key) {
                                    <div
                                        class="p-scheduler-timeline-cell"
                                        data-slot="scheduler-timeline-cell"
                                        [attr.data-major]="cell.major ? '' : null"
                                        [attr.data-today]="cell.today && multiDay() ? '' : null"
                                        [attr.data-blocked]="cell.binding.context.blocked ? '' : null"
                                        [attr.data-start-date]="cell.start.getTime()"
                                        [attr.data-end-date]="cell.end.getTime()"
                                        [attr.data-col-index]="cell.index"
                                        [style.grid-column-start]="cell.index + 1"
                                        (click)="onSlotClick($event, cell.start, cell.end)"
                                        (contextmenu)="onCellContextMenu($event, cell.start)"
                                    >
                                        @if (timelineCellDef(); as tpl) {
                                            <ng-container *ngTemplateOutlet="tpl; context: cell.binding.context; injector: cellInjector(cell.binding.key)" />
                                        }
                                    </div>
                                }
                            </div>

                            @for (item of lane.items; track item.key) {
                                <div
                                    class="p-scheduler-timeline-event"
                                    data-slot="scheduler-timeline-event"
                                    [attr.data-event-id]="item.context.event.id"
                                    [attr.data-selected]="item.context.selected ? '' : null"
                                    [attr.data-continues-before]="item.context.continuesBefore ? '' : null"
                                    [attr.data-continues-after]="item.context.continuesAfter ? '' : null"
                                    [style.inset-inline-start.%]="item.offset * 100"
                                    [style.inline-size.%]="item.size * 100"
                                    [style.--p-scheduler-event-row]="item.row"
                                    [style.--p-scheduler-event-border-accent]="item.context.accentColor"
                                    (click)="onEventClick($event, item.context.event)"
                                    (mouseenter)="onEventPeek($event, item.context.event)"
                                    (mouseleave)="onEventPeekEnd()"
                                    (focusin)="onEventPeek($event, item.context.event)"
                                    (focusout)="onEventPeekEnd()"
                                    (contextmenu)="onEventContextMenu($event, item.context.event)"
                                    (pointerdown)="onEventPointerDown($event, item.context.event)"
                                    [attr.data-dragging]="item.context.dragging ? '' : null"
                                    [attr.data-resizing]="item.context.resizing ? '' : null"
                                    [attr.data-draggable]="item.context.draggable ? '' : null"
                                >
                                    @if (timelineEventDef(); as tpl) {
                                        <ng-container *ngTemplateOutlet="tpl; context: item.context; injector: eventInjector(item.key)" />
                                    } @else {
                                        <span class="p-scheduler-event-title">{{ item.context.title }}</span>
                                        <span class="p-scheduler-event-time">{{ item.context.timeText }}</span>
                                    }
                                    @if (item.context.resizable) {
                                        <!-- Los tiradores viven DENTRO de la superficie del evento, así que su
                                             pointerdown tiene que parar la propagación o el mismo gesto arrancaría
                                             también un movimiento. Lo hace el controlador. -->
                                        <span class="p-scheduler-event-resize-handle" data-slot="scheduler-event-resize-handle" data-edge="start" aria-hidden="true" (pointerdown)="onResizePointerDown($event, item.context.event, 'start')"></span>
                                        <span class="p-scheduler-event-resize-handle" data-slot="scheduler-event-resize-handle" data-edge="end" aria-hidden="true" (pointerdown)="onResizePointerDown($event, item.context.event, 'end')"></span>
                                    }
                                </div>
                            }
                        </div>
                    } @empty {
                        <div class="p-scheduler-timeline-empty">{{ labels().empty }}</div>
                    }
                </div>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'p-scheduler-view p-scheduler-view-timeline' }
})
export class SchedulerTimelineView extends SchedulerViewBase {
    /** Which of the timeline views is being drawn. */
    readonly viewType = input.required<SchedulerViewType>();

    /** @internal */
    override get view(): SchedulerViewType {
        return this.viewType();
    }

    /** Whether the lanes are resources rather than a single lane. */
    readonly grouped = computed(() => isResourceTimeline(this.viewType()));

    /** How far the axis spans. */
    readonly scale = computed<SchedulerTimelineScale>(() => timelineScaleOf(this.viewType()) ?? 'day');

    /** @internal */
    readonly labels = computed(() => this.state.labels());

    /** @internal */
    readonly timelineHeaderCellDef = computed(() => this.def('timelineHeaderCell'));
    /** @internal */
    readonly timelineCellDef = computed(() => this.def('timelineCell'));
    /** @internal */
    readonly timelineEventDef = computed(() => this.def('timelineEvent'));
    /** @internal */
    readonly resourceAreaHeaderDef = computed(() => this.def('resourceAreaHeader'));
    /** @internal */
    readonly resourceRowDef = computed(() => this.def('resourceRow'));
    /** @internal */
    readonly resourceDef = computed(() => this.def('resource'));

    /** The axis of the active scale. */
    readonly axis = computed(() =>
        buildTimelineAxis(this.scale(), {
            range: this.state.range(),
            dayBounds: this.state.dayBounds(),
            slotMinutes: this.state.timelineSlotMinutes(),
            firstDayOfWeek: this.state.firstDayOfWeek(),
            locale: this.locale()
        })
    );

    /** Columns of the axis, with their index and the context a header-cell definition receives. */
    readonly slots = computed(() =>
        this.axis().slots.map((slot, index) => ({
            ...slot,
            index,
            context: { $implicit: slot.start, date: slot.start, end: slot.end, label: slot.label, hour: slot.start.getHours(), minute: slot.start.getMinutes(), major: slot.major, today: slot.today }
        }))
    );

    /** Horizontal scroll offset of the axis, in pixels. */
    private readonly scrollOffset = signal(0);

    /** Width of the scroll viewport, in pixels. */
    private readonly viewportWidth = signal(0);

    /** Measured width of one column, in pixels. */
    private readonly columnWidth = signal(0);

    /**
     * Whether the axis is being windowed.
     *
     * `auto` only turns it on past `timelineVirtualThreshold`, because windowing costs a scroll
     * listener and a measurement per frame and buys nothing on a twelve-column year. It also needs a
     * measured column width: until the first measurement lands, everything is rendered, which is the
     * safe direction to be wrong in.
     */
    readonly virtualized = computed(() => {
        const mode = this.state.timelineVirtualScroll();
        if (mode === false) return false;
        if (!this.columnWidth() || !this.viewportWidth()) return false;
        return mode === true || this.slots().length >= this.state.timelineVirtualThreshold();
    });

    /** Index range of the columns to mount, inclusive. */
    private readonly windowRange = computed(() => {
        const slots = this.slots();
        if (!this.virtualized()) return { first: 0, last: slots.length - 1 };

        const width = this.columnWidth();
        const overscan = this.state.timelineVirtualOverscan();
        const first = Math.max(Math.floor(this.scrollOffset() / width) - overscan, 0);
        const last = Math.min(Math.ceil((this.scrollOffset() + this.viewportWidth()) / width) + overscan, slots.length - 1);
        return { first, last };
    });

    /** The columns actually mounted. */
    readonly visibleSlots = computed(() => {
        const { first, last } = this.windowRange();
        const slots = this.slots();
        return first === 0 && last === slots.length - 1 ? slots : slots.slice(first, last + 1);
    });

    /**
     * Header bands to draw.
     *
     * The day scale only gets them in the resource views: on a plain single-lane day timeline the
     * date is already in the header title, and two extra bands over twelve columns is chrome saying
     * what the toolbar just said.
     */
    readonly tiers = computed(() => (this.scale() === 'day' && !this.grouped() ? [] : this.axis().tiers));

    /** Whether the axis spans more than one day, which is what makes marking today worth it. */
    readonly multiDay = computed(() => this.axis().multiDay);

    /**
     * Whether to label only the columns that start a unit.
     *
     * It is about the column's WIDTH in time, not how many there are: a week at 30-minute slots is
     * 168 columns and printing every half hour turns the header into a smear, while a month is 30
     * columns that each need their day number. So the rule is sub-hour time columns only.
     */
    readonly dense = computed(() => (this.scale() === 'day' || this.scale() === 'week') && this.state.timelineSlotMinutes() < 60);

    /**
     * The lanes: one per resource in the grouped views, a single unnamed one otherwise.
     *
     * Events with a `resourceId` that matches nothing go to their own trailing lane instead of being
     * dropped — silently hiding an appointment because its resource was deleted is the worst
     * possible failure for a scheduler.
     */
    readonly lanes = computed(() => {
        const axis = this.axis();
        const range = this.state.range();
        const events = this.state.visibleEvents();
        const duration = this.state.defaultEventDuration();
        const interacting = this.state.interactingEventId();

        const groups: { key: string; resource?: SchedulerResource; title: string; depth: number; events: SchedulerEvent[] }[] = this.grouped()
            ? [
                  ...this.state.resources().map((resource) => ({
                      key: String(resource.id),
                      resource,
                      title: resource.name ?? String(resource.id),
                      depth: resource.parentId != null ? 1 : 0,
                      events: events.filter((event) => event.resourceId === resource.id)
                  })),
                  ...(() => {
                      const known = new Set(this.state.resources().map((r) => r.id));
                      const orphans = events.filter((event) => event.resourceId == null || !known.has(event.resourceId));
                      return orphans.length ? [{ key: '__unassigned', title: this.labels().unassigned, depth: 0, events: orphans }] : [];
                  })()
              ]
            : [{ key: '__all', title: '', depth: 0, events }];

        return groups.map((group) => {
            // El reparto en filas por solape sigue siendo aritmética de tiempo y se calcula sobre el
            // rango completo; lo que se reemplaza es la geometría, que la pone el eje.
            const packed = layoutTimeGrid(group.events, {
                range,
                defaultEventDuration: duration,
                minEventMinutes: this.state.minEventMinutes()
            });
            const laid = placeOnAxis(packed, axis, (event) => {
                const start = toDate(event.start);
                const end = event.end != null ? toDate(event.end) : new Date(start.getTime() + duration * 60_000);
                return { start, end: end > start ? end : new Date(start.getTime() + duration * 60_000) };
            });

            const cells = axis.slots.map((slot, index) => ({
                key: `${group.key}|${slot.key}`,
                index,
                start: slot.start,
                end: slot.end,
                major: slot.major,
                today: slot.today,
                binding: this.bindCell(slot.start, [], { resource: group.resource, label: '' })
            }));

            return {
                ...group,
                cells,
                // En horizontal el solape se resuelve apilando filas, no partiendo el ancho: cortar
                // una barra de tiempo por la mitad a lo alto la vuelve ilegible.
                rowCount: Math.max(
                    laid.reduce((max, item) => Math.max(max, item.column + 1), 1),
                    1
                ),
                items: laid.map((item) => ({
                    offset: item.offset,
                    size: item.size,
                    // La barra que se arrastra se queda en la primera fila y flota por encima (lo hace
                    // el z-index de data-dragging): recolocarla de fila cada vez que roza otra cita
                    // la hacía saltar en vertical mientras el puntero iba en horizontal.
                    row: item.event.id === interacting ? 0 : item.column,
                    ...this.bindEvent(item.event, { continuesBefore: item.continuesBefore, continuesAfter: item.continuesAfter }, group.key)
                })),
                context: laneContext(group)
            };
        });
    });

    /** Range the axis was last scrolled for, so the scroll happens once per range and not per pass. */
    private scrolledKey: string | null = null;

    /**
     * The lanes with their cells and events clipped to the scroll window.
     *
     * The events are windowed in PIXELS and not in columns, plus a buffer: a bar can be one column
     * wide or three hundred, so intersecting its span with the viewport is the only test that keeps
     * a long booking mounted while you scroll through its middle.
     */
    readonly visibleLanes = computed(() => {
        const lanes = this.lanes();
        if (!this.virtualized()) return lanes;

        const { first, last } = this.windowRange();
        const width = this.columnWidth();
        const buffer = this.state.timelineVirtualEventBuffer();
        const total = this.slots().length * width;
        const from = this.scrollOffset() - buffer;
        const to = this.scrollOffset() + this.viewportWidth() + buffer;

        return lanes.map((lane) => ({
            ...lane,
            cells: lane.cells.slice(first, last + 1),
            items: lane.items.filter((item) => {
                const start = item.offset * total;
                return start < to && start + item.size * total > from;
            })
        }));
    });

    private readonly scroll = viewChild<ElementRef<HTMLElement>>('scroll');

    /** Reads the scroll offset back on every scroll of the axis. */
    protected onScroll(): void {
        const host = this.scroll()?.nativeElement;
        if (!host) return;
        // Math.abs porque en RTL scrollLeft es negativo en los navegadores basados en Chromium: la
        // ventana se calcula sobre la distancia recorrida, que no tiene signo.
        this.scrollOffset.set(Math.abs(host.scrollLeft));
        this.measure(host);
    }

    /**
     * Measures the viewport and one column.
     *
     * The column is measured off the DOM and not derived from the token: the axis is
     * `minmax(slotWidth, 1fr)`, so a column is wider than its token whenever the axis fits, and
     * computing the window from the token would then window the wrong columns.
     */
    private measure(host: HTMLElement): void {
        const viewport = host.clientWidth;
        if (viewport && viewport !== this.viewportWidth()) this.viewportWidth.set(viewport);

        const cell = host.querySelector('.p-scheduler-timeline-header-cell');
        const width = cell?.getBoundingClientRect().width ?? 0;
        if (width && Math.abs(width - this.columnWidth()) > 0.5) this.columnWidth.set(width);
    }

    ngAfterViewChecked(): void {
        const lanes = this.visibleLanes();
        this.publishContexts(
            lanes.flatMap((lane) => lane.items),
            lanes.flatMap((lane) => lane.cells.map((cell) => cell.binding))
        );

        // Ni medir ni auto-desplazar mientras se arrastra: las dos cosas leen geometría, y el
        // arrastre provoca un ciclo de detección por frame. Medir ahí es forzar un reflow por frame
        // justo cuando lo que hace falta es soltar el hilo.
        if (this.state.drag.active) return;

        const host = this.scroll()?.nativeElement;
        if (host) this.measure(host);
        this.scrollToToday();
    }

    /**
     * Brings today's first column into view when the axis spans more than a day.
     *
     * A month or a year of columns is several screens wide, and landing on the 1st of January to
     * look at something happening in September is not a scheduler, it is a puzzle. `scrollIntoView`
     * rather than writing `scrollLeft` because the two directions disagree on the sign of
     * `scrollLeft`, and this has to work in RTL.
     */
    private scrollToToday(): void {
        const axis = this.axis();
        const host = this.scroll()?.nativeElement;
        if (!host || !axis.multiDay) return;

        const range = this.state.range();
        const key = `${this.viewType()}|${range.start.getTime()}|${range.end.getTime()}`;
        if (this.scrolledKey === key) return;
        this.scrolledKey = key;

        const target = host.querySelector('.p-scheduler-timeline-header-cell[data-today]');
        target?.scrollIntoView({ block: 'nearest', inline: 'start' });
    }
}

/**
 * Context a resource-row definition receives.
 *
 * `$implicit` is the CONTEXT and not the resource, like every other definition in the Scheduler: a
 * template written as `let ctx` has to reach `ctx.title` and `ctx.count` the same way it does in the
 * month or the agenda. The resource itself stays available as `ctx.resource`.
 */
function laneContext(group: { resource?: SchedulerResource; title: string; depth: number; events: SchedulerEvent[] }) {
    const context = {
        resource: group.resource,
        title: group.title,
        depth: group.depth,
        group: false,
        expanded: true,
        toggle: () => undefined,
        events: group.events,
        count: group.events.length
    };
    return { ...context, $implicit: context, context };
}

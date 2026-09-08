import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { SchedulerEvent, SchedulerViewType } from '@openng/optimus-ui/types/scheduler';
import { addMinutes, dayKey, eachDay, endOfDay, formatTime, isToday, startOfDay, timeSlots } from './scheduler-date';
import { groupByDay, layoutRows, layoutTimeGrid } from './scheduler-layout';
import { SchedulerViewBase } from './scheduler-view-base';

/**
 * The vertical time grid: one column per day, an all-day strip on top and a time gutter down the
 * left. Day and week are the same renderer with a different range — the only difference between
 * them is how many columns come out of {@link eachDay}.
 *
 * @module scheduler-time-grid
 */
@Component({
    selector: 'p-scheduler-time-grid-view',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        <div class="p-scheduler-time-grid" [attr.data-view]="view" [attr.data-business-hours]="hasBusinessHours() ? '' : null" [style.--p-scheduler-columns]="days().length">
            <!-- ── Cabecera: hueco del gutter + una columna por día ───────────────────────── -->
            <div class="p-scheduler-time-grid-header">
                <div class="p-scheduler-time-gutter-spacer">{{ timeZoneLabel() }}</div>
                @for (day of days(); track day.key) {
                    <div class="p-scheduler-day-header-cell" data-slot="scheduler-day-header" [attr.data-date]="day.key" [attr.data-today]="day.today ? '' : null" [attr.data-weekend]="day.weekend ? '' : null">
                        @if (dayHeaderDef(); as tpl) {
                            <ng-container *ngTemplateOutlet="tpl; context: day.cell.context; injector: cellInjector(day.cell.key)" />
                        } @else {
                            <span class="p-scheduler-day-header-number">{{ day.date.getDate() }}</span>
                            <span class="p-scheduler-day-header-weekday">{{ day.weekdayLabel }}</span>
                        }
                    </div>
                }
            </div>

            <!-- ── Banda de todo el día ───────────────────────────────────────────────────── -->
            @if (allDayRows().length || alwaysShowAllDay()) {
                <div class="p-scheduler-all-day-row" data-slot="scheduler-all-day-row" [style.--p-scheduler-all-day-rows]="allDayRowCount()">
                    <div class="p-scheduler-all-day-gutter">{{ labels().allDay }}</div>
                    <div class="p-scheduler-all-day-lanes">
                        @for (day of days(); track day.key) {
                            <div
                                class="p-scheduler-all-day-cell"
                                data-slot="scheduler-all-day-cell"
                                [attr.data-date]="day.key"
                                [attr.data-start-date]="day.date.getTime()"
                                [attr.data-end-date]="day.end.getTime()"
                                (click)="onSlotClick($event, day.date, day.end)"
                            >
                                @if (allDayCellDef(); as tpl) {
                                    <ng-container *ngTemplateOutlet="tpl; context: day.allDayCell.context; injector: cellInjector(day.allDayCell.key)" />
                                }
                            </div>
                        }
                        @for (item of allDayRows(); track item.key) {
                            <div
                                class="p-scheduler-all-day-event"
                                data-slot="scheduler-all-day-event"
                                [attr.data-event-id]="item.context.event.id"
                                [attr.data-selected]="item.context.selected ? '' : null"
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
                                @if (allDayEventDef(); as tpl) {
                                    <ng-container *ngTemplateOutlet="tpl; context: item.context; injector: eventInjector(item.key)" />
                                } @else {
                                    <span class="p-scheduler-event-title">{{ item.context.title }}</span>
                                }
                            </div>
                        }
                    </div>
                </div>
            }

            <!-- ── Cuerpo: gutter + columnas con los eventos posicionados ─────────────────── -->
            <div class="p-scheduler-time-grid-body" data-slot="scheduler-content">
                <div class="p-scheduler-time-gutter" data-slot="scheduler-time-gutter">
                    @for (slot of slots(); track slot.minutes) {
                        <div class="p-scheduler-time-gutter-slot" [attr.data-time]="slot.label" [attr.data-major]="slot.major ? '' : null">
                            @if (timeGutterDef(); as tpl) {
                                <ng-container *ngTemplateOutlet="tpl; context: slot.context" />
                            } @else {
                                <span class="p-scheduler-time-gutter-label">{{ slot.label }}</span>
                            }
                        </div>
                    }
                </div>

                @for (day of days(); track day.key) {
                    <div class="p-scheduler-time-grid-column" data-slot="scheduler-time-grid-column" [attr.data-date]="day.key" [attr.data-today]="day.today ? '' : null">
                        @for (cell of day.cells; track cell.key) {
                            <div
                                class="p-scheduler-time-grid-cell"
                                [attr.data-slot]="cell.business ? 'scheduler-work-cell' : 'scheduler-time-grid-cell'"
                                [attr.data-time]="cell.label"
                                [attr.data-major]="cell.major ? '' : null"
                                [attr.data-business]="cell.business ? '' : null"
                                [attr.data-blocked]="cell.binding.context.blocked ? '' : null"
                                [attr.data-start-date]="cell.start.getTime()"
                                [attr.data-end-date]="cell.end.getTime()"
                                (click)="onSlotClick($event, cell.start, cell.end)"
                                (contextmenu)="onCellContextMenu($event, cell.start)"
                            >
                                @if (cellDef(cell.business); as tpl) {
                                    <ng-container *ngTemplateOutlet="tpl; context: cell.binding.context; injector: cellInjector(cell.binding.key)" />
                                }
                            </div>
                        }

                        @for (item of day.events; track item.key) {
                            <div
                                class="p-scheduler-time-grid-event"
                                data-slot="scheduler-time-grid-event"
                                [attr.data-event-id]="item.context.event.id"
                                [attr.data-selected]="item.context.selected ? '' : null"
                                [attr.data-continues-before]="item.continuesBefore ? '' : null"
                                [attr.data-continues-after]="item.continuesAfter ? '' : null"
                                [style.inset-block-start.%]="item.top * 100"
                                [style.block-size.%]="item.height * 100"
                                [style.inset-inline-start.%]="item.left * 100"
                                [style.inline-size.%]="item.width * 100"
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
                                @if (timeGridEventDef(); as tpl) {
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

                        @if (day.today) {
                            <div class="p-scheduler-now-indicator" aria-hidden="true" [style.inset-block-start.%]="nowOffset() * 100"></div>
                        }
                    </div>
                }
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'p-scheduler-view p-scheduler-view-time-grid' }
})
export class SchedulerTimeGridView extends SchedulerViewBase {
    /** Which of the two views is being drawn. Only affects `data-view` and template resolution. */
    readonly viewType = input.required<SchedulerViewType>();

    /** Whether the all-day strip stays visible even with nothing in it. */
    readonly alwaysShowAllDay = input(true);

    /** @internal */
    override get view(): SchedulerViewType {
        return this.viewType();
    }

    /** @internal */
    readonly labels = computed(() => this.state.labels());

    /** @internal */
    readonly hasBusinessHours = computed(() => this.state.hasBusinessHours());

    /** @internal */
    readonly dayHeaderDef = computed(() => this.def('dayHeader'));
    /** @internal */
    readonly allDayCellDef = computed(() => this.def('allDayCell'));
    /** @internal */
    readonly allDayEventDef = computed(() => this.def('allDayEvent'));
    /** @internal */
    readonly timeGutterDef = computed(() => this.def('timeGutter'));
    /** @internal */
    readonly timeGridEventDef = computed(() => this.def('timeGridEvent'));

    /**
     * A working-hours cell prefers the `workCell` definition and falls back to `timeGridCell`, so a
     * page can style just the business hours without redeclaring every cell.
     */
    cellDef(business: boolean) {
        return (business ? this.def('workCell') : undefined) ?? this.def('timeGridCell');
    }

    /** Rows of the time gutter. */
    readonly slots = computed(() => {
        const { start, end } = this.state.dayBounds();
        const minutes = this.state.slotMinutes();
        return timeSlots(start, end, minutes).map((slot) => {
            const date = addMinutes(startOfDay(this.state.date()), slot.minutes);
            const label = formatTime(date, this.locale());
            return {
                ...slot,
                label,
                context: { $implicit: date, date, label, hour: date.getHours(), minute: date.getMinutes(), major: slot.major }
            };
        });
    });

    /** Where the "now" line sits inside the day, as a fraction. `null` outside the visible hours. */
    /**
     * Offset from UTC of the rendered day, as `GMT+2`. Goes in the gutter corner because a time grid
     * without it is ambiguous the moment the data comes from another zone.
     */
    readonly timeZoneLabel = computed(() => {
        const minutes = -this.state.date().getTimezoneOffset();
        const sign = minutes < 0 ? '-' : '+';
        const hours = Math.floor(Math.abs(minutes) / 60);
        const rest = Math.abs(minutes) % 60;
        return `GMT${sign}${hours}${rest ? `:${String(rest).padStart(2, '0')}` : ''}`;
    });

    readonly nowOffset = computed(() => {
        const { start, end } = this.state.dayBounds();
        const now = new Date();
        const minutes = now.getHours() * 60 + now.getMinutes();
        const from = start * 60;
        const span = (end - start) * 60;
        return span > 0 ? Math.min(Math.max((minutes - from) / span, 0), 1) : 0;
    });

    /** The columns, each with its cells and positioned events. */
    readonly days = computed(() => {
        const { start, end } = this.state.range();
        const bounds = this.state.dayBounds();
        const slotMinutes = this.state.slotMinutes();
        const byDay = groupByDay(this.state.visibleEvents(), this.state.defaultEventDuration());
        const interacting = this.state.interactingEventId();

        const result = eachDay(start, end).map((date) => {
            const key = dayKey(date);
            const dayEvents = byDay.get(key) ?? [];
            const { timed } = this.partitionEvents(dayEvents);

            const from = addMinutes(date, bounds.start * 60);
            const to = addMinutes(date, bounds.end * 60);
            const laid = layoutTimeGrid(timed, {
                range: { start: from, end: to },
                defaultEventDuration: this.state.defaultEventDuration(),
                minEventMinutes: this.state.minEventMinutes()
            });

            const cells = timeSlots(bounds.start, bounds.end, slotMinutes).map((slot) => {
                const cellStart = addMinutes(date, slot.minutes);
                const cellEnd = addMinutes(cellStart, slotMinutes);
                // Dos cosas distintas: "esta celda está DENTRO del horario declarado" —que es lo que
                // nombra el slot, pone data-business y resuelve la definición workCell— y "aquí se
                // puede reservar", que es true cuando no hay horario declarado. Sin separarlas, un
                // Scheduler sin businessHours marcaba TODAS sus celdas como work-cell.
                const inBusiness = this.state.hasBusinessHours() && this.state.isBusinessTime(date, slot.minutes);
                return {
                    key: `${key}|${slot.minutes}`,
                    start: cellStart,
                    end: cellEnd,
                    label: formatTime(cellStart, this.locale()),
                    major: slot.major,
                    business: inBusiness,
                    binding: this.bindCell(cellStart, [], { label: '' })
                };
            });

            return {
                key,
                date,
                end: endOfDay(date),
                today: isToday(date),
                weekend: date.getDay() === 0 || date.getDay() === 6,
                weekdayLabel: date.toLocaleDateString(this.locale(), { weekday: 'short' }).toUpperCase(),
                cell: this.bindCell(date, dayEvents, { label: date.toLocaleDateString(this.locale(), { weekday: 'long', day: 'numeric' }) }),
                allDayCell: this.bindCell(date, this.partitionEvents(dayEvents).allDay, { label: this.state.labels().allDay }),
                cells,
                events: laid.map((item) => ({
                    top: item.offset,
                    height: item.size,
                    // El evento que se está arrastrando ocupa la columna ENTERA: si participara del
                    // reparto por solape, se estrecharía y se desplazaría de lado cada vez que pasa
                    // por encima de otra cita. Los demás conservan su sitio porque el que se arrastra
                    // sigue contando para SU reparto: lo único que cambia es cómo se pinta.
                    // Las columnas de solape dejan un pelín de aire a la derecha (95% del hueco) para
                    // que el borde del evento de detrás siga viéndose y no parezca uno solo.
                    left: item.event.id === interacting ? 0 : item.column / item.columns,
                    width: item.event.id === interacting ? 1 : (1 / item.columns) * 0.95,
                    continuesBefore: item.continuesBefore,
                    continuesAfter: item.continuesAfter,
                    ...this.bindEvent(item.event, { continuesBefore: item.continuesBefore, continuesAfter: item.continuesAfter })
                }))
            };
        });

        return result;
    });

    /** Events of the all-day strip, packed into rows across the whole range. */
    readonly allDayRows = computed(() => {
        const { allDay } = this.partitionEvents(this.state.visibleEvents());
        const { items } = layoutRows(allDay, { range: this.state.range(), defaultEventDuration: this.state.defaultEventDuration() });
        return items.map((item) => ({
            offset: item.offset,
            size: item.size,
            row: item.row,
            ...this.bindEvent(item.event, { continuesBefore: item.continuesBefore, continuesAfter: item.continuesAfter })
        }));
    });

    ngAfterViewChecked(): void {
        // Los contextos se publican DESPUÉS del render: escribir estas señales dentro del computed
        // del layout es justo lo que Angular prohíbe (NG0600).
        const days = this.days();
        this.publishContexts(
            [...days.flatMap((day) => day.events), ...this.allDayRows()],
            days.flatMap((day) => [day.cell, day.allDayCell, ...day.cells.map((cell) => cell.binding)])
        );
    }

    /** How many rows the all-day strip needs. */
    readonly allDayRowCount = computed(() => this.allDayRows().reduce((max, item) => Math.max(max, item.row + 1), 1));
}

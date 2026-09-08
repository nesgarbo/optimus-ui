import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { SchedulerEvent, SchedulerViewType } from '@openng/optimus-ui/types/scheduler';
import { addDays, dayKey, eachDay, endOfDay, isToday, startOfWeek, toDate } from './scheduler-date';
import { layoutRows } from './scheduler-layout';
import { SchedulerViewBase } from './scheduler-view-base';

/**
 * The month grid: whole weeks, one row each, with events packed across the days they span.
 *
 * The layout runs PER WEEK ROW rather than over the whole month, because a row is the widest a bar
 * can be drawn without wrapping: an event from Thursday to Tuesday is two bars, one per row, each
 * marked as continuing. Packing the whole month at once would put the second half of that event on
 * a row index that means nothing in the following week.
 *
 * @module scheduler-month
 */
@Component({
    selector: 'p-scheduler-month-view',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        <div class="p-scheduler-month" [attr.data-view]="view">
            <div class="p-scheduler-month-header" data-slot="scheduler-month-header-cell">
                @if (monthHeaderDef(); as tpl) {
                    <ng-container *ngTemplateOutlet="tpl; context: headerContext()" />
                } @else {
                    @for (weekday of weekdays(); track weekday) {
                        <div class="p-scheduler-month-header-cell">{{ weekday }}</div>
                    }
                }
            </div>

            <div class="p-scheduler-month-body">
                @for (week of weeks(); track week.key) {
                    <div class="p-scheduler-month-week" [style.--p-scheduler-month-rows]="week.rowCount">
                        @for (day of week.days; track day.key) {
                            <div
                                class="p-scheduler-month-cell"
                                data-slot="scheduler-month-cell"
                                [attr.data-date]="day.key"
                                [attr.data-today]="day.today ? '' : null"
                                [attr.data-weekend]="day.weekend ? '' : null"
                                [attr.data-other-month]="day.otherMonth ? '' : null"
                                [attr.data-selected]="day.binding.context.selected ? '' : null"
                                [attr.data-event-count]="day.count"
                                [style.--p-scheduler-bar-rows]="day.barRows"
                                [attr.data-start-date]="day.date.getTime()"
                                [attr.data-end-date]="day.end.getTime()"
                                (click)="onSlotClick($event, day.date, day.end)"
                                (contextmenu)="onCellContextMenu($event, day.date, day.events)"
                            >
                                @if (monthCellDef(); as tpl) {
                                    <ng-container *ngTemplateOutlet="tpl; context: day.binding.context; injector: cellInjector(day.binding.key)" />
                                } @else {
                                    <div class="p-scheduler-month-cell-number" data-slot="scheduler-month-cell-number">
                                        @if (monthCellNumberDef(); as tpl) {
                                            <ng-container *ngTemplateOutlet="tpl; context: day.binding.context; injector: cellInjector(day.binding.key)" />
                                        } @else {
                                            {{ day.date.getDate() }}
                                        }
                                    </div>
                                    <div class="p-scheduler-month-day-cell" data-slot="scheduler-month-day-cell">
                                        @if (monthDayCellDef(); as tpl) {
                                            <ng-container *ngTemplateOutlet="tpl; context: day.binding.context; injector: cellInjector(day.binding.key)" />
                                        } @else {
                                            @for (item of day.visibleEvents; track item.key) {
                                                <button
                                                    type="button"
                                                    class="p-scheduler-month-event"
                                                    data-slot="scheduler-month-event"
                                                    [attr.data-event-id]="item.context.event.id"
                                                    [attr.data-selected]="item.context.selected ? '' : null"
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
                                                    @if (monthEventDef(); as tpl) {
                                                        <ng-container *ngTemplateOutlet="tpl; context: item.context; injector: eventInjector(item.key)" />
                                                    } @else {
                                                        <span class="p-scheduler-event-dot" [style.background]="item.context.accentColor" aria-hidden="true"></span>
                                                        <span class="p-scheduler-event-title">{{ item.context.title }}</span>
                                                        <span class="p-scheduler-event-time">{{ item.shortTime }}</span>
                                                    }
                                                </button>
                                            }
                                        }
                                    </div>
                                    @if (day.overflow > 0) {
                                        <button type="button" class="p-scheduler-month-more-link" data-slot="scheduler-month-more-link" [attr.data-event-count]="day.overflow" (click)="openMore($event, day.date, day.events)">
                                            @if (monthMoreLinkDef(); as tpl) {
                                                <ng-container *ngTemplateOutlet="tpl; context: day.moreContext" />
                                            } @else {
                                                {{ day.moreContext.label }}
                                            }
                                        </button>
                                    }
                                }
                            </div>
                        }

                        @for (item of week.events; track item.key) {
                            <div
                                class="p-scheduler-month-bar"
                                data-slot="scheduler-month-event"
                                data-all-day=""
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
                                @if (monthEventDef(); as tpl) {
                                    <ng-container *ngTemplateOutlet="tpl; context: item.context; injector: eventInjector(item.key)" />
                                } @else {
                                    <span class="p-scheduler-event-title">{{ item.context.title }}</span>
                                }
                            </div>
                        }
                    </div>
                }
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'p-scheduler-view p-scheduler-view-month' }
})
export class SchedulerMonthView extends SchedulerViewBase {
    /** @internal */
    override readonly view: SchedulerViewType = 'month';

    /**
     * No resize handles in the month grid: a cell is a whole day, so pulling an edge would be
     * editing a date range one day at a time, which belongs in a form and not in a drag.
     */
    protected override readonly resizableSurface = false;

    /** @internal */
    readonly monthHeaderDef = computed(() => this.def('monthHeaderCell'));
    /** @internal */
    readonly monthCellDef = computed(() => this.def('monthCell'));
    /** @internal */
    readonly monthCellNumberDef = computed(() => this.def('monthCellNumber'));
    /** @internal */
    readonly monthDayCellDef = computed(() => this.def('monthDayCell'));
    /** @internal */
    readonly monthEventDef = computed(() => this.def('monthEvent'));
    /** @internal */
    readonly monthMoreLinkDef = computed(() => this.def('monthMoreLink'));

    /** Weekday names, rotated so index 0 is `firstDayOfWeek`. */
    readonly weekdays = computed(() => {
        const first = this.state.firstDayOfWeek();
        const anchor = startOfWeek(new Date(), first);
        return Array.from({ length: 7 }, (_, i) => addDays(anchor, i).toLocaleDateString(this.locale(), { weekday: 'short' }).toUpperCase());
    });

    /** @internal */
    readonly headerContext = computed(() => ({ $implicit: this.weekdays(), weekdays: this.weekdays() }));

    /**
     * The week rows.
     *
     * Each row lays its own events out with `maxRows = maxEventsPerCell`, so the overflow the packer
     * reports is per day and feeds that day's "+N more" link.
     */
    /**
     * The week rows.
     *
     * Two kinds of event, laid out differently on purpose:
     *
     * - **Spanning** (all-day, or crossing a day boundary) become absolutely positioned bars over
     *   the week row, so one appointment reads as one bar across the days it covers.
     * - **Single-day timed** events are a stacked list INSIDE their cell. Positioning them like the
     *   bars is what made them unreadable: a 2-hour event is 2/168 of a week, i.e. a 7px sliver.
     *
     * The two share the per-cell budget: the bars take the top rows, the list starts below them, and
     * whatever does not fit is reported as overflow for the "+N more" link.
     */
    readonly weeks = computed(() => {
        const { start, end } = this.state.range();
        const anchorMonth = this.state.date().getMonth();
        const maxRows = this.state.maxEventsPerCell();
        const events = this.state.visibleEvents();
        const moreTemplate = this.state.labels().more;
        const duration = this.state.defaultEventDuration();

        const spanning = events.filter((event) => this.isSpanning(event, duration));
        const timed = events.filter((event) => !this.isSpanning(event, duration));

        const rows: any[] = [];
        for (let weekStart = start; weekStart < end; weekStart = addDays(weekStart, 7)) {
            const weekEnd = addDays(weekStart, 7);
            const range = { start: weekStart, end: weekEnd };
            const { items, overflow } = layoutRows(spanning, { range, defaultEventDuration: duration, maxRows });

            const days = eachDay(weekStart, weekEnd).map((date, index) => {
                const key = dayKey(date);
                const dayStart = date.getTime();
                const dayEnd = endOfDay(date).getTime();

                // Cuántas filas de barra pisan ESTE día: es el hueco que la lista de la celda no
                // puede usar, y varía de un día a otro dentro de la misma semana.
                const barRows = items.filter((item) => {
                    const from = weekStart.getTime() + item.offset * (weekEnd.getTime() - weekStart.getTime());
                    const to = from + item.size * (weekEnd.getTime() - weekStart.getTime());
                    return from < dayEnd && to > dayStart;
                }).length;

                const dayTimed = timed.filter((event) => this.touchesDay(event, date)).sort((a, b) => toDate(a.start).getTime() - toDate(b.start).getTime());

                const available = Math.max(maxRows - barRows, 0);
                const visible = dayTimed.slice(0, available);
                const hidden = [...dayTimed.slice(available), ...(overflow.get(index) ?? [])];
                const all = [...dayTimed, ...(overflow.get(index) ?? [])];

                return {
                    key,
                    date,
                    end: endOfDay(date),
                    today: isToday(date),
                    weekend: date.getDay() === 0 || date.getDay() === 6,
                    otherMonth: date.getMonth() !== anchorMonth,
                    count: all.length + barRows,
                    events: all,
                    barRows,
                    visibleEvents: visible.map((event) => ({
                        ...this.bindEvent(event, {}, key),
                        shortTime: toDate(event.start).toLocaleTimeString(this.locale(), { hour: 'numeric', minute: '2-digit' })
                    })),
                    overflow: hidden.length,
                    moreContext: {
                        $implicit: hidden.length,
                        date,
                        count: hidden.length,
                        events: hidden,
                        label: moreTemplate.replace('{0}', String(hidden.length)),
                        open: () => this.state.openMorePopover(date, all)
                    },
                    binding: this.bindCell(date, all, {
                        otherMonth: date.getMonth() !== anchorMonth,
                        count: all.length,
                        label: date.toLocaleDateString(this.locale(), { day: 'numeric', month: 'long' })
                    })
                };
            });

            rows.push({
                key: dayKey(weekStart),
                days,
                rowCount: Math.max(items.reduce((max, item) => Math.max(max, item.row + 1), 0) + maxRows, 1),
                events: items.map((item) => ({
                    offset: item.offset,
                    size: item.size,
                    row: item.row,
                    ...this.bindEvent(item.event, { continuesBefore: item.continuesBefore, continuesAfter: item.continuesAfter }, dayKey(weekStart))
                }))
            });
        }

        return rows;
    });

    /**
     * Whether an event is drawn as a bar across the week rather than as a row inside one cell:
     * all-day events, and anything whose start and end fall on different calendar days.
     */
    private isSpanning(event: SchedulerEvent, defaultDuration: number): boolean {
        if (event.allDay) return true;
        const start = toDate(event.start);
        const rawEnd = event.end != null ? toDate(event.end) : null;
        const end = rawEnd && rawEnd > start ? rawEnd : new Date(start.getTime() + defaultDuration * 60_000);
        // -1ms: el que acaba justo a medianoche cabe en su día, no cruza al siguiente.
        return dayKey(start) !== dayKey(new Date(end.getTime() - 1));
    }

    ngAfterViewChecked(): void {
        const weeks = this.weeks();
        this.publishContexts(
            weeks.flatMap((week) => week.events),
            weeks.flatMap((week) => week.days.map((day) => day.binding))
        );
    }

    private touchesDay(event: SchedulerEvent, date: Date): boolean {
        const start = toDate(event.start);
        const rawEnd = event.end != null ? toDate(event.end) : null;
        const end = rawEnd && rawEnd > start ? rawEnd : new Date(start.getTime() + this.state.defaultEventDuration() * 60_000);
        return start < endOfDay(date) && end > date;
    }

    /** Opens the overflow popover, keeping the click off the cell underneath. */
    openMore(originalEvent: MouseEvent, date: Date, events: SchedulerEvent[]): void {
        originalEvent.stopPropagation();
        this.state.openMorePopover(date, events, originalEvent.currentTarget as HTMLElement);
    }
}

import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { SchedulerViewType } from '@openng/optimus-ui/types/scheduler';
import { addDays, dayKey, isToday, startOfWeek } from './scheduler-date';
import { groupByDay } from './scheduler-layout';
import { SchedulerViewBase } from './scheduler-view-base';

/**
 * The year: twelve mini-months, each a compact card of day cells with a dot on the days that hold
 * events.
 *
 * No event geometry at all — at this zoom a bar would be a pixel, so the only useful signal is
 * "something happens that day", which is what the indicator says. Clicking a day drops into the day
 * view for it, which is how a year view earns its place: it is a navigator, not a display.
 *
 * @module scheduler-year
 */
@Component({
    selector: 'p-scheduler-year-view',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        <div class="p-scheduler-year" data-slot="scheduler-year" [attr.data-view]="view">
            @for (month of months(); track month.key) {
                <div class="p-scheduler-mini-month" data-slot="scheduler-mini-month">
                    <div class="p-scheduler-mini-month-header" data-slot="scheduler-mini-month-header">
                        @if (miniMonthHeaderDef(); as tpl) {
                            <ng-container *ngTemplateOutlet="tpl; context: month.context" />
                        } @else {
                            {{ month.name }}
                        }
                    </div>

                    <!-- Una ÚNICA rejilla con los nombres de día como primera fila: en dos rejillas
                         separadas las columnas se calculan por separado y las iniciales dejan de
                         cuadrar con los números. La referencia hace lo mismo. -->
                    <div class="p-scheduler-mini-month-grid" role="grid">
                        @for (weekday of weekdayInitials(); track $index) {
                            <span class="p-scheduler-mini-month-weekday" aria-hidden="true">{{ weekday }}</span>
                        }
                        @for (day of month.days; track day.key) {
                            <button
                                type="button"
                                class="p-scheduler-mini-month-day"
                                data-slot="scheduler-mini-month-day"
                                [class.p-scheduler-mini-month-day-other]="day.otherMonth"
                                [class.p-scheduler-mini-month-day-weekend]="day.weekend"
                                [class.p-scheduler-mini-month-day-has-events]="day.count > 0"
                                [attr.data-date]="day.key"
                                [attr.data-today]="day.today ? '' : null"
                                [attr.data-selected]="day.binding.context.selected ? '' : null"
                                [attr.data-event-count]="day.count"
                                [attr.aria-label]="day.label"
                                [disabled]="day.otherMonth"
                                (click)="openDay(day.date)"
                            >
                                @if (miniMonthCellDef(); as tpl) {
                                    <ng-container *ngTemplateOutlet="tpl; context: day.binding.context; injector: cellInjector(day.binding.key)" />
                                } @else if (!day.otherMonth) {
                                    <span class="p-scheduler-mini-month-number">{{ day.date.getDate() }}</span>
                                    @if (day.count > 0) {
                                        <span class="p-scheduler-mini-month-indicator" [style.--p-scheduler-mini-month-indicator-background]="day.indicatorColor" aria-hidden="true"></span>
                                    }
                                }
                            </button>
                        }
                    </div>
                </div>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'p-scheduler-view p-scheduler-view-year' }
})
export class SchedulerYearView extends SchedulerViewBase {
    /** @internal */
    override readonly view: SchedulerViewType = 'year';

    /** @internal */
    readonly miniMonthHeaderDef = computed(() => this.def('miniMonthHeader'));
    /** @internal */
    readonly miniMonthCellDef = computed(() => this.def('miniMonthCell'));

    /** Single-letter weekday headers, rotated to `firstDayOfWeek`. */
    readonly weekdayInitials = computed(() => {
        const anchor = startOfWeek(new Date(), this.state.firstDayOfWeek());
        return Array.from({ length: 7 }, (_, i) => addDays(anchor, i).toLocaleDateString(this.locale(), { weekday: 'narrow' }));
    });

    /** The twelve months, each padded to whole weeks so its grid is rectangular. */
    readonly months = computed(() => {
        const year = this.state.date().getFullYear();
        const first = this.state.firstDayOfWeek();
        const byDay = groupByDay(this.state.filteredEvents(), this.state.defaultEventDuration());

        const result = Array.from({ length: 12 }, (_, monthIndex) => {
            const monthDate = new Date(year, monthIndex, 1);
            const gridStart = startOfWeek(monthDate, first);
            const monthEnd = new Date(year, monthIndex + 1, 1);

            const days: any[] = [];
            // 42 días fijos, seis semanas: un mes que cabe en cinco haría el minimes más bajo y los
            // doce dejarían de medir lo mismo, con la rejilla del año dando saltos de fila.
            for (let i = 0, date = gridStart; i < 42; i++, date = addDays(date, 1)) {
                void monthEnd;
                const key = dayKey(date);
                const dayEvents = byDay.get(key) ?? [];
                days.push({
                    key: `${monthIndex}|${key}`,
                    date,
                    otherMonth: date.getMonth() !== monthIndex,
                    weekend: date.getDay() === 0 || date.getDay() === 6,
                    today: isToday(date),
                    count: dayEvents.length,
                    // El punto lleva el color del primer evento del día, no un acento genérico: a
                    // este zoom el color es la única pista de QUÉ pasa ese día.
                    indicatorColor: dayEvents.length ? this.state.accentColor(dayEvents[0]) : undefined,
                    label: `${date.toLocaleDateString(this.locale(), { day: 'numeric', month: 'long' })}${dayEvents.length ? `, ${dayEvents.length}` : ''}`,
                    binding: this.bindCell(date, dayEvents, {
                        otherMonth: date.getMonth() !== monthIndex,
                        count: dayEvents.length,
                        label: String(date.getDate())
                    })
                });
            }

            const name = monthDate.toLocaleDateString(this.locale(), { month: 'long' });
            return {
                key: `${year}-${monthIndex}`,
                name,
                days,
                context: {
                    $implicit: monthDate,
                    monthDate,
                    monthName: name,
                    monthLabel: `${name} ${year}`,
                    weeks: Array.from({ length: Math.ceil(days.length / 7) }, (_, w) => days.slice(w * 7, w * 7 + 7).map((d) => d.date))
                }
            };
        });

        return result;
    });

    ngAfterViewChecked(): void {
        const months = this.months();
        this.publishContexts(
            [],
            months.flatMap((month) => month.days.map((day: any) => day.binding))
        );
    }

    /** Drops into the day view for a date, which is what a year view is for. */
    openDay(date: Date): void {
        this.state.goToDay(date);
    }
}

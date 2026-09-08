import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS, DEMO_RESOURCES } from './demo-data';

@Component({
    selector: 'event-ui-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Each surface an event can appear on has its own definition, because they have nothing in common but the data: <i>p-scheduler-time-grid-event</i> is a tall box in a column, <i>p-scheduler-all-day-event</i> a strip above the grid,
                <i>p-scheduler-month-event</i> a line in a cell, <i>p-scheduler-timeline-event</i> a horizontal bar and <i>p-scheduler-agenda-event</i> a list row. <i>p-scheduler-event</i> declared straight in <i>p-scheduler-content</i> is the
                fallback for any of them you did not define.
            </p>
            <p>
                The Scheduler keeps the positioning, the accent colour, the selection state and the ARIA; the definition owns what is inside. The context arrives with the work already done — <i>title</i> and <i>timeText</i> resolved,
                <i>accentColor</i> picked, <i>category</i> and <i>resource</i> looked up, and the <i>selected</i>, <i>focused</i>, <i>dragging</i> and <i>continuesBefore</i>/<i>continuesAfter</i> flags — so a card is a template, not a calculation.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root locale="en-US" view="week" [events]="events" [resources]="resources" [categories]="categories" categoryField="categoryId" [date]="date" [dayStartHour]="7" [dayEndHour]="19">
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                    <p-scheduler-view-selector />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-event *pSchedulerEventDef="let ctx">
                        <span class="truncate">{{ ctx.title }}</span>
                    </p-scheduler-event>
                    <p-scheduler-week>
                        <p-scheduler-time-grid-event *pSchedulerTimeGridEventDef="let ctx">
                            <span class="flex items-center gap-1 min-w-0">
                                <span class="inline-block w-1.5 h-1.5 rounded-full shrink-0" [style.background]="ctx.accentColor"></span>
                                <strong class="truncate">{{ ctx.title }}</strong>
                            </span>
                            <span class="opacity-70 truncate">{{ ctx.timeText }}</span>
                            @if (ctx.resource) {
                                <span class="opacity-60 truncate">{{ ctx.resource.name }}</span>
                            }
                        </p-scheduler-time-grid-event>
                        <p-scheduler-all-day-event *pSchedulerAllDayEventDef="let ctx">
                            <span class="truncate">{{ ctx.title }}</span>
                            @if (ctx.continuesAfter) {
                                <span aria-hidden="true">›</span>
                            }
                        </p-scheduler-all-day-event>
                    </p-scheduler-week>
                </p-scheduler-content>
            </p-scheduler-root>
        </div>
        <app-code></app-code>
    `
})
export class EventUiDoc {
    events = DEMO_EVENTS;

    resources = DEMO_RESOURCES;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;
}

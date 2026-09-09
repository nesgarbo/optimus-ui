import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule } from '@openng/optimus-ui/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_EVENTS } from './demo-data';

@Component({
    selector: 'overlays-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>There are four overlays, and each one is opt-in through both a flag on the root and the part in the tree — the flag decides when it opens, the part decides what it contains.</p>
            <ul>
                <li>
                    <i>p-scheduler-more-popover</i> lists the events a dense month cell could not fit, and the "+N more" link opens it. <i>[showMorePopover]="false"</i> keeps the link and the <i>(moreClick)</i> output but not the panel, for a page
                    that opens its own day view instead.
                </li>
                <li><i>[quickInfo]</i> plus <i>p-scheduler-quick-info</i> opens a compact summary when an event is clicked.</li>
                <li><i>[eventPopover]</i> plus <i>p-scheduler-popover</i> opens on hover AND on focus, so it is reachable without a mouse.</li>
                <li><i>[contextMenu]</i> plus <i>p-scheduler-context-menu</i> opens on right click over an event or a cell. The native menu is only suppressed when the Scheduler has one to show.</li>
            </ul>
            <p>
                Each overlay owns its positioning and dismissal and provides a context, so anything projected into it draws the contents without inputs: the Scheduler owns the positioned root, you own the markup. The context exposes the event plus
                <i>close</i>, <i>edit</i> and <i>remove</i>, and edit and remove are REQUESTS — the Scheduler never mutates your events.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-scheduler-root locale="en-US" view="month" [events]="events" [categories]="categories" categoryField="categoryId" [date]="date" [maxEventsPerCell]="2" [quickInfo]="true" [contextMenu]="true">
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                    <p-scheduler-view-selector />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-month />
                </p-scheduler-content>
                <p-scheduler-more-popover />
                <p-scheduler-quick-info />
                <p-scheduler-context-menu />
            </p-scheduler-root>
        </div>
        <app-code></app-code>
    `
})
export class OverlaysDoc {
    events = DEMO_EVENTS;

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;
}

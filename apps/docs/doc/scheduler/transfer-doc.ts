import { Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { SchedulerModule, parseICalendar, serializeSchedule, toICalendar } from '@openng/optimus-ui/scheduler';
import type { SchedulerEvent } from '@openng/optimus-ui/types/scheduler';
import { DEMO_CATEGORIES, DEMO_DATE, DEMO_RECURRING_EVENTS } from './demo-data';

@Component({
    selector: 'transfer-doc',
    standalone: true,
    imports: [AppDocSectionText, SchedulerModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                <i>toICalendar</i> and <i>parseICalendar</i> move events between the Scheduler and everything else that speaks calendars. They cover the VEVENT subset that actually gets exchanged — <i>SUMMARY</i>, <i>DTSTART</i>/<i>DTEND</i>,
                <i>DESCRIPTION</i>, <i>LOCATION</i>, <i>RRULE</i>, <i>EXDATE</i>, <i>RDATE</i>, <i>UID</i> — and not a complete RFC 5545 implementation: no VTIMEZONE, no VALARM, no VFREEBUSY. What they promise is a round trip of what this component
                can display.
            </p>
            <p>
                A series is exported as ONE VEVENT with its rule, not as its expanded copies, which is the same contract the recurrence page describes. All-day events are written with <i>VALUE=DATE</i> and an exclusive <i>DTEND</i>, because that is
                what the format means by a whole day. Resources travel as <i>X-OPTIMUS-RESOURCE</i> and categories as <i>CATEGORIES</i>, since there is no standard field for either and dropping them would turn a team plan into a list of appointments.
            </p>
            <p><i>serializeSchedule</i> and <i>parseSchedule</i> are the JSON pair for your own storage: instants become ISO strings, because a <i>Date</i> does not survive <i>JSON.stringify</i> in a form anything can read back reliably.</p>
            <p>
                For printing there is nothing to call. The stylesheet has a <i>&#64;media print</i> block that unrolls the scroll containers, drops the sticky headers and the controls, keeps a week row or an agenda day from splitting across pages,
                and forces the category colours to print — without that last one the browser prints every event white and they all become the same event. <i>window.print()</i> is enough.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div class="flex flex-wrap gap-2 mb-3">
                <button type="button" class="px-2 py-1 text-sm rounded border" (click)="exportIcs()">Export .ics</button>
                <button type="button" class="px-2 py-1 text-sm rounded border" (click)="roundTrip()">Round-trip it back</button>
                <button type="button" class="px-2 py-1 text-sm rounded border" (click)="exportJson()">Export JSON</button>
                <button type="button" class="px-2 py-1 text-sm rounded border" (click)="print()">Print</button>
            </div>
            <p-scheduler-root locale="en-US" view="week" [events]="events()" [categories]="categories" categoryField="categoryId" [date]="date" [dayStartHour]="8" [dayEndHour]="19">
                <p-scheduler-header>
                    <p-scheduler-navigation />
                    <p-scheduler-title />
                    <p-scheduler-view-selector />
                </p-scheduler-header>
                <p-scheduler-content>
                    <p-scheduler-week />
                    <p-scheduler-agenda />
                </p-scheduler-content>
            </p-scheduler-root>
            @if (output()) {
                <pre class="mt-3 text-xs overflow-auto max-h-48 p-2 rounded border">{{ output() }}</pre>
            }
        </div>
        <app-code></app-code>
    `
})
export class TransferDoc {
    events = signal<SchedulerEvent[]>(DEMO_RECURRING_EVENTS);

    categories = DEMO_CATEGORIES;

    date = DEMO_DATE;

    output = signal('');

    exportIcs(): void {
        this.output.set(toICalendar(this.events(), { name: 'Optimus demo', prodId: '-//optimus-ui docs//scheduler//EN' }));
    }

    /** Exports and imports back, which is the only honest way to show a round trip works. */
    roundTrip(): void {
        const { events, name } = parseICalendar(toICalendar(this.events(), { name: 'Optimus demo' }));

        this.events.set(events);
        this.output.set(`Parsed ${events.length} events back from "${name}". The grid above is now rendering them.`);
    }

    exportJson(): void {
        this.output.set(JSON.stringify(serializeSchedule(this.events(), { categories: this.categories }), null, 2));
    }

    print(): void {
        window.print();
    }
}

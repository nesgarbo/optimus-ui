import { Component, signal } from '@angular/core';
import { Gantt } from '@openng/optimus-ui/gantt';
import type { GanttTaskFields } from '@openng/optimus-ui/types/gantt';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'calendar-doc',
    standalone: true,
    imports: [Gantt, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                Durations count worked days. <i>workWeek</i> names the days that are worked (Monday to Friday by default) and <i>holidays</i> lists days with none; both are shaded, and a task steps over them. <i>eventMarkers</i> draw a line at a
                date. A task whose bar spans a weekend is longer on screen than its duration, as in any plan.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-gantt
                [(dataSource)]="data"
                [taskFields]="fields"
                [workWeek]="['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']"
                [holidays]="[
                    { from: '2026-10-12', label: 'National day' },
                    { from: '2026-10-27', to: '2026-10-28' }
                ]"
                [eventMarkers]="[{ day: '2026-10-21', label: 'Review' }]"
                projectStartDate="2026-10-05"
                height="260px"
            />
        </div>
        <app-code></app-code>
    `
})
export class CalendarDoc {
    fields: GanttTaskFields = { id: 'id', name: 'name', startDate: 'start', duration: 'days', progress: 'done', dependency: 'after' };

    data = signal<any[]>([
        { id: 1, name: 'Order materials', start: '2026-10-05', days: 5, done: 100 },
        { id: 2, name: 'Install', start: '2026-10-05', days: 10, done: 20, after: '1' },
        { id: 3, name: 'Inspect', start: '2026-10-05', days: 2, after: '2' }
    ]);
}

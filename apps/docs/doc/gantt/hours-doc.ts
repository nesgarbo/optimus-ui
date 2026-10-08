import { Component, signal } from '@angular/core';
import { Gantt } from '@openng/optimus-ui/gantt';
import type { GanttTaskFields } from '@openng/optimus-ui/types/gantt';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'hours-doc',
    standalone: true,
    imports: [Gantt, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>durationUnit</i> is <i>day</i>, <i>hour</i> or <i>minute</i>, and the lengths in the data, in the grid and in the dialog are in that unit. A start or an end then carries a time (<i>2026-10-05T10:30</i>), the bars are drawn to the
                hour, a dependency gap can be written in hours (<i>2FS+2h</i>) and a task that runs past the end of the day carries on the next worked one. <i>workingHours</i> sets when the day starts and ends, eight to sixteen by default. A task is
                dragged by the hour, and a time that falls between two slots is rounded to the slot.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-gantt
                [(dataSource)]="data"
                [taskFields]="fields"
                [columns]="[
                    { field: 'name', headerText: 'Task', width: 150 },
                    { field: 'startDate', headerText: 'Start', width: 170 },
                    { field: 'duration', headerText: 'Hours', width: 64, textAlign: 'right' }
                ]"
                durationUnit="hour"
                [workingHours]="[9, 17]"
                [editSettings]="{ allowTaskbarEditing: true, allowEditing: true }"
                [timelineSettings]="{ topTier: { unit: 'day', format: 'EEE d MMM' }, bottomTier: { unit: 'day' }, timelineUnitSize: 160 }"
                [labelSettings]="{ rightLabel: 'name' }"
                projectStartDate="2026-10-05"
                height="260px"
            />
        </div>
        <app-code></app-code>
    `
})
export class HoursDoc {
    fields: GanttTaskFields = { id: 'id', name: 'name', startDate: 'start', duration: 'hours', progress: 'done', dependency: 'after' };

    data = signal<any[]>([
        { id: 1, name: 'Stand-up', start: '2026-10-05T09:00', hours: 1, done: 100 },
        { id: 2, name: 'Implement', start: '2026-10-05T09:00', hours: 12, done: 20, after: '1' },
        { id: 3, name: 'Review', start: '2026-10-05T09:00', hours: 3, after: '2FS+1h' },
        { id: 4, name: 'Deploy', start: '2026-10-05T09:00', hours: 2, after: '3' }
    ]);
}

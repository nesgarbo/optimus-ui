import { Component, signal } from '@angular/core';
import { Gantt } from '@openng/optimus-ui/gantt';
import type { GanttColumn, GanttTaskFields } from '@openng/optimus-ui/types/gantt';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'basic-doc',
    standalone: true,
    imports: [Gantt, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>dataSource</i> is a list of items. <i>taskFields</i> says which field is the <i>id</i>, the <i>name</i>, the <i>startDate</i>, the <i>duration</i> (in worked days; zero is a milestone), the <i>progress</i> and the
                <i>dependency</i>. A list is a tree either nested, with a <i>child</i> field, or flat, with a <i>parentID</i> field. A parent takes its dates and its progress from its children. <i>columns</i> are the columns of the grid,
                <i>labelSettings</i> prints text beside the bars, and <i>splitterSettings</i> sets the width of the grid, which the user can drag.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-gantt [(dataSource)]="data" [taskFields]="fields" [columns]="columns" [labelSettings]="{ rightLabel: 'name' }" projectStartDate="2026-10-05" height="360px" />
        </div>
        <app-code></app-code>
    `
})
export class BasicDoc {
    fields: GanttTaskFields = { id: 'id', name: 'name', startDate: 'start', duration: 'days', progress: 'done', child: 'subtasks' };

    columns: GanttColumn[] = [
        { field: 'id', headerText: 'ID', width: 44 },
        { field: 'name', headerText: 'Task', width: 200 },
        { field: 'startDate', headerText: 'Start', width: 104 },
        { field: 'duration', headerText: 'Days', width: 56, textAlign: 'right' }
    ];

    data = signal<any[]>([
        {
            id: 1,
            name: 'Project plan',
            subtasks: [
                { id: 2, name: 'Kick-off', start: '2026-10-05', days: 1, done: 100 },
                { id: 3, name: 'Requirements', start: '2026-10-06', days: 4, done: 70 },
                { id: 4, name: 'Budget', start: '2026-10-06', days: 3, done: 30 }
            ]
        },
        {
            id: 5,
            name: 'Development',
            subtasks: [
                { id: 6, name: 'Backend', start: '2026-10-12', days: 8, done: 10 },
                { id: 7, name: 'Frontend', start: '2026-10-14', days: 8, done: 0 }
            ]
        },
        { id: 8, name: 'Release', start: '2026-10-26', days: 0 }
    ]);
}

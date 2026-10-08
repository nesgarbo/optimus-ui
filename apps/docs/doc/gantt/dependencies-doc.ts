import { Component, signal } from '@angular/core';
import { Gantt } from '@openng/optimus-ui/gantt';
import type { GanttTaskFields } from '@openng/optimus-ui/types/gantt';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'dependencies-doc',
    standalone: true,
    imports: [Gantt, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                A <i>dependency</i> lists predecessors: the id, a type and an offset in days, for example <i>2FS+1d, 3SS</i>. <i>FS</i> (finish to start, the default), <i>SS</i>, <i>FF</i> and <i>SF</i> say which end of the predecessor drives which
                end of the task. A task is moved later when a predecessor demands it, never earlier, and the move counts worked days only. <i>enableCriticalPath</i> highlights the tasks that cannot slip without moving the end of the project, and
                <i>invalid</i> reports a loop of dependencies, a predecessor that does not exist and an id used twice.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-gantt [(dataSource)]="data" [taskFields]="fields" [enableCriticalPath]="true" [labelSettings]="{ rightLabel: 'name' }" projectStartDate="2026-10-05" height="320px" (invalid)="problem = $event.message" />
            <p class="mt-3 text-sm">{{ problem || 'No problems in the data.' }}</p>
        </div>
        <app-code></app-code>
    `
})
export class DependenciesDoc {
    problem = '';

    fields: GanttTaskFields = { id: 'id', name: 'name', startDate: 'start', duration: 'days', progress: 'done', dependency: 'after' };

    data = signal<any[]>([
        { id: 1, name: 'Foundations', start: '2026-10-05', days: 4, done: 100 },
        { id: 2, name: 'Walls', start: '2026-10-05', days: 6, done: 50, after: '1' },
        { id: 3, name: 'Wiring', start: '2026-10-05', days: 3, done: 0, after: '2SS+2d' },
        { id: 4, name: 'Roof', start: '2026-10-05', days: 4, done: 0, after: '2' },
        { id: 5, name: 'Paint', start: '2026-10-05', days: 2, done: 0, after: '3, 4FF' },
        { id: 6, name: 'Handover', start: '2026-10-05', days: 0, after: '5' }
    ]);
}

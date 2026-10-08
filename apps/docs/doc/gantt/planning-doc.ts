import { Component, signal } from '@angular/core';
import { Gantt } from '@openng/optimus-ui/gantt';
import type { GanttColumn, GanttTaskFields } from '@openng/optimus-ui/types/gantt';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'planning-doc',
    standalone: true,
    imports: [Gantt, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                A <i>baseline</i> is the plan. Name its fields in <i>taskFields</i> (<i>baselineStartDate</i>, <i>baselineEndDate</i>) and set <i>renderBaseline</i> to draw it under each bar; a task has a <i>variance</i>, in the unit of the gantt,
                that says how far it ends from its plan, and the <i>baselineStartDate</i>, <i>baselineEndDate</i> and <i>variance</i> columns show it. <i>resources</i> lists who tasks can be given to; a task names them in its
                <i>resourceInfo</i> field, and the <i>resourceInfo</i> column and the dialog show and set them. A resource has a <i>unit</i>, the share of it a task takes: two tasks of 50% fit together, two of 100% clash and both bars are outlined.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-gantt
                [(dataSource)]="data"
                [taskFields]="fields"
                [columns]="columns"
                [resources]="resources"
                [renderBaseline]="true"
                [enableCriticalPath]="false"
                [labelSettings]="{ rightLabel: 'resourceInfo' }"
                projectStartDate="2026-10-05"
                height="300px"
            />
        </div>
        <app-code></app-code>
    `
})
export class PlanningDoc {
    fields: GanttTaskFields = { id: 'id', name: 'name', startDate: 'start', duration: 'days', progress: 'done', dependency: 'after', baselineStartDate: 'planStart', baselineEndDate: 'planEnd', resourceInfo: 'who' };

    columns: GanttColumn[] = [
        { field: 'name', headerText: 'Task', width: 170 },
        { field: 'startDate', headerText: 'Start', width: 112 },
        { field: 'variance', headerText: 'Var (d)', width: 64, textAlign: 'right' },
        { field: 'resourceInfo', headerText: 'Who', width: 120 }
    ];

    resources = [
        { id: 'ana', name: 'Ana' },
        { id: 'bo', name: 'Bo', unit: 50 },
        { id: 'cy', name: 'Cy', unit: 50 }
    ];

    data = signal<any[]>([
        { id: 1, name: 'Spec', start: '2026-10-05', days: 4, done: 100, planStart: '2026-10-05', planEnd: '2026-10-07', who: ['ana'] },
        { id: 2, name: 'Build', start: '2026-10-05', days: 5, done: 30, after: '1', planStart: '2026-10-09', planEnd: '2026-10-15', who: ['ana'] },
        { id: 3, name: 'Docs', start: '2026-10-12', days: 3, planStart: '2026-10-12', planEnd: '2026-10-14', who: ['bo', 'cy'] },
        { id: 4, name: 'QA', start: '2026-10-12', days: 4, planStart: '2026-10-12', planEnd: '2026-10-16', who: ['ana'] }
    ]);
}

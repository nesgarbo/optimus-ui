import { Component, signal } from '@angular/core';
import { Gantt } from '@openng/optimus-ui/gantt';
import type { GanttColumn, GanttTaskFields } from '@openng/optimus-ui/types/gantt';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'cells-doc',
    standalone: true,
    imports: [Gantt, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>editSettings.allowEditing</i> turns the cells into editors: double click one, or press F2 on a row. Enter saves and Tab saves and moves on to the next cell that can be edited, Escape throws the change away, and text that cannot be
                read (a word for a length) keeps the editor open and marks it. A parent takes its dates, length and progress from its children, so those cells stay read-only. <i>cellEdit</i> reports the value before it is written: change
                <i>value</i>, or set <i>cancel</i>. With <i>mode: 'dialog'</i> a double click on a row opens a form for the whole task instead, and <i>openEditDialog(id)</i> opens it from code.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-col gap-3">
            <div class="flex gap-2">
                <label class="flex items-center gap-2 text-sm"><input type="checkbox" [checked]="dialog()" (change)="dialog.set($any($event.target).checked)" /> Edit in a dialog</label>
            </div>
            <p-gantt
                [(dataSource)]="data"
                [taskFields]="fields"
                [columns]="columns"
                [resources]="resources"
                [editSettings]="{ allowEditing: true, allowDeleting: true, mode: dialog() ? 'dialog' : 'cell' }"
                projectStartDate="2026-10-05"
                height="300px"
            />
        </div>
        <app-code></app-code>
    `
})
export class CellsDoc {
    dialog = signal(false);

    fields: GanttTaskFields = { id: 'id', name: 'name', startDate: 'start', duration: 'days', progress: 'done', dependency: 'after', notes: 'note', resourceInfo: 'who' };

    columns: GanttColumn[] = [
        { field: 'id', headerText: 'ID', width: 40 },
        { field: 'name', headerText: 'Task', width: 170 },
        { field: 'startDate', headerText: 'Start', width: 112 },
        { field: 'duration', headerText: 'Days', width: 54, textAlign: 'right' },
        { field: 'progress', headerText: '%', width: 48, textAlign: 'right' },
        { field: 'dependency', headerText: 'After', width: 80 },
        { field: 'resourceInfo', headerText: 'Who', width: 96 }
    ];

    resources = [
        { id: 'ana', name: 'Ana' },
        { id: 'bo', name: 'Bo' }
    ];

    data = signal<any[]>([
        { id: 1, name: 'Write the brief', start: '2026-10-05', days: 2, done: 100, who: ['ana'], note: 'Approved by legal' },
        { id: 2, name: 'Design', start: '2026-10-05', days: 4, done: 40, after: '1', who: ['bo'] },
        { id: 3, name: 'Review', start: '2026-10-05', days: 1, after: '2', who: ['ana', 'bo'] }
    ]);
}

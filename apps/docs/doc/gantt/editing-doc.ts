import { Component, signal, viewChild } from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { Gantt } from '@openng/optimus-ui/gantt';
import type { GanttTaskFields } from '@openng/optimus-ui/types/gantt';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'editing-doc',
    standalone: true,
    imports: [Gantt, ButtonModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                With <i>allowTaskbarEditing</i> a bar is dragged to move it, by an edge to resize it and by the knob under it to set its progress; every change lands in the data, moves what depends on it and reaches <i>[(dataSource)]</i>.
                <i>addRecord</i>, <i>updateRecordByID</i>, <i>deleteRecord</i>, <i>indent</i> and <i>outdent</i> change the tree, and each fires <i>actionBegin</i>, where <i>cancel</i> stops it, and <i>actionComplete</i>. <i>taskbarEditing</i> and
                <i>taskbarEdited</i> report a bar as it changes. Select a row and press Alt+Shift with the right arrow to indent it or with the left arrow to outdent it, and Delete to remove it.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-col gap-3">
            <div class="flex flex-wrap gap-2">
                <p-button label="Add task" size="small" (onClick)="add()" />
                <p-button label="Indent" size="small" severity="secondary" (onClick)="gantt().indent()" />
                <p-button label="Outdent" size="small" severity="secondary" (onClick)="gantt().outdent()" />
                <p-button label="Delete" size="small" severity="danger" [outlined]="true" (onClick)="remove()" />
            </div>
            <p-gantt
                #gantt
                [(dataSource)]="data"
                [taskFields]="fields"
                [editSettings]="{ allowTaskbarEditing: true, allowDeleting: true, allowEditing: true }"
                [labelSettings]="{ rightLabel: 'name' }"
                projectStartDate="2026-10-05"
                height="330px"
                (taskbarEdited)="last = $event.action + ': ' + $event.task.name"
            />
            <p class="text-sm">Last edit: {{ last || 'none yet' }}</p>
        </div>
        <app-code></app-code>
    `
})
export class EditingDoc {
    gantt = viewChild.required<Gantt>('gantt');

    last = '';

    private count = 6;

    fields: GanttTaskFields = { id: 'id', name: 'name', startDate: 'start', duration: 'days', progress: 'done', dependency: 'after', child: 'kids' };

    data = signal<any[]>([
        { id: 1, name: 'Plan', start: '2026-10-05', days: 3, done: 100 },
        { id: 2, name: 'Build', start: '2026-10-05', days: 6, done: 30, after: '1' },
        { id: 3, name: 'Test', start: '2026-10-05', days: 3, done: 0, after: '2' },
        { id: 4, name: 'Ship', start: '2026-10-05', days: 1, after: '3' }
    ]);

    add() {
        this.count++;
        this.gantt().addRecord({ id: this.count, name: `Task ${this.count}`, start: '2026-10-12', days: 2 });
    }

    remove() {
        const row = this.gantt().getCurrentViewRecords()[this.gantt().selectedRowIndex()];

        if (row) this.gantt().deleteRecord(row.id);
    }
}

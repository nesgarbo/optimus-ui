import { Component, signal, viewChild } from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { Gantt } from '@openng/optimus-ui/gantt';
import type { GanttTaskFields } from '@openng/optimus-ui/types/gantt';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'timeline-doc',
    standalone: true,
    imports: [Gantt, ButtonModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>timelineSettings</i> picks the two tiers of the header (<i>year</i>, <i>month</i>, <i>week</i> or <i>day</i>, each with a <i>format</i>) and, with <i>timelineUnitSize</i>, the width of one unit of the bottom tier. Left out, the
                tiers follow the zoom. <i>zoomIn</i>, <i>zoomOut</i> and <i>zoomToFit</i> change the scale, <i>scrollToTask</i> and <i>scrollToDate</i> move the chart, <i>setSplitterPosition</i> sets the width of the grid, and <i>collapseAll</i> and
                <i>expandAll</i> fold the tree.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-col gap-3">
            <div class="flex flex-wrap gap-2">
                <p-button label="Zoom in" size="small" severity="secondary" (onClick)="gantt().zoomIn()" />
                <p-button label="Zoom out" size="small" severity="secondary" (onClick)="gantt().zoomOut()" />
                <p-button label="Fit" size="small" severity="secondary" (onClick)="gantt().zoomToFit()" />
                <p-button label="Collapse all" size="small" severity="secondary" (onClick)="gantt().collapseAll()" />
                <p-button label="Expand all" size="small" severity="secondary" (onClick)="gantt().expandAll()" />
                <p-button label="Go to Release" size="small" (onClick)="gantt().scrollToTask('9')" />
            </div>
            <p-gantt #gantt [dataSource]="data()" [taskFields]="fields" [timelineSettings]="{ topTier: { unit: 'month', format: 'MMMM yyyy' }, bottomTier: { unit: 'week' }, timelineUnitSize: 70 }" projectStartDate="2026-10-05" height="340px" />
        </div>
        <app-code></app-code>
    `
})
export class TimelineDoc {
    gantt = viewChild.required<Gantt>('gantt');

    fields: GanttTaskFields = { id: 'id', name: 'name', startDate: 'start', duration: 'days', progress: 'done', dependency: 'after', child: 'kids' };

    data = signal<any[]>([
        {
            id: 1,
            name: 'Discovery',
            kids: [
                { id: 2, name: 'Interviews', start: '2026-10-05', days: 10, done: 100 },
                { id: 3, name: 'Analysis', start: '2026-10-05', days: 8, done: 60, after: '2' }
            ]
        },
        {
            id: 4,
            name: 'Delivery',
            after: '1',
            kids: [
                { id: 5, name: 'Sprint 1', start: '2026-10-05', days: 10 },
                { id: 6, name: 'Sprint 2', start: '2026-10-05', days: 10, after: '5' },
                { id: 7, name: 'Sprint 3', start: '2026-10-05', days: 10, after: '6' }
            ]
        },
        { id: 8, name: 'Hardening', start: '2026-10-05', days: 15, after: '4' },
        { id: 9, name: 'Release', start: '2026-10-05', days: 0, after: '8' }
    ]);
}

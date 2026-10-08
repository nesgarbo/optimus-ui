import { Component, signal, viewChild } from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { Gantt } from '@openng/optimus-ui/gantt';
import type { GanttTaskFields } from '@openng/optimus-ui/types/gantt';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'export-doc',
    standalone: true,
    imports: [Gantt, ButtonModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>exportToCsv()</i> writes the grid, every task including the collapsed ones, as CSV. <i>exportToSvg()</i> draws the whole gantt, grid and chart, as one SVG that a vector tool can open. <i>exportToImage()</i> makes a PNG or a JPEG of
                it and <i>exportToPdf()</i> a one-page PDF that holds a picture of it. The image and the PDF resolve to a <i>Blob</i>, and all of them download the file unless <i>download</i> is false. The drawing is built from the same numbers the
                screen uses, so it matches, and it is made without a dependency. The PDF is a picture: its text cannot be selected.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-col gap-3">
            <div class="flex flex-wrap gap-2">
                <p-button label="CSV" size="small" severity="secondary" (onClick)="gantt().exportToCsv({ fileName: 'plan' })" />
                <p-button label="SVG" size="small" severity="secondary" (onClick)="gantt().exportToSvg({ fileName: 'plan' })" />
                <p-button label="PNG" size="small" severity="secondary" (onClick)="gantt().exportToImage({ fileName: 'plan' })" />
                <p-button label="PDF" size="small" (onClick)="gantt().exportToPdf({ fileName: 'plan' })" />
            </div>
            <p-gantt #gantt [dataSource]="data()" [taskFields]="fields" [enableCriticalPath]="true" [labelSettings]="{ rightLabel: 'name' }" projectStartDate="2026-10-05" height="260px" />
        </div>
        <app-code></app-code>
    `
})
export class ExportDoc {
    gantt = viewChild.required<Gantt>('gantt');

    fields: GanttTaskFields = { id: 'id', name: 'name', startDate: 'start', duration: 'days', progress: 'done', dependency: 'after', child: 'kids' };

    data = signal<any[]>([
        {
            id: 1,
            name: 'Design',
            kids: [
                { id: 2, name: 'Research', start: '2026-10-05', days: 3, done: 100 },
                { id: 3, name: 'Mockups', start: '2026-10-05', days: 4, done: 50, after: '2' }
            ]
        },
        { id: 4, name: 'Build', start: '2026-10-05', days: 6, after: '1' },
        { id: 5, name: 'Launch', start: '2026-10-05', days: 0, after: '4' }
    ]);
}

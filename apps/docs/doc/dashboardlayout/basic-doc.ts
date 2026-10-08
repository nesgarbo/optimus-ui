import { Component, signal } from '@angular/core';
import { DashboardLayout } from '@openng/optimus-ui/dashboardlayout';
import type { PanelModel } from '@openng/optimus-ui/types/dashboardlayout';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'basic-doc',
    standalone: true,
    imports: [DashboardLayout, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                Each panel is a <i>PanelModel</i>: <i>id</i>, <i>row</i>, <i>col</i>, <i>sizeX</i> and <i>sizeY</i>, in grid cells. <i>columns</i>, <i>cellSpacing</i> and <i>cellAspectRatio</i> shape the grid. Drag a panel and the others make way;
                with <i>allowFloating</i> they also rise to close the gaps. <i>[(panels)]</i> hands back the new layout, and the <i>#header</i> and <i>#panel</i> templates draw the panels. A press on a button, a link or a field does not start a drag,
                and <i>draggableHandle</i> restricts dragging to one part of the panel.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-dashboardlayout [(panels)]="panels" [columns]="6" [cellSpacing]="10" [cellAspectRatio]="1.5">
                <ng-template #header let-panel>{{ panel.header }}</ng-template>
                <ng-template #panel let-panel>
                    <strong class="text-2xl">{{ panel.data.value }}</strong>
                    <p class="text-sm opacity-70 mt-1">{{ panel.data.note }}</p>
                </ng-template>
            </p-dashboardlayout>
        </div>
        <app-code></app-code>
    `
})
export class BasicDoc {
    panels = signal<PanelModel[]>([
        { id: 'sales', header: 'Sales', row: 0, col: 0, sizeX: 2, sizeY: 1, data: { value: '$48.2k', note: '+12% on last week' } },
        { id: 'orders', header: 'Orders', row: 0, col: 2, sizeX: 2, sizeY: 1, data: { value: '1,284', note: '37 waiting' } },
        { id: 'visitors', header: 'Visitors', row: 0, col: 4, sizeX: 2, sizeY: 1, data: { value: '9,310', note: 'Peak at 14:00' } },
        { id: 'activity', header: 'Activity', row: 1, col: 0, sizeX: 4, sizeY: 2, data: { value: '24 events', note: 'In the last hour' } },
        { id: 'alerts', header: 'Alerts', row: 1, col: 4, sizeX: 2, sizeY: 2, data: { value: '3 open', note: '1 critical' } }
    ]);
}

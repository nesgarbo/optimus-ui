import { Component, signal } from '@angular/core';
import { DashboardLayout } from '@openng/optimus-ui/dashboardlayout';
import type { PanelModel } from '@openng/optimus-ui/types/dashboardlayout';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'resize-doc',
    standalone: true,
    imports: [DashboardLayout, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>allowResizing</i> turns the handles on, and <i>resizableHandles</i> picks the edges and corners: <i>n</i>, <i>e</i>, <i>s</i>, <i>w</i>, <i>ne</i>, <i>nw</i>, <i>se</i> and <i>sw</i>. A panel keeps to its <i>minSizeX</i>,
                <i>minSizeY</i>, <i>maxSizeX</i> and <i>maxSizeY</i>, and <i>enabled: false</i> keeps the user from moving or resizing it. With the keyboard, focus a panel and press Alt and an arrow to move it or Shift and an arrow to resize it; the
                change is announced to a screen reader. <i>dragStart</i>, <i>drag</i>, <i>dragStop</i>, <i>resizeStart</i>, <i>resize</i> and <i>resizeStop</i> report the interaction, and <i>cancel</i> on a start event stops it.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-dashboardlayout [(panels)]="panels" [columns]="6" [cellSpacing]="10" [cellAspectRatio]="2" [allowResizing]="true" [resizableHandles]="['se', 'e', 's']" (resizeStop)="last = $event.panel.sizeX + ' x ' + $event.panel.sizeY">
                <ng-template #header let-panel>{{ panel.header }}</ng-template>
            </p-dashboardlayout>
            <p class="mt-4 text-sm">Last resize: {{ last || 'none yet' }}</p>
        </div>
        <app-code></app-code>
    `
})
export class ResizeDoc {
    last = '';

    panels = signal<PanelModel[]>([
        { id: 'a', header: 'Resizable', content: 'Drag the corner or an edge.', row: 0, col: 0, sizeX: 2, sizeY: 2, minSizeX: 1, maxSizeX: 4 },
        { id: 'b', header: 'Locked', content: 'enabled: false', row: 0, col: 2, sizeX: 2, sizeY: 1, enabled: false },
        { id: 'c', header: 'At most 3 wide', content: 'maxSizeX: 3', row: 2, col: 0, sizeX: 2, sizeY: 1, maxSizeX: 3 }
    ]);
}

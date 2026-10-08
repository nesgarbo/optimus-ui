import { Component, signal } from '@angular/core';
import { DashboardLayout } from '@openng/optimus-ui/dashboardlayout';
import type { PanelModel } from '@openng/optimus-ui/types/dashboardlayout';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'responsive-doc',
    standalone: true,
    imports: [DashboardLayout, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>mediaQuery</i> takes a media query, for example <i>max-width: 700px</i>. While it matches, the panels stack in one column in reading order, and moving and resizing are off. The stored layout is left as it was, so the wide layout
                comes back with the wide screen. The component follows the width of its own box, so it also works inside a drawer or a split pane.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-dashboardlayout [(panels)]="panels" [columns]="4" [cellSpacing]="8" [cellAspectRatio]="2" mediaQuery="max-width: 700px">
                <ng-template #header let-panel>{{ panel.header }}</ng-template>
            </p-dashboardlayout>
        </div>
        <app-code></app-code>
    `
})
export class ResponsiveDoc {
    panels = signal<PanelModel[]>([
        { id: 'a', header: 'One', content: 'Resize the window below 700px.', row: 0, col: 0, sizeX: 2, sizeY: 1 },
        { id: 'b', header: 'Two', content: 'The panels stack.', row: 0, col: 2, sizeX: 2, sizeY: 1 },
        { id: 'c', header: 'Three', content: 'In reading order.', row: 1, col: 0, sizeX: 4, sizeY: 1 }
    ]);
}

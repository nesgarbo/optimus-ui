import { Component, signal, viewChild } from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DashboardLayout } from '@openng/optimus-ui/dashboardlayout';
import type { PanelModel } from '@openng/optimus-ui/types/dashboardlayout';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'methods-doc',
    standalone: true,
    imports: [DashboardLayout, ButtonModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>addPanel</i> puts a panel in the first free place when it has no <i>row</i> and <i>col</i>. <i>removePanel</i>, <i>removeAll</i>, <i>movePanel</i>, <i>resizePanel</i> and <i>updatePanel</i> do the rest. <i>serialize()</i> returns
                the layout as it is on screen, ready to store, and <i>layoutChanged</i> says what changed.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-col gap-4">
            <div class="flex flex-wrap gap-2">
                <p-button label="Add panel" size="small" (onClick)="add()" />
                <p-button label="Remove last" severity="secondary" size="small" [disabled]="!panels().length" (onClick)="removeLast()" />
                <p-button label="Save layout" severity="secondary" size="small" (onClick)="save()" />
                <p-button label="Restore layout" severity="secondary" size="small" [disabled]="!saved" (onClick)="restore()" />
            </div>
            <p-dashboardlayout #dash [(panels)]="panels" [columns]="6" [cellSpacing]="10" [cellAspectRatio]="2.5">
                <ng-template #header let-panel>{{ panel.header }}</ng-template>
            </p-dashboardlayout>
        </div>
        <app-code></app-code>
    `
})
export class MethodsDoc {
    dash = viewChild.required<DashboardLayout>('dash');

    panels = signal<PanelModel[]>([{ id: 'p1', header: 'Panel 1', content: 'Added at the start', row: 0, col: 0, sizeX: 2, sizeY: 1 }]);

    saved = '';

    private count = 1;

    add() {
        this.count++;
        this.dash().addPanel({ id: `p${this.count}`, header: `Panel ${this.count}`, content: 'Added with addPanel()', sizeX: 2, sizeY: 1 });
    }

    removeLast() {
        const last = this.panels().at(-1);

        if (last) this.dash().removePanel(last.id);
    }

    save() {
        this.saved = JSON.stringify(this.dash().serialize());
    }

    restore() {
        this.panels.set(JSON.parse(this.saved));
    }
}

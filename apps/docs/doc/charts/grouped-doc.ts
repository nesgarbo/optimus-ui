import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { DEVICES } from './demo-data';

@Component({
    selector: 'grouped-doc',
    standalone: true,
    imports: [AppDocSectionText, ChartsModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>Several bar series with no wrapper render side by side in each category. Grouping is the default rather than stacking, because two overlapping bar series would hide one behind the other while grouping at least shows both.</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 24rem">
                <p-chart-svg>
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="desktop" name="Desktop" [borderRadius]="4" />
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="mobile" name="Mobile" [borderRadius]="4" />
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="tablet" name="Tablet" [borderRadius]="4" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend />
                    <p-chart-tooltip mode="shared" />
                    <p-chart-hover />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class GroupedDoc {
    data = DEVICES;
}

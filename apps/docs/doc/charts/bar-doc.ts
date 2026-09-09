import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { DEVICES } from './demo-data';

@Component({
    selector: 'bar-doc',
    standalone: true,
    imports: [AppDocSectionText, ChartsModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                <i>p-chart-bar</i> draws columns. Note that its value axis includes zero by default while a line's does not: a bar measures area from a baseline, so a cut axis exaggerates the differences between bars, whereas a line measures slope
                and a forced zero flattens the very trend the chart exists to show.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 24rem">
                <p-chart-svg>
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="desktop" name="Desktop" [borderRadius]="4" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-tooltip />
                    <p-chart-hover />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class BarDoc {
    data = DEVICES;
}

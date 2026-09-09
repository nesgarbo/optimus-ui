import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { DEVICES } from './demo-data';

@Component({
    selector: 'legend-doc',
    standalone: true,
    imports: [AppDocSectionText, ChartsModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                <i>p-chart-legend</i> lists the series and toggles their visibility on click. It is real DOM rather than a painted mark in both renderers, because the rows have to be focusable, clickable and selectable. <i>position</i> also decides
                the defaults for <i>align</i> and <i>layout</i>, so a left or right legend stacks vertically without being told to.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 24rem">
                <p-chart-svg>
                    <p-chart-line [data]="data" categoryXField="month" valueYField="desktop" name="Desktop" showMarkers />
                    <p-chart-line [data]="data" categoryXField="month" valueYField="mobile" name="Mobile" showMarkers />
                    <p-chart-line [data]="data" categoryXField="month" valueYField="tablet" name="Tablet" showMarkers />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend position="right" />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class LegendDoc {
    data = DEVICES;
}

import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { ACTIVITY } from './demo-data';

@Component({
    selector: 'heatmap-doc',
    standalone: true,
    imports: [AppDocSectionText, ChartsModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                A heatmap is the one cartesian series whose <i>both</i> axes are categorical: the value is carried by colour rather than by either position, so the colour scale is in effect its value axis. That is also why a heatmap needs
                <i>p-chart-color-legend</i> to be readable rather than <i>p-chart-legend</i>.
            </p>
            <p>
                The grid comes from the axes rather than from the data, so a missing combination still occupies its slot. Two cells are absent here on purpose: a hole is outlined with a dash rather than filled, so it reads as no reading instead of as
                a reading of zero.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 22rem">
                <p-chart-svg>
                    <p-chart-heatmap [data]="data" categoryXField="hour" categoryYField="day" valueField="sessions" [colorRange]="colorRange" [borderRadius]="3" [spacing]="3" />
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
export class HeatmapDoc {
    data = ACTIVITY;

    colorRange = ['#e0f2fe', '#5daeea', '#1d4ed8'];
}

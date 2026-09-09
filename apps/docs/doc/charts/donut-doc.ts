import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { TRAFFIC } from './demo-data';

@Component({
    selector: 'donut-doc',
    standalone: true,
    imports: [AppDocSectionText, ChartsModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                A donut is not a separate series type: it is a pie with <i>innerRadius</i> above zero. <i>spacing</i> puts a gap between slices, measured at the ring's mid-radius so the gap stays visually even instead of pinching at the inner edge.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 24rem">
                <p-chart-svg>
                    <p-chart-pie [data]="data" categoryField="source" valueField="sessions" [innerRadius]="0.6" [spacing]="2" [borderRadius]="4" />
                    <p-chart-legend position="right" />
                    <p-chart-tooltip />
                    <p-chart-hover />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class DonutDoc {
    data = TRAFFIC;
}

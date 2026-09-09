import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'gauge-doc',
    standalone: true,
    imports: [AppDocSectionText, ChartsModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                A gauge is a donut with <i>sweepAngle</i> below 360, and <i>startAngle</i> sets where the opening points. Note that the arc is centred on the circle rather than fitted to its own bounding box, so a narrow sweep in a wide box leaves
                the unused side empty — give the chart a square box, as here, and pair it with a muted remainder slice for a compact SLO or error-budget readout.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div style="display: flex; justify-content: center">
                <p-chart-svg [width]="460" [height]="460">
                    <p-chart-pie id="slo" [data]="data" valueField="value" categoryField="label" [color]="colors" [startAngle]="225" [sweepAngle]="270" [innerRadius]="0.7" />
                    <p-chart-tooltip />
                    <p-chart-hover />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class GaugeDoc {
    readonly data = [
        { label: 'SLO met', value: 92 },
        { label: 'Error budget', value: 8 }
    ];

    readonly colors = ['#10a981', 'rgba(148, 163, 184, 0.28)'];
}

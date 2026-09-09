import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { CENTER_BRIGHT_GRADIENT, PIPELINE, TOP_TO_BOTTOM_GRADIENT } from './demo-data';

@Component({
    selector: 'gradient-doc',
    standalone: true,
    imports: [AppDocSectionText, ChartsModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>Anywhere a colour is accepted, a gradient object is accepted too. The coordinates are in the unit square of the shape being filled, so the same definition works whatever size the chart ends up at.</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 24rem">
                <p-chart-svg>
                    <p-chart-line [data]="data" categoryXField="month" valueYField="pipeline" name="Pipeline coverage" [color]="topToBottomGradient" [fillOpacity]="1" curve="smooth" />
                    <p-chart-line [data]="data" categoryXField="month" valueYField="confidence" name="Renewal confidence" [color]="centerBrightGradient" [fillOpacity]="1" curve="smooth" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class GradientDoc {
    data = PIPELINE;

    topToBottomGradient = TOP_TO_BOTTOM_GRADIENT;

    centerBrightGradient = CENTER_BRIGHT_GRADIENT;
}

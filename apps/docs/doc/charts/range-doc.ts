import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { TEMPERATURES } from './demo-data';

@Component({
    selector: 'range-doc',
    standalone: true,
    imports: [AppDocSectionText, ChartsModule, AppCode],
    template: `
        <app-docsectiontext>
            <p><i>p-chart-range</i> pairs the two line series inside it into a filled band. The first child is the upper edge and the second the lower, which is what a high/low range or a confidence interval wants.</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 24rem">
                <p-chart-svg>
                    <p-chart-range>
                        <p-chart-line [data]="data" categoryXField="month" valueYField="high" name="High" curve="smooth" />
                        <p-chart-line [data]="data" categoryXField="month" valueYField="low" name="Low" curve="smooth" />
                    </p-chart-range>
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class RangeDoc {
    data = TEMPERATURES;
}

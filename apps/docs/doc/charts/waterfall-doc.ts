import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { BRIDGE } from './demo-data';

@Component({
    selector: 'waterfall-doc',
    standalone: true,
    imports: [AppDocSectionText, ChartsModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                <i>p-chart-waterfall</i> turns a bar series into a running total: each bar starts where the previous one ended. A row that <i>totalField</i> resolves truthy for is a summary instead — it spans from zero to the cumulative sum, so a
                "Closing" column reads as an absolute figure rather than as one more step. A summary row carries no delta of its own, which is why its value is null here.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 24rem">
                <p-chart-svg>
                    <p-chart-waterfall totalField="total">
                        <p-chart-bar [data]="data" categoryXField="stage" valueYField="delta" name="Revenue bridge" [borderRadius]="3" />
                    </p-chart-waterfall>
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
export class WaterfallDoc {
    data = BRIDGE;
}

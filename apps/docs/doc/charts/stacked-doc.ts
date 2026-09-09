import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { DEVICES } from './demo-data';

@Component({
    selector: 'stacked-doc',
    standalone: true,
    imports: [AppDocSectionText, ChartsModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                <i>p-chart-stacked</i> stacks the series it wraps. In <i>percent</i> mode each category is normalised by magnitude, so a category holding +30 and -70 reads as 30% and 70% of the bar rather than as a 100% span of -40. Toggling a series
                off in the legend takes it out of the stack rather than stacking it at zero, so the bar closes up instead of leaving a hole.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 24rem">
                <p-chart-svg>
                    <p-chart-stacked>
                        <p-chart-bar [data]="data" categoryXField="month" valueYField="desktop" name="Desktop" />
                        <p-chart-bar [data]="data" categoryXField="month" valueYField="mobile" name="Mobile" />
                        <p-chart-bar [data]="data" categoryXField="month" valueYField="tablet" name="Tablet" [borderRadius]="4" />
                    </p-chart-stacked>
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend />
                    <p-chart-tooltip mode="shared" />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class StackedDoc {
    data = DEVICES;
}

import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { WITH_GAPS } from './demo-data';

@Component({
    selector: 'nulls-doc',
    standalone: true,
    imports: [AppDocSectionText, ChartsModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                <i>connectNulls</i> decides what a missing value looks like. The default, <i>gap</i>, keeps the category's place on the axis and draws nothing — a break in the line is honest about the data not being there. <i>connect</i> bridges the
                gap, and <i>zero</i> plots the null at the baseline. Only reach for <i>zero</i> where zero is a real reading rather than an absent one.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div class="flex flex-col gap-4">
                <div style="height: 16rem">
                    <p-chart-svg>
                        <p-chart-line [data]="data" categoryXField="month" valueYField="signups" name="gap (default)" showMarkers />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                        <p-chart-legend />
                    </p-chart-svg>
                </div>
                <div style="height: 16rem">
                    <p-chart-svg>
                        <p-chart-line [data]="data" categoryXField="month" valueYField="signups" name="connect" connectNulls="connect" showMarkers />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                        <p-chart-legend />
                    </p-chart-svg>
                </div>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class NullsDoc {
    data = WITH_GAPS;
}

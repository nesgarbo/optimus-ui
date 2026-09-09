import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { ACTIVATION } from './demo-data';

@Component({
    selector: 'basic-doc',
    standalone: true,
    imports: [AppDocSectionText, ChartsModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Charts is a compound component. <i>p-chart-svg</i> is the root, and every visible feature is a child you add or remove: a series, an axis, a legend, a tooltip. There is no <i>showLegend</i> flag anywhere — adding
                <i>p-chart-legend</i> renders a legend and reserves space for it, and removing the element removes both.
            </p>
            <p>A minimal chart is one series and two axes.</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 24rem">
                <p-chart-svg>
                    <p-chart-line [data]="data" categoryXField="month" valueYField="activation" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class BasicDoc {
    data = ACTIVATION;
}

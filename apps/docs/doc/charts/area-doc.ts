import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { ACTIVATION } from './demo-data';

@Component({
    selector: 'area-doc',
    standalone: true,
    imports: [AppDocSectionText, ChartsModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>There is no separate area series. An area is a line with a fill under it, so set <i>fillOpacity</i> above zero on <i>p-chart-line</i> and every other input keeps working unchanged — the curve, the markers, the segment callbacks.</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 24rem">
                <p-chart-svg>
                    <p-chart-line [data]="data" categoryXField="month" valueYField="activation" curve="smooth" [fillOpacity]="0.2" showMarkers />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class AreaDoc {
    data = ACTIVATION;
}

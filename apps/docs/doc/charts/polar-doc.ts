import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { WIND } from './demo-data';

@Component({
    selector: 'polar-doc',
    standalone: true,
    imports: [AppDocSectionText, ChartsModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                A polar series draws one radial bar per sector, measured against the same concentric grid a radar uses. <i>innerRadius</i> hollows out the centre; without a <i>p-chart-stacked</i> wrapper, several polar series render side by side
                within each sector.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 26rem">
                <p-chart-svg>
                    <p-chart-polar [data]="data" categoryXField="direction" valueYField="strength" name="Gust" [innerRadius]="0.15" [borderRadius]="3" />
                    <p-chart-y-axis gridShape="circle" [tickCount]="4" />
                    <p-chart-tooltip />
                    <p-chart-hover />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class PolarDoc {
    data = WIND;
}

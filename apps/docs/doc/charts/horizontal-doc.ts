import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { CITIES } from './demo-data';

@Component({
    selector: 'horizontal-doc',
    standalone: true,
    imports: [AppDocSectionText, ChartsModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Orientation is chosen by which fields you bind rather than by a flag. Bind <i>categoryYField</i> and <i>valueXField</i> and the bars run horizontally, which keeps each field name describing the axis it belongs to instead of describing
                the default.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 24rem">
                <p-chart-svg>
                    <p-chart-bar [data]="data" categoryYField="city" valueXField="population" name="Population (millions)" [borderRadius]="4" />
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
export class HorizontalDoc {
    data = CITIES;
}

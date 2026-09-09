import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { WIND } from './demo-data';

@Component({
    selector: 'nightingale-doc',
    standalone: true,
    imports: [AppDocSectionText, ChartsModule, AppCode],
    template: `
        <app-docsectiontext>
            <p><i>sliceRadiusValue</i> gives each slice its own outer radius, so the magnitude is encoded in the radius as well as in the angle. With equal angles that makes a rose chart, which is what Nightingale's original diagram was.</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 24rem">
                <p-chart-svg>
                    <p-chart-pie [data]="data" categoryField="direction" valueField="one" sliceRadiusValue="strength" [spacing]="1" />
                    <p-chart-legend position="right" />
                    <p-chart-tooltip />
                    <p-chart-hover />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class NightingaleDoc {
    // Equal angles, so the radius alone carries the magnitude.
    data = WIND.map((row) => ({ ...row, one: 1 }));
}

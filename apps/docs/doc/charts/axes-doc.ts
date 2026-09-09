import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { DEVICES } from './demo-data';

@Component({
    selector: 'axes-doc',
    standalone: true,
    imports: [AppDocSectionText, ChartsModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                An axis declares a scale for the series to bind to and reserves the space its labels need. The tick count defaults to <i>auto</i>, derived from the axis' pixel length rather than fixed, because a fixed count crowds a short chart and
                leaves a tall one sparse.
            </p>
            <p>Grid lines default to <i>auto</i> too, which means on for the value axis and off for the category axis. A grid line exists so a reader can carry a mark's height back to a number, and a category axis has no number to carry back to.</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 24rem">
                <p-chart-svg>
                    <p-chart-line [data]="data" categoryXField="month" valueYField="desktop" name="Desktop" showMarkers />
                    <p-chart-x-axis label="Signup month" [tickRotation]="-30" />
                    <p-chart-y-axis type="linear" label="Sessions" [tickCount]="4" [minorGridLines]="true" [alternateGridColor]="'currentColor'" />
                    <p-chart-tooltip />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class AxesDoc {
    data = DEVICES;
}

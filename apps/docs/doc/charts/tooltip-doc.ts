import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { DEVICES } from './demo-data';

@Component({
    selector: 'tooltip-doc',
    standalone: true,
    imports: [AppDocSectionText, ChartsModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                <i>mode="shared"</i> reports every series at the hovered category rather than only the nearest mark, which is what makes the values comparable. <i>crosshair</i> adds the reference lines. The show and hide delays live on the tooltip
                rather than on the chart, so the crosshair lingers with the card and the two never disagree about what is hovered.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 24rem">
                <p-chart-svg>
                    <p-chart-line [data]="data" categoryXField="month" valueYField="desktop" name="Desktop" showMarkers />
                    <p-chart-line [data]="data" categoryXField="month" valueYField="mobile" name="Mobile" showMarkers />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend />
                    <p-chart-tooltip mode="shared" [crosshair]="true" [hideDelay]="120" />
                    <p-chart-hover [dimOpacity]="0.35" />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class TooltipDoc {
    data = DEVICES;
}

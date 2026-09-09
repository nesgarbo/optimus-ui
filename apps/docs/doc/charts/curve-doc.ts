import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { CURVES } from './demo-data';

@Component({
    selector: 'curve-doc',
    standalone: true,
    imports: [AppDocSectionText, ChartsModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                <i>curve</i> sets the interpolation between points. <i>smooth</i> is monotone cubic rather than a plain spline, which matters: a plain spline can overshoot, so a series that never dips below zero would be drawn dipping below zero
                between two points. <i>spline</i> is the classic Catmull-Rom, where <i>tension</i> controls how tightly the curve hugs the data.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 24rem">
                <p-chart-svg>
                    <p-chart-line [data]="data" categoryXField="hour" valueYField="linear" curve="linear" showMarkers [markerSize]="4" name="Linear" />
                    <p-chart-line [data]="data" categoryXField="hour" valueYField="smooth" curve="smooth" showMarkers [markerSize]="4" name="Smooth" />
                    <p-chart-line [data]="data" categoryXField="hour" valueYField="step" curve="step" showMarkers [markerSize]="4" name="Step" />
                    <p-chart-line [data]="data" categoryXField="hour" valueYField="stepBefore" curve="step-before" showMarkers [markerSize]="4" name="Step Before" />
                    <p-chart-line [data]="data" categoryXField="hour" valueYField="stepAfter" curve="step-after" showMarkers [markerSize]="4" name="Step After" />
                    <p-chart-line [data]="data" categoryXField="hour" valueYField="spline" curve="spline" [tension]="0.3" showMarkers [markerSize]="4" name="Spline (tension: 0.3)" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend position="bottom" />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class CurveDoc {
    data = CURVES;
}

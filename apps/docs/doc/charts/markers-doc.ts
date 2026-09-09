import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { DEVICES } from './demo-data';

@Component({
    selector: 'markers-doc',
    standalone: true,
    imports: [AppDocSectionText, ChartsModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                <i>showMarkers</i> draws a mark at every vertex. <i>markerShape</i> takes one of the five built-in names — <i>circle</i>, <i>square</i>, <i>triangle</i>, <i>cross</i>, <i>star</i> — or any SVG path <i>d</i> string, which is what lets
                you pass a glyph of your own without writing a renderer.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 24rem">
                <p-chart-svg>
                    <p-chart-line [data]="data" categoryXField="month" valueYField="desktop" name="Desktop" showMarkers [markerSize]="6" markerShape="circle" />
                    <p-chart-line [data]="data" categoryXField="month" valueYField="mobile" name="Mobile" showMarkers [markerSize]="8" markerShape="star" />
                    <p-chart-line [data]="data" categoryXField="month" valueYField="tablet" name="Tablet" showMarkers [markerSize]="7" markerShape="triangle" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class MarkersDoc {
    data = DEVICES;
}

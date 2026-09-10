import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { SKILLS } from './demo-data';

@Component({
    selector: 'radar-doc',
    standalone: true,
    imports: [AppDocSectionText, ChartsModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                A radar series closes a polygon through one point per spoke. The concentric grid is configured on <i>p-chart-y-axis</i> rather than on the series — the rings <i>are</i> the value axis, so <i>gridShape</i> and <i>tickCount</i> belong
                there.
            </p>
            <p>Note that the axis starts at zero. Cutting a radial axis misleads far more than cutting a cartesian one: the reader is comparing areas, and a non-zero centre inflates every one of them.</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 26rem">
                <p-chart-svg>
                    <p-chart-radar [data]="data" categoryXField="axis" valueYField="current" name="Current" />
                    <p-chart-radar [data]="data" categoryXField="axis" valueYField="target" name="Target" />
                    <p-chart-y-axis gridShape="polygon" [tickCount]="4" />
                    <p-chart-legend />
                    <p-chart-tooltip mode="shared" />
                    <p-chart-hover />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class RadarDoc {
    data = SKILLS;
}

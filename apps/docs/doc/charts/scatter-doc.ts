import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { CORRELATION } from './demo-data';

@Component({
    selector: 'scatter-doc',
    standalone: true,
    imports: [AppDocSectionText, ChartsModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>A scatter series binds two numbers and no category, which makes it the one cartesian series whose <i>both</i> axes are value axes — so a bare axis under it resolves to a numeric scale on each side without being told.</p>
            <p>Hover measures 2D distance here rather than snapping along x, because a scatter plot has no category to snap to.</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 24rem">
                <p-chart-svg>
                    <p-chart-scatter [data]="data" valueXField="spend" valueYField="revenue" name="Accounts" [markerSize]="5" />
                    <p-chart-x-axis label="Spend" />
                    <p-chart-y-axis label="Revenue" />
                    <p-chart-tooltip />
                    <p-chart-hover />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class ScatterDoc {
    data = CORRELATION;
}

import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { TRAFFIC } from './demo-data';

@Component({
    selector: 'pie-doc',
    standalone: true,
    imports: [AppDocSectionText, ChartsModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                A pie is one series whose slices are the categories, so the palette varies per slice rather than per series and the legend lists the slices. Hiding one through the legend re-proportions the rest into a full circle: in a part-to-whole
                chart the whole is whatever is currently shown, so a wedge-shaped hole would be the wrong answer.
            </p>
            <p>A negative value has no meaning here, so its magnitude is used rather than letting it subtract from the total and distort every other slice.</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 24rem">
                <p-chart-svg>
                    <p-chart-pie [data]="data" categoryField="source" valueField="sessions" />
                    <p-chart-legend position="right" />
                    <p-chart-tooltip />
                    <p-chart-hover [offset]="8" />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class PieDoc {
    data = TRAFFIC;
}

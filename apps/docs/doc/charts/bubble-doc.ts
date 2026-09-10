import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { CORRELATION } from './demo-data';

@Component({
    selector: 'bubble-doc',
    standalone: true,
    imports: [AppDocSectionText, ChartsModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Bubble is not a separate series: binding <i>sizeField</i> turns the marker radius into a third encoded dimension. The radius is scaled against the series' own size extent, so the largest bubble reaches <i>maxSize</i> and the rest are
                read against it.
            </p>
            <p>
                Edge padding on a continuous axis defaults to zero, so a mark sitting on the domain's extreme is drawn right at the plot edge and clipped. <i>chartPaddingMin</i> and <i>chartPaddingMax</i> — fractions of the pixel range, not of the
                data — give it room, which is what a bubble chart wants and a line chart usually does not.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 24rem">
                <p-chart-svg>
                    <p-chart-scatter [data]="data" valueXField="spend" valueYField="revenue" sizeField="accounts" name="Accounts" [minSize]="4" [maxSize]="26" [opacity]="0.65" />
                    <p-chart-x-axis label="Spend" [chartPaddingMin]="0.04" [chartPaddingMax]="0.04" />
                    <p-chart-y-axis label="Revenue" [chartPaddingMin]="0.04" [chartPaddingMax]="0.06" />
                    <p-chart-tooltip />
                    <p-chart-hover />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class BubbleDoc {
    data = CORRELATION;
}

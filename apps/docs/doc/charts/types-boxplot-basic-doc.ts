import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-boxplot-basic-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>p-chart-boxplot</i> draws the five-number summary of each category. Give it the raw numbers in <i>valuesField</i> and it works out the quartiles (<i>quartileMethod</i> is <i>exclusive</i>, <i>inclusive</i> or <i>linear</i>), the
                whiskers (<i>whiskerReach</i>, 1.5 times the interquartile range by default) and the outliers. Or give it ready-made <i>minField</i>, <i>q1Field</i>, <i>medianField</i>, <i>q3Field</i> and <i>maxField</i>. <i>showMean</i> adds a
                marker for the mean and <i>showOutliers</i> turns the outlier points on or off.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 400px">
                    <p-chart-svg>
                        <p-chart-boxplot [data]="samples" categoryXField="group" valuesField="values" [showMean]="true" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                        <p-chart-tooltip />
                    </p-chart-svg>
                </div>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 24rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoxplotBasicDoc {
    readonly samples = [
        { group: 'Control', values: [12, 14, 15, 15, 16, 17, 18, 19, 21, 22, 40] },
        { group: 'Dose A', values: [15, 17, 18, 20, 21, 22, 23, 25, 26, 27] },
        { group: 'Dose B', values: [20, 22, 25, 26, 28, 29, 31, 33, 34, 38, 3] }
    ];
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, histogram } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-column-bar-histogram-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>histogram(values, options)</i> counts raw numbers into bins and returns rows with <i>label</i>, <i>count</i>, <i>density</i>, <i>x0</i> and <i>x1</i>. Feed them to <i>ChartBar</i> and set <i>categoryGap</i> to 0 so that the bars
                touch. <i>bins</i> fixes the number of bins; without it <i>rule</i> picks one (<i>sturges</i>, <i>sqrt</i>, <i>scott</i> or <i>freedman-diaconis</i>). <i>thresholds</i> sets the edges, so bins can differ in width, and
                <i>density</i> then compares them fairly. <i>domain</i> restricts the range and <i>nice</i> rounds the edges.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 420px">
                    <p-chart-svg>
                        <p-chart-bar [data]="bins" categoryXField="label" valueYField="count" [categoryGap]="0" [barGap]="0" color="#7c8cff" [borderStrokeWidth]="1" borderColor="#ffffff" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
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
export class ColumnBarHistogramDoc {
    // A fixed sequence that looks like exam marks: a bell around 62, from a small deterministic generator.
    private readonly marks = (() => {
        let seed = 7;
        const next = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

        return Array.from({ length: 240 }, () => Math.round(Math.min(Math.max(62 + (next() + next() + next() + next() - 2) * 22, 0), 100)));
    })();

    readonly bins = histogram(this.marks, { bins: 10, domain: [0, 100] });
}

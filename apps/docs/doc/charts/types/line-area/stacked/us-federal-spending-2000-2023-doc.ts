import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue } from '@openng/optimus-ui/charts';
import { federalSpending } from '@/doc/charts/data/federalSpending';

const COLORS = {
    other: '#94a3b8',
    interest: '#ffad5a',
    defense: '#5daeea',
    health: '#10a981',
    social: '#ff6fae'
};

@Component({
    selector: 'types-line-area-stacked-us-federal-spending-2000-2023-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Five series inside <i>ChartStacked</i> build up total federal outlays year by year. A <i>ChartAnnotation</i> marks the 2020 COVID stimulus spike directly on the chart. <i>ChartLegend</i> toggles any category to isolate it, and the
                <i>show-all</i> tooltip reports every category's dollar amount plus the annual total.
            </p>
            <p>#### SvgStackedFederalSpendingDemo.ts</p>
            <p>#### federalSpending.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 600 }">
                        <p-chart-stacked>
                            <p-chart-line [data]="data" categoryXField="year" valueYField="social" name="Social Security" [color]="colors.social" curve="smooth" [fillOpacity]="0.8" />
                            <p-chart-line [data]="data" categoryXField="year" valueYField="health" name="Health (Medicare)" [color]="colors.health" curve="smooth" [fillOpacity]="0.8" />
                            <p-chart-line [data]="data" categoryXField="year" valueYField="defense" name="Defense" [color]="colors.defense" curve="smooth" [fillOpacity]="0.8" />
                            <p-chart-line [data]="data" categoryXField="year" valueYField="interest" name="Net Interest" [color]="colors.interest" curve="smooth" [fillOpacity]="0.8" />
                            <p-chart-line [data]="data" categoryXField="year" valueYField="other" name="Other" [color]="colors.other" curve="smooth" [fillOpacity]="0.8" />
                        </p-chart-stacked>
                        <p-chart-reference-line x="2020" label="COVID" stroke="var(--p-chart-annotation-color)" [lineDash]="[4, 3]" labelPosition="start" labelColor="var(--p-chart-annotation-color)" [labelFontSize]="10" />
                        <p-chart-tooltip mode="shared" [valueFormatter]="formatBillions" />
                        <p-chart-legend position="bottom" />
                        <p-chart-hover />
                        <p-chart-x-axis />
                        <p-chart-y-axis [tickCount]="6" [tickFormat]="formatTrillions" />
                        <p-chart-title text="US federal spending by category 2000–2023" />
                        <p-chart-caption text="Source: Congressional Budget Office · Historical Budget Data · Fiscal years · $ billions" />
                        <p-chart-export-menu filename="us-federal-spending-2000-2023" />
                        <p-chart-accessibility />
                    </p-chart-svg>
                </div>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineAreaStackedUsFederalSpending20002023Doc {
    readonly data = federalSpending;
    readonly colors = COLORS;
    readonly formatBillions = (v: number) => `$${v}B`;
    readonly formatTrillions = (v: TickValue) => '$' + (Number(v) / 1000).toFixed(1) + 'T';
}

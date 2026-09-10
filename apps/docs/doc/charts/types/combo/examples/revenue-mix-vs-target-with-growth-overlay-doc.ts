import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue } from '@openng/optimus-ui/charts';
import { comboSalesBreakdown } from '@/doc/charts/data/comboSalesBreakdown';

function formatCurrency(v: number): string {
    return v >= 1000 ? `$${(v / 1000).toFixed(1)}M` : `$${v}K`;
}

@Component({
    selector: 'types-combo-examples-revenue-mix-vs-target-with-growth-overlay-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>ChartStacked</i> combines three <i>ChartBar</i> series into a single stack per quarter. A dashed <i>ChartLine</i> overlays the quarterly revenue target on the same left axis, and a second <i>ChartLine</i> on the right axis tracks
                YoY growth with its own scale and tick formatter. <i>ChartDataLabels</i> shows values on the bars; a display predicate suppresses labels for the target line.
            </p>
            <p>#### SvgComboSalesBreakdownDemo.ts</p>
            <p>#### comboSalesBreakdown.ts</p>
        </app-docsectiontext>
        <div class="card">
            <p-chart-svg [height]="460" [animation]="{ duration: 650, easing: 'easeOutCubic' }">
                <p-chart-stacked>
                    <p-chart-bar [data]="data" categoryXField="quarter" valueYField="core" name="Core subscription" color="#5daeea" />
                    <p-chart-bar [data]="data" categoryXField="quarter" valueYField="addons" name="Add-ons" color="#7c8cff" />
                    <p-chart-bar [data]="data" categoryXField="quarter" valueYField="services" name="Professional svc." color="#ff6fae" />
                </p-chart-stacked>
                <p-chart-line [data]="data" categoryXField="quarter" valueYField="target" name="Quarterly target" color="#4ecdc4" curve="linear" [lineStrokeWidth]="2" [lineDash]="[5, 5]" [fillOpacity]="0" [showMarkers]="false" />
                <p-chart-line [data]="data" categoryXField="quarter" valueYField="growth" name="YoY growth" color="#ffad5a" yAxisId="growth" curve="smooth" [lineStrokeWidth]="2.5" [showMarkers]="true" [markerSize]="5" />
                <p-chart-reference-line yAxisId="growth" [y]="20" stroke="rgba(255,173,90,0.3)" [lineDash]="[2, 4]" label="20% growth floor" />
                <p-chart-x-axis />
                <p-chart-y-axis position="left" label="Revenue" [tickFormat]="formatRevenue" />
                <p-chart-y-axis id="growth" position="right" label="YoY growth" [gridLines]="false" [tickFormat]="formatGrowth" [min]="0" [max]="40" />
                <p-chart-data-labels>
                    <ng-template pChartDataLabelDef let-ctx>
                        @if (ctx.label !== 'Quarterly target') {
                            <svg:text [attr.fill]="ctx.color" font-size="11">{{ format(ctx.value) }}</svg:text>
                        }
                    </ng-template>
                </p-chart-data-labels>
                <p-chart-legend position="top" />
                <p-chart-tooltip mode="shared" />
                <p-chart-hover />
                <p-chart-title text="Revenue mix vs target with growth overlay" />
                <p-chart-caption text="Stacked bars break revenue into core, add-ons, and services. Dashed line shows the quarterly target; the right axis tracks YoY growth rate." />
            </p-chart-svg>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExamplesRevenueMixVsTargetWithGrowthOverlayDoc {
    readonly data = comboSalesBreakdown;

    readonly format = formatCurrency;
    readonly formatRevenue = (v: TickValue): string => formatCurrency(Number(v));
    readonly formatGrowth = (v: TickValue): string => `${v}%`;
}

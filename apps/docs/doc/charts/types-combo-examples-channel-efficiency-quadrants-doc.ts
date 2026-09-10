import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { comboBubbleTrend, comboBubbleTrendLine, comboBubbleTrendMedian } from '@/doc/charts/data/comboBubbleTrend';

@Component({
    selector: 'types-combo-examples-channel-efficiency-quadrants-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>ChartScatter</i> plots each channel at <i>(spend, conversion)</i> with bubble radius proportional to attributed revenue. Four <i>ChartReferenceBand</i> rectangles tint the quadrants split at the portfolio medians: efficient
                channels sit top-left, underperforming channels bottom-right. A <i>ChartLine</i> shows the least-squares regression of the raw data.
            </p>
            <p>#### SvgComboBubbleTrendDemo.ts</p>
            <p>#### comboBubbleTrend.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460" [animation]="{ duration: 600, easing: 'easeOutCubic' }">
                    <p-chart-reference-band [x1]="0" [x2]="medianSpend" [y1]="medianConversion" [y2]="10" fill="#5ccf9f" [fillOpacity]="0.12" label="Hero" />
                    <p-chart-reference-band [x1]="medianSpend" [x2]="35" [y1]="medianConversion" [y2]="10" fill="#5daeea" [fillOpacity]="0.08" label="Scale" />
                    <p-chart-reference-band [x1]="0" [x2]="medianSpend" [y1]="0" [y2]="medianConversion" fill="#ffad5a" [fillOpacity]="0.08" label="Optimize" />
                    <p-chart-reference-band [x1]="medianSpend" [x2]="35" [y1]="0" [y2]="medianConversion" fill="#ff7a66" [fillOpacity]="0.1" label="Cut" />
                    <p-chart-scatter [data]="channels" valueXField="spend" valueYField="conversion" sizeField="revenue" name="Channels" color="#7c8cff" [pointFillOpacity]="0.55" [minSize]="8" [maxSize]="34" />
                    <p-chart-line [data]="trendLine" valueXField="spend" valueYField="conversion" name="Spend-vs-conversion trend" color="#94a3b8" curve="linear" [lineStrokeWidth]="1.5" [lineDash]="[5, 4]" [fillOpacity]="0" [showMarkers]="false" />
                    <p-chart-x-axis type="linear" label="Monthly spend ($K)" [min]="0" [max]="35" [tickFormat]="formatSpend" />
                    <p-chart-y-axis label="Conversion rate (%)" [min]="0" [max]="10" [tickFormat]="formatConversion" />
                    <p-chart-legend position="top" />
                    <p-chart-tooltip [valueFormatter]="tooltipRows" />
                    <p-chart-hover />
                    <p-chart-title text="Channel efficiency quadrants" />
                    <p-chart-caption text="Each bubble is a channel sized by attributed revenue. Quadrants split at median spend and conversion — top-left is most efficient, bottom-right is underperforming. Dashed line is the linear trend." />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComboExamplesChannelEfficiencyQuadrantsDoc {
    readonly channels = comboBubbleTrend;
    readonly trendLine = comboBubbleTrendLine;
    readonly medianSpend = comboBubbleTrendMedian.spend;
    readonly medianConversion = comboBubbleTrendMedian.conversion;

    readonly formatSpend = (v: TickValue): string => `$${v}K`;
    readonly formatConversion = (v: TickValue): string => `${v}%`;

    readonly tooltipRows = (value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const c = this.channels[ctx.index ?? -1];

        if (c && c.channel === ctx.label) {
            return [
                { label: 'Monthly spend', value: `$${c.spend}K` },
                { label: 'Conversion', value: `${c.conversion}%` },
                { label: 'Revenue', value: `$${c.revenue}K` }
            ];
        }

        return [{ label: 'Conversion', value: `${value.toFixed(1)}%` }];
    };
}

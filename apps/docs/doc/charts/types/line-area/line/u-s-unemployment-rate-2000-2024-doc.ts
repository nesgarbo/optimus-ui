import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TooltipRow } from '@openng/optimus-ui/charts';
import { unemploymentQuarterly } from '@/doc/charts/data/unemploymentQuarterly';

@Component({
    selector: 'types-line-area-line-u-s-unemployment-rate-2000-2024-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>ChartReferenceBand</i> shades each recession period so downturns are immediately visible against the normal range. A <i>ChartReferenceLine</i> marks the 4.4% natural rate. The custom tooltip color-codes severity (green, amber, or
                red), making each point's distance from the normal range readable at a glance. Drag the <i>ChartNavigator</i> to isolate any period.
            </p>
            <p>#### SvgLineUnemploymentDemo.ts</p>
            <p>#### unemploymentQuarterly.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 600 }">
                        <p-chart-reference-band x1="Q1 01" x2="Q3 01" fill="#e5484d" [fillOpacity]="0.06" label="Dot-com" labelPosition="start" />
                        <p-chart-reference-band x1="Q1 08" x2="Q3 09" fill="#e5484d" [fillOpacity]="0.06" label="Great Recession" labelPosition="start" />
                        <p-chart-reference-band x1="Q1 20" x2="Q3 20" fill="#e5484d" [fillOpacity]="0.06" label="COVID-19" labelPosition="start" />
                        <p-chart-line [data]="data" categoryXField="date" valueYField="rate" color="#5daeea" [lineStrokeWidth]="2.5" curve="smooth" [showMarkers]="true" [markerSize]="3" />
                        <p-chart-reference-line [y]="4.4" stroke="#10a981" [lineDash]="[6, 3]" [lineStrokeWidth]="1" label="Natural rate ≈ 4.4%" labelPosition="end" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                        <p-chart-tooltip [valueFormatter]="tooltipRows" />
                        <p-chart-zoom mode="x" />
                        <p-chart-navigator />
                        <p-chart-title text="U.S. unemployment rate 2000–2024" />
                        <p-chart-caption text="Source: Bureau of Labor Statistics · U-3 seasonally adjusted · Quarterly samples · Shaded bands: NBER recession periods" />
                        <p-chart-export-menu filename="us-unemployment-2000-2024" />
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
export class LineAreaLineUSUnemploymentRate20002024Doc {
    readonly data = unemploymentQuarterly;
    readonly tooltipRows = (v: number): TooltipRow[] => [{ label: 'Rate', value: `${v.toFixed(1)}%`, color: v >= 7 ? '#e5484d' : v >= 5 ? '#ffad5a' : '#10a981' }];
}

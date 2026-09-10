import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue } from '@openng/optimus-ui/charts';
import { comboEconomicForecast } from '@/doc/charts/data/comboEconomicForecast';

@Component({
    selector: 'types-combo-examples-economic-forecast-envelope-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>ChartRange</i> wraps two <i>ChartLine</i> series (forecast high and low) to render a shaded uncertainty band. A third standalone <i>ChartLine</i> carries the actual GDP figures through the historical period.
                <i>[connectNulls]="false"</i> keeps the actual line from extending into the forecast horizon where values are <i>null</i>. Two <i>ChartReferenceBand</i> columns call out the pandemic recession year and the forecast horizon. Reference
                lines mark the 0% axis and the long-run potential growth rate.
            </p>
            <p>#### SvgComboEconomicForecastDemo.ts</p>
            <p>#### comboEconomicForecast.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 700, easing: 'easeOutCubic' }">
                        <p-chart-reference-band x1="2020" x2="2020" fill="#ff7a66" [fillOpacity]="0.08" label="Pandemic recession" />
                        <p-chart-reference-band x1="2025" x2="2027" fill="#7c8cff" [fillOpacity]="0.06" label="Forecast horizon" />
                        <p-chart-reference-line [y]="0" stroke="#64748b99" [lineStrokeWidth]="1" />
                        <p-chart-reference-line [y]="2.0" stroke="#10a9814d" [lineDash]="[3, 4]" label="Long-run potential 2.0%" />
                        <p-chart-range color="#7c8cff" [fillOpacity]="0.15">
                            <p-chart-line [data]="data" categoryXField="year" valueYField="high" name="Forecast high" color="#909dff" curve="smooth" [lineStrokeWidth]="1" [fillOpacity]="0" />
                            <p-chart-line [data]="data" categoryXField="year" valueYField="low" name="Forecast low" color="#909dff" curve="smooth" [lineStrokeWidth]="1" [fillOpacity]="0" />
                        </p-chart-range>
                        <p-chart-line
                            [data]="data"
                            categoryXField="year"
                            valueYField="actual"
                            name="Actual GDP growth"
                            color="#7c8cff"
                            curve="smooth"
                            [lineStrokeWidth]="2.5"
                            [showMarkers]="true"
                            [markerSize]="5"
                            [fillOpacity]="0"
                            [connectNulls]="false"
                        />
                        <p-chart-x-axis />
                        <p-chart-y-axis [tickFormat]="formatPct" [min]="-4" [max]="7" />
                        <p-chart-legend position="top" />
                        <p-chart-tooltip mode="shared" [crosshair]="true" />
                        <p-chart-hover />
                        <p-chart-title text="US real GDP growth — actual and forward range" />
                        <p-chart-caption text="Solid line is realized YoY growth through 2024. Shaded band is the forecast envelope (high/low) for 2025–2027. Highlighted column marks the pandemic contraction." />
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
export class ComboExamplesEconomicForecastEnvelopeDoc {
    readonly data = comboEconomicForecast;
    readonly formatPct = (v: TickValue) => `${Number(v) > 0 ? '+' : ''}${v}%`;
}

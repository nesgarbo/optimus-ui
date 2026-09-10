import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue } from '@openng/optimus-ui/charts';
import { useServerMetrics } from '@/doc/charts/data/serverMetrics';

@Component({
    selector: 'types-line-area-time-series-live-server-metrics-cpu-and-memory-utilisation-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Two <i>ChartLine</i> series stream into a 60-second rolling window on a <i>type="time"</i> axis that formats timestamps as the window scrolls. A <i>ChartReferenceLine</i> marks the 80% CPU alert threshold. The
                <i>show-all</i> crosshair tooltip shows both metrics at any hover point, and <i>ChartLegend</i> toggles either series off.
            </p>
            <p>#### SvgLineNasaTempDemo.ts</p>
            <p>#### serverMetrics.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 300 }">
                        <p-chart-line [data]="data()" categoryXField="ts" valueYField="cpu" name="CPU" color="#5daeea" curve="smooth" [lineStrokeWidth]="2" [fillOpacity]="0.1" />
                        <p-chart-line [data]="data()" categoryXField="ts" valueYField="mem" name="Memory" color="#36b7d6" curve="smooth" [lineStrokeWidth]="2" />
                        <p-chart-reference-line [y]="80" label="CPU alert" stroke="#e5484d" [lineDash]="[5, 4]" />
                        <p-chart-tooltip mode="shared" />
                        <p-chart-hover />
                        <p-chart-legend />
                        <p-chart-x-axis type="time" [chartPaddingMax]="0.1" [chartPaddingMin]="-0.1" />
                        <p-chart-y-axis [min]="0" [max]="100" [tickFormat]="yTickFormat" />
                        <p-chart-title text="Live server metrics — CPU and memory utilization" />
                        <p-chart-caption text="Simulated data · 1-second polling interval · 60-second rolling window · Red line: 80% CPU alert threshold" />
                        <p-chart-export-menu filename="server-metrics-live" />
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
export class LineAreaTimeSeriesLiveServerMetricsCpuAndMemoryUtilisationDoc {
    readonly data = useServerMetrics();
    readonly yTickFormat = (value: TickValue) => `${value}%`;
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { generateReadings, TELEMETRY_COUNT, TELEMETRY_SEED } from '@/doc/charts/data/windFarmTelemetry';

@Component({
    selector: 'types-scatter-bubble-scatter-wind-farm-telemetry-100-000-readings-decimated-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>ChartDecimation algorithm="lttb"</i> downsamples 100,000 turbine readings to ~2,000 representative points before rendering. Drag the X axis to zoom: decimation re-samples within the visible range, so clusters hidden at the wide
                view re-emerge on focus. The same source data drives SVG and Canvas; decimation preserves the power-curve shape, not every original row.
            </p>
            <p>#### SvgScatterBigDataDecimationDemo.ts</p>
            <p>#### windFarmTelemetry.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-scatter id="readings" [data]="readings" valueXField="speed" valueYField="power" name="Telemetry sample" color="#5daeea" [markerSize]="3" />
                    <p-chart-decimation algorithm="lttb" [samples]="2000" [threshold]="5000" />
                    <p-chart-zoom mode="xy" />
                    <p-chart-tooltip />
                    <p-chart-legend position="top" />
                    <p-chart-x-axis label="Wind speed (m/s)" />
                    <p-chart-y-axis label="Turbine power output (kW)" />
                    <p-chart-title [text]="titleText" />
                    <p-chart-caption text="100,000-point synthetic dataset · LTTB decimation preserves the power-curve shape · Drag X-axis to zoom — re-decimates within the visible range" />
                    <p-chart-export-menu filename="wind-farm-telemetry-100k-decimated" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScatterBubbleScatterWindFarmTelemetry100000ReadingsDecimatedDoc {
    readonly readings = generateReadings(TELEMETRY_COUNT, TELEMETRY_SEED);
    readonly titleText = `Wind farm telemetry — ${this.readings.length.toLocaleString()} readings, decimated to 2,000 visible points`;
}

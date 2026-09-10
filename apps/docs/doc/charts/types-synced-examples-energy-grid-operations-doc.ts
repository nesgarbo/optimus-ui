import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue } from '@openng/optimus-ui/charts';
import { energy } from '@/doc/charts/data/syncedEnergyGrid';

@Component({
    selector: 'types-synced-examples-energy-grid-operations-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>A stacked area, radar panel, calendar heatmap, and horizontal bar are combined in a single <i>ChartGroup</i>. Time-axis panels sync crosshair across hours; the radar and bar participate via category-hover sync.</p>
            <p>#### SvgSyncedEnergyGridDemo.ts</p>
            <p>#### syncedEnergyGrid.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-group>
                    <div style="display: flex; flex-direction: column">
                        <div class="panel-header"><span class="panel-dot" style="background: #ffd166"></span>Generation Mix (GW)</div>
                        <p-chart-svg [sync]="true" [height]="190" class="panel panel-top">
                            <p-chart-stacked>
                                <p-chart-line [data]="energy" categoryXField="hour" valueYField="solar" name="Solar" color="#ffd166" [fillOpacity]="0.85" curve="smooth" [showMarkers]="false" [lineStrokeWidth]="0" />
                                <p-chart-line [data]="energy" categoryXField="hour" valueYField="wind" name="Wind" color="#5daeea" [fillOpacity]="0.85" curve="smooth" [showMarkers]="false" [lineStrokeWidth]="0" />
                                <p-chart-line [data]="energy" categoryXField="hour" valueYField="hydro" name="Hydro" color="#5ccf9f" [fillOpacity]="0.85" curve="smooth" [showMarkers]="false" [lineStrokeWidth]="0" />
                                <p-chart-line [data]="energy" categoryXField="hour" valueYField="gas" name="Gas" color="#94a3b8" [fillOpacity]="0.85" curve="smooth" [showMarkers]="false" [lineStrokeWidth]="0" />
                            </p-chart-stacked>
                            <p-chart-x-axis [visible]="false" />
                            <p-chart-y-axis [tickFormat]="formatGw" [tickCount]="4" [startFromZero]="true" />
                            <p-chart-tooltip [crosshair]="true" mode="shared" />
                            <p-chart-hover />
                            <p-chart-legend position="right" />
                        </p-chart-svg>

                        <div class="panel-header"><span class="panel-dot" style="background: #ff7a66"></span>Total Demand (GW)</div>
                        <p-chart-svg [sync]="true" [height]="110" class="panel">
                            <p-chart-line [data]="energy" categoryXField="hour" valueYField="demand" name="Demand" color="#ff7a66" curve="smooth" [showMarkers]="false" [lineStrokeWidth]="2" [fillOpacity]="0.1" />
                            <p-chart-x-axis [visible]="false" />
                            <p-chart-y-axis [tickFormat]="formatGw" [tickCount]="3" [startFromZero]="true" />
                            <p-chart-tooltip [crosshair]="true" />
                            <p-chart-hover />
                        </p-chart-svg>

                        <div class="panel-header"><span class="panel-dot" style="background: #7c8cff"></span>Grid Frequency (Hz)</div>
                        <p-chart-svg [sync]="true" [height]="110" class="panel">
                            <p-chart-line [data]="energy" categoryXField="hour" valueYField="frequency" name="Frequency" color="#7c8cff" curve="smooth" [showMarkers]="false" [lineStrokeWidth]="2" />
                            <p-chart-reference-line [y]="50" stroke="#7c8cff4d" [lineDash]="[3, 4]" label="50 Hz nominal" />
                            <p-chart-x-axis [visible]="false" />
                            <p-chart-y-axis [min]="49.75" [max]="50.25" [tickFormat]="formatFreq" [tickCount]="3" />
                            <p-chart-tooltip [crosshair]="true" />
                            <p-chart-hover />
                        </p-chart-svg>

                        <div class="panel-header"><span class="panel-dot" style="background: #5ccf9f"></span>Renewables Share (%)</div>
                        <p-chart-svg [sync]="true" [height]="130" class="panel panel-bottom">
                            <p-chart-line [data]="energy" categoryXField="hour" valueYField="renewables" name="Renewables" color="#5ccf9f" curve="smooth" [showMarkers]="false" [lineStrokeWidth]="2" [fillOpacity]="0.15" />
                            <p-chart-x-axis [tickCount]="12" label="Hour of day" />
                            <p-chart-y-axis [min]="0" [max]="100" [tickFormat]="formatPct" [tickCount]="3" [minGridDistance]="14" />
                            <p-chart-tooltip [crosshair]="true" />
                            <p-chart-hover />
                        </p-chart-svg>
                    </div>
                </p-chart-group>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    styles: [
        `
            .panel-header {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.06em;
                color: var(--p-text-muted-color);
                padding: 10px 4px 0;
                transition: color 0.2s;
            }
            .panel-dot {
                width: 7px;
                height: 7px;
                border-radius: 50%;
                flex-shrink: 0;
            }
            .panel {
                border-left: 2px solid var(--p-content-border-color);
                transition: border-color 0.2s;
            }
            .panel-top {
                border-top: 1px solid var(--p-content-border-color);
            }
            .panel-bottom {
                border-bottom: 1px solid var(--p-content-border-color);
            }
        `
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SyncedExamplesEnergyGridOperationsDoc {
    readonly energy = energy;

    readonly formatGw = (v: TickValue): string => `${v} GW`;
    readonly formatFreq = (v: TickValue): string => (+v).toFixed(2);
    readonly formatPct = (v: TickValue): string => `${v}%`;
}

import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type ChartPointEvent, type TickValue } from '@openng/optimus-ui/charts';
import { vans } from '@/doc/charts/data/syncedFleetTelemetry';

interface Kpi {
    key: 'speed' | 'fuel' | 'engine' | 'battery';
    label: string;
    unit: string;
    color: string;
    min: number;
    max: number;
    decimals: number;
    tickFormat: (v: TickValue) => string;
}

const KPIS: Kpi[] = [
    { key: 'speed', label: 'Speed', unit: 'km/h', color: '#5daeea', min: 0, max: 100, decimals: 1, tickFormat: (v: TickValue) => `${(+v).toFixed(1)} km/h` },
    { key: 'fuel', label: 'Fuel', unit: '%', color: '#5ccf9f', min: 0, max: 100, decimals: 0, tickFormat: (v: TickValue) => `${(+v).toFixed(0)}%` },
    { key: 'engine', label: 'Engine °', unit: '°C', color: '#ffad5a', min: 60, max: 110, decimals: 1, tickFormat: (v: TickValue) => `${(+v).toFixed(1)}°C` },
    { key: 'battery', label: 'Battery', unit: '%', color: '#ffd166', min: 50, max: 100, decimals: 0, tickFormat: (v: TickValue) => `${(+v).toFixed(0)}%` }
];

@Component({
    selector: 'types-synced-examples-fleet-telemetry-kpi-strip-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Four tiles each pair a numeric KPI readout with a mini spline; a detail chart below plots all four signals for the selected vehicle. <i>ChartGroup</i> syncs crosshair position so hovering any tile's sparkline drops a marker at the
                same timestamp in the detail chart and the other tiles. Click a vehicle button to swap the data source.
            </p>
            <p>#### SvgSyncedFleetTelemetryDemo.ts</p>
            <p>#### syncedFleetTelemetry.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-group>
                    <div style="display: flex; flex-direction: column; gap: 16px">
                        <div class="vehicle-selector">
                            @for (v of vans; track v.id) {
                                <button class="vehicle-btn" [class.active]="selectedId() === v.id" (click)="selectedId.set(v.id)">{{ v.label }}</button>
                            }
                        </div>

                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 12px">
                            @for (kpi of kpis; track kpi.key) {
                                <div class="kpi-tile" [style.--kpi-color]="kpi.color">
                                    <div class="kpi-label">{{ kpi.label }}</div>
                                    <div class="kpi-value" [style.color]="kpi.color">
                                        {{ displayPoint()[kpi.key].toFixed(kpi.decimals) }}<span class="kpi-unit">{{ kpi.unit }}</span>
                                    </div>
                                    <p-chart-svg [sync]="true" [height]="80">
                                        <p-chart-line [data]="selected().data" categoryXField="t" [valueYField]="kpi.key" [name]="kpi.label" [color]="kpi.color" [lineStrokeWidth]="1.5" curve="smooth" [showMarkers]="false" [fillOpacity]="0.15" />
                                        <p-chart-x-axis [minGridDistance]="50" />
                                        <p-chart-y-axis [visible]="false" [min]="kpi.min" [max]="kpi.max" [tickFormat]="kpi.tickFormat" />
                                        <p-chart-tooltip [crosshair]="true" mode="shared" />
                                        <p-chart-hover />
                                    </p-chart-svg>
                                </div>
                            }
                        </div>

                        <p-chart-svg [sync]="true" [height]="240" (pointHover)="onHover($event)">
                            <p-chart-line [data]="selected().data" categoryXField="t" valueYField="speed" name="Speed" color="#5daeea" curve="smooth" [showMarkers]="false" [lineStrokeWidth]="2" />
                            <p-chart-line [data]="selected().data" categoryXField="t" valueYField="fuel" name="Fuel" color="#5ccf9f" curve="smooth" [showMarkers]="false" [lineStrokeWidth]="2" />
                            <p-chart-line [data]="selected().data" categoryXField="t" valueYField="engine" name="Engine °" color="#ffad5a" curve="smooth" [showMarkers]="false" [lineStrokeWidth]="2" />
                            <p-chart-line [data]="selected().data" categoryXField="t" valueYField="battery" name="Battery" color="#ffd166" curve="smooth" [showMarkers]="false" [lineStrokeWidth]="2" />
                            <p-chart-reference-line [y]="100" stroke="#ffad5a4d" [lineDash]="[3, 4]" label="Engine warn" />
                            <p-chart-x-axis label="seconds ago" [minGridDistance]="25" />
                            <p-chart-y-axis [tickFormat]="formatInt" />
                            <p-chart-tooltip [crosshair]="true" mode="shared" />
                            <p-chart-hover />
                        </p-chart-svg>
                        <p-chart-legend position="bottom" />
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
            .vehicle-selector {
                display: flex;
                gap: 0;
                background: light-dark(var(--p-surface-100), var(--p-surface-900));
                border: 1px solid var(--p-content-border-color);
                border-radius: 8px;
                padding: 3px;
                width: fit-content;
            }
            .vehicle-btn {
                padding: 6px 14px;
                font-size: 12px;
                font-weight: 600;
                border-radius: 6px;
                border: none;
                background: transparent;
                color: var(--p-text-muted-color);
                cursor: pointer;
                transition:
                    background 0.15s,
                    color 0.15s,
                    box-shadow 0.15s;
                white-space: nowrap;
            }
            .vehicle-btn:hover:not(.active) {
                background: light-dark(var(--p-surface-200), var(--p-surface-800));
                color: var(--p-text-color);
            }
            .vehicle-btn.active {
                background: var(--p-content-background);
                color: var(--p-text-color);
                box-shadow:
                    0 1px 3px rgba(0, 0, 0, 0.1),
                    0 0 0 1px rgba(0, 0, 0, 0.05);
            }
            .kpi-tile {
                background: light-dark(var(--p-surface-50), var(--p-surface-900));
                border: 1px solid var(--p-content-border-color);
                border-top: 3px solid var(--kpi-color, #5daeea);
                border-radius: 10px;
                padding: 12px 14px 8px;
                display: flex;
                flex-direction: column;
                gap: 2px;
                transition:
                    background 0.2s,
                    border-color 0.2s;
            }
            .kpi-label {
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 0.06em;
                color: var(--p-text-muted-color);
                font-weight: 700;
            }
            .kpi-value {
                font-size: 22px;
                font-weight: 700;
                line-height: 1.15;
                font-family: ui-monospace, SFMono-Regular, monospace;
            }
            .kpi-unit {
                font-size: 11px;
                color: var(--p-text-muted-color);
                margin-left: 2px;
                font-weight: 500;
            }
        `
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SyncedExamplesFleetTelemetryKpiStripDoc {
    readonly vans = vans;
    readonly kpis = KPIS;

    readonly selectedId = signal(vans[0].id);
    readonly hoveredIndex = signal<number | null>(null);

    readonly selected = computed(() => vans.find((v) => v.id === this.selectedId()) ?? vans[0]);
    readonly displayPoint = computed(() => {
        const data = this.selected().data;
        const i = this.hoveredIndex();

        return i !== null && i >= 0 && i < data.length ? data[i] : data[data.length - 1];
    });

    readonly formatInt = (v: TickValue): string => (+v).toFixed(0);

    onHover(e: ChartPointEvent | null): void {
        this.hoveredIndex.set(e?.index ?? null);
    }
}

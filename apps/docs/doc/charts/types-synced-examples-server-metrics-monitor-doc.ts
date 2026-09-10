import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { syncedServerMetrics as data, type Point } from '@/doc/charts/data/syncedServerMetrics';

interface Stat {
    current: number;
    min: number;
    max: number;
    avg: number;
}

function statsOf(field: keyof Point): Stat {
    const values = data.map((d) => d[field] as number);
    const current = values[values.length - 1];

    return { current, min: Math.min(...values), max: Math.max(...values), avg: values.reduce((a, b) => a + b, 0) / values.length };
}

@Component({
    selector: 'types-synced-examples-server-metrics-monitor-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Four full-width line strips stacked vertically share a 24-hour time axis; <i>ChartZoom mode="x"</i> on the bottom strip zooms all four panels in lockstep. Each strip includes a <i>ChartReferenceLine</i> at its warning threshold. The
                right-hand rail shows current, min, avg, and max per metric, and crosshair position syncs across all panels.
            </p>
            <p>#### SvgSyncedServerMetricsDemo.ts</p>
            <p>#### syncedServerMetrics.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-group>
                    <div style="display: flex; flex-direction: column; gap: 12px">
                        @for (s of series; track s.field; let i = $index) {
                            <div>
                                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px">
                                    <div class="chart-series-label">{{ s.label }}</div>
                                    <div class="chart-now-label">
                                        now <span [style.color]="s.color" style="font-weight: 700">{{ stats[s.field].current.toFixed(1) }}{{ s.unit }}</span>
                                    </div>
                                </div>
                                <p-chart-svg [sync]="true" [height]="120">
                                    <p-chart-line [data]="data" categoryXField="t" [valueYField]="s.field" [color]="s.color" curve="smooth" [showMarkers]="false" [lineStrokeWidth]="1.5" [fillOpacity]="0.12" />
                                    <p-chart-reference-line [y]="s.warn" [stroke]="s.warnStroke" [lineDash]="[3, 4]" [label]="s.warn + s.unit + ' warn'" />
                                    <p-chart-x-axis [visible]="i === series.length - 1" />
                                    <p-chart-y-axis [tickCount]="3" [startFromZero]="true" />
                                    <p-chart-tooltip [crosshair]="true" />
                                    <p-chart-hover />
                                    @if (i === series.length - 1) {
                                        <p-chart-zoom mode="x" />
                                    }
                                </p-chart-svg>
                            </div>
                        }
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
            .chart-series-label {
                font-size: 12px;
                font-weight: 600;
                color: var(--p-text-color);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            .chart-now-label {
                font-size: 12px;
                color: var(--p-text-muted-color);
            }
        `
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SyncedExamplesServerMetricsMonitorDoc {
    readonly data = data;

    readonly stats: Record<string, Stat> = {
        cpu: statsOf('cpu'),
        memory: statsOf('memory'),
        network: statsOf('network'),
        disk: statsOf('disk')
    };

    readonly series = [
        { field: 'cpu', label: 'CPU', unit: '%', color: '#7c8cff', warn: 80, warnStroke: '#7c8cff40' },
        { field: 'memory', label: 'Memory', unit: '%', color: '#5ccf9f', warn: 85, warnStroke: '#5ccf9f40' },
        { field: 'network', label: 'Network', unit: 'Mbps', color: '#ffad5a', warn: 90, warnStroke: '#ffad5a40' },
        { field: 'disk', label: 'Disk', unit: 'IOPS/s', color: '#ff6fae', warn: 45, warnStroke: '#ff6fae40' }
    ] as const;
}

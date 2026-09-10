import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue } from '@openng/optimus-ui/charts';
import { syncedCandlestickVolume as data } from '@/doc/charts/data/syncedCandlestickVolume';

function computeSma(n: number): { date: string; value: number }[] {
    return data
        .map((d, i) => {
            if (i < n - 1) return null;

            const avg = data.slice(i - n + 1, i + 1).reduce((s, c) => s + c.close, 0) / n;

            return { date: d.date, value: +avg.toFixed(2) };
        })
        .filter((x): x is { date: string; value: number } => x !== null);
}

const sma10 = computeSma(10);
const sma20 = computeSma(20);
const avgVolume = +(data.reduce((s, d) => s + d.volume, 0) / data.length).toFixed(1);

@Component({
    selector: 'types-synced-examples-candlestick-volume-stacked-panes-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Two <i>ChartCanvas</i> instances inside <i>ChartGroup</i> create a stacked pane layout: a price pane (70%) with candlesticks and SMA line overlays, and a volume pane (30%) with directional bars colored by close vs. previous close.
                Dragging on either pane zooms both in lockstep via the group's X-axis extremes sync. The shared crosshair drops a vertical marker on both panes simultaneously.
            </p>
            <p>#### SvgSyncedCandlestickVolumePaneDemo.ts</p>
            <p>#### syncedCandlestickVolume.ts</p>
        </app-docsectiontext>
        <div class="card">
            <p-chart-group>
                <div class="pane-stack">
                    <div class="pane-stack__price">
                        <p-chart-svg [sync]="true" [height]="320" [animation]="{ duration: 400, easing: 'easeOutCubic' }">
                            <p-chart-candlestick [data]="data" categoryXField="date" openField="open" highField="high" lowField="low" closeField="close" name="NVDA" upColor="#10a981" downColor="#e5484d" [barWidthRatio]="0.65" />
                            <p-chart-line [data]="sma10" categoryXField="date" valueYField="value" name="SMA 10" color="#ffad5a" curve="smooth" [lineStrokeWidth]="1.5" [showMarkers]="false" [fillOpacity]="0" />
                            <p-chart-line [data]="sma20" categoryXField="date" valueYField="value" name="SMA 20" color="#7c8cff" curve="smooth" [lineStrokeWidth]="1.5" [showMarkers]="false" [fillOpacity]="0" />
                            <p-chart-x-axis [visible]="false" />
                            <p-chart-y-axis position="right" [tickFormat]="formatPrice" [chartPaddingMin]="0.05" />
                            <p-chart-legend position="top" />
                            <p-chart-tooltip mode="shared" [crosshair]="true" />
                            <p-chart-hover />
                            <p-chart-zoom mode="x" />
                            <p-chart-title text="NVDA · Q1 2024 · Daily Candlestick with SMA Overlays" />
                            <p-chart-export-menu filename="nvda-q1-2024-pane" />
                            <p-chart-accessibility />
                        </p-chart-svg>
                    </div>
                    <p-chart-svg [sync]="true" [height]="140" [animation]="{ duration: 400, easing: 'easeOutCubic' }">
                        <p-chart-bar [data]="data" categoryXField="date" valueYField="volume" name="Volume" color="barColor" [opacity]="0.75" />
                        <p-chart-reference-line [y]="avgVolume" stroke="#7c8cff80" [lineDash]="[3, 3]" label="Avg" />
                        <p-chart-x-axis [tickRotation]="-35" />
                        <p-chart-y-axis position="right" label="Vol (M)" [tickCount]="3" [tickFormat]="formatVolume" />
                        <p-chart-tooltip mode="shared" [crosshair]="true" />
                        <p-chart-hover />
                        <p-chart-zoom mode="x" />
                    </p-chart-svg>
                </div>
                <p-chart-caption text="SMA(10) amber · SMA(20) periwinkle · volume bars colored by direction · Feb 21 earnings spike · drag either pane to zoom both" />
            </p-chart-group>
        </div>
        <app-code></app-code>
    `,
    styles: [
        `
            .pane-stack {
                overflow: hidden;
                border: 1px solid var(--p-content-border-color);
                border-radius: 10px;
                background: var(--p-content-background);
            }
            .pane-stack__price {
                border-bottom: 1px solid var(--p-content-border-color);
            }
        `
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExamplesCandlestickVolumeStackedPanesDoc {
    readonly data = data;
    readonly sma10 = sma10;
    readonly sma20 = sma20;
    readonly avgVolume = avgVolume;

    readonly formatPrice = (v: TickValue): string => `$${Number(v).toFixed(0)}`;
    readonly formatVolume = (v: TickValue): string => `${Number(v).toFixed(0)}M`;
}

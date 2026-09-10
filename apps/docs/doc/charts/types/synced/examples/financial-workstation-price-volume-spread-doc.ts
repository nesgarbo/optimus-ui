import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type SyncConfig, type TickValue } from '@openng/optimus-ui/charts';
import { financialWorkstationSummary, movingAverage, syncedFinancialWorkstation as data } from '@/doc/charts/data/syncedFinancialWorkstation';

const vwap5 = movingAverage('vwap', 5);
const spread5 = movingAverage('spreadBps', 5);

@Component({
    selector: 'types-synced-examples-financial-workstation-price-volume-spread-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Three coordinated panes track an execution desk view: price candles with VWAP, volume bars, and quoted spread in basis points. Every pane opts into <i>ChartGroup</i> with X-axis sync, so crosshair position and drag-zoom ranges stay
                aligned across price, volume, and spread. The price pane includes <i>ChartExportMenu</i>, so image and CSV export come from the current chart data rather than a fake wrapper control.
            </p>
            <p>#### SvgSyncedFinancialWorkstationDemo.ts</p>
            <p>#### syncedFinancialWorkstation.ts</p>
            <p>#### syncedCandlestickVolume.ts</p>
        </app-docsectiontext>
        <div class="card">
            <p-chart-group>
                <div class="finance-workstation">
                    <div class="finance-workstation__metrics" aria-label="NVDA trading desk metrics">
                        <div>
                            <span>Last</span><strong>{{ priceLabel(summary.lastClose) }}</strong>
                        </div>
                        <div>
                            <span>Spread</span><strong>{{ summary.lastSpreadBps.toFixed(1) }} bps</strong>
                        </div>
                        <div>
                            <span>Avg volume</span><strong>{{ summary.averageVolume.toFixed(1) }}M</strong>
                        </div>
                        <div>
                            <span>Low depth</span><strong>{{ summary.lowDepth.toFixed(1) }}M</strong>
                        </div>
                    </div>

                    <div class="finance-workstation__pane finance-workstation__pane--price">
                        <p-chart-svg [sync]="sync" [height]="300" [animation]="{ duration: 420, easing: 'easeOutCubic' }">
                            <p-chart-candlestick [data]="data" categoryXField="date" openField="open" highField="high" lowField="low" closeField="close" name="NVDA" upColor="#10a981" downColor="#e5484d" [barWidthRatio]="0.62" />
                            <p-chart-line [data]="vwap5" categoryXField="date" valueYField="value" name="VWAP 5" color="#5daeea" [lineStrokeWidth]="2" [showMarkers]="false" curve="smooth" />
                            <p-chart-x-axis [visible]="false" />
                            <p-chart-y-axis position="right" [tickCount]="5" [tickFormat]="priceLabel" />
                            <p-chart-tooltip mode="shared" [crosshair]="true" />
                            <p-chart-hover [brightness]="1.08" />
                            <p-chart-zoom mode="x" />
                            <p-chart-title text="NVDA execution workstation - price" />
                            <p-chart-export-menu filename="nvda-price-workstation" />
                            <p-chart-accessibility />
                        </p-chart-svg>
                    </div>

                    <div class="finance-workstation__pane">
                        <p-chart-svg [sync]="sync" [height]="150" [animation]="{ duration: 420, easing: 'easeOutCubic' }">
                            <p-chart-bar [data]="data" categoryXField="date" valueYField="volume" name="Volume" color="barColor" [opacity]="0.78" [borderRadius]="2" />
                            <p-chart-reference-line [y]="summary.averageVolume" stroke="#7c8cff8c" [lineDash]="[4, 4]" label="Avg volume" />
                            <p-chart-x-axis [visible]="false" />
                            <p-chart-y-axis position="right" [tickCount]="3" [tickFormat]="volumeLabel" />
                            <p-chart-tooltip mode="shared" [crosshair]="true" />
                            <p-chart-hover [brightness]="1.08" />
                            <p-chart-zoom mode="x" />
                        </p-chart-svg>
                    </div>

                    <div class="finance-workstation__pane finance-workstation__pane--spread">
                        <p-chart-svg [sync]="sync" [height]="170" [animation]="{ duration: 420, easing: 'easeOutCubic' }">
                            <p-chart-bar [data]="data" categoryXField="date" valueYField="spreadBps" name="Quoted spread" color="spreadColor" [opacity]="0.34" [borderRadius]="2" />
                            <p-chart-line [data]="spread5" categoryXField="date" valueYField="value" name="5-day spread avg" color="#4ecdc4" [lineStrokeWidth]="2" [showMarkers]="false" curve="smooth" />
                            <p-chart-reference-line [y]="summary.averageSpreadBps" stroke="#ffad5aa6" [lineDash]="[4, 4]" label="Avg spread" />
                            <p-chart-x-axis [tickRotation]="-35" />
                            <p-chart-y-axis position="right" [tickCount]="4" [tickFormat]="bpsLabel" />
                            <p-chart-tooltip mode="shared" [crosshair]="true" />
                            <p-chart-hover [brightness]="1.08" />
                            <p-chart-zoom mode="x" />
                            <p-chart-accessibility />
                        </p-chart-svg>
                    </div>
                </div>
                <p-chart-caption text="Drag any pane to zoom all three. Crosshair sync keeps price, volume, and spread aligned on the same trading day." />
            </p-chart-group>
        </div>
        <app-code></app-code>
    `,
    styles: [
        `
            .finance-workstation {
                width: 100%;
                max-width: 100%;
                overflow: hidden;
                border: 1px solid var(--p-content-border-color);
                border-radius: 8px;
                background: var(--p-content-background);
            }
            .finance-workstation__metrics {
                display: grid;
                grid-template-columns: repeat(4, minmax(0, 1fr));
                border-bottom: 1px solid var(--p-content-border-color);
                background: light-dark(var(--p-surface-50), var(--p-surface-900));
            }
            .finance-workstation__metrics > div {
                min-width: 0;
                padding: 0.75rem 1rem;
                border-right: 1px solid var(--p-content-border-color);
            }
            .finance-workstation__metrics > div:last-child {
                border-right: 0;
            }
            .finance-workstation__metrics span {
                display: block;
                font-size: 0.72rem;
                color: var(--p-text-muted-color);
            }
            .finance-workstation__metrics strong {
                display: block;
                margin-top: 0.15rem;
                color: var(--p-text-color);
                font-size: 1.05rem;
                line-height: 1.2;
            }
            .finance-workstation__pane {
                min-width: 0;
                border-bottom: 1px solid var(--p-content-border-color);
            }
            .finance-workstation__pane:last-child {
                border-bottom: 0;
            }
            .finance-workstation__pane--price {
                --p-chart-positive: #10a981;
                --p-chart-negative: #e5484d;
            }
            .finance-workstation__pane--spread {
                --p-chart-color-0: #ffad5a;
                --p-chart-color-1: #4ecdc4;
            }
            @media (max-width: 640px) {
                .finance-workstation__metrics {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                }
                .finance-workstation__metrics > div:nth-child(2) {
                    border-right: 0;
                }
                .finance-workstation__metrics > div {
                    padding: 0.65rem 0.75rem;
                }
            }
        `
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExamplesFinancialWorkstationPriceVolumeSpreadDoc {
    readonly data = data;
    readonly vwap5 = vwap5;
    readonly spread5 = spread5;
    readonly summary = financialWorkstationSummary;
    readonly sync: SyncConfig = { extremes: 'x', highlight: 'x', visibility: true };

    readonly priceLabel = (v: TickValue): string => `$${Number(v).toFixed(0)}`;
    readonly volumeLabel = (v: TickValue): string => `${Number(v).toFixed(0)}M`;
    readonly bpsLabel = (v: TickValue): string => `${Number(v).toFixed(0)} bps`;
}

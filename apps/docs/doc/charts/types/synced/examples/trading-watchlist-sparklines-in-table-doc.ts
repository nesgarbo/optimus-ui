import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { type Row, rows } from '@/doc/charts/data/syncedTradingWatchlist';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

@Component({
    selector: 'types-synced-examples-trading-watchlist-sparklines-in-table-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Each table row embeds two <i>ChartSvg</i> sparklines inside a shared <i>ChartGroup</i>; axes are hidden on each mini chart. Hovering one row's price sparkline highlights the same trading day on every other row's sparklines, creating a
                cross-row time crosshair.
            </p>
            <p>#### SvgSyncedTradingWatchlistDemo.ts</p>
            <p>#### syncedTradingWatchlist.ts</p>
        </app-docsectiontext>
        <div class="card">
            <p-chart-group>
                <div class="sw-table">
                    <div class="sw-head">
                        <div>Symbol</div>
                        <div>Name</div>
                        <div style="text-align: right">Last</div>
                        <div style="text-align: right">Δ 1D</div>
                        <div>Price · 7D</div>
                        <div>Volume · 7D</div>
                    </div>
                    @for (row of rows; track row.symbol) {
                        <div class="sw-row">
                            <div class="sw-sym">{{ row.symbol }}</div>
                            <div class="sw-name">{{ row.name }}</div>
                            <div class="sw-last">{{ row.last.toFixed(2) }}</div>
                            <div class="sw-chg" [style.color]="row.changePct >= 0 ? 'var(--sw-positive)' : 'var(--sw-negative)'">{{ row.changePct >= 0 ? '+' : '' }}{{ row.changePct.toFixed(1) }}%</div>
                            <div class="sw-spark">
                                <p-chart-svg [sync]="true" [width]="140" [height]="32">
                                    <p-chart-line
                                        [data]="rowPriceData(row)"
                                        categoryXField="day"
                                        valueYField="value"
                                        [color]="row.changePct >= 0 ? 'var(--sw-positive)' : 'var(--sw-negative)'"
                                        curve="smooth"
                                        [lineStrokeWidth]="1.5"
                                        [showMarkers]="false"
                                        [fillOpacity]="0"
                                    />
                                    <p-chart-tooltip />
                                    <p-chart-hover />
                                </p-chart-svg>
                            </div>
                            <div class="sw-spark">
                                <p-chart-svg [sync]="true" [width]="140" [height]="32">
                                    <p-chart-bar [data]="rowVolumeData(row)" categoryXField="day" valueYField="value" color="var(--sw-volume)" />
                                    <p-chart-tooltip />
                                    <p-chart-hover />
                                </p-chart-svg>
                            </div>
                        </div>
                    }
                </div>
            </p-chart-group>
        </div>
        <app-code></app-code>
    `,
    styles: [
        `
            .sw-table {
                display: flex;
                flex-direction: column;
                font-size: 13px;
                border: 1px solid var(--p-content-border-color);
                border-radius: 8px;
                overflow: hidden;
                transition: border-color 0.2s;
                --sw-positive: #10a981;
                --sw-negative: #e5484d;
                --sw-volume: var(--p-surface-400);
            }
            .sw-head,
            .sw-row {
                display: grid;
                grid-template-columns: 80px 1fr 80px 70px 160px 160px;
                align-items: center;
                gap: 12px;
                padding: 10px 14px;
            }
            .sw-head {
                background: light-dark(var(--p-surface-50), var(--p-surface-900));
                font-weight: 600;
                font-size: 12px;
                color: var(--p-text-muted-color);
                text-transform: uppercase;
                letter-spacing: 0.03em;
                transition:
                    background 0.2s,
                    color 0.2s;
            }
            .sw-row {
                border-top: 1px solid var(--p-content-border-color);
                transition: background 0.1s;
            }
            .sw-row:hover {
                background: light-dark(var(--p-surface-50), var(--p-surface-800));
            }
            .sw-sym {
                font-weight: 600;
                font-family: ui-monospace, SFMono-Regular, monospace;
            }
            .sw-name {
                color: var(--p-text-muted-color);
            }
            .sw-last {
                text-align: right;
                font-family: ui-monospace, SFMono-Regular, monospace;
            }
            .sw-chg {
                text-align: right;
                font-weight: 600;
                font-family: ui-monospace, SFMono-Regular, monospace;
            }
            .sw-spark {
                display: flex;
                align-items: center;
            }
            @media (max-width: 520px) {
                .sw-head {
                    display: none;
                }
                .sw-row {
                    grid-template-columns: minmax(0, 1fr) auto;
                    gap: 8px 12px;
                }
                .sw-name,
                .sw-spark {
                    grid-column: 1 / -1;
                }
            }
            :host-context(.p-dark) .sw-table {
                --sw-positive: #34d399;
                --sw-negative: #fb7185;
                --sw-volume: var(--p-surface-500);
            }
        `
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExamplesTradingWatchlistSparklinesInTableDoc {
    readonly rows = rows;

    rowPriceData(row: Row): { day: string; value: number }[] {
        return DAYS.map((d, i) => ({ day: d, value: row.price[i] }));
    }

    rowVolumeData(row: Row): { day: string; value: number }[] {
        return DAYS.map((d, i) => ({ day: d, value: row.volume[i] }));
    }
}

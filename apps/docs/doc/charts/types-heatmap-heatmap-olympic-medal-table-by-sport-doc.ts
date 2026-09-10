import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { olympicMedals, type Cell } from '@/doc/charts/data/olympicMedals';

const COLOR_STOPS = [0, 3, 7, 12, 18];
const COLOR_RANGE = ['#fef3c7', '#fcd34d', '#f59e0b', '#d97706', '#b45309'];

@Component({
    selector: 'types-heatmap-heatmap-olympic-medal-table-by-sport-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                A single-hue sequential <i>colorRange</i> paired with an explicit <i>colorScale</i> ramps one gold family from pale to deep, so intensity alone encodes medal count without a diverging gradient. <i>nullColor</i> fills disciplines a
                nation did not medal in with a distinct shade, separating them from a genuine zero. A <i>ChartDataLabels</i> <i>formatter</i> stamps the medal total into each cell, and <i>ChartColorLegend</i> renders the ramp below.
            </p>
            <p>#### SvgHeatmapOlympicMedalsDemo.ts</p>
            <p>#### olympicMedals.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-heatmap [data]="data" categoryXField="country" categoryYField="sport" valueField="total" [colorScale]="colorStops" [colorRange]="colorRange" nullColor="#f1f5f9" [spacing]="2" [borderRadius]="3" />
                        <p-chart-data-labels [formatter]="formatTotal" />
                        <p-chart-x-axis [showLine]="false" [showTicks]="false" [gridLines]="false" />
                        <p-chart-y-axis [showLine]="false" [showTicks]="false" [gridLines]="false" />
                        <p-chart-color-legend position="bottom" [ticks]="3" />
                        <p-chart-tooltip>
                            <ng-template pChartTooltipDef let-ctx>
                                @if (cell(ctx.index); as c) {
                                    @if (c.total == null) {
                                        <div style="padding: 10px 14px; background: rgba(10, 10, 10, 0.76); backdrop-filter: blur(12px); border-radius: 8px; color: #fff; font-size: 12px; opacity: 0.85">
                                            <span>{{ c.countryName }} · {{ c.sport }} — no medal</span>
                                        </div>
                                    } @else {
                                        <div style="padding: 10px 14px; min-width: 200px; background: rgba(10, 10, 10, 0.76); backdrop-filter: blur(12px); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); color: #fff">
                                            <div style="font-weight: 600; font-size: 13px; margin-bottom: 6px">{{ c.countryName }} · {{ c.sport }}</div>
                                            <div style="display: flex; justify-content: space-between; font-size: 12px">
                                                <span style="opacity: 0.75">Total medals</span>
                                                <span style="font-weight: 600">{{ c.total }}</span>
                                            </div>
                                            <div style="display: flex; gap: 12px; font-size: 12px; margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255, 255, 255, 0.12)">
                                                <span>🥇 {{ c.gold }}</span>
                                                <span>🥈 {{ c.silver }}</span>
                                                <span>🥉 {{ c.bronze }}</span>
                                            </div>
                                        </div>
                                    }
                                }
                            </ng-template>
                        </p-chart-tooltip>
                        <p-chart-hover [brightness]="1.12" />
                        <p-chart-title text="Olympic medal table — top nations by sport" />
                        <p-chart-caption text="Rows = sport · Columns = nation · Cell depth = medals won · Grey = no medal in that discipline" />
                        <p-chart-export-menu filename="olympic-medals-by-sport" />
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
export class HeatmapHeatmapOlympicMedalTableBySportDoc {
    readonly data = olympicMedals;
    readonly colorStops = COLOR_STOPS;
    readonly colorRange = COLOR_RANGE;
    readonly formatTotal = (v: number | null): string => (v == null ? '' : String(v));

    cell(index: number): Cell | undefined {
        return this.data[index];
    }
}

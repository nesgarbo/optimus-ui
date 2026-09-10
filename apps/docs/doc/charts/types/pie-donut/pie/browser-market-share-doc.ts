import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { browserShare } from '@/doc/charts/data/browserShare';

const ranked = [...browserShare].sort((a, b) => b.share - a.share);

@Component({
    selector: 'types-pie-donut-pie-browser-market-share-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p><i>renderContent</i> draws percentage and label directly inside each slice, adapting the format to the available space. The ranked legend shows each browser's exact share, doubling as a quick-reference leaderboard.</p>
            <p>#### SvgPieBrowserShareDemo.ts</p>
            <p>#### browserShare.ts</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 460px">
                <p-chart-svg>
                    <p-chart-pie [data]="data" valueField="share" categoryField="browser" [color]="colors" [startAngle]="-90" sort="value-desc" [spacing]="2" [borderRadius]="6">
                        <ng-template pChartSliceDef let-ctx>
                            @if (ctx.percentage >= 15) {
                                <svg:g text-anchor="middle">
                                    <svg:text y="-9" font-size="22" font-weight="bold" fill="#fff" dominant-baseline="middle">{{ ctx.percentage.toFixed(1) }}%</svg:text>
                                    <svg:text y="11" font-size="12" font-weight="600" fill="#fff" opacity="0.82" dominant-baseline="middle">{{ ctx.label }}</svg:text>
                                </svg:g>
                            } @else if (ctx.percentage >= 5) {
                                <svg:text text-anchor="middle" font-size="13" font-weight="bold" fill="#fff" dominant-baseline="middle">{{ ctx.percentage.toFixed(1) }}%</svg:text>
                            }
                        </ng-template>
                    </p-chart-pie>
                    <p-chart-legend position="right" verticalAlign="middle" [width]="200">
                        <ng-template pChartLegendItemDef let-ctx>
                            <div
                                (click)="ctx.onClick()"
                                (mouseenter)="ctx.onMouseEnter()"
                                (mouseleave)="ctx.onMouseLeave()"
                                [style]="'display:flex;align-items:center;gap:6px;padding:2px 8px;cursor:pointer;transition:opacity 0.2s;opacity:' + (ctx.visible ? 1 : 0.35)"
                            >
                                <span style="font-size:11px;opacity:0.45;min-width:16px;text-align:right;flex-shrink:0">#{{ rank(ctx.label) }}</span>
                                <span [style]="'width:9px;height:9px;border-radius:50%;flex-shrink:0;background:' + ctx.color"></span>
                                <span style="font-size:12px;flex:1">{{ ctx.label }}</span>
                            </div>
                        </ng-template>
                    </p-chart-legend>
                    <p-chart-tooltip />
                    <p-chart-hover [offset]="6" [brightness]="1.08" />
                    <p-chart-title text="Global browser market share" />
                    <p-chart-caption text="Source: StatCounter GlobalStats · December 2024 · Based on 5B+ monthly page views" />
                    <p-chart-export-menu [menuItems]="['downloadPNG', 'downloadSVG']" filename="browser-market-share-2024" />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PieBrowserMarketShareDoc {
    readonly data = browserShare;
    readonly colors = ['#5daeea', '#4ecdc4', '#ffad5a', '#7c8cff', '#36b7d6', '#ff7a66', '#94a3b8'];

    rank(label: string): number {
        return ranked.findIndex((d) => d.browser === label) + 1;
    }
}

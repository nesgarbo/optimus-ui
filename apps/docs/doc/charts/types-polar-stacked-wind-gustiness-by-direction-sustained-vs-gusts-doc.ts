import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TooltipRenderContext } from '@openng/optimus-ui/charts';
import { windDirectionGustiness as data } from '@/doc/charts/data/windDirectionGustiness';

const COLOR = { sustained: '#5daeea', gust: '#ffad5a' };

interface Seg {
    name: string;
    val: number;
    color: string;
    share: number;
}

@Component({
    selector: 'types-polar-stacked-wind-gustiness-by-direction-sustained-vs-gusts-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>ChartStacked mode="percent"</i> normalizes each sector to 100%, so the radius encodes composition rather than magnitude: sky-blue for sustained wind, orange for peak gusts. The percent mode makes the gustiness character of each
                compass direction legible at a glance, independent of total wind energy. Hover to compare the exact sustained-to-gust split per direction.
            </p>
            <p>#### SvgPolarPercentStackedDemo.ts</p>
            <p>#### windDirectionGustiness.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 700 }">
                        <p-chart-stacked mode="percent">
                            <p-chart-polar [data]="data" categoryXField="direction" valueYField="sustained" name="Sustained" color="#5daeea" [borderRadius]="4" [spacing]="6" />
                            <p-chart-polar [data]="data" categoryXField="direction" valueYField="gust" name="Gusts" color="#ffad5a" [borderRadius]="4" [spacing]="6" />
                        </p-chart-stacked>
                        <p-chart-x-axis />
                        <p-chart-y-axis [tickCount]="3" />
                        <p-chart-tooltip mode="shared">
                            <ng-template pChartTooltipDef let-ctx>
                                @let row = rowFor(ctx);
                                @if (row) {
                                    <div style="padding:10px 14px;min-width:240px;background:rgba(10,10,10,0.78);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:8px;border:1px solid rgba(255,255,255,0.1);color:#fff">
                                        <div style="font-weight:600;font-size:13px;margin-bottom:2px">Wind from {{ row.direction }}</div>
                                        <div style="font-size:10px;opacity:0.55;margin-bottom:8px">Gustiness composition · share of total wind speed</div>
                                        @for (s of segsFor(row); track s.name) {
                                            <div style="margin-top:6px">
                                                <div style="display:flex;align-items:center;gap:8px;font-size:12px;margin-bottom:4px">
                                                    <span [style]="'width:8px;height:8px;border-radius:2px;flex-shrink:0;background:' + s.color"></span>
                                                    <span style="flex:1;opacity:0.8">{{ s.name }}</span>
                                                    <span style="font-family:ui-monospace,SFMono-Regular,monospace;font-weight:700">{{ s.share.toFixed(0) }}%</span>
                                                    <span style="width:54px;text-align:right;opacity:0.55;font-size:11px">{{ s.val }} km/h</span>
                                                </div>
                                                <div style="height:4px;border-radius:2px;background:rgba(255,255,255,0.08);overflow:hidden">
                                                    <div [style]="'height:100%;background:' + s.color + ';width:' + s.share.toFixed(1) + '%'"></div>
                                                </div>
                                            </div>
                                        }
                                        <div style="display:flex;justify-content:space-between;margin-top:8px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.12);font-size:11px;opacity:0.6">
                                            <span>Sector reaches 100 % of outer ring</span>
                                            <span style="font-family:ui-monospace,SFMono-Regular,monospace">{{ totalFor(row) }} km/h total</span>
                                        </div>
                                    </div>
                                }
                            </ng-template>
                        </p-chart-tooltip>
                        <p-chart-hover [brightness]="1.08" />
                        <p-chart-legend position="bottom" />
                        <p-chart-title text="Wind Gustiness by Direction — Sustained vs Gusts" />
                        <p-chart-caption text="Each sector normalized to 100 % · westerly flow (SW/W) is gust-dominated · south-easterly flow is steady" />
                        <p-chart-export-menu filename="wind-gustiness-percent-polar" />
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
export class PolarStackedWindGustinessByDirectionSustainedVsGustsDoc {
    readonly data = data;

    rowFor(ctx: TooltipRenderContext): (typeof data)[number] | undefined {
        return data.find((d) => d.direction === ctx.label);
    }

    totalFor(row: (typeof data)[number]): number {
        return row.sustained + row.gust;
    }

    segsFor(row: (typeof data)[number]): Seg[] {
        const total = this.totalFor(row);

        return [
            { name: 'Sustained', val: row.sustained, color: COLOR.sustained, share: (row.sustained / total) * 100 },
            { name: 'Gusts', val: row.gust, color: COLOR.gust, share: (row.gust / total) * 100 }
        ];
    }
}

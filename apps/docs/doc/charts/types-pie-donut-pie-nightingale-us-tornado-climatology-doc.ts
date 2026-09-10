import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type AnnotationContext, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { nightingaleWho as RAW_DATA } from '@/doc/charts/data/nightingaleWho';

const ANNUAL_TOTAL = RAW_DATA.reduce((s, d) => s + d.tornadoes, 0);
const PEAK = new Set(['Apr', 'May', 'Jun']);
const ACTIVE = new Set(['Mar', 'Jul', 'Aug']);

const SEASONS = [
    { label: 'Peak (Apr–Jun)', color: '#e5484d' },
    { label: 'Active shoulder (Mar, Jul–Aug)', color: '#ffad5a' },
    { label: 'Quiet months', color: '#5daeea' }
];

@Component({
    selector: 'types-pie-donut-pie-nightingale-us-tornado-climatology-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>sliceRadiusValue</i> maps each month's count to radial depth, making the spring spike stand out against quiet winter months. The <i>color</i> array assigns seasonal hues so active and dormant periods read as distinct bands.
                <i>ChartDataLabels</i> places month labels on angled leader lines; hover to see the tooltip report the monthly total and annual share.
            </p>
            <p>#### SvgPieNightingaleWhoDemo.ts</p>
            <p>#### nightingaleWho.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 400, easing: 'easeOutCubic' }">
                        <p-chart-pie [data]="data" valueField="petal" categoryField="month" sliceRadiusValue="tornadoes" [color]="colors" [spacing]="2" [startAngle]="-90" [sweepAngle]="360" />
                        <p-chart-annotation>
                            <ng-template pChartAnnotationDef let-ctx>
                                <svg:g>
                                    @for (s of seasons; track s.label; let i = $index) {
                                        <svg:circle [attr.cx]="ctx.chartArea.x + 16" [attr.cy]="rowY(ctx, i) + 4" r="4" [attr.fill]="s.color" />
                                        <svg:text [attr.x]="ctx.chartArea.x + 26" [attr.y]="rowY(ctx, i) + 4" font-size="11" opacity="0.7" dominant-baseline="middle">{{ s.label }}</svg:text>
                                    }
                                </svg:g>
                            </ng-template>
                        </p-chart-annotation>
                        <p-chart-data-labels display="label" lineStyle="angled" [fontSize]="11" />
                        <p-chart-tooltip [valueFormatter]="tooltipRows" />
                        <p-chart-hover [offset]="6" [brightness]="1.08" />
                        <p-chart-title text="US tornado climatology — average by month" />
                        <p-chart-caption text="Source: NOAA Storm Prediction Center · 1991–2020 climatological average · Red: peak season (Apr–Jun) · Amber: active shoulder (Mar, Jul–Aug)" />
                        <p-chart-export-menu filename="us-tornado-climatology" />
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
export class PieDonutPieNightingaleUsTornadoClimatologyDoc {
    readonly seasons = SEASONS;
    readonly data = RAW_DATA.map((d) => ({ ...d, petal: 1 }));
    readonly colors = RAW_DATA.map((d) => (PEAK.has(d.month) ? '#e5484d' : ACTIVE.has(d.month) ? '#ffad5a' : '#5daeea'));

    rowY(ctx: AnnotationContext, i: number): number {
        return ctx.chartArea.y + ctx.chartArea.height - 10 - SEASONS.length * 18 + i * 18;
    }

    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const d = RAW_DATA[ctx.index!];
        const isPeak = PEAK.has(d.month);
        const isActive = ACTIVE.has(d.month);

        return [
            { label: 'Tornadoes', value: d.tornadoes.toLocaleString() },
            { label: 'Annual share', value: `${((d.tornadoes / ANNUAL_TOTAL) * 100).toFixed(1)}%` },
            { label: 'Season', value: isPeak ? 'Peak season' : isActive ? 'Active season' : 'Quiet season', color: isPeak ? '#e5484d' : isActive ? '#ffad5a' : '#5daeea' }
        ];
    };
}

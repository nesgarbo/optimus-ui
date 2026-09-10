import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type AnnotationContext, type SliceRenderContext, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { type MonthData, nightingaleNoaaPrecip as data } from '@/doc/charts/data/nightingaleNoaaPrecip';

const ANNUAL_AVG = 2.81;
const WETTEST_VAL = 3.44;
const SEASON_COLOR = { winter: '#5daeea', spring: '#4ecdc4', summer: '#ffad5a', fall: '#ff7a66' };
const colors = data.map((d) => SEASON_COLOR[d.season]);

const SEASON_ARCS = [
    { name: 'Winter', color: '#5daeea', startDeg: 245, endDeg: 325 },
    { name: 'Spring', color: '#4ecdc4', startDeg: 335, endDeg: 55 },
    { name: 'Summer', color: '#ffad5a', startDeg: 65, endDeg: 145 },
    { name: 'Fall', color: '#ff7a66', startDeg: 155, endDeg: 235 }
];

@Component({
    selector: 'types-pie-donut-nightingale-noaa-monthly-precipitation-2024-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>startAngle=-90</i> anchors January at 12 o'clock; <i>sliceRadiusValue</i> maps each month's value to radial depth so the longest petal is always the wettest month. The <i>color</i> array assigns seasonal hues to distinguish the
                four quarters at a glance. <i>renderContent</i> marks the peak month inline and <i>ChartAnnotation</i> displays the annual average in the center; hover to see each month's deviation from that figure.
            </p>
            <p>#### SvgPieNightingaleNoaaPrecipDemo.ts</p>
            <p>#### nightingaleNoaaPrecip.ts</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 460px">
                <p-chart-svg [animation]="{ duration: 700 }">
                    <p-chart-pie
                        id="precip"
                        [data]="data"
                        valueField="count"
                        categoryField="month"
                        sliceRadiusValue="precip"
                        [color]="colors"
                        [startAngle]="-90"
                        [sweepAngle]="360"
                        [innerRadius]="0.32"
                        [outerRadius]="0.82"
                        [borderRadius]="5"
                        [spacing]="1.5"
                        keyField="month"
                    >
                        <ng-template pChartSliceDef let-ctx>
                            @if (isPeak(ctx)) {
                                <svg:text text-anchor="middle" dominant-baseline="middle" font-size="9" font-weight="bold" fill="#fff">PEAK</svg:text>
                            }
                        </ng-template>
                    </p-chart-pie>
                    <p-chart-annotation>
                        <ng-template pChartAnnotationDef let-ctx>
                            <svg:g>
                                <svg:g text-anchor="middle">
                                    <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y - 14" font-size="10" opacity="0.45" dominant-baseline="middle">Annual avg</svg:text>
                                    <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y + 10" font-size="22" font-weight="bold" dominant-baseline="middle">{{ annualAvg }}"</svg:text>
                                </svg:g>
                                @for (m of months(ctx); track m.month) {
                                    <svg:line [attr.x1]="m.tx1" [attr.y1]="m.ty1" [attr.x2]="m.tx2" [attr.y2]="m.ty2" [attr.stroke]="m.color" stroke-width="1" opacity="0.45" />
                                    <svg:g [attr.transform]="'translate(' + m.lx + ',' + m.ly + ')'" text-anchor="middle">
                                        <svg:text y="-7" font-size="11" font-weight="600" [attr.fill]="m.color" dominant-baseline="middle">{{ m.month }}</svg:text>
                                        <svg:text y="6" font-size="9" opacity="0.55" dominant-baseline="middle">{{ m.precip }}"</svg:text>
                                    </svg:g>
                                }
                                @for (a of arcs(ctx); track a.name) {
                                    <svg:path [attr.d]="a.d" fill="none" [attr.stroke]="a.color" stroke-width="2" stroke-linecap="round" opacity="0.45" />
                                }
                            </svg:g>
                        </ng-template>
                    </p-chart-annotation>
                    <p-chart-tooltip [valueFormatter]="tooltipRows" />
                    <p-chart-hover [offset]="5" [brightness]="1.1" />
                    <p-chart-title text="US average monthly precipitation 2024" />
                    <p-chart-caption text="Source: NOAA Climate Data Online · 48 contiguous states average · 2024 data" />
                    <p-chart-export-menu filename="noaa-monthly-precipitation-2024" />
                    <p-chart-accessibility />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NightingaleNoaaMonthlyPrecipitation2024Doc {
    readonly data = data;
    readonly colors = colors;
    readonly annualAvg = ANNUAL_AVG;

    isPeak(ctx: SliceRenderContext): boolean {
        return (ctx.data as MonthData).precip === WETTEST_VAL;
    }

    private radii(ctx: AnnotationContext) {
        const outerR = (Math.min(ctx.chartArea.width, ctx.chartArea.height) / 2) * 0.82;

        return { outerR, tickR0: outerR * 1.01, tickR1: outerR * 1.1, labelR: outerR * 1.16, arcR: outerR * 1.28 };
    }

    months(ctx: AnnotationContext) {
        const { tickR0, tickR1, labelR } = this.radii(ctx);
        const cx = ctx.center.x;
        const cy = ctx.center.y;

        return data.map((d, i) => {
            const rad = ((-90 + (i + 0.5) * 30) * Math.PI) / 180;
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);

            return { month: d.month, precip: d.precip, color: colors[i], lx: cx + labelR * cos, ly: cy + labelR * sin, tx1: cx + tickR0 * cos, ty1: cy + tickR0 * sin, tx2: cx + tickR1 * cos, ty2: cy + tickR1 * sin };
        });
    }

    arcs(ctx: AnnotationContext) {
        const { arcR } = this.radii(ctx);
        const cx = ctx.center.x;
        const cy = ctx.center.y;

        return SEASON_ARCS.map((s) => {
            const s0 = (s.startDeg * Math.PI) / 180;
            const s1 = (s.endDeg * Math.PI) / 180;

            return { name: s.name, color: s.color, d: `M ${cx + arcR * Math.cos(s0)} ${cy + arcR * Math.sin(s0)} A ${arcR} ${arcR} 0 0 1 ${cx + arcR * Math.cos(s1)} ${cy + arcR * Math.sin(s1)}` };
        });
    }

    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const item = data[ctx.index!];
        const diff = item.precip - ANNUAL_AVG;

        return [
            { label: 'Precipitation', value: `${item.precip.toFixed(2)}"` },
            { label: 'vs Annual avg', value: `${diff >= 0 ? '▲' : '▼'} ${diff >= 0 ? '+' : ''}${diff.toFixed(2)}"`, color: diff >= 0 ? '#10a981' : '#e5484d' },
            { label: 'Season', value: item.season.charAt(0).toUpperCase() + item.season.slice(1) }
        ];
    };
}

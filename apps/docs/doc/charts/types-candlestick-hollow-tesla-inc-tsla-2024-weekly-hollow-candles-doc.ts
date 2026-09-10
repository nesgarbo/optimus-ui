import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type AnnotationContext, type TickValue, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { teslaEarnings } from '@/doc/charts/data/teslaEarnings';

const VWAP52 = teslaEarnings.reduce((s, c) => s + (c.high + c.low + c.close) / 3, 0) / teslaEarnings.length;

const EARNINGS = [
    { ts: Date.parse('2024-01-24'), label: "Q4'23 MISS", eps: { actual: 0.71, consensus: 0.74 }, color: '#e5484d' },
    { ts: Date.parse('2024-04-23'), label: "Q1'24 MISS", eps: { actual: 0.45, consensus: 0.51 }, color: '#ff7a66' },
    { ts: Date.parse('2024-07-23'), label: "Q2'24 MISS", eps: { actual: 0.52, consensus: 0.61 }, color: '#ff7a66' },
    { ts: Date.parse('2024-10-23'), label: "Q3'24 BEAT", eps: { actual: 0.72, consensus: 0.58 }, color: '#10a981' }
];

function findEarningsForWeek(ts: number) {
    return EARNINGS.find((ev) => Math.abs(ts - ev.ts) < 7 * 86_400_000);
}

@Component({
    selector: 'types-candlestick-hollow-tesla-inc-tsla-2024-weekly-hollow-candles-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>variant="hollow"</i> renders up-close weeks as outline bodies and down-close weeks as filled bodies. <i>ChartAnnotation</i> pins four quarterly earnings events, each colored by beat/miss magnitude. The custom tooltip reveals an EPS
                actual vs consensus section when hovering an earnings week. <i>ChartReferenceLine</i> marks the 52-week VWAP. <i>ChartZoom</i> is enabled for drilling into each quarter.
            </p>
            <p>#### SvgHollowTeslaEarningsDemo.ts</p>
            <p>#### teslaEarnings.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 500 }">
                        <p-chart-candlestick [data]="data" categoryXField="ts" openField="open" highField="high" lowField="low" closeField="close" variant="hollow" upColor="#10a981" downColor="#e5484d" [barWidthRatio]="0.62" />
                        <p-chart-reference-line [y]="vwap52" label="52-week VWAP" stroke="#7c8cff" [lineStrokeWidth]="1" [lineDash]="[4, 4]" labelPosition="start" labelBackground="#7c8cff" labelColor="#fff" [labelPadding]="5" />
                        <p-chart-annotation>
                            <ng-template pChartAnnotationDef let-ctx>
                                @if (ctx.xScale && ctx.chartArea) {
                                    <svg:g pointer-events="none">
                                        @for (ev of earningsPins(ctx); track ev.label) {
                                            <svg:g>
                                                <svg:line [attr.x1]="ev.x" [attr.y1]="ev.y1" [attr.x2]="ev.x" [attr.y2]="ev.y2" [attr.stroke]="ev.color" stroke-dasharray="3 3" stroke-width="1" opacity="0.6" />
                                                <svg:rect [attr.x]="ev.rx" [attr.y]="ev.ry" [attr.width]="ev.w" height="14" rx="3" [attr.fill]="ev.color" opacity="0.95" />
                                                <svg:text [attr.x]="ev.x" [attr.y]="ev.ty" text-anchor="middle" dominant-baseline="central" fill="#fff" font-size="9" font-weight="600">{{ ev.label }}</svg:text>
                                            </svg:g>
                                        }
                                    </svg:g>
                                }
                            </ng-template>
                        </p-chart-annotation>
                        <p-chart-tooltip [valueFormatter]="tooltipRows" />
                        <p-chart-hover />
                        <p-chart-zoom mode="x" />
                        <p-chart-x-axis type="time" gapless />
                        <p-chart-y-axis position="right" [tickFormat]="formatPrice" />
                        <p-chart-title text="Tesla, Inc. (TSLA) — 2024 Weekly Hollow Candles" />
                        <p-chart-caption text="Hollow-body convention flags weekly momentum · hover an earnings week for the EPS surprise breakdown" />
                        <p-chart-export-menu filename="tsla-2024-weekly-hollow" />
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
export class CandlestickHollowTeslaIncTsla2024WeeklyHollowCandlesDoc {
    readonly data = teslaEarnings;
    readonly vwap52 = VWAP52;
    readonly formatPrice = (v: TickValue) => `$${Number(v).toFixed(0)}`;

    earningsPins(ctx: AnnotationContext) {
        const xScale = ctx.xScale!;
        const area = ctx.chartArea;

        return EARNINGS.map((ev) => {
            const x = xScale(ev.ts);

            if (x < area.x || x > area.x + area.width) return null;

            const w = ev.label.length * 5.6 + 10;

            return {
                label: ev.label,
                color: ev.color,
                x,
                y1: area.y + 20,
                y2: area.y + area.height,
                rx: x - w / 2,
                ry: area.y + 4,
                w,
                ty: area.y + 11
            };
        }).filter((p): p is NonNullable<typeof p> => p !== null);
    }

    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const item = ctx.index != null ? this.data[ctx.index] : undefined;

        if (!item) return [];

        const change = item.close - item.open;
        const pct = (change / item.open) * 100;
        const color = change >= 0 ? '#10a981' : '#e5484d';
        const earnings = findEarningsForWeek(item.ts);

        const rows: TooltipRow[] = [
            { label: 'Open', value: `$${item.open.toFixed(2)}` },
            { label: 'High', value: `$${item.high.toFixed(2)}` },
            { label: 'Low', value: `$${item.low.toFixed(2)}` },
            { label: 'Close', value: `$${item.close.toFixed(2)}` },
            { label: 'Δ Week', value: `${change >= 0 ? '+' : ''}$${Math.abs(change).toFixed(2)} (${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%)`, color }
        ];

        if (earnings) {
            const surprise = ((earnings.eps.actual - earnings.eps.consensus) / earnings.eps.consensus) * 100;
            const surpriseColor = surprise >= 0 ? '#10a981' : '#e5484d';

            rows.push(
                { label: 'Earnings', value: earnings.label, color: earnings.color },
                { label: 'EPS actual', value: `$${earnings.eps.actual.toFixed(2)}` },
                { label: 'EPS est.', value: `$${earnings.eps.consensus.toFixed(2)}` },
                { label: 'Surprise', value: `${surprise >= 0 ? '+' : ''}${surprise.toFixed(1)}%`, color: surpriseColor }
            );
        }

        return rows;
    };
}

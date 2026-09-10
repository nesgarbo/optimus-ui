import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type AnnotationContext, type ItemContext, type TickValue, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { gold2024 } from '@/doc/charts/data/gold2024';

const SMA20 = gold2024.map((_, i) => {
    const start = Math.max(0, i - 19);
    const slice = gold2024.slice(start, i + 1);

    return slice.reduce((s, c) => s + c.close, 0) / slice.length;
});

function candleColor(idx: number, close: number): string {
    return close >= (SMA20[idx] ?? 0) ? '#ffad5a' : '#94a3b8';
}

const CONSOLIDATION = {
    start: Date.parse('2024-10-18'),
    end: Date.parse('2024-12-27'),
    low: 2530,
    high: 2790
};
const PRIOR_ATH = 2075;
const BREAKOUT_TS = Date.parse('2024-03-08');

@Component({
    selector: 'types-candlestick-ohlc-gold-spot-xau-usd-2024-weekly-ohlc-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                A <i>color</i> callback computes a 20-week SMA and routes each bar to a warm color when close is above it and a cool color when below. A dashed <i>ChartReferenceLine</i> anchors the previous all-time high;
                <i>ChartReferenceBand</i> shades a consolidation range bounded by both X and Y axes. <i>ChartAnnotation</i> draws a leader line from the breakout candle to a side label. The tooltip shows O / H / L / C, weekly range, and a vs-SMA
                delta.
            </p>
            <p>#### SvgOhlcGold2024Demo.ts</p>
            <p>#### gold2024.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 500 }">
                        <p-chart-candlestick [data]="data" categoryXField="ts" openField="open" highField="high" lowField="low" closeField="close" variant="ohlc" [color]="candleColorAccessor" [wickStrokeWidth]="1.4" [barWidthRatio]="0.55" />
                        <p-chart-reference-band [y1]="consolidation.low" [y2]="consolidation.high" [x1]="consolidation.start" [x2]="consolidation.end" label="Q4 consolidation" fill="#94a3b8" [fillOpacity]="0.08" labelPosition="start" />
                        <p-chart-reference-line [y]="priorAth" label="Prior ATH · $2,075" stroke="#7c8cff" [lineStrokeWidth]="1" [lineDash]="[5, 4]" labelPosition="start" />
                        <p-chart-annotation>
                            <ng-template pChartAnnotationDef let-ctx>
                                @if (ctx.xScale && ctx.yScale && ctx.chartArea) {
                                    @if (breakoutCallout(ctx); as c) {
                                        <svg:g pointer-events="none">
                                            <svg:line [attr.x1]="c.x" [attr.y1]="c.y" [attr.x2]="c.labelX" [attr.y2]="c.labelY" stroke="#ffad5a" stroke-width="1" opacity="0.7" />
                                            <svg:circle [attr.cx]="c.x" [attr.cy]="c.y" r="3.5" fill="#ffad5a" />
                                            <svg:rect [attr.x]="c.labelX" [attr.y]="c.ry" [attr.width]="c.bw" [attr.height]="c.bh" rx="3" fill="#ffad5a" opacity="0.95" />
                                            <svg:text [attr.x]="c.tx" [attr.y]="c.labelY" dominant-baseline="central" fill="#fff" [attr.font-size]="c.fs" font-weight="600">Broke prior ATH $2075</svg:text>
                                        </svg:g>
                                    }
                                }
                            </ng-template>
                        </p-chart-annotation>
                        <p-chart-tooltip [valueFormatter]="tooltipRows" />
                        <p-chart-hover />
                        <p-chart-zoom mode="x" />
                        <p-chart-x-axis type="time" gapless />
                        <p-chart-y-axis position="right" [tickFormat]="formatPrice" />
                        <p-chart-title text="Gold Spot (XAU/USD) — 2024 Weekly OHLC" />
                        <p-chart-caption text="OHLC bars · per-bar color from 20-week SMA filter · tooltip shows vs-SMA delta and full weekly range" />
                        <p-chart-export-menu filename="xau-usd-2024-weekly" />
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
export class CandlestickOhlcGoldSpotXauUsd2024WeeklyOhlcDoc {
    readonly data = gold2024;
    readonly priorAth = PRIOR_ATH;
    readonly consolidation = CONSOLIDATION;
    readonly candleColorAccessor = (ctx: ItemContext): string => candleColor(ctx.index, (ctx.datum as { close: number }).close);
    readonly formatPrice = (v: TickValue) => `$${Number(v).toFixed(0)}`;

    breakoutCallout(ctx: AnnotationContext) {
        const xScale = ctx.xScale!;
        const yScale = ctx.yScale!;
        const area = ctx.chartArea;
        const x = xScale(BREAKOUT_TS);
        const y = yScale(2180);

        if (x < area.x || x > area.x + area.width) return null;

        const fs = ctx.responsive.pick({ xs: 8, sm: 9, md: 10 });
        const bw = ctx.responsive.pick({ xs: 108, sm: 128, md: 150 });
        const bh = ctx.responsive.pick({ xs: 15, sm: 16, md: 18 });
        const padX = ctx.responsive.pick({ xs: 6, sm: 7, md: 8 });

        const labelX = Math.min(x + 8, area.x + area.width - bw);
        const labelY = Math.max(y - 18, area.y + 12);

        return { x, y, labelX, labelY, bw, bh, fs, ry: labelY - bh / 2, tx: labelX + padX };
    }

    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const idx = ctx.index ?? -1;
        const item = idx >= 0 ? this.data[idx] : undefined;

        if (!item) return [];

        const change = item.close - item.open;
        const pct = (change / item.open) * 100;
        const rng = item.high - item.low;
        const vsSma = item.close - (SMA20[idx] ?? 0);
        const changeColor = change >= 0 ? '#10a981' : '#e5484d';
        const smaColor = vsSma >= 0 ? '#10a981' : '#e5484d';
        const fmt = (n: number) => `$${n.toFixed(2)}`;

        return [
            { label: 'Open', value: fmt(item.open) },
            { label: 'High', value: fmt(item.high) },
            { label: 'Low', value: fmt(item.low) },
            { label: 'Close', value: fmt(item.close) },
            { label: 'Δ Week', value: `${change >= 0 ? '+' : ''}${fmt(Math.abs(change))} (${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%)`, color: changeColor },
            { label: 'Range', value: fmt(rng) },
            { label: 'vs 20w SMA', value: `${vsSma >= 0 ? '+' : ''}${fmt(Math.abs(vsSma))}`, color: smaColor }
        ];
    };
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type ItemContext, type TickValue, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { eurUsd } from '@/doc/charts/data/eurUsd';

const EMA20 = (() => {
    const alpha = 2 / 21;
    const out: number[] = [];
    const firstData = eurUsd[0];

    if (!firstData) return out;

    let prev = firstData.close;

    for (const c of eurUsd) {
        prev = alpha * c.close + (1 - alpha) * prev;
        out.push(prev);
    }

    return out;
})();

function candleColor(idx: number): string {
    const back = Math.max(0, idx - 5);

    return (EMA20[idx] ?? 0) > (EMA20[back] ?? 0) ? '#4ecdc4' : '#e5484d';
}

const YTD_OPEN = 1.1037;
const SEPT_RALLY = {
    start: Date.parse('2024-09-10'),
    end: Date.parse('2024-09-30'),
    high: 1.1215,
    low: 1.104
};

@Component({
    selector: 'types-candlestick-hollow-eur-usd-h2-2024-daily-hollow-candles-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                A <i>color</i> callback computes an EMA20 slope and assigns each bar an aqua or semantic negative tint depending on momentum direction. <i>ChartReferenceBand</i> shades a specific time and price window using both X and Y bounds. The
                tooltip reports the pip change and range alongside the current EMA20 trend label.
            </p>
            <p>#### SvgHollowEurUsdDemo.ts</p>
            <p>#### eurUsd.ts</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 460px">
                <p-chart-svg [animation]="{ duration: 400 }">
                    <p-chart-candlestick [data]="data" categoryXField="ts" openField="open" highField="high" lowField="low" closeField="close" variant="hollow" [color]="candleColorAccessor" [barWidthRatio]="0.7" />
                    <p-chart-reference-band [x1]="septRally.start" [x2]="septRally.end" [y1]="septRally.low" [y2]="septRally.high" label="Sep rally" fill="#4ecdc4" [fillOpacity]="0.08" labelPosition="start" />
                    <p-chart-reference-line [y]="ytdOpen" label="YTD open · 1.1037" stroke="#7c8cff" [lineStrokeWidth]="1" [lineDash]="[4, 4]" labelPosition="start" labelBackground="#7c8cff" labelColor="#fff" [labelPadding]="5" />
                    <p-chart-tooltip [valueFormatter]="tooltipRows" />
                    <p-chart-hover />
                    <p-chart-zoom mode="x" />
                    <p-chart-x-axis type="time" gapless />
                    <p-chart-y-axis position="right" [tickFormat]="formatPrice" />
                    <p-chart-title text="EUR/USD — H2 2024 Daily Hollow Candles" />
                    <p-chart-caption text="Forex hollow bodies · per-bar aqua/negative color from EMA20 slope · tooltip reports pip change and EMA trend state" />
                    <p-chart-export-menu filename="eur-usd-h2-2024-hollow" />
                    <p-chart-accessibility />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HollowEurUsdH22024DailyHollowCandlesDoc {
    readonly data = eurUsd;
    readonly ytdOpen = YTD_OPEN;
    readonly septRally = SEPT_RALLY;
    readonly candleColorAccessor = (ctx: ItemContext): string => candleColor(ctx.index);
    readonly formatPrice = (v: TickValue) => Number(v).toFixed(4);

    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const idx = ctx.index ?? -1;
        const item = idx >= 0 ? this.data[idx] : undefined;

        if (!item) return [];

        const pips = (item.close - item.open) * 10000;
        const rangePips = (item.high - item.low) * 10000;
        const trend = (EMA20[idx] ?? 0) - (EMA20[Math.max(0, idx - 5)] ?? 0);
        const trendLabel = trend >= 0 ? 'Bullish' : 'Bearish';
        const trendColor = trend >= 0 ? '#4ecdc4' : '#e5484d';
        const pipsColor = pips >= 0 ? '#10a981' : '#e5484d';
        const fmt = (n: number) => n.toFixed(5);

        return [
            { label: 'O', value: fmt(item.open) },
            { label: 'H', value: fmt(item.high) },
            { label: 'L', value: fmt(item.low) },
            { label: 'C', value: fmt(item.close) },
            { label: 'Δ pips', value: `${pips >= 0 ? '+' : ''}${pips.toFixed(1)}`, color: pipsColor },
            { label: 'Range', value: `${rangePips.toFixed(1)} pips` },
            { label: 'EMA20 trend', value: trendLabel, color: trendColor }
        ];
    };
}

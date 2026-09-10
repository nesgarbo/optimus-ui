import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { injectChartTheme } from '@/doc/charts/_shared/inject-chart-theme';
import { useCryptoStream } from '@/doc/charts/data/cryptoStream';

const fmt = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

function isDarkScheme(annotation: string): boolean {
    const hex = annotation.replace('#', '');

    if (hex.length < 6) return false;

    const n = parseInt(hex.slice(0, 6), 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;

    return 0.299 * r + 0.587 * g + 0.114 * b > 140;
}

@Component({
    selector: 'types-candlestick-live-data-btc-usd-high-frequency-stream-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                New candles aggregate every 5 seconds into a 48-candle rolling window. <i>ChartAnnotation</i> layers a last-price tag pinned to the current close and a surface-aware session high/low readout. <i>ChartReferenceLine</i> tracks a
                live-recomputed VWAP across the visible window.
            </p>
            <p>#### SvgLiveCryptoStreamDemo.ts</p>
            <p>#### cryptoStream.ts</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 460px">
                <p-chart-svg [animation]="{ duration: 300 }">
                    <p-chart-candlestick [data]="data()" categoryXField="ts" openField="open" highField="high" lowField="low" closeField="close" upColor="#10a981" downColor="#e5484d" [barWidthRatio]="0.6" />
                    <p-chart-reference-line [y]="vwap()" label="VWAP" stroke="#7c8cff" [lineStrokeWidth]="1" [lineDash]="[6, 4]" labelPosition="start" />
                    <p-chart-annotation>
                        <ng-template pChartAnnotationDef let-ctx>
                            @if (ctx.chartArea && ctx.yScale) {
                                <svg:g pointer-events="none">
                                    <svg:line
                                        [attr.x1]="ctx.chartArea.x"
                                        [attr.y1]="ctx.yScale(currentClose())"
                                        [attr.x2]="ctx.chartArea.x + ctx.chartArea.width"
                                        [attr.y2]="ctx.yScale(currentClose())"
                                        [attr.stroke]="tickColor()"
                                        stroke-dasharray="2 3"
                                        stroke-width="1"
                                        opacity="0.55"
                                    />
                                    <svg:rect [attr.x]="ctx.chartArea.x + ctx.chartArea.width - 90" [attr.y]="ctx.yScale(currentClose()) - 10" width="90" height="20" rx="3" [attr.fill]="tickColor()" opacity="0.95" />
                                    <svg:text
                                        [attr.x]="ctx.chartArea.x + ctx.chartArea.width - 45"
                                        [attr.y]="ctx.yScale(currentClose()) + 1"
                                        text-anchor="middle"
                                        dominant-baseline="central"
                                        fill="#fff"
                                        font-size="11"
                                        font-weight="700"
                                        font-family="ui-monospace,SFMono-Regular,monospace"
                                    >
                                        {{ fmtClose() }}
                                    </svg:text>
                                    <svg:rect [attr.x]="ctx.chartArea.x + 8" [attr.y]="ctx.chartArea.y + 4" width="200" height="42" rx="4" [attr.fill]="panelFill()" />
                                    <svg:text [attr.x]="ctx.chartArea.x + 16" [attr.y]="ctx.chartArea.y + 16" dominant-baseline="central" [attr.fill]="panelMuted()" font-size="9">5s agg · 48 window</svg:text>
                                    <svg:text [attr.x]="ctx.chartArea.x + 16" [attr.y]="ctx.chartArea.y + 34" [attr.fill]="panelMuted()" font-size="9">H</svg:text>
                                    <svg:text [attr.x]="ctx.chartArea.x + 26" [attr.y]="ctx.chartArea.y + 34" fill="#10a981" font-size="9" font-weight="600" font-family="ui-monospace,SFMono-Regular,monospace">{{ fmtHigh() }}</svg:text>
                                    <svg:text [attr.x]="ctx.chartArea.x + 110" [attr.y]="ctx.chartArea.y + 34" [attr.fill]="panelMuted()" font-size="9">L</svg:text>
                                    <svg:text [attr.x]="ctx.chartArea.x + 120" [attr.y]="ctx.chartArea.y + 34" fill="#e5484d" font-size="9" font-weight="600" font-family="ui-monospace,SFMono-Regular,monospace">{{ fmtLow() }}</svg:text>
                                </svg:g>
                            }
                        </ng-template>
                    </p-chart-annotation>
                    <p-chart-tooltip [valueFormatter]="tooltipRows" />
                    <p-chart-hover />
                    <p-chart-x-axis type="time" gapless [chartPaddingMax]="0.1" />
                    <p-chart-y-axis position="right" [tickFormat]="formatPrice" />
                    <p-chart-title text="BTC/USD — High-Frequency Stream" />
                    <p-chart-caption text="Simulated 5-second candles · 48-window · live last-price tag, session high/low, and rolling VWAP" />
                    <p-chart-accessibility />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LiveDataBtcUsdHighFrequencyStreamDoc {
    readonly theme = injectChartTheme();
    readonly data = useCryptoStream();
    readonly currentClose = computed(() => this.data()[this.data().length - 1]?.close ?? 0);
    private readonly prevClose = computed(() => this.data()[this.data().length - 2]?.close ?? this.currentClose());
    readonly tickColor = computed(() => (this.currentClose() - this.prevClose() >= 0 ? '#10a981' : '#e5484d'));
    readonly fmtClose = computed(() => fmt(this.currentClose()));
    readonly fmtHigh = computed(() => fmt(Math.max(...this.data().map((d) => d.high))));
    readonly fmtLow = computed(() => fmt(Math.min(...this.data().map((d) => d.low))));
    readonly vwap = computed(() => {
        const tp = this.data().map((d) => (d.high + d.low + d.close) / 3);

        return tp.reduce((s, v) => s + v, 0) / tp.length;
    });

    panelFill(): string {
        return isDarkScheme(this.theme().annotation) ? 'rgba(15,23,42,0.88)' : 'rgba(248,250,252,0.92)';
    }

    panelMuted(): string {
        return isDarkScheme(this.theme().annotation) ? 'rgba(226,232,240,0.68)' : 'rgba(71,85,105,0.72)';
    }

    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const idx = ctx.index ?? -1;

        if (idx < 0) return [];

        const item = this.data()[idx];

        if (!item) return [];

        const prev = this.data()[idx - 1]?.close ?? item.open;
        const change = item.close - prev;
        const pct = (change / prev) * 100;
        const color = change >= 0 ? '#10a981' : '#e5484d';
        const money = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

        return [
            { label: 'O', value: money(item.open) },
            { label: 'H', value: money(item.high) },
            { label: 'L', value: money(item.low) },
            { label: 'C', value: money(item.close) },
            { label: 'Δ vs prev', value: `${change >= 0 ? '+' : ''}${money(Math.abs(change))} (${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%)`, color }
        ];
    };

    readonly formatPrice = (v: TickValue) => `$${(Number(v) / 1000).toFixed(1)}k`;
}

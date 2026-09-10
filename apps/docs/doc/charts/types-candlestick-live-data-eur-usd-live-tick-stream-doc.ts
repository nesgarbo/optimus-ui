import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { injectChartTheme } from '@/doc/charts/_shared/inject-chart-theme';
import { useForexTick } from '@/doc/charts/data/forexTick';

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
    selector: 'types-candlestick-live-data-eur-usd-live-tick-stream-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                A new 1-second candle appends on every tick into a 60-candle rolling window. <i>ChartAnnotation</i> paints a live badge and a bid/ask/spread readout that both update each tick without re-rendering the chart. A dashed
                <i>ChartReferenceLine</i> tracks the current close reactively across the whole chart.
            </p>
            <p>#### SvgLiveForexTickDemo.ts</p>
            <p>#### forexTick.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 250 }">
                        <p-chart-candlestick [data]="data()" categoryXField="ts" openField="open" highField="high" lowField="low" closeField="close" upColor="#10a981" downColor="#e5484d" [barWidthRatio]="0.65" />
                        <p-chart-reference-line [y]="currentClose()" stroke="#ffad5a" [lineStrokeWidth]="1" [lineDash]="[3, 3]" />
                        <p-chart-annotation>
                            <ng-template pChartAnnotationDef let-ctx>
                                @if (ctx.chartArea) {
                                    <svg:g pointer-events="none">
                                        <svg:rect [attr.x]="ctx.chartArea.x + ctx.chartArea.width - 170" [attr.y]="ctx.chartArea.y + 4" width="170" height="36" rx="4" [attr.fill]="panelFill()" />
                                        <svg:text [attr.x]="ctx.chartArea.x + ctx.chartArea.width - 160" [attr.y]="ctx.chartArea.y + 16" fill="#e5484d" font-size="9" font-weight="600">BID</svg:text>
                                        <svg:text [attr.x]="ctx.chartArea.x + ctx.chartArea.width - 140" [attr.y]="ctx.chartArea.y + 16" [attr.fill]="panelText()" font-size="11" font-weight="700" font-family="ui-monospace,SFMono-Regular,monospace">
                                            {{ bid() }}
                                        </svg:text>
                                        <svg:text [attr.x]="ctx.chartArea.x + ctx.chartArea.width - 80" [attr.y]="ctx.chartArea.y + 16" fill="#10a981" font-size="9" font-weight="600">ASK</svg:text>
                                        <svg:text [attr.x]="ctx.chartArea.x + ctx.chartArea.width - 60" [attr.y]="ctx.chartArea.y + 16" [attr.fill]="panelText()" font-size="11" font-weight="700" font-family="ui-monospace,SFMono-Regular,monospace">
                                            {{ ask() }}
                                        </svg:text>
                                        <svg:text [attr.x]="ctx.chartArea.x + ctx.chartArea.width - 160" [attr.y]="ctx.chartArea.y + 32" [attr.fill]="panelMuted()" font-size="9">Spread {{ spreadLabel() }} pip · 1s tick</svg:text>
                                    </svg:g>
                                }
                            </ng-template>
                        </p-chart-annotation>
                        <p-chart-tooltip [valueFormatter]="tooltipRows" />
                        <p-chart-hover />
                        <p-chart-x-axis type="time" gapless [chartPaddingMax]="0.1" />
                        <p-chart-y-axis position="right" [tickFormat]="formatPrice" />
                        <p-chart-title text="EUR/USD — Live Tick Stream" />
                        <p-chart-caption text="Simulated 1-second candles · 60-tick rolling window · live bid/ask + spread in corner · dashed amber line tracks current close" />
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
export class CandlestickLiveDataEurUsdLiveTickStreamDoc {
    readonly theme = injectChartTheme();
    private readonly feed = useForexTick();
    readonly data = this.feed.data;
    readonly spreadPips = this.feed.spreadPips;
    readonly currentClose = computed(() => this.data()[this.data().length - 1]?.close ?? 0);
    readonly bid = computed(() => (this.currentClose() - this.spreadPips() * 0.00005).toFixed(5));
    readonly ask = computed(() => (this.currentClose() + this.spreadPips() * 0.00005).toFixed(5));
    readonly spreadLabel = computed(() => this.spreadPips().toFixed(1));

    panelFill(): string {
        return isDarkScheme(this.theme().annotation) ? 'rgba(15,23,42,0.88)' : 'rgba(248,250,252,0.92)';
    }

    panelMuted(): string {
        return isDarkScheme(this.theme().annotation) ? 'rgba(226,232,240,0.68)' : 'rgba(71,85,105,0.72)';
    }

    panelText(): string {
        return isDarkScheme(this.theme().annotation) ? '#e2e8f0' : '#334155';
    }

    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const item = ctx.index != null ? this.data()[ctx.index] : null;

        if (!item) return [];

        const pips = (item.close - item.open) * 10000;
        const pipsColor = pips >= 0 ? '#10a981' : '#e5484d';

        return [
            { label: 'O', value: item.open.toFixed(5) },
            { label: 'H', value: item.high.toFixed(5) },
            { label: 'L', value: item.low.toFixed(5) },
            { label: 'C', value: item.close.toFixed(5) },
            { label: 'Δ pips', value: `${pips >= 0 ? '+' : ''}${pips.toFixed(1)}`, color: pipsColor }
        ];
    };

    readonly formatPrice = (v: TickValue) => Number(v).toFixed(4);
}

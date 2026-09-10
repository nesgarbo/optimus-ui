import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue } from '@openng/optimus-ui/charts';
import { comboStockVolume } from '@/doc/charts/data/comboStockVolume';

function computeSma(n: number): { date: string; value: number }[] {
    return comboStockVolume
        .map((d, i) => {
            if (i < n - 1) return null;

            const avg = comboStockVolume.slice(i - n + 1, i + 1).reduce((s, c) => s + c.close, 0) / n;

            return { date: d.date, value: +avg.toFixed(2) };
        })
        .filter((x): x is { date: string; value: number } => x !== null);
}

const AVG_VOLUME = +(comboStockVolume.reduce((s, d) => s + d.volume, 0) / comboStockVolume.length).toFixed(1);

@Component({
    selector: 'types-combo-examples-stock-price-volume-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>ChartCandlestick</i> on the right axis renders OHLC candles; <i>ChartBar</i> on the left axis plots daily volume with an elevated <i>max</i> so volume sits below the price action without overlapping. A dashed
                <i>ChartReferenceLine</i> shows the rolling 20-day average volume. <i>ChartZoom</i> enables drag-to-zoom, and the X axis rotates tick labels so dates don't overlap.
            </p>
            <p>#### SvgComboStockVolumeDemo.ts</p>
            <p>#### comboStockVolume.ts</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 460px">
                <p-chart-svg [animation]="{ duration: 400, easing: 'easeOutCubic' }">
                    <p-chart-candlestick [data]="data" categoryXField="date" openField="open" highField="high" lowField="low" closeField="close" name="NVDA" yAxisId="price" upColor="#10a981" downColor="#e5484d" [barWidthRatio]="0.65" />
                    <p-chart-line [data]="sma10" categoryXField="date" valueYField="value" name="SMA 10" yAxisId="price" color="#ffad5a" curve="smooth" [lineStrokeWidth]="1.5" [showMarkers]="false" [fillOpacity]="0" />
                    <p-chart-line [data]="sma20" categoryXField="date" valueYField="value" name="SMA 20" yAxisId="price" color="#7c8cff" curve="smooth" [lineStrokeWidth]="1.5" [showMarkers]="false" [fillOpacity]="0" />
                    <p-chart-bar [data]="data" categoryXField="date" valueYField="volume" name="Volume" color="#94a3b8" yAxisId="volume" [opacity]="0.65" />
                    <p-chart-reference-line yAxisId="volume" [y]="avgVolume" stroke="#64748b80" [lineDash]="[3, 3]" label="Avg volume" />
                    <p-chart-x-axis [tickRotation]="-35" />
                    <p-chart-y-axis id="price" position="right" label="Price (USD)" [tickFormat]="formatPrice" [chartPaddingMin]="0.3" />
                    <p-chart-y-axis id="volume" type="logarithmic" position="left" label="Volume" [max]="180" [tickFormat]="formatVolume" />
                    <p-chart-legend position="top" />
                    <p-chart-tooltip mode="shared" [crosshair]="true" />
                    <p-chart-hover />
                    <p-chart-zoom mode="x" />
                    <p-chart-title text="NVDA · Q1 2024 · Candlestick + SMA(10) + SMA(20) + Volume" />
                    <p-chart-caption text="SMA(10) amber · SMA(20) periwinkle overlaid on daily candles · volume sub-pane (log scale) · Feb 21 earnings spike visible · drag to zoom" />
                    <p-chart-export-menu filename="nvda-q1-2024" />
                    <p-chart-accessibility />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExamplesStockPriceVolumeDoc {
    readonly data = comboStockVolume;
    readonly sma10 = computeSma(10);
    readonly sma20 = computeSma(20);
    readonly avgVolume = AVG_VOLUME;
    readonly formatVolume = (v: TickValue) => `${Number(v).toFixed(0)}M`;
    readonly formatPrice = (v: TickValue) => `$${Number(v).toFixed(0)}`;
}

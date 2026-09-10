import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type SegmentContext, type TooltipRow } from '@openng/optimus-ui/charts';
import { usePriceFeed } from '@/doc/charts/data/priceFeed';

@Component({
    selector: 'types-line-area-time-series-live-stock-price-acme-corp-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>segmentColor</i> and <i>segmentFillColor</i> paint each tick green on a rise and red on a fall, so the trend direction is readable at a glance. New ticks push into a 50-point rolling window on a live <i>type="time"</i> axis.
                <i>ChartZoom</i> and <i>ChartNavigator</i> isolate any portion of the feed, and the tooltip computes the session change from the first visible tick.
            </p>
            <p>#### SvgLineFedRateCpiDemo.ts</p>
            <p>#### priceFeed.ts</p>
            <p>For a localized Arabic market snapshot that keeps the time axis, numeric axis, tooltip, and layout direction aligned, see the <a href="/charts/internationalization/locale">Locale and RTL example</a>.</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 460px">
                <p-chart-svg [animation]="{ duration: 300 }">
                    <p-chart-line
                        [data]="data()"
                        categoryXField="ts"
                        valueYField="price"
                        curve="smooth"
                        [lineStrokeWidth]="2"
                        [fillOpacity]="0.15"
                        [segmentColor]="segmentColor"
                        [segmentFillColor]="segmentFillColor"
                        [showMarkers]="true"
                        [markerSize]="2.5"
                    />
                    <p-chart-tooltip [valueFormatter]="tooltipRows" snap="x" />
                    <p-chart-hover />
                    <p-chart-x-axis type="time" [chartPaddingMax]="0.1" [chartPaddingMin]="-0.1" />
                    <p-chart-y-axis [tickCount]="6" />
                    <p-chart-zoom mode="x" />
                    <p-chart-navigator />
                    <p-chart-title text="High-frequency price feed" />
                    <p-chart-caption text="Simulated tick data · 1.2-second interval · 50-tick rolling window · Green: price rising · Red: price falling · Drag navigator to zoom" />
                    <p-chart-export-menu filename="stock-price-live" />
                    <p-chart-accessibility />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeSeriesLiveStockPriceAcmeCorpDoc {
    readonly data = usePriceFeed();
    readonly segmentColor = (ctx: SegmentContext) => ((ctx.p1.value ?? 0) >= (ctx.p0.value ?? 0) ? '#10a981' : '#e5484d');
    readonly segmentFillColor = (ctx: SegmentContext) => ((ctx.p1.value ?? 0) >= (ctx.p0.value ?? 0) ? 'rgba(16,169,129,0.45)' : 'rgba(229,72,77,0.38)');
    readonly tooltipRows = (value: number): TooltipRow[] => {
        const first = this.data()[0];
        const change = first ? value - first.price : 0;
        const changePct = first && first.price ? ((change / first.price) * 100).toFixed(2) : '0.00';
        const arrow = change >= 0 ? '+' : '';

        return [
            { label: 'Price', value: `$${value.toFixed(2)}` },
            { label: 'Session', value: `${arrow}${change.toFixed(2)} (${arrow}${changePct}%)`, color: change >= 0 ? '#10a981' : '#e5484d' }
        ];
    };
}

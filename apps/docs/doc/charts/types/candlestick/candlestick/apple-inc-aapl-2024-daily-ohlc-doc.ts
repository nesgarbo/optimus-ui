import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type AnnotationContext, type TickValue, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { aaplDaily } from '@/doc/charts/data/aaplDaily';

const EARNINGS = [
    { ts: Date.UTC(2024, 0, 31), label: 'Q1 FY24' },
    { ts: Date.UTC(2024, 4, 2), label: 'Q2 FY24' },
    { ts: Date.UTC(2024, 7, 1), label: 'Q3 FY24' },
    { ts: Date.UTC(2024, 9, 31), label: 'Q4 FY24' }
];

const AVG_200 = (() => {
    const window = aaplDaily.slice(-200);

    return window.reduce((s, c) => s + c.close, 0) / window.length;
})();

@Component({
    selector: 'types-candlestick-candlestick-apple-inc-aapl-2024-daily-ohlc-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>ChartZoom</i> with <i>ChartNavigator</i> gives a minimap for fast range selection across a full trading year. <i>ChartAnnotation</i> pins quarterly earnings dates using the <i>xScale</i> callback so labels stay attached to their
                candles through every zoom state. A dashed <i>ChartReferenceLine</i> marks the 200-day moving average. The custom tooltip shows O / H / L / C rows, a signed change row, and an intraday range row.
            </p>
            <p>#### SvgCandlestickAaplDailyDemo.ts</p>
            <p>#### aaplDaily.ts</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 460px">
                <p-chart-svg [animation]="{ duration: 400 }">
                    <p-chart-candlestick [data]="data" categoryXField="ts" openField="open" highField="high" lowField="low" closeField="close" upColor="#10a981" downColor="#e5484d" [barWidthRatio]="0.72" />
                    <p-chart-reference-line [y]="avg200" label="200-day avg" stroke="#7c8cff" [lineStrokeWidth]="1" [lineDash]="[5, 4]" labelPosition="start" />
                    <p-chart-annotation>
                        <ng-template pChartAnnotationDef let-ctx>
                            @if (ctx.xScale && ctx.chartArea) {
                                <svg:g pointer-events="none">
                                    @for (ev of earningsPins(ctx); track ev.ts) {
                                        <svg:g>
                                            <svg:line [attr.x1]="ev.x" [attr.y1]="ev.top" [attr.x2]="ev.x" [attr.y2]="ev.bottom" stroke="#7c8cff" stroke-dasharray="3 3" stroke-width="1" opacity="0.5" />
                                            <svg:rect [attr.x]="ev.rx" [attr.y]="ev.ry" [attr.width]="ev.bw" [attr.height]="ev.bh" rx="3" fill="#7c8cff" opacity="0.9" />
                                            <svg:text [attr.x]="ev.x" [attr.y]="ev.ty" text-anchor="middle" dominant-baseline="central" fill="#fff" [attr.font-size]="ev.fs" font-weight="600">{{ ev.label }}</svg:text>
                                        </svg:g>
                                    }
                                </svg:g>
                            }
                        </ng-template>
                    </p-chart-annotation>
                    <p-chart-tooltip [valueFormatter]="tooltipRows" [crosshair]="{ x: true, y: true, dashArray: [3, 3], color: '#94a3b8' }" />
                    <p-chart-hover />
                    <p-chart-zoom mode="x" />
                    <p-chart-navigator [height]="42" />
                    <p-chart-x-axis type="time" gapless />
                    <p-chart-y-axis position="right" [tickFormat]="formatPrice" />
                    <p-chart-title text="Apple Inc. (AAPL) — 2024 Daily OHLC" />
                    <p-chart-caption text="Nasdaq · split-adjusted · quarterly earnings marked with indigo pins · hover for crosshair · drag navigator to zoom" />
                    <p-chart-export-menu filename="aapl-2024-daily" />
                    <p-chart-accessibility />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CandlestickAppleIncAapl2024DailyOhlcDoc {
    readonly data = aaplDaily;
    readonly avg200 = AVG_200;
    readonly formatPrice = (v: TickValue) => `$${Number(v).toFixed(0)}`;

    earningsPins(ctx: AnnotationContext) {
        const xScale = ctx.xScale!;
        const area = ctx.chartArea;
        const fs = ctx.responsive.pick({ xs: 7, sm: 8, md: 9 });
        const bw = ctx.responsive.pick({ xs: 34, sm: 39, md: 44 });
        const bh = ctx.responsive.pick({ xs: 11, sm: 12, md: 14 });

        return EARNINGS.map((ev) => ({ ...ev, x: xScale(ev.ts) }))
            .filter((p) => p.x >= area.x && p.x <= area.x + area.width)
            .map((p) => ({
                ts: p.ts,
                label: p.label,
                x: p.x,
                top: area.y,
                bottom: area.y + area.height,
                rx: p.x - bw / 2,
                ry: area.y + 4,
                bw,
                bh,
                ty: area.y + 4 + bh / 2,
                fs
            }));
    }

    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const item = ctx.index != null ? this.data[ctx.index] : undefined;

        if (!item) return [];

        const change = item.close - item.open;
        const pct = (change / item.open) * 100;
        const rng = item.high - item.low;
        const changeColor = change >= 0 ? '#10a981' : '#e5484d';

        return [
            { label: 'O', value: `$${item.open.toFixed(2)}` },
            { label: 'H', value: `$${item.high.toFixed(2)}` },
            { label: 'L', value: `$${item.low.toFixed(2)}` },
            { label: 'C', value: `$${item.close.toFixed(2)}` },
            { label: 'Change', value: `${change >= 0 ? '+' : ''}${change.toFixed(2)} (${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%)`, color: changeColor },
            { label: 'Range', value: `$${rng.toFixed(2)}` }
        ];
    };
}

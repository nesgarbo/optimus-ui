import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type AnnotationContext, type TickValue, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { crudeOil } from '@/doc/charts/data/crudeOil';

const VOLATILITY_SPIKE = {
    start: Date.parse('2024-03-29'),
    end: Date.parse('2024-04-26')
};

const OPEC_EVENTS = [
    { ts: Date.parse('2024-03-03'), label: 'Saudi extends cuts' },
    { ts: Date.parse('2024-06-02'), label: 'OPEC+ unwind plan' },
    { ts: Date.parse('2024-09-05'), label: 'Unwind delayed' },
    { ts: Date.parse('2024-12-05'), label: 'Cuts to Q2 2025' }
];

@Component({
    selector: 'types-candlestick-ohlc-wti-crude-oil-cl1-2024-weekly-ohlc-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>variant="ohlc"</i> renders each period as a vertical range line with open and close ticks, no filled body. <i>ChartAnnotation</i> pins four policy decision dates along the X-axis. <i>ChartReferenceBand</i> shades a volatility
                spike. <i>ChartZoom</i> is enabled for range focusing.
            </p>
            <p>#### SvgOhlcCrudeOilDemo.ts</p>
            <p>#### crudeOil.ts</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 460px">
                <p-chart-svg [animation]="{ duration: 500 }">
                    <p-chart-candlestick [data]="data" categoryXField="ts" openField="open" highField="high" lowField="low" closeField="close" variant="ohlc" upColor="#10a981" downColor="#e5484d" [wickStrokeWidth]="1.3" [barWidthRatio]="0.55" />
                    <p-chart-reference-band [x1]="volatilitySpike.start" [x2]="volatilitySpike.end" label="April vol spike" fill="#ff7a66" [fillOpacity]="0.08" labelPosition="start" />
                    <p-chart-annotation>
                        <ng-template pChartAnnotationDef let-ctx>
                            @if (ctx.xScale && ctx.chartArea) {
                                <svg:g pointer-events="none">
                                    @for (ev of opecPins(ctx); track ev.label) {
                                        <svg:g>
                                            <svg:line [attr.x1]="ev.x" [attr.y1]="ev.y1" [attr.x2]="ev.x" [attr.y2]="ev.y2" stroke="#36b7d6" stroke-dasharray="2 3" stroke-width="1" opacity="0.55" />
                                            <svg:rect [attr.x]="ev.rx" [attr.y]="ev.ry" [attr.width]="ev.w" [attr.height]="ev.bh" rx="2" fill="#36b7d6" opacity="0.92" />
                                            <svg:text [attr.x]="ev.x" [attr.y]="ev.ty" text-anchor="middle" dominant-baseline="central" fill="#fff" [attr.font-size]="ev.fs" font-weight="600">{{ ev.label }}</svg:text>
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
                    <p-chart-title text="WTI Crude Oil (CL1) — 2024 Weekly OHLC" />
                    <p-chart-caption text="NYMEX front-month · OPEC+ policy decisions pinned along the X-axis · April volatility band highlights the geopolitical spike" />
                    <p-chart-export-menu filename="wti-crude-2024-weekly" />
                    <p-chart-accessibility />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OhlcWtiCrudeOilCl12024WeeklyOhlcDoc {
    readonly data = crudeOil;
    readonly volatilitySpike = VOLATILITY_SPIKE;
    readonly formatPrice = (v: TickValue) => `$${Number(v).toFixed(0)}`;

    opecPins(ctx: AnnotationContext) {
        const xScale = ctx.xScale!;
        const area = ctx.chartArea;
        const fs = ctx.responsive.pick({ xs: 7, sm: 8, md: 9 });
        const bh = ctx.responsive.pick({ xs: 11, sm: 12, md: 14 });
        const charW = ctx.responsive.pick({ xs: 4.4, sm: 5, md: 5.6 });
        const padX = ctx.responsive.pick({ xs: 8, sm: 9, md: 10 });

        return OPEC_EVENTS.map((ev) => {
            const x = xScale(ev.ts);

            if (x < area.x || x > area.x + area.width) return null;

            const labelY = area.y + area.height - 8;
            const w = ev.label.length * charW + padX;

            return {
                label: ev.label,
                x,
                y1: area.y,
                y2: area.y + area.height - (bh + 4),
                rx: x - w / 2,
                ry: labelY - bh / 2,
                w,
                bh,
                ty: labelY,
                fs
            };
        }).filter((p): p is NonNullable<typeof p> => p !== null);
    }

    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const item = ctx.index != null ? this.data[ctx.index] : undefined;

        if (!item) return [];

        const change = item.close - item.open;
        const pct = (change / item.open) * 100;
        const rng = item.high - item.low;
        const color = change >= 0 ? '#10a981' : '#e5484d';

        return [
            { label: 'Open', value: `$${item.open.toFixed(2)}` },
            { label: 'High', value: `$${item.high.toFixed(2)}` },
            { label: 'Low', value: `$${item.low.toFixed(2)}` },
            { label: 'Close', value: `$${item.close.toFixed(2)}` },
            { label: 'Δ Week', value: `${change >= 0 ? '+' : ''}$${Math.abs(change).toFixed(2)} (${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%)`, color },
            { label: 'Range', value: `$${rng.toFixed(2)}` }
        ];
    };
}

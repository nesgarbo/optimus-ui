import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type AnnotationContext, type TickValue, type TooltipRenderContext } from '@openng/optimus-ui/charts';
import { oilPrices } from '@/doc/charts/data/oilPrices';

const EVENTS = [
    { year: '2008', label: 'GFC peak $147' },
    { year: '2014', label: 'OPEC supply flood' },
    { year: '2020', label: 'COVID crash $9' },
    { year: '2022', label: 'Ukraine war spike' }
];

@Component({
    selector: 'types-line-area-range-brent-crude-oil-annual-price-range-2005-to-2023-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>ChartRange</i> fills the gap between annual high and low prices to show year-by-year volatility. Three <i>ChartReferenceBand</i> layers mark the affordable, moderate, and shock price zones; <i>ChartAnnotation</i> event lines call
                out each major price shock. The tooltip reports the annual high, low, average, and spread for any hovered year. Drag the <i>ChartNavigator</i> to focus on any multi-year window.
            </p>
            <p>#### SvgRangeOilDemo.ts</p>
            <p>#### oilPrices.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 600, easing: 'easeOutCubic' }">
                        <p-chart-range color="#ff7a66" [fillOpacity]="0.18">
                            <p-chart-line [data]="data" categoryXField="year" valueYField="high" name="Annual High" color="#ffad5a" [fillOpacity]="0" curve="smooth" [lineStrokeWidth]="1.5" />
                            <p-chart-line [data]="data" categoryXField="year" valueYField="low" name="Annual Low" color="#ffd166" [fillOpacity]="0" curve="smooth" [lineStrokeWidth]="1.5" />
                        </p-chart-range>
                        <p-chart-line [data]="data" categoryXField="year" valueYField="avg" name="Annual Avg" color="#E2E8F0" [fillOpacity]="0" curve="smooth" [lineStrokeWidth]="2.5" />
                        <p-chart-reference-band [y1]="100" [y2]="150" fill="#e5484d" [fillOpacity]="0.04" />
                        <p-chart-reference-band [y1]="50" [y2]="100" fill="#ffad5a" [fillOpacity]="0.04" />
                        <p-chart-reference-band [y1]="0" [y2]="50" fill="#10a981" [fillOpacity]="0.04" />
                        <p-chart-annotation>
                            <ng-template pChartAnnotationDef let-ctx>
                                @if (ctx.xScale && ctx.chartArea) {
                                    <svg:g>
                                        @for (ev of eventPins(ctx); track ev.year) {
                                            <svg:g>
                                                <svg:line [attr.x1]="ev.x" [attr.y1]="ev.y1" [attr.x2]="ev.x" [attr.y2]="ev.y2" [attr.stroke]="ctx.textColor" stroke-opacity="0.18" stroke-dasharray="3 3" stroke-width="1" />
                                                <svg:text [attr.x]="ev.tx" [attr.y]="ev.ty" opacity="0.5" font-size="10" dominant-baseline="middle">{{ ev.label }}</svg:text>
                                            </svg:g>
                                        }
                                    </svg:g>
                                }
                            </ng-template>
                        </p-chart-annotation>
                        <p-chart-tooltip mode="shared">
                            <ng-template pChartTooltipDef let-ctx>
                                @if (ctx.allSeries) {
                                    <div
                                        style="padding: 10px 14px; min-width: 200px; background: var(--p-popover-background, var(--p-content-background)); backdrop-filter: blur(12px); border-radius: 8px; border: 1px solid var(--p-content-border-color); color: var(--p-text-color)"
                                    >
                                        <div style="font-weight: 600; font-size: 13px; margin-bottom: 8px; opacity: 0.85">{{ ctx.label }}</div>
                                        <div style="display: flex; justify-content: space-between; font-size: 12px">
                                            <span style="opacity: 0.6">High</span>
                                            <span style="font-weight: 600; color: #ffad5a">\${{ high(ctx) }}</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 3px">
                                            <span style="opacity: 0.6">Low</span>
                                            <span style="font-weight: 600; color: #ffd166">\${{ low(ctx) }}</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 3px">
                                            <span style="opacity: 0.6">Average</span>
                                            <span style="font-weight: 600">\${{ avg(ctx) }}</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 6px; padding-top: 6px; border-top: 1px solid var(--p-content-border-color)">
                                            <span style="opacity: 0.6">Annual range</span>
                                            <span style="font-weight: 600; color: #ff7a66">\${{ spread(ctx) }}/bbl</span>
                                        </div>
                                    </div>
                                }
                            </ng-template>
                        </p-chart-tooltip>
                        <p-chart-hover />
                        <p-chart-x-axis />
                        <p-chart-y-axis [tickCount]="7" [tickFormat]="formatDollar" />
                        <p-chart-zoom mode="x" />
                        <p-chart-navigator />
                        <p-chart-title text="Brent crude oil annual price range 2005–2023" />
                        <p-chart-caption text="Source: EIA · Brent crude spot price · USD per bbl · Shaded band = annual high–low range · Drag to zoom" />
                        <p-chart-export-menu filename="brent-crude-annual-range-2005-2023" />
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
export class LineAreaRangeBrentCrudeOilAnnualPriceRange2005To2023Doc {
    readonly data = oilPrices;
    readonly formatDollar = (v: TickValue) => `$${v}`;

    eventPins(ctx: AnnotationContext) {
        const xScale = ctx.xScale!;
        const area = ctx.chartArea;

        return EVENTS.map((ev) => {
            const x = xScale(ev.year);

            return {
                year: ev.year,
                label: ev.label,
                x,
                y1: area.y,
                y2: area.y + area.height,
                tx: x + 4,
                ty: area.y + 14
            };
        });
    }

    high(ctx: TooltipRenderContext): number {
        return ctx.allSeries?.find((r) => r.name === 'Annual High')?.value ?? 0;
    }

    low(ctx: TooltipRenderContext): number {
        return ctx.allSeries?.find((r) => r.name === 'Annual Low')?.value ?? 0;
    }

    avg(ctx: TooltipRenderContext): number {
        return ctx.allSeries?.find((r) => r.name === 'Annual Avg')?.value ?? 0;
    }

    spread(ctx: TooltipRenderContext): number {
        return this.high(ctx) - this.low(ctx);
    }
}

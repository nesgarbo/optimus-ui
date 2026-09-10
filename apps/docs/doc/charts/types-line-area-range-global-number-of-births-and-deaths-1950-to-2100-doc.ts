import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type BoxArea, type TickValue, type TooltipRenderContext } from '@openng/optimus-ui/charts';
import { birthsDeaths } from '@/doc/charts/data/birthsDeaths';

const PROJECTION_DASH = [4, 4];
const CATEGORIES = birthsDeaths.map((d) => d.year);

@Component({
    selector: 'types-line-area-range-global-number-of-births-and-deaths-1950-to-2100-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Omitting <i>color</i> on <i>ChartRange</i> enables dual-color mode: each line's color fills the region where that series leads. <i>ChartAnnotation</i> labels mark both series, the growth and decline regions, and the crossover point.
                The tooltip computes the natural increase or decrease for each hovered year.
            </p>
            <p>#### SvgRangeBirthsDeathsDemo.ts</p>
            <p>#### birthsDeaths.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 700, easing: 'easeOutCubic' }">
                        <p-chart-range [fillOpacity]="0.18">
                            <p-chart-line [data]="data" categoryXField="year" valueYField="births" name="Births" color="#5daeea" [fillOpacity]="0" [lineStrokeWidth]="2" [segmentDash]="segmentDash" />
                            <p-chart-line [data]="data" categoryXField="year" valueYField="deaths" name="Deaths" color="#e5484d" [fillOpacity]="0" [lineStrokeWidth]="2" [segmentDash]="segmentDash" />
                        </p-chart-range>
                        <p-chart-annotation>
                            <ng-template pChartAnnotationDef let-ctx>
                                @if (ctx.yScale) {
                                    <svg:g>
                                        <svg:text [attr.x]="categoryX('1960', ctx.chartArea)" [attr.y]="ctx.yScale(123) - 14" fill="#5daeea" font-size="15" font-weight="700" text-anchor="start">Births</svg:text>
                                        <svg:text [attr.x]="categoryX('1962', ctx.chartArea)" [attr.y]="ctx.yScale(48) + 20" fill="#e5484d" font-size="15" font-weight="700" text-anchor="start">Deaths</svg:text>
                                        <svg:text [attr.x]="categoryX('1995', ctx.chartArea)" [attr.y]="ctx.yScale(90)" font-size="13" opacity="0.35" text-anchor="middle" dominant-baseline="middle">Population increase</svg:text>
                                        <svg:text [attr.x]="categoryX('2080', ctx.chartArea) - 4" [attr.y]="ctx.yScale(119) - 14" font-size="11" opacity="0.35" text-anchor="end" dominant-baseline="middle">Decrease projected</svg:text>
                                        <svg:circle [attr.cx]="categoryX('2089', ctx.chartArea)" [attr.cy]="ctx.yScale(120)" r="4" fill="#94a3b8" opacity="0.5" />
                                    </svg:g>
                                }
                            </ng-template>
                        </p-chart-annotation>
                        <p-chart-tooltip mode="shared" crosshair>
                            <ng-template pChartTooltipDef let-ctx>
                                @if (ctx.allSeries) {
                                    <div
                                        style="padding: 10px 14px; min-width: 200px; background: var(--p-popover-background, var(--p-content-background)); backdrop-filter: blur(12px); border-radius: 8px; border: 1px solid var(--p-content-border-color); color: var(--p-text-color)"
                                    >
                                        <div style="font-weight: 600; font-size: 13px; margin-bottom: 8px; opacity: 0.85">{{ ctx.label }}</div>
                                        <div style="display: flex; justify-content: space-between; font-size: 12px">
                                            <span style="display: flex; align-items: center; gap: 6px; opacity: 0.75">
                                                <span style="width: 8px; height: 8px; border-radius: 2px; background: #5daeea; flex-shrink: 0"></span>
                                                Births
                                            </span>
                                            <span style="font-weight: 600">{{ births(ctx) }}M</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 3px">
                                            <span style="display: flex; align-items: center; gap: 6px; opacity: 0.75">
                                                <span style="width: 8px; height: 8px; border-radius: 2px; background: #e5484d; flex-shrink: 0"></span>
                                                Deaths
                                            </span>
                                            <span style="font-weight: 600">{{ deaths(ctx) }}M</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 6px; padding-top: 6px; border-top: 1px solid var(--p-content-border-color)">
                                            <span style="opacity: 0.6">{{ diff(ctx) >= 0 ? 'Natural increase' : 'Natural decrease' }}</span>
                                            <span [style.font-weight]="600" [style.color]="diff(ctx) >= 0 ? '#5daeea' : '#e5484d'">{{ diff(ctx) >= 0 ? '+' : '' }}{{ diffRounded(ctx) }}M</span>
                                        </div>
                                    </div>
                                }
                            </ng-template>
                        </p-chart-tooltip>
                        <p-chart-hover />
                        <p-chart-x-axis />
                        <p-chart-y-axis [tickCount]="7" [tickFormat]="formatMillions" [chartPaddingMin]="0.1" />
                        <p-chart-title text="Global number of births and deaths" />
                        <p-chart-caption text="Source: United Nations — Population Division (2022) · Historical estimates + medium variant projections · Blue fill = population increase · Red fill = projected decrease" />
                        <p-chart-export-menu filename="global-births-deaths-1950-2100" />
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
export class LineAreaRangeGlobalNumberOfBirthsAndDeaths1950To2100Doc {
    readonly data = birthsDeaths;
    readonly segmentDash = (ctx: { p0: { category: string }; p1: { category: string } }) => {
        if (Number(ctx.p0.category) >= 2026 && Number(ctx.p1.category) >= 2026) return PROJECTION_DASH;

        return undefined;
    };
    readonly formatMillions = (v: TickValue) => `${v} million`;

    categoryX(year: string, area: BoxArea): number {
        const i = CATEGORIES.indexOf(year);

        return area.x + (i / (CATEGORIES.length - 1)) * area.width;
    }

    births(ctx: TooltipRenderContext): number {
        return ctx.allSeries?.find((r) => r.name === 'Births')?.value ?? 0;
    }

    deaths(ctx: TooltipRenderContext): number {
        return ctx.allSeries?.find((r) => r.name === 'Deaths')?.value ?? 0;
    }

    diff(ctx: TooltipRenderContext): number {
        return this.births(ctx) - this.deaths(ctx);
    }

    diffRounded(ctx: TooltipRenderContext): number {
        return Math.round(this.diff(ctx) * 10) / 10;
    }
}

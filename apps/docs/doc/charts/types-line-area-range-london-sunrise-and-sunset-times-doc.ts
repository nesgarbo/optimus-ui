import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type BoxArea, type TickValue } from '@openng/optimus-ui/charts';
import { daylight } from '@/doc/charts/data/daylight';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

@Component({
    selector: 'types-line-area-range-london-sunrise-and-sunset-times-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>ChartRange</i> fills the gap between the sunrise and sunset lines to show the daylight window across a full year. The Y-axis formatter converts decimal hours to HH:MM so the axis reads as clock time. A <i>ChartReferenceLine</i> at
                noon and a <i>ChartReferenceBand</i> for the long-evening window add context. <i>ChartAnnotation</i> prints the solstice durations directly on the chart at the June and December extremes.
            </p>
            <p>#### SvgRangeDaylightDemo.ts</p>
            <p>#### daylight.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 700, easing: 'easeOutCubic' }">
                        <p-chart-range color="#ffad5a" [fillOpacity]="0.22">
                            <p-chart-line [data]="data" categoryXField="month" valueYField="sunset" name="Sunset" color="#ff7a66" [fillOpacity]="0" curve="smooth" [lineStrokeWidth]="2" />
                            <p-chart-line [data]="data" categoryXField="month" valueYField="sunrise" name="Sunrise" color="#6bbbed" [fillOpacity]="0" curve="smooth" [lineStrokeWidth]="2" />
                        </p-chart-range>
                        <p-chart-reference-line [y]="12" label="Noon" stroke="#5daeea" [lineDash]="[4, 3]" labelPosition="start" />
                        <p-chart-reference-band [y1]="20" [y2]="22" fill="#ffad5a" [fillOpacity]="0.08" />
                        <p-chart-annotation>
                            <ng-template pChartAnnotationDef let-ctx>
                                @if (ctx.yScale) {
                                    <svg:g>
                                        <svg:text [attr.x]="monthX('Jun', ctx.chartArea)" [attr.y]="(ctx.yScale(4.75) + ctx.yScale(21.33)) / 2 - 9" fill="#ffad5a" font-size="11" font-weight="700" text-anchor="middle" dominant-baseline="middle">
                                            16h 35m
                                        </svg:text>
                                        <svg:text [attr.x]="monthX('Jun', ctx.chartArea)" [attr.y]="(ctx.yScale(4.75) + ctx.yScale(21.33)) / 2 + 7" font-size="10" text-anchor="middle" dominant-baseline="middle" opacity="0.5">
                                            Summer solstice
                                        </svg:text>
                                        <svg:text [attr.x]="monthX('Dec', ctx.chartArea) - 4" [attr.y]="(ctx.yScale(8.08) + ctx.yScale(15.92)) / 2 - 9" fill="#6bbbed" font-size="11" font-weight="700" text-anchor="end" dominant-baseline="middle">
                                            7h 50m
                                        </svg:text>
                                        <svg:text [attr.x]="monthX('Dec', ctx.chartArea) - 4" [attr.y]="(ctx.yScale(8.08) + ctx.yScale(15.92)) / 2 + 7" font-size="10" text-anchor="end" dominant-baseline="middle" opacity="0.5">
                                            Winter solstice
                                        </svg:text>
                                    </svg:g>
                                }
                            </ng-template>
                        </p-chart-annotation>
                        <p-chart-tooltip mode="shared" />
                        <p-chart-hover />
                        <p-chart-x-axis />
                        <p-chart-y-axis [tickCount]="7" [min]="3" [max]="23" [tickFormat]="formatHour" />
                        <p-chart-title text="London sunrise & sunset times" />
                        <p-chart-caption text="Source: timeanddate.com · London (51.5 °N) · Monthly averages · Amber band = after 20:00 summer evenings" />
                        <p-chart-export-menu filename="london-sunrise-sunset" />
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
export class LineAreaRangeLondonSunriseAndSunsetTimesDoc {
    readonly data = daylight;
    readonly formatHour = (v: TickValue) => {
        const hh = Math.floor(v as number);
        const mm = Math.round(((v as number) - hh) * 60);

        return `${hh}:${mm.toString().padStart(2, '0')}`;
    };

    monthX(name: string, area: BoxArea): number {
        const i = MONTHS.indexOf(name);

        return area.x + (i / (MONTHS.length - 1)) * area.width;
    }
}

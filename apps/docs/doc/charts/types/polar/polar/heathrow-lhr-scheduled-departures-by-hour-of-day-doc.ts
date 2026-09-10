import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { heathrowHourly as data, type HourSlot, MAX } from '@/doc/charts/data/heathrowHourly';

@Component({
    selector: 'types-polar-polar-heathrow-lhr-scheduled-departures-by-hour-of-day-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                The <i>colors</i> input receives a 3-stop RGB function mapping quiet shoulder hours to sky-blue, mid-range to gold, and peaks to deep amber, so magnitude is encoded in both bar length and hue. <i>[innerRadius]="0.22"</i> opens a donut
                hole that prevents the shortest bars from disappearing; <i>[gridLines]="2"</i> reduces concentric rings to two so the color gradient carries the story. The custom tooltip calls out the curfew window explicitly rather than showing a
                zero count.
            </p>
            <p>#### SvgPolarHeathrowHourlyDemo.ts</p>
            <p>#### heathrowHourly.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 700 }">
                        <p-chart-polar [data]="data" categoryXField="hour" valueYField="flights" [color]="barColor" [innerRadius]="0.22" />
                        <p-chart-x-axis />
                        <p-chart-y-axis [tickCount]="2" [gridOpacity]="0.35" />
                        <p-chart-tooltip />
                        <p-chart-hover [brightness]="1.1" />
                        <p-chart-title text="Heathrow LHR — scheduled departures by hour of day" />
                        <p-chart-caption text="Morning long-haul push (06:00–09:00) and trans-Atlantic wave (14:00–17:00) are the two bright arcs · curfew silences 23:30–06:00 · Source: Heathrow Airport Ltd." />
                        <p-chart-export-menu filename="heathrow-hourly-departures-2023" />
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
export class PolarPolarHeathrowLhrScheduledDeparturesByHourOfDayDoc {
    readonly data = data;

    readonly barColor = (ctx: { datum: HourSlot }): string => {
        const flights = ctx.datum.flights;

        if (flights === 0) return 'rgba(148,163,184,0.28)';

        const t = flights / MAX;
        let r: number;
        let g: number;
        let b: number;

        if (t <= 0.5) {
            const u = t * 2;

            r = Math.round(91 + u * (245 - 91));
            g = Math.round(163 + u * (200 - 163));
            b = Math.round(224 + u * (66 - 224));
        } else {
            const u = (t - 0.5) * 2;

            r = Math.round(245 + u * (232 - 245));
            g = Math.round(200 + u * (101 - 200));
            b = Math.round(66 + u * (10 - 66));
        }

        return `rgb(${r},${g},${b})`;
    };
}

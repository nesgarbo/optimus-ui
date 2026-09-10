import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { windDirectionSpeed as data } from '@/doc/charts/data/windDirectionSpeed';

@Component({
    selector: 'types-polar-stacked-wind-speed-by-direction-morning-vs-afternoon-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>ChartStacked mode="normal"</i> wraps two <i>ChartPolar</i> children so sector length encodes combined daily energy while each segment shows its time-of-day share. The <i>color</i> array assigns teal to morning and burnt-amber to
                afternoon. Hover a sector to see the per-period breakdown in the tooltip.
            </p>
            <p>#### SvgPolarStackedDemo.ts</p>
            <p>#### windDirectionSpeed.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 700 }">
                        <p-chart-stacked>
                            <p-chart-polar [data]="data" categoryXField="direction" valueYField="afternoon" name="Afternoon" color="#ffad5a" [borderRadius]="4" [spacing]="6" />
                            <p-chart-polar [data]="data" categoryXField="direction" valueYField="morning" name="Morning" color="#5daeea" [borderRadius]="4" [spacing]="6" />
                        </p-chart-stacked>
                        <p-chart-x-axis />
                        <p-chart-y-axis [tickCount]="3" />
                        <p-chart-tooltip mode="shared" [valueFormatter]="format" />
                        <p-chart-hover [brightness]="1.08" />
                        <p-chart-legend position="bottom" />
                        <p-chart-title text="Wind Speed by Direction — Morning vs Afternoon" />
                        <p-chart-caption text="SW and W quadrants carry over a third of daily wind energy · morning drives most of the southwesterly flow · 30-day average, km/h" />
                        <p-chart-export-menu filename="wind-direction-stacked-polar" />
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
export class PolarStackedWindSpeedByDirectionMorningVsAfternoonDoc {
    readonly data = data;
    readonly format = (v: number) => `${v} km/h`;
}

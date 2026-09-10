import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { ukRenewables as data } from '@/doc/charts/data/ukRenewables';

@Component({
    selector: 'types-polar-stacked-uk-grid-monthly-renewable-generation-by-source-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Three <i>ChartPolar</i> series inside a single <i>ChartStacked</i> wrapper stack hydro, solar, and wind concentrically for each of the 12 months. The chart's shape reveals the seasonal pattern across all three sources. The
                <i>mode="shared"</i> tooltip breaks each month down into all three sources with per-source percentage bars.
            </p>
            <p>#### SvgPolarRenewablesDemo.ts</p>
            <p>#### ukRenewables.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 750 }">
                        <p-chart-stacked>
                            <p-chart-polar [data]="data" categoryXField="month" valueYField="hydro" name="Hydro" color="#36b7d6" [borderRadius]="4" [spacing]="6" />
                            <p-chart-polar [data]="data" categoryXField="month" valueYField="solar" name="Solar" color="#ffad5a" [borderRadius]="4" [spacing]="6" />
                            <p-chart-polar [data]="data" categoryXField="month" valueYField="wind" name="Wind" color="#7c8cff" [borderRadius]="4" [spacing]="6" />
                        </p-chart-stacked>
                        <p-chart-x-axis />
                        <p-chart-y-axis [tickCount]="3" [gridOpacity]="0.28" />
                        <p-chart-tooltip mode="shared" [valueFormatter]="format" />
                        <p-chart-hover [brightness]="1.08" />
                        <p-chart-legend position="bottom" />
                        <p-chart-title text="UK Grid — Monthly Renewable Generation by Source" />
                        <p-chart-caption text="Wind and solar are natural complements — Atlantic storms peak as solar fades each winter, summer reverses the split · hydro holds steady year-round · TWh, illustrative from National Grid ESO data" />
                        <p-chart-export-menu filename="uk-renewables-monthly" />
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
export class PolarStackedUkGridMonthlyRenewableGenerationBySourceDoc {
    readonly data = data;
    readonly format = (v: number) => `${v} TWh`;
}

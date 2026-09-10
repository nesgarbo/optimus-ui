import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { electricityMixByCountry as data } from '@/doc/charts/data/electricityMixByCountry';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-column-bar-stacked-electricity-generation-mix-by-country-2023-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>mode="percent"</i> on <i>ChartStacked</i> normalizes each country to 100%, making grid compositions directly comparable regardless of total generation volume. The <i>ChartTooltip</i> filters out zero-value sources so phased-out
                energy types don't clutter the popup.
            </p>
            <p>#### SvgBarElectricityMixDemo.ts</p>
            <p>#### electricityMixByCountry.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-stacked mode="percent">
                            <p-chart-bar [data]="data" categoryXField="country" valueYField="coal" name="Coal" [color]="COLORS.coal" />
                            <p-chart-bar [data]="data" categoryXField="country" valueYField="gas" name="Natural Gas" [color]="COLORS.gas" />
                            <p-chart-bar [data]="data" categoryXField="country" valueYField="nuclear" name="Nuclear" [color]="COLORS.nuclear" />
                            <p-chart-bar [data]="data" categoryXField="country" valueYField="hydro" name="Hydro" [color]="COLORS.hydro" />
                            <p-chart-bar [data]="data" categoryXField="country" valueYField="windSolar" name="Wind & Solar" [color]="COLORS.windSolar" />
                            <p-chart-bar [data]="data" categoryXField="country" valueYField="other" name="Other" [color]="COLORS.other" />
                        </p-chart-stacked>
                        <p-chart-tooltip mode="shared" [valueFormatter]="valueFormatter" />
                        <p-chart-legend position="top" />
                        <p-chart-hover />
                        <p-chart-x-axis />
                        <p-chart-y-axis [tickFormat]="tickFormat" />
                        <p-chart-title text="Electricity generation mix by country, 2023" />
                        <p-chart-caption text="Share of total electricity generation (%) · Source: Ember Global Electricity Review 2024" />
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
export class ColumnBarStackedElectricityGenerationMixByCountry2023Doc {
    readonly valueFormatter = (v: number) => `${Math.round(v)}%`;
    readonly tickFormat = (v: string | number | Date) => `${v}%`;

    readonly data = data;
    readonly COLORS = {
        coal: '#94a3b8',
        gas: '#ffad5a',
        nuclear: '#7c8cff',
        hydro: '#5daeea',
        windSolar: '#10a981',
        other: '#94a3b8'
    };
}

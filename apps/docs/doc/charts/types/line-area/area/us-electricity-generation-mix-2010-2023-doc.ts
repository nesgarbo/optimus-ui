import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { usElectricityGeneration } from '@/doc/charts/data/usElectricityGeneration';

const COLORS = {
    natural_gas: '#5daeea',
    coal: '#94a3b8',
    nuclear: '#ffad5a',
    renewables: '#10a981'
};

@Component({
    selector: 'types-line-area-area-us-electricity-generation-mix-2010-2023-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Four series inside <i>ChartStacked</i> build up the total generation mix year by year. <i>curve="smooth"</i> and <i>fillOpacity="0.85"</i> give the layers a blended look. <i>ChartLegend</i> toggles any source on or off, and the
                <i>show-all</i> tooltip reports every source's TWh contribution plus the annual total.
            </p>
            <p>#### SvgAreaElectricityMixDemo.ts</p>
            <p>#### usElectricityGeneration.ts</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 460px">
                <p-chart-svg [animation]="{ duration: 700 }">
                    <p-chart-stacked>
                        <p-chart-line [data]="data" categoryXField="year" valueYField="renewables" name="Renewables" [color]="colors.renewables" curve="smooth" [fillOpacity]="0.85" />
                        <p-chart-line [data]="data" categoryXField="year" valueYField="nuclear" name="Nuclear" [color]="colors.nuclear" curve="smooth" [fillOpacity]="0.85" />
                        <p-chart-line [data]="data" categoryXField="year" valueYField="coal" name="Coal" [color]="colors.coal" curve="smooth" [fillOpacity]="0.85" />
                        <p-chart-line [data]="data" categoryXField="year" valueYField="natural_gas" name="Natural Gas" [color]="colors.natural_gas" curve="smooth" [fillOpacity]="0.85" />
                    </p-chart-stacked>
                    <p-chart-tooltip mode="shared" [valueFormatter]="formatTwh" />
                    <p-chart-legend />
                    <p-chart-hover />
                    <p-chart-x-axis />
                    <p-chart-y-axis [tickCount]="6" />
                    <p-chart-title text="US electricity generation by source 2010–2023" />
                    <p-chart-caption text="Source: U.S. Energy Information Administration · Electric Power Monthly · Annual TWh" />
                    <p-chart-export-menu filename="us-electricity-generation-mix" />
                    <p-chart-accessibility />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AreaUsElectricityGenerationMix20102023Doc {
    readonly data = usElectricityGeneration;
    readonly colors = COLORS;
    readonly formatTwh = (v: number) => `${v.toLocaleString()} TWh`;
}

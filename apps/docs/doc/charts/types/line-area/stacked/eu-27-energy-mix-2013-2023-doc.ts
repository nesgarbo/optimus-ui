import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { euEnergyMix } from '@/doc/charts/data/euEnergyMix';

@Component({
    selector: 'types-line-area-stacked-eu-27-energy-mix-2013-2023-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>mode="percent"</i> on <i>ChartStacked</i> to normalize all sources to 100% per year, which makes the structural shift visible regardless of how total generation changed. The tooltip reports both the raw Mtoe value and the
                percentage share for each source, making the shift readable in absolute or relative terms.
            </p>
            <p>#### SvgStackedEuEnergyMixDemo.ts</p>
            <p>#### euEnergyMix.ts</p>
        </app-docsectiontext>
        <div class="card">
            <div class="energy-mix-chart" style="height: 460px">
                <p-chart-svg [animation]="{ duration: 600 }">
                    <p-chart-stacked mode="percent">
                        <p-chart-line [data]="data" categoryXField="year" valueYField="renewables" name="Renewables" [order]="0" curve="smooth" [fillOpacity]="0.6" />
                        <p-chart-line [data]="data" categoryXField="year" valueYField="nuclear" name="Nuclear" [order]="1" curve="smooth" [fillOpacity]="0.6" />
                        <p-chart-line [data]="data" categoryXField="year" valueYField="gas" name="Natural Gas" [order]="2" curve="smooth" [fillOpacity]="0.6" />
                        <p-chart-line [data]="data" categoryXField="year" valueYField="oil" name="Oil" [order]="3" curve="smooth" [fillOpacity]="0.6" />
                        <p-chart-line [data]="data" categoryXField="year" valueYField="coal" name="Coal" [order]="4" curve="smooth" [fillOpacity]="0.6" />
                    </p-chart-stacked>
                    <p-chart-tooltip mode="shared" [valueFormatter]="mtoe" />
                    <p-chart-legend position="right" />
                    <p-chart-hover />
                    <p-chart-x-axis />
                    <p-chart-y-axis [tickCount]="6" />
                    <p-chart-title text="EU-27 energy mix 2013–2023 (100% stacked)" />
                    <p-chart-caption text="Source: Eurostat · Energy Balances · nrg_bal_c · Primary energy consumption in Mtoe" />
                    <p-chart-export-menu filename="eu-energy-mix-percent-stacked" />
                    <p-chart-accessibility />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StackedEu27EnergyMix20132023Doc {
    readonly data = euEnergyMix;
    readonly mtoe = (v: number) => `${v} Mtoe`;
}

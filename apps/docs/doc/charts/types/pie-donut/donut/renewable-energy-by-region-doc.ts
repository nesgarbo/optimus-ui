import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type ResponsiveRule, type TooltipRow } from '@openng/optimus-ui/charts';
import { renewableEnergy } from '@/doc/charts/data/renewableEnergy';

const GLOBAL_AVG = 19.7;

@Component({
    selector: 'types-pie-donut-donut-renewable-energy-by-region-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                A sequential green <i>color</i> ramp encodes share magnitude so the largest consumers stand out visually. <i>ChartAnnotation</i> keeps the global average anchored inside the hole as the buttons switch between years. Hover to see the
                tooltip report each region's deviation from that average.
            </p>
            <p>#### SvgDonutRenewableEnergyDemo.ts</p>
            <p>#### renewableEnergy.ts</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 460px">
                <p-chart-svg [responsive]="true" [animation]="{ duration: 400 }">
                    <p-chart-pie id="renewable" [data]="data" valueField="share" categoryField="region" [color]="colors" [innerRadius]="0.55" [spacing]="2" [borderRadius]="3" />
                    <p-chart-annotation>
                        <ng-template pChartAnnotationDef let-ctx>
                            <svg:g text-anchor="middle">
                                <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y - 28" dy="4" font-size="11" opacity="0.45" dominant-baseline="auto">World Avg</svg:text>
                                <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y" dy="9" font-size="26" font-weight="bold" fill="#10a981" dominant-baseline="auto">{{ globalAvg.toFixed(1) }}%</svg:text>
                                <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y + 28" dy="4" font-size="11" opacity="0.45" dominant-baseline="auto">Renewable</svg:text>
                            </svg:g>
                        </ng-template>
                    </p-chart-annotation>
                    <p-chart-data-labels display="label-percentage" [minPercentage]="3" alignTo="edge" />
                    <p-chart-responsive [rules]="labelRules" />
                    <p-chart-tooltip [valueFormatter]="tooltipRows" />
                    <p-chart-hover [offset]="6" [brightness]="1.08" />
                    <p-chart-title text="Renewable energy share by region" />
                    <p-chart-caption text="Source: World Bank Open Data · Indicator EG.FEC.RNEW.ZS · 2020" />
                    <p-chart-export-menu filename="renewable-energy-by-region" />
                    <p-chart-accessibility />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DonutRenewableEnergyByRegionDoc {
    readonly data = renewableEnergy;
    readonly globalAvg = GLOBAL_AVG;
    readonly colors = ['#b9f4ee', '#7ee4d8', '#4ecdc4', '#10a981', '#5ccf9f', '#36b7d6', '#5daeea'];
    readonly labelRules: ResponsiveRule[] = [{ maxWidth: 580, props: { dataLabels: { minPercentage: 7 } } }];

    readonly tooltipRows = (value: number): TooltipRow[] => {
        const diff = value - GLOBAL_AVG;
        const arrow = diff >= 0 ? '▲' : '▼';

        return [
            { label: 'Renewable share (2020)', value: `${value.toFixed(1)}%` },
            { label: 'vs World Avg', value: `${arrow} ${diff >= 0 ? '+' : ''}${diff.toFixed(1)}pp`, color: diff >= 0 ? '#10a981' : '#e5484d' }
        ];
    };
}

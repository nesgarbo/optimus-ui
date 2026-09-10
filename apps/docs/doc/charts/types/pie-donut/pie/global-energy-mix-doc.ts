import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { energyMix } from '@/doc/charts/data/energyMix';

const categoryColor: Record<string, string> = {
    'Fossil fuel': '#ffad5a',
    Renewable: '#10a981',
    Nuclear: '#7c8cff'
};

@Component({
    selector: 'types-pie-donut-pie-global-energy-mix-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                The <i>color</i> array maps each energy category to a semantic hue: fossil fuels in warm risk tones, renewables in green, nuclear in periwinkle. <i>ChartAnnotation</i> pins a combined-share figure directly inside the chart so the key
                insight is visible without hovering.
            </p>
            <p>#### SvgPieEnergyMixDemo.ts</p>
            <p>#### energyMix.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-pie [data]="data" valueField="pct" categoryField="source" [color]="colors" [startAngle]="-90" sort="value-desc" [spacing]="2" [borderRadius]="3" />
                        <p-chart-data-labels display="both" lineStyle="angled" [minPercentage]="4" [fontSize]="11" />
                        <p-chart-annotation>
                            <ng-template pChartAnnotationDef let-ctx>
                                <svg:g>
                                    <svg:rect [attr.x]="ctx.chartArea.x + 14" [attr.y]="ctx.chartArea.y + ctx.chartArea.height - 38" width="262" height="24" rx="5" fill="rgba(245,158,11,0.1)" stroke="rgba(245,158,11,0.35)" stroke-width="1" />
                                    <svg:text [attr.x]="ctx.chartArea.x + 24" [attr.y]="ctx.chartArea.y + ctx.chartArea.height - 26" dominant-baseline="central" font-size="11">
                                        <svg:tspan opacity="0.65">Fossil fuels (oil + coal + gas)</svg:tspan>
                                        <svg:tspan dx="6" font-weight="bold" fill="#ffad5a">81.1% combined</svg:tspan>
                                    </svg:text>
                                </svg:g>
                            </ng-template>
                        </p-chart-annotation>
                        <p-chart-legend position="bottom" />
                        <p-chart-tooltip [valueFormatter]="tooltipRows" />
                        <p-chart-hover [offset]="6" [brightness]="1.08" />
                        <p-chart-title text="Global primary energy consumption by source" />
                        <p-chart-caption text="Source: Energy Institute Statistical Review of World Energy 2024 · Our World in Data" />
                        <p-chart-export-menu filename="global-energy-mix-2024" />
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
export class PieDonutPieGlobalEnergyMixDoc {
    readonly data = energyMix;
    readonly colors = ['#ffad5a', '#b23b4b', '#ffd166', '#36b7d6', '#7c8cff', '#10a981', '#9ccc3c', '#4ecdc4'];

    readonly tooltipRows = (value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const item = this.data[ctx.index!];
        const catColor = categoryColor[item?.category ?? ''] ?? ctx.color;

        return [
            { label: 'Share', value: `${(ctx.percentage ?? value).toFixed(1)}%` },
            { label: 'Category', value: item?.category ?? '', color: catColor }
        ];
    };
}

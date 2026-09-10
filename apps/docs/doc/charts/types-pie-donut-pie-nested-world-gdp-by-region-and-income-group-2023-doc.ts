import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { incomeData, regionData } from '@/doc/charts/data/nestedGdp';

const WORLD_TOTAL = 109.0;

const REGION_COLORS: Record<string, string> = {
    'East Asia & Pacific': '#5daeea',
    'North America': '#36b7d6',
    'Europe & Central Asia': '#7c8cff',
    'Latin America & Caribbean': '#4ecdc4',
    'South Asia': '#ffad5a',
    'Middle East & N. Africa': '#ffd166',
    'Sub-Saharan Africa': '#ff7a66'
};

const INCOME_SHADES: Record<string, [string, string, string, string]> = {
    'East Asia & Pacific': ['#2176ff', '#5daeea', '#8fcfff', '#bfe8ff'],
    'North America': ['#0f8fb0', '#36b7d6', '#7edfff', '#b9f3ff'],
    'Europe & Central Asia': ['#4f5fe8', '#7c8cff', '#b6c0ff', '#d8ddff'],
    'Latin America & Caribbean': ['#0f9f99', '#4ecdc4', '#8cece3', '#b9f4ee'],
    'South Asia': ['#e8752d', '#ffad5a', '#ffd18c', '#ffe3b8'],
    'Middle East & N. Africa': ['#d4a72c', '#ffd166', '#ffe59a', '#fff0bf'],
    'Sub-Saharan Africa': ['#d95c51', '#ff7a66', '#ffae9f', '#ffd3cc']
};

const INCOME_SHADE_IDX: Record<string, number> = { 'High income': 0, 'Upper middle income': 1, 'Lower middle income': 2, 'Low income': 3 };
const REGION_SHORT: Record<string, string> = {
    'East Asia & Pacific': 'EAP',
    'North America': 'NA',
    'Europe & Central Asia': 'ECA',
    'Latin America & Caribbean': 'LAC',
    'South Asia': 'SA',
    'Middle East & N. Africa': 'MENA',
    'Sub-Saharan Africa': 'SSA'
};
const INCOME_SHORT: Record<string, string> = { 'High income': 'HI', 'Upper middle income': 'UM', 'Lower middle income': 'LM', 'Low income': 'LI' };

@Component({
    selector: 'types-pie-donut-pie-nested-world-gdp-by-region-and-income-group-2023-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>ChartStacked</i> layers two <i>ChartPie</i> rings: regions on the inner and income groups on the outer. The <i>color</i> array uses shade pairs, darker for high income and lighter for low, so the economic hierarchy is readable
                without a legend.
            </p>
            <p>#### SvgNestedPieGdpDemo.ts</p>
            <p>#### nestedGdp.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 900, easing: 'easeOutExpo' }">
                        <p-chart-stacked [gap]="8">
                            <p-chart-pie id="gdp-income" [data]="incomeData" valueField="gdp" categoryField="sliceId" [color]="incomeColors" [startAngle]="-90" [spacing]="2.5" [borderRadius]="3">
                                <ng-template pChartSliceDef let-ctx>
                                    @if (ctx.percentage >= 2 && incomeShort(ctx.index)) {
                                        <svg:text text-anchor="middle" dominant-baseline="middle" font-size="8" font-weight="600" fill="#fff" opacity="0.85">{{ incomeShort(ctx.index) }}</svg:text>
                                    }
                                </ng-template>
                            </p-chart-pie>
                            <p-chart-pie id="gdp-regions" [data]="regionData" valueField="gdp" categoryField="region" [color]="regionColors" [startAngle]="-90">
                                <ng-template pChartSliceDef let-ctx>
                                    @if (ctx.percentage >= 5) {
                                        <svg:text text-anchor="middle" dominant-baseline="middle" font-size="9" font-weight="600" fill="#fff" opacity="0.9">{{ regionShort(ctx.label) }}</svg:text>
                                    }
                                </ng-template>
                            </p-chart-pie>
                        </p-chart-stacked>
                        <p-chart-tooltip [valueFormatter]="tooltipRows" />
                        <p-chart-hover [brightness]="1.06" [offset]="4" />
                        <p-chart-title text="World GDP by region and income group 2023" />
                        <p-chart-caption text="Source: World Bank Open Data · NY.GDP.MKTP.CD · 2023 · Inner ring: 7 WB regions · Outer ring: income groups (dark = high income, light = low income)" />
                        <p-chart-export-menu filename="world-gdp-nested-2023" />
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
export class PieDonutPieNestedWorldGdpByRegionAndIncomeGroup2023Doc {
    readonly regionData = regionData;
    readonly incomeData = incomeData;
    readonly regionColors = regionData.map((d) => REGION_COLORS[d.region]);
    readonly incomeColors = incomeData.map((d) => INCOME_SHADES[d.region][INCOME_SHADE_IDX[d.income]]);

    regionShort(label: string): string {
        return REGION_SHORT[label] ?? '';
    }

    incomeShort(index: number): string {
        const item = incomeData[index];

        return item ? (INCOME_SHORT[item.income] ?? '') : '';
    }

    readonly tooltipRows = (value: number, ctx: TooltipValueContext): TooltipRow[] => {
        if (ctx.index === undefined) return [];

        const pct = ((value / WORLD_TOTAL) * 100).toFixed(1);
        const gdpStr = `$${value.toFixed(1)}T`;

        if (ctx.datasetId === 'gdp-income') {
            const item = incomeData[ctx.index];

            if (!item) return [];

            return [
                { label: item.region, value: item.income, color: REGION_COLORS[item.region] ?? '#6b7280' },
                { label: 'GDP', value: gdpStr },
                { label: 'World share', value: `${pct}%` }
            ];
        }

        const item = regionData[ctx.index];

        if (!item) return [];

        return [
            { label: 'Region', value: item.region, color: REGION_COLORS[item.region] ?? '#6b7280' },
            { label: 'Regional GDP', value: gdpStr },
            { label: 'World share', value: `${pct}%` }
        ];
    };
}

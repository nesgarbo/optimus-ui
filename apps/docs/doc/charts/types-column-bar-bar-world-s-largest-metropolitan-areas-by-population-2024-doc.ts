import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type ItemContext, type TickValue, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { metroPopulation as data, type Continent, type MetroRow } from '@/doc/charts/data/metroPopulation';

const CONTINENT_COLOR: Record<Continent, string> = {
    Asia: '#5daeea',
    Africa: '#ffad5a',
    'North America': '#7c8cff',
    'South America': '#5ccf9f'
};

@Component({
    selector: 'types-column-bar-bar-world-s-largest-metropolitan-areas-by-population-2024-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>categoryYField</i> and <i>valueXField</i> put categories on the Y axis, keeping long city names flush without rotation. A <i>color</i> callback assigns a distinct tint per continent, and a custom <i>render</i> on
                <i>ChartLegend</i> turns the single series into a continent swatch key. <i>sort="value-desc"</i> orders from largest to smallest, and <i>ChartDataLabels</i> uses a compact millions formatter.
            </p>
            <p>#### SvgBarMetroPopulationDemo.ts</p>
            <p>#### metroPopulation.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460" [animation]="{ duration: 700 }">
                    <p-chart-bar [data]="data" categoryYField="metro" valueXField="population" name="Metro population (millions)" [color]="barColorAccessor" [borderRadius]="3" sort="value-desc" [categoryGap]="0.3" />
                    <p-chart-data-labels display="value" [formatter]="formatMillions" [fontSize]="10" />
                    <p-chart-legend position="top" [interactive]="false">
                        <ng-template pChartLegendItemDef>
                            <span style="display: flex; align-items: center; gap: 18px">
                                @for (c of continents; track c) {
                                    <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 11px; opacity: 0.85">
                                        <span [style.background]="continentColor[c]" style="width: 9px; height: 9px; border-radius: 2px; flex-shrink: 0"></span>
                                        {{ c }}
                                    </span>
                                }
                            </span>
                        </ng-template>
                    </p-chart-legend>
                    <p-chart-tooltip [valueFormatter]="tooltipRows" />
                    <p-chart-hover />
                    <p-chart-x-axis [tickFormat]="formatAxis" />
                    <p-chart-y-axis />
                    <p-chart-title text="World's Largest Metropolitan Areas by Population, 2024" />
                    <p-chart-caption text="Population in millions · Source: UN World Urbanization Prospects" />
                    <p-chart-export-menu filename="world-largest-metro-areas-2024" />
                    <p-chart-accessibility />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnBarBarWorldSLargestMetropolitanAreasByPopulation2024Doc {
    readonly data = data;
    readonly continentColor = CONTINENT_COLOR;
    readonly continents = Object.keys(CONTINENT_COLOR) as Continent[];

    readonly barColorAccessor = ({ datum }: ItemContext): string => CONTINENT_COLOR[(datum as MetroRow).continent];
    readonly formatMillions = (v: number): string => `${Number(v).toFixed(1)}M`;
    readonly formatAxis = (v: TickValue): string => `${Number(v).toFixed(0)}M`;

    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const item = data[ctx.index!];

        if (!item) return [];

        const sortedByPop = [...data].sort((a, b) => b.population - a.population);
        const rank = sortedByPop.findIndex((d) => d.metro === item.metro) + 1;
        const growthLabel = item.growth >= 0 ? `+${item.growth.toFixed(1)}%` : `${item.growth.toFixed(1)}%`;
        const growthColor = item.growth > 0 ? '#10a981' : item.growth < 0 ? '#e5484d' : '#94a3b8';

        return [
            { label: '', value: `${item.country} · ${item.continent}` },
            { label: 'Rank', value: `#${rank}` },
            { label: 'Metro population', value: `${item.population.toFixed(2)}M` },
            { label: 'Annual growth', value: growthLabel, color: growthColor }
        ];
    };
}

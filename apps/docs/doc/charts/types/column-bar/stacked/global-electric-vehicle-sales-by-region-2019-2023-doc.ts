import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { evSalesByRegion as data } from '@/doc/charts/data/evSalesByRegion';

const REGION_COLORS = {
    china: '#ff6fae',
    europe: '#5daeea',
    usa: '#5ccf9f',
    otherAsia: '#ffad5a',
    rest: '#94a3b8'
};

@Component({
    selector: 'types-column-bar-stacked-global-electric-vehicle-sales-by-region-2019-2023-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Each region gets a distinct <i>color</i> so stack composition stays legible across all five layers. A custom <i>ChartTooltip</i> <i>render</i> function shows each region's count alongside the year total. <i>ChartLegend</i> at the top
                provides an interactive filter to isolate any region.
            </p>
            <p>#### SvgBarDebtDemo.ts</p>
            <p>#### evSalesByRegion.ts</p>
        </app-docsectiontext>
        <div class="card">
            <p-chart-svg [height]="460" [animation]="{ duration: 700 }">
                <p-chart-stacked>
                    <p-chart-bar [data]="data" categoryXField="year" valueYField="china" name="China" [color]="colors.china" />
                    <p-chart-bar [data]="data" categoryXField="year" valueYField="europe" name="Europe" [color]="colors.europe" />
                    <p-chart-bar [data]="data" categoryXField="year" valueYField="usa" name="USA" [color]="colors.usa" />
                    <p-chart-bar [data]="data" categoryXField="year" valueYField="otherAsia" name="Other Asia-Pacific" [color]="colors.otherAsia" />
                    <p-chart-bar [data]="data" categoryXField="year" valueYField="rest" name="Rest of World" [color]="colors.rest" />
                </p-chart-stacked>
                <p-chart-tooltip [valueFormatter]="tooltipRows" />
                <p-chart-legend position="top" />
                <p-chart-hover />
                <p-chart-x-axis />
                <p-chart-y-axis [tickFormat]="formatAxis" />
                <p-chart-title text="Global Electric Vehicle Sales by Region, 2019–2023" />
                <p-chart-caption text="Passenger EVs sold (millions) · Source: IEA Global EV Outlook 2024" />
                <p-chart-export-menu filename="global-ev-sales-by-region" />
                <p-chart-accessibility />
            </p-chart-svg>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StackedGlobalElectricVehicleSalesByRegion20192023Doc {
    readonly data = data;
    readonly colors = REGION_COLORS;

    readonly formatAxis = (v: TickValue): string => `${Number(v).toFixed(0)}M`;

    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const item = data[ctx.index!];

        if (!item) return [];

        const total = (item.china + item.europe + item.usa + item.otherAsia + item.rest).toFixed(1);

        return [
            { label: 'Total', value: `${total}M EVs sold` },
            { label: 'China', value: `${item.china.toFixed(1)}M`, color: REGION_COLORS.china },
            { label: 'Europe', value: `${item.europe.toFixed(1)}M`, color: REGION_COLORS.europe },
            { label: 'USA', value: `${item.usa.toFixed(1)}M`, color: REGION_COLORS.usa },
            { label: 'Other Asia-Pacific', value: `${item.otherAsia.toFixed(1)}M`, color: REGION_COLORS.otherAsia },
            { label: 'Rest of World', value: `${item.rest.toFixed(1)}M`, color: REGION_COLORS.rest }
        ];
    };
}

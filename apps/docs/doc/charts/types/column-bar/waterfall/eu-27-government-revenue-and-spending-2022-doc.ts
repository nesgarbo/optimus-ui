import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type ItemContext, type TickValue, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { euGovFinance as data, type FinanceItem } from '@/doc/charts/data/euGovFinance';

const REVENUE_COLOR = '#10a981';
const SPENDING_COLOR = '#e5484d';
const TOTAL_COLOR = '#7c8cff';

function barColor(item: FinanceItem): string {
    if (item.kind === 'total') return TOTAL_COLOR;

    if (item.kind === 'revenue') return REVENUE_COLOR;

    return SPENDING_COLOR;
}

@Component({
    selector: 'types-column-bar-waterfall-eu-27-government-revenue-and-spending-2022-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                The <i>color</i> accessor routes each bar to a palette based on a <i>kind</i> field, so revenue, spending, and total bars are visually distinct. <i>ChartDataLabels</i> uses a signed formatter so contributions show as <i>+13.2%</i> and
                the deficit as <i>-3.4%</i>. A custom <i>ChartTooltip</i> renders the individual contribution alongside the precomputed running total.
            </p>
            <p>#### SvgBarEuGovFinanceDemo.ts</p>
            <p>#### euGovFinance.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460" [animation]="{ duration: 700 }">
                    <p-chart-waterfall totalField="isTotal">
                        <p-chart-bar [data]="data" categoryXField="item" valueYField="value" [color]="barColorAccessor" [borderRadius]="3" />
                    </p-chart-waterfall>
                    <p-chart-data-labels display="value" [formatter]="formatPct" [fontSize]="10" />
                    <p-chart-annotation>
                        <ng-template pChartAnnotationDef let-ctx>
                            @if (ctx.chartArea) {
                                <svg:g>
                                    <svg:text [attr.x]="ctx.chartArea.x + ctx.chartArea.width" [attr.y]="ctx.chartArea.y + 10" text-anchor="end" font-size="11" font-weight="600" opacity="0.85">Deficit: 3.4% of GDP</svg:text>
                                    <svg:text [attr.x]="ctx.chartArea.x + ctx.chartArea.width" [attr.y]="ctx.chartArea.y + 25" text-anchor="end" font-size="10" opacity="0.5">Above Maastricht 3% reference</svg:text>
                                </svg:g>
                            }
                        </ng-template>
                    </p-chart-annotation>
                    <p-chart-tooltip [valueFormatter]="tooltipRows" />
                    <p-chart-hover />
                    <p-chart-x-axis [tickRotation]="-30" />
                    <p-chart-y-axis [tickFormat]="formatAxis" />
                    <p-chart-title text="EU-27 Government Revenue and Spending, 2022" />
                    <p-chart-caption text="Percentage of GDP · Source: Eurostat General Government Finance Statistics" />
                    <p-chart-export-menu filename="eu-gov-finance-2022" />
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
export class ColumnBarWaterfallEu27GovernmentRevenueAndSpending2022Doc {
    readonly data = data;

    readonly barColorAccessor = ({ datum }: ItemContext): string => barColor(datum as FinanceItem);

    readonly formatPct = (v: number): string => {
        const n = Number(v);

        if (n === 0) return '0%';

        return n > 0 ? `+${n.toFixed(1)}%` : `${n.toFixed(1)}%`;
    };

    readonly formatAxis = (v: TickValue): string => `${Number(v).toFixed(0)}%`;

    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const item = data[ctx.index!];

        if (!item) return [];

        const isTotal = item.kind === 'total';
        const valueText = isTotal ? `${item.cumulative.toFixed(1)}%` : this.formatPct(item.value);
        const labelText = isTotal ? (item.item === 'Balance' ? (item.cumulative < 0 ? 'Deficit' : 'Surplus') : 'Subtotal') : item.kind === 'revenue' ? 'Revenue' : 'Expenditure';

        const rows: TooltipRow[] = [{ label: labelText, value: valueText }];

        if (!isTotal) {
            rows.push({ label: 'Running total', value: `${item.cumulative.toFixed(1)}% of GDP` });
        }

        return rows;
    };
}

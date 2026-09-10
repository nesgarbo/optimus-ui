import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type ItemContext, type TickValue, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { carbonBudget as data, type CarbonItem } from '@/doc/charts/data/carbonBudget';

const GROSS_EMISSIONS = data.filter((d) => d.value > 0 && !d.isTotal).reduce((s, d) => s + d.value, 0);
const BUDGET_1_5C = 5.7;

const FOSSIL_COLOR = 'light-dark(#e5484d, #fb7185)';
const LAND_COLOR = 'light-dark(#ffad5a, #ffb76d)';
const SINK_COLOR = 'light-dark(#10a981, #34d399)';
const TOTAL_COLOR = 'light-dark(#94a3b8, #a8b5c6)';

function barColor(item: CarbonItem): string {
    switch (item.kind) {
        case 'fossil':
            return FOSSIL_COLOR;
        case 'land':
            return LAND_COLOR;
        case 'sink':
            return SINK_COLOR;
        default:
            return TOTAL_COLOR;
    }
}

@Component({
    selector: 'types-column-bar-waterfall-global-carbon-budget-2022-sources-sinks-net-accumulation-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>categoryYField</i> and <i>valueXField</i> render the waterfall horizontally while keeping the same <i>totalField</i> semantics for the subtotal bar. A <i>ChartReferenceLine</i> marks a threshold using the <i>x</i> input. The
                <i>ChartTooltip</i> reports each bar's share of the gross total rather than the running sum.
            </p>
            <p>#### SvgBarCarbonBudgetDemo.ts</p>
            <p>#### carbonBudget.ts</p>
        </app-docsectiontext>
        <div class="card">
            <p-chart-svg [height]="460" [animation]="{ duration: 700 }">
                <p-chart-waterfall totalField="isTotal">
                    <p-chart-bar [data]="data" categoryYField="item" valueXField="value" [color]="barColorAccessor" [borderRadius]="3" />
                </p-chart-waterfall>
                <p-chart-reference-line [x]="budget" label="1.5°C annual budget (5.7)" stroke="#7c8cff" [lineStrokeWidth]="1.5" [lineDash]="[4, 4]" labelPosition="start" />
                <p-chart-data-labels display="value" [formatter]="formatGt" [fontSize]="10" />
                <p-chart-annotation>
                    <ng-template pChartAnnotationDef let-ctx>
                        @if (ctx.chartArea) {
                            <svg:g>
                                <svg:text [attr.x]="ctx.chartArea.x + ctx.chartArea.width" [attr.y]="ctx.chartArea.y + 10" text-anchor="end" font-size="11" font-weight="600" opacity="0.85">7× over 1.5°C budget</svg:text>
                                <svg:text [attr.x]="ctx.chartArea.x + ctx.chartArea.width" [attr.y]="ctx.chartArea.y + 25" text-anchor="end" font-size="10" opacity="0.5">Gross emissions 40.5 GtCO₂/yr</svg:text>
                            </svg:g>
                        }
                    </ng-template>
                </p-chart-annotation>
                <p-chart-tooltip [valueFormatter]="tooltipRows" />
                <p-chart-hover />
                <p-chart-x-axis [tickFormat]="formatAxis" />
                <p-chart-y-axis />
                <p-chart-title text="Global Carbon Budget 2022 — sources, sinks, net accumulation" />
                <p-chart-caption text="Values in gigatonnes of CO₂ per year · Source: Global Carbon Project, Global Carbon Budget 2023" />
                <p-chart-export-menu filename="global-carbon-budget-2022" />
                <p-chart-accessibility />
            </p-chart-svg>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WaterfallGlobalCarbonBudget2022SourcesSinksNetAccumulationDoc {
    readonly data = data;
    readonly budget = BUDGET_1_5C;

    readonly barColorAccessor = ({ datum }: ItemContext): string => barColor(datum as CarbonItem);

    readonly formatGt = (v: number): string => {
        const n = Number(v);

        if (n === 0) return '0';

        return n > 0 ? `+${n.toFixed(1)}` : n.toFixed(1);
    };

    readonly formatAxis = (v: TickValue): string => `${Number(v).toFixed(0)}`;

    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const item = data[ctx.index!];

        if (!item) return [];

        const isTotal = item.kind === 'total';

        if (isTotal) {
            if (item.item === 'Atmospheric growth') {
                return [
                    { label: 'Net accumulation', value: '+17.1 GtCO₂' },
                    { label: 'of gross emissions', value: `${((17.1 / GROSS_EMISSIONS) * 100).toFixed(0)}%` }
                ];
            }

            return [
                { label: 'Subtotal', value: `+${GROSS_EMISSIONS.toFixed(1)} GtCO₂` },
                { label: 'vs 1.5°C budget', value: `${(GROSS_EMISSIONS / BUDGET_1_5C).toFixed(1)}×` }
            ];
        }

        const headerLabel = item.kind === 'sink' ? 'Natural sink' : item.kind === 'land' ? 'Land-use flux' : 'Fossil source';
        const pct = (Math.abs(item.value) / GROSS_EMISSIONS) * 100;
        const pctLabel = item.kind === 'sink' ? 'of gross absorbed' : 'of gross emissions';

        return [
            { label: headerLabel, value: `${this.formatGt(item.value)} GtCO₂` },
            { label: pctLabel, value: `${pct.toFixed(1)}%` }
        ];
    };
}

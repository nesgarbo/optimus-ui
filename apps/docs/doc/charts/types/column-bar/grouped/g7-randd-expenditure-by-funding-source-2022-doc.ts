import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue } from '@openng/optimus-ui/charts';
import { g7RdExpenditure as data } from '@/doc/charts/data/g7RdExpenditure';

const COLORS = {
    business: '#5daeea',
    government: '#ffad5a',
    academic: '#5ccf9f'
};

const OECD_AVG_TOTAL = 2.73;

const seriesAverages: Record<string, number> = {
    Business: data.reduce((s, d) => s + d.business, 0) / data.length,
    Government: data.reduce((s, d) => s + d.government, 0) / data.length,
    'Higher Education': data.reduce((s, d) => s + d.academic, 0) / data.length
};

@Component({
    selector: 'types-column-bar-grouped-g7-randd-expenditure-by-funding-source-2022-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                A custom <i>ChartTooltip</i> <i>render</i> callback sums all three series into a total row and adds a colored delta against a reference threshold. <i>ChartReferenceLine</i> marks the cohort average so each bar's position shows whether
                that country is above or below it. Hover any group to see the per-sector breakdown alongside the computed total.
            </p>
            <p>#### SvgBarG7RdExpenditureDemo.ts</p>
            <p>#### g7RdExpenditure.ts</p>
        </app-docsectiontext>
        <div class="card">
            <p-chart-svg [height]="460">
                <p-chart-bar [data]="data" categoryXField="country" valueYField="business" name="Business" [color]="colors.business" [borderRadius]="3" [barThickness]="22" />
                <p-chart-bar [data]="data" categoryXField="country" valueYField="government" name="Government" [color]="colors.government" [borderRadius]="3" [barThickness]="22" />
                <p-chart-bar [data]="data" categoryXField="country" valueYField="academic" name="Higher Education" [color]="colors.academic" [borderRadius]="3" [barThickness]="22" />
                <p-chart-tooltip mode="shared" [valueFormatter]="formatPercent" />
                <p-chart-legend position="top" [itemGap]="10">
                    <ng-template pChartLegendItemDef let-ctx>
                        <button
                            (click)="ctx.onClick()"
                            (mouseenter)="ctx.onMouseEnter()"
                            (mouseleave)="ctx.onMouseLeave()"
                            [style.opacity]="ctx.isHovered ? 0.7 : 1"
                            [style.border]="'1px solid ' + (!ctx.visible ? 'var(--p-content-border-color)' : ctx.color + '55')"
                            style="display: inline-flex; align-items: stretch; gap: 0; padding: 0; border-radius: 999px; background: transparent; cursor: pointer; transition: all 0.2s ease; overflow: hidden; box-shadow: none"
                        >
                            <span [style.background]="!ctx.visible ? 'transparent' : ctx.color + '18'" style="display: inline-flex; align-items: center; gap: 7px; padding: 5px 10px 5px 9px">
                                <span [style.background]="!ctx.visible ? 'var(--p-text-muted-color)' : ctx.color" style="width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0"></span>
                                <span [style.color]="!ctx.visible ? 'var(--p-text-muted-color)' : ctx.color" [style.text-decoration]="!ctx.visible ? 'line-through' : 'none'" style="font-size: 12px; font-weight: 600; letter-spacing: 0.01em">{{
                                    ctx.label
                                }}</span>
                            </span>
                            @if (avg(ctx.label) != null) {
                                <span
                                    [style.background]="!ctx.visible ? 'transparent' : 'color-mix(in oklab, var(--p-content-background) 88%, ' + ctx.color + ' 12%)'"
                                    [style.border-left]="'1px solid ' + (!ctx.visible ? 'var(--p-content-border-color)' : ctx.color + '30')"
                                    style="font-size: 11px; font-weight: 500; letter-spacing: 0.03em; color: var(--p-text-muted-color); padding: 5px 10px"
                                    >avg {{ avg(ctx.label)!.toFixed(2) }}%</span
                                >
                            }
                        </button>
                    </ng-template>
                </p-chart-legend>
                <p-chart-hover />
                <p-chart-x-axis />
                <p-chart-y-axis [tickFormat]="formatAxis" />
                <p-chart-reference-line [y]="oecdAvg" stroke="#e5484d" [lineStrokeWidth]="1.5" [lineDash]="[6, 4]" label="OECD avg total (2.73%)" />
                <p-chart-title text="G7 + Korea R&D expenditure by funding source, 2022" />
                <p-chart-caption text="Gross domestic expenditure on R&D as % of GDP · Source: OECD MSTI 2023" />
                <p-chart-export-menu filename="g7-rd-expenditure-2022" />
            </p-chart-svg>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupedG7RanddExpenditureByFundingSource2022Doc {
    readonly data = data;
    readonly colors = COLORS;
    readonly oecdAvg = OECD_AVG_TOTAL;

    avg(label: string): number | undefined {
        return seriesAverages[label];
    }

    readonly formatPercent = (v: number): string => `${v.toFixed(2)}%`;
    readonly formatAxis = (v: TickValue): string => `${Number(v)}%`;
}

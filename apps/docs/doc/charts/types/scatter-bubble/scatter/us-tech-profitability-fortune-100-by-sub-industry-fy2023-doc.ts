import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { hardware, INDUSTRY_AVG_MARGIN, internet, semis, software, type Company } from '@/doc/charts/data/fortune100Tech';

const COLORS = {
    software: '#5daeea',
    hardware: '#ffad5a',
    internet: '#7c8cff',
    semis: '#5ccf9f'
};

const subIndustries = {
    software: { name: 'Software', data: software, color: COLORS.software },
    hardware: { name: 'Hardware', data: hardware, color: COLORS.hardware },
    internet: { name: 'Internet & Services', data: internet, color: COLORS.internet },
    semis: { name: 'Semiconductors', data: semis, color: COLORS.semis }
};

function topByMargin(list: Company[]): Company {
    return list.reduce<Company>((best, c) => (c.margin > best.margin ? c : best), list[0]!);
}

const subIndustryLeaders: Record<string, Company> = {
    Software: topByMargin(software),
    Hardware: topByMargin(hardware),
    'Internet & Services': topByMargin(internet),
    Semiconductors: topByMargin(semis)
};

@Component({
    selector: 'types-scatter-bubble-scatter-us-tech-profitability-fortune-100-by-sub-industry-fy2023-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Four <i>ChartScatter</i> series group 20 tech companies by sub-industry on revenue × net margin axes. <i>ChartReferenceBand</i> shades the high-margin zone in green; <i>ChartReferenceLine</i> marks the industry average with a
                pill-style label. The custom legend renders a leaderboard card per sub-industry; the custom tooltip surfaces each company's revenue, margin, and delta against that average.
            </p>
            <p>#### SvgScatterFortune100TechDemo.ts</p>
            <p>#### fortune100Tech.ts</p>
        </app-docsectiontext>
        <div class="card">
            <div class="fortune-tech-chart" style="height: 460px">
                <p-chart-svg>
                    <p-chart-scatter id="software" [data]="software" valueXField="rev" valueYField="margin" [color]="colors.software" name="Software" [markerSize]="9" />
                    <p-chart-scatter id="hardware" [data]="hardware" valueXField="rev" valueYField="margin" [color]="colors.hardware" name="Hardware" [markerSize]="9" />
                    <p-chart-scatter id="internet" [data]="internet" valueXField="rev" valueYField="margin" [color]="colors.internet" name="Internet & Services" [markerSize]="9" />
                    <p-chart-scatter id="semis" [data]="semis" valueXField="rev" valueYField="margin" [color]="colors.semis" name="Semiconductors" [markerSize]="9" />
                    <p-chart-tooltip [valueFormatter]="tooltipRows" />
                    <p-chart-legend position="top" [itemGap]="10" [height]="80">
                        <ng-template pChartLegendItemDef let-ctx>
                            <button
                                (click)="ctx.onClick()"
                                (mouseenter)="ctx.onMouseEnter()"
                                (mouseleave)="ctx.onMouseLeave()"
                                [style.border-top]="'3px solid ' + (ctx.visible ? ctx.color : 'rgba(100,116,139,0.35)')"
                                [style.background]="ctx.visible ? ctx.color + '0a' : 'transparent'"
                                [style.opacity]="ctx.isHovered ? 0.82 : 1"
                                style="display: flex; flex-direction: column; align-items: flex-start; gap: 3px; min-width: 150px; padding: 8px 12px; border-left: 1px solid var(--legend-border); border-right: 1px solid var(--legend-border); border-bottom: 1px solid var(--legend-border); border-radius: 0 0 6px 6px; cursor: pointer; transition: all 0.15s; text-align: left"
                            >
                                <span [style.color]="ctx.visible ? ctx.color : '#94a3b8'" [style.text-decoration]="ctx.visible ? 'none' : 'line-through'" style="font-size: 12px; font-weight: 700; letter-spacing: 0.01em">{{ ctx.label }}</span>
                                @if (leader(ctx.label); as l) {
                                    <span [style.color]="ctx.visible ? 'var(--legend-muted)' : '#64748b'" style="display: inline-flex; align-items: center; gap: 5px; font-size: 11px">
                                        <span style="font-size: 10px; opacity: 0.75">Leader</span>
                                        <span [style.color]="ctx.visible ? 'var(--legend-leader-name)' : '#94a3b8'" style="font-weight: 600">{{ l.name }}</span>
                                        <span
                                            [style.color]="ctx.visible ? 'var(--legend-badge-color)' : '#94a3b8'"
                                            [style.background]="ctx.visible ? 'var(--legend-badge-bg)' : 'transparent'"
                                            style="font-size: 10px; font-weight: 600; padding: 1px 5px; border-radius: 3px"
                                        >
                                            {{ l.margin.toFixed(1) }}%
                                        </span>
                                    </span>
                                }
                            </button>
                        </ng-template>
                    </p-chart-legend>
                    <p-chart-hover [brightness]="1.1" />
                    <p-chart-x-axis label="Revenue ($B)" [tickFormat]="formatRev" />
                    <p-chart-y-axis label="Net margin (%)" [tickFormat]="formatMargin" />
                    <p-chart-reference-band [y1]="30" [y2]="60" fill="#10a981" [fillOpacity]="0.08" label="High-margin zone (30 %+)" labelPosition="start" labelColor="#15803d" [labelFontSize]="11" [labelFontWeight]="600" />
                    <p-chart-reference-line
                        [y]="industryAvgMargin"
                        stroke="#64748b"
                        [lineStrokeWidth]="1.5"
                        [lineDash]="[5, 4]"
                        [label]="'Industry avg · ' + industryAvgMargin.toFixed(1) + '%'"
                        labelPosition="end"
                        labelColor="#ffffff"
                        labelBackground="#475569"
                        [labelBackgroundOpacity]="0.85"
                        [labelPadding]="6"
                        [labelBorderRadius]="4"
                        [labelFontSize]="11"
                        [labelFontWeight]="600"
                    />
                    <p-chart-title text="US tech profitability — Fortune 100 by sub-industry, FY2023" />
                    <p-chart-caption text="Revenue ($B) vs net margin (%) · Source: Fortune 500 · 10-K filings aggregated via Macrotrends" />
                    <p-chart-export-menu filename="fortune-100-tech-margin-2023" />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScatterUsTechProfitabilityFortune100BySubIndustryFy2023Doc {
    readonly software = software;
    readonly hardware = hardware;
    readonly internet = internet;
    readonly semis = semis;
    readonly colors = COLORS;
    readonly industryAvgMargin = INDUSTRY_AVG_MARGIN;
    readonly formatRev = (v: TickValue) => `$${v}B`;
    readonly formatMargin = (v: TickValue) => `${v}%`;

    leader(label: string): Company | undefined {
        return subIndustryLeaders[label];
    }

    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const sub = subIndustries[ctx.datasetId as keyof typeof subIndustries];

        if (!sub) return [];

        const company = sub.data[ctx.index!];

        if (!company) return [];

        const rank = [...sub.data].sort((a, b) => b.rev - a.rev).findIndex((c) => c.name === company.name) + 1;
        const vsIndustryAvg = company.margin - INDUSTRY_AVG_MARGIN;
        const deltaColor = vsIndustryAvg >= 0 ? '#10a981' : '#e5484d';
        const deltaText = `${vsIndustryAvg >= 0 ? '▲ +' : '▼ '}${vsIndustryAvg.toFixed(1)} pp vs industry avg`;

        return [
            { label: company.name, value: '' },
            { label: 'Rank', value: `#${rank} in ${sub.name}` },
            { label: 'Revenue', value: `$${company.rev.toFixed(1)}B` },
            { label: 'Net margin', value: `${company.margin.toFixed(1)}%` },
            { label: 'vs industry avg', value: deltaText, color: deltaColor }
        ];
    };
}

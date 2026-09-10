import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type ItemContext, type TooltipRow, type TooltipValueContext, type TreemapCellContext } from '@openng/optimus-ui/charts';
import { type CompanyNode, companies } from '@/doc/charts/data/fortune500';

const INDUSTRY_COLOR: Record<string, string> = { Retail: '#5daeea', Energy: '#ffad5a', Tech: '#7c8cff', Healthcare: '#5ccf9f', Finance: '#ffd166', Auto: '#ff7a66' };
const INDUSTRY_SLUG: Record<string, string> = { Retail: 'retail', Energy: 'energy', Tech: 'tech', Healthcare: 'healthcare', Finance: 'finance', Auto: 'auto' };

const fmtEmp = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${Math.round(n / 1000)}K`);

@Component({
    selector: 'types-treemap-treemap-fortune-global-500-top-15-by-fy2023-revenue-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>nodeId</i> and <i>parentField</i> group the companies under their industries, and <i>drilldown</i> with <i>ChartBreadcrumb</i> opens any sector into a focused view. A <i>color</i> callback maps every company to its industry hue, so
                the sector blocks read as colored regions while <i>colorByPoint</i> on the depth-0 level tints each group header to match. <i>renderContent</i> paints a rank badge, country-flag emoji, company name, revenue, and headcount, with a
                <i>fits(minW, minH)</i> helper gating which rows appear as cell size shrinks. The tooltip surfaces the full employee count and country.
            </p>
            <p>#### SvgTreemapFortune500Demo.ts</p>
            <p>#### fortune500.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 500 }">
                        <p-chart-treemap
                            [data]="data"
                            categoryField="name"
                            valueField="revenue"
                            nodeId="nodeId"
                            parentField="parent"
                            [color]="cellColor"
                            [levels]="levels"
                            [drilldown]="true"
                            rootLabel="Fortune Global 500"
                            layout="squarify"
                            [groupPadding]="4"
                            [spacing]="5"
                            [borderRadius]="3"
                            borderColor="rgba(255,255,255,0.12)"
                        >
                            <ng-template pChartTreemapCellDef let-ctx>
                                @if (visible(ctx)) {
                                    @if (showFlag(ctx)) {
                                        <svg:circle [attr.cx]="ctx.x + ctx.width - 18" [attr.cy]="ctx.y + 16" r="11" fill="rgba(255,255,255,0.92)" pointer-events="none" />
                                        <svg:text [attr.x]="ctx.x + ctx.width - 18" [attr.y]="ctx.y + 16" text-anchor="middle" dominant-baseline="central" [attr.fill]="ctx.color" font-size="10" font-weight="800" pointer-events="none">
                                            {{ node(ctx).rank }}
                                        </svg:text>
                                        <svg:text [attr.x]="ctx.x + 9" [attr.y]="ctx.y + 25" font-size="19" pointer-events="none">{{ node(ctx).flag }}</svg:text>
                                    }
                                    <svg:text
                                        [attr.x]="ctx.x + 9"
                                        [attr.y]="nameY(ctx)"
                                        fill="#fff"
                                        [attr.font-size]="nameSize(ctx)"
                                        font-weight="700"
                                        paint-order="stroke"
                                        stroke="rgba(0,0,0,0.28)"
                                        stroke-width="3"
                                        stroke-linejoin="round"
                                        pointer-events="none"
                                    >
                                        {{ node(ctx).name }}
                                    </svg:text>
                                    @if (fits(ctx, 92, 52)) {
                                        <svg:text
                                            [attr.x]="ctx.x + 9"
                                            [attr.y]="revY(ctx)"
                                            fill="rgba(255,255,255,0.92)"
                                            [attr.font-size]="revSize(ctx)"
                                            font-weight="600"
                                            font-family="ui-monospace,SFMono-Regular,monospace"
                                            paint-order="stroke"
                                            stroke="rgba(0,0,0,0.28)"
                                            stroke-width="3"
                                            stroke-linejoin="round"
                                            pointer-events="none"
                                        >
                                            {{ '$' + node(ctx).revenue + 'B' }}
                                        </svg:text>
                                    }
                                    @if (fits(ctx, 132, showFlag(ctx) ? 104 : 80)) {
                                        <svg:text [attr.x]="ctx.x + 9" [attr.y]="empY(ctx)" fill="rgba(255,255,255,0.72)" font-size="11" font-weight="500" pointer-events="none">{{ empText(ctx) }}</svg:text>
                                    }
                                }
                            </ng-template>
                        </p-chart-treemap>
                        <p-chart-breadcrumb />
                        <p-chart-tooltip [valueFormatter]="tooltipRows" />
                        <p-chart-hover />
                        <p-chart-title text="Fortune Global 500 — Top 15 by FY2023 Revenue" />
                        <p-chart-caption text="Grouped by industry · click an industry to drill in · cell area = revenue · rank badge + flag + revenue + headcount degrade gracefully as cells shrink" />
                        <p-chart-export-menu filename="fortune-global-500-top-15" />
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
export class TreemapTreemapFortuneGlobal500Top15ByFy2023RevenueDoc {
    readonly levels = [
        { depth: 0, spacing: 5, showHeader: true, headerHeight: 24, borderStrokeWidth: 0, colorByPoint: true },
        { depth: 1, spacing: 3, borderStrokeWidth: 1 }
    ];
    readonly data: CompanyNode[] = [...Object.keys(INDUSTRY_COLOR).map((industry) => ({ nodeId: INDUSTRY_SLUG[industry], parent: null, name: industry, industry, revenue: 0 })), ...companies];

    readonly cellColor = (ctx: ItemContext): string => INDUSTRY_COLOR[(ctx.datum as CompanyNode).industry] ?? '#64748b';

    node(ctx: TreemapCellContext): CompanyNode {
        return ctx.data as CompanyNode;
    }

    visible(ctx: TreemapCellContext): boolean {
        return this.node(ctx).rank != null && ctx.width >= 48 && ctx.height >= 30;
    }

    fits(ctx: TreemapCellContext, w: number, h: number): boolean {
        return ctx.width >= w && ctx.height >= h;
    }

    showFlag(ctx: TreemapCellContext): boolean {
        return this.fits(ctx, 94, 60);
    }

    nameSize(ctx: TreemapCellContext): number {
        return this.fits(ctx, 168, 88) ? 16 : this.fits(ctx, 116, 62) ? 13 : 11;
    }

    revSize(ctx: TreemapCellContext): number {
        return this.fits(ctx, 168, 88) ? 13 : 11;
    }

    nameY(ctx: TreemapCellContext): number {
        return ctx.y + (this.showFlag(ctx) ? 46 : 22);
    }

    revY(ctx: TreemapCellContext): number {
        return this.nameY(ctx) + (this.nameSize(ctx) >= 13 ? 20 : 16);
    }

    empY(ctx: TreemapCellContext): number {
        return ctx.height >= 150 ? ctx.y + ctx.height - 14 : this.revY(ctx) + 18;
    }

    empText(ctx: TreemapCellContext): string {
        return `${fmtEmp(this.node(ctx).employees ?? 0)} employees`;
    }

    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const row = companies.find((d) => d.name === ctx.label);

        if (row) {
            return [
                { label: 'Rank', value: `#${row.rank}` },
                { label: 'Industry', value: `${row.industry} · ${row.country}` },
                { label: 'FY2023 revenue', value: `$${row.revenue}B` },
                { label: 'Employees', value: (row.employees ?? 0).toLocaleString('en-US') }
            ];
        }

        const kids = companies.filter((c) => c.industry === ctx.label);

        if (kids.length) {
            return [
                { label: 'Companies', value: String(kids.length) },
                { label: 'Total revenue', value: `$${kids.reduce((s, c) => s + c.revenue, 0)}B` }
            ];
        }

        return [];
    };
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TooltipRow, type TooltipValueContext, type TreemapCellContext } from '@openng/optimus-ui/charts';
import { REGIONS, type ExchangeNode, exchanges } from '@/doc/charts/data/stockExchanges';

const COLOR_SCALE = [-15, 0, 25];
const COLOR_RANGE = ['#e5484d', '#94a3b8', '#10a981'];

@Component({
    selector: 'types-treemap-treemap-world-s-largest-stock-exchanges-market-cap-vs-2025-ytd-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>nodeId</i> and <i>parentField</i> fields group the exchanges under three regions, and <i>drilldown</i> plus <i>ChartBreadcrumb</i> turn each region header into a click target with back-navigation. <i>colorValueField="ytd"</i> maps
                cell color to the YTD column independently of cell area; <i>colorScale=[-15, 0, 25]</i> anchors a three-stop range at the bear/flat/bull thresholds and <i>colorRange</i> paints negative through slate to positive, with
                <i>ChartColorLegend</i> drawing the matching gradient bar. A <i>renderContent</i> callback layers the flag, exchange name, market cap, and a YTD trend pill onto each cell, gating elements by available size so cramped cells drop the
                optional rows first.
            </p>
            <p>#### SvgTreemapStockExchangesDemo.ts</p>
            <p>#### stockExchanges.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 500 }">
                        <p-chart-treemap
                            [data]="data"
                            categoryField="label"
                            valueField="marketCap"
                            nodeId="nodeId"
                            parentField="parent"
                            colorValueField="ytd"
                            [colorScale]="colorScale"
                            [colorRange]="colorRange"
                            [levels]="levels"
                            [drilldown]="true"
                            rootLabel="Global Exchanges · 2025"
                            layout="squarify"
                            [groupPadding]="4"
                            [spacing]="5"
                            [borderRadius]="3"
                            borderColor="rgba(255,255,255,0.12)"
                        >
                            <ng-template pChartTreemapCellDef let-ctx>
                                @if (visible(ctx)) {
                                    @if (showFlag(ctx)) {
                                        <svg:text [attr.x]="ctx.x + 11" [attr.y]="ctx.y + 28" font-size="21" pointer-events="none">{{ node(ctx).flag }}</svg:text>
                                    }
                                    <svg:text
                                        [attr.x]="ctx.x + 11"
                                        [attr.y]="nameY(ctx)"
                                        fill="#fff"
                                        [attr.font-size]="nameSize(ctx)"
                                        font-weight="700"
                                        paint-order="stroke"
                                        stroke="rgba(0,0,0,0.32)"
                                        stroke-width="3"
                                        stroke-linejoin="round"
                                        pointer-events="none"
                                    >
                                        {{ node(ctx).label }}
                                    </svg:text>
                                    @if (fits(ctx, 84, 52)) {
                                        <svg:text
                                            [attr.x]="ctx.x + 11"
                                            [attr.y]="capY(ctx)"
                                            fill="rgba(255,255,255,0.92)"
                                            [attr.font-size]="capSize(ctx)"
                                            font-weight="600"
                                            font-family="ui-monospace,SFMono-Regular,monospace"
                                            paint-order="stroke"
                                            stroke="rgba(0,0,0,0.32)"
                                            stroke-width="3"
                                            stroke-linejoin="round"
                                            pointer-events="none"
                                        >
                                            {{ '$' + node(ctx).marketCap.toFixed(1) + 'T' }}
                                        </svg:text>
                                    }
                                    @if (fits(ctx, 96, showFlag(ctx) ? 118 : 76)) {
                                        <svg:rect [attr.x]="ctx.x + 11" [attr.y]="pillY(ctx)" [attr.width]="pillW(ctx)" [attr.height]="19" rx="9.5" fill="rgba(0,0,0,0.28)" pointer-events="none" />
                                        <svg:text
                                            [attr.x]="ctx.x + 11 + pillW(ctx) / 2"
                                            [attr.y]="pillY(ctx) + 9.5"
                                            text-anchor="middle"
                                            dominant-baseline="central"
                                            [attr.fill]="trendColor(node(ctx).ytd)"
                                            font-size="11"
                                            font-weight="700"
                                            font-family="ui-monospace,SFMono-Regular,monospace"
                                            pointer-events="none"
                                        >
                                            {{ ytdText(node(ctx).ytd) }}
                                        </svg:text>
                                    }
                                }
                            </ng-template>
                        </p-chart-treemap>
                        <p-chart-breadcrumb />
                        <p-chart-color-legend position="bottom" [colorScale]="colorScale" [colorRange]="colorRange" />
                        <p-chart-tooltip [valueFormatter]="tooltipRows" />
                        <p-chart-hover />
                        <p-chart-title text="World's Largest Stock Exchanges — Market Cap vs 2025 YTD" />
                        <p-chart-caption text="Grouped by region · click a region to drill in · cell area = market cap · color = YTD return · red ≤ −15% / slate ≈ flat / green ≥ +25%" />
                        <p-chart-export-menu filename="global-stock-exchanges-2025" />
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
export class TreemapTreemapWorldSLargestStockExchangesMarketCapVs2025YtdDoc {
    readonly colorScale = COLOR_SCALE;
    readonly colorRange = COLOR_RANGE;
    readonly levels = [
        { depth: 0, spacing: 5, showHeader: true, headerHeight: 24, borderStrokeWidth: 0 },
        { depth: 1, spacing: 3, borderStrokeWidth: 1 }
    ];
    readonly data: ExchangeNode[] = [...REGIONS.map((r) => ({ nodeId: r.id, parent: null, label: r.label, region: r.id, marketCap: 0 })), ...exchanges.map((e) => ({ ...e, region: e.parent! }))];

    node(ctx: TreemapCellContext): ExchangeNode {
        return ctx.data as ExchangeNode;
    }

    visible(ctx: TreemapCellContext): boolean {
        return this.node(ctx).ytd != null && ctx.width >= 46 && ctx.height >= 30;
    }

    fits(ctx: TreemapCellContext, w: number, h: number): boolean {
        return ctx.width >= w && ctx.height >= h;
    }

    showFlag(ctx: TreemapCellContext): boolean {
        return this.fits(ctx, 82, 92);
    }

    nameSize(ctx: TreemapCellContext): number {
        return this.fits(ctx, 154, 96) ? 16 : this.fits(ctx, 108, 60) ? 14 : 11;
    }

    capSize(ctx: TreemapCellContext): number {
        return this.fits(ctx, 154, 96) ? 13 : 11;
    }

    nameY(ctx: TreemapCellContext): number {
        return ctx.y + (this.showFlag(ctx) ? 50 : 24);
    }

    capY(ctx: TreemapCellContext): number {
        return this.nameY(ctx) + (this.nameSize(ctx) >= 14 ? 20 : 16);
    }

    pillY(ctx: TreemapCellContext): number {
        return ctx.height >= 150 ? ctx.y + ctx.height - 31 : this.capY(ctx) + 9;
    }

    pillW(ctx: TreemapCellContext): number {
        return this.ytdText(this.node(ctx).ytd).length * 6.8 + 14;
    }

    ytdText(ytd: number | undefined): string {
        const v = ytd ?? 0;

        return `${v >= 0 ? '▲' : '▼'} ${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
    }

    trendColor(ytd: number | undefined): string {
        const v = ytd ?? 0;

        return v > 1.5 ? '#86efac' : v < -1.5 ? '#fca5a5' : '#e2e8f0';
    }

    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const row = exchanges.find((d) => d.label === ctx.label);

        if (row) {
            const region = REGIONS.find((r) => r.id === row.parent)?.label ?? '';
            const rank = [...exchanges].sort((a, b) => b.marketCap - a.marketCap).findIndex((d) => d.nodeId === row.nodeId) + 1;

            return [
                { label: 'Rank', value: `#${rank}` },
                { label: 'Region', value: `${region} · ${row.country}` },
                { label: 'Market cap', value: `$${row.marketCap.toFixed(1)}T` },
                { label: 'YTD', value: row.ytd! >= 0 ? `+${row.ytd!.toFixed(1)}%` : `${row.ytd!.toFixed(1)}%`, color: this.trendColor(row.ytd) }
            ];
        }

        const region = REGIONS.find((r) => r.label === ctx.label);

        if (region) {
            const kids = exchanges.filter((e) => e.parent === region.id);

            return [
                { label: 'Exchanges', value: String(kids.length) },
                { label: 'Total market cap', value: `$${kids.reduce((s, e) => s + e.marketCap, 0).toFixed(1)}T` }
            ];
        }

        return [];
    };
}

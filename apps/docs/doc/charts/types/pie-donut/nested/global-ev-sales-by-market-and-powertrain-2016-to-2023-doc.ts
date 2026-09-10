import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type SliceRenderContext, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { YEAR_DATA } from '@/doc/charts/data/nestedEv';

const MARKET_ORDER = ['China', 'Europe', 'United States', 'Rest of World'] as const;

const PALETTE: Record<string, { base: string; bev: string; phev: string }> = {
    China: { base: '#5daeea', bev: '#2176ff', phev: '#8fcfff' },
    Europe: { base: '#4ecdc4', bev: '#0f9f99', phev: '#8cece3' },
    'United States': { base: '#ffad5a', bev: '#e8752d', phev: '#ffd18c' },
    'Rest of World': { base: '#7c8cff', bev: '#4f5fe8', phev: '#b6c0ff' }
};

const ABBREV: Record<string, string> = { China: 'CHN', Europe: 'EUR', 'United States': 'USA', 'Rest of World': 'RoW' };

const YOY: Record<string, { label: string; color: string } | null> = {
    '2016': null,
    '2017': { label: '+58% vs 2016', color: '#10a981' },
    '2018': { label: '+65% vs 2017', color: '#10a981' },
    '2019': { label: '+10% vs 2018', color: '#ffad5a' },
    '2020': { label: '+46% vs 2019', color: '#10a981' },
    '2021': { label: '+108% vs 2020', color: '#10a981' },
    '2022': { label: '+56% vs 2021', color: '#10a981' },
    '2023': { label: '+39% vs 2022', color: '#10a981' }
};

@Component({
    selector: 'types-pie-donut-nested-global-ev-sales-by-market-and-powertrain-2016-to-2023-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>ChartStacked</i> wraps two <i>ChartPie</i> rings: the inner uses <i>innerRadius=0.4</i> with <i>renderContent</i> printing market abbreviations inside each slice, the outer splits each market by powertrain type. Press any year
                button to animate both rings; <i>ChartAnnotation</i> updates the center with the global total and a YoY growth badge. Hover the inner ring to see market breakdown, the outer to see powertrain share.
            </p>
            <p>#### SvgNestedPieEvDemo.ts</p>
            <p>#### nestedEv.ts</p>
        </app-docsectiontext>
        <div class="card">
            <div style="display: flex; justify-content: center; gap: 4px; flex-wrap: wrap; margin-bottom: 1rem">
                @for (y of years; track y) {
                    <button type="button" (click)="selectedYear.set(y)" [style]="buttonStyle(y)">{{ y }}</button>
                }
            </div>
            <div style="height: 460px">
                <p-chart-svg [animation]="{ duration: 600, easing: 'easeOutCubic' }">
                    <p-chart-stacked [gap]="6">
                        <p-chart-pie id="ev-powertrain" [data]="currentPt()" valueField="units" categoryField="sliceId" [color]="powertrainColors()" [startAngle]="-90" [spacing]="1" />
                        <p-chart-pie id="ev-market" [data]="currentMarkets()" valueField="units" categoryField="market" [color]="marketColors" [innerRadius]="0.4" [startAngle]="-90" [spacing]="2">
                            <ng-template pChartSliceDef let-ctx>
                                @if (ctx.percentage >= 6 && abbrevFor(ctx)) {
                                    <svg:g>
                                        <svg:text y="-6" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="700" fill="#fff" opacity="0.95">{{ abbrevFor(ctx) }}</svg:text>
                                        <svg:text y="8" text-anchor="middle" dominant-baseline="central" font-size="9" fill="#fff" opacity="0.65">{{ ctx.percentage.toFixed(0) }}%</svg:text>
                                    </svg:g>
                                }
                            </ng-template>
                        </p-chart-pie>
                    </p-chart-stacked>
                    <p-chart-annotation>
                        <ng-template pChartAnnotationDef let-ctx>
                            <svg:g text-anchor="middle">
                                <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y + (yoy() ? -18 : -10)" font-size="28" font-weight="700" dominant-baseline="central">{{ currentTotal() }}M</svg:text>
                                <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y + (yoy() ? 6 : 12)" font-size="11" opacity="0.45" dominant-baseline="central">EVs sold · {{ selectedYear() }}</svg:text>
                                @if (yoy(); as y) {
                                    <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y + 26" font-size="11" font-weight="600" [attr.fill]="y.color" dominant-baseline="central">{{ y.label }}</svg:text>
                                }
                            </svg:g>
                        </ng-template>
                    </p-chart-annotation>
                    <p-chart-tooltip [valueFormatter]="tooltipRows" />
                    <p-chart-hover [brightness]="1.08" [offset]="4" />
                    <p-chart-title text="Global EV sales by market and powertrain" />
                    <p-chart-caption text="Source: IEA Global EV Outlook 2024 · Passenger EVs · Inner ring: market share · Outer ring: BEV (dark) vs PHEV (light)" />
                    <p-chart-export-menu filename="global-ev-sales" />
                    <p-chart-accessibility
                        description="Nested donut chart of global passenger EV sales from 2016 to 2023. Inner ring shows market share for China, Europe, United States and Rest of World with abbreviated labels. Outer ring shows BEV vs PHEV split. Press year buttons to animate between years."
                    />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NestedGlobalEvSalesByMarketAndPowertrain2016To2023Doc {
    readonly years = Object.keys(YEAR_DATA);
    readonly selectedYear = signal('2023');
    readonly marketColors = MARKET_ORDER.map((m) => PALETTE[m].base);

    readonly currentPt = computed(() => YEAR_DATA[this.selectedYear()]);
    readonly currentMarkets = computed(() =>
        MARKET_ORDER.map((market) => ({
            market,
            units:
                Math.round(
                    this.currentPt()
                        .filter((d) => d.market === market)
                        .reduce((s, d) => s + d.units, 0) * 100
                ) / 100
        }))
    );
    readonly currentTotal = computed(() => Math.round(this.currentMarkets().reduce((s, d) => s + d.units, 0) * 100) / 100);
    readonly powertrainColors = computed(() => this.currentPt().map((d) => (d.type === 'BEV' ? PALETTE[d.market].bev : PALETTE[d.market].phev)));
    readonly yoy = computed(() => YOY[this.selectedYear()]);

    buttonStyle(year: string): string {
        const active = this.selectedYear() === year;

        return `padding:3px 12px;font-size:12px;border-radius:6px;cursor:pointer;border:1px solid var(--p-content-border-color);background:${active ? 'var(--p-primary-color)' : 'transparent'};color:${active ? 'var(--p-primary-contrast-color)' : 'inherit'}`;
    }

    abbrevFor(ctx: SliceRenderContext): string {
        return ABBREV[ctx.label] ?? '';
    }

    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        if (ctx.datasetId === 'ev-powertrain') {
            const item = this.currentPt()[ctx.index ?? -1];

            if (!item) return [];

            const p = PALETTE[item.market];
            const mUnits = this.currentMarkets().find((m) => m.market === item.market)?.units ?? 1;

            return [
                { label: item.market, value: '', color: p.base },
                { label: item.type === 'BEV' ? 'Battery Electric (BEV)' : 'Plug-in Hybrid (PHEV)', value: '' },
                { label: 'Units sold', value: `${item.units.toFixed(2)}M` },
                { label: 'Share of market', value: `${((item.units / mUnits) * 100).toFixed(0)}%`, color: item.type === 'BEV' ? p.bev : p.phev },
                { label: 'Share of global', value: `${((item.units / this.currentTotal()) * 100).toFixed(1)}%` }
            ];
        }

        const item = this.currentMarkets()[ctx.index ?? -1];

        if (!item) return [];

        const p = PALETTE[item.market];
        const bev = this.currentPt().find((d) => d.market === item.market && d.type === 'BEV')?.units ?? 0;
        const phev = this.currentPt().find((d) => d.market === item.market && d.type === 'PHEV')?.units ?? 0;

        return [
            { label: item.market, value: '', color: p.base },
            { label: 'Total EVs', value: `${item.units.toFixed(2)}M` },
            { label: 'Global share', value: `${((item.units / this.currentTotal()) * 100).toFixed(1)}%` },
            { label: 'BEV', value: `${bev.toFixed(2)}M (${((bev / item.units) * 100).toFixed(0)}%)`, color: p.bev },
            { label: 'PHEV', value: `${phev.toFixed(2)}M (${((phev / item.units) * 100).toFixed(0)}%)`, color: p.phev }
        ];
    };
}

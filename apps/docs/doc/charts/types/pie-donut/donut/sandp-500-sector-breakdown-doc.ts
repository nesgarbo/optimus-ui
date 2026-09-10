import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type AnnotationContext, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { sp500Sectors as data } from '@/doc/charts/data/sp500Sectors';

const colors = ['#5daeea', '#ffad5a', '#ffd166', '#4ecdc4', '#7c8cff', '#c084fc', '#ff6fae', '#9ccc3c', '#ff7a66', '#36b7d6', '#a78bfa'];

@Component({
    selector: 'types-pie-donut-donut-sandp-500-sector-breakdown-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>ChartAnnotation</i> renders a live sector-count and top-weight summary inside the donut hole. The right-side legend doubles as a performance table, showing each sector's index weight alongside its YTD return in green or red. Hover
                to see the tooltip reinforce both figures.
            </p>
            <p>#### SvgDonutSp500SectorsDemo.ts</p>
            <p>#### sp500Sectors.ts</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 460px">
                <p-chart-svg>
                    <p-chart-pie id="sp500" [data]="data" valueField="weight" categoryField="sector" [color]="colors" [innerRadius]="0.55" [spacing]="2" [borderRadius]="3" sort="value-desc" />
                    <p-chart-annotation>
                        <ng-template pChartAnnotationDef let-ctx>
                            @let st = annState(ctx);
                            <svg:g text-anchor="middle">
                                <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y - 28" dy="4" font-size="12" opacity="0.45" dominant-baseline="auto">S&amp;P 500</svg:text>
                                @if (st.active) {
                                    <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y - 4" dy="5" font-size="15" font-weight="bold" [attr.fill]="st.color" dominant-baseline="auto">{{ st.active.sector }}</svg:text>
                                    <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y + 22" dy="9" font-size="26" font-weight="bold" dominant-baseline="auto">{{ st.pct.toFixed(1) }}%</svg:text>
                                } @else {
                                    <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y + 10" font-size="11" opacity="0.3" dominant-baseline="middle">hover to explore</svg:text>
                                }
                            </svg:g>
                        </ng-template>
                    </p-chart-annotation>
                    <p-chart-data-labels display="percentage" [minPercentage]="5" [fontSize]="11" />
                    <p-chart-legend position="right" verticalAlign="middle" [width]="250">
                        <ng-template pChartLegendItemDef let-ctx>
                            <div
                                (click)="ctx.onClick()"
                                (mouseenter)="ctx.onMouseEnter()"
                                (mouseleave)="ctx.onMouseLeave()"
                                [style]="'display:flex;align-items:center;gap:6px;padding:3px 8px;cursor:pointer;transition:opacity 0.2s;opacity:' + (ctx.visible ? 1 : 0.35)"
                            >
                                <span [style]="'width:8px;height:8px;border-radius:2px;flex-shrink:0;background:' + ctx.color"></span>
                                <span style="font-size:11px;flex:1;white-space:nowrap">{{ ctx.label }}</span>
                                <span [style]="'font-size:10px;font-weight:600;margin-left:6px;min-width:44px;text-align:right;flex-shrink:0;color:' + ytdColor(ctx.label)">{{ ytdLabel(ctx.label) }}</span>
                            </div>
                        </ng-template>
                    </p-chart-legend>
                    <p-chart-tooltip [valueFormatter]="tooltipRows" />
                    <p-chart-hover [offset]="6" [brightness]="1.08" />
                    <p-chart-title text="S&P 500 sector composition & YTD performance" />
                    <p-chart-caption text="Source: S&P Dow Jones Indices · December 2024 · YTD total returns" />
                    <p-chart-export-menu filename="sp500-sectors-2024" />
                    <p-chart-accessibility />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DonutSandp500SectorBreakdownDoc {
    readonly data = data;
    readonly colors = colors;
    private lastHoveredIndex: number | null = null;

    annState(ctx: AnnotationContext): { active: (typeof data)[number] | null; color: string; pct: number } {
        if (ctx.hoveredItem) this.lastHoveredIndex = ctx.hoveredItem.index;

        const idx = ctx.hoveredItem?.index ?? this.lastHoveredIndex;
        const visible = idx !== null && ctx.isItemVisible('sp500', idx);
        const active = visible ? data[idx!] : null;
        const color = visible ? colors[idx!] : '#5daeea';
        const visibleTotal = data.reduce((sum, d, i) => sum + (ctx.isItemVisible('sp500', i) ? d.weight : 0), 0);
        const pct = active && visibleTotal > 0 ? (active.weight / visibleTotal) * 100 : 0;

        return { active, color, pct };
    }

    private ytd(label: string): number {
        return data.find((d) => d.sector === label)?.ytd ?? 0;
    }

    ytdColor(label: string): string {
        return this.ytd(label) >= 0 ? '#10a981' : '#e5484d';
    }

    ytdLabel(label: string): string {
        const ytd = this.ytd(label);

        return `${ytd >= 0 ? '▲' : '▼'}${Math.abs(ytd).toFixed(1)}%`;
    }

    readonly tooltipRows = (value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const item = data[ctx.index!];
        const ytd = item?.ytd ?? 0;

        return [
            { label: 'Index weight', value: `${(ctx.percentage ?? value).toFixed(1)}%` },
            { label: 'YTD return', value: `${ytd >= 0 ? '▲' : '▼'} ${Math.abs(ytd).toFixed(1)}%`, color: ytd >= 0 ? '#10a981' : '#e5484d' }
        ];
    };
}

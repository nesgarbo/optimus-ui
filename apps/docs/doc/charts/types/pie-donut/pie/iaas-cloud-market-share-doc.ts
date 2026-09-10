import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type LegendItemRenderContext, type TooltipRow } from '@openng/optimus-ui/charts';
import { cloudIaas } from '@/doc/charts/data/cloudIaas';

const TOTAL_MARKET = 171.8;

@Component({
    selector: 'types-pie-donut-pie-iaas-cloud-market-share-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>ChartDataLabels</i> places angled leader lines outside each slice so share figures stay readable without overlapping the pie. The <i>color</i> array assigns each provider's brand color, and a custom legend shows estimated revenue
                alongside each share. Hover to see the tooltip display both figures.
            </p>
            <p>#### SvgPieCloudIaasDemo.ts</p>
            <p>#### cloudIaas.ts</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 460px">
                <p-chart-svg>
                    <p-chart-pie [data]="data" valueField="revenue" categoryField="provider" [color]="colors" [startAngle]="-90" sort="value-desc" [spacing]="3" [borderRadius]="4" />
                    <p-chart-data-labels display="both" lineStyle="angled" [fontSize]="11" />
                    <p-chart-legend position="right" [maxWidth]="260" [maxHeight]="170" verticalAlign="middle">
                        <ng-template pChartLegendItemDef let-ctx>
                            <div
                                (click)="toggle(ctx.label, ctx.onClick)"
                                (mouseenter)="ctx.onMouseEnter()"
                                (mouseleave)="ctx.onMouseLeave()"
                                [style]="'display:flex;align-items:center;gap:8px;padding:3px 8px;cursor:pointer;opacity:' + (ctx.visible ? 1 : 0.35) + ';transition:opacity 0.2s'"
                            >
                                <span [style]="'width:10px;height:10px;border-radius:50%;flex-shrink:0;background:' + ctx.color"></span>
                                <span style="font-size:12px;min-width:110px">{{ ctx.label }}</span>
                                <span style="font-size:12px;opacity:0.55;min-width:44px;text-align:right">{{ revenueLabel(ctx.label) }}</span>
                                <span style="font-size:12px;font-weight:600;min-width:38px;text-align:right">{{ shareLabel(ctx) }}</span>
                            </div>
                        </ng-template>
                    </p-chart-legend>
                    <p-chart-tooltip [valueFormatter]="tooltipRows" />
                    <p-chart-hover [offset]="8" [brightness]="1.1" />
                    <p-chart-title text="Worldwide IaaS market share 2024" />
                    <p-chart-caption text="Source: Gartner, August 2025 · Total market $171.8B · 22.5% YoY growth" />
                    <p-chart-export-menu filename="iaas-market-share-2024" />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PieIaasCloudMarketShareDoc {
    readonly data = cloudIaas;
    readonly colors = ['#5daeea', '#ffad5a', '#4ecdc4', '#7c8cff', '#ff7a66', '#94a3b8'];

    private readonly hidden = signal(new Set<string>());
    private readonly visibleTotal = computed(() => this.data.filter((d) => !this.hidden().has(d.provider)).reduce((sum, d) => sum + d.revenue, 0));

    toggle(label: string, onClick: () => void): void {
        this.hidden.update((prev) => {
            const next = new Set(prev);

            if (next.has(label)) next.delete(label);
            else next.add(label);

            return next;
        });
        onClick();
    }

    revenueLabel(label: string): string {
        const item = this.data.find((d) => d.provider === label);

        return item ? `$${item.revenue.toFixed(1)}B` : '';
    }

    shareLabel(ctx: LegendItemRenderContext): string {
        const item = this.data.find((d) => d.provider === ctx.label);
        const total = this.visibleTotal();
        const share = ctx.visible && item && total > 0 ? (item.revenue / total) * 100 : 0;

        return item ? `${share.toFixed(1)}%` : '';
    }

    readonly tooltipRows = (v: number): TooltipRow[] => [
        { label: 'Revenue', value: `$${v.toFixed(1)}B`, color: '#10a981' },
        { label: 'Market share', value: `${((v / TOTAL_MARKET) * 100).toFixed(1)}%` }
    ];
}

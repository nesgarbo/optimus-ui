import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue, type TooltipRenderContext } from '@openng/optimus-ui/charts';
import { revenueSegments as data } from '@/doc/charts/data/revenueSegments';

const YEARS = data.map((d) => d.year);
const productTotals = data.map((d) => d.hardware + d.software + d.subscriptions);
const serviceTotals = data.map((d) => d.cloud + d.professional + d.support);

const COLORS = {
    hardware: '#5daeea',
    software: '#7c8cff',
    subscriptions: '#a78bfa',
    cloud: '#4ecdc4',
    professional: '#10a981',
    support: '#9ccc3c'
};

const GUIDANCE_COLOR = '#ffad5a';
const THRESHOLD_COLOR = '#94a3b8';
const GUIDANCE_LOW = 350;
const GUIDANCE_HIGH = 450;
const OP_THRESHOLD = 200;

interface TipItem {
    name: string;
    color: string;
    value: string;
}
interface TipGroup {
    label: string;
    items: TipItem[];
    total: number;
}
interface Tip {
    label: string;
    grandTotal: number;
    yoy: number | null;
    groups: TipGroup[];
}

@Component({
    selector: 'types-column-bar-stacked-revenue-composition-grouped-stacked-with-reference-bands-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Two <i>ChartStacked</i> containers placed as siblings create a grouped-stacked layout, splitting each category band into one slot per group with independent stacking within each. <i>ChartReferenceBand</i> shades a guidance range
                between two <i>ChartReferenceLine</i> markers at the floor and threshold. A custom <i>ChartTooltip</i> shows year-over-year growth and per-group subtotals on hover.
            </p>
            <p>#### SvgBarRevenueSegmentsDemo.ts</p>
            <p>#### revenueSegments.ts</p>
        </app-docsectiontext>
        <div class="card">
            <p-chart-svg [height]="460" [animation]="{ duration: 700 }">
                <p-chart-stacked id="products">
                    <p-chart-bar [data]="data" categoryXField="year" valueYField="hardware" name="Hardware" [color]="colors.hardware" />
                    <p-chart-bar [data]="data" categoryXField="year" valueYField="software" name="Software" [color]="colors.software" />
                    <p-chart-bar [data]="data" categoryXField="year" valueYField="subscriptions" name="Subscriptions" [color]="colors.subscriptions" />
                </p-chart-stacked>
                <p-chart-stacked id="services">
                    <p-chart-bar [data]="data" categoryXField="year" valueYField="cloud" name="Cloud" [color]="colors.cloud" />
                    <p-chart-bar [data]="data" categoryXField="year" valueYField="professional" name="Professional" [color]="colors.professional" />
                    <p-chart-bar [data]="data" categoryXField="year" valueYField="support" name="Support" [color]="colors.support" />
                </p-chart-stacked>
                <p-chart-reference-band [y1]="guidanceLow" [y2]="guidanceHigh" [fill]="guidanceColor" [fillOpacity]="0.07" />
                <p-chart-reference-line [y]="guidanceLow" label="Guidance floor · $350M" [stroke]="guidanceColor" [lineStrokeWidth]="1.5" [lineDash]="[5, 4]" labelPosition="start" />
                <p-chart-reference-line [y]="opThreshold" label="Operating threshold · $200M" [stroke]="thresholdColor" [lineStrokeWidth]="1" [lineDash]="[4, 4]" labelPosition="start" />
                <p-chart-tooltip mode="shared">
                    <ng-template pChartTooltipDef let-ctx>
                        @let t = tip(ctx);
                        @if (t) {
                            <div
                                style="padding: 12px 14px; min-width: 248px; background: var(--p-popover-background, var(--p-content-background)); border-radius: 8px; border: 1px solid var(--p-content-border-color); color: var(--p-text-color); box-shadow: 0 16px 40px color-mix(in oklab, var(--p-text-color) 10%, transparent)"
                            >
                                <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px">
                                    <span style="font-weight: 700; font-size: 13px">FY {{ t.label }}</span>
                                    <span style="font-size: 11px; opacity: 0.4">\${{ t.grandTotal }}M total</span>
                                </div>
                                @if (t.yoy !== null) {
                                    <div [style.color]="t.yoy >= 0 ? '#10a981' : '#e5484d'" style="font-size: 11px; margin-top: 3px; font-weight: 600">{{ t.yoy >= 0 ? '+' : '' }}{{ t.yoy }}% YoY</div>
                                }
                                @for (g of t.groups; track g.label) {
                                    <div style="font-size: 9px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; opacity: 0.4; margin: 10px 0 4px">{{ g.label }}</div>
                                    @for (it of g.items; track it.name) {
                                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; margin-top: 2px">
                                            <span style="display: flex; align-items: center; gap: 6px; opacity: 0.8">
                                                <span [style.background]="it.color" style="width: 7px; height: 7px; border-radius: 2px; flex-shrink: 0"></span>
                                                {{ it.name }}
                                            </span>
                                            <span style="font-weight: 600">{{ it.value }}</span>
                                        </div>
                                    }
                                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 5px; padding-top: 5px; border-top: 1px solid var(--p-content-border-color)">
                                        <span style="opacity: 0.5">Subtotal</span>
                                        <span style="font-weight: 700">\${{ g.total }}M</span>
                                    </div>
                                }
                            </div>
                        }
                    </ng-template>
                </p-chart-tooltip>
                <p-chart-legend position="bottom" />
                <p-chart-hover />
                <p-chart-x-axis />
                <p-chart-y-axis [max]="500" [tickFormat]="formatAxis" />
                <p-chart-title text="Revenue Composition — Products vs. Services (2019–2023)" />
                <p-chart-caption text="In millions USD · Left group = Product revenue (blue) · Right group = Service revenue (green) · Shaded band = board guidance range" />
                <p-chart-accessibility />
            </p-chart-svg>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StackedRevenueCompositionGroupedStackedWithReferenceBandsDoc {
    readonly data = data;
    readonly colors = COLORS;
    readonly guidanceColor = GUIDANCE_COLOR;
    readonly thresholdColor = THRESHOLD_COLOR;
    readonly guidanceLow = GUIDANCE_LOW;
    readonly guidanceHigh = GUIDANCE_HIGH;
    readonly opThreshold = OP_THRESHOLD;

    readonly formatAxis = (v: TickValue): string => `$${Number(v)}M`;

    tip(ctx: TooltipRenderContext): Tip | null {
        const idx = YEARS.indexOf(String(ctx.label));

        if (idx < 0 || !ctx.allSeries) return null;

        const pTotal = productTotals[idx];
        const sTotal = serviceTotals[idx];
        const grandTotal = pTotal + sTotal;
        const prevGrand = idx > 0 ? productTotals[idx - 1] + serviceTotals[idx - 1] : null;
        const yoy = prevGrand ? Math.round(((grandTotal - prevGrand) / prevGrand) * 100) : null;

        const seriesById = new Map(ctx.allSeries.map((s) => [s.label, s]));

        const group = (label: string, keys: string[], total: number): TipGroup => ({
            label,
            items: keys.map((key) => {
                const name = key.charAt(0).toUpperCase() + key.slice(1);
                const s = seriesById.get(name);

                return { name, color: s?.color ?? '#999', value: `$${s?.formattedValue ?? 0}M` };
            }),
            total
        });

        return {
            label: String(ctx.label),
            grandTotal,
            yoy,
            groups: [group('Products', ['hardware', 'software', 'subscriptions'], pTotal), group('Services', ['cloud', 'professional', 'support'], sTotal)]
        };
    }
}

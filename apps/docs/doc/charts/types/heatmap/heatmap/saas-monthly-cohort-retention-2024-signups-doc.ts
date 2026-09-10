import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type AnnotationContext, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { COHORTS, saasRetention, retention, sizes } from '@/doc/charts/data/saasRetention';

const COLOR_STOPS = [0, 20, 40, 60, 80, 100];
const COLOR_RANGE = ['#ff7a66', '#ffd166', '#d6dbe6', '#5daeea', '#5ccf9f', '#10a981'];
const CHAR_W = 6.1;
const CLIFF_LABEL = 'Activation cliff: M0 → M1';
const CLIFF_BOX_W = CLIFF_LABEL.length * CHAR_W + 20;
const CLIFF_BOX_H = 22;

@Component({
    selector: 'types-heatmap-heatmap-saas-monthly-cohort-retention-2024-signups-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>colorScale</i> and <i>colorRange</i> create a diverging health scale so low, midpoint, and high retention are visually distinct. <i>nullColor</i> fills unobserved future cells in a separate shade to distinguish missing data from
                actual zero values. <i>ChartAnnotation</i> marks the largest retention drop across cohorts; the tooltip computes retained counts on the fly and shows a color-coded month-over-month delta.
            </p>
            <p>#### SvgHeatmapSaasRetentionDemo.ts</p>
            <p>#### saasRetention.ts</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 460px">
                <p-chart-svg>
                    <p-chart-heatmap [data]="data" categoryXField="monthsSince" categoryYField="cohort" valueField="pct" [colorScale]="colorStops" [colorRange]="colorRange" nullColor="rgba(148,163,184,0.18)" [spacing]="2" [borderRadius]="3" />
                    <p-chart-data-labels [formatter]="formatPct" />
                    <p-chart-x-axis [showLine]="false" [showTicks]="false" [gridLines]="false" />
                    <p-chart-y-axis [showLine]="false" [showTicks]="false" [gridLines]="false" />
                    <p-chart-color-legend position="bottom" [steps]="5" [height]="10" [borderRadius]="5" />
                    <p-chart-annotation>
                        <ng-template pChartAnnotationDef let-ctx>
                            @if (ctx.chartArea) {
                                <svg:g>
                                    <svg:line [attr.x1]="cliffX(ctx)" [attr.y1]="ctx.chartArea.y" [attr.x2]="cliffX(ctx)" [attr.y2]="cliffBoxY(ctx)" stroke="#e5484d" stroke-width="1" stroke-dasharray="4,3" opacity="0.5" />
                                    <svg:rect [attr.x]="cliffX(ctx)" [attr.y]="cliffBoxY(ctx)" [attr.width]="cliffBoxW" [attr.height]="cliffBoxH" rx="4" ry="4" fill="#e5484d" />
                                    <svg:text [attr.x]="cliffX(ctx) + cliffBoxW / 2" [attr.y]="cliffBoxY(ctx) + cliffBoxH / 2" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="600" fill="#ffffff">
                                        {{ cliffLabel }}
                                    </svg:text>
                                </svg:g>
                            }
                        </ng-template>
                    </p-chart-annotation>
                    <p-chart-tooltip [valueFormatter]="tooltipRows" />
                    <p-chart-hover />
                    <p-chart-title text="SaaS monthly-cohort retention — 2024 signups" />
                    <p-chart-caption text="Rows = signup cohort · Columns = months since signup · Grey = not yet observed" />
                    <p-chart-export-menu filename="saas-cohort-retention-2024" />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeatmapSaasMonthlyCohortRetention2024SignupsDoc {
    readonly data = saasRetention;
    readonly colorStops = COLOR_STOPS;
    readonly colorRange = COLOR_RANGE;
    readonly cliffLabel = CLIFF_LABEL;
    readonly cliffBoxW = CLIFF_BOX_W;
    readonly cliffBoxH = CLIFF_BOX_H;

    readonly formatPct = (v: number | null): string => (v == null ? '' : `${v}%`);

    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const cell = this.data[ctx.index!];

        if (cell.pct == null) {
            return [{ label: '', value: 'Not observed yet' }];
        }

        const cohortSize = sizes[cell.cohort as (typeof COHORTS)[number]];
        const retained = Math.round((cell.pct / 100) * cohortSize);
        const monthIdx = Number(cell.monthsSince.slice(1));
        const prevPct = monthIdx > 0 ? retention[cell.cohort as (typeof COHORTS)[number]][monthIdx - 1] : null;
        const mom = prevPct != null && cell.pct != null ? cell.pct - prevPct : null;

        const rows: TooltipRow[] = [
            { label: 'Retention', value: `${cell.pct}%` },
            { label: 'Retained users', value: `${retained.toLocaleString()} / ${cohortSize.toLocaleString()}` }
        ];

        if (mom != null) {
            rows.push({
                label: 'MoM',
                value: `${mom >= 0 ? '+' : ''}${mom} pp`,
                color: mom < -10 ? '#e5484d' : mom < 0 ? '#ffad5a' : '#10a981'
            });
        }

        return rows;
    };

    cliffX(actx: AnnotationContext): number {
        const xScale = actx.xScale as (((c: string) => number) & { bandwidth?: () => number }) | null;

        if (!xScale) return 200;

        const band = xScale.bandwidth?.() ?? 0;
        const m0 = xScale('M0');
        const m1 = xScale('M1');

        if (!Number.isFinite(m0) || !Number.isFinite(m1)) return 200;

        return (m0 + m1) / 2 + band / 2;
    }

    cliffBoxY(actx: AnnotationContext): number {
        return actx.chartArea.y + actx.chartArea.height - CLIFF_BOX_H - 6;
    }
}

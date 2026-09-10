import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type AnnotationContext, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { cyberPosture as data } from '@/doc/charts/data/cyberPosture';

const ROW_H = 14;

function band(score: number): { label: string; color: string } {
    if (score >= 75) return { label: 'Mature', color: '#10a981' };

    if (score >= 50) return { label: 'Developing', color: '#ffad5a' };

    return { label: 'Initial', color: '#e5484d' };
}

@Component({
    selector: 'types-radar-radar-nist-csf-2-0-cybersecurity-posture-audit-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>lineDash</i> gives the baseline series a dashed stroke so it reads as "before"; the current-state series renders solid with thicker <i>lineStrokeWidth</i> to visually dominate. <i>ChartAnnotation</i> draws a compact delta table
                listing per-domain improvement. The tooltip classifies each score into maturity bands with color chips.
            </p>
            <p>#### SvgRadarCyberPostureDemo.ts</p>
            <p>#### cyberPosture.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 700 }">
                        <p-chart-radar id="baseline" [data]="data" categoryXField="domain" valueYField="baseline" name="Baseline · Jan 2025" color="#94a3b8" [fillOpacity]="0.12" [lineStrokeWidth]="1.5" [lineDash]="[4, 4]" [markerSize]="3" />
                        <p-chart-radar id="current" [data]="data" categoryXField="domain" valueYField="current" name="Current · Apr 2026" color="#10a981" [fillOpacity]="0.2" [lineStrokeWidth]="2.4" [markerSize]="5" />
                        <p-chart-x-axis />
                        <p-chart-y-axis gridShape="polygon" [tickCount]="4" />
                        <p-chart-tooltip [valueFormatter]="tooltipRows" />
                        <p-chart-hover />
                        <p-chart-legend position="top" />
                        <p-chart-annotation>
                            <ng-template pChartAnnotationDef let-ctx>
                                <svg:g pointer-events="none">
                                    <svg:rect
                                        [attr.x]="ctx.chartArea.x + 4"
                                        [attr.y]="ctx.chartArea.y + 4"
                                        [attr.width]="128"
                                        [attr.height]="rowH * (data.length + 2) + 8"
                                        rx="4"
                                        fill="rgba(16,169,129,0.08)"
                                        stroke="#10a981"
                                        stroke-width="1"
                                        stroke-opacity="0.3"
                                    />
                                    <svg:text [attr.x]="ctx.chartArea.x + 8" [attr.y]="ctx.chartArea.y + 18" font-size="10" font-weight="700" opacity="0.8">12-month remediation</svg:text>
                                    @for (row of data; track row.domain; let i = $index) {
                                        <svg:text [attr.x]="ctx.chartArea.x + 8" [attr.y]="rowY(ctx, i)" font-size="10" opacity="0.6">{{ row.domain }}</svg:text>
                                        <svg:text [attr.x]="ctx.chartArea.x + 106" [attr.y]="rowY(ctx, i)" fill="#10a981" font-size="10" font-weight="700" text-anchor="end" font-family="ui-monospace,SFMono-Regular,monospace">
                                            +{{ row.current - row.baseline }}
                                        </svg:text>
                                    }
                                </svg:g>
                            </ng-template>
                        </p-chart-annotation>
                        <p-chart-title text="NIST CSF 2.0 — Cybersecurity Posture Audit" />
                        <p-chart-caption text="Protect gained the most (+40 pts) following a Q1 2025 remediation push · all six functions crossed the 60-point threshold by Apr 2026" />
                        <p-chart-export-menu filename="nist-csf-posture-radar" />
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
export class RadarRadarNistCsf20CybersecurityPostureAuditDoc {
    readonly data = data;
    readonly rowH = ROW_H;

    rowY(ctx: AnnotationContext, i: number): number {
        return ctx.chartArea.y + 18 + (i + 1) * ROW_H;
    }

    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const row = data[ctx.index!];

        if (!row) return [];

        const before = band(row.baseline);
        const after = band(row.current);

        return [
            { label: 'Before', value: `${row.baseline} · ${before.label}`, color: before.color },
            { label: 'After', value: `${row.current} · ${after.label}`, color: after.color },
            { label: '12-month delta', value: `+${row.current - row.baseline}`, color: '#10a981' }
        ];
    };
}

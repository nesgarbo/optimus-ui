import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type AnnotationContext, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { CURRENT, PARIS_TARGET, temperatureBands as data, TEMP_MAX } from '@/doc/charts/data/climateAnomaly';

const START_DEG = -180;
const SWEEP_DEG = 180;
const CURRENT_COLOR = '#ffad5a';
const colors = ['#10a981', CURRENT_COLOR, 'rgba(229, 72, 77, 0.22)'];
const bandNotes = ['Below the 1°C long-term warming line', 'Paris Agreement guardrail band', 'Headroom above the target marker'];

@Component({
    selector: 'types-pie-donut-gauge-nasa-global-temperature-anomaly-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>startAngle=-180</i> and <i>sweepAngle=180</i> shape a half-circle with three color zones encoding safe, warning, and headroom bands in a single <i>ChartPie</i> ring. <i>ChartAnnotation</i> draws a dashed reference line at the Paris
                Agreement target angle, while <i>ChartTooltip</i> explains each band on hover.
            </p>
            <p>#### SvgGaugeClimateAnomalyDemo.ts</p>
            <p>#### climateAnomaly.ts</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 360px">
                <p-chart-svg [animation]="{ duration: 900 }">
                    <p-chart-pie [data]="data" valueField="value" categoryField="label" [color]="colors" [startAngle]="-180" [sweepAngle]="180" [innerRadius]="0.72" />
                    <p-chart-annotation>
                        <ng-template pChartAnnotationDef let-ctx>
                            @let a = anno(ctx);
                            <svg:g>
                                <svg:line [attr.x1]="a.x1" [attr.y1]="a.y1" [attr.x2]="a.x2" [attr.y2]="a.y2" stroke="#e5484d" stroke-width="2.5" stroke-dasharray="5 3" stroke-linecap="round" />
                                <svg:text text-anchor="middle" font-size="11" font-weight="700" fill="#e5484d">
                                    <svg:tspan [attr.x]="a.lx" [attr.y]="a.ly" dy="-8" dominant-baseline="auto">Paris</svg:tspan>
                                    <svg:tspan [attr.x]="a.lx" dy="16" dominant-baseline="auto">1.5°C</svg:tspan>
                                </svg:text>
                                <svg:text [attr.x]="ctx.center.x" [attr.y]="a.textY" text-anchor="middle" dominant-baseline="auto" font-size="52" font-weight="bold" fill="#ffad5a">+{{ current }}°C</svg:text>
                                <svg:text [attr.x]="ctx.center.x" [attr.y]="a.subY" text-anchor="middle" dominant-baseline="auto" font-size="13" opacity="0.65">above 1951–1980 baseline</svg:text>
                            </svg:g>
                        </ng-template>
                    </p-chart-annotation>
                    <p-chart-tooltip [valueFormatter]="tooltipRows" />
                    <p-chart-hover [brightness]="1.08" />
                    <p-chart-title text="Global temperature anomaly" />
                    <p-chart-caption text="Source: NASA GISS Surface Temperature Analysis · January 2025 · Updated monthly" />
                    <p-chart-export-menu filename="nasa-global-temperature-anomaly" />
                    <p-chart-accessibility />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GaugeNasaGlobalTemperatureAnomalyDoc {
    readonly data = data;
    readonly colors = colors;
    readonly current = CURRENT;

    anno(ctx: AnnotationContext) {
        const cx = ctx.center.x;
        const cy = ctx.center.y;
        const r = cy - ctx.chartArea.y;
        const parisAngle = ((START_DEG + (PARIS_TARGET / TEMP_MAX) * SWEEP_DEG) * Math.PI) / 180;
        const cosP = Math.cos(parisAngle);
        const sinP = Math.sin(parisAngle);

        return {
            x1: cx + r * 0.72 * cosP,
            y1: cy + r * 0.72 * sinP,
            x2: cx + r * 1.05 * cosP,
            y2: cy + r * 1.05 * sinP,
            lx: cx + r * 1.16 * cosP,
            ly: cy + r * 1.16 * sinP,
            textY: cy - r * 0.08,
            subY: cy - r * 0.36
        };
    }

    readonly tooltipRows = (value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const item = data[ctx.index ?? -1];

        if (!item) return [];

        return [
            { label: 'Band', value: item.label, color: colors[ctx.index ?? 0] },
            { label: 'Span', value: `${value.toFixed(1)}°C` },
            { label: 'Current anomaly', value: `+${CURRENT.toFixed(2)}°C` },
            { label: '', value: bandNotes[ctx.index ?? 0] ?? '' }
        ];
    };
}

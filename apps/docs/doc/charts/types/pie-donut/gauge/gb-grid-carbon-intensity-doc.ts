import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type AnnotationContext, type SliceRenderContext } from '@openng/optimus-ui/charts';
import { type CarbonZone, CURRENT, ZONES } from '@/doc/charts/data/carbonIntensity';

const SCALE_MAX = 500;
const START_ANGLE = -180;
const SWEEP_ANGLE = 180;
const CURRENT_COLOR = '#4ecdc4';

const FILLED_LABEL_COLOR: Record<string, string> = { 'Very Low': '#052e2b', Low: '#083a3a', Moderate: '#3b1d05', High: '#ffffff' };

const gaugeData: { label: string; value: number }[] = [];
const gaugeColors: string[] = [];

for (const zone of ZONES) {
    const filled = Math.min(Math.max(CURRENT - zone.min, 0), zone.max - zone.min);
    const empty = zone.max - zone.min - filled;

    if (filled > 0) {
        gaugeData.push({ label: zone.label, value: filled });
        gaugeColors.push(zone.color);
    }

    if (empty > 0) {
        gaugeData.push({ label: `${zone.label}·faded`, value: empty });
        gaugeColors.push(zone.faded);
    }
}

@Component({
    selector: 'types-pie-donut-gauge-gb-grid-carbon-intensity-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>startAngle=-180</i> and <i>sweepAngle=180</i> shape a half-circle gauge where each color zone splits into a filled portion up to the current reading and a dimmed remainder, encoding both thresholds and position in one ring without
                stacking. <i>ChartAnnotation</i> draws a needle at the exact current-value angle and renders the reading, zone badge, and trend inside the hole. Hover a zone segment to switch the center display to that zone's range and description.
            </p>
            <p>#### SvgGaugeCarbonIntensityDemo.ts</p>
            <p>#### carbonIntensity.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 360px">
                    <p-chart-svg [animation]="{ duration: 900 }">
                        <p-chart-pie [data]="gaugeData" valueField="value" categoryField="label" [color]="gaugeColors" [startAngle]="startAngle" [sweepAngle]="sweepAngle" [innerRadius]="0.72">
                            <ng-template pChartSliceDef let-ctx>
                                @if (ctx.percentage >= 4) {
                                    @let li = labelInfo(ctx);
                                    <svg:text text-anchor="middle" dominant-baseline="central" font-size="11" [attr.font-weight]="li.weight" [attr.fill]="li.color" [attr.opacity]="li.opacity">{{ li.text }}</svg:text>
                                }
                            </ng-template>
                        </p-chart-pie>
                        <p-chart-annotation>
                            <ng-template pChartAnnotationDef let-ctx>
                                @let n = needle(ctx);
                                <svg:g>
                                    <svg:polygon [attr.points]="n.points" [attr.fill]="ctx.textColor" opacity="0.85" />
                                    <svg:circle [attr.cx]="n.cx" [attr.cy]="n.cy" r="10" [attr.fill]="ctx.textColor" opacity="0.85" />
                                    <svg:circle [attr.cx]="n.cx" [attr.cy]="n.cy" r="5" [attr.fill]="currentColor" />
                                </svg:g>
                            </ng-template>
                        </p-chart-annotation>
                        <p-chart-tooltip>
                            <ng-template pChartTooltipDef let-ctx>
                                @let z = zoneFor(ctx.label);
                                @if (z) {
                                    <div [style]="cardStyle">
                                        <div [style]="'width:4px;flex-shrink:0;background:' + z.color"></div>
                                        <div style="padding:10px 12px;flex:1">
                                            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
                                                <span [style]="'font-weight:700;font-size:13px;color:' + z.color">{{ z.label }}</span>
                                                <span style="font-size:11px;font-weight:500;color:var(--p-text-muted-color, #64748b)">{{ isFaded(ctx.label) ? 'ahead' : 'current' }}</span>
                                            </div>
                                            <div style="font-size:12px;font-weight:600;margin-bottom:4px">{{ z.range }} gCO₂/kWh</div>
                                            <div style="font-size:11px;line-height:1.5;color:var(--p-text-muted-color, #64748b)">{{ z.desc }}</div>
                                        </div>
                                    </div>
                                }
                            </ng-template>
                        </p-chart-tooltip>
                        <p-chart-hover [brightness]="1.1" />
                        <p-chart-title text="GB grid carbon intensity" />
                        <p-chart-caption text="Source: National Grid ESO Carbon Intensity API · Representative data for Wed 13 Nov 2024, 14:30 UTC · Great Britain only" />
                        <p-chart-export-menu filename="gb-carbon-intensity" />
                        <p-chart-accessibility description="Half-circle speedometer gauge showing GB grid carbon intensity at 178 gCO₂/kWh, rated low. Zone bands from very low (green) to high (red), with faded colours showing zones ahead." />
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
export class PieDonutGaugeGbGridCarbonIntensityDoc {
    readonly gaugeData = gaugeData;
    readonly gaugeColors = gaugeColors;
    readonly startAngle = START_ANGLE;
    readonly sweepAngle = SWEEP_ANGLE;
    readonly currentColor = CURRENT_COLOR;
    readonly cardStyle =
        'display:flex;min-width:190px;border-radius:6px;overflow:hidden;font-family:inherit;background:var(--p-chart-tooltip-background, var(--p-content-background, #ffffff));color:var(--p-chart-tooltip-color, var(--p-text-color, #1e293b));box-shadow:var(--p-chart-tooltip-shadow, 0 2px 12px rgba(15, 23, 42, 0.16))';

    labelInfo(ctx: SliceRenderContext): { text: string; color: string; weight: string; opacity: string } {
        const faded = ctx.label.includes('·faded');
        const zoneName = ctx.label.replace('·faded', '');
        const zone = ZONES.find((z) => z.label === zoneName);
        const isCurrent = !faded && !!zone && CURRENT >= zone.min && CURRENT < zone.max;
        const color = faded ? (zone?.color ?? '#64748b') : (FILLED_LABEL_COLOR[zoneName] ?? '#ffffff');

        return { text: zoneName, color, weight: isCurrent ? '700' : '600', opacity: faded ? '0.7' : '0.95' };
    }

    needle(ctx: AnnotationContext): { cx: number; cy: number; points: string } {
        const cx = ctx.center.x;
        const cy = ctx.center.y;
        const r = Math.min(ctx.chartArea.width / 2, ctx.chartArea.height);
        const angleRad = ((START_ANGLE + (CURRENT / SCALE_MAX) * SWEEP_ANGLE) * Math.PI) / 180;
        const needleLen = r * 0.72;
        const halfW = 4;
        const perpCos = Math.cos(angleRad + Math.PI / 2);
        const perpSin = Math.sin(angleRad + Math.PI / 2);
        const tipX = cx + needleLen * Math.cos(angleRad);
        const tipY = cy + needleLen * Math.sin(angleRad);

        return { cx, cy, points: `${tipX},${tipY} ${cx + halfW * perpCos},${cy + halfW * perpSin} ${cx - halfW * perpCos},${cy - halfW * perpSin}` };
    }

    zoneFor(label: string): CarbonZone | undefined {
        return ZONES.find((z) => z.label === label.replace('·faded', ''));
    }

    isFaded(label: string): boolean {
        return label.includes('·faded');
    }
}

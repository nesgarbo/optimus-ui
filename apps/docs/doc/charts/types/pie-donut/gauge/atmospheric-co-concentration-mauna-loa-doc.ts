import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type AnnotationContext, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { CURRENT_PPM, MAX_PPM, MIN_PPM, PREV_PPM, SAFE_LIMIT, WATCH_LIMIT, ZONE_DESC, ZONE_RANGES } from '@/doc/charts/data/seismic';

const RANGE = MAX_PPM - MIN_PPM;
const CRITICAL_COLOR = '#e5484d';
const colors = ['#10a981', '#ffad5a', CRITICAL_COLOR, 'rgba(148, 163, 184, 0.26)'];

function toGaugeUnits(ppm: number) {
    return Math.min(100, Math.max(0, ((ppm - MIN_PPM) / RANGE) * 100));
}

const safeWidth = toGaugeUnits(SAFE_LIMIT);
const watchWidth = toGaugeUnits(WATCH_LIMIT) - safeWidth;
const criticalWidth = toGaugeUnits(CURRENT_PPM) - safeWidth - watchWidth;
const emptyWidth = 100 - safeWidth - watchWidth - criticalWidth;

const data = [
    { label: 'Safe', value: safeWidth },
    { label: 'Watch', value: watchWidth },
    { label: 'Critical', value: criticalWidth },
    { label: 'Empty', value: emptyWidth }
];

type SeismicState = { mode: 'empty'; headroom: string } | { mode: 'zone'; color: string; label: string; range: string; desc: string; isCritical: boolean } | { mode: 'default'; trend: string };

@Component({
    selector: 'types-pie-donut-gauge-atmospheric-co-concentration-mauna-loa-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>startAngle=225</i> and <i>sweepAngle=270</i> span the arc from a safe baseline to a critical ceiling, split into three color zones with a trailing empty segment for headroom above the current reading. <i>ChartAnnotation</i> shows
                the current reading and year-over-year delta inside the hole. Hover any zone band to switch the center to that zone's range and status.
            </p>
            <p>#### SvgGaugeSeismicDemo.ts</p>
            <p>#### seismic.ts</p>
        </app-docsectiontext>
        <div class="card">
            <div style="display: flex; justify-content: center">
                <p-chart-svg [width]="460" [height]="460">
                    <p-chart-pie [data]="data" valueField="value" categoryField="label" [color]="colors" [startAngle]="225" [sweepAngle]="270" [innerRadius]="0.75" />
                    <p-chart-annotation>
                        <ng-template pChartAnnotationDef let-ctx>
                            @let st = annoState(ctx);
                            <svg:g text-anchor="middle">
                                @switch (st.mode) {
                                    @case ('empty') {
                                        <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y - 38" font-size="12" font-weight="600" opacity="0.45" dominant-baseline="central">Headroom remaining</svg:text>
                                        <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y - 10" font-size="28" font-weight="bold" opacity="0.35" dominant-baseline="central">{{ st.headroom }} ppm</svg:text>
                                        <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y + 14" font-size="11" opacity="0.35" dominant-baseline="central">{{ currentPpm }} → {{ maxPpm }} ppm ceiling</svg:text>
                                    }
                                    @case ('zone') {
                                        <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y - 38" font-size="12" font-weight="600" [attr.fill]="st.color" dominant-baseline="central">{{ st.label }} zone</svg:text>
                                        <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y - 10" font-size="16" font-weight="bold" [attr.fill]="st.color" dominant-baseline="central">{{ st.range }}</svg:text>
                                        <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y + 14" font-size="11" opacity="0.55" dominant-baseline="central">{{ st.desc }}</svg:text>
                                        <svg:line [attr.x1]="ctx.center.x - 36" [attr.y1]="ctx.center.y + 28" [attr.x2]="ctx.center.x + 36" [attr.y2]="ctx.center.y + 28" [attr.stroke]="ctx.textColor" stroke-opacity="0.12" stroke-width="1" />
                                        @if (st.isCritical) {
                                            <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y + 44" font-size="11" font-weight="600" [attr.fill]="st.color" dominant-baseline="central">← we are here</svg:text>
                                        } @else {
                                            <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y + 44" font-size="11" opacity="0.38" dominant-baseline="central">threshold passed</svg:text>
                                        }
                                    }
                                    @default {
                                        <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y - 38" font-size="42" font-weight="bold" fill="#e5484d" dominant-baseline="central">{{ currentPpm.toFixed(1) }}</svg:text>
                                        <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y - 4" font-size="13" opacity="0.55" dominant-baseline="central">ppm CO₂ · 2024</svg:text>
                                        <svg:line [attr.x1]="ctx.center.x - 36" [attr.y1]="ctx.center.y + 10" [attr.x2]="ctx.center.x + 36" [attr.y2]="ctx.center.y + 10" [attr.stroke]="ctx.textColor" stroke-opacity="0.12" stroke-width="1" />
                                        <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y + 28" font-size="11" fill="#e5484d" opacity="0.7" dominant-baseline="central">↑ +{{ st.trend }} from 2023</svg:text>
                                        <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y + 48" font-size="10" opacity="0.35" dominant-baseline="central">Pre-industrial: {{ minPpm }} ppm</svg:text>
                                    }
                                }
                            </svg:g>
                        </ng-template>
                    </p-chart-annotation>
                    <p-chart-tooltip [valueFormatter]="tooltipRows" />
                    <p-chart-hover [brightness]="1.06" />
                    <p-chart-title text="Atmospheric CO₂ concentration — Mauna Loa" />
                    <p-chart-caption text="Source: NOAA Global Monitoring Laboratory · 2024 annual mean · Pre-industrial baseline 280 ppm" />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GaugeAtmosphericCoConcentrationMaunaLoaDoc {
    readonly data = data;
    readonly colors = colors;
    readonly currentPpm = CURRENT_PPM;
    readonly maxPpm = MAX_PPM;
    readonly minPpm = MIN_PPM;

    annoState(ctx: AnnotationContext): SeismicState {
        const hovered = ctx.hoveredItem;
        const slice = hovered ? data[hovered.index] : null;

        if (slice && slice.label === 'Empty') return { mode: 'empty', headroom: (MAX_PPM - CURRENT_PPM).toFixed(1) };

        if (slice) {
            return { mode: 'zone', color: colors[hovered!.index], label: slice.label, range: ZONE_RANGES[slice.label] ?? '', desc: ZONE_DESC[slice.label] ?? '', isCritical: slice.label === 'Critical' };
        }

        return { mode: 'default', trend: (CURRENT_PPM - PREV_PPM).toFixed(1) };
    }

    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        if (ctx.label === 'Empty') {
            return [
                { label: 'Range', value: `${CURRENT_PPM} – ${MAX_PPM} ppm` },
                { label: '', value: `${(MAX_PPM - CURRENT_PPM).toFixed(1)} ppm before reaching the 450 ppm ceiling` }
            ];
        }

        const zoneColor = colors[['Safe', 'Watch', 'Critical'].indexOf(ctx.label)];

        return [
            { label: 'Range', value: ZONE_RANGES[ctx.label] ?? '', color: zoneColor },
            { label: '', value: ZONE_DESC[ctx.label] ?? '' }
        ];
    };
}

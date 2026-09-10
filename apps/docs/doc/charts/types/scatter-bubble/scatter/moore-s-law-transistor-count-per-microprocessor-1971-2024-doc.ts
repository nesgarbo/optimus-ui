import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type AnnotationContext, type TickValue, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';
import { BASELINE_YEAR, chips, projectMoore, spotlights } from '@/doc/charts/data/mooresLaw';

const CHIP_BG = 'light-dark(rgba(15, 23, 42, 0.82), rgba(226, 232, 240, 0.92))';
const CHIP_TEXT = 'light-dark(#ffffff, #0f172a)';
const SPOT_RING = 'light-dark(#0f172a, #e2e8f0)';

let measureCtx: CanvasRenderingContext2D | null = null;

function measureLabelWidth(label: string, fontPx: number, fontFamily: string): number {
    if (typeof document !== 'undefined') measureCtx ??= document.createElement('canvas').getContext('2d');

    if (!measureCtx) return label.length * fontPx * 0.55;

    measureCtx.font = `600 ${fontPx}px ${fontFamily}`;

    return measureCtx.measureText(label).width;
}

interface MooresLineBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    bx: number;
    by: number;
    bw: number;
    bh: number;
    fs: number;
}

interface SpotlightBox {
    cx: number;
    cy: number;
    bx: number;
    by: number;
    bw: number;
    bh: number;
    fs: number;
    padX: number;
    label: string;
}

const MOORES_LABEL = "Moore's Law · 2× / 2 yr";

@Component({
    selector: 'types-scatter-bubble-scatter-moore-s-law-transistor-count-per-microprocessor-1971-2024-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>ChartYAxis type="logarithmic"</i> flattens an eight-order-of-magnitude span into a legible diagonal; the <i>tickFormat</i> callback propagates to the default <i>ChartTooltip</i>, so hovering shows compact suffixes without a custom
                render callback. A <i>ChartAnnotation</i> with <i>placement="beforeData"</i> draws the theoretical projection as a dashed line behind the data; a second <i>ChartAnnotation</i> spotlights five barrier-crossing chips.
                <i>ChartZoom mode="x"</i> and <i>ChartNavigator</i> let users focus on specific decades without losing global context.
            </p>
            <p>#### SvgScatterMooresLawDemo.ts</p>
            <p>#### mooresLaw.ts</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 460px">
                <p-chart-svg>
                    <p-chart-scatter id="chips" [data]="data" valueXField="year" valueYField="count" color="#2563eb" [markerSize]="7" />
                    <p-chart-annotation>
                        <ng-template pChartAnnotationDef let-ctx>
                            @if (mooresLine(ctx); as m) {
                                <svg:g>
                                    <svg:line [attr.x1]="m.x1" [attr.y1]="m.y1" [attr.x2]="m.x2" [attr.y2]="m.y2" stroke="#e5484d" stroke-width="1.5" stroke-dasharray="8 5" opacity="0.55" />
                                    <svg:rect [attr.x]="m.bx" [attr.y]="m.by" [attr.width]="m.bw" [attr.height]="m.bh" rx="4" ry="4" fill="#e5484d" />
                                    <svg:text [attr.x]="m.bx + m.bw / 2" [attr.y]="m.by + m.bh / 2" text-anchor="middle" dominant-baseline="central" [attr.font-size]="m.fs" font-weight="600" fill="#ffffff">{{ mooresLabel }}</svg:text>
                                </svg:g>
                            }
                        </ng-template>
                    </p-chart-annotation>
                    <p-chart-annotation>
                        <ng-template pChartAnnotationDef let-ctx>
                            <svg:g>
                                @for (s of spotlightBoxes(ctx); track s.label) {
                                    <svg:circle [attr.cx]="s.cx" [attr.cy]="s.cy" r="10" fill="none" [style.stroke]="spotRing" stroke-width="1.25" opacity="0.45" />
                                    <svg:rect [attr.x]="s.bx" [attr.y]="s.by" [attr.width]="s.bw" [attr.height]="s.bh" rx="4" ry="4" [style.fill]="chipBg" />
                                    <svg:text [attr.x]="s.bx + s.padX" [attr.y]="s.by + s.bh / 2" text-anchor="start" dominant-baseline="central" [attr.font-size]="s.fs" font-weight="600" [style.fill]="chipText">{{ s.label }}</svg:text>
                                }
                            </svg:g>
                        </ng-template>
                    </p-chart-annotation>
                    <p-chart-tooltip [valueFormatter]="tooltipRows" />
                    <p-chart-hover [brightness]="1.15" />
                    <p-chart-x-axis label="Year" [tickFormat]="formatYear" [chartPaddingMax]="0.1" />
                    <p-chart-y-axis label="Transistor count" type="logarithmic" [tickFormat]="formatCount" [chartPaddingMax]="0.1" />
                    <p-chart-title text="Moore's Law — transistor count per microprocessor, 1971–2024" />
                    <p-chart-caption text="Log-Y axis flattens 2×/2yr into a straight line · drag to zoom range · Source: Intel/AMD/NVIDIA/Apple/IBM spec sheets" />
                    <p-chart-export-menu filename="moores-law-1971-2024" />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScatterMooreSLawTransistorCountPerMicroprocessor19712024Doc {
    readonly data = chips;
    readonly mooresLabel = MOORES_LABEL;
    readonly chipBg = CHIP_BG;
    readonly chipText = CHIP_TEXT;
    readonly spotRing = SPOT_RING;

    readonly formatYear = (v: TickValue) => String(Math.round(Number(v)));
    readonly formatCount = (v: TickValue) => {
        const n = Number(v);

        if (n >= 1e9) return `${(n / 1e9).toFixed(n >= 1e10 ? 0 : 1)}B`;

        if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M`;

        if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;

        return String(n);
    };

    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const d = chips[ctx.index ?? 0];

        if (!d) return [];

        return [
            { label: 'Year', value: this.formatYear(d.year) },
            { label: 'Transistors', value: this.formatCount(d.count) }
        ];
    };

    mooresLine(actx: AnnotationContext): MooresLineBox | null {
        if (!actx.xScale || !actx.yScale) return null;

        const x1 = actx.xScale(BASELINE_YEAR);
        const y1 = actx.yScale(projectMoore(BASELINE_YEAR));
        const x2 = actx.xScale(2024);
        const y2 = actx.yScale(projectMoore(2024));

        if (x1 == null || y1 == null || x2 == null || y2 == null) return null;

        const fs = actx.responsive.pick({ xs: 9, sm: 10, md: 11 });
        const tw = measureLabelWidth(MOORES_LABEL, fs, actx.fontFamily ?? 'system-ui');
        const padX = 6;
        const bh = actx.responsive.pick({ xs: 15, sm: 16, md: 18 });
        const bw = tw + padX * 2;

        return { x1, y1, x2, y2, bx: x2 - bw - 4, by: y2 - bh - 6, bw, bh, fs };
    }

    spotlightBoxes(actx: AnnotationContext): SpotlightBox[] {
        if (!actx.xScale || !actx.yScale) return [];

        const boxes: SpotlightBox[] = [];

        for (const s of spotlights) {
            const cx = actx.xScale(s.year);
            const cy = actx.yScale(s.count);

            if (cx == null || cy == null) continue;

            const fs = actx.responsive.pick({ xs: 8.5, sm: 9.5, md: 10.5 });
            const tw = measureLabelWidth(s.label, fs, actx.fontFamily ?? 'system-ui');
            const padX = 6;
            const bh = actx.responsive.pick({ xs: 14, sm: 15, md: 17 });
            const bw = tw + padX * 2;
            const onLeft = s.place === 'left';
            const minX = actx.chartArea.x;
            const maxX = actx.width - 4;
            const bx = Math.max(minX, Math.min(onLeft ? cx - 12 - bw : cx + 12, maxX - bw));

            boxes.push({ cx, cy, bx, by: cy - bh / 2, bw, bh, fs, padX, label: s.label });
        }

        return boxes;
    }
}

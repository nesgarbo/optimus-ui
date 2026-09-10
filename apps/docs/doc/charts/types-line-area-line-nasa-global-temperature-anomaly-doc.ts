import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type ItemContext, type SegmentContext, type TooltipRenderContext } from '@openng/optimus-ui/charts';
import { temperatureAnomaly } from '@/doc/charts/data/temperatureAnomaly';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

@Component({
    selector: 'types-line-area-line-nasa-global-temperature-anomaly-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>segmentColor</i> splits the line at zero so warming years stand out against cooler ones. Two <i>ChartReferenceLine</i> components mark the baseline and the 1.5°C Paris Agreement target. Drag the <i>ChartNavigator</i> to zoom into
                any decade; <i>ChartZoom</i> handles the interaction and <i>minUnit="month"</i> prevents zooming past monthly granularity.
            </p>
            <p>#### SvgLineTemperatureAnomalyDemo.ts</p>
            <p>#### temperatureAnomaly.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 600 }">
                        <p-chart-line [data]="data" categoryXField="ts" valueYField="v" [lineStrokeWidth]="1.5" [segmentColor]="segmentColor" [pointBackgroundColor]="pointColor" />
                        <p-chart-reference-line [y]="0" stroke="#94a3b8" [lineDash]="[4, 3]" [lineStrokeWidth]="1" />
                        <p-chart-reference-line [y]="1.5" stroke="#ffad5a" [lineDash]="[6, 3]" [lineStrokeWidth]="1.5" label="Paris 1.5 °C" labelPosition="end" />
                        <p-chart-x-axis type="time" minUnit="month" [min]="data[0].ts" [max]="data[data.length - 1].ts" />
                        <p-chart-y-axis />
                        <p-chart-tooltip>
                            <ng-template pChartTooltipDef let-ctx>
                                <div
                                    style="padding: 10px 14px; min-width: 170px; background: var(--p-popover-background, var(--p-content-background)); backdrop-filter: blur(12px); border-radius: 8px; border: 1px solid var(--p-content-border-color); color: var(--p-text-color)"
                                >
                                    <div style="font-weight: 600; font-size: 13px; margin-bottom: 8px; opacity: 0.7">{{ label(ctx) }}</div>
                                    <div style="display: flex; justify-content: space-between; gap: 16px; font-size: 14px">
                                        <span style="opacity: 0.55">Anomaly</span>
                                        <span [style.font-weight]="700" [style.color]="color(ctx)">{{ anomaly(ctx) }}</span>
                                    </div>
                                    <div style="font-size: 11px; opacity: 0.4; margin-top: 6px">vs 1951–1980 baseline</div>
                                </div>
                            </ng-template>
                        </p-chart-tooltip>
                        <p-chart-zoom mode="x" />
                        <p-chart-navigator />
                        <p-chart-title text="Global surface temperature anomaly — monthly" />
                        <p-chart-caption text="Source: NASA GISS · Monthly 1940–2024 · Baseline: 1951–1980 average · Red: warmer · Blue: cooler" />
                        <p-chart-export-menu filename="nasa-temperature-anomaly-monthly" />
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
export class LineAreaLineNasaGlobalTemperatureAnomalyDoc {
    readonly data = temperatureAnomaly;
    readonly segmentColor = (ctx: SegmentContext) => ((ctx.p1.value ?? 0) >= 0 ? '#e5484d' : '#5daeea');
    readonly pointColor = (ctx: ItemContext) => ((ctx.value ?? 0) >= 0 ? '#e5484d' : '#5daeea');

    label(ctx: TooltipRenderContext): string {
        const item = temperatureAnomaly[ctx.index!];
        const d = item ? new Date(item.ts) : null;

        return d ? `${MONTHS[d.getMonth()]} ${d.getFullYear()}` : ctx.label;
    }

    color(ctx: TooltipRenderContext): string {
        return (ctx.value as number) >= 0 ? '#e5484d' : '#5daeea';
    }

    anomaly(ctx: TooltipRenderContext): string {
        const val = ctx.value as number;

        return `${val >= 0 ? '+' : ''}${val.toFixed(2)} °C`;
    }
}

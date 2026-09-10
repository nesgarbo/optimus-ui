import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TooltipRow } from '@openng/optimus-ui/charts';
import { KPIS, type KpiRow, quarters, TARGET, useKpiPlayback } from '@/doc/charts/data/kpiScorecard';

@Component({
    selector: 'types-radar-radar-startup-kpi-scorecard-animated-quarterly-progress-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                The <i>animation</i> input on <i>ChartSvg</i> drives smooth polygon transitions as the selected quarter changes. A static dashed <i>ChartReferenceLine</i> ring marks the target score across all spokes, giving instant context for how
                each spoke tracks against the goal. <i>ChartTitle</i> and <i>ChartCaption</i> update reactively alongside the animated polygon.
            </p>
            <p>#### SvgRadarKpiScorecardDemo.ts</p>
            <p>#### kpiScorecard.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div class="year-slider">
                    <button type="button" class="play-btn" [class.playing]="playback.isPlaying()" (click)="playback.togglePlay()">
                        <i class="pi" [class.pi-pause]="playback.isPlaying()" [class.pi-play]="!playback.isPlaying()"></i>
                        {{ playback.isPlaying() ? 'Pause' : 'Play' }}
                    </button>
                    <span class="year-value">{{ quarter() }}</span>
                    <input type="range" class="year-range" min="0" [max]="maxIdx" step="1" [value]="playback.selectedIdx()" [style.--fill]="fill()" (input)="onSlide($event)" />
                </div>
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 500 }">
                        <p-chart-radar id="target" [data]="targetData" categoryXField="kpi" valueYField="score" name="Target (75)" color="#94a3b8" [fillOpacity]="0" [lineStrokeWidth]="1.2" [lineDash]="[5, 4]" />
                        <p-chart-radar id="actual" [data]="playback.data()" categoryXField="kpi" valueYField="score" name="Actual" color="#5daeea" [fillOpacity]="0.22" [lineStrokeWidth]="2.2" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                        <p-chart-tooltip [valueFormatter]="tooltipRows" />
                        <p-chart-hover />
                        <p-chart-legend position="top" />
                        <p-chart-title [text]="titleText()" />
                        <p-chart-caption [text]="captionText()" />
                        <p-chart-export-menu filename="kpi-scorecard-radar" />
                        <p-chart-accessibility />
                    </p-chart-svg>
                </div>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    styles: [
        `
            .year-slider {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 12px;
                margin-bottom: 1rem;
            }

            .year-slider .play-btn {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 12px;
                font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
                font-size: 12px;
                font-weight: 500;
                letter-spacing: 0.03em;
                text-transform: uppercase;
                border: 1px solid transparent;
                border-radius: 6px;
                background: transparent;
                color: var(--p-surface-500);
                cursor: pointer;
                transition:
                    color 0.15s,
                    background 0.15s,
                    border-color 0.15s;
            }

            .year-slider .play-btn:hover {
                color: var(--p-surface-900);
                border-color: var(--p-surface-200);
                background: var(--p-surface-100);
            }

            :host-context(.p-dark) .year-slider .play-btn {
                color: var(--p-surface-400);
            }

            :host-context(.p-dark) .year-slider .play-btn:hover {
                color: var(--p-surface-100);
                border-color: var(--p-surface-700);
                background: var(--p-surface-800);
            }

            .year-slider .play-btn.playing {
                font-weight: 600;
                color: var(--p-primary-color);
                border-color: color-mix(in srgb, var(--p-primary-color) 30%, transparent);
                background: color-mix(in srgb, var(--p-primary-color) 10%, transparent);
            }

            .year-slider .play-btn .pi {
                font-size: 10px;
            }

            .year-slider .year-value {
                font-size: 14px;
                font-weight: 600;
                width: 64px;
                text-align: center;
                font-variant-numeric: tabular-nums;
            }

            .year-slider .year-range {
                width: 14rem;
                flex: 0 0 auto;
                height: 16px;
                -webkit-appearance: none;
                appearance: none;
                background: transparent;
                cursor: pointer;
            }

            .year-slider .year-range:focus {
                outline: none;
            }

            .year-slider .year-range::-webkit-slider-runnable-track {
                height: 3px;
                border-radius: 3px;
                background: linear-gradient(to right, var(--p-slider-range-background, var(--p-primary-color)) var(--fill, 0%), var(--p-slider-track-background, var(--p-content-border-color)) var(--fill, 0%));
            }

            .year-slider .year-range::-webkit-slider-thumb {
                -webkit-appearance: none;
                margin-top: -6.5px;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: var(--p-slider-handle-background, var(--p-content-background, #fff));
                border: 1px solid var(--p-content-border-color);
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
            }

            .year-slider .year-range::-moz-range-track {
                height: 3px;
                border-radius: 3px;
                background: var(--p-slider-track-background, var(--p-content-border-color));
            }

            .year-slider .year-range::-moz-range-progress {
                height: 3px;
                border-radius: 3px;
                background: var(--p-slider-range-background, var(--p-primary-color));
            }

            .year-slider .year-range::-moz-range-thumb {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: var(--p-slider-handle-background, var(--p-content-background, #fff));
                border: 1px solid var(--p-content-border-color);
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
            }
        `
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadarRadarStartupKpiScorecardAnimatedQuarterlyProgressDoc {
    readonly playback = useKpiPlayback();
    readonly maxIdx = quarters.length - 1;
    readonly targetData: KpiRow[] = KPIS.map((kpi) => ({ kpi, score: TARGET }));

    readonly quarter = computed(() => quarters[this.playback.selectedIdx()]);
    private readonly avgScore = computed(() => Math.round(this.playback.data().reduce((s, r) => s + r.score, 0) / KPIS.length));
    private readonly aboveTarget = computed(() => this.playback.data().filter((r) => r.score >= TARGET).length);
    readonly titleText = computed(() => `Startup KPI Scorecard — ${this.quarter()}`);
    readonly captionText = computed(() => `Avg score ${this.avgScore()}/100 · ${this.aboveTarget()} of ${KPIS.length} KPIs at or above target · dashed ring = target (${TARGET})`);

    /** Filled portion of the slider track (`--fill`), matching the Vue Slider's range background. */
    readonly fill = computed(() => `${(this.playback.selectedIdx() / this.maxIdx) * 100}%`);

    onSlide(event: Event): void {
        this.playback.setIdx(Number((event.target as HTMLInputElement).value));
    }

    readonly tooltipRows = (value: number): TooltipRow[] => {
        const delta = value - TARGET;

        return [
            { label: this.quarter(), value: String(value) },
            { label: `vs Target (${TARGET})`, value: `${delta >= 0 ? '▲' : '▼'} ${delta >= 0 ? '+' : ''}${delta}`, color: delta >= 0 ? '#10a981' : '#e5484d' }
        ];
    };
}

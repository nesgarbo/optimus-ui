import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { FormsModule } from '@angular/forms';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { Select } from '@openng/optimus-ui/select';
import { SelectButton } from '@openng/optimus-ui/selectbutton';
import { Slider } from '@openng/optimus-ui/slider';
import { PlaygroundSectionComponent } from '@/doc/charts/_shared/playground-section.component';
import type { PlaygroundCodeSource } from '@/doc/charts/_shared/playground-code-source';

const series1Data = [
    { x: 14, y: 71, size: 12 },
    { x: 28, y: 58, size: 8 },
    { x: 42, y: 83, size: 20 },
    { x: 55, y: 67, size: 15 },
    { x: 63, y: 76, size: 10 },
    { x: 38, y: 49, size: 18 },
    { x: 72, y: 88, size: 7 },
    { x: 20, y: 62, size: 14 },
    { x: 48, y: 55, size: 22 },
    { x: 82, y: 91, size: 9 },
    { x: 35, y: 74, size: 16 },
    { x: 60, y: 43, size: 11 }
];

const series2Data = [
    { x: 22, y: 55, size: 19 },
    { x: 45, y: 79, size: 6 },
    { x: 58, y: 66, size: 13 },
    { x: 30, y: 88, size: 24 },
    { x: 68, y: 72, size: 8 },
    { x: 50, y: 45, size: 17 },
    { x: 75, y: 60, size: 11 },
    { x: 12, y: 78, size: 20 },
    { x: 88, y: 83, size: 5 },
    { x: 40, y: 52, size: 15 },
    { x: 62, y: 90, size: 9 },
    { x: 18, y: 65, size: 21 }
];

const series3Data = [
    { x: 36, y: 68, size: 14 },
    { x: 52, y: 82, size: 10 },
    { x: 70, y: 55, size: 18 },
    { x: 25, y: 73, size: 22 },
    { x: 44, y: 90, size: 7 },
    { x: 78, y: 61, size: 13 },
    { x: 16, y: 48, size: 25 },
    { x: 60, y: 77, size: 9 },
    { x: 85, y: 68, size: 16 },
    { x: 32, y: 85, size: 12 },
    { x: 48, y: 42, size: 20 },
    { x: 66, y: 59, size: 8 }
];

const seriesNames = ['Alpha', 'Beta', 'Gamma'];
const dataVarNames = ['alphaData', 'betaData', 'gammaData'];

@Component({
    selector: 'types-scatter-bubble-playground-playground-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, FormsModule, ChartsModule, Slider, SelectButton, Select, PlaygroundSectionComponent],
    template: `
        <app-docsectiontext>
            <p></p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div class="chart-playground-layout">
                    <div class="chart-playground-stage">
                        <p-chart-svg [responsive]="true" [height]="460">
                            @for (s of allSeries(); track s.name; let i = $index) {
                                <p-chart-scatter
                                    [id]="'series-' + i"
                                    [data]="s.data"
                                    valueXField="x"
                                    valueYField="y"
                                    [name]="s.name"
                                    [color]="s.color"
                                    [markerShape]="markerShape()"
                                    [markerSize]="bubbleMode() ? undefined : markerSize()"
                                    [pointRotation]="markerShape() !== 'circle' ? pointRotation() : undefined"
                                    [pointBorderStrokeWidth]="pointBorderWidth() > 0 ? pointBorderWidth() : undefined"
                                    [pointBorderColor]="pointBorderWidth() > 0 ? pointBorderColor() : undefined"
                                    [pointBorderDash]="pointBorderWidth() > 0 ? pointBorderDashProp() : undefined"
                                    [pointBorderDashOffset]="pointBorderWidth() > 0 && pointBorderDashProp() ? pointBorderDashOffset() : undefined"
                                    [pointBorderJoinStyle]="pointBorderWidth() > 0 ? pointBorderJoinStyle() : undefined"
                                    [sizeField]="bubbleMode() ? 'size' : undefined"
                                    [minSize]="bubbleMode() ? minSize() : undefined"
                                    [maxSize]="bubbleMode() ? maxSize() : undefined"
                                    [hoverPointRadius]="hoverPointRadius() > 0 ? hoverPointRadius() : undefined"
                                    [pointHoverBackgroundColor]="pointHoverBgMode() === 'custom' ? pointHoverBackgroundColor() : undefined"
                                    [pointHoverBorderStrokeWidth]="pointHoverBorderStrokeWidth() > 0 ? pointHoverBorderStrokeWidth() : undefined"
                                    [pointHoverBorderColor]="pointHoverBorderColorMode() === 'custom' ? pointHoverBorderColor() : undefined"
                                    [pointHitRadius]="pointHitRadius() !== 1 ? pointHitRadius() : undefined"
                                    [connectNulls]="connectNullsMode() !== 'gap' ? connectNullsMode() : undefined"
                                    [opacity]="opacity() !== 1 ? opacity() : undefined"
                                    [pointFillOpacity]="pointFillOpacity() !== 0.7 ? pointFillOpacity() : undefined"
                                />
                            }
                            <p-chart-x-axis label="X" />
                            <p-chart-y-axis label="Y" />
                            <p-chart-legend position="bottom" />
                            <p-chart-tooltip />
                            <p-chart-hover [radiusMultiplier]="hoverRadiusMultiplier()" [brightness]="hoverBrightness()" [dimOpacity]="hoverDimOpacity()" />
                        </p-chart-svg>
                    </div>

                    <div class="playground-controls">
                        <div class="playground-controls-header">Controls</div>

                        <app-playground-section title="Series" [open]="openGroups().series" (toggle)="toggleGroup('series')">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">series</label>
                                <p-selectbutton [options]="seriesOptions" [ngModel]="seriesCountStr()" (ngModelChange)="setSeriesCountStr($event)" [allowEmpty]="false" />
                            </div>
                        </app-playground-section>

                        <app-playground-section title="Marker" [open]="openGroups().marker" (toggle)="toggleGroup('marker')">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">markerShape</label>
                                <p-select [options]="markerShapeOptions" [ngModel]="markerShape()" (ngModelChange)="markerShape.set($event)" styleClass="w-full" appendTo="body" />
                            </div>
                            @if (!bubbleMode()) {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">markerSize — {{ markerSize() }}px</label>
                                    <p-slider [ngModel]="markerSize()" (ngModelChange)="markerSize.set($event)" [min]="2" [max]="30" [step]="1" styleClass="w-full" />
                                </div>
                            }
                            @if (markerShape() !== 'circle') {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">pointRotation — {{ pointRotation() }}°</label>
                                    <p-slider [ngModel]="pointRotation()" (ngModelChange)="pointRotation.set($event)" [min]="0" [max]="360" [step]="5" styleClass="w-full" />
                                </div>
                            }
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">pointHitRadius — {{ pointHitRadius() }}px</label>
                                <p-slider [ngModel]="pointHitRadius()" (ngModelChange)="pointHitRadius.set($event)" [min]="1" [max]="20" [step]="1" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">opacity — {{ opacity().toFixed(2) }}</label>
                                <p-slider [ngModel]="opacity()" (ngModelChange)="opacity.set($event)" [min]="0.1" [max]="1" [step]="0.05" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">pointFillOpacity — {{ pointFillOpacity().toFixed(2) }}</label>
                                <p-slider [ngModel]="pointFillOpacity()" (ngModelChange)="pointFillOpacity.set($event)" [min]="0" [max]="1" [step]="0.05" styleClass="w-full" />
                            </div>
                        </app-playground-section>

                        <app-playground-section title="Bubble" [open]="openGroups().bubble" (toggle)="toggleGroup('bubble')">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">bubbleMode (size field)</label>
                                <p-selectbutton [options]="onOffValueOptions" optionLabel="label" optionValue="value" [ngModel]="bubbleMode()" (ngModelChange)="bubbleMode.set($event)" [allowEmpty]="false" />
                            </div>
                            @if (bubbleMode()) {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">minSize — {{ minSize() }}px</label>
                                    <p-slider [ngModel]="minSize()" (ngModelChange)="minSize.set($event)" [min]="2" [max]="20" [step]="1" styleClass="w-full" />
                                </div>
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">maxSize — {{ maxSize() }}px</label>
                                    <p-slider [ngModel]="maxSize()" (ngModelChange)="maxSize.set($event)" [min]="10" [max]="80" [step]="2" styleClass="w-full" />
                                </div>
                            }
                        </app-playground-section>

                        <app-playground-section title="Color" [open]="openGroups().color" (toggle)="toggleGroup('color')">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">color (Alpha)</label>
                                <div class="flex items-center gap-2">
                                    <input type="color" [value]="color()" (input)="color.set($any($event.target).value)" style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0" />
                                    <span class="text-xs font-semibold">{{ color() }}</span>
                                </div>
                            </div>
                            @if (seriesCount() >= 2) {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">color (Beta)</label>
                                    <div class="flex items-center gap-2">
                                        <input type="color" [value]="color2()" (input)="color2.set($any($event.target).value)" style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0" />
                                        <span class="text-xs font-semibold">{{ color2() }}</span>
                                    </div>
                                </div>
                            }
                            @if (seriesCount() >= 3) {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">color (Gamma)</label>
                                    <div class="flex items-center gap-2">
                                        <input type="color" [value]="color3()" (input)="color3.set($any($event.target).value)" style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0" />
                                        <span class="text-xs font-semibold">{{ color3() }}</span>
                                    </div>
                                </div>
                            }
                        </app-playground-section>

                        <app-playground-section title="Border" [open]="openGroups().border" (toggle)="toggleGroup('border')">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">pointBorderStrokeWidth — {{ pointBorderWidth() }}px</label>
                                <p-slider [ngModel]="pointBorderWidth()" (ngModelChange)="pointBorderWidth.set($event)" [min]="0" [max]="8" [step]="0.5" styleClass="w-full" />
                            </div>
                            @if (pointBorderWidth() > 0) {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">pointBorderColor</label>
                                    <div class="flex items-center gap-2">
                                        <input type="color" [value]="pointBorderColor()" (input)="pointBorderColor.set($any($event.target).value)" style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0" />
                                        <span class="text-xs font-semibold">{{ pointBorderColor() }}</span>
                                    </div>
                                </div>
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">pointBorderDash</label>
                                    <p-selectbutton [options]="dashOptions" [ngModel]="pointBorderDashMode()" (ngModelChange)="pointBorderDashMode.set($event)" [allowEmpty]="false" />
                                </div>
                                @if (pointBorderDashMode() !== 'none') {
                                    <div class="flex flex-col gap-1">
                                        <label class="text-xs text-surface-500 dark:text-surface-400">pointBorderDashOffset — {{ pointBorderDashOffset() }}</label>
                                        <p-slider [ngModel]="pointBorderDashOffset()" (ngModelChange)="pointBorderDashOffset.set($event)" [min]="0" [max]="20" [step]="1" styleClass="w-full" />
                                    </div>
                                }
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">pointBorderJoinStyle</label>
                                    <p-selectbutton [options]="joinOptions" [ngModel]="pointBorderJoinStyle()" (ngModelChange)="pointBorderJoinStyle.set($event)" [allowEmpty]="false" />
                                </div>
                            }
                        </app-playground-section>

                        <app-playground-section title="Hover" [open]="openGroups().hover" (toggle)="toggleGroup('hover')">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">brightness — {{ hoverBrightness().toFixed(2) }}</label>
                                <p-slider [ngModel]="hoverBrightness()" (ngModelChange)="hoverBrightness.set($event)" [min]="1" [max]="1.5" [step]="0.05" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">dimOpacity — {{ hoverDimOpacity().toFixed(2) }}</label>
                                <p-slider [ngModel]="hoverDimOpacity()" (ngModelChange)="hoverDimOpacity.set($event)" [min]="0" [max]="1" [step]="0.05" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">radiusMultiplier — {{ hoverRadiusMultiplier().toFixed(2) }}</label>
                                <p-slider [ngModel]="hoverRadiusMultiplier()" (ngModelChange)="hoverRadiusMultiplier.set($event)" [min]="1" [max]="2" [step]="0.05" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">hoverPointRadius — {{ hoverPointRadius() === 0 ? 'same' : hoverPointRadius() + 'px' }}</label>
                                <p-slider [ngModel]="hoverPointRadius()" (ngModelChange)="hoverPointRadius.set($event)" [min]="0" [max]="30" [step]="1" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">pointHoverBackgroundColor</label>
                                <p-selectbutton [options]="autoCustomOptions" [ngModel]="pointHoverBgMode()" (ngModelChange)="pointHoverBgMode.set($event)" [allowEmpty]="false" />
                            </div>
                            @if (pointHoverBgMode() === 'custom') {
                                <div class="flex flex-col gap-1">
                                    <div class="flex items-center gap-2">
                                        <input
                                            type="color"
                                            [value]="pointHoverBackgroundColor()"
                                            (input)="pointHoverBackgroundColor.set($any($event.target).value)"
                                            style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0"
                                        />
                                        <span class="text-xs font-semibold">{{ pointHoverBackgroundColor() }}</span>
                                    </div>
                                </div>
                            }
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">pointHoverBorderStrokeWidth — {{ pointHoverBorderStrokeWidth() }}px</label>
                                <p-slider [ngModel]="pointHoverBorderStrokeWidth()" (ngModelChange)="pointHoverBorderStrokeWidth.set($event)" [min]="0" [max]="8" [step]="0.5" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">pointHoverBorderColor</label>
                                <p-selectbutton [options]="autoCustomOptions" [ngModel]="pointHoverBorderColorMode()" (ngModelChange)="pointHoverBorderColorMode.set($event)" [allowEmpty]="false" />
                            </div>
                            @if (pointHoverBorderColorMode() === 'custom') {
                                <div class="flex flex-col gap-1">
                                    <div class="flex items-center gap-2">
                                        <input
                                            type="color"
                                            [value]="pointHoverBorderColor()"
                                            (input)="pointHoverBorderColor.set($any($event.target).value)"
                                            style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0"
                                        />
                                        <span class="text-xs font-semibold">{{ pointHoverBorderColor() }}</span>
                                    </div>
                                </div>
                            }
                        </app-playground-section>
                    </div>
                </div>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScatterBubblePlaygroundPlaygroundDoc {
    readonly seriesOptions = ['1', '2', '3'];
    readonly markerShapeOptions = ['circle', 'square', 'triangle', 'cross', 'star'];
    readonly dashOptions = ['none', 'dashed', 'dotted'];
    readonly joinOptions = ['miter', 'round', 'bevel'];
    readonly autoCustomOptions = ['auto', 'custom'];
    readonly onOffValueOptions = [
        { label: 'off', value: false },
        { label: 'on', value: true }
    ];

    readonly seriesCount = signal(2);
    readonly color = signal('#7c8cff');
    readonly color2 = signal('#5ccf9f');
    readonly color3 = signal('#ffad5a');

    readonly markerShape = signal<'circle' | 'square' | 'triangle' | 'cross' | 'star'>('circle');
    readonly markerSize = signal(8);
    readonly pointRotation = signal(0);

    readonly pointBorderWidth = signal(0);
    readonly pointBorderColor = signal('#ffffff');
    readonly pointBorderDashMode = signal('none');
    readonly pointBorderDashOffset = signal(0);
    readonly pointBorderJoinStyle = signal<'miter' | 'round' | 'bevel'>('miter');

    readonly bubbleMode = signal(false);
    readonly minSize = signal(6);
    readonly maxSize = signal(30);

    readonly hoverPointRadius = signal(0);
    readonly pointHoverBgMode = signal('auto');
    readonly pointHoverBackgroundColor = signal('#ffdc7a');
    readonly pointHoverBorderColorMode = signal('auto');
    readonly pointHoverBorderStrokeWidth = signal(0);
    readonly pointHoverBorderColor = signal('#ffffff');
    readonly pointHitRadius = signal(1);

    readonly connectNullsMode = signal<'gap' | 'zero'>('gap');
    readonly opacity = signal(1);
    readonly pointFillOpacity = signal(0.7);

    readonly hoverRadiusMultiplier = signal(1.3);
    readonly hoverBrightness = signal(1.1);
    readonly hoverDimOpacity = signal(1);

    readonly seriesCountStr = computed(() => String(this.seriesCount()));

    readonly pointBorderDashProp = computed<number[] | undefined>(() => {
        if (this.pointBorderDashMode() === 'dashed') return [6, 4];

        if (this.pointBorderDashMode() === 'dotted') return [2, 2];

        return undefined;
    });

    readonly allSeries = computed(() =>
        [
            { data: series1Data, color: this.color(), name: seriesNames[0] },
            { data: series2Data, color: this.color2(), name: seriesNames[1] },
            { data: series3Data, color: this.color3(), name: seriesNames[2] }
        ].slice(0, this.seriesCount())
    );

    readonly openGroups = signal<Record<string, boolean>>({ series: true, marker: false, bubble: false, color: false, border: false, hover: false });

    toggleGroup(group: string): void {
        this.openGroups.update((groups) => ({ ...groups, [group]: !groups[group] }));
    }

    setSeriesCountStr(value: string): void {
        this.seriesCount.set(Number(value));
    }

    readonly generatedCode = computed(() => {
        const hoverAttrs = this.buildHoverProps();
        const indent = '\n        ';
        const entries = [
            { varName: dataVarNames[0], color: this.color(), name: seriesNames[0] },
            { varName: dataVarNames[1], color: this.color2(), name: seriesNames[1] },
            { varName: dataVarNames[2], color: this.color3(), name: seriesNames[2] }
        ].slice(0, this.seriesCount());

        const seriesBlocks = entries.map((s, i) => {
            const props = this.buildScatterProps(i, s.varName, s.color, s.name);

            return `    <p-chart-scatter${indent}${props.map((p) => `    ${p}`).join(indent)}\n    />`;
        });

        return `<p-chart-svg [responsive]="true" [height]="460">
${seriesBlocks.join('\n')}
    <p-chart-x-axis label="X" />
    <p-chart-y-axis label="Y" />
    <p-chart-legend position="bottom" />
    <p-chart-tooltip />
    <p-chart-hover${hoverAttrs} />
</p-chart-svg>`;
    });

    private buildScatterProps(i: number, varName: string, seriesColor: string, seriesName: string): string[] {
        const props: string[] = [`id="series-${i}"`, `[data]="${varName}"`, 'valueXField="x"', 'valueYField="y"', `name="${seriesName}"`, `color="${seriesColor}"`];

        if (this.markerShape() !== 'circle') props.push(`markerShape="${this.markerShape()}"`);

        if (!this.bubbleMode()) props.push(`[markerSize]="${this.markerSize()}"`);

        if (this.markerShape() !== 'circle' && this.pointRotation() !== 0) props.push(`[pointRotation]="${this.pointRotation()}"`);

        if (this.pointBorderWidth() > 0) {
            props.push(`[pointBorderStrokeWidth]="${this.pointBorderWidth()}"`);
            props.push(`pointBorderColor="${this.pointBorderColor()}"`);

            if (this.pointBorderDashProp()) {
                props.push(`[pointBorderDash]="[${this.pointBorderDashProp()!.join(', ')}]"`);
                if (this.pointBorderDashOffset() !== 0) props.push(`[pointBorderDashOffset]="${this.pointBorderDashOffset()}"`);
            }

            if (this.pointBorderJoinStyle() !== 'miter') props.push(`pointBorderJoinStyle="${this.pointBorderJoinStyle()}"`);
        }

        if (this.bubbleMode()) {
            props.push('sizeField="size"');
            props.push(`[minSize]="${this.minSize()}"`);
            props.push(`[maxSize]="${this.maxSize()}"`);
        }

        if (this.hoverPointRadius() > 0) props.push(`[hoverPointRadius]="${this.hoverPointRadius()}"`);

        if (this.pointHoverBgMode() === 'custom') props.push(`pointHoverBackgroundColor="${this.pointHoverBackgroundColor()}"`);

        if (this.pointHoverBorderStrokeWidth() > 0) {
            props.push(`[pointHoverBorderStrokeWidth]="${this.pointHoverBorderStrokeWidth()}"`);
            props.push(`pointHoverBorderColor="${this.pointHoverBorderColor()}"`);
        }

        if (this.pointHitRadius() !== 1) props.push(`[pointHitRadius]="${this.pointHitRadius()}"`);

        if (this.connectNullsMode() !== 'gap') props.push(`connectNulls="${this.connectNullsMode()}"`);

        if (this.opacity() !== 1) props.push(`[opacity]="${this.opacity()}"`);

        if (this.pointFillOpacity() !== 0.7) props.push(`[pointFillOpacity]="${this.pointFillOpacity()}"`);

        return props;
    }

    private buildHoverProps(): string {
        const parts: string[] = [];

        if (this.hoverBrightness() !== 1.1) parts.push(`[brightness]="${this.hoverBrightness()}"`);

        if (this.hoverDimOpacity() !== 1) parts.push(`[dimOpacity]="${this.hoverDimOpacity()}"`);

        return parts.length ? ` ${parts.join(' ')}` : '';
    }
}

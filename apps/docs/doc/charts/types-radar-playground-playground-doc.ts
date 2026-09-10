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

const data = [
    { metric: 'Activation', value: 85 },
    { metric: 'Reliability', value: 92 },
    { metric: 'Reporting', value: 78 },
    { metric: 'Security', value: 88 },
    { metric: 'Scale', value: 72 },
    { metric: 'Documentation', value: 65 },
    { metric: 'Support', value: 80 }
];

@Component({
    selector: 'types-radar-playground-playground-doc',
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
                        <p-chart-svg [width]="460" [height]="460">
                            <p-chart-radar
                                id="playground"
                                [data]="data"
                                categoryXField="metric"
                                valueYField="value"
                                name="Performance"
                                [color]="color()"
                                [fillOpacity]="fillOpacity()"
                                [lineStrokeWidth]="lineWidth()"
                                [lineStyle]="lineStyle()"
                                [curve]="curve()"
                                [showMarkers]="showMarkers()"
                                [markerSize]="markerSize()"
                                [markerShape]="markerShape()"
                                [pointRotation]="pointRotation()"
                                [pointBorderStrokeWidth]="pointBorderWidth() > 0 ? pointBorderWidth() : undefined"
                                [pointBorderColor]="pointBorderWidth() > 0 ? pointBorderColor() : undefined"
                                [pointBorderDash]="pointBorderDashProp()"
                                [pointBorderDashOffset]="pointBorderDashProp() ? pointBorderDashOffset() : undefined"
                                [pointBorderJoinStyle]="pointBorderJoinStyle()"
                                [borderStrokeWidth]="borderWidth()"
                                [borderColor]="borderWidth() > 0 ? borderColor() : undefined"
                                [borderAlign]="borderWidth() > 0 ? borderAlign() : undefined"
                                [borderDash]="borderDashProp()"
                                [borderDashOffset]="borderDashProp() ? borderDashOffset() : undefined"
                                [borderJoinStyle]="borderJoinStyle()"
                                [lineDash]="lineDashProp()"
                                [hoverColor]="hoverColorMode() === 'custom' ? hoverColor() : undefined"
                                [hoverBorderColor]="hoverBorderColorMode() === 'custom' ? hoverBorderColor() : undefined"
                            />
                            <p-chart-x-axis [gridShape]="gridShape()" [color]="customGridColor() ? gridColor() : undefined" />
                            <p-chart-y-axis [gridShape]="gridShape()" [tickCount]="gridLines()" [gridColor]="customGridColor() ? gridColor() : undefined" [gridStrokeWidth]="gridWidth()" [gridOpacity]="gridOpacity()" [gridStyle]="gridStyle()" />
                            <p-chart-legend position="bottom" />
                            <p-chart-tooltip />
                            <p-chart-hover [brightness]="hoverBrightness()" [dimOpacity]="hoverDimOpacity()" />
                        </p-chart-svg>
                    </div>

                    <div class="playground-controls">
                        <div class="playground-controls-header">Controls</div>

                        <app-playground-section title="Series" [open]="openGroups().series" (toggle)="toggleGroup('series')">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">fillOpacity — {{ fillOpacity().toFixed(2) }}</label>
                                <p-slider [ngModel]="fillOpacity()" (ngModelChange)="fillOpacity.set($event)" [min]="0" [max]="1" [step]="0.05" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">lineStrokeWidth — {{ lineWidth() }}px</label>
                                <p-slider [ngModel]="lineWidth()" (ngModelChange)="lineWidth.set($event)" [min]="0.5" [max]="6" [step]="0.5" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">lineStyle</label>
                                <p-selectbutton [options]="lineStyleOptions" [ngModel]="lineStyle()" (ngModelChange)="lineStyle.set($event)" [allowEmpty]="false" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">lineDash</label>
                                <p-selectbutton [options]="lineDashOptions" [ngModel]="lineDashMode()" (ngModelChange)="lineDashMode.set($event)" [allowEmpty]="false" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">curve</label>
                                <p-selectbutton [options]="curveOptions" [ngModel]="curve()" (ngModelChange)="curve.set($event)" [allowEmpty]="false" />
                            </div>
                        </app-playground-section>

                        <app-playground-section title="Grid" [open]="openGroups().grid" (toggle)="toggleGroup('grid')">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">gridShape</label>
                                <p-selectbutton [options]="gridShapeOptions" [ngModel]="gridShape()" (ngModelChange)="gridShape.set($event)" [allowEmpty]="false" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">gridLines — {{ gridLines() }}</label>
                                <p-slider [ngModel]="gridLines()" (ngModelChange)="gridLines.set($event)" [min]="1" [max]="10" [step]="1" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">gridStyle</label>
                                <p-selectbutton [options]="gridStyleOptions" [ngModel]="gridStyle()" (ngModelChange)="gridStyle.set($event)" [allowEmpty]="false" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">gridStrokeWidth — {{ gridWidth() }}px</label>
                                <p-slider [ngModel]="gridWidth()" (ngModelChange)="gridWidth.set($event)" [min]="0.5" [max]="4" [step]="0.5" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">gridOpacity — {{ gridOpacity().toFixed(2) }}</label>
                                <p-slider [ngModel]="gridOpacity()" (ngModelChange)="gridOpacity.set($event)" [min]="0" [max]="1" [step]="0.05" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">gridColor</label>
                                <p-selectbutton [options]="onOffOptions" [ngModel]="customGridColorOpt()" (ngModelChange)="setCustomGridColorOpt($event)" [allowEmpty]="false" />
                            </div>
                            @if (customGridColor()) {
                                <div class="flex items-center gap-2">
                                    <input type="color" [value]="gridColor()" (input)="gridColor.set($any($event.target).value)" style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0" />
                                    <span class="text-xs font-semibold">{{ gridColor() }}</span>
                                </div>
                            }
                        </app-playground-section>

                        <app-playground-section title="Color" [open]="openGroups().color" (toggle)="toggleGroup('color')">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">color</label>
                                <div class="flex items-center gap-2">
                                    <input type="color" [value]="color()" (input)="color.set($any($event.target).value)" style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0" />
                                    <span class="text-xs font-semibold">{{ color() }}</span>
                                </div>
                            </div>
                        </app-playground-section>

                        <app-playground-section title="Markers" [open]="openGroups().markers" (toggle)="toggleGroup('markers')">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">showMarkers</label>
                                <p-selectbutton [options]="onOffOptions" [ngModel]="showMarkersOpt()" (ngModelChange)="setShowMarkersOpt($event)" [allowEmpty]="false" />
                            </div>
                            @if (showMarkers()) {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">markerSize — {{ markerSize() }}px</label>
                                    <p-slider [ngModel]="markerSize()" (ngModelChange)="markerSize.set($event)" [min]="2" [max]="12" [step]="1" styleClass="w-full" />
                                </div>
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">markerShape</label>
                                    <p-select [options]="markerShapeOptions" [ngModel]="markerShape()" (ngModelChange)="markerShape.set($event)" styleClass="w-full" appendTo="body" />
                                </div>
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">pointRotation — {{ pointRotation() }}°</label>
                                    <p-slider [ngModel]="pointRotation()" (ngModelChange)="pointRotation.set($event)" [min]="0" [max]="360" [step]="15" styleClass="w-full" />
                                </div>
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
                            }
                        </app-playground-section>

                        <app-playground-section title="Border" [open]="openGroups().border" (toggle)="toggleGroup('border')">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">borderStrokeWidth — {{ borderWidth() }}px</label>
                                <p-slider [ngModel]="borderWidth()" (ngModelChange)="borderWidth.set($event)" [min]="0" [max]="5" [step]="0.5" styleClass="w-full" />
                            </div>
                            @if (borderWidth() > 0) {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">borderColor</label>
                                    <div class="flex items-center gap-2">
                                        <input type="color" [value]="borderColor()" (input)="borderColor.set($any($event.target).value)" style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0" />
                                        <span class="text-xs font-semibold">{{ borderColor() }}</span>
                                    </div>
                                </div>
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">borderAlign</label>
                                    <p-selectbutton [options]="alignOptions" [ngModel]="borderAlign()" (ngModelChange)="borderAlign.set($event)" [allowEmpty]="false" />
                                </div>
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">borderDash</label>
                                    <p-selectbutton [options]="dashOptions" [ngModel]="borderDashMode()" (ngModelChange)="borderDashMode.set($event)" [allowEmpty]="false" />
                                </div>
                                @if (borderDashMode() !== 'none') {
                                    <div class="flex flex-col gap-1">
                                        <label class="text-xs text-surface-500 dark:text-surface-400">borderDashOffset — {{ borderDashOffset() }}</label>
                                        <p-slider [ngModel]="borderDashOffset()" (ngModelChange)="borderDashOffset.set($event)" [min]="0" [max]="20" [step]="1" styleClass="w-full" />
                                    </div>
                                }
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">borderJoinStyle</label>
                                    <p-selectbutton [options]="joinOptions" [ngModel]="borderJoinStyle()" (ngModelChange)="borderJoinStyle.set($event)" [allowEmpty]="false" />
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
                                <label class="text-xs text-surface-500 dark:text-surface-400">hoverColor (series override)</label>
                                <p-selectbutton [options]="autoCustomOptions" [ngModel]="hoverColorMode()" (ngModelChange)="hoverColorMode.set($event)" [allowEmpty]="false" />
                            </div>
                            @if (hoverColorMode() === 'custom') {
                                <div class="flex flex-col gap-1">
                                    <div class="flex items-center gap-2">
                                        <input type="color" [value]="hoverColor()" (input)="hoverColor.set($any($event.target).value)" style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0" />
                                        <span class="text-xs font-semibold">{{ hoverColor() }}</span>
                                    </div>
                                </div>
                            }
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">hoverBorderColor (series override)</label>
                                <p-selectbutton [options]="autoCustomOptions" [ngModel]="hoverBorderColorMode()" (ngModelChange)="hoverBorderColorMode.set($event)" [allowEmpty]="false" />
                            </div>
                            @if (hoverBorderColorMode() === 'custom') {
                                <div class="flex flex-col gap-1">
                                    <div class="flex items-center gap-2">
                                        <input type="color" [value]="hoverBorderColor()" (input)="hoverBorderColor.set($any($event.target).value)" style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0" />
                                        <span class="text-xs font-semibold">{{ hoverBorderColor() }}</span>
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
export class RadarPlaygroundPlaygroundDoc {
    readonly data = data;

    readonly lineStyleOptions = ['solid', 'dashed', 'dotted'];
    readonly lineDashOptions = ['none', 'dashed', 'dotted', 'long'];
    readonly curveOptions = ['linear', 'smooth'];
    readonly gridShapeOptions = ['polygon', 'circle'];
    readonly gridStyleOptions = ['solid', 'dashed', 'dotted'];
    readonly markerShapeOptions = ['circle', 'square', 'triangle', 'cross', 'star'];
    readonly dashOptions = ['none', 'dashed', 'dotted'];
    readonly joinOptions = ['miter', 'round', 'bevel'];
    readonly alignOptions = ['center', 'inner'];
    readonly onOffOptions = ['off', 'on'];
    readonly autoCustomOptions = ['auto', 'custom'];

    readonly color = signal('#5daeea');
    readonly fillOpacity = signal(0.2);
    readonly lineWidth = signal(2);
    readonly lineStyle = signal<'solid' | 'dashed' | 'dotted'>('solid');
    readonly curve = signal<'linear' | 'smooth'>('linear');

    readonly showMarkers = signal(true);
    readonly markerSize = signal(4);
    readonly markerShape = signal<'circle' | 'square' | 'triangle' | 'cross' | 'star'>('circle');
    readonly pointRotation = signal(0);
    readonly pointBorderWidth = signal(0);
    readonly pointBorderColor = signal('#d6dbe6');
    readonly pointBorderDashMode = signal('none');
    readonly pointBorderDashOffset = signal(0);
    readonly pointBorderJoinStyle = signal<'miter' | 'round' | 'bevel'>('miter');

    readonly borderWidth = signal(0);
    readonly borderColor = signal('#d6dbe6');
    readonly borderAlign = signal<'center' | 'inner'>('center');
    readonly borderDashMode = signal('none');
    readonly borderDashOffset = signal(0);
    readonly borderJoinStyle = signal<'miter' | 'round' | 'bevel'>('miter');

    readonly gridShape = signal<'polygon' | 'circle'>('polygon');
    readonly gridLines = signal(5);
    readonly customGridColor = signal(false);
    readonly gridColor = signal('#94a3b8');
    readonly gridWidth = signal(0.5);
    readonly gridOpacity = signal(0.6);
    readonly gridStyle = signal<'solid' | 'dashed' | 'dotted'>('solid');

    readonly lineDashMode = signal('none');
    readonly hoverColorMode = signal('auto');
    readonly hoverColor = signal('#5daeea');
    readonly hoverBorderColorMode = signal('auto');
    readonly hoverBorderColor = signal('#d6dbe6');
    readonly hoverBrightness = signal(1.1);
    readonly hoverDimOpacity = signal(1);

    readonly borderDashProp = computed<number[] | undefined>(() => {
        if (this.borderDashMode() === 'dashed') return [6, 4];

        if (this.borderDashMode() === 'dotted') return [2, 2];

        return undefined;
    });
    readonly pointBorderDashProp = computed<number[] | undefined>(() => {
        if (this.pointBorderDashMode() === 'dashed') return [6, 4];

        if (this.pointBorderDashMode() === 'dotted') return [2, 2];

        return undefined;
    });
    readonly lineDashProp = computed<number[] | undefined>(() => {
        if (this.lineDashMode() === 'dashed') return [8, 4];

        if (this.lineDashMode() === 'dotted') return [2, 4];

        if (this.lineDashMode() === 'long') return [16, 6];

        return undefined;
    });

    readonly customGridColorOpt = computed(() => (this.customGridColor() ? 'on' : 'off'));
    readonly showMarkersOpt = computed(() => (this.showMarkers() ? 'on' : 'off'));

    readonly openGroups = signal<Record<string, boolean>>({ series: true, color: false, markers: false, border: false, grid: false, hover: false });

    toggleGroup(group: string): void {
        this.openGroups.update((groups) => ({ ...groups, [group]: !groups[group] }));
    }

    setCustomGridColorOpt(value: string): void {
        this.customGridColor.set(value === 'on');
    }

    setShowMarkersOpt(value: string): void {
        this.showMarkers.set(value === 'on');
    }

    readonly generatedCode = computed(() => {
        const hoverAttrs = this.buildHoverProps();
        const indent = '\n        ';
        const propsStr = this.buildRadarProps()
            .map((p) => `    ${p}`)
            .join(indent);
        const xAxisProps = this.buildXAxisProps();
        const xAxisLine = xAxisProps.length ? `<p-chart-x-axis ${xAxisProps.join(' ')} />` : '<p-chart-x-axis />';
        const yAxisProps = this.buildYAxisProps();
        const yAxisLine = yAxisProps.length ? `<p-chart-y-axis ${yAxisProps.join(' ')} />` : '<p-chart-y-axis />';

        return `<p-chart-svg [width]="460" [height]="460">
    <p-chart-radar${indent}${propsStr}
    />
    ${xAxisLine}
    ${yAxisLine}
    <p-chart-legend position="bottom" />
    <p-chart-tooltip />
    <p-chart-hover${hoverAttrs} />
</p-chart-svg>`;
    });

    private buildRadarProps(): string[] {
        const props: string[] = ['[data]="data"', 'categoryXField="metric"', 'valueYField="value"', 'name="Performance"', `color="${this.color()}"`];

        if (this.fillOpacity() !== 0.2) props.push(`[fillOpacity]="${this.fillOpacity().toFixed(2)}"`);

        if (this.lineWidth() !== 2) props.push(`[lineStrokeWidth]="${this.lineWidth()}"`);

        if (this.lineStyle() !== 'solid') props.push(`lineStyle="${this.lineStyle()}"`);

        if (this.lineDashProp()) props.push(`[lineDash]="[${this.lineDashProp()!.join(', ')}]"`);

        if (this.curve() !== 'linear') props.push(`curve="${this.curve()}"`);

        if (!this.showMarkers()) {
            props.push('[showMarkers]="false"');
        } else {
            if (this.markerSize() !== 4) props.push(`[markerSize]="${this.markerSize()}"`);

            if (this.markerShape() !== 'circle') props.push(`markerShape="${this.markerShape()}"`);

            if (this.pointRotation() !== 0) props.push(`[pointRotation]="${this.pointRotation()}"`);

            if (this.pointBorderWidth() > 0) {
                props.push(`[pointBorderStrokeWidth]="${this.pointBorderWidth()}"`);
                if (this.pointBorderColor() !== '#d6dbe6') props.push(`pointBorderColor="${this.pointBorderColor()}"`);

                if (this.pointBorderDashProp()) {
                    props.push(`[pointBorderDash]="[${this.pointBorderDashProp()!.join(', ')}]"`);
                    if (this.pointBorderDashOffset() !== 0) props.push(`[pointBorderDashOffset]="${this.pointBorderDashOffset()}"`);
                }

                if (this.pointBorderJoinStyle() !== 'miter') props.push(`pointBorderJoinStyle="${this.pointBorderJoinStyle()}"`);
            }
        }

        if (this.hoverColorMode() === 'custom') props.push(`hoverColor="${this.hoverColor()}"`);

        if (this.hoverBorderColorMode() === 'custom') props.push(`hoverBorderColor="${this.hoverBorderColor()}"`);

        if (this.borderWidth() > 0) {
            props.push(`[borderStrokeWidth]="${this.borderWidth()}"`);
            if (this.borderColor() !== '#d6dbe6') props.push(`borderColor="${this.borderColor()}"`);

            if (this.borderAlign() !== 'center') props.push(`borderAlign="${this.borderAlign()}"`);

            if (this.borderDashProp()) {
                props.push(`[borderDash]="[${this.borderDashProp()!.join(', ')}]"`);
                if (this.borderDashOffset() !== 0) props.push(`[borderDashOffset]="${this.borderDashOffset()}"`);
            }

            if (this.borderJoinStyle() !== 'miter') props.push(`borderJoinStyle="${this.borderJoinStyle()}"`);
        }

        return props;
    }

    private buildXAxisProps(): string[] {
        const props: string[] = [];

        if (this.gridShape() !== 'polygon') props.push(`gridShape="${this.gridShape()}"`);

        if (this.customGridColor()) props.push(`color="${this.gridColor()}"`);

        return props;
    }

    private buildYAxisProps(): string[] {
        const props: string[] = [];

        if (this.gridShape() !== 'polygon') props.push(`gridShape="${this.gridShape()}"`);

        if (this.gridLines() !== 5) props.push(`[tickCount]="${this.gridLines()}"`);

        if (this.customGridColor()) props.push(`gridColor="${this.gridColor()}"`);

        if (this.gridWidth() !== 0.5) props.push(`[gridStrokeWidth]="${this.gridWidth()}"`);

        if (this.gridOpacity() !== 0.6) props.push(`[gridOpacity]="${this.gridOpacity().toFixed(2)}"`);

        if (this.gridStyle() !== 'solid') props.push(`gridStyle="${this.gridStyle()}"`);

        return props;
    }

    private buildHoverProps(): string {
        const parts: string[] = [];

        if (this.hoverBrightness() !== 1.1) parts.push(`[brightness]="${this.hoverBrightness()}"`);

        if (this.hoverDimOpacity() !== 1) parts.push(`[dimOpacity]="${this.hoverDimOpacity()}"`);

        return parts.length ? ` ${parts.join(' ')}` : '';
    }
}

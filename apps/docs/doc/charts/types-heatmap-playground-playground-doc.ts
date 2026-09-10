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
import { supportLoadMatrix } from '@/doc/charts/data/supportLoadMatrix';

type ColorPreset = 'heat' | 'ocean' | 'health' | 'aurora';
type ColorMode = 'gradient' | 'single';

const colorPresets: Record<ColorPreset, string[]> = {
    heat: ['#fff7ed', '#ffad5a', '#b23b4b'],
    ocean: ['#eef6ff', '#5bc8f5', '#2531a8'],
    health: ['#ff7a66', '#d6dbe6', '#5ccf9f'],
    aurora: ['#5daeea', '#4ecdc4', '#ff6fae']
};

const data = supportLoadMatrix.filter((cell) => !(cell.day === 'Mon' && cell.window === '18:00') && !(cell.day === 'Wed' && cell.window === '16:00') && !(cell.day === 'Sat' && cell.window === '08:00'));

@Component({
    selector: 'types-heatmap-playground-playground-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, FormsModule, ChartsModule, Slider, SelectButton, Select, PlaygroundSectionComponent],
    template: `
        <app-docsectiontext>
            <p>#### SvgHeatmapPlaygroundDemo.ts</p>
            <p>#### supportLoadMatrix.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div class="chart-playground-layout">
                    <div class="chart-playground-stage">
                        <p-chart-svg [responsive]="true" [height]="460">
                            <p-chart-heatmap
                                [data]="data"
                                categoryXField="day"
                                categoryYField="window"
                                valueField="tickets"
                                name="Ticket intake"
                                [color]="activeColor()"
                                [colorRange]="activeColorRange()"
                                [min]="useMinMax() ? minValue() : undefined"
                                [max]="useMinMax() ? maxValue() : undefined"
                                [spacing]="spacing()"
                                [borderRadius]="borderRadius()"
                                [showEmptyCells]="showEmptyCells()"
                                [nullColor]="nullColor()"
                                [borderStrokeWidth]="activeBorderWidth()"
                                [borderColor]="activeBorderColor()"
                                [borderAlign]="borderWidth() > 0 ? borderAlign() : undefined"
                                [borderDash]="borderDashProp()"
                                [borderDashOffset]="borderDashProp() ? borderDashOffset() : undefined"
                                [borderJoinStyle]="borderJoinStyle()"
                                [opacity]="cellOpacity() !== 1 ? cellOpacity() : undefined"
                                [colorScale]="colorScaleMode() === 'custom' && colorMode() === 'gradient' ? [colorScaleLow(), colorScaleMid(), colorScaleHigh()] : undefined"
                                [hoverColor]="hoverColorMode() === 'custom' ? hoverColor() : undefined"
                                [hoverBorderColor]="hoverBorderColorMode() === 'custom' ? hoverBorderColor() : undefined"
                            />
                            @if (showLabels()) {
                                <p-chart-data-labels [color]="labelColor() !== '#ffffff' ? labelColor() : undefined" />
                            }
                            <p-chart-x-axis [showLine]="false" [showTicks]="false" [gridLines]="false" />
                            <p-chart-y-axis [showLine]="false" [showTicks]="false" [gridLines]="false" />
                            <p-chart-color-legend position="bottom" />
                            <p-chart-tooltip />
                            <p-chart-hover [brightness]="hoverBrightness()" [dimOpacity]="hoverDimOpacity()" />
                        </p-chart-svg>
                    </div>

                    <div class="playground-controls">
                        <div class="playground-controls-header">Controls</div>

                        <app-playground-section title="Cell" [open]="openGroups().cell" (toggle)="toggleGroup('cell')">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">spacing — {{ spacing() }}px</label>
                                <p-slider [ngModel]="spacing()" (ngModelChange)="spacing.set($event)" [min]="0" [max]="8" [step]="1" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">borderRadius — {{ borderRadius() }}px</label>
                                <p-slider [ngModel]="borderRadius()" (ngModelChange)="borderRadius.set($event)" [min]="0" [max]="12" [step]="1" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">opacity — {{ cellOpacity().toFixed(2) }}</label>
                                <p-slider [ngModel]="cellOpacity()" (ngModelChange)="cellOpacity.set($event)" [min]="0.1" [max]="1" [step]="0.05" styleClass="w-full" />
                            </div>
                        </app-playground-section>

                        <app-playground-section title="Labels" [open]="openGroups().labels" (toggle)="toggleGroup('labels')">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">showLabels</label>
                                <p-selectbutton [options]="onOffValueOptions" optionLabel="label" optionValue="value" [ngModel]="showLabels()" (ngModelChange)="showLabels.set($event)" [allowEmpty]="false" />
                            </div>
                            @if (showLabels()) {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">labelColor</label>
                                    <div class="flex items-center gap-2">
                                        <input type="color" [value]="labelColor()" (input)="labelColor.set($any($event.target).value)" style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0" />
                                        <span class="text-xs font-semibold">{{ labelColor() }}</span>
                                    </div>
                                </div>
                            }
                        </app-playground-section>

                        <app-playground-section title="Empty Cells" [open]="openGroups().emptyCells" (toggle)="toggleGroup('emptyCells')">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">showEmptyCells</label>
                                <p-selectbutton [options]="onOffValueOptions" optionLabel="label" optionValue="value" [ngModel]="showEmptyCells()" (ngModelChange)="showEmptyCells.set($event)" [allowEmpty]="false" />
                            </div>
                            @if (showEmptyCells()) {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">nullColor</label>
                                    <div class="flex items-center gap-2">
                                        <input type="color" [value]="nullColor()" (input)="nullColor.set($any($event.target).value)" style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0" />
                                        <span class="text-xs font-semibold">{{ nullColor() }}</span>
                                    </div>
                                </div>
                            }
                        </app-playground-section>

                        <app-playground-section title="Color" [open]="openGroups().color" (toggle)="toggleGroup('color')">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">colorMode</label>
                                <p-selectbutton [options]="colorModeOptions" [ngModel]="colorMode()" (ngModelChange)="colorMode.set($event)" [allowEmpty]="false" />
                            </div>
                            @if (colorMode() === 'gradient') {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">colorRange preset</label>
                                    <p-select [options]="colorPresetOptions" [ngModel]="colorPreset()" (ngModelChange)="colorPreset.set($event)" styleClass="w-full" appendTo="body" />
                                </div>
                            }
                            @if (colorMode() === 'single') {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">color</label>
                                    <div class="flex items-center gap-2">
                                        <input type="color" [value]="singleColor()" (input)="singleColor.set($any($event.target).value)" style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0" />
                                        <span class="text-xs font-semibold">{{ singleColor() }}</span>
                                    </div>
                                </div>
                            }
                            @if (colorMode() === 'gradient') {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">colorScale</label>
                                    <p-selectbutton [options]="autoCustomOptions" [ngModel]="colorScaleMode()" (ngModelChange)="colorScaleMode.set($event)" [allowEmpty]="false" />
                                </div>
                            }
                            @if (colorMode() === 'gradient' && colorScaleMode() === 'custom') {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">low — {{ colorScaleLow() }}</label>
                                    <p-slider [ngModel]="colorScaleLow()" (ngModelChange)="colorScaleLow.set($event)" [min]="0" [max]="40" [step]="5" styleClass="w-full" />
                                </div>
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">mid — {{ colorScaleMid() }}</label>
                                    <p-slider [ngModel]="colorScaleMid()" (ngModelChange)="colorScaleMid.set($event)" [min]="20" [max]="70" [step]="5" styleClass="w-full" />
                                </div>
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">high — {{ colorScaleHigh() }}</label>
                                    <p-slider [ngModel]="colorScaleHigh()" (ngModelChange)="colorScaleHigh.set($event)" [min]="50" [max]="120" [step]="5" styleClass="w-full" />
                                </div>
                            }
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">min / max override</label>
                                <p-selectbutton [options]="onOffValueOptions" optionLabel="label" optionValue="value" [ngModel]="useMinMax()" (ngModelChange)="useMinMax.set($event)" [allowEmpty]="false" />
                            </div>
                            @if (useMinMax()) {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">min — {{ minValue() }}</label>
                                    <p-slider [ngModel]="minValue()" (ngModelChange)="minValue.set($event)" [min]="0" [max]="50" [step]="5" styleClass="w-full" />
                                </div>
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">max — {{ maxValue() }}</label>
                                    <p-slider [ngModel]="maxValue()" (ngModelChange)="maxValue.set($event)" [min]="50" [max]="150" [step]="5" styleClass="w-full" />
                                </div>
                            }
                        </app-playground-section>

                        <app-playground-section title="Border" [open]="openGroups().border" (toggle)="toggleGroup('border')">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">borderWidth — {{ borderWidth() }}px</label>
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
                                    <p-selectbutton [options]="borderAlignOptions" [ngModel]="borderAlign()" (ngModelChange)="borderAlign.set($event)" [allowEmpty]="false" />
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
                                <label class="text-xs text-surface-500 dark:text-surface-400">hoverColor (cell override)</label>
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
                                <label class="text-xs text-surface-500 dark:text-surface-400">hoverBorderColor (cell override)</label>
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
export class HeatmapPlaygroundPlaygroundDoc {
    readonly data = data;

    readonly colorModeOptions = ['gradient', 'single'];
    readonly colorPresetOptions = ['heat', 'ocean', 'health', 'aurora'];
    readonly autoCustomOptions = ['auto', 'custom'];
    readonly borderAlignOptions = ['center', 'inner'];
    readonly dashOptions = ['none', 'dashed', 'dotted'];
    readonly joinOptions = ['miter', 'round', 'bevel'];
    readonly onOffValueOptions = [
        { label: 'off', value: false },
        { label: 'on', value: true }
    ];

    readonly colorMode = signal<ColorMode>('gradient');
    readonly colorPreset = signal<ColorPreset>('heat');
    readonly singleColor = signal('#5daeea');
    readonly useMinMax = signal(false);
    readonly minValue = signal(0);
    readonly maxValue = signal(100);

    readonly spacing = signal(2);
    readonly borderRadius = signal(4);

    readonly showLabels = signal(false);
    readonly labelColor = signal('#ffffff');

    readonly showEmptyCells = signal(true);
    readonly nullColor = signal('#f3f4f6');

    readonly borderWidth = signal(0);
    readonly borderColor = signal('#475569');
    readonly borderAlign = signal<'center' | 'inner'>('center');
    readonly borderDashMode = signal('none');
    readonly borderDashOffset = signal(0);
    readonly borderJoinStyle = signal<'miter' | 'round' | 'bevel'>('miter');

    readonly cellOpacity = signal(1);
    readonly hoverColorMode = signal('auto');
    readonly hoverColor = signal('#f59e0b');
    readonly hoverBorderColorMode = signal('auto');
    readonly hoverBorderColor = signal('#ffffff');
    readonly colorScaleMode = signal('auto');
    readonly colorScaleLow = signal(5);
    readonly colorScaleMid = signal(40);
    readonly colorScaleHigh = signal(80);
    readonly hoverBrightness = signal(1.1);
    readonly hoverDimOpacity = signal(1);

    readonly activeColorRange = computed<string[] | undefined>(() => (this.colorMode() === 'gradient' ? colorPresets[this.colorPreset()] : undefined));
    readonly activeColor = computed<string | undefined>(() => (this.colorMode() === 'single' ? this.singleColor() : undefined));
    readonly activeBorderColor = computed<string | undefined>(() => (this.borderWidth() > 0 ? this.borderColor() : undefined));
    readonly activeBorderWidth = computed<number | undefined>(() => (this.borderWidth() > 0 ? this.borderWidth() : undefined));
    readonly borderDashProp = computed<number[] | undefined>(() => {
        if (this.borderDashMode() === 'dashed') return [6, 4];

        if (this.borderDashMode() === 'dotted') return [2, 2];

        return undefined;
    });

    readonly openGroups = signal<Record<string, boolean>>({ color: false, cell: true, labels: false, emptyCells: false, border: false, hover: false });

    toggleGroup(group: string): void {
        this.openGroups.update((groups) => ({ ...groups, [group]: !groups[group] }));
    }

    readonly generatedCode = computed(() => {
        const hoverAttrs = this.buildHoverProps();
        const indent = '\n        ';
        const propsStr = this.buildHeatmapProps()
            .map((p) => `    ${p}`)
            .join(indent);

        return `<p-chart-svg [responsive]="true" [height]="460">
    <p-chart-heatmap${indent}${propsStr}
    />${this.buildDataLabels()}
    <p-chart-x-axis [showLine]="false" [showTicks]="false" [gridLines]="false" />
    <p-chart-y-axis [showLine]="false" [showTicks]="false" [gridLines]="false" />
    <p-chart-color-legend position="bottom" />
    <p-chart-tooltip />
    <p-chart-hover${hoverAttrs} />
</p-chart-svg>`;
    });

    private buildHeatmapProps(): string[] {
        const props: string[] = ['[data]="data"', 'categoryXField="day"', 'categoryYField="window"', 'valueField="tickets"', 'name="Ticket intake"'];

        if (this.colorMode() === 'gradient') {
            const arr = colorPresets[this.colorPreset()];

            props.push(`[colorRange]="[${arr.map((c) => `'${c}'`).join(', ')}]"`);
        } else {
            props.push(`color="${this.singleColor()}"`);
        }

        if (this.useMinMax()) {
            props.push(`[min]="${this.minValue()}"`);
            props.push(`[max]="${this.maxValue()}"`);
        }

        if (this.spacing() !== 1) props.push(`[spacing]="${this.spacing()}"`);

        if (this.borderRadius() !== 0) props.push(`[borderRadius]="${this.borderRadius()}"`);

        if (!this.showEmptyCells()) props.push('[showEmptyCells]="false"');
        else if (this.nullColor() !== '#f3f4f6') props.push(`nullColor="${this.nullColor()}"`);

        if (this.cellOpacity() !== 1) props.push(`[opacity]="${this.cellOpacity()}"`);

        if (this.colorScaleMode() === 'custom' && this.colorMode() === 'gradient') {
            props.push(`[colorScale]="[${this.colorScaleLow()}, ${this.colorScaleMid()}, ${this.colorScaleHigh()}]"`);
        }

        if (this.hoverColorMode() === 'custom') props.push(`hoverColor="${this.hoverColor()}"`);

        if (this.hoverBorderColorMode() === 'custom') props.push(`hoverBorderColor="${this.hoverBorderColor()}"`);

        if (this.borderWidth() !== 0) {
            props.push(`[borderStrokeWidth]="${this.borderWidth()}"`);
            if (this.borderColor() !== '#475569') props.push(`borderColor="${this.borderColor()}"`);

            if (this.borderAlign() !== 'center') props.push(`borderAlign="${this.borderAlign()}"`);

            if (this.borderDashProp()) {
                props.push(`[borderDash]="[${this.borderDashProp()!.join(', ')}]"`);
                if (this.borderDashOffset() !== 0) props.push(`[borderDashOffset]="${this.borderDashOffset()}"`);
            }

            if (this.borderJoinStyle() !== 'miter') props.push(`borderJoinStyle="${this.borderJoinStyle()}"`);
        }

        return props;
    }

    private buildDataLabels(): string {
        if (!this.showLabels()) return '';

        const attrs = this.labelColor() !== '#ffffff' ? ` color="${this.labelColor()}"` : '';

        return `\n    <p-chart-data-labels${attrs} />`;
    }

    private buildHoverProps(): string {
        const parts: string[] = [];

        if (this.hoverBrightness() !== 1.1) parts.push(`[brightness]="${this.hoverBrightness()}"`);

        if (this.hoverDimOpacity() !== 1) parts.push(`[dimOpacity]="${this.hoverDimOpacity()}"`);

        return parts.length ? ` ${parts.join(' ')}` : '';
    }
}

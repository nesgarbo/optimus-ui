import { ChangeDetectionStrategy, Component, computed, signal, type WritableSignal } from '@angular/core';
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
    { direction: 'N', speed: 12 },
    { direction: 'NE', speed: 8 },
    { direction: 'E', speed: 15 },
    { direction: 'SE', speed: 20 },
    { direction: 'S', speed: 18 },
    { direction: 'SW', speed: 25 },
    { direction: 'W', speed: 22 },
    { direction: 'NW', speed: 10 }
];

@Component({
    selector: 'types-polar-playground-playground-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, FormsModule, ChartsModule, Slider, SelectButton, Select, PlaygroundSectionComponent],
    template: `
        <app-docsectiontext>
            <p></p>
        </app-docsectiontext>
        <div class="card">
            <div class="chart-playground-layout">
                <div class="chart-playground-stage">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-polar
                            id="playground"
                            [data]="data"
                            categoryXField="direction"
                            valueYField="speed"
                            name="Wind Speed"
                            [color]="colors()"
                            [innerRadius]="innerRadius()"
                            [spacing]="spacing() > 0 ? spacing() : undefined"
                            [borderRadius]="borderRadius()"
                            [borderStrokeWidth]="borderWidth()"
                            [borderColor]="borderWidth() > 0 ? borderColor() : undefined"
                            [opacity]="opacityProp()"
                            [borderAlign]="borderWidth() > 0 ? borderAlign() : undefined"
                            [borderDash]="borderDashProp()"
                            [borderDashOffset]="borderDashProp() ? borderDashOffset() : undefined"
                            [borderJoinStyle]="borderWidth() > 0 && borderJoinStyle() !== 'miter' ? borderJoinStyle() : undefined"
                            [hoverColor]="hoverColorProp()"
                            [hoverBorderColor]="hoverBorderColorProp()"
                            [sort]="sortProp()"
                        />
                        <p-chart-x-axis [gridShape]="gridShape()" />
                        <p-chart-y-axis [gridShape]="gridShape()" [tickCount]="gridLines()" [gridColor]="customGridColor() ? gridColor() : undefined" [gridStrokeWidth]="gridWidth()" [gridOpacity]="gridOpacity()" [gridStyle]="gridStyle()" />
                        <p-chart-legend position="bottom" />
                        <p-chart-tooltip />
                        <p-chart-hover [offset]="hoverOffset()" [scale]="hoverScale()" [brightness]="hoverBrightness()" [dimOpacity]="hoverDimOpacity()" />
                    </p-chart-svg>
                </div>

                <div class="playground-controls">
                    <div class="playground-controls-header">Controls</div>

                    <app-playground-section title="Series" [open]="openGroups().series" (toggle)="toggleGroup('series')">
                        <div class="flex flex-col gap-1">
                            <label class="text-xs text-surface-500 dark:text-surface-400">innerRadius — {{ innerRadius().toFixed(2) }}</label>
                            <p-slider [ngModel]="innerRadius()" (ngModelChange)="innerRadius.set($event)" [min]="0" [max]="0.9" [step]="0.05" styleClass="w-full" />
                        </div>
                        <div class="flex flex-col gap-1">
                            <label class="text-xs text-surface-500 dark:text-surface-400">spacing — {{ spacing() === 0 ? 'auto' : spacing() + 'px' }}</label>
                            <p-slider [ngModel]="spacing()" (ngModelChange)="spacing.set($event)" [min]="0" [max]="10" [step]="1" styleClass="w-full" />
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
                            <label class="text-xs text-surface-500 dark:text-surface-400">gridWidth — {{ gridWidth() }}px</label>
                            <p-slider [ngModel]="gridWidth()" (ngModelChange)="gridWidth.set($event)" [min]="0.5" [max]="4" [step]="0.5" styleClass="w-full" />
                        </div>
                        <div class="flex flex-col gap-1">
                            <label class="text-xs text-surface-500 dark:text-surface-400">gridOpacity — {{ gridOpacity().toFixed(2) }}</label>
                            <p-slider [ngModel]="gridOpacity()" (ngModelChange)="gridOpacity.set($event)" [min]="0" [max]="1" [step]="0.05" styleClass="w-full" />
                        </div>
                        <div class="flex flex-col gap-1">
                            <label class="text-xs text-surface-500 dark:text-surface-400">gridColor</label>
                            <p-selectbutton [options]="onOffValueOptions" optionLabel="label" optionValue="value" [ngModel]="customGridColor()" (ngModelChange)="customGridColor.set($event)" [allowEmpty]="false" />
                        </div>
                        @if (customGridColor()) {
                            <div class="flex items-center gap-2">
                                <input type="color" [value]="gridColor()" (input)="gridColor.set($any($event.target).value)" style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0" />
                                <span class="text-xs font-semibold">{{ gridColor() }}</span>
                            </div>
                        }
                    </app-playground-section>

                    <app-playground-section title="Color" [open]="openGroups().color" (toggle)="toggleGroup('color')">
                        <label class="text-xs text-surface-500 dark:text-surface-400">slice colors</label>
                        <div class="flex flex-wrap gap-x-3 gap-y-2">
                            @for (item of data; track item.direction; let i = $index) {
                                <div class="flex items-center gap-1">
                                    <input type="color" [value]="colors()[i]" (input)="setColor(colors, i, $event)" style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0" />
                                    <span class="text-[10px] opacity-60">{{ item.direction }}</span>
                                </div>
                            }
                        </div>
                        <div class="flex flex-col gap-1">
                            <label class="text-xs text-surface-500 dark:text-surface-400">opacity — {{ opacity().toFixed(2) }}</label>
                            <p-slider [ngModel]="opacity()" (ngModelChange)="opacity.set($event)" [min]="0" [max]="1" [step]="0.05" styleClass="w-full" />
                        </div>
                    </app-playground-section>

                    <app-playground-section title="Border" [open]="openGroups().border" (toggle)="toggleGroup('border')">
                        <div class="flex flex-col gap-1">
                            <label class="text-xs text-surface-500 dark:text-surface-400">borderRadius — {{ borderRadius() }}px</label>
                            <p-slider [ngModel]="borderRadius()" (ngModelChange)="borderRadius.set($event)" [min]="0" [max]="20" [step]="1" styleClass="w-full" />
                        </div>
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
                            <label class="text-xs text-surface-500 dark:text-surface-400">offset — {{ hoverOffset() }}px</label>
                            <p-slider [ngModel]="hoverOffset()" (ngModelChange)="hoverOffset.set($event)" [min]="0" [max]="24" [step]="1" styleClass="w-full" />
                        </div>
                        <div class="flex flex-col gap-1">
                            <label class="text-xs text-surface-500 dark:text-surface-400">scale — {{ hoverScale().toFixed(2) }}</label>
                            <p-slider [ngModel]="hoverScale()" (ngModelChange)="hoverScale.set($event)" [min]="1" [max]="1.5" [step]="0.05" styleClass="w-full" />
                        </div>
                        <div class="flex flex-col gap-1">
                            <label class="text-xs text-surface-500 dark:text-surface-400">hoverColor</label>
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
                            <label class="text-xs text-surface-500 dark:text-surface-400">hoverBorderColor</label>
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

                    <app-playground-section title="Sort" [open]="openGroups().sort" (toggle)="toggleGroup('sort')">
                        <div class="flex flex-col gap-1">
                            <label class="text-xs text-surface-500 dark:text-surface-400">sort</label>
                            <p-select [options]="sortOptions" [ngModel]="sortMode()" (ngModelChange)="sortMode.set($event)" styleClass="w-full" appendTo="body" />
                        </div>
                    </app-playground-section>
                </div>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaygroundPlaygroundDoc {
    readonly data = data;

    readonly gridShapeOptions = ['polygon', 'circle'];
    readonly gridStyleOptions = ['solid', 'dashed', 'dotted'];
    readonly alignOptions = ['center', 'inner'];
    readonly dashOptions = ['none', 'dashed', 'dotted'];
    readonly joinOptions = ['miter', 'round', 'bevel'];
    readonly autoCustomOptions = ['auto', 'custom'];
    readonly sortOptions = ['none', 'value-asc', 'value-desc', 'label-asc', 'label-desc'];
    readonly onOffValueOptions = [
        { label: 'off', value: false },
        { label: 'on', value: true }
    ];

    readonly colors = signal(['#5daeea', '#ffad5a', '#ffd166', '#4ecdc4', '#7c8cff', '#c084fc', '#5ccf9f', '#94a3b8']);

    readonly innerRadius = signal(0);
    readonly spacing = signal(0);
    readonly opacity = signal(1);

    readonly borderRadius = signal(0);
    readonly borderWidth = signal(0);
    readonly borderColor = signal('#ffffff');
    readonly borderAlign = signal<'center' | 'inner'>('center');
    readonly borderDashMode = signal('none');
    readonly borderDashOffset = signal(0);
    readonly borderJoinStyle = signal<'miter' | 'round' | 'bevel'>('miter');

    readonly gridShape = signal<'polygon' | 'circle'>('polygon');
    readonly gridLines = signal(5);
    readonly customGridColor = signal(false);
    readonly gridColor = signal('#888888');
    readonly gridWidth = signal(0.5);
    readonly gridOpacity = signal(0.6);
    readonly gridStyle = signal<'solid' | 'dashed' | 'dotted'>('solid');

    readonly sortMode = signal('none');

    readonly hoverOffset = signal(4);
    readonly hoverScale = signal(1);
    readonly hoverBrightness = signal(1.1);
    readonly hoverDimOpacity = signal(1);
    readonly hoverColorMode = signal('auto');
    readonly hoverColor = signal('#5daeea');
    readonly hoverBorderColorMode = signal('auto');
    readonly hoverBorderColor = signal('#ffffff');

    readonly opacityProp = computed(() => (this.opacity() !== 1 ? this.opacity() : undefined));
    readonly sortProp = computed(() => (this.sortMode() === 'none' ? undefined : (this.sortMode() as 'value-asc' | 'value-desc' | 'label-asc' | 'label-desc')));
    readonly hoverColorProp = computed(() => (this.hoverColorMode() === 'custom' ? this.hoverColor() : undefined));
    readonly hoverBorderColorProp = computed(() => (this.hoverBorderColorMode() === 'custom' ? this.hoverBorderColor() : undefined));
    readonly borderDashProp = computed<number[] | undefined>(() => {
        if (this.borderDashMode() === 'dashed') return [6, 4];

        if (this.borderDashMode() === 'dotted') return [2, 2];

        return undefined;
    });

    readonly openGroups = signal<Record<string, boolean>>({ series: true, color: false, border: false, grid: false, sort: false, hover: false });

    toggleGroup(group: string): void {
        this.openGroups.update((groups) => ({ ...groups, [group]: !groups[group] }));
    }

    setColor(target: WritableSignal<string[]>, index: number, event: Event): void {
        const value = (event.target as HTMLInputElement).value;

        target.update((colors) => colors.map((c, i) => (i === index ? value : c)));
    }

    readonly generatedCode = computed(() => {
        const hoverAttrs = this.buildHoverProps();
        const indent = '\n        ';
        const propsStr = this.buildPolarProps()
            .map((p) => `    ${p}`)
            .join(indent);
        const xAxisProps = this.buildXAxisProps();
        const xAxisStr = xAxisProps.length ? ` ${xAxisProps.join(' ')}` : '';
        const yAxisProps = this.buildYAxisProps();
        const yAxisStr = yAxisProps.length ? ` ${yAxisProps.join(' ')}` : '';

        return `<p-chart-svg [width]="460" [height]="460">
    <p-chart-polar${indent}${propsStr}
    />
    <p-chart-x-axis${xAxisStr} />
    <p-chart-y-axis${yAxisStr} />
    <p-chart-legend position="bottom" />
    <p-chart-tooltip />
    <p-chart-hover${hoverAttrs} />
</p-chart-svg>`;
    });

    private buildPolarProps(): string[] {
        const colorArr = `[${this.colors()
            .map((c) => `'${c}'`)
            .join(', ')}]`;
        const props: string[] = ['[data]="data"', 'categoryXField="direction"', 'valueYField="speed"', 'name="Wind Speed"', `[color]="${colorArr}"`];

        if (this.innerRadius() > 0) props.push(`[innerRadius]="${this.innerRadius().toFixed(2)}"`);

        if (this.spacing() > 0) props.push(`[spacing]="${this.spacing()}"`);

        if (this.opacityProp() !== undefined) props.push(`[opacity]="${this.opacityProp()}"`);

        if (this.borderRadius() > 0) props.push(`[borderRadius]="${this.borderRadius()}"`);

        if (this.borderWidth() > 0) {
            props.push(`[borderStrokeWidth]="${this.borderWidth()}"`);
            if (this.borderColor() !== '#ffffff') props.push(`borderColor="${this.borderColor()}"`);

            if (this.borderDashProp()) {
                props.push(`[borderDash]="[${this.borderDashProp()!.join(', ')}]"`);
                if (this.borderDashOffset() !== 0) props.push(`[borderDashOffset]="${this.borderDashOffset()}"`);
            }
        }

        if (this.hoverColorProp()) props.push(`hoverColor="${this.hoverColorProp()}"`);

        if (this.hoverBorderColorProp()) props.push(`hoverBorderColor="${this.hoverBorderColorProp()}"`);

        if (this.sortProp()) props.push(`sort="${this.sortProp()}"`);

        return props;
    }

    private buildXAxisProps(): string[] {
        const props: string[] = [];

        if (this.gridShape() !== 'circle') props.push(`gridShape="${this.gridShape()}"`);

        return props;
    }

    private buildYAxisProps(): string[] {
        const props: string[] = [];

        if (this.gridShape() !== 'circle') props.push(`gridShape="${this.gridShape()}"`);

        if (this.gridLines() !== 5) props.push(`[tickCount]="${this.gridLines()}"`);

        if (this.customGridColor()) props.push(`gridColor="${this.gridColor()}"`);

        if (this.gridWidth() !== 0.5) props.push(`[gridStrokeWidth]="${this.gridWidth()}"`);

        if (this.gridOpacity() !== 0.6) props.push(`[gridOpacity]="${this.gridOpacity().toFixed(2)}"`);

        if (this.gridStyle() !== 'solid') props.push(`gridStyle="${this.gridStyle()}"`);

        return props;
    }

    private buildHoverProps(): string {
        const parts: string[] = [];

        if (this.hoverOffset() !== 4) parts.push(`[offset]="${this.hoverOffset()}"`);

        if (this.hoverBrightness() !== 1.1) parts.push(`[brightness]="${this.hoverBrightness()}"`);

        if (this.hoverDimOpacity() !== 1) parts.push(`[dimOpacity]="${this.hoverDimOpacity()}"`);

        return parts.length ? ` ${parts.join(' ')}` : '';
    }
}

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

const baseData = [
    { month: 'Jan', booked: 42, activated: 35, retained: 28 },
    { month: 'Feb', booked: 58, activated: 45, retained: 38 },
    { month: 'Mar', booked: 73, activated: 52, retained: 41 },
    { month: 'Apr', booked: 65, activated: 48, retained: 55 },
    { month: 'May', booked: 89, activated: 62, retained: 47 },
    { month: 'Jun', booked: 54, activated: 71, retained: 33 },
    { month: 'Jul', booked: 76, activated: 44, retained: 59 },
    { month: 'Aug', booked: 91, activated: 58, retained: 36 }
];

@Component({
    selector: 'types-column-bar-playground-playground-doc',
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
                            @if (isStacked()) {
                                <p-chart-stacked [mode]="stackedMode()">
                                    @for (i of seriesIndexes(); track i) {
                                        <p-chart-bar
                                            [id]="'series-' + i"
                                            [data]="baseData"
                                            [categoryXField]="orientation() === 'vertical' ? 'month' : undefined"
                                            [categoryYField]="orientation() === 'horizontal' ? 'month' : undefined"
                                            [valueXField]="orientation() === 'horizontal' ? fieldKeys[i - 1] : undefined"
                                            [valueYField]="orientation() === 'vertical' ? fieldKeys[i - 1] : undefined"
                                            [name]="datasetCount() === 1 ? seriesNames[0] : seriesNames[i - 1]"
                                            [color]="datasetCount() === 1 ? color() : seriesColors()[i - 1]"
                                            [opacity]="opacityProp()"
                                            [borderRadius]="borderRadius()"
                                            [borderStrokeWidth]="borderWidth()"
                                            [borderColor]="borderWidth() > 0 ? borderColor() : undefined"
                                            [borderAlign]="borderWidth() > 0 ? borderAlign() : undefined"
                                            [borderDash]="borderDashProp()"
                                            [borderDashOffset]="borderDashProp() ? borderDashOffset() : undefined"
                                            [borderJoinStyle]="borderJoinStyle()"
                                            [borderSkipped]="borderSkippedProp()"
                                            [categoryGap]="categoryGap()"
                                            [barGap]="barGap()"
                                            [barThickness]="barThicknessProp()"
                                            [maxBarThickness]="maxBarThicknessProp()"
                                            [minBarLength]="minBarLengthProp()"
                                            [hoverColor]="hoverColorProp()"
                                            [hoverBorderColor]="hoverBorderColorProp()"
                                            [sort]="sortProp()"
                                            [sortAggregate]="sortProp() ? sortAggregate() : undefined"
                                        />
                                    }
                                </p-chart-stacked>
                            } @else {
                                @for (i of seriesIndexes(); track i) {
                                    <p-chart-bar
                                        [id]="'series-' + i"
                                        [data]="baseData"
                                        [categoryXField]="orientation() === 'vertical' ? 'month' : undefined"
                                        [categoryYField]="orientation() === 'horizontal' ? 'month' : undefined"
                                        [valueXField]="orientation() === 'horizontal' ? fieldKeys[i - 1] : undefined"
                                        [valueYField]="orientation() === 'vertical' ? fieldKeys[i - 1] : undefined"
                                        [name]="datasetCount() === 1 ? seriesNames[0] : seriesNames[i - 1]"
                                        [color]="datasetCount() === 1 ? color() : seriesColors()[i - 1]"
                                        [opacity]="opacityProp()"
                                        [borderRadius]="borderRadius()"
                                        [borderStrokeWidth]="borderWidth()"
                                        [borderColor]="borderWidth() > 0 ? borderColor() : undefined"
                                        [borderAlign]="borderWidth() > 0 ? borderAlign() : undefined"
                                        [borderDash]="borderDashProp()"
                                        [borderDashOffset]="borderDashProp() ? borderDashOffset() : undefined"
                                        [borderJoinStyle]="borderJoinStyle()"
                                        [borderSkipped]="borderSkippedProp()"
                                        [categoryGap]="categoryGap()"
                                        [barGap]="barGap()"
                                        [barThickness]="barThicknessProp()"
                                        [maxBarThickness]="maxBarThicknessProp()"
                                        [minBarLength]="minBarLengthProp()"
                                        [hoverColor]="hoverColorProp()"
                                        [hoverBorderColor]="hoverBorderColorProp()"
                                        [sort]="sortProp()"
                                        [sortAggregate]="sortProp() ? sortAggregate() : undefined"
                                    />
                                }
                            }
                            <p-chart-x-axis [chartPaddingMin]="orientation() === 'vertical' ? chartPaddingMin() : undefined" [chartPaddingMax]="orientation() === 'vertical' ? chartPaddingMax() : undefined" />
                            <p-chart-y-axis [chartPaddingMin]="orientation() === 'horizontal' ? chartPaddingMin() : undefined" [chartPaddingMax]="orientation() === 'horizontal' ? chartPaddingMax() : undefined" />
                            <p-chart-legend position="bottom" />
                            <p-chart-tooltip />
                            <p-chart-hover [brightness]="hoverBrightness()" [dimOpacity]="hoverDimOpacity()" />
                        </p-chart-svg>
                    </div>

                    <div class="playground-controls">
                        <div class="playground-controls-header">Controls</div>

                        <app-playground-section title="Series" [open]="openGroups().series" (toggle)="toggleGroup('series')">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">orientation</label>
                                <p-selectbutton [options]="orientationOptions" [ngModel]="orientation()" (ngModelChange)="orientation.set($event)" [allowEmpty]="false" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">datasets — {{ datasetCount() }}</label>
                                <p-selectbutton [options]="datasetOptions" [ngModel]="datasetCountStr()" (ngModelChange)="setDatasetCountStr($event)" [allowEmpty]="false" />
                            </div>
                            @if (isMulti()) {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">stacking</label>
                                    <p-selectbutton [options]="stackOptions" [ngModel]="stackMode()" (ngModelChange)="stackMode.set($event)" [allowEmpty]="false" />
                                </div>
                            }
                        </app-playground-section>

                        <app-playground-section title="Sizing" [open]="openGroups().sizing" (toggle)="toggleGroup('sizing')">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">categoryGap — {{ categoryGap().toFixed(2) }}</label>
                                <p-slider [ngModel]="categoryGap()" (ngModelChange)="categoryGap.set($event)" [min]="0" [max]="0.9" [step]="0.05" styleClass="w-full" />
                            </div>
                            @if (isMulti() && !isStacked()) {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">barGap — {{ barGap().toFixed(2) }}</label>
                                    <p-slider [ngModel]="barGap()" (ngModelChange)="barGap.set($event)" [min]="0" [max]="0.5" [step]="0.02" styleClass="w-full" />
                                </div>
                            }
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">chartPaddingMin — {{ chartPaddingMin().toFixed(2) }}</label>
                                <p-slider [ngModel]="chartPaddingMin()" (ngModelChange)="chartPaddingMin.set($event)" [min]="-0.5" [max]="0.5" [step]="0.05" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">chartPaddingMax — {{ chartPaddingMax().toFixed(2) }}</label>
                                <p-slider [ngModel]="chartPaddingMax()" (ngModelChange)="chartPaddingMax.set($event)" [min]="-0.5" [max]="0.5" [step]="0.05" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">barThickness — {{ barThickness() === 0 ? 'auto' : barThickness() + 'px' }}</label>
                                <p-slider [ngModel]="barThickness()" (ngModelChange)="barThickness.set($event)" [min]="0" [max]="60" [step]="2" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">maxBarThickness — {{ maxBarThickness() === 0 ? 'off' : maxBarThickness() + 'px' }}</label>
                                <p-slider [ngModel]="maxBarThickness()" (ngModelChange)="maxBarThickness.set($event)" [min]="0" [max]="80" [step]="2" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">minBarLength — {{ minBarLength() === 0 ? 'off' : minBarLength() + 'px' }}</label>
                                <p-slider [ngModel]="minBarLength()" (ngModelChange)="minBarLength.set($event)" [min]="0" [max]="30" [step]="1" styleClass="w-full" />
                            </div>
                        </app-playground-section>

                        <app-playground-section title="Color" [open]="openGroups().color" (toggle)="toggleGroup('color')">
                            @if (!isMulti()) {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">color</label>
                                    <div class="flex items-center gap-2">
                                        <input type="color" [value]="color()" (input)="color.set($any($event.target).value)" style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0" />
                                        <span class="text-xs font-semibold">{{ color() }}</span>
                                    </div>
                                </div>
                            } @else {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">series colors</label>
                                    <div class="flex items-center gap-2">
                                        @for (i of seriesIndexes(); track i) {
                                            <div class="flex items-center gap-1">
                                                <input type="color" [value]="seriesColors()[i - 1]" (input)="setSeriesColor(i - 1, $event)" style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0" />
                                                <span class="text-[10px] opacity-60">S{{ i }}</span>
                                            </div>
                                        }
                                    </div>
                                </div>
                            }
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
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">borderSkipped</label>
                                    <p-select [options]="borderSkippedOptions" [ngModel]="borderSkipped()" (ngModelChange)="borderSkipped.set($event)" styleClass="w-full" appendTo="body" />
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
                            @if (sortMode() !== 'none' && isMulti()) {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">sortAggregate</label>
                                    <p-selectbutton [options]="aggregateOptions" [ngModel]="sortAggregate()" (ngModelChange)="sortAggregate.set($event)" [allowEmpty]="false" />
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
export class ColumnBarPlaygroundPlaygroundDoc {
    readonly baseData = baseData;

    readonly fieldKeys = ['booked', 'activated', 'retained'] as const;
    readonly seriesNames = ['Booked', 'Activated', 'Retained'];

    readonly orientationOptions = ['vertical', 'horizontal'];
    readonly datasetOptions = ['1', '2', '3'];
    readonly stackOptions = ['none', 'normal', 'percent'];
    readonly alignOptions = ['center', 'inner'];
    readonly dashOptions = ['none', 'dashed', 'dotted'];
    readonly joinOptions = ['miter', 'round', 'bevel'];
    readonly borderSkippedOptions = ['start', 'end', 'top', 'bottom', 'left', 'right', 'none'];
    readonly autoCustomOptions = ['auto', 'custom'];
    readonly sortOptions = ['none', 'value-asc', 'value-desc', 'label-asc', 'label-desc'];
    readonly aggregateOptions = ['sum', 'max', 'min', 'first'];

    readonly seriesColors = signal(['#5daeea', '#ffad5a', '#10a981']);
    readonly orientation = signal<'vertical' | 'horizontal'>('vertical');
    readonly datasetCount = signal(1);
    readonly stackMode = signal<'none' | 'normal' | 'percent'>('none');

    readonly categoryGap = signal(0.3);
    readonly barGap = signal(0.1);
    readonly chartPaddingMin = signal(0);
    readonly chartPaddingMax = signal(0);
    readonly barThickness = signal(0);
    readonly maxBarThickness = signal(0);
    readonly minBarLength = signal(0);

    readonly color = signal('#5daeea');
    readonly opacity = signal(1);

    readonly borderRadius = signal(0);
    readonly borderWidth = signal(0);
    readonly borderColor = signal('#94a3b8');
    readonly borderAlign = signal<'center' | 'inner'>('center');
    readonly borderDashMode = signal('none');
    readonly borderDashOffset = signal(0);
    readonly borderJoinStyle = signal<'miter' | 'round' | 'bevel'>('miter');
    readonly borderSkipped = signal('start');

    readonly sortMode = signal('none');
    readonly sortAggregate = signal<'sum' | 'max' | 'min' | 'first'>('sum');

    readonly hoverBrightness = signal(1.1);
    readonly hoverDimOpacity = signal(1);
    readonly hoverColorMode = signal('auto');
    readonly hoverColor = signal('#7c8cff');
    readonly hoverBorderColorMode = signal('auto');
    readonly hoverBorderColor = signal('#7c8cff');

    readonly datasetCountStr = computed(() => String(this.datasetCount()));
    readonly seriesIndexes = computed(() => Array.from({ length: this.datasetCount() }, (_, k) => k + 1));
    readonly isMulti = computed(() => this.datasetCount() > 1);
    readonly isStacked = computed(() => this.stackMode() !== 'none' && this.isMulti());
    readonly stackedMode = computed<'normal' | 'percent'>(() => (this.stackMode() === 'percent' ? 'percent' : 'normal'));

    readonly opacityProp = computed(() => (this.opacity() !== 1 ? this.opacity() : undefined));
    readonly sortProp = computed(() => (this.sortMode() === 'none' ? undefined : (this.sortMode() as 'value-asc' | 'value-desc' | 'label-asc' | 'label-desc')));
    readonly barThicknessProp = computed(() => (this.barThickness() > 0 ? this.barThickness() : undefined));
    readonly maxBarThicknessProp = computed(() => (this.maxBarThickness() > 0 ? this.maxBarThickness() : undefined));
    readonly minBarLengthProp = computed(() => (this.minBarLength() > 0 ? this.minBarLength() : undefined));
    readonly borderDashProp = computed<number[] | undefined>(() => {
        if (this.borderDashMode() === 'dashed') return [6, 4];

        if (this.borderDashMode() === 'dotted') return [2, 2];

        return undefined;
    });
    readonly borderSkippedProp = computed<false | 'end' | 'top' | 'bottom' | 'left' | 'right' | undefined>(() => {
        if (this.borderSkipped() === 'start') return undefined;

        if (this.borderSkipped() === 'none') return false;

        return this.borderSkipped() as 'end' | 'top' | 'bottom' | 'left' | 'right';
    });
    readonly hoverColorProp = computed(() => (this.hoverColorMode() === 'custom' ? this.hoverColor() : undefined));
    readonly hoverBorderColorProp = computed(() => (this.hoverBorderColorMode() === 'custom' ? this.hoverBorderColor() : undefined));

    readonly openGroups = signal<Record<string, boolean>>({ series: true, sizing: false, color: false, border: false, hover: false, sort: false });

    toggleGroup(group: string): void {
        this.openGroups.update((groups) => ({ ...groups, [group]: !groups[group] }));
    }

    setDatasetCountStr(value: string): void {
        this.datasetCount.set(Number(value));
    }

    setSeriesColor(index: number, event: Event): void {
        const value = (event.target as HTMLInputElement).value;

        this.seriesColors.update((colors) => colors.map((c, i) => (i === index ? value : c)));
    }

    readonly generatedCode = computed(() => {
        const hoverAttrs = this.buildHoverProps();
        const indent = '\n        ';
        const count = this.datasetCount();

        const makeBar = (i: number) => {
            const props = this.buildBarProps(i);

            return `    <p-chart-bar${indent}${props.map((p) => `    ${p}`).join(indent)}\n    />`;
        };

        let inner: string;

        if (this.isStacked()) {
            const bars = Array.from({ length: count }, (_, idx) => makeBar(idx + 1)).join('\n');

            inner = `    <p-chart-stacked mode="${this.stackMode()}">\n${bars}\n    </p-chart-stacked>`;
        } else {
            inner = Array.from({ length: count }, (_, idx) => makeBar(idx + 1)).join('\n');
        }

        const axisProps: string[] = [];

        if (this.chartPaddingMin() !== 0) axisProps.push(`[chartPaddingMin]="${this.chartPaddingMin()}"`);

        if (this.chartPaddingMax() !== 0) axisProps.push(`[chartPaddingMax]="${this.chartPaddingMax()}"`);

        const isHorizontal = this.orientation() === 'horizontal';
        const xAxis = axisProps.length && !isHorizontal ? `<p-chart-x-axis ${axisProps.join(' ')} />` : '<p-chart-x-axis />';
        const yAxis = axisProps.length && isHorizontal ? `<p-chart-y-axis ${axisProps.join(' ')} />` : '<p-chart-y-axis />';

        return `<p-chart-svg [responsive]="true" [height]="460">
${inner}
    ${xAxis}
    ${yAxis}
    <p-chart-legend position="bottom" />
    <p-chart-tooltip />
    <p-chart-hover${hoverAttrs} />
</p-chart-svg>`;
    });

    private buildBarProps(i: number): string[] {
        const seriesColor = this.isMulti() ? this.seriesColors()[i - 1] : this.color();
        const valueField = this.fieldKeys[i - 1];
        const seriesName = this.isMulti() ? this.seriesNames[i - 1] : this.seriesNames[0];

        const catAttr = this.orientation() === 'horizontal' ? 'categoryYField' : 'categoryXField';
        const valAttr = this.orientation() === 'horizontal' ? 'valueXField' : 'valueYField';

        const props: string[] = [`id="series-${i}"`, '[data]="data"', `${catAttr}="month"`, `${valAttr}="${valueField}"`, `name="${seriesName}"`, `color="${seriesColor}"`];

        if (this.opacityProp() !== undefined) props.push(`[opacity]="${this.opacityProp()}"`);

        if (this.categoryGap() !== 0.1) props.push(`[categoryGap]="${this.categoryGap()}"`);

        if (this.barGap() !== 0.02 && this.isMulti() && !this.isStacked()) props.push(`[barGap]="${this.barGap()}"`);

        if (this.barThickness() > 0) props.push(`[barThickness]="${this.barThickness()}"`);

        if (this.maxBarThickness() > 0) props.push(`[maxBarThickness]="${this.maxBarThickness()}"`);

        if (this.minBarLength() > 0) props.push(`[minBarLength]="${this.minBarLength()}"`);

        if (this.borderRadius() !== 0) props.push(`[borderRadius]="${this.borderRadius()}"`);

        if (this.borderWidth() !== 0) {
            props.push(`[borderStrokeWidth]="${this.borderWidth()}"`);
            if (this.borderColor() !== '#94a3b8') props.push(`borderColor="${this.borderColor()}"`);

            if (this.borderAlign() !== 'center') props.push(`borderAlign="${this.borderAlign()}"`);

            if (this.borderDashProp()) {
                props.push(`[borderDash]="[${this.borderDashProp()!.join(', ')}]"`);
                if (this.borderDashOffset() !== 0) props.push(`[borderDashOffset]="${this.borderDashOffset()}"`);
            }

            if (this.borderJoinStyle() !== 'miter') props.push(`borderJoinStyle="${this.borderJoinStyle()}"`);

            if (this.borderSkippedProp() !== undefined) {
                const bsVal = this.borderSkippedProp();

                if (bsVal === false) props.push('[borderSkipped]="false"');
                else props.push(`borderSkipped="${bsVal}"`);
            }
        }

        if (this.hoverColorProp()) props.push(`hoverColor="${this.hoverColorProp()}"`);

        if (this.hoverBorderColorProp()) props.push(`hoverBorderColor="${this.hoverBorderColorProp()}"`);

        if (this.sortProp()) {
            props.push(`sort="${this.sortProp()}"`);
            if (this.isMulti() && this.sortAggregate() !== 'sum') props.push(`sortAggregate="${this.sortAggregate()}"`);
        }

        return props;
    }

    private buildHoverProps(): string {
        const parts: string[] = [];

        if (this.hoverBrightness() !== 1.1) parts.push(`[brightness]="${this.hoverBrightness()}"`);

        if (this.hoverDimOpacity() !== 1) parts.push(`[dimOpacity]="${this.hoverDimOpacity()}"`);

        return parts.length ? ` ${parts.join(' ')}` : '';
    }
}

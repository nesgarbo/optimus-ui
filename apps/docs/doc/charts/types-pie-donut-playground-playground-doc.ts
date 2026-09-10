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

const allData = [
    { browser: 'Chrome', share: 65.7, radius: 90 },
    { browser: 'Safari', share: 18.2, radius: 70 },
    { browser: 'Edge', share: 5.2, radius: 50 },
    { browser: 'Firefox', share: 3.0, radius: 45 },
    { browser: 'Opera', share: 2.4, radius: 40 },
    { browser: 'Samsung', share: 2.8, radius: 55 },
    { browser: 'UC Browser', share: 1.2, radius: 35 },
    { browser: 'Other', share: 1.5, radius: 30 }
];

const ring2Data = [
    { label: 'Mobile', value: 58.4 },
    { label: 'Desktop', value: 38.9 },
    { label: 'Tablet', value: 2.7 }
];

const ring3Data = [
    { label: 'Organic', value: 44.1 },
    { label: 'Paid', value: 31.6 },
    { label: 'Direct', value: 24.3 }
];

@Component({
    selector: 'types-pie-donut-playground-playground-doc',
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
                                <p-chart-stacked [gap]="stackGap()">
                                    <p-chart-pie
                                        id="ring1"
                                        [data]="activeData()"
                                        valueField="share"
                                        categoryField="browser"
                                        [color]="colorsRing1()"
                                        name="Browser"
                                        [order]="0"
                                        [outerRadius]="outerRadius()"
                                        [innerRadius]="innerRadius()"
                                        [startAngle]="startAngle()"
                                        [sweepAngle]="sweepAngle()"
                                        [spacing]="spacing()"
                                        [borderRadius]="borderRadius()"
                                        [borderStrokeWidth]="borderWidth()"
                                        [borderColor]="borderWidth() > 0 ? borderColor() : undefined"
                                        [borderAlign]="borderWidth() > 0 ? borderAlign() : undefined"
                                        [borderDash]="borderDashProp()"
                                        [borderDashOffset]="borderDashProp() ? borderDashOffset() : undefined"
                                        [borderJoinStyle]="borderJoinStyle()"
                                        [sort]="sortProp()"
                                        [opacity]="opacity() !== 1 ? opacity() : undefined"
                                        [hoverColor]="hoverColorMode() === 'custom' ? hoverColor() : undefined"
                                        [hoverBorderColor]="hoverBorderColorMode() === 'custom' ? hoverBorderColor() : undefined"
                                    />
                                    @if (ringCount() >= 2) {
                                        <p-chart-pie
                                            id="ring2"
                                            [data]="ring2Data"
                                            valueField="value"
                                            categoryField="label"
                                            [color]="colorsRing2()"
                                            name="Device"
                                            [order]="1"
                                            [startAngle]="startAngle()"
                                            [sweepAngle]="sweepAngle()"
                                            [spacing]="spacing()"
                                            [borderRadius]="borderRadius()"
                                            [borderStrokeWidth]="borderWidth()"
                                            [borderColor]="borderWidth() > 0 ? borderColor() : undefined"
                                            [borderAlign]="borderWidth() > 0 ? borderAlign() : undefined"
                                            [borderDash]="borderDashProp()"
                                            [borderDashOffset]="borderDashProp() ? borderDashOffset() : undefined"
                                            [borderJoinStyle]="borderJoinStyle()"
                                            [sort]="sortProp()"
                                            [opacity]="opacity() !== 1 ? opacity() : undefined"
                                            [hoverColor]="hoverColorMode() === 'custom' ? hoverColor() : undefined"
                                            [hoverBorderColor]="hoverBorderColorMode() === 'custom' ? hoverBorderColor() : undefined"
                                        />
                                    }
                                    @if (ringCount() >= 3) {
                                        <p-chart-pie
                                            id="ring3"
                                            [data]="ring3Data"
                                            valueField="value"
                                            categoryField="label"
                                            [color]="colorsRing3()"
                                            name="Source"
                                            [order]="2"
                                            [startAngle]="startAngle()"
                                            [sweepAngle]="sweepAngle()"
                                            [spacing]="spacing()"
                                            [borderRadius]="borderRadius()"
                                            [borderStrokeWidth]="borderWidth()"
                                            [borderColor]="borderWidth() > 0 ? borderColor() : undefined"
                                            [borderAlign]="borderWidth() > 0 ? borderAlign() : undefined"
                                            [borderDash]="borderDashProp()"
                                            [borderDashOffset]="borderDashProp() ? borderDashOffset() : undefined"
                                            [borderJoinStyle]="borderJoinStyle()"
                                            [sort]="sortProp()"
                                            [opacity]="opacity() !== 1 ? opacity() : undefined"
                                            [hoverColor]="hoverColorMode() === 'custom' ? hoverColor() : undefined"
                                            [hoverBorderColor]="hoverBorderColorMode() === 'custom' ? hoverBorderColor() : undefined"
                                        />
                                    }
                                </p-chart-stacked>
                            } @else {
                                <p-chart-pie
                                    id="pie"
                                    [data]="activeData()"
                                    valueField="share"
                                    categoryField="browser"
                                    [color]="colorsRing1()"
                                    [outerRadius]="outerRadius()"
                                    [innerRadius]="innerRadius()"
                                    [startAngle]="startAngle()"
                                    [sweepAngle]="sweepAngle()"
                                    [spacing]="spacing()"
                                    [sliceRadiusValue]="sliceRadiusProp()"
                                    [borderRadius]="borderRadius()"
                                    [borderStrokeWidth]="borderWidth()"
                                    [borderColor]="borderWidth() > 0 ? borderColor() : undefined"
                                    [borderAlign]="borderWidth() > 0 ? borderAlign() : undefined"
                                    [borderDash]="borderDashProp()"
                                    [borderDashOffset]="borderDashProp() ? borderDashOffset() : undefined"
                                    [borderJoinStyle]="borderJoinStyle()"
                                    [sort]="sortProp()"
                                    [opacity]="opacity() !== 1 ? opacity() : undefined"
                                    [hoverColor]="hoverColorMode() === 'custom' ? hoverColor() : undefined"
                                    [hoverBorderColor]="hoverBorderColorMode() === 'custom' ? hoverBorderColor() : undefined"
                                />
                            }
                            <p-chart-legend position="bottom" />
                            <p-chart-tooltip />
                            <p-chart-hover [offset]="hoverOffset()" [scale]="hoverScale()" [brightness]="hoverBrightness()" [dimOpacity]="hoverDimOpacity()" />
                        </p-chart-svg>
                    </div>

                    <div class="playground-controls">
                        <div class="playground-controls-header">Controls</div>

                        <app-playground-section title="Series" [open]="openGroups().series" (toggle)="toggleGroup('series')">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">items — {{ itemCount() }}</label>
                                <p-slider [ngModel]="itemCount()" (ngModelChange)="itemCount.set($event)" [min]="2" [max]="8" [step]="1" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">outerRadius — {{ outerRadius().toFixed(2) }}</label>
                                <p-slider [ngModel]="outerRadius()" (ngModelChange)="outerRadius.set($event)" [min]="0.3" [max]="1" [step]="0.05" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">innerRadius — {{ innerRadius().toFixed(2) }}</label>
                                <p-slider [ngModel]="innerRadius()" (ngModelChange)="innerRadius.set($event)" [min]="0" [max]="0.9" [step]="0.05" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">startAngle — {{ startAngle() }}°</label>
                                <p-slider [ngModel]="startAngle()" (ngModelChange)="startAngle.set($event)" [min]="-180" [max]="180" [step]="5" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">sweepAngle — {{ sweepAngle() }}°</label>
                                <p-slider [ngModel]="sweepAngle()" (ngModelChange)="sweepAngle.set($event)" [min]="30" [max]="360" [step]="5" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">spacing — {{ spacing() }}px</label>
                                <p-slider [ngModel]="spacing()" (ngModelChange)="spacing.set($event)" [min]="0" [max]="10" [step]="1" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">opacity — {{ opacity().toFixed(2) }}</label>
                                <p-slider [ngModel]="opacity()" (ngModelChange)="opacity.set($event)" [min]="0.1" [max]="1" [step]="0.05" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">nightingale (sliceRadiusValue)</label>
                                <p-selectbutton [options]="onOffOptions" [ngModel]="nightingaleOpt()" (ngModelChange)="setNightingaleOpt($event)" [allowEmpty]="false" [disabled]="isStacked()" />
                            </div>
                        </app-playground-section>

                        <app-playground-section title="Concentric Rings" [open]="openGroups().stacked" (toggle)="toggleGroup('stacked')">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">rings — {{ ringCount() }}</label>
                                <p-selectbutton [options]="ringOptions" [ngModel]="ringCountStr()" (ngModelChange)="setRingCountStr($event)" [allowEmpty]="false" />
                            </div>
                            @if (isStacked()) {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">gap — {{ stackGap() }}px</label>
                                    <p-slider [ngModel]="stackGap()" (ngModelChange)="stackGap.set($event)" [min]="0" [max]="24" [step]="2" styleClass="w-full" />
                                </div>
                            }
                        </app-playground-section>

                        <app-playground-section title="Color" [open]="openGroups().color" (toggle)="toggleGroup('color')">
                            @if (!isStacked()) {
                                <label class="text-xs text-surface-500 dark:text-surface-400">slice colors</label>
                                <div class="flex flex-wrap gap-x-3 gap-y-2">
                                    @for (item of activeData(); track item.browser; let i = $index) {
                                        <div class="flex items-center gap-1">
                                            <input type="color" [value]="colorsRing1()[i]" (input)="setColor(colorsRing1, i, $event)" style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0" />
                                            <span class="text-[10px] opacity-60">{{ item.browser }}</span>
                                        </div>
                                    }
                                </div>
                            } @else {
                                <label class="text-xs text-surface-500 dark:text-surface-400">ring 1</label>
                                <div class="flex flex-wrap gap-x-3 gap-y-2">
                                    @for (item of activeData(); track item.browser; let i = $index) {
                                        <div class="flex items-center gap-1">
                                            <input type="color" [value]="colorsRing1()[i]" (input)="setColor(colorsRing1, i, $event)" style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0" />
                                            <span class="text-[10px] opacity-60">{{ item.browser }}</span>
                                        </div>
                                    }
                                </div>
                                @if (ringCount() >= 2) {
                                    <label class="text-xs text-surface-500 dark:text-surface-400">ring 2</label>
                                    <div class="flex flex-wrap gap-x-3 gap-y-2">
                                        @for (item of ring2Data; track item.label; let i = $index) {
                                            <div class="flex items-center gap-1">
                                                <input type="color" [value]="colorsRing2()[i]" (input)="setColor(colorsRing2, i, $event)" style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0" />
                                                <span class="text-[10px] opacity-60">{{ item.label }}</span>
                                            </div>
                                        }
                                    </div>
                                }
                                @if (ringCount() >= 3) {
                                    <label class="text-xs text-surface-500 dark:text-surface-400">ring 3</label>
                                    <div class="flex flex-wrap gap-x-3 gap-y-2">
                                        @for (item of ring3Data; track item.label; let i = $index) {
                                            <div class="flex items-center gap-1">
                                                <input type="color" [value]="colorsRing3()[i]" (input)="setColor(colorsRing3, i, $event)" style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0" />
                                                <span class="text-[10px] opacity-60">{{ item.label }}</span>
                                            </div>
                                        }
                                    </div>
                                }
                            }
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
                                <label class="text-xs text-surface-500 dark:text-surface-400">hoverColor (slice override)</label>
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
                                <label class="text-xs text-surface-500 dark:text-surface-400">hoverBorderColor (slice override)</label>
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
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PieDonutPlaygroundPlaygroundDoc {
    readonly ring2Data = ring2Data;
    readonly ring3Data = ring3Data;

    readonly onOffOptions = ['off', 'on'];
    readonly ringOptions = ['1', '2', '3'];
    readonly alignOptions = ['center', 'inner'];
    readonly dashOptions = ['none', 'dashed', 'dotted'];
    readonly joinOptions = ['miter', 'round', 'bevel'];
    readonly autoCustomOptions = ['auto', 'custom'];
    readonly sortOptions = ['none', 'value-asc', 'value-desc', 'label-asc', 'label-desc'];

    readonly colorsRing1 = signal(['#5daeea', '#ffad5a', '#ffd166', '#4ecdc4', '#7c8cff', '#c084fc', '#ff6fae', '#94a3b8']);
    readonly colorsRing2 = signal(['#4ecdc4', '#5daeea', '#7c8cff']);
    readonly colorsRing3 = signal(['#ff7a66', '#10a981', '#ffd166']);

    readonly itemCount = signal(5);
    readonly outerRadius = signal(1);
    readonly innerRadius = signal(0);
    readonly startAngle = signal(-90);
    readonly sweepAngle = signal(360);
    readonly spacing = signal(0);
    readonly sortMode = signal('none');
    readonly nightingale = signal(false);
    readonly ringCount = signal(1);
    readonly stackGap = signal(8);
    readonly borderRadius = signal(0);
    readonly borderWidth = signal(0);
    readonly borderColor = signal('#ffffff');
    readonly borderAlign = signal<'center' | 'inner'>('center');
    readonly borderDashMode = signal('none');
    readonly borderDashOffset = signal(0);
    readonly borderJoinStyle = signal<'miter' | 'round' | 'bevel'>('miter');
    readonly hoverOffset = signal(8);
    readonly hoverScale = signal(1);
    readonly hoverBrightness = signal(1.1);
    readonly hoverDimOpacity = signal(1);
    readonly hoverColorMode = signal('auto');
    readonly hoverColor = signal('#5daeea');
    readonly hoverBorderColorMode = signal('auto');
    readonly hoverBorderColor = signal('#ffffff');
    readonly opacity = signal(1);

    readonly nightingaleOpt = computed(() => (this.nightingale() ? 'on' : 'off'));
    readonly ringCountStr = computed(() => String(this.ringCount()));

    readonly activeData = computed(() => allData.slice(0, this.itemCount()));
    readonly isStacked = computed(() => this.ringCount() > 1);
    readonly sortProp = computed(() => (this.sortMode() === 'none' ? undefined : (this.sortMode() as 'value-asc' | 'value-desc' | 'label-asc' | 'label-desc')));
    readonly sliceRadiusProp = computed(() => (this.nightingale() && !this.isStacked() ? 'radius' : undefined));
    readonly borderDashProp = computed<number[] | undefined>(() => {
        if (this.borderDashMode() === 'dashed') return [6, 4];

        if (this.borderDashMode() === 'dotted') return [2, 2];

        return undefined;
    });

    readonly openGroups = signal<Record<string, boolean>>({ series: true, color: false, stacked: false, border: false, hover: false, sort: false });

    toggleGroup(group: string): void {
        this.openGroups.update((groups) => ({ ...groups, [group]: !groups[group] }));
    }

    setNightingaleOpt(value: string): void {
        this.nightingale.set(value === 'on');
    }

    setRingCountStr(value: string): void {
        this.ringCount.set(Number(value));
    }

    setColor(target: WritableSignal<string[]>, index: number, event: Event): void {
        const value = (event.target as HTMLInputElement).value;

        target.update((colors) => colors.map((c, i) => (i === index ? value : c)));
    }

    readonly generatedCode = computed(() => {
        const indent = '\n        ';
        const makeBlock = (props: string[]) => props.map((p) => `    ${p}`).join(indent);
        const hoverAttrs = this.buildHoverProps();

        let inner: string;

        if (this.isStacked()) {
            const ring1 = `    <p-chart-pie${indent}${makeBlock(
                this.buildPieProps({ id: 'ring1', dataVar: 'data', colors: this.colorsRing1().slice(0, this.itemCount()), name: 'Browser', order: 0, showShape: true, valueField: 'share', categoryField: 'browser' })
            )}\n    />`;
            let rings = ring1;

            if (this.ringCount() >= 2) {
                rings += `\n    <p-chart-pie${indent}${makeBlock(this.buildPieProps({ id: 'ring2', dataVar: 'ring2Data', colors: this.colorsRing2(), name: 'Device', order: 1, showShape: false }))}\n    />`;
            }

            if (this.ringCount() >= 3) {
                rings += `\n    <p-chart-pie${indent}${makeBlock(this.buildPieProps({ id: 'ring3', dataVar: 'ring3Data', colors: this.colorsRing3(), name: 'Source', order: 2, showShape: false }))}\n    />`;
            }

            const gapProp = this.stackGap() !== 8 ? ` [gap]="${this.stackGap()}"` : '';

            inner = `    <p-chart-stacked${gapProp}>\n${rings}\n    </p-chart-stacked>`;
        } else {
            inner = `    <p-chart-pie${indent}${makeBlock(this.buildPieProps({ id: 'pie', dataVar: 'data', colors: this.colorsRing1().slice(0, this.itemCount()), showShape: true, valueField: 'share', categoryField: 'browser' }))}\n    />`;
        }

        return `<p-chart-svg [responsive]="true" [height]="460">
${inner}
    <p-chart-legend position="bottom" />
    <p-chart-tooltip />
    <p-chart-hover${hoverAttrs} />
</p-chart-svg>`;
    });

    private buildPieProps(opts: { id: string; dataVar: string; colors: string[]; name?: string; order?: number; showShape?: boolean; valueField?: string; categoryField?: string }): string[] {
        const { id, dataVar, colors, name, order, showShape, valueField = 'value', categoryField = 'label' } = opts;
        const colorArr = `[${colors.map((c) => `'${c}'`).join(', ')}]`;
        const props: string[] = [`id="${id}"`, `[data]="${dataVar}"`, `valueField="${valueField}"`, `categoryField="${categoryField}"`, `[color]="${colorArr}"`];

        if (name) props.push(`name="${name}"`);

        if (order !== undefined) props.push(`[order]="${order}"`);

        if (showShape) {
            if (this.outerRadius() !== 1) props.push(`[outerRadius]="${this.outerRadius()}"`);

            if (this.innerRadius() !== 0) props.push(`[innerRadius]="${this.innerRadius()}"`);
        }

        if (this.startAngle() !== -90) props.push(`[startAngle]="${this.startAngle()}"`);

        if (this.sweepAngle() !== 360) props.push(`[sweepAngle]="${this.sweepAngle()}"`);

        if (this.spacing() !== 0) props.push(`[spacing]="${this.spacing()}"`);

        if (showShape && this.sliceRadiusProp()) props.push('sliceRadiusValue="radius"');

        if (this.borderRadius() !== 0) props.push(`[borderRadius]="${this.borderRadius()}"`);

        if (this.borderWidth() !== 0) {
            props.push(`[borderStrokeWidth]="${this.borderWidth()}"`);
            if (this.borderColor() !== '#ffffff') props.push(`borderColor="${this.borderColor()}"`);

            if (this.borderAlign() !== 'center') props.push(`borderAlign="${this.borderAlign()}"`);

            if (this.borderDashProp()) {
                props.push(`[borderDash]="[${this.borderDashProp()!.join(', ')}]"`);
                if (this.borderDashOffset() !== 0) props.push(`[borderDashOffset]="${this.borderDashOffset()}"`);
            }

            if (this.borderJoinStyle() !== 'miter') props.push(`borderJoinStyle="${this.borderJoinStyle()}"`);
        }

        if (showShape && this.sortProp()) props.push(`sort="${this.sortProp()}"`);

        if (this.opacity() !== 1) props.push(`[opacity]="${this.opacity()}"`);

        if (this.hoverColorMode() === 'custom') props.push(`hoverColor="${this.hoverColor()}"`);

        if (this.hoverBorderColorMode() === 'custom') props.push(`hoverBorderColor="${this.hoverBorderColor()}"`);

        return props;
    }

    private buildHoverProps(): string {
        const parts: string[] = [];

        if (this.hoverOffset() !== 8) parts.push(`[offset]="${this.hoverOffset()}"`);

        if (this.hoverBrightness() !== 1.1) parts.push(`[brightness]="${this.hoverBrightness()}"`);

        if (this.hoverDimOpacity() !== 1) parts.push(`[dimOpacity]="${this.hoverDimOpacity()}"`);

        return parts.length ? ` ${parts.join(' ')}` : '';
    }
}

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

type ColorPreset = 'default' | 'heat' | 'ocean' | 'health' | 'aurora';

const colorPresets: Record<Exclude<ColorPreset, 'default'>, string[]> = {
    heat: ['#fff7ed', '#ffad5a', '#b23b4b'],
    ocean: ['#eef6ff', '#5bc8f5', '#2531a8'],
    health: ['#ff7a66', '#d6dbe6', '#5ccf9f'],
    aurora: ['#5daeea', '#4ecdc4', '#ff6fae']
};

const data = [
    { name: 'Technology', value: 1200, id: 'tech', parent: null },
    { name: 'Healthcare', value: 850, id: 'health', parent: null },
    { name: 'Finance', value: 700, id: 'finance', parent: null },
    { name: 'Software', value: 500, id: 't1', parent: 'tech' },
    { name: 'Hardware', value: 400, id: 't2', parent: 'tech' },
    { name: 'Cloud', value: 300, id: 't3', parent: 'tech' },
    { name: 'Pharma', value: 450, id: 'h1', parent: 'health' },
    { name: 'Biotech', value: 250, id: 'h2', parent: 'health' },
    { name: 'Devices', value: 150, id: 'h3', parent: 'health' },
    { name: 'Banking', value: 300, id: 'f1', parent: 'finance' },
    { name: 'Insurance', value: 250, id: 'f2', parent: 'finance' },
    { name: 'Investment', value: 150, id: 'f3', parent: 'finance' }
];

@Component({
    selector: 'types-treemap-playground-playground-doc',
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
                            <p-chart-treemap
                                id="playground"
                                [data]="data"
                                categoryField="name"
                                valueField="value"
                                nodeId="id"
                                parentField="parent"
                                name="Market Cap (B)"
                                [layout]="layout()"
                                [spacing]="spacing()"
                                [groupPadding]="groupPadding()"
                                [labelMinSize]="labelMinSize()"
                                [colorRange]="activeColorRange()"
                                [colorValueField]="activeColorValue()"
                                [showGroupLabel]="showGroupLabel()"
                                [groupLabelHeight]="groupLabelHeight()"
                                [drilldown]="drilldown()"
                                [drilldownMode]="drilldownMode()"
                                [interactByLeaf]="interactByLeaf()"
                                [color]="cellColorEnabled() && colorPreset() === 'default' ? cellColor() : undefined"
                                [opacity]="cellOpacity() !== 1 ? cellOpacity() : undefined"
                                [colorScale]="colorScaleMode() === 'custom' && colorPreset() !== 'default' ? [colorScaleLow(), colorScaleMid(), colorScaleHigh()] : undefined"
                                [hoverColor]="hoverColorMode() === 'custom' ? hoverColor() : undefined"
                                [hoverBorderColor]="hoverBorderColorMode() === 'custom' ? hoverBorderColor() : undefined"
                                [rootLabel]="rootLabel() || undefined"
                                [borderRadius]="borderRadius()"
                                [borderStrokeWidth]="borderWidth()"
                                [borderColor]="borderColor()"
                                [borderAlign]="borderAlign()"
                                [borderDash]="borderDashProp()"
                                [borderDashOffset]="borderDashProp() ? borderDashOffset() : undefined"
                                [borderJoinStyle]="borderJoinStyle()"
                            />
                            @if (showDataLabels()) {
                                <p-chart-data-labels />
                            }
                            <p-chart-tooltip />
                            <p-chart-hover [brightness]="hoverBrightness()" [dimOpacity]="hoverDimOpacity()" />
                        </p-chart-svg>
                    </div>

                    <div class="playground-controls">
                        <div class="playground-controls-header">Controls</div>

                        <app-playground-section title="Layout" [open]="openGroups().layout" (toggle)="toggleGroup('layout')">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">layout</label>
                                <p-selectbutton [options]="layoutOptions" [ngModel]="layout()" (ngModelChange)="layout.set($event)" [allowEmpty]="false" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">spacing — {{ spacing() }}px</label>
                                <p-slider [ngModel]="spacing()" (ngModelChange)="spacing.set($event)" [min]="0" [max]="10" [step]="1" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">groupPadding — {{ groupPadding() }}px</label>
                                <p-slider [ngModel]="groupPadding()" (ngModelChange)="groupPadding.set($event)" [min]="0" [max]="40" [step]="2" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">labelMinSize — {{ labelMinSize() }}px</label>
                                <p-slider [ngModel]="labelMinSize()" (ngModelChange)="labelMinSize.set($event)" [min]="10" [max]="100" [step]="5" styleClass="w-full" />
                            </div>
                        </app-playground-section>

                        <app-playground-section title="Labels" [open]="openGroups().labels" (toggle)="toggleGroup('labels')">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">dataLabels</label>
                                <p-selectbutton [options]="onOffValueOptions" optionLabel="label" optionValue="value" [ngModel]="showDataLabels()" (ngModelChange)="showDataLabels.set($event)" [allowEmpty]="false" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">showGroupLabel</label>
                                <p-selectbutton [options]="onOffValueOptions" optionLabel="label" optionValue="value" [ngModel]="showGroupLabel()" (ngModelChange)="showGroupLabel.set($event)" [allowEmpty]="false" />
                            </div>
                            @if (showGroupLabel()) {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">groupLabelHeight — {{ groupLabelHeight() }}px</label>
                                    <p-slider [ngModel]="groupLabelHeight()" (ngModelChange)="groupLabelHeight.set($event)" [min]="12" [max]="36" [step]="2" styleClass="w-full" />
                                </div>
                            }
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">rootLabel</label>
                                <input
                                    type="text"
                                    placeholder='e.g. "All"'
                                    [value]="rootLabel()"
                                    (input)="rootLabel.set($any($event.target).value)"
                                    style="width: 100%; padding: 4px 8px; font-size: 12px; border: 1px solid var(--p-surface-300); border-radius: 4px; background: var(--p-surface-0); color: inherit"
                                />
                            </div>
                        </app-playground-section>

                        <app-playground-section title="Drilldown" [open]="openGroups().drilldown" (toggle)="toggleGroup('drilldown')">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">drilldown</label>
                                <p-selectbutton [options]="onOffValueOptions" optionLabel="label" optionValue="value" [ngModel]="drilldown()" (ngModelChange)="drilldown.set($event)" [allowEmpty]="false" />
                            </div>
                            @if (drilldown()) {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">drilldownMode</label>
                                    <p-selectbutton [options]="drilldownModeOptions" [ngModel]="drilldownMode()" (ngModelChange)="drilldownMode.set($event)" [allowEmpty]="false" />
                                </div>
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">interactByLeaf</label>
                                    <p-selectbutton [options]="onOffValueOptions" optionLabel="label" optionValue="value" [ngModel]="interactByLeaf()" (ngModelChange)="interactByLeaf.set($event)" [allowEmpty]="false" />
                                </div>
                            }
                        </app-playground-section>

                        <app-playground-section title="Color" [open]="openGroups().color" (toggle)="toggleGroup('color')">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">colorRange preset</label>
                                <p-select [options]="colorPresetOptions" [ngModel]="colorPreset()" (ngModelChange)="colorPreset.set($event)" styleClass="w-full" appendTo="body" />
                            </div>
                            @if (colorPreset() === 'default') {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">color override</label>
                                    <p-selectbutton [options]="onOffValueOptions" optionLabel="label" optionValue="value" [ngModel]="cellColorEnabled()" (ngModelChange)="cellColorEnabled.set($event)" [allowEmpty]="false" />
                                </div>
                                @if (cellColorEnabled()) {
                                    <div class="flex flex-col gap-1">
                                        <div class="flex items-center gap-2">
                                            <input type="color" [value]="cellColor()" (input)="cellColor.set($any($event.target).value)" style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0" />
                                            <span class="text-xs font-semibold">{{ cellColor() }}</span>
                                        </div>
                                    </div>
                                }
                            } @else {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">colorScale</label>
                                    <p-selectbutton [options]="autoCustomOptions" [ngModel]="colorScaleMode()" (ngModelChange)="colorScaleMode.set($event)" [allowEmpty]="false" />
                                </div>
                                @if (colorScaleMode() === 'custom') {
                                    <div class="flex flex-col gap-1">
                                        <label class="text-xs text-surface-500 dark:text-surface-400">low — {{ colorScaleLow() }}</label>
                                        <p-slider [ngModel]="colorScaleLow()" (ngModelChange)="colorScaleLow.set($event)" [min]="0" [max]="500" [step]="50" styleClass="w-full" />
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        <label class="text-xs text-surface-500 dark:text-surface-400">mid — {{ colorScaleMid() }}</label>
                                        <p-slider [ngModel]="colorScaleMid()" (ngModelChange)="colorScaleMid.set($event)" [min]="200" [max]="900" [step]="50" styleClass="w-full" />
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        <label class="text-xs text-surface-500 dark:text-surface-400">high — {{ colorScaleHigh() }}</label>
                                        <p-slider [ngModel]="colorScaleHigh()" (ngModelChange)="colorScaleHigh.set($event)" [min]="500" [max]="1500" [step]="50" styleClass="w-full" />
                                    </div>
                                }
                            }
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">opacity — {{ cellOpacity().toFixed(2) }}</label>
                                <p-slider [ngModel]="cellOpacity()" (ngModelChange)="cellOpacity.set($event)" [min]="0.1" [max]="1" [step]="0.05" styleClass="w-full" />
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
export class TreemapPlaygroundPlaygroundDoc {
    readonly data = data;

    readonly layoutOptions = ['squarify', 'slice', 'dice', 'sliceDice'];
    readonly colorPresetOptions = ['default', 'heat', 'ocean', 'health', 'aurora'];
    readonly drilldownModeOptions = ['nested', 'flat'];
    readonly autoCustomOptions = ['auto', 'custom'];
    readonly borderAlignOptions = ['center', 'inner'];
    readonly dashOptions = ['none', 'dashed', 'dotted'];
    readonly joinOptions = ['miter', 'round', 'bevel'];
    readonly onOffValueOptions = [
        { label: 'off', value: false },
        { label: 'on', value: true }
    ];

    readonly layout = signal<'squarify' | 'slice' | 'dice' | 'sliceDice'>('squarify');
    readonly spacing = signal(2);
    readonly groupPadding = signal(24);
    readonly labelMinSize = signal(30);

    readonly colorPreset = signal<ColorPreset>('default');

    readonly showDataLabels = signal(false);
    readonly showGroupLabel = signal(true);
    readonly groupLabelHeight = signal(18);

    readonly drilldown = signal(false);
    readonly drilldownMode = signal<'nested' | 'flat'>('nested');

    readonly borderRadius = signal(2);
    readonly borderWidth = signal(1);
    readonly borderColor = signal('#475569');
    readonly borderAlign = signal<'center' | 'inner'>('center');
    readonly borderDashMode = signal('none');
    readonly borderDashOffset = signal(0);
    readonly borderJoinStyle = signal<'miter' | 'round' | 'bevel'>('miter');

    readonly cellColorEnabled = signal(false);
    readonly cellColor = signal('#5daeea');
    readonly cellOpacity = signal(1);
    readonly hoverColorMode = signal('auto');
    readonly hoverColor = signal('#5daeea');
    readonly hoverBorderColorMode = signal('auto');
    readonly hoverBorderColor = signal('#ffffff');
    readonly colorScaleMode = signal('auto');
    readonly colorScaleLow = signal(150);
    readonly colorScaleMid = signal(600);
    readonly colorScaleHigh = signal(1200);
    readonly rootLabel = signal('');
    readonly interactByLeaf = signal(true);
    readonly hoverBrightness = signal(1.1);
    readonly hoverDimOpacity = signal(1);

    readonly borderDashProp = computed<number[] | undefined>(() => {
        if (this.borderDashMode() === 'dashed') return [6, 4];

        if (this.borderDashMode() === 'dotted') return [2, 2];

        return undefined;
    });

    readonly activeColorRange = computed<string[] | undefined>(() => (this.colorPreset() !== 'default' ? colorPresets[this.colorPreset() as Exclude<ColorPreset, 'default'>] : undefined));
    readonly activeColorValue = computed<string | undefined>(() => (this.colorPreset() !== 'default' ? 'value' : undefined));

    readonly openGroups = signal<Record<string, boolean>>({ layout: true, color: false, labels: false, border: false, drilldown: false, hover: false });

    toggleGroup(group: string): void {
        this.openGroups.update((groups) => ({ ...groups, [group]: !groups[group] }));
    }

    readonly generatedCode = computed(() => {
        const hoverAttrs = this.buildHoverProps();
        const indent = '\n        ';
        const propsStr = this.buildTreemapProps()
            .map((p) => `    ${p}`)
            .join(indent);

        const dataLabels = this.showDataLabels() ? '\n    <p-chart-data-labels />' : '';

        return `<p-chart-svg [responsive]="true" [height]="460">
    <p-chart-treemap${indent}${propsStr}
    />${dataLabels}
    <p-chart-tooltip />
    <p-chart-hover${hoverAttrs} />
</p-chart-svg>`;
    });

    private buildTreemapProps(): string[] {
        const props: string[] = ['[data]="data"', 'categoryField="name"', 'valueField="value"', 'nodeId="id"', 'parentField="parent"', 'name="Market Cap (B)"'];

        if (this.layout() !== 'squarify') props.push(`layout="${this.layout()}"`);

        if (this.spacing() !== 2) props.push(`[spacing]="${this.spacing()}"`);

        if (this.groupPadding() !== 24) props.push(`[groupPadding]="${this.groupPadding()}"`);

        if (this.labelMinSize() !== 30) props.push(`[labelMinSize]="${this.labelMinSize()}"`);

        if (this.colorPreset() !== 'default') {
            const arr = colorPresets[this.colorPreset() as Exclude<ColorPreset, 'default'>];

            props.push('colorValueField="value"');
            props.push(`[colorRange]="[${arr.map((c) => `'${c}'`).join(', ')}]"`);
        }

        if (!this.showGroupLabel()) props.push('[showGroupLabel]="false"');

        if (this.showGroupLabel() && this.groupLabelHeight() !== 18) props.push(`[groupLabelHeight]="${this.groupLabelHeight()}"`);

        if (this.borderRadius() !== 2) props.push(`[borderRadius]="${this.borderRadius()}"`);

        if (this.borderWidth() !== 1) props.push(`[borderStrokeWidth]="${this.borderWidth()}"`);

        if (this.borderColor() !== '#475569') props.push(`borderColor="${this.borderColor()}"`);

        if (this.borderAlign() !== 'center') props.push(`borderAlign="${this.borderAlign()}"`);

        if (this.borderDashProp()) {
            props.push(`[borderDash]="[${this.borderDashProp()!.join(', ')}]"`);
            if (this.borderDashOffset() !== 0) props.push(`[borderDashOffset]="${this.borderDashOffset()}"`);
        }

        if (this.borderJoinStyle() !== 'miter') props.push(`borderJoinStyle="${this.borderJoinStyle()}"`);

        if (this.borderWidth() === 0) props.push('[borderStrokeWidth]="0"');

        if (this.drilldown()) {
            props.push('[drilldown]="true"');
            if (this.drilldownMode() !== 'nested') props.push(`drilldownMode="${this.drilldownMode()}"`);

            if (!this.interactByLeaf()) props.push('[interactByLeaf]="false"');
        }

        if (this.cellColorEnabled() && this.colorPreset() === 'default') props.push(`color="${this.cellColor()}"`);

        if (this.cellOpacity() !== 1) props.push(`[opacity]="${this.cellOpacity()}"`);

        if (this.colorScaleMode() === 'custom' && this.colorPreset() !== 'default') {
            props.push(`[colorScale]="[${this.colorScaleLow()}, ${this.colorScaleMid()}, ${this.colorScaleHigh()}]"`);
        }

        if (this.hoverColorMode() === 'custom') props.push(`hoverColor="${this.hoverColor()}"`);

        if (this.hoverBorderColorMode() === 'custom') props.push(`hoverBorderColor="${this.hoverBorderColor()}"`);

        if (this.rootLabel()) props.push(`rootLabel="${this.rootLabel()}"`);

        return props;
    }

    private buildHoverProps(): string {
        const parts: string[] = [];

        if (this.hoverBrightness() !== 1.1) parts.push(`[brightness]="${this.hoverBrightness()}"`);

        if (this.hoverDimOpacity() !== 1) parts.push(`[dimOpacity]="${this.hoverDimOpacity()}"`);

        return parts.length ? ` ${parts.join(' ')}` : '';
    }
}

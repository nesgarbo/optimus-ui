import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { FormsModule } from '@angular/forms';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { SelectButton } from '@openng/optimus-ui/selectbutton';
import { Slider } from '@openng/optimus-ui/slider';
import { PlaygroundSectionComponent } from '@/doc/charts/_shared/playground-section.component';
import type { PlaygroundCodeSource } from '@/doc/charts/_shared/playground-code-source';

const data = [
    { date: '2024-01-02', open: 100.0, high: 104.0, low: 98.0, close: 103.0 },
    { date: '2024-01-03', open: 103.0, high: 107.0, low: 101.0, close: 106.0 },
    { date: '2024-01-04', open: 109.0, high: 111.0, low: 104.0, close: 105.0 },
    { date: '2024-01-05', open: 107.0, high: 111.0, low: 103.0, close: 109.0 },
    { date: '2024-01-08', open: 112.0, high: 115.0, low: 107.0, close: 108.0 },
    { date: '2024-01-09', open: 111.0, high: 114.0, low: 107.0, close: 110.0 },
    { date: '2024-01-10', open: 108.0, high: 113.0, low: 107.0, close: 109.0 },
    { date: '2024-01-11', open: 108.0, high: 114.0, low: 107.0, close: 113.0 },
    { date: '2024-01-12', open: 114.0, high: 116.0, low: 109.0, close: 110.0 },
    { date: '2024-01-15', open: 110.0, high: 113.0, low: 108.0, close: 110.0 },
    { date: '2024-01-16', open: 109.0, high: 115.0, low: 108.0, close: 114.0 },
    { date: '2024-01-17', open: 115.0, high: 117.0, low: 111.0, close: 112.0 },
    { date: '2024-01-18', open: 111.0, high: 115.0, low: 110.0, close: 114.0 }
];

@Component({
    selector: 'types-candlestick-playground-playground-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, FormsModule, ChartsModule, Slider, SelectButton, PlaygroundSectionComponent],
    template: `
        <app-docsectiontext>
            <p></p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div class="chart-playground-layout">
                    <div class="chart-playground-stage">
                        <p-chart-svg [responsive]="true" [height]="460">
                            <p-chart-candlestick
                                id="playground"
                                [data]="data"
                                categoryXField="date"
                                openField="open"
                                highField="high"
                                lowField="low"
                                closeField="close"
                                name="AAPL"
                                [variant]="variant()"
                                [upColor]="upColor()"
                                [downColor]="downColor()"
                                [neutralColor]="neutralColor()"
                                [borderUpColor]="borderUpColor()"
                                [borderDownColor]="borderDownColor()"
                                [borderNeutralColor]="borderNeutralColor()"
                                [borderStrokeWidth]="borderWidth()"
                                [borderRadius]="borderRadius()"
                                [borderAlign]="borderAlign()"
                                [borderJoinStyle]="borderJoinStyle()"
                                [borderDash]="borderDashProp()"
                                [borderDashOffset]="borderDashProp() ? borderDashOffset() : undefined"
                                [hoverColor]="hoverColorProp()"
                                [hoverBorderColor]="hoverBorderColorProp()"
                                [barWidthRatio]="barWidthRatio()"
                                [wickStrokeWidth]="wickWidth()"
                            />
                            <p-chart-x-axis />
                            <p-chart-y-axis />
                            <p-chart-tooltip />
                            <p-chart-hover [brightness]="hoverBrightness()" [dimOpacity]="hoverDimOpacity()" />
                        </p-chart-svg>
                    </div>

                    <div class="playground-controls">
                        <div class="playground-controls-header">Controls</div>

                        <app-playground-section title="Style" [open]="openGroups().style" (toggle)="toggleGroup('style')">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">variant</label>
                                <p-selectbutton [options]="variantOptions" [ngModel]="variant()" (ngModelChange)="variant.set($event)" [allowEmpty]="false" />
                            </div>
                        </app-playground-section>

                        <app-playground-section title="Shape" [open]="openGroups().shape" (toggle)="toggleGroup('shape')">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">barWidthRatio — {{ barWidthRatio().toFixed(2) }}</label>
                                <p-slider [ngModel]="barWidthRatio()" (ngModelChange)="barWidthRatio.set($event)" [min]="0.1" [max]="1" [step]="0.05" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">wickWidth — {{ wickWidth() }}px</label>
                                <p-slider [ngModel]="wickWidth()" (ngModelChange)="wickWidth.set($event)" [min]="0.5" [max]="4" [step]="0.5" styleClass="w-full" />
                            </div>
                        </app-playground-section>

                        <app-playground-section title="Color" [open]="openGroups().color" (toggle)="toggleGroup('color')">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">upColor</label>
                                <div class="flex items-center gap-2">
                                    <input type="color" [value]="upColor()" (input)="upColor.set($any($event.target).value)" style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0" />
                                    <span class="text-xs font-semibold">{{ upColor() }}</span>
                                </div>
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">downColor</label>
                                <div class="flex items-center gap-2">
                                    <input type="color" [value]="downColor()" (input)="downColor.set($any($event.target).value)" style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0" />
                                    <span class="text-xs font-semibold">{{ downColor() }}</span>
                                </div>
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">neutralColor</label>
                                <div class="flex items-center gap-2">
                                    <input type="color" [value]="neutralColor()" (input)="neutralColor.set($any($event.target).value)" style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0" />
                                    <span class="text-xs font-semibold">{{ neutralColor() }}</span>
                                </div>
                            </div>
                        </app-playground-section>

                        <app-playground-section title="Border" [open]="openGroups().border" (toggle)="toggleGroup('border')">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">borderRadius — {{ borderRadius() }}px</label>
                                <p-slider [ngModel]="borderRadius()" (ngModelChange)="borderRadius.set($event)" [min]="0" [max]="8" [step]="1" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">borderWidth — {{ borderWidth() }}px</label>
                                <p-slider [ngModel]="borderWidth()" (ngModelChange)="borderWidth.set($event)" [min]="0" [max]="4" [step]="0.5" styleClass="w-full" />
                            </div>
                            @if (borderWidth() > 0) {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">borderUpColor</label>
                                    <div class="flex items-center gap-2">
                                        <input type="color" [value]="borderUpColor()" (input)="borderUpColor.set($any($event.target).value)" style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0" />
                                        <span class="text-xs font-semibold">{{ borderUpColor() }}</span>
                                    </div>
                                </div>
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">borderDownColor</label>
                                    <div class="flex items-center gap-2">
                                        <input type="color" [value]="borderDownColor()" (input)="borderDownColor.set($any($event.target).value)" style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0" />
                                        <span class="text-xs font-semibold">{{ borderDownColor() }}</span>
                                    </div>
                                </div>
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">borderNeutralColor</label>
                                    <div class="flex items-center gap-2">
                                        <input type="color" [value]="borderNeutralColor()" (input)="borderNeutralColor.set($any($event.target).value)" style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0" />
                                        <span class="text-xs font-semibold">{{ borderNeutralColor() }}</span>
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
export class CandlestickPlaygroundPlaygroundDoc {
    readonly data = data;

    readonly variantOptions = ['candlestick', 'hollow', 'ohlc'];
    readonly alignOptions = ['center', 'inner'];
    readonly dashOptions = ['none', 'dashed', 'dotted'];
    readonly joinOptions = ['miter', 'round', 'bevel'];
    readonly autoCustomOptions = ['auto', 'custom'];

    readonly variant = signal<'candlestick' | 'hollow' | 'ohlc'>('candlestick');

    readonly upColor = signal('#10a981');
    readonly downColor = signal('#e5484d');
    readonly neutralColor = signal('#94a3b8');

    readonly borderUpColor = signal('#10a981');
    readonly borderDownColor = signal('#e5484d');
    readonly borderNeutralColor = signal('#94a3b8');
    readonly borderWidth = signal(1);
    readonly borderRadius = signal(0);
    readonly borderAlign = signal<'center' | 'inner'>('center');
    readonly borderJoinStyle = signal<'miter' | 'round' | 'bevel'>('miter');
    readonly borderDashMode = signal('none');
    readonly borderDashOffset = signal(0);

    readonly barWidthRatio = signal(0.7);
    readonly wickWidth = signal(1);

    readonly hoverBrightness = signal(1.1);
    readonly hoverDimOpacity = signal(1);
    readonly hoverColorMode = signal('auto');
    readonly hoverColor = signal('#10a981');
    readonly hoverBorderColorMode = signal('auto');
    readonly hoverBorderColor = signal('#10a981');

    readonly borderDashProp = computed<number[] | undefined>(() => {
        if (this.borderDashMode() === 'dashed') return [6, 4];

        if (this.borderDashMode() === 'dotted') return [2, 2];

        return undefined;
    });
    readonly hoverColorProp = computed(() => (this.hoverColorMode() === 'custom' ? this.hoverColor() : undefined));
    readonly hoverBorderColorProp = computed(() => (this.hoverBorderColorMode() === 'custom' ? this.hoverBorderColor() : undefined));

    readonly openGroups = signal<Record<string, boolean>>({ style: true, color: false, border: false, shape: false, hover: false });

    toggleGroup(group: string): void {
        this.openGroups.update((groups) => ({ ...groups, [group]: !groups[group] }));
    }

    readonly generatedCode = computed(() => {
        const hoverAttrs = this.buildHoverProps();
        const indent = '\n        ';
        const propsStr = this.buildCandlestickProps()
            .map((p) => `    ${p}`)
            .join(indent);

        return `<p-chart-svg [responsive]="true" [height]="460">
    <p-chart-candlestick${indent}${propsStr}
    />
    <p-chart-x-axis />
    <p-chart-y-axis />
    <p-chart-tooltip />
    <p-chart-hover${hoverAttrs} />
</p-chart-svg>`;
    });

    private buildCandlestickProps(): string[] {
        const props: string[] = ['[data]="data"', 'categoryXField="date"', 'openField="open"', 'highField="high"', 'lowField="low"', 'closeField="close"', 'name="AAPL"'];

        if (this.variant() !== 'candlestick') props.push(`variant="${this.variant()}"`);

        if (this.upColor() !== '#10a981') props.push(`upColor="${this.upColor()}"`);

        if (this.downColor() !== '#e5484d') props.push(`downColor="${this.downColor()}"`);

        if (this.neutralColor() !== '#94a3b8') props.push(`neutralColor="${this.neutralColor()}"`);

        if (this.borderUpColor() !== this.upColor()) props.push(`borderUpColor="${this.borderUpColor()}"`);

        if (this.borderDownColor() !== this.downColor()) props.push(`borderDownColor="${this.borderDownColor()}"`);

        if (this.borderNeutralColor() !== this.neutralColor()) props.push(`borderNeutralColor="${this.borderNeutralColor()}"`);

        if (this.borderWidth() !== 1) props.push(`[borderStrokeWidth]="${this.borderWidth()}"`);

        if (this.borderRadius() !== 0) props.push(`[borderRadius]="${this.borderRadius()}"`);

        if (this.borderAlign() !== 'center') props.push(`borderAlign="${this.borderAlign()}"`);

        if (this.borderJoinStyle() !== 'miter') props.push(`borderJoinStyle="${this.borderJoinStyle()}"`);

        if (this.borderDashProp()) {
            props.push(`[borderDash]="[${this.borderDashProp()!.join(', ')}]"`);
            if (this.borderDashOffset() !== 0) props.push(`[borderDashOffset]="${this.borderDashOffset()}"`);
        }

        if (this.hoverColorProp()) props.push(`hoverColor="${this.hoverColorProp()}"`);

        if (this.hoverBorderColorProp()) props.push(`hoverBorderColor="${this.hoverBorderColorProp()}"`);

        if (this.barWidthRatio() !== 0.7) props.push(`[barWidthRatio]="${this.barWidthRatio().toFixed(2)}"`);

        if (this.wickWidth() !== 1) props.push(`[wickStrokeWidth]="${this.wickWidth()}"`);

        return props;
    }

    private buildHoverProps(): string {
        const parts: string[] = [];

        if (this.hoverBrightness() !== 1.1) parts.push(`[brightness]="${this.hoverBrightness()}"`);

        if (this.hoverDimOpacity() !== 1) parts.push(`[dimOpacity]="${this.hoverDimOpacity()}"`);

        return parts.length ? ` ${parts.join(' ')}` : '';
    }
}

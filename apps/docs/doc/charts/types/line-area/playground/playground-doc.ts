import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { FormsModule } from '@angular/forms';
import { ChartsModule, type SegmentContext } from '@openng/optimus-ui/charts';
import { Select } from '@openng/optimus-ui/select';
import { SelectButton } from '@openng/optimus-ui/selectbutton';
import { Slider } from '@openng/optimus-ui/slider';
import { PlaygroundSectionComponent } from '@/doc/charts/_shared/playground-section.component';
import type { PlaygroundCodeSource } from '@/doc/charts/_shared/playground-code-source';

const baseData: { month: string; value: number | null; series2: number | null; series3: number }[] = [
    { month: 'Jan', value: 42, series2: 28, series3: 18 },
    { month: 'Feb', value: 55, series2: 35, series3: 22 },
    { month: 'Mar', value: 48, series2: 41, series3: 30 },
    { month: 'Apr', value: 63, series2: 38, series3: 25 },
    { month: 'May', value: 58, series2: 52, series3: 35 },
    { month: 'Jun', value: 72, series2: 45, series3: 28 },
    { month: 'Jul', value: 65, series2: 60, series3: 40 },
    { month: 'Aug', value: 78, series2: 55, series3: 32 },
    { month: 'Sep', value: 70, series2: 48, series3: 38 },
    { month: 'Oct', value: 85, series2: 63, series3: 45 },
    { month: 'Nov', value: 76, series2: 58, series3: 50 },
    { month: 'Dec', value: 90, series2: 70, series3: 55 }
];

const NULL_INDICES = [2, 6];
const DEFAULT_BORDER_COLOR = '#94a3b8';
const DEFAULT_POINT_SURFACE = '#f8fafc';
const DEFAULT_HOVER_MARK = '#ffd166';

@Component({
    selector: 'types-line-area-playground-playground-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, FormsModule, ChartsModule, Slider, SelectButton, Select, PlaygroundSectionComponent],
    template: `
        <app-docsectiontext>
            <p></p>
        </app-docsectiontext>
        <div class="card">
            <div class="chart-playground-layout">
                <div class="chart-playground-stage">
                    <p-chart-svg [responsive]="true" [height]="460">
                        @if (isRange()) {
                            <p-chart-range [fillOpacity]="fillOpacity() || 0.2">
                                <p-chart-line
                                    id="series-1"
                                    [data]="activeData()"
                                    categoryXField="month"
                                    valueYField="value"
                                    name="High"
                                    [color]="seriesColors()[0]"
                                    [lineStrokeWidth]="lineWidth()"
                                    [borderColor]="borderColorProp()"
                                    [borderStrokeWidth]="borderWidthProp()"
                                    [borderDash]="borderDashProp()"
                                    [borderCapStyle]="borderCapStyle()"
                                    [borderJoinStyle]="borderJoinStyle()"
                                    [lineDash]="lineDashProp()"
                                    [lineDashOffset]="lineDashProp() ? lineDashOffset() : undefined"
                                    [lineCapStyle]="lineCapStyle()"
                                    [lineJoinStyle]="lineJoinStyle()"
                                    [curve]="curve()"
                                    [tension]="curve() === 'spline' ? tension() : undefined"
                                    [showMarkers]="showMarkers()"
                                    [markerSize]="markerSize()"
                                    [markerShape]="markerShape()"
                                    [pointRotation]="pointRotation()"
                                    [pointBorderStrokeWidth]="pointBorderWidth() > 0 ? pointBorderWidth() : undefined"
                                    [pointBorderColor]="pointBorderWidth() > 0 ? pointBorderColor() : undefined"
                                    [pointBorderDash]="pointBorderWidth() > 0 ? pointBorderDashProp() : undefined"
                                    [pointBorderDashOffset]="pointBorderWidth() > 0 && pointBorderDashProp() ? pointBorderDashOffset() : undefined"
                                    [pointBorderJoinStyle]="pointBorderWidth() > 0 ? pointBorderJoinStyle() : undefined"
                                    [connectNulls]="connectNullsProp()"
                                    [lineStyle]="lineStyleMode() !== 'solid' ? lineStyleMode() : undefined"
                                    [borderDashOffset]="borderDashProp() && borderDashOffset() > 0 ? borderDashOffset() : undefined"
                                    [pointHitRadius]="pointHitRadius() !== 10 ? pointHitRadius() : undefined"
                                    [pointHoverBackgroundColor]="pointHoverBgMode() === 'custom' ? pointHoverBackgroundColor() : undefined"
                                    [hoverColor]="hoverColorMode() === 'custom' ? hoverColor() : undefined"
                                    [hoverBorderColor]="hoverBorderColorMode() === 'custom' ? hoverBorderColor() : undefined"
                                    [segmentStrokeWidth]="segmentWidth() > 0 ? segmentWidth() : undefined"
                                    [segmentFillColor]="segmentFillColorMode() === 'custom' ? segmentFillColor() : undefined"
                                />
                                <p-chart-line
                                    id="series-2"
                                    [data]="activeData()"
                                    categoryXField="month"
                                    valueYField="series2"
                                    name="Low"
                                    [color]="seriesColors()[1]"
                                    [lineStrokeWidth]="lineWidth()"
                                    [borderColor]="borderColorProp()"
                                    [borderStrokeWidth]="borderWidthProp()"
                                    [borderDash]="borderDashProp()"
                                    [borderCapStyle]="borderCapStyle()"
                                    [borderJoinStyle]="borderJoinStyle()"
                                    [lineDash]="lineDashProp()"
                                    [curve]="curve()"
                                    [tension]="curve() === 'spline' ? tension() : undefined"
                                    [showMarkers]="showMarkers()"
                                    [markerSize]="markerSize()"
                                    [pointBorderStrokeWidth]="pointBorderWidth() > 0 ? pointBorderWidth() : undefined"
                                    [pointBorderColor]="pointBorderWidth() > 0 ? pointBorderColor() : undefined"
                                    [pointBorderDash]="pointBorderWidth() > 0 ? pointBorderDashProp() : undefined"
                                    [pointBorderDashOffset]="pointBorderWidth() > 0 && pointBorderDashProp() ? pointBorderDashOffset() : undefined"
                                    [pointBorderJoinStyle]="pointBorderWidth() > 0 ? pointBorderJoinStyle() : undefined"
                                    [connectNulls]="connectNullsProp()"
                                    [lineStyle]="lineStyleMode() !== 'solid' ? lineStyleMode() : undefined"
                                    [borderDashOffset]="borderDashProp() && borderDashOffset() > 0 ? borderDashOffset() : undefined"
                                    [pointHitRadius]="pointHitRadius() !== 10 ? pointHitRadius() : undefined"
                                    [segmentStrokeWidth]="segmentWidth() > 0 ? segmentWidth() : undefined"
                                    [segmentFillColor]="segmentFillColorMode() === 'custom' ? segmentFillColor() : undefined"
                                />
                            </p-chart-range>
                        } @else if (isStacked()) {
                            <p-chart-stacked [mode]="stackedMode()">
                                @for (i of seriesIndexes(); track i) {
                                    <p-chart-line
                                        [id]="'series-' + i"
                                        [data]="activeData()"
                                        categoryXField="month"
                                        [valueYField]="i === 1 ? 'value' : 'series' + i"
                                        [name]="'Series ' + i"
                                        [color]="seriesColors()[i - 1]"
                                        [lineStrokeWidth]="lineWidth()"
                                        [borderColor]="borderColorProp()"
                                        [borderStrokeWidth]="borderWidthProp()"
                                        [borderDash]="borderDashProp()"
                                        [borderCapStyle]="borderCapStyle()"
                                        [borderJoinStyle]="borderJoinStyle()"
                                        [lineDash]="lineDashProp()"
                                        [lineDashOffset]="lineDashProp() ? lineDashOffset() : undefined"
                                        [lineCapStyle]="lineCapStyle()"
                                        [lineJoinStyle]="lineJoinStyle()"
                                        [curve]="curve()"
                                        [tension]="curve() === 'spline' ? tension() : undefined"
                                        [fillOpacity]="fillOpacity()"
                                        [showMarkers]="showMarkers()"
                                        [markerSize]="markerSize()"
                                        [markerShape]="markerShape()"
                                        [pointRotation]="pointRotation()"
                                        [pointBorderStrokeWidth]="pointBorderWidth() > 0 ? pointBorderWidth() : undefined"
                                        [pointBorderColor]="pointBorderWidth() > 0 ? pointBorderColor() : undefined"
                                        [pointBorderDash]="pointBorderWidth() > 0 ? pointBorderDashProp() : undefined"
                                        [pointBorderDashOffset]="pointBorderWidth() > 0 && pointBorderDashProp() ? pointBorderDashOffset() : undefined"
                                        [pointBorderJoinStyle]="pointBorderWidth() > 0 ? pointBorderJoinStyle() : undefined"
                                        [connectNulls]="i === 1 ? connectNullsProp() : undefined"
                                        [lineStyle]="lineStyleMode() !== 'solid' ? lineStyleMode() : undefined"
                                        [borderDashOffset]="borderDashProp() && borderDashOffset() > 0 ? borderDashOffset() : undefined"
                                        [pointHitRadius]="pointHitRadius() !== 10 ? pointHitRadius() : undefined"
                                        [segmentStrokeWidth]="segmentWidth() > 0 ? segmentWidth() : undefined"
                                        [segmentFillColor]="segmentFillColorMode() === 'custom' ? segmentFillColor() : undefined"
                                    />
                                }
                            </p-chart-stacked>
                        } @else {
                            @for (i of seriesIndexes(); track i) {
                                <p-chart-line
                                    [id]="'series-' + i"
                                    [data]="activeData()"
                                    categoryXField="month"
                                    [valueYField]="i === 1 ? 'value' : 'series' + i"
                                    [name]="datasetCount() === 1 ? 'Value' : 'Series ' + i"
                                    [color]="datasetCount() === 1 ? color() : seriesColors()[i - 1]"
                                    [lineStrokeWidth]="lineWidth()"
                                    [borderColor]="borderColorProp()"
                                    [borderStrokeWidth]="borderWidthProp()"
                                    [borderDash]="borderDashProp()"
                                    [borderCapStyle]="borderCapStyle()"
                                    [borderJoinStyle]="borderJoinStyle()"
                                    [lineDash]="lineDashProp()"
                                    [lineDashOffset]="lineDashProp() ? lineDashOffset() : undefined"
                                    [lineCapStyle]="lineCapStyle()"
                                    [lineJoinStyle]="lineJoinStyle()"
                                    [curve]="curve()"
                                    [tension]="curve() === 'spline' ? tension() : undefined"
                                    [fillOpacity]="fillOpacity()"
                                    [showMarkers]="showMarkers()"
                                    [markerSize]="markerSize()"
                                    [markerShape]="markerShape()"
                                    [pointRotation]="pointRotation()"
                                    [pointBackgroundColor]="i === 1 ? pointBgColorProp() : undefined"
                                    [pointBorderStrokeWidth]="pointBorderWidth() > 0 ? pointBorderWidth() : undefined"
                                    [pointBorderColor]="pointBorderWidth() > 0 ? pointBorderColor() : undefined"
                                    [pointBorderDash]="pointBorderWidth() > 0 ? pointBorderDashProp() : undefined"
                                    [pointBorderDashOffset]="pointBorderWidth() > 0 && pointBorderDashProp() ? pointBorderDashOffset() : undefined"
                                    [pointBorderJoinStyle]="pointBorderWidth() > 0 ? pointBorderJoinStyle() : undefined"
                                    [hoverPointRadius]="hoverPointRadiusProp()"
                                    [pointHoverBorderColor]="pointHoverBorderColorMode() === 'custom' ? pointHoverBorderColor() : undefined"
                                    [pointHoverBorderStrokeWidth]="pointHoverBorderStrokeWidthProp()"
                                    [connectNulls]="i === 1 ? connectNullsProp() : undefined"
                                    [segmentColor]="i === 1 ? segmentColorProp() : undefined"
                                    [segmentDash]="i === 1 ? segmentDashProp() : undefined"
                                    [lineStyle]="lineStyleMode() !== 'solid' ? lineStyleMode() : undefined"
                                    [borderDashOffset]="borderDashProp() && borderDashOffset() > 0 ? borderDashOffset() : undefined"
                                    [pointHitRadius]="pointHitRadius() !== 10 ? pointHitRadius() : undefined"
                                    [pointHoverBackgroundColor]="i === 1 ? (pointHoverBgMode() === 'custom' ? pointHoverBackgroundColor() : undefined) : undefined"
                                    [hoverColor]="hoverColorMode() === 'custom' ? hoverColor() : undefined"
                                    [hoverBorderColor]="hoverBorderColorMode() === 'custom' ? hoverBorderColor() : undefined"
                                    [segmentStrokeWidth]="segmentWidth() > 0 ? segmentWidth() : undefined"
                                    [segmentFillColor]="segmentFillColorMode() === 'custom' ? segmentFillColor() : undefined"
                                />
                            }
                        }
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                        <p-chart-legend position="bottom" />
                        <p-chart-tooltip mode="shared" crosshair />
                        <p-chart-hover [radiusMultiplier]="hoverRadiusMultiplier()" [brightness]="hoverBrightness()" [dimOpacity]="hoverDimOpacity()" />
                    </p-chart-svg>
                </div>

                <div class="playground-controls">
                    <div class="playground-controls-header">Controls</div>

                    <app-playground-section title="Series" [open]="openGroups().series" (toggle)="toggleGroup('series')">
                        <div class="px-3 py-3 flex flex-col gap-3">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">datasets — {{ datasetCount() }}</label>
                                <p-selectbutton [options]="datasetOptions" [ngModel]="datasetCountStr()" (ngModelChange)="setDatasetCountStr($event)" [allowEmpty]="false" />
                            </div>
                            @if (isMulti()) {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">mode</label>
                                    <p-selectbutton [options]="stackOptions" [ngModel]="stackMode()" (ngModelChange)="stackMode.set($event)" [allowEmpty]="false" [disabled]="rangeMode()" />
                                </div>
                            }
                            @if (datasetCount() >= 2) {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">range area</label>
                                    <p-selectbutton [options]="onOffOptions" [ngModel]="rangeModeOpt()" (ngModelChange)="setRangeModeOpt($event)" [allowEmpty]="false" [disabled]="isStacked()" />
                                </div>
                            }
                        </div>
                    </app-playground-section>

                    <app-playground-section title="Line Style" [open]="openGroups().line" (toggle)="toggleGroup('line')">
                        <div class="px-3 py-3 flex flex-col gap-3">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">lineStrokeWidth — {{ lineWidth() }}px</label>
                                <p-slider [ngModel]="lineWidth()" (ngModelChange)="lineWidth.set($event)" [min]="0.5" [max]="8" [step]="0.5" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">lineStyle</label>
                                <p-selectbutton [options]="lineStyleOptions" [ngModel]="lineStyleMode()" (ngModelChange)="lineStyleMode.set($event)" [allowEmpty]="false" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">lineDash</label>
                                <p-selectbutton [options]="lineDashOptions" [ngModel]="lineDashMode()" (ngModelChange)="lineDashMode.set($event)" [allowEmpty]="false" />
                            </div>
                            @if (lineDashMode() !== 'none') {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">lineDashOffset — {{ lineDashOffset() }}</label>
                                    <p-slider [ngModel]="lineDashOffset()" (ngModelChange)="lineDashOffset.set($event)" [min]="0" [max]="20" [step]="1" styleClass="w-full" />
                                </div>
                            }
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">lineCapStyle</label>
                                <p-selectbutton [options]="capOptions" [ngModel]="lineCapStyle()" (ngModelChange)="lineCapStyle.set($event)" [allowEmpty]="false" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">lineJoinStyle</label>
                                <p-selectbutton [options]="lineJoinOptions" [ngModel]="lineJoinStyle()" (ngModelChange)="lineJoinStyle.set($event)" [allowEmpty]="false" />
                            </div>
                        </div>
                    </app-playground-section>

                    <app-playground-section title="Curve" [open]="openGroups().curve" (toggle)="toggleGroup('curve')">
                        <div class="px-3 py-3 flex flex-col gap-3">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">curve</label>
                                <p-select [options]="curveOptions" [ngModel]="curve()" (ngModelChange)="curve.set($event)" styleClass="w-full" appendTo="body" />
                            </div>
                            @if (curve() === 'spline') {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">tension — {{ tension().toFixed(2) }}</label>
                                    <p-slider [ngModel]="tension()" (ngModelChange)="tension.set($event)" [min]="0" [max]="1" [step]="0.05" styleClass="w-full" />
                                </div>
                            }
                        </div>
                    </app-playground-section>

                    <app-playground-section title="Area Fill" [open]="openGroups().area" (toggle)="toggleGroup('area')">
                        <div class="px-3 py-3 flex flex-col gap-3">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">fillOpacity — {{ fillOpacity().toFixed(2) }}</label>
                                <p-slider [ngModel]="fillOpacity()" (ngModelChange)="fillOpacity.set($event)" [min]="0" [max]="1" [step]="0.05" styleClass="w-full" />
                            </div>
                        </div>
                    </app-playground-section>

                    <app-playground-section title="Segment Styling" [open]="openGroups().segment" (toggle)="toggleGroup('segment')">
                        <div class="px-3 py-3 flex flex-col gap-3">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">segment preset</label>
                                <p-select [options]="segmentOptions" optionLabel="label" optionValue="value" [ngModel]="segmentMode()" (ngModelChange)="segmentMode.set($event)" styleClass="w-full" appendTo="body" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">segmentStrokeWidth — {{ segmentWidth() === 0 ? 'auto' : segmentWidth() + 'px' }}</label>
                                <p-slider [ngModel]="segmentWidth()" (ngModelChange)="segmentWidth.set($event)" [min]="0" [max]="10" [step]="0.5" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">segmentFillColor</label>
                                <p-selectbutton [options]="autoCustomOptions" [ngModel]="segmentFillColorMode()" (ngModelChange)="segmentFillColorMode.set($event)" [allowEmpty]="false" />
                            </div>
                            @if (segmentFillColorMode() === 'custom') {
                                <div class="flex flex-col gap-1">
                                    <div class="flex items-center gap-2">
                                        <input type="color" [value]="segmentFillColor()" (input)="segmentFillColor.set($any($event.target).value)" style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0" />
                                        <span class="text-xs font-semibold">{{ segmentFillColor() }}</span>
                                    </div>
                                </div>
                            }
                            @if (segmentMode() !== 'none') {
                                <p class="text-[10px] text-surface-400 dark:text-surface-500 leading-relaxed">
                                    {{ segmentMode() === 'trend' ? 'Segments rising to a higher value are green, falling segments are red.' : 'Every other segment uses a dashed stroke pattern.' }}
                                </p>
                            }
                        </div>
                    </app-playground-section>

                    <app-playground-section title="Null Handling" [open]="openGroups().nulls" (toggle)="toggleGroup('nulls')">
                        <div class="px-3 py-3 flex flex-col gap-3">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">null data</label>
                                <p-selectbutton [options]="onOffOptions" [ngModel]="showNullsOpt()" (ngModelChange)="setShowNullsOpt($event)" [allowEmpty]="false" />
                            </div>
                            @if (showNulls()) {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">connectNulls</label>
                                    <p-selectbutton [options]="connectNullsOptions" [ngModel]="connectNulls()" (ngModelChange)="connectNulls.set($event)" [allowEmpty]="false" />
                                </div>
                            }
                        </div>
                    </app-playground-section>

                    <app-playground-section title="Color" [open]="openGroups().color" (toggle)="toggleGroup('color')">
                        <div class="px-3 py-3 flex flex-col gap-3">
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
                        </div>
                    </app-playground-section>

                    <app-playground-section title="Markers" [open]="openGroups().markers" (toggle)="toggleGroup('markers')">
                        <div class="px-3 py-3 flex flex-col gap-3">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">pointHitRadius — {{ pointHitRadius() }}px</label>
                                <p-slider [ngModel]="pointHitRadius()" (ngModelChange)="pointHitRadius.set($event)" [min]="4" [max]="30" [step]="1" styleClass="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">showMarkers</label>
                                <p-selectbutton [options]="onOffOptions" [ngModel]="showMarkersOpt()" (ngModelChange)="setShowMarkersOpt($event)" [allowEmpty]="false" />
                            </div>
                            @if (showMarkers()) {
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">markerSize — {{ markerSize() }}px</label>
                                    <p-slider [ngModel]="markerSize()" (ngModelChange)="markerSize.set($event)" [min]="2" [max]="16" [step]="1" styleClass="w-full" />
                                </div>
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">markerShape</label>
                                    <p-select [options]="markerShapeOptions" [ngModel]="markerShape()" (ngModelChange)="markerShape.set($event)" styleClass="w-full" appendTo="body" />
                                </div>
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">pointRotation — {{ pointRotation() }}°</label>
                                    <p-slider [ngModel]="pointRotation()" (ngModelChange)="pointRotation.set($event)" [min]="0" [max]="360" [step]="5" styleClass="w-full" />
                                </div>
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">pointBackgroundColor</label>
                                    <div class="flex items-center gap-2">
                                        <input
                                            type="color"
                                            [value]="pointBackgroundColor() || color()"
                                            (input)="pointBackgroundColor.set($any($event.target).value)"
                                            style="width: 20px; height: 20px; border: none; background: none; cursor: pointer; padding: 0"
                                        />
                                        <span class="text-xs font-semibold">{{ pointBackgroundColor() || 'series color' }}</span>
                                    </div>
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
                        </div>
                    </app-playground-section>

                    <app-playground-section title="Border" [open]="openGroups().border" (toggle)="toggleGroup('border')">
                        <div class="px-3 py-3 flex flex-col gap-3">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">borderWidth — {{ borderWidth() }}px</label>
                                <p-slider [ngModel]="borderWidth()" (ngModelChange)="borderWidth.set($event)" [min]="0" [max]="12" [step]="0.5" styleClass="w-full" />
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
                                    <label class="text-xs text-surface-500 dark:text-surface-400">borderDash</label>
                                    <p-selectbutton [options]="lineDashOptions" [ngModel]="borderDashMode()" (ngModelChange)="borderDashMode.set($event)" [allowEmpty]="false" />
                                </div>
                                @if (borderDashMode() !== 'none') {
                                    <div class="flex flex-col gap-1">
                                        <label class="text-xs text-surface-500 dark:text-surface-400">borderDashOffset — {{ borderDashOffset() }}</label>
                                        <p-slider [ngModel]="borderDashOffset()" (ngModelChange)="borderDashOffset.set($event)" [min]="0" [max]="20" [step]="1" styleClass="w-full" />
                                    </div>
                                }
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">borderCapStyle</label>
                                    <p-selectbutton [options]="capOptions" [ngModel]="borderCapStyle()" (ngModelChange)="borderCapStyle.set($event)" [allowEmpty]="false" />
                                </div>
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-surface-500 dark:text-surface-400">borderJoinStyle</label>
                                    <p-selectbutton [options]="lineJoinOptions" [ngModel]="borderJoinStyle()" (ngModelChange)="borderJoinStyle.set($event)" [allowEmpty]="false" />
                                </div>
                            }
                        </div>
                    </app-playground-section>

                    <app-playground-section title="Hover" [open]="openGroups().hover" (toggle)="toggleGroup('hover')">
                        <div class="px-3 py-3 flex flex-col gap-3">
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
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-surface-500 dark:text-surface-400">hoverPointRadius — {{ hoverPointRadius() === 0 ? 'auto' : hoverPointRadius() + 'px' }}</label>
                                <p-slider [ngModel]="hoverPointRadius()" (ngModelChange)="hoverPointRadius.set($event)" [min]="0" [max]="20" [step]="1" styleClass="w-full" />
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
                                <p-slider [ngModel]="pointHoverBorderStrokeWidth()" (ngModelChange)="pointHoverBorderStrokeWidth.set($event)" [min]="0" [max]="5" [step]="0.5" styleClass="w-full" />
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
    readonly datasetOptions = ['1', '2', '3'];
    readonly stackOptions = ['none', 'normal', 'percent'];
    readonly onOffOptions = ['off', 'on'];
    readonly lineStyleOptions = ['solid', 'dashed', 'dotted'];
    readonly lineDashOptions = ['none', 'dashed', 'dotted', 'long'];
    readonly capOptions = ['butt', 'round', 'square'];
    readonly lineJoinOptions = ['round', 'bevel', 'miter'];
    readonly joinOptions = ['miter', 'round', 'bevel'];
    readonly curveOptions = ['linear', 'smooth', 'spline', 'step', 'step-before', 'step-after'];
    readonly markerShapeOptions = ['circle', 'square', 'triangle', 'cross', 'star'];
    readonly dashOptions = ['none', 'dashed', 'dotted'];
    readonly connectNullsOptions = ['gap', 'connect', 'zero'];
    readonly autoCustomOptions = ['auto', 'custom'];
    readonly segmentOptions = [
        { label: 'none', value: 'none' },
        { label: 'trend colors (↑green ↓red)', value: 'trend' },
        { label: 'alternating dash', value: 'dash' }
    ];

    readonly seriesColors = signal(['#5daeea', '#ffad5a', '#10a981']);

    readonly datasetCount = signal(1);
    readonly stackMode = signal<'none' | 'normal' | 'percent'>('none');
    readonly rangeMode = signal(false);

    readonly color = signal('#5daeea');

    readonly borderColor = signal(DEFAULT_BORDER_COLOR);
    readonly borderWidth = signal(0);
    readonly borderDashMode = signal('none');
    readonly borderCapStyle = signal<'butt' | 'round' | 'square'>('round');
    readonly borderJoinStyle = signal<'round' | 'bevel' | 'miter'>('round');

    readonly lineWidth = signal(2);
    readonly lineDashMode = signal('none');
    readonly lineDashOffset = signal(0);
    readonly lineCapStyle = signal<'butt' | 'round' | 'square'>('round');
    readonly lineJoinStyle = signal<'round' | 'bevel' | 'miter'>('round');

    readonly curve = signal<'linear' | 'smooth' | 'spline' | 'step' | 'step-before' | 'step-after'>('linear');
    readonly tension = signal(0.5);

    readonly fillOpacity = signal(0);

    readonly showNulls = signal(false);
    readonly connectNulls = signal<'gap' | 'connect' | 'zero'>('gap');

    readonly showMarkers = signal(false);
    readonly markerSize = signal(4);
    readonly markerShape = signal<'circle' | 'square' | 'triangle' | 'cross' | 'star'>('circle');
    readonly pointRotation = signal(0);
    readonly pointBackgroundColor = signal('');
    readonly pointBorderWidth = signal(0);
    readonly pointBorderColor = signal(DEFAULT_POINT_SURFACE);
    readonly pointBorderDashMode = signal('none');
    readonly pointBorderDashOffset = signal(0);
    readonly pointBorderJoinStyle = signal<'miter' | 'round' | 'bevel'>('miter');
    readonly hoverPointRadius = signal(0);
    readonly pointHoverBgMode = signal('auto');
    readonly pointHoverBackgroundColor = signal(DEFAULT_HOVER_MARK);
    readonly pointHoverBorderColorMode = signal('auto');
    readonly pointHoverBorderColor = signal(DEFAULT_POINT_SURFACE);
    readonly pointHoverBorderStrokeWidth = signal(0);

    readonly segmentMode = signal<'none' | 'trend' | 'dash'>('none');

    readonly hoverRadiusMultiplier = signal(1.3);
    readonly hoverBrightness = signal(1.1);
    readonly hoverDimOpacity = signal(1);
    readonly hoverColorMode = signal('auto');
    readonly hoverColor = signal('#5daeea');
    readonly hoverBorderColorMode = signal('auto');
    readonly hoverBorderColor = signal(DEFAULT_POINT_SURFACE);
    readonly pointHitRadius = signal(10);
    readonly borderDashOffset = signal(0);
    readonly lineStyleMode = signal<'solid' | 'dashed' | 'dotted'>('solid');
    readonly segmentWidth = signal(0);
    readonly segmentFillColorMode = signal('auto');
    readonly segmentFillColor = signal('#10a981');

    readonly datasetCountStr = computed(() => String(this.datasetCount()));
    readonly seriesIndexes = computed(() => Array.from({ length: this.datasetCount() }, (_, k) => k + 1));
    readonly isMulti = computed(() => this.datasetCount() > 1);
    readonly isStacked = computed(() => this.stackMode() !== 'none' && this.isMulti());
    readonly isRange = computed(() => this.rangeMode() && this.isMulti());
    readonly stackedMode = computed<'normal' | 'percent'>(() => (this.stackMode() === 'percent' ? 'percent' : 'normal'));

    readonly activeData = computed(() => {
        if (!this.showNulls()) return baseData;

        return baseData.map((d, i) => (NULL_INDICES.includes(i) ? { ...d, value: null, series2: null } : d));
    });

    readonly borderColorProp = computed(() => (this.borderWidth() > 0 ? this.borderColor() : undefined));
    readonly borderWidthProp = computed(() => (this.borderWidth() > 0 ? this.borderWidth() : undefined));
    readonly borderDashProp = computed<number[] | undefined>(() => {
        if (this.borderWidth() <= 0) return undefined;

        if (this.borderDashMode() === 'dashed') return [8, 4];

        if (this.borderDashMode() === 'dotted') return [2, 4];

        if (this.borderDashMode() === 'long') return [16, 6];

        return undefined;
    });

    readonly lineDashProp = computed<number[] | undefined>(() => {
        if (this.lineDashMode() === 'dashed') return [8, 4];

        if (this.lineDashMode() === 'dotted') return [2, 4];

        if (this.lineDashMode() === 'long') return [16, 6];

        return undefined;
    });

    readonly connectNullsProp = computed(() => (this.showNulls() ? this.connectNulls() : undefined));

    readonly segmentColorProp = computed(() => {
        if (this.segmentMode() === 'trend') {
            return (ctx: SegmentContext) => ((ctx.p1.value ?? 0) >= (ctx.p0.value ?? 0) ? '#10a981' : '#e5484d');
        }

        return undefined;
    });

    readonly segmentDashProp = computed(() => {
        if (this.segmentMode() === 'dash') {
            return (ctx: { p0DataIndex: number }) => (ctx.p0DataIndex % 2 === 0 ? [6, 3] : undefined);
        }

        return undefined;
    });

    readonly pointBorderDashProp = computed<number[] | undefined>(() => {
        if (this.pointBorderDashMode() === 'dashed') return [6, 4];

        if (this.pointBorderDashMode() === 'dotted') return [2, 2];

        return undefined;
    });

    readonly hoverPointRadiusProp = computed(() => (this.hoverPointRadius() > 0 ? this.hoverPointRadius() : undefined));
    readonly pointHoverBorderStrokeWidthProp = computed(() => (this.pointHoverBorderStrokeWidth() > 0 ? this.pointHoverBorderStrokeWidth() : undefined));
    readonly pointBgColorProp = computed(() => this.pointBackgroundColor() || undefined);

    readonly rangeModeOpt = computed(() => (this.rangeMode() ? 'on' : 'off'));
    readonly showMarkersOpt = computed(() => (this.showMarkers() ? 'on' : 'off'));
    readonly showNullsOpt = computed(() => (this.showNulls() ? 'on' : 'off'));

    readonly openGroups = signal<Record<string, boolean>>({ series: true, color: false, line: false, border: false, curve: false, area: false, markers: false, segment: false, nulls: false, hover: false });

    toggleGroup(group: string): void {
        this.openGroups.update((groups) => ({ ...groups, [group]: !groups[group] }));
    }

    setDatasetCountStr(value: string): void {
        this.datasetCount.set(Number(value));
    }

    setRangeModeOpt(value: string): void {
        this.rangeMode.set(value === 'on');
    }

    setShowMarkersOpt(value: string): void {
        this.showMarkers.set(value === 'on');
    }

    setShowNullsOpt(value: string): void {
        this.showNulls.set(value === 'on');
    }

    setSeriesColor(index: number, event: Event): void {
        const value = (event.target as HTMLInputElement).value;

        this.seriesColors.update((colors) => colors.map((c, i) => (i === index ? value : c)));
    }

    readonly generatedCode = computed(() => {
        const indent = '\n        ';
        const count = this.datasetCount();
        const hoverAttrs = this.buildHoverProps();

        const makeLine = (i: number, extraOpts: { isRangeHigh?: boolean; isRangeLow?: boolean } = {}) => {
            const props = this.buildLineProps(i, extraOpts);

            return `    <p-chart-line${indent}${props.map((p) => `    ${p}`).join(indent)}\n    />`;
        };

        let inner: string;

        if (this.isRange()) {
            const fillProp = this.fillOpacity() !== 0 ? ` [fillOpacity]="${this.fillOpacity()}"` : ' [fillOpacity]="0.2"';

            inner = `    <p-chart-range${fillProp}>\n${makeLine(1, { isRangeHigh: true })}\n${makeLine(2, { isRangeLow: true })}\n    </p-chart-range>`;
        } else if (this.isStacked()) {
            const stackedLines = Array.from({ length: count }, (_, idx) => makeLine(idx + 1)).join('\n');

            inner = `    <p-chart-stacked mode="${this.stackMode()}">\n${stackedLines}\n    </p-chart-stacked>`;
        } else {
            inner = Array.from({ length: count }, (_, idx) => makeLine(idx + 1)).join('\n');
        }

        return `<p-chart-svg [responsive]="true" [height]="460">
${inner}
    <p-chart-x-axis />
    <p-chart-y-axis />
    <p-chart-legend position="bottom" />
    <p-chart-tooltip mode="shared" crosshair />
    <p-chart-hover${hoverAttrs} />
</p-chart-svg>`;
    });

    private buildLineProps(i: number, opts: { isRangeHigh?: boolean; isRangeLow?: boolean } = {}): string[] {
        const { isRangeHigh, isRangeLow } = opts;
        const isFirst = i === 1;
        const seriesColor = this.isMulti() || this.isRange() ? this.seriesColors()[i - 1] : this.color();
        const valueField = i === 1 ? 'value' : `series${i}`;
        let seriesName: string;

        if (isRangeHigh) seriesName = 'High';
        else if (isRangeLow) seriesName = 'Low';
        else seriesName = this.isMulti() ? `Series ${i}` : 'Value';

        const props: string[] = [`id="series-${i}"`, '[data]="data"', 'categoryXField="month"', `valueYField="${valueField}"`, `name="${seriesName}"`, `color="${seriesColor}"`];

        props.push(`[lineStrokeWidth]="${this.lineWidth()}"`);

        if (this.borderWidth() > 0) {
            props.push(`[borderStrokeWidth]="${this.borderWidth()}"`);
            if (this.borderColor() !== DEFAULT_BORDER_COLOR) props.push(`borderColor="${this.borderColor()}"`);

            if (this.borderDashProp()) {
                props.push(`[borderDash]="[${this.borderDashProp()!.join(', ')}]"`);
                if (this.borderDashOffset() > 0) props.push(`[borderDashOffset]="${this.borderDashOffset()}"`);
            }

            if (this.borderCapStyle() !== 'round') props.push(`borderCapStyle="${this.borderCapStyle()}"`);

            if (this.borderJoinStyle() !== 'round') props.push(`borderJoinStyle="${this.borderJoinStyle()}"`);
        }

        if (this.lineDashProp()) {
            props.push(`[lineDash]="[${this.lineDashProp()!.join(', ')}]"`);
            if (this.lineDashOffset() !== 0) props.push(`[lineDashOffset]="${this.lineDashOffset()}"`);
        }

        if (this.lineCapStyle() !== 'round') props.push(`lineCapStyle="${this.lineCapStyle()}"`);

        if (this.lineJoinStyle() !== 'round') props.push(`lineJoinStyle="${this.lineJoinStyle()}"`);

        if (this.lineStyleMode() !== 'solid') props.push(`lineStyle="${this.lineStyleMode()}"`);

        if (this.curve() !== 'linear') props.push(`curve="${this.curve()}"`);

        if (this.curve() === 'spline') props.push(`[tension]="${this.tension()}"`);

        if (!this.isRange() && this.fillOpacity() !== 0) props.push(`[fillOpacity]="${this.fillOpacity()}"`);

        if (this.showMarkers()) {
            props.push('[showMarkers]="true"');
            if (this.markerSize() !== 4) props.push(`[markerSize]="${this.markerSize()}"`);

            if (this.markerShape() !== 'circle') props.push(`markerShape="${this.markerShape()}"`);

            if (this.pointRotation() !== 0) props.push(`[pointRotation]="${this.pointRotation()}"`);

            if (this.pointBorderWidth() > 0) {
                props.push(`[pointBorderStrokeWidth]="${this.pointBorderWidth()}"`);
                if (this.pointBorderColor() !== DEFAULT_POINT_SURFACE) props.push(`pointBorderColor="${this.pointBorderColor()}"`);

                if (this.pointBorderDashProp()) {
                    props.push(`[pointBorderDash]="[${this.pointBorderDashProp()!.join(', ')}]"`);
                    if (this.pointBorderDashOffset() !== 0) props.push(`[pointBorderDashOffset]="${this.pointBorderDashOffset()}"`);
                }

                if (this.pointBorderJoinStyle() !== 'miter') props.push(`pointBorderJoinStyle="${this.pointBorderJoinStyle()}"`);
            }
        }

        if (this.pointHitRadius() !== 10) props.push(`[pointHitRadius]="${this.pointHitRadius()}"`);

        if (this.segmentWidth() > 0) props.push(`[segmentStrokeWidth]="${this.segmentWidth()}"`);

        if (this.segmentFillColorMode() === 'custom') props.push(`segmentFillColor="${this.segmentFillColor()}"`);

        if (isFirst && !isRangeLow) {
            if (this.pointBgColorProp()) props.push(`pointBackgroundColor="${this.pointBgColorProp()}"`);

            if (this.pointHoverBgMode() === 'custom') props.push(`pointHoverBackgroundColor="${this.pointHoverBackgroundColor()}"`);

            if (this.hoverPointRadiusProp()) props.push(`[hoverPointRadius]="${this.hoverPointRadiusProp()}"`);

            if (this.pointHoverBorderStrokeWidthProp()) {
                props.push(`[pointHoverBorderStrokeWidth]="${this.pointHoverBorderStrokeWidthProp()}"`);
                if (this.pointHoverBorderColorMode() === 'custom') props.push(`pointHoverBorderColor="${this.pointHoverBorderColor()}"`);
            }

            if (this.connectNullsProp()) props.push(`connectNulls="${this.connectNullsProp()}"`);

            if (this.segmentMode() === 'trend') props.push('[segmentColor]="/* trend: green/red */"');
            else if (this.segmentMode() === 'dash') props.push('[segmentDash]="/* alternating dash */"');
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

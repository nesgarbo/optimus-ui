import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue } from '@openng/optimus-ui/charts';
import { populationPyramid as data } from '@/doc/charts/data/populationPyramid';

const FEMALE_COLOR = '#ff6fae';
const MALE_COLOR = '#5daeea';

@Component({
    selector: 'types-column-bar-stacked-world-population-by-age-group-and-sex-2024-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Negative <i>valueYField</i> values stack one series below zero, creating the pyramid split without any extra configuration. <i>ChartReferenceLine</i> at y=0 draws the dividing line, and <i>ChartDataLabels</i> labels each segment. The
                axes and tooltip both apply <i>Math.abs()</i> to hide the sign.
            </p>
            <p>#### SvgBarPopulationPyramidDemo.ts</p>
            <p>#### populationPyramid.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460" [animation]="{ duration: 700 }">
                    <p-chart-stacked>
                        <p-chart-bar [data]="data" categoryYField="age" valueXField="female" name="Female" [color]="femaleColor" [borderRadius]="3" />
                        <p-chart-bar [data]="data" categoryYField="age" valueXField="male" name="Male" [color]="maleColor" [borderRadius]="3" />
                    </p-chart-stacked>
                    <p-chart-reference-line [x]="0" stroke="#94a3b8" [lineStrokeWidth]="1.5" />
                    <p-chart-data-labels display="value" [formatter]="formatBillions" [fontSize]="10" />
                    <p-chart-tooltip mode="shared" [valueFormatter]="formatTooltip" />
                    <p-chart-legend position="top" />
                    <p-chart-hover />
                    <p-chart-x-axis [tickFormat]="formatAxis" />
                    <p-chart-y-axis />
                    <p-chart-title text="World population by age group and sex, 2024" />
                    <p-chart-caption text="Population in billions · Source: UN World Population Prospects 2024" />
                    <p-chart-export-menu filename="world-population-pyramid-2024" />
                    <p-chart-accessibility />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnBarStackedWorldPopulationByAgeGroupAndSex2024Doc {
    readonly data = data;
    readonly femaleColor = FEMALE_COLOR;
    readonly maleColor = MALE_COLOR;

    readonly formatBillions = (v: number): string => `${Math.abs(v).toFixed(2)}B`;
    readonly formatTooltip = (v: number): string => `${Math.abs(v).toFixed(2)}B`;
    readonly formatAxis = (v: TickValue): string => `${Math.abs(Number(v)).toFixed(1)}B`;
}

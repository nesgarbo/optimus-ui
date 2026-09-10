import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { labourForce as data } from '@/doc/charts/data/labourForce';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-column-bar-grouped-labour-force-participation-by-gender-and-region-2023-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>sort</i> reorders groups by the gap between the two series values, placing the widest disparities first. <i>ChartDataLabels</i> stamps every bar with its percentage so values are readable without hovering, while a custom
                <i>ChartTooltip</i> <i>render</i> function computes and displays the gap between the two series. <i>ChartAnnotation</i> uses <i>xScale</i>/<i>yScale</i> to place a callout over the most extreme group.
            </p>
            <p>#### SvgBarLabourForceDemo.ts</p>
            <p>#### labourForce.ts</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 460px">
                <p-chart-svg>
                    <p-chart-bar [data]="data" categoryXField="region" valueYField="male" name="Male" [color]="COLORS.male" [borderRadius]="3" />
                    <p-chart-bar [data]="data" categoryXField="region" valueYField="female" name="Female" [color]="COLORS.female" [borderRadius]="3" />
                    <p-chart-tooltip mode="shared" [valueFormatter]="valueFormatter" />
                    <p-chart-data-labels display="value" [formatter]="formatter" />
                    <p-chart-legend position="top" />
                    <p-chart-hover />
                    <p-chart-x-axis />
                    <p-chart-y-axis [tickFormat]="tickFormat" />
                    <p-chart-reference-line
                        [y]="WORLD_AVG"
                        stroke="#ffad5a"
                        [lineStrokeWidth]="2.5"
                        [lineDash]="[6, 4]"
                        label="World avg (60%)"
                        labelPosition="start"
                        [labelPadding]="6"
                        [labelBorderRadius]="4"
                        [labelFontSize]="12"
                        [labelFontWeight]="600"
                    />
                    <p-chart-title text="Labour force participation by gender & region, 2023" />
                    <p-chart-caption text="% of working-age population (15+) in the labour force · Source: ILOSTAT — ILO modelled estimates" />
                    <p-chart-export-menu filename="labour-force-by-gender-region-2023" />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupedLabourForceParticipationByGenderAndRegion2023Doc {
    readonly valueFormatter = (v: number) => `${v}%`;
    readonly formatter = (v: number) => `${v}%`;
    readonly tickFormat = (v: string | number | Date) => `${v}%`;

    readonly data = data;
    readonly COLORS = {
        male: '#5daeea',
        female: '#ff6fae'
    };

    readonly WORLD_AVG = 60;
}

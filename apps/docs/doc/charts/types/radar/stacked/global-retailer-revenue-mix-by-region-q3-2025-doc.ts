import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { retailRegion as data } from '@/doc/charts/data/retailRegion';

@Component({
    selector: 'types-radar-stacked-global-retailer-revenue-mix-by-region-q3-2025-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Wrapping three <i>ChartRadar</i> components inside <i>ChartStacked</i> gives each region its own contribution ring, with the outermost ring representing the category total. <i>fillOpacity</i> is tuned per series to keep the rings
                legible under each other. A custom <i>ChartTooltip</i> decomposes the hovered spoke into per-region values and percentages with a total row.
            </p>
            <p>#### SvgRadarStackedRetailRegionDemo.ts</p>
            <p>#### retailRegion.ts</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 460px">
                <p-chart-svg [animation]="{ duration: 700 }">
                    <p-chart-stacked>
                        <p-chart-radar id="americas" [data]="data" categoryXField="product" valueYField="americas" name="Americas" color="#5daeea" [fillOpacity]="0.6" [lineStrokeWidth]="1.5" />
                        <p-chart-radar id="emea" [data]="data" categoryXField="product" valueYField="emea" name="EMEA" color="#ffad5a" [fillOpacity]="0.55" [lineStrokeWidth]="1.5" />
                        <p-chart-radar id="apac" [data]="data" categoryXField="product" valueYField="apac" name="APAC" color="#5ccf9f" [fillOpacity]="0.5" [lineStrokeWidth]="2.5" />
                    </p-chart-stacked>
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-tooltip mode="shared" [valueFormatter]="format" />
                    <p-chart-hover />
                    <p-chart-legend position="top" />
                    <p-chart-title text="Global Retailer — Revenue Mix by Region, Q3 2025" />
                    <p-chart-caption text="Electronics ($810M) and Grocery ($750M) are the two largest categories · APAC leads Beauty; Americas leads Electronics and Home & Kitchen" />
                    <p-chart-export-menu filename="retail-revenue-stacked-radar" />
                    <p-chart-accessibility />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StackedGlobalRetailerRevenueMixByRegionQ32025Doc {
    readonly data = data;
    readonly format = (v: number) => `$${v}`;
}

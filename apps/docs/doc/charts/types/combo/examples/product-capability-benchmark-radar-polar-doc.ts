import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { industryAvg, ourProduct } from '@/doc/charts/data/comboProductBenchmark';

@Component({
    selector: 'types-combo-examples-product-capability-benchmark-radar-polar-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Industry-average scores render as filled <i>ChartPolar</i> sectors; the product's scores overlay as a <i>ChartRadar</i> outline. Both share the same seven capability axes with no axis configuration needed. Where the radar outline sits
                outside the polar fill, the product is above average on that capability.
            </p>
            <p>#### SvgComboProductBenchmarkDemo.ts</p>
            <p>#### comboProductBenchmark.ts</p>
        </app-docsectiontext>
        <div class="card">
            <div style="display: flex; justify-content: center">
                <p-chart-svg [width]="460" [height]="460" [animation]="{ duration: 700, easing: 'easeOutCubic' }">
                    <p-chart-polar id="industry" [data]="industryAvg" categoryXField="capability" valueYField="score" name="Industry average" color="rgba(148,163,184,0.55)" />
                    <p-chart-radar id="ours" [data]="ourProduct" categoryXField="capability" valueYField="score" name="Our product" color="#7c8cff" [fillOpacity]="0.2" [lineStrokeWidth]="2.5" [showMarkers]="true" [markerSize]="5" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend position="top" />
                    <p-chart-tooltip mode="shared" />
                    <p-chart-hover [brightness]="1.1" />
                    <p-chart-title text="Product capability benchmark" />
                    <p-chart-caption
                        text="Grey polar sectors are the industry-average score per capability. The periwinkle radar overlays our product's score on the same axes — capabilities where the outline sits outside the grey are competitive strengths."
                    />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExamplesProductCapabilityBenchmarkRadarPolarDoc {
    readonly industryAvg = industryAvg;
    readonly ourProduct = ourProduct;
}

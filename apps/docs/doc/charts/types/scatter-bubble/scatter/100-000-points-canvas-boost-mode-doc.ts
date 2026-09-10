import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { injectChartTheme } from '@/doc/charts/_shared/inject-chart-theme';
import { generateClusters, CLUSTER_COUNT, CLUSTER_SEED } from '@/doc/charts/data/scatterClusters';

@Component({
    selector: 'types-scatter-bubble-scatter-100-000-points-canvas-boost-mode-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                The <i>boost</i> input activates automatically above 50,000 visible points, disabling per-point hover halos, opt-in hover dimming, and the per-point allocation loop. Above 2,000 points, hover hit-testing builds a quadtree on first
                mousemove, dropping lookup from O(n) to O(log n). Canvas-only: rendering 100,000 DOM nodes is impractical for SVG.
            </p>
            <p>#### CanvasScatterBigDataBoostDemo.ts</p>
            <p>#### scatterClusters.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-canvas [theme]="theme()">
                        <p-chart-scatter id="cloud" [data]="samples" valueXField="x" valueYField="y" name="Population sample" color="#7c8cff" [markerSize]="2" [pointFillOpacity]="0.4" [pointBorderStrokeWidth]="0" />
                        <p-chart-zoom mode="xy" />
                        <p-chart-tooltip />
                        <p-chart-legend position="top" />
                        <p-chart-x-axis label="Feature A" />
                        <p-chart-y-axis label="Feature B" />
                        <p-chart-title [text]="totalCount + ' points · Canvas + boost mode'" />
                        <p-chart-caption text="Three Gaussian clusters drawn as a raw 100k point cloud · boost auto-activates above 50k points · hover lookup uses a quadtree (O(log n))" />
                        <p-chart-export-menu filename="scatter-100k-boost" />
                    </p-chart-canvas>
                </div>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScatterBubbleScatter100000PointsCanvasBoostModeDoc {
    readonly theme = injectChartTheme();
    readonly samples = generateClusters(CLUSTER_COUNT, CLUSTER_SEED);
    readonly totalCount = this.samples.length.toLocaleString();
}

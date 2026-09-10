import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { treasuryYields } from '@/doc/charts/data/treasuryYields';

@Component({
    selector: 'types-line-area-area-us-treasury-yield-curve-2019-2024-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Three overlapping area series with subtle <i>fillOpacity</i> make the spread between tenors visible. <i>ChartZoom</i> and <i>ChartNavigator</i> isolate any window; drag the brush to focus the COVID rate collapse, the 2022 hiking
                cycle, or the 2023 normalization. The tooltip computes the live 10Y–2Y spread on each hover.
            </p>
            <p>#### SvgAreaTreasuryYieldsDemo.ts</p>
            <p>#### treasuryYields.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg [animation]="{ duration: 500 }">
                        <p-chart-line [data]="data" categoryXField="month" valueYField="y30" name="30-Year" color="#94a3b8" [fillOpacity]="0.15" curve="smooth" [lineStrokeWidth]="1.5" />
                        <p-chart-line [data]="data" categoryXField="month" valueYField="y10" name="10-Year" color="#5daeea" [fillOpacity]="0.15" curve="smooth" [lineStrokeWidth]="2" />
                        <p-chart-line [data]="data" categoryXField="month" valueYField="y2" name="2-Year" color="#e5484d" [fillOpacity]="0.15" curve="smooth" [lineStrokeWidth]="1.5" />
                        <p-chart-tooltip mode="shared" [valueFormatter]="yieldPct" />
                        <p-chart-hover />
                        <p-chart-x-axis />
                        <p-chart-y-axis [tickCount]="6" />
                        <p-chart-zoom mode="x" />
                        <p-chart-navigator />
                        <p-chart-title text="US Treasury yield curve 2019–2024" />
                        <p-chart-caption text="Source: Federal Reserve H.15 · Constant maturity rates · Monthly averages · Drag navigator to zoom" />
                        <p-chart-export-menu filename="us-treasury-yields-2019-2024" />
                        <p-chart-accessibility />
                    </p-chart-svg>
                </div>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineAreaAreaUsTreasuryYieldCurve20192024Doc {
    readonly data = treasuryYields;
    readonly yieldPct = (v: number) => `${v.toFixed(2)}%`;
}

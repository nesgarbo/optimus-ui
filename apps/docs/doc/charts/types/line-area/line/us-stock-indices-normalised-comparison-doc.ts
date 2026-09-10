import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { stockIndices } from '@/doc/charts/data/stockIndices';

const COLORS = { sp: '#5daeea', nas: '#10a981', dow: '#ffad5a' };

@Component({
    selector: 'types-line-area-line-us-stock-indices-normalised-comparison-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Three <i>ChartLine</i> series are rebased to a common starting point so divergence is visible without separate axes. <i>ChartTooltip</i> with <i>mode="shared"</i> and <i>crosshair</i> tracks all three values simultaneously across the
                chart.
            </p>
            <p>#### SvgLineStockIndicesDemo.ts</p>
            <p>#### stockIndices.ts</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 460px">
                <p-chart-svg [animation]="{ duration: 600 }">
                    <p-chart-line [data]="data" categoryXField="q" valueYField="sp" name="S&P 500" [color]="colors.sp" [lineStrokeWidth]="2.5" curve="smooth" />
                    <p-chart-line [data]="data" categoryXField="q" valueYField="nas" name="Nasdaq" [color]="colors.nas" [lineStrokeWidth]="2.5" curve="smooth" />
                    <p-chart-line [data]="data" categoryXField="q" valueYField="dow" name="Dow Jones" [color]="colors.dow" [lineStrokeWidth]="2.5" curve="smooth" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-tooltip mode="shared" crosshair />
                    <p-chart-legend position="bottom" />
                    <p-chart-title text="US stock indices — rebased to 100" />
                    <p-chart-caption text="Source: Yahoo Finance · End-of-quarter closes normalised to Q1 2020 = 100 · Hover to compare returns" />
                    <p-chart-export-menu filename="us-stock-indices-2020-2024" />
                    <p-chart-accessibility />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineUsStockIndicesNormalisedComparisonDoc {
    readonly data = stockIndices;
    readonly colors = COLORS;
}

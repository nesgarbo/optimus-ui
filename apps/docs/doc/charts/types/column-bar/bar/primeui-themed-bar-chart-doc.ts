import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type ItemContext } from '@openng/optimus-ui/charts';
import { primeThemedSales } from '@/doc/charts/data/primeThemedSales';

@Component({
    selector: 'types-column-bar-bar-primeui-themed-bar-chart-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                CSS variables on the chart wrapper (<i>--p-chart-color-1</i>, <i>--p-chart-axis</i>, <i>--p-chart-grid</i>) are written directly onto SVG <i>fill=</i> and <i>stroke=</i> attributes, so the browser resolves them natively without a
                <i>palette</i> input. Toggle dark mode or switch the PrimeUI theme and the chart recolors without a re-render.
            </p>
            <p>#### SvgBarPrimeThemedDemo.ts</p>
            <p>#### primeThemedSales.ts</p>
        </app-docsectiontext>
        <div class="card">
            <div class="primeui-themed-chart" style="height: 460px">
                <p-chart-svg>
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="sales" [color]="barColor" [borderColor]="barColor" [borderStrokeWidth]="2" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    styles: [
        `
            .primeui-themed-chart {
                --p-chart-color-0: var(--p-primary-300);
                --p-chart-color-1: var(--p-primary-400);
                --p-chart-color-2: var(--p-primary-500);
                --p-chart-color-3: var(--p-primary-600);
                --p-chart-color-4: var(--p-primary-700);
                --p-chart-color-5: var(--p-primary-800);
            }
        `
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BarPrimeuiThemedBarChartDoc {
    readonly data = primeThemedSales;

    readonly barColor = ({ index }: ItemContext) => `var(--p-chart-color-${index})`;
}

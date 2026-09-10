import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'getting-started-setup-import-3-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Wrap a series component in <i>ChartSvg</i> and add features as siblings. Each child component hooks into the root on mount. Adding <i>ChartLegend</i> renders a legend and reserves space for it; removing it removes the legend entirely.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-chart-svg [height]="400">
                <p-chart-line [data]="data" categoryXField="month" valueYField="revenue" name="Revenue" curve="smooth" [showMarkers]="true" />
                <p-chart-line [data]="data" categoryXField="month" valueYField="expenses" name="Expenses" curve="smooth" [showMarkers]="true" />
                <p-chart-x-axis />
                <p-chart-y-axis />
                <p-chart-legend />
                <p-chart-tooltip />
            </p-chart-svg>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SetupImport3Doc {
    readonly data = [
        { month: 'Jan', revenue: 42, expenses: 31 },
        { month: 'Feb', revenue: 55, expenses: 38 },
        { month: 'Mar', revenue: 48, expenses: 35 },
        { month: 'Apr', revenue: 63, expenses: 44 },
        { month: 'May', revenue: 58, expenses: 40 },
        { month: 'Jun', revenue: 72, expenses: 51 }
    ];
}

import { Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import type { ChartTheme } from '@openng/optimus-ui/types/charts';
import { DEVICES } from './demo-data';

@Component({
    selector: 'theming-doc',
    standalone: true,
    imports: [AppDocSectionText, ChartsModule, AppCode],
    styles: [
        `
            .charts-theming-demo {
                --p-chart-color-0: #7c8cff;
                --p-chart-color-1: #10a981;
                --p-chart-grid: #e9d5ff;
            }
        `
    ],
    template: `
        <app-docsectiontext>
            <p>
                An SVG chart reads its colours from CSS custom properties, so overriding <i>--p-chart-color-0</i> or <i>--p-chart-grid</i> at any scope restyles it with no JavaScript re-render. The chart below sits inside a class that sets those
                three variables.
            </p>
            <p>A Canvas chart cannot do that: it has no DOM for a custom property to apply to. That is why it takes a <i>theme</i> object instead, and why changing that object is what repaints it. Both are shown here with the same palette.</p>
        </app-docsectiontext>
        <div class="card">
            <div class="flex flex-col gap-4">
                <div class="charts-theming-demo" style="height: 18rem">
                    <p-chart-svg>
                        <p-chart-bar [data]="data" categoryXField="month" valueYField="desktop" name="Desktop" [borderRadius]="4" />
                        <p-chart-bar [data]="data" categoryXField="month" valueYField="mobile" name="Mobile" [borderRadius]="4" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                        <p-chart-legend />
                    </p-chart-svg>
                </div>
                <div style="height: 18rem">
                    <p-chart-canvas [theme]="theme()">
                        <p-chart-bar [data]="data" categoryXField="month" valueYField="desktop" name="Desktop" [borderRadius]="4" />
                        <p-chart-bar [data]="data" categoryXField="month" valueYField="mobile" name="Mobile" [borderRadius]="4" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                        <p-chart-legend />
                    </p-chart-canvas>
                </div>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class ThemingDoc {
    data = DEVICES;

    readonly theme = signal<ChartTheme>({
        series: ['#7c8cff', '#10a981'],
        grid: '#e9d5ff'
    });
}

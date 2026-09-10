import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type ItemContext, type TickValue } from '@openng/optimus-ui/charts';
import { ebitdaBridge as data, type EbitdaStep } from '@/doc/charts/data/ebitdaBridge';

@Component({
    selector: 'types-column-bar-waterfall-fy-2023-ebitda-bridge-stacked-waterfall-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>ChartStacked</i> wraps inside <i>ChartWaterfall</i> so each bar stacks two layers while the running total accumulates from the combined values. Negative steps automatically reverse stacking order so the primary layer anchors at the
                baseline. <i>ChartReferenceLine</i> at y=0 marks break-even.
            </p>
            <p>#### SvgBarStackedWaterfallDemo.ts</p>
            <p>#### ebitdaBridge.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460" [animation]="{ duration: 600 }">
                    <p-chart-waterfall totalField="isTotal">
                        <p-chart-stacked>
                            <p-chart-bar [data]="data" categoryXField="item" valueYField="core" name="Core" [color]="coreColor" [borderRadius]="2" />
                            <p-chart-bar [data]="data" categoryXField="item" valueYField="incremental" name="Incremental" [color]="incrementalColor" [borderRadius]="2" />
                        </p-chart-stacked>
                    </p-chart-waterfall>
                    <p-chart-reference-line [y]="breakeven" stroke="#94a3b8" [lineStrokeWidth]="1" [lineDash]="[4, 4]" label="Break-even" labelPosition="end" />
                    <p-chart-tooltip mode="shared" />
                    <p-chart-x-axis />
                    <p-chart-y-axis [tickFormat]="formatAxis" />
                    <p-chart-title text="FY 2023 EBITDA Bridge — Core & Incremental Drivers" />
                    <p-chart-caption text="P&L bridge in $M · bars split into core (darker) and incremental (lighter) drivers" />
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
export class ColumnBarWaterfallFy2023EbitdaBridgeStackedWaterfallDoc {
    readonly data = data;
    readonly breakeven = 0;

    readonly coreColor = ({ datum }: ItemContext): string => {
        const item = datum as EbitdaStep;

        if (item.isTotal) return '#7c8cff';

        return item.core >= 0 ? '#10a981' : '#e5484d';
    };

    readonly incrementalColor = ({ datum }: ItemContext): string => {
        const item = datum as EbitdaStep;

        if (item.isTotal) return '#a78bfa';

        return item.incremental >= 0 ? '#34d399' : '#fb7185';
    };

    readonly formatAxis = (v: TickValue): string => `$${Number(v)}M`;
}

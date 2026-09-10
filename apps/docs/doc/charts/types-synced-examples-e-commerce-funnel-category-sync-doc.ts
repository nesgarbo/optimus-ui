import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue } from '@openng/optimus-ui/charts';
import { sessions, revenue, orders } from '@/doc/charts/data/syncedEcommerceFunnel';

const CAT_COLORS = ['#5daeea', '#4ecdc4', '#5ccf9f', '#ffad5a', '#ff6fae'];

@Component({
    selector: 'types-synced-examples-e-commerce-funnel-category-sync-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Four mixed-type panels sit below a KPI header row: funnel bars, a traffic-source donut, top-products bars, and a revenue treemap. Sync here is categorical; hovering a traffic source slice highlights the corresponding row or segment in
                every other panel. <i>ChartGroup</i> sync works for any shared dimension, including categorical keys.
            </p>
            <p>#### SvgSyncedEcommerceFunnelDemo.ts</p>
            <p>#### syncedEcommerceFunnel.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-group>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 16px">
                        <p-chart-svg [sync]="true" [height]="260">
                            <p-chart-bar [data]="sessions" categoryYField="category" valueXField="sessions" name="Sessions" [color]="colors" [borderRadius]="{ topRight: 4, bottomRight: 4 }" />
                            <p-chart-x-axis [tickFormat]="formatK" />
                            <p-chart-y-axis />
                            <p-chart-tooltip />
                            <p-chart-hover />
                        </p-chart-svg>

                        <p-chart-svg [sync]="true" [height]="260">
                            <p-chart-pie [data]="revenue" categoryField="category" valueField="revenue" [innerRadius]="0.55" [color]="colors" />
                            <p-chart-legend position="right" />
                            <p-chart-tooltip />
                            <p-chart-hover [brightness]="1.15" />
                        </p-chart-svg>

                        <p-chart-svg [sync]="true" [height]="260">
                            <p-chart-bar [data]="orders" categoryYField="category" valueXField="orders" name="Orders" [color]="colors" [borderRadius]="{ topRight: 4, bottomRight: 4 }" />
                            <p-chart-x-axis [tickFormat]="formatK" />
                            <p-chart-y-axis />
                            <p-chart-tooltip />
                            <p-chart-hover />
                        </p-chart-svg>

                        <p-chart-svg [sync]="true" [height]="260">
                            <p-chart-treemap [data]="revenue" categoryField="category" valueField="revenue" [color]="colors" />
                            <p-chart-tooltip />
                            <p-chart-hover [brightness]="1.1" />
                        </p-chart-svg>
                    </div>
                </p-chart-group>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SyncedExamplesECommerceFunnelCategorySyncDoc {
    readonly sessions = sessions;
    readonly revenue = revenue;
    readonly orders = orders;
    readonly colors = CAT_COLORS;

    readonly formatK = (v: TickValue): string => {
        const n = Number(v);

        return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;
    };
}

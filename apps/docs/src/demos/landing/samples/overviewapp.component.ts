import { CommonModule } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ChartModule } from '@openng/optimus-ui/chart';
import { MeterGroupModule } from '@openng/optimus-ui/metergroup';
import { TableModule } from '@openng/optimus-ui/table';
import { TagModule } from '@openng/optimus-ui/tag';

interface Kpi {
    label: string;
    value: string;
    delta: number;
    hint: string;
}

interface Order {
    id: string;
    account: string;
    instrument: string;
    status: 'Filled' | 'Working' | 'Rejected';
    amount: string;
}

/**
 * The dashboard shown on the home page. Everything here is a live Optimus UI component
 * rendered in the browser — table, paginator, chart and meter group — so what a visitor
 * scrolls past is the library running, not a picture of it.
 */
@Component({
    selector: 'overview-app',
    standalone: true,
    imports: [CommonModule, TableModule, TagModule, ChartModule, MeterGroupModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    // The frame is a flex row, so the sample has to claim the space like the others do.
    host: {
        class: 'flex-1 min-w-0'
    },
    template: `
        <div class="flex h-full w-full flex-col gap-4">
            <div class="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p class="text-xs text-muted-color">Overview</p>
                    <div class="mt-1 text-lg font-semibold text-surface-900 dark:text-surface-0">Treasury</div>
                </div>
                <p-tag value="Live" severity="success" />
            </div>

            <!-- KPI row -->
            <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
                @for (kpi of kpis; track kpi.label) {
                    <div class="rounded-lg border border-surface p-3">
                        <p class="truncate text-xs text-muted-color">{{ kpi.label }}</p>
                        <p class="mt-1 text-xl font-semibold text-surface-900 tabular-nums dark:text-surface-0">{{ kpi.value }}</p>
                        <p class="mt-1 flex items-center gap-1 text-xs" [class.text-green-600]="kpi.delta >= 0" [class.text-red-600]="kpi.delta < 0">
                            <i class="pi text-[10px]" [ngClass]="kpi.delta >= 0 ? 'pi-arrow-up-right' : 'pi-arrow-down-right'" aria-hidden="true"></i>
                            <span class="tabular-nums">{{ kpi.delta >= 0 ? '+' : '' }}{{ kpi.delta }}%</span>
                            <span class="text-muted-color">{{ kpi.hint }}</span>
                        </p>
                    </div>
                }
            </div>

            <div class="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                <!-- Orders -->
                <div class="min-w-0 overflow-x-auto rounded-lg border border-surface">
                    <p-table [value]="orders" [paginator]="true" [rows]="4" [showCurrentPageReport]="true" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries" styleClass="text-sm" [tableStyle]="{ 'min-width': '20rem' }">
                        <ng-template #header>
                            <tr>
                                <th>Account</th>
                                <th>Instrument</th>
                                <th>Status</th>
                                <th class="text-end">Amount</th>
                            </tr>
                        </ng-template>
                        <ng-template #body let-row>
                            <tr>
                                <td class="font-medium">{{ row.account }}</td>
                                <td class="text-muted-color">{{ row.instrument }}</td>
                                <td><p-tag [value]="row.status" [severity]="severityOf(row.status)" /></td>
                                <td class="text-end tabular-nums">{{ row.amount }}</td>
                            </tr>
                        </ng-template>
                    </p-table>
                </div>

                <div class="flex min-w-0 flex-col gap-4">
                    <!-- Net flow -->
                    <div class="rounded-lg border border-surface p-3">
                        <p class="text-xs text-muted-color">Net flow per day</p>
                        @if (chartData()) {
                            <p-chart type="bar" [data]="chartData()" [options]="chartOptions()" height="120px" />
                        }
                    </div>

                    <!-- Exposure -->
                    <div class="rounded-lg border border-surface p-3">
                        <p class="mb-3 text-xs text-muted-color">Exposure by desk</p>
                        <p-metergroup [value]="exposure" />
                    </div>
                </div>
            </div>
        </div>
    `
})
export class OverviewApp {
    kpis: Kpi[] = [
        { label: 'Balance', value: '$4.82M', delta: 3.1, hint: 'vs last month' },
        { label: 'Net flow', value: '+$318K', delta: 12.4, hint: 'vs last month' },
        { label: 'Open orders', value: '20', delta: -6.2, hint: 'vs last week' },
        { label: 'Risk score', value: '34/100', delta: -4.8, hint: 'lower is better' }
    ];

    /** Twenty rows, four to a page — the paginator report is the point of the table. */
    orders: Order[] = buildOrders();

    exposure = [
        { label: 'Equities', color: '#22c55e', value: 44 },
        { label: 'Credit', color: '#3b82f6', value: 28 },
        { label: 'FX', color: '#a855f7', value: 16 }
    ];

    chartData = signal<any>(null);

    chartOptions = signal<any>(null);

    constructor() {
        // Chart.js needs real element metrics, so the data is only built in the browser.
        afterNextRender(() => this.buildChart());
    }

    severityOf(status: Order['status']) {
        return status === 'Filled' ? 'success' : status === 'Working' ? 'warn' : 'danger';
    }

    private buildChart() {
        const styles = getComputedStyle(document.documentElement);
        const text = styles.getPropertyValue('--p-text-muted-color') || '#71717a';
        const grid = styles.getPropertyValue('--p-content-border-color') || '#e4e4e7';
        const bar = styles.getPropertyValue('--p-primary-color') || '#18181b';

        this.chartData.set({
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Net flow',
                    data: [128, 214, 96, 241, 268, 42, 87],
                    backgroundColor: bar,
                    borderRadius: 4,
                    barThickness: 14
                }
            ]
        });

        this.chartOptions.set({
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: text, font: { size: 10 } }, grid: { display: false }, border: { display: false } },
                y: { ticks: { color: text, font: { size: 10 } }, grid: { color: grid }, border: { display: false } }
            }
        });
    }
}

function buildOrders(): Order[] {
    const accounts = ['Northwind', 'Beltrame', 'Ardenne', 'Kestrel', 'Halcyon'];
    const instruments = ['EUR/USD', 'US 10Y', 'Brent', 'S&P 500', 'GBP/CHF'];
    const statuses: Order['status'][] = ['Filled', 'Working', 'Rejected'];

    return Array.from({ length: 20 }, (_, index) => ({
        id: `${index + 1}`,
        account: `${accounts[index % accounts.length]} ${String(index + 1).padStart(2, '0')}`,
        instrument: instruments[index % instruments.length],
        status: statuses[index % 3 === 2 ? (index % 5 === 4 ? 2 : 1) : 0],
        amount: `$${(18 + index * 7.4).toFixed(1)}K`
    }));
}

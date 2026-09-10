/**
 * ChartAccessibility.
 *
 * A chart is a picture of numbers, and a picture is where a screen reader stops. Everything here
 * exists to give it the numbers instead: a described figure, a real table of the data, and the
 * keyboard a mouse user never needed.
 *
 * The descriptions are generated without this element -- a chart is not inaccessible by default.
 * What the element adds is control: the prose, the verbosity, the table's size, and the keyboard
 * navigation between points.
 */
import { ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, booleanAttribute, computed, inject, input, numberAttribute } from '@angular/core';
import type { ChartAccessibilityProps, DataTableCellContext, KeyboardNavigationConfig, PointDescriptionContext, SeriesDescriptionContext } from '@openng/optimus-ui/types/charts';
import { CHART_CONTEXT } from '../charts-registry';

/**
 * Screen reader support and keyboard navigation for the chart's data.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-accessibility',
    standalone: true,
    template: `
        @if (enabled()) {
            <div class="p-chart-a11y" data-slot="chart-accessibility">
                <p class="p-chart-a11y-description" data-slot="chart-accessibility-description">{{ description() ?? generatedDescription() }}</p>
                @if (rows().length > 0) {
                    <table class="p-chart-a11y-table" data-slot="chart-accessibility-table">
                        <caption>
                            {{
                                tableCaption()
                            }}
                        </caption>
                        <thead>
                            <tr>
                                @for (heading of headings(); track heading) {
                                    <th scope="col">{{ heading }}</th>
                                }
                            </tr>
                        </thead>
                        <tbody>
                            @for (row of rows(); track $index; let rowIndex = $index) {
                                <tr>
                                    @for (cell of row; track $index; let columnIndex = $index) {
                                        @if (columnIndex === 0) {
                                            <th scope="row">{{ formatCell(cell, columnIndex, rowIndex) }}</th>
                                        } @else {
                                            <td>{{ formatCell(cell, columnIndex, rowIndex) }}</td>
                                        }
                                    }
                                </tr>
                            }
                        </tbody>
                    </table>
                }
                @if (keyboardNavigation()?.enabled !== false) {
                    <p class="p-chart-a11y-hint" data-slot="chart-accessibility-hint">{{ keyboardHint() }}</p>
                }
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    /*
     * The whole block is visually hidden rather than `display: none`.
     *
     * A hidden element is not read, so it would defeat the purpose. Clipping it to one pixel keeps
     * it in the accessibility tree while taking no space -- which is the only way to publish a data
     * table that does not also appear under the chart.
     */
    host: {
        class: 'p-chart-a11y-host',
        style: 'position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap'
    }
})
export class ChartAccessibility {
    private readonly context = inject(CHART_CONTEXT, { optional: true });

    private readonly destroyRef = inject(DestroyRef);

    /**
     * Whether the accessible description and table are published.
     * @defaultValue true
     * @group Props
     */
    readonly enabled = input(true, { transform: booleanAttribute });
    /**
     * Fill the marks with patterns as well as colour, so the series stay distinguishable without it.
     * @defaultValue false
     * @group Props
     */
    readonly patterns = input(false, { transform: booleanAttribute });
    /**
     * The chart's description, which replaces the generated one.
     * @group Props
     */
    readonly description = input<string | undefined>(undefined);
    /**
     * How the chart type is described, for the generated prose.
     * @group Props
     */
    readonly typeDescription = input<string | undefined>(undefined);
    /**
     * Heading level for the chart's landmark.
     * @defaultValue 'h3'
     * @group Props
     */
    readonly headingLevel = input<'h2' | 'h3' | 'h4' | 'h5' | 'h6'>('h3');
    /**
     * Point count above which individual points stop being described one by one.
     * @defaultValue 30
     * @group Props
     */
    readonly pointDescriptionThreshold = input(30, { transform: numberAttribute });
    /**
     * Maximum rows in the published data table.
     * @defaultValue 100
     * @group Props
     */
    readonly dataTableMaxRows = input(100, { transform: numberAttribute });
    /**
     * Formats one table cell.
     * @group Props
     */
    readonly dataTableCellFormatter = input<((context: DataTableCellContext) => string) | undefined>(undefined);
    /**
     * Formats one point's description.
     * @group Props
     */
    readonly pointDescriptionFormatter = input<((context: PointDescriptionContext) => string) | undefined>(undefined);
    /**
     * Formats one series' description.
     * @group Props
     */
    readonly seriesDescriptionFormatter = input<((context: SeriesDescriptionContext) => string) | undefined>(undefined);
    /**
     * How much of the chart is announced as a landmark.
     * @defaultValue 'all'
     * @group Props
     */
    readonly landmarkVerbosity = input<'all' | 'chart' | 'disabled'>('all');
    /**
     * Keyboard navigation between data points.
     * @group Props
     */
    readonly keyboardNavigation = input<KeyboardNavigationConfig | undefined>(undefined);

    /** The feature's current inputs, as the root reads them. */
    readonly props = computed<ChartAccessibilityProps>(() => ({
        enabled: this.enabled(),
        patterns: this.patterns(),
        description: this.description(),
        typeDescription: this.typeDescription(),
        headingLevel: this.headingLevel(),
        pointDescriptionThreshold: this.pointDescriptionThreshold(),
        dataTableMaxRows: this.dataTableMaxRows(),
        dataTableCellFormatter: this.dataTableCellFormatter(),
        pointDescriptionFormatter: this.pointDescriptionFormatter(),
        seriesDescriptionFormatter: this.seriesDescriptionFormatter(),
        landmarkVerbosity: this.landmarkVerbosity(),
        keyboardNavigation: this.keyboardNavigation()
    }));

    protected readonly tableCaption = computed(() => this.context?.text().dataTable ?? 'Chart data');

    protected readonly keyboardHint = computed(() => this.context?.text().keyboardHint ?? '');

    /**
     * The generated description.
     *
     * Series by series, with the extremes named: a sighted reader takes "rising, peaking in June"
     * from the shape in one glance, and a summary that only counted the points would not carry it.
     * Individual points are described only below the threshold, because a hundred read-aloud
     * numbers is not a description.
     */
    protected readonly generatedDescription = computed(() => {
        const series = this.context?.series() ?? [];
        const resolved = this.tableData();

        if (resolved.series.length === 0) return this.context?.text().chart ?? 'Chart';

        const type = this.typeDescription() ?? (series.length === 1 ? `${series[0].type} chart` : 'combination chart');
        const formatter = this.seriesDescriptionFormatter();
        const sentences = resolved.series.map((entry, seriesIndex) => {
            if (formatter) return formatter({ name: entry.name, type: series[seriesIndex]?.type ?? 'line', pointCount: entry.values.filter((value) => value != null).length });

            const values = entry.values.filter((value): value is number => value != null);

            if (values.length === 0) return `${entry.name}: no data.`;

            const min = Math.min(...values);
            const max = Math.max(...values);
            const peak = resolved.categories[entry.values.indexOf(max)];

            return `${entry.name}: ${values.length} points, from ${min} to ${max}, peaking at ${peak}.`;
        });

        return `${type} with ${resolved.series.length} data series. ${sentences.join(' ')}`;
    });

    /**
     * The table's data, one row per category and one column per series.
     *
     * Read from the resolved series rather than from the raw props, so a decimated or stacked chart
     * publishes what it actually drew. A table that disagreed with the picture would be worse than
     * none: a screen reader user would be reading a different chart.
     */
    private readonly tableData = computed(() => {
        const csv = this.context?.toCsv() ?? '';

        if (csv === '') return { series: [] as { name: string; values: (number | null)[] }[], categories: [] as string[], headings: [] as string[] };

        const [header, ...body] = csv.split('\n').map(parseCsvRow);
        const limited = body.slice(0, this.dataTableMaxRows());

        return {
            headings: header,
            categories: limited.map((row) => row[0]),
            series: header.slice(1).map((name, column) => ({
                name,
                values: limited.map((row) => {
                    const parsed = Number(row[column + 1]);

                    return row[column + 1] === '' || !Number.isFinite(parsed) ? null : parsed;
                })
            }))
        };
    });

    protected readonly headings = computed(() => this.tableData().headings);

    protected readonly rows = computed(() => {
        const data = this.tableData();

        return data.categories.map((category, rowIndex) => [category, ...data.series.map((entry) => entry.values[rowIndex] ?? '')]);
    });

    /** Runs one cell through the formatter, when one was given. */
    protected formatCell(value: string | number, columnIndex: number, rowIndex: number): string {
        const formatter = this.dataTableCellFormatter();
        const isNumeric = columnIndex > 0;

        if (!formatter) return String(value);

        return formatter({ value, column: this.headings()[columnIndex] ?? '', columnIndex, rowIndex, isNumeric });
    }

    constructor() {
        if (!this.context) return;

        const remove = this.context.registerFeature({ type: 'accessibility', props: this.props });

        this.destroyRef.onDestroy(remove);
    }
}

/** Splits one CSV row, honouring the quoting the writer applied. */
function parseCsvRow(line: string): string[] {
    const cells: string[] = [];
    let cell = '';
    let quoted = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (quoted) {
            if (char === '"' && line[i + 1] === '"') {
                cell += '"';
                i++;
                continue;
            }

            if (char === '"') {
                quoted = false;
                continue;
            }

            cell += char;
            continue;
        }

        if (char === '"') {
            quoted = true;
            continue;
        }

        if (char === ',') {
            cells.push(cell);
            cell = '';
            continue;
        }

        cell += char;
    }

    cells.push(cell);

    return cells;
}

import { isPlatformBrowser } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, ElementRef, inject, InjectionToken, NgModule, NgZone, SimpleChanges, ViewEncapsulation, input, output } from '@angular/core';
import type { Chart } from 'chart.js';
import { SharedModule } from '@openng/optimus-ui/api';
import { BaseComponent } from '@openng/optimus-ui/basecomponent';
import { ChartStyle } from './style/chartstyle';
import { Bind, BindModule } from '@openng/optimus-ui/bind';
import type { ChartPassThrough } from '@openng/optimus-ui/types/chart';

const CHART_INSTANCE = new InjectionToken<UIChart>('CHART_INSTANCE');

/**
 * Chart groups a collection of contents in tabs.
 *
 * Chart.js (`chart.js/auto`, which registers every controller, element and scale) is loaded with a
 * dynamic `import()` the first time a chart is created, so it lands in a lazy chunk instead of the main
 * bundle. The chart therefore appears asynchronously, and `chart` is `null` until it is created. To ship
 * only the pieces you draw, use the SVG/Canvas charts (`p-chart-svg`, `p-chart-canvas`), which have no such dependency.
 * @group Components
 */
@Component({
    selector: 'p-chart',
    standalone: true,
    imports: [SharedModule, BindModule],
    template: `
        <canvas
            role="img"
            [attr.aria-label]="ariaLabel()"
            [attr.aria-labelledby]="ariaLabelledBy()"
            [attr.width]="responsive() && !width() ? null : width()"
            [attr.height]="responsive() && !height() ? null : height()"
            (click)="onCanvasClick($event)"
            [pBind]="ptm('canvas')"
        ></canvas>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[class]': "cx('root')",
        '[style]': "sx('root')"
    },
    providers: [ChartStyle, { provide: CHART_INSTANCE, useExisting: UIChart }],
    hostDirectives: [Bind]
})
export class UIChart extends BaseComponent<ChartPassThrough> {
    componentName = 'Chart';

    $pcChart: UIChart | undefined = inject(CHART_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    /**
     * Type of the chart.
     * @group Props
     */
    readonly type = input<'bar' | 'line' | 'scatter' | 'bubble' | 'pie' | 'doughnut' | 'polarArea' | 'radar' | undefined>(undefined);
    /**
     * Array of per-chart plugins to customize the chart behaviour.
     * @group Props
     */
    readonly plugins = input<any[]>([]);
    /**
     * Width of the chart.
     * @group Props
     */
    readonly width = input<string | undefined>(undefined);
    /**
     * Height of the chart.
     * @group Props
     */
    readonly height = input<string | undefined>(undefined);
    /**
     * Whether the chart is redrawn on screen size change.
     * @group Props
     */
    readonly responsive = input<boolean, unknown>(true, { transform: booleanAttribute });
    /**
     * Used to define a string that autocomplete attribute the current element.
     * @group Props
     */
    readonly ariaLabel = input<string | undefined>(undefined);
    /**
     * Establishes relationships between the component and label(s) where its value should be one or more element IDs.
     * @group Props
     */
    readonly ariaLabelledBy = input<string | undefined>(undefined);
    /**
     * Data to display.
     * @group Props
     */
    readonly data = input<any>(undefined);
    /**
     * Options to customize the chart.
     * @group Props
     */
    readonly options = input<any>({});
    /**
     * Callback to execute when an element on chart is clicked.
     * @group Emits
     */
    readonly onDataSelect = output<any>();

    isBrowser: boolean = false;

    initialized: boolean | undefined;

    chart: any;

    _componentStyle = inject(ChartStyle);

    el: ElementRef = inject(ElementRef);

    private zone = inject(NgZone);

    onChanges(changes: SimpleChanges) {
        if (changes['data'] || changes['options']) {
            this.reinit();
        }
    }

    onAfterViewInit() {
        this.initChart();
        this.initialized = true;
    }

    onCanvasClick(event: Event) {
        if (this.chart) {
            const element = this.chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
            const dataset = this.chart.getElementsAtEventForMode(event, 'dataset', { intersect: true }, false);

            if (element && element[0] && dataset) {
                this.onDataSelect.emit({ originalEvent: event, element: element[0], dataset: dataset });
            }
        }
    }

    private generation = 0;

    /**
     * Creates the chart once Chart.js has loaded. A newer call, or destroying the component, cancels any pending creation.
     */
    async initChart(): Promise<void> {
        if (!isPlatformBrowser(this.platformId)) return;

        const generation = ++this.generation;
        const canvas = this.el.nativeElement.children[0];

        const { default: ChartCtor }: { default: typeof Chart } = await import('chart.js/auto');

        if (generation !== this.generation) return;

        const opts = this.options() || {};
        opts.responsive = this.responsive();

        // allows chart to resize in responsive mode
        if (opts.responsive && (this.height() || this.width())) {
            opts.maintainAspectRatio = false;
        }

        this.zone.runOutsideAngular(() => {
            this.chart = new ChartCtor(canvas, {
                type: this.type(),
                data: this.data(),
                options: this.options(),
                plugins: this.plugins()
            });
        });
    }

    getCanvas() {
        return this.el.nativeElement.children[0];
    }

    getBase64Image() {
        return this.chart?.toBase64Image();
    }

    generateLegend() {
        if (this.chart) {
            return this.chart.generateLegend();
        }
    }

    refresh() {
        if (this.chart) {
            this.chart.update();
        }
    }

    reinit() {
        if (!this.initialized) return;

        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }

        this.initChart();
    }

    onDestroy() {
        this.generation++;

        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }

        this.initialized = false;
    }
}

@NgModule({
    imports: [UIChart, SharedModule],
    exports: [UIChart, SharedModule]
})
export class ChartModule {}

/**
 * The SVG chart root.
 *
 * SVG is the right default: every mark is a real element, so it can be styled from CSS, read by a
 * screen reader, found by a test and printed at any resolution. Canvas is the trade you make when
 * the mark count or the update rate stops that being affordable.
 */
import { isPlatformServer } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, effect, inject, viewChild, type ElementRef } from '@angular/core';
import { PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { Bind } from '@openng/optimus-ui/bind';
import type { BoxArea, ChartExportOptions, ChartOverlaySurface, RendererType, SvgNode } from '@openng/optimus-ui/types/charts';
import { buildPdf, dataUrlToBytes, downloadBlob, markupToBlob, rasterizeSvg, resolveExportBackground, serializeSvg } from './core/export';
import { measureTextWidth } from './core/layout';
import { createSvgElement } from './core/svg-node';
import { ChartRootBase } from './chart-root-base';
import { CHART_CONTEXT } from './charts-registry';
import { createOverlayRegistry, svgOverlaySurface } from './charts-plugins';
import { buildDrawContext, buildScene, clipRefFor, isClipped } from './render/build-scene';
import { ChartsStyle } from './style/chartsstyle';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * ChartSvg renders a chart as SVG elements. Declare the series, axes and features as children:
 * each one configures itself by existing, and removing it removes the feature.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-svg',
    standalone: true,
    exportAs: 'pChartSvg',
    template: `
        <div #container [class]="cx('container')" [attr.data-chart-container]="chartId" [style.height.px]="$height()" [style.width.px]="$width()" role="figure" aria-roledescription="chart" [attr.aria-label]="$ariaLabel()" tabindex="0">
            <svg #surface [class]="cx('surface')" [attr.width]="$width()" [attr.height]="$height()" [attr.viewBox]="$viewBox()" [attr.data-renderer]="rendererType" focusable="false">
                <defs #defs></defs>
                <g #plot [class]="cx('plot')"></g>
                <g #overlay [class]="cx('pluginOverlay')"></g>
            </svg>
            <div [class]="cx('overlays')">
                <ng-content />
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [ChartsStyle, { provide: PARENT_INSTANCE, useExisting: ChartSvg }, { provide: CHART_CONTEXT, useFactory: () => inject(ChartSvg).context }],
    host: {
        '[class]': 'cx("root")',
        'data-slot': 'chart-root',
        '[attr.data-renderer]': 'rendererType',
        '[attr.dir]': '$direction() === "rtl" ? "rtl" : null'
    },
    hostDirectives: [Bind]
})
export class ChartSvg extends ChartRootBase {
    componentName = 'Charts';

    readonly rendererType: RendererType = 'svg';

    /** @internal */
    _componentStyle = inject(ChartsStyle);

    private readonly container = viewChild<ElementRef<HTMLElement>>('container');

    private readonly surface = viewChild<ElementRef<SVGSVGElement>>('surface');

    private readonly defsRef = viewChild<ElementRef<SVGDefsElement>>('defs');

    private readonly plotRef = viewChild<ElementRef<SVGGElement>>('plot');

    private readonly overlayRef = viewChild<ElementRef<SVGGElement>>('overlay');

    protected readonly containerElement = computed(() => this.container()?.nativeElement ?? null);

    private readonly overlays = createOverlayRegistry();

    /**
     * A canvas kept only for text measurement.
     *
     * Axis label collision detection is only as good as its measurement, and `getComputedTextLength`
     * needs the text to be in the document already -- which is too late, because the measurement is
     * what decides whether to draw it. A 2D context measures the same font without rendering it.
     */
    private measureContext: CanvasRenderingContext2D | null = null;

    readonly $viewBox = computed(() => `0 0 ${this.$width()} ${this.$height()}`);

    /** The figure's accessible name, generated from the series when none was given. */
    readonly $ariaLabel = computed(() => {
        const series = this.chartState.resolvedSeries();

        if (series.length === 0) return 'Chart';

        const points = series.reduce((count, entry) => count + entry.points.length, 0);

        return series.length === 1 ? `${series[0].type} chart with ${points} data points.` : `Combination chart with ${series.length} data series.`;
    });

    constructor() {
        super();

        // The pointer handlers are attached outside Angular: a hover move repaints through the
        // frame loop, and running change detection on every pointermove would be the one thing
        // guaranteed to make a dense chart feel slow.
        effect((onCleanup) => {
            const element = this.containerElement();

            if (!element || isPlatformServer(this.platformId)) return;

            const onMove = (event: PointerEvent) => this.handlePointer(event);
            const onLeave = () => {
                this.context.setHover(null);
                this.publishHover(null);
            };

            this.zone.runOutsideAngular(() => {
                element.addEventListener('pointermove', onMove);
                element.addEventListener('pointerleave', onLeave);
            });

            onCleanup(() => {
                element.removeEventListener('pointermove', onMove);
                element.removeEventListener('pointerleave', onLeave);
            });
        });
    }

    /** Measures text against the chart's own font. */
    private readonly measureText = (text: string, fontSize: number, fontFamily?: string): number => {
        if (!this.measureContext && !isPlatformServer(this.platformId)) {
            this.measureContext = this.document.createElement('canvas').getContext('2d');
        }

        return measureTextWidth(text, fontSize, fontFamily ?? this.$fontFamily(), this.measureContext);
    };

    /**
     * Materializes the scene into SVG elements.
     *
     * The plot group is rebuilt wholesale each frame rather than diffed. That sounds wasteful, but a
     * chart's marks are entirely derived from its data: there is no per-element state worth
     * preserving, and building a fragment offscreen and swapping it in costs one layout instead of
     * the many a piecemeal patch would trigger.
     */
    protected paint(): void {
        const plot = this.plotRef()?.nativeElement;
        const defs = this.defsRef()?.nativeElement;

        if (!plot || !defs) return;

        const drawContext = buildDrawContext(this.context, this.chartId, this.measureText);
        const scene = buildScene(this.context, this.chartState.resolvedSeries(), drawContext);
        const doc = plot.ownerDocument;
        const fragment = doc.createDocumentFragment();

        for (const layer of scene.layers) {
            const group = doc.createElementNS(SVG_NS, 'g');

            group.setAttribute('data-slot', `chart-layer-${layer.key}`);
            group.setAttribute('class', `p-chart-layer p-chart-layer-${layer.key}`);

            if (isClipped(layer.key)) group.setAttribute('clip-path', clipRefFor(drawContext));

            for (const node of layer.nodes) group.appendChild(createSvgElement(node, doc));

            fragment.appendChild(group);
        }

        plot.replaceChildren(fragment);
        defs.replaceChildren(...scene.defs.map((node: SvgNode) => createSvgElement(node, doc)));

        this.paintOverlays(drawContext.area);
    }

    /** Replays the plugin overlays into their own group above the plot. */
    private paintOverlays(area: BoxArea): void {
        const host = this.overlayRef()?.nativeElement;

        if (!host) return;

        if (this.overlays.size === 0) {
            if (host.childNodes.length) host.replaceChildren();

            return;
        }

        const doc = host.ownerDocument;
        const fragment = doc.createDocumentFragment();

        this.overlays.paint(() => {
            // Each painter gets its own group, so one plugin cannot clobber another's output.
            const group = doc.createElementNS(SVG_NS, 'g');

            fragment.appendChild(group);

            return svgOverlaySurface(group, area);
        });

        host.replaceChildren(fragment);
    }

    protected registerOverlay(render: (surface: ChartOverlaySurface) => void): () => void {
        return this.overlays.register(render);
    }

    /**
     * Resolves the point under the pointer.
     *
     * Hit-testing goes through the resolved geometry rather than through the DOM, because the
     * nearest mark is often not the one under the cursor: a line chart wants the nearest point on
     * the x axis so the tooltip follows the series even between vertices, which no `elementFromPoint`
     * can tell you.
     */
    private handlePointer(event: PointerEvent): void {
        const element = this.containerElement();

        if (!element) return;

        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const area = this.context.chartArea();

        if (x < area.x || x > area.x + area.width || y < area.y || y > area.y + area.height) {
            if (this.context.hover()) {
                this.context.setHover(null);
                this.publishHover(null);
            }

            return;
        }

        const hit = this.hitTest(x, y);
        const current = this.context.hover();

        if (hit?.datasetId === current?.datasetId && hit?.index === current?.index) return;

        this.context.setHover(hit);
        this.publishHover(hit);
    }

    /** Finds the nearest mark to a pointer position. */
    private hitTest(x: number, y: number): { datasetId: string; index: number; x: number; y: number } | null {
        const xScale = this.context.xScale();

        if (!xScale) return null;

        let best: { datasetId: string; index: number; x: number; y: number } | null = null;
        let bestDistance = Infinity;

        for (const series of this.chartState.resolvedSeries()) {
            if (!series.visible) continue;

            const yScale = this.context.scales().get(`y:${series.yAxisId}`) ?? this.context.yScale();

            for (const point of series.points) {
                if (point.value == null || !this.context.isItemVisible(series.id, point.dataIndex)) continue;

                const px = xScale.scale(point.category);
                const py = yScale && yScale.type !== 'band' ? yScale.scale(point.value) : y;

                if (!Number.isFinite(px)) continue;

                // Distance is measured along x only for the cartesian families, which is what makes
                // a tooltip snap to the category the cursor is over rather than to whichever series
                // happens to pass closest to the cursor's height.
                const distance = Math.abs(px - x);

                if (distance < bestDistance) {
                    bestDistance = distance;
                    best = { datasetId: series.id, index: point.dataIndex, x: px, y: Number.isFinite(py) ? py : y };
                }
            }
        }

        return best;
    }

    getElement(): SVGSVGElement | null {
        return this.surface()?.nativeElement ?? null;
    }

    async toDataURL(options?: ChartExportOptions): Promise<string> {
        const svg = this.getElement();

        if (!svg) return '';

        const format = options?.format ?? 'png';
        const width = this.$width();
        const height = this.$height();
        const background = resolveExportBackground({ format, width, height, backgroundColor: options?.backgroundColor, resolvedBackground: this.context.theme().background });
        const markup = serializeSvg(svg, background, width, height);

        if (format === 'svg') return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;

        const canvas = await rasterizeSvg(markup, width, height, options?.scale ?? 2, background);

        return canvas.toDataURL(format === 'jpeg' || format === 'pdf' ? 'image/jpeg' : 'image/png', 0.92);
    }

    async toBlob(options?: ChartExportOptions): Promise<Blob | null> {
        const format = options?.format ?? 'png';

        if (format === 'svg') {
            const svg = this.getElement();

            if (!svg) return null;

            const width = this.$width();
            const height = this.$height();
            const background = resolveExportBackground({ format, width, height, backgroundColor: options?.backgroundColor, resolvedBackground: this.context.theme().background });

            return markupToBlob(serializeSvg(svg, background, width, height), 'svg');
        }

        const dataUrl = await this.toDataURL(options);

        if (!dataUrl) return null;

        const bytes = dataUrlToBytes(dataUrl);

        if (format === 'pdf') {
            return buildPdf(bytes, Math.round(this.$width()), Math.round(this.$height()));
        }

        return new Blob([bytes as BlobPart], { type: format === 'jpeg' ? 'image/jpeg' : 'image/png' });
    }

    async toImage(options?: ChartExportOptions): Promise<void> {
        const blob = await this.toBlob(options);

        if (!blob) return;

        downloadBlob(blob, options?.filename ?? 'chart', options?.format ?? 'png');
    }
}

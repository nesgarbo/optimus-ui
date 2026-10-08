import { isPlatformBrowser } from '@angular/common';
import {
    afterNextRender,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    effect,
    ElementRef,
    inject,
    input,
    model,
    NgModule,
    numberAttribute,
    output,
    PLATFORM_ID,
    signal,
    untracked,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { SharedModule } from '@openng/optimus-ui/api';
import { BaseComponent, PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { Bind } from '@openng/optimus-ui/bind';
import type { MapBounds, MapLngLat, MapMoveEvent, MapPassThrough, MapPointerEvent } from '@openng/optimus-ui/types/map';
import type { Map as MapLibreMap, StyleSpecification } from 'maplibre-gl';
import { MAP_CONTEXT, type MapContext } from './map-context';
import { MapStyle } from './style/mapstyle';
import { MapLayer } from './map-layer';
import { MapMarker } from './map-marker';

/**
 * A style with no tiles in it, only a background. It is what a map shows while it has nothing else, and it needs no network.
 */
export const EMPTY_MAP_STYLE: StyleSpecification = { version: 8, sources: {}, layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#e8eef4' } }] };

/**
 * A style of OpenStreetMap raster tiles. It is fine to try the map; for a product, use a tile provider and its terms.
 */
export const OSM_MAP_STYLE: StyleSpecification = {
    version: 8,
    sources: { osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, maxzoom: 19, attribution: '© OpenStreetMap contributors' } },
    layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
};

/**
 * Map shows an interactive map, on top of MapLibre GL.
 *
 * `center`, `zoom`, `bearing` and `pitch` are models, so `[(center)]` follows the user and moves the map. Markers and layers are
 * children: `p-map-marker` puts a pin and `p-map-layer` draws GeoJSON. For anything else, `getMap()` gives the MapLibre map.
 *
 * MapLibre GL is an optional peer dependency, loaded when the first map is shown, and its stylesheet
 * (`maplibre-gl/dist/maplibre-gl.css`) has to be part of the application's styles.
 *
 * @group Components
 */
@Component({
    selector: 'p-map',
    standalone: true,
    imports: [SharedModule, Bind],
    template: `
        <div #container [class]="cx('container')" [pBind]="ptm('container')"></div>
        <ng-content />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [MapStyle, { provide: PARENT_INSTANCE, useExisting: Map }, { provide: MAP_CONTEXT, useExisting: Map }],
    host: { '[class]': 'cx("root")', 'data-scope': 'map', 'data-part': 'root', '[attr.data-message]': 'failure()' },
    hostDirectives: [Bind]
})
export class Map extends BaseComponent<MapPassThrough> implements MapContext {
    componentName = 'Map';

    /** @internal */
    _componentStyle = inject(MapStyle);

    private readonly bindDirectiveInstance = inject(Bind, { self: true });
    private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
    private readonly destroyRef = inject(DestroyRef);
    private readonly container = viewChild.required<ElementRef<HTMLElement>>('container');

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    // ---------------------------------------------------------------------------------------------
    // Props
    // ---------------------------------------------------------------------------------------------

    /**
     * The middle of the map, as `[longitude, latitude]`. Supports `[(center)]`.
     * @group Props
     */
    readonly center = model<MapLngLat>([0, 20]);
    /**
     * Zoom level: 0 shows the world in one tile and each step doubles the scale. Supports `[(zoom)]`.
     * @group Props
     */
    readonly zoom = model(1);
    /**
     * Direction of the top of the map, in degrees clockwise from north. Supports `[(bearing)]`.
     * @group Props
     */
    readonly bearing = model(0);
    /**
     * Tilt of the map, in degrees from straight down. Supports `[(pitch)]`.
     * @group Props
     */
    readonly pitch = model(0);
    /**
     * The look of the map: the URL of a style, or the style itself. Defaults to one with no tiles in it.
     * @group Props
     */
    readonly mapStyle = input<string | StyleSpecification>(EMPTY_MAP_STYLE);
    /**
     * Least zoom the user can reach.
     * @group Props
     */
    readonly minZoom = input(0, { transform: numberAttribute });
    /**
     * Most zoom the user can reach.
     * @group Props
     */
    readonly maxZoom = input(22, { transform: numberAttribute });
    /**
     * The box the map cannot be moved out of: `[west, south, east, north]`.
     * @group Props
     */
    readonly maxBounds = input<MapBounds | undefined>(undefined);
    /**
     * A box to fit the map to: `[west, south, east, north]`. The map moves when it changes.
     * @group Props
     */
    readonly bounds = input<MapBounds | undefined>(undefined);
    /**
     * Space kept around the box of `bounds`, in pixels.
     * @group Props
     */
    readonly boundsPadding = input(40, { transform: numberAttribute });
    /**
     * Lets the user move, zoom and turn the map.
     * @group Props
     */
    readonly interactive = input(true, { transform: booleanAttribute });
    /**
     * Shows the zoom buttons and the compass.
     * @group Props
     */
    readonly navigationControl = input(true, { transform: booleanAttribute });
    /**
     * Shows the scale bar.
     * @group Props
     */
    readonly scaleControl = input(false, { transform: booleanAttribute });
    /**
     * Shows the button that makes the map fill the screen.
     * @group Props
     */
    readonly fullscreenControl = input(false, { transform: booleanAttribute });
    /**
     * Shows the button that finds where the user is.
     * @group Props
     */
    readonly geolocateControl = input(false, { transform: booleanAttribute });
    /**
     * Shows the credit of the tiles.
     * @group Props
     */
    readonly attributionControl = input(true, { transform: booleanAttribute });
    /**
     * Lets the map keep what it drew, so that it can be saved as an image with `getMap().getCanvas()`.
     * @group Props
     */
    readonly preserveDrawingBuffer = input(false, { transform: booleanAttribute });
    /**
     * URL of `maplibre-gl-worker.mjs`, for a build tool that does not find it. Leave it out unless the map does not draw.
     * @group Props
     */
    readonly workerUrl = input('');

    // ---------------------------------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------------------------------

    /**
     * Emitted when the map has started and its style has loaded.
     * @group Emits
     */
    readonly loaded = output<MapLibreMap>();
    /**
     * Emitted when the map could not start.
     * @group Emits
     */
    readonly failedToLoad = output<string>();
    /**
     * Emitted when a movement ends, with where the map is.
     * @group Emits
     */
    readonly moved = output<MapMoveEvent>();
    /**
     * Emitted when the map is clicked.
     * @group Emits
     */
    readonly mapClick = output<MapPointerEvent>();
    /**
     * Emitted when the map is clicked twice.
     * @group Emits
     */
    readonly mapDoubleClick = output<MapPointerEvent>();
    /**
     * Emitted when the map is clicked with the secondary button.
     * @group Emits
     */
    readonly mapContextMenu = output<MapPointerEvent>();

    /** The MapLibre map, once it is ready. */
    readonly map = signal<MapLibreMap | null>(null);
    /** The MapLibre module, once it is loaded. */
    readonly lib = signal<typeof import('maplibre-gl') | null>(null);
    /** `true` when the map is ready. */
    readonly ready = signal(false);
    /** Why the map could not start. */
    readonly failure = signal('');
    /** `true` when the map could not start. */
    readonly failed = () => !!this.failure();

    private instance: MapLibreMap | null = null;
    private resizer: ResizeObserver | null = null;
    private applying = false;

    constructor() {
        super();

        afterNextRender(() => {
            void this.start();

            // The models move the map. A move the user made has just set them, so what is already there is left alone.
            effect(
                () => {
                    const center = this.center();
                    const zoom = this.zoom();
                    const bearing = this.bearing();
                    const pitch = this.pitch();

                    untracked(() => this.follow(center, zoom, bearing, pitch));
                },
                { injector: this.injector }
            );
            effect(
                () => {
                    const style = this.mapStyle();

                    untracked(() => this.instance?.setStyle(style as never));
                },
                { injector: this.injector }
            );
            effect(
                () => {
                    const box = this.bounds();
                    const padding = this.boundsPadding();

                    untracked(
                        () =>
                            box &&
                            this.instance?.fitBounds(
                                [
                                    [box[0], box[1]],
                                    [box[2], box[3]]
                                ],
                                { padding, duration: 0 }
                            )
                    );
                },
                { injector: this.injector }
            );
            effect(
                () => {
                    const min = this.minZoom();
                    const max = this.maxZoom();
                    const limits = this.maxBounds();
                    const interactive = this.interactive();

                    untracked(() => {
                        const map = this.instance;

                        if (!map) return;

                        map.setMinZoom(min);
                        map.setMaxZoom(max);
                        map.setMaxBounds(
                            limits
                                ? [
                                      [limits[0], limits[1]],
                                      [limits[2], limits[3]]
                                  ]
                                : null
                        );

                        for (const handler of [map.dragPan, map.scrollZoom, map.boxZoom, map.dragRotate, map.keyboard, map.doubleClickZoom, map.touchZoomRotate, map.touchPitch]) interactive ? handler.enable() : handler.disable();
                    });
                },
                { injector: this.injector }
            );
        });

        this.destroyRef.onDestroy(() => {
            this.resizer?.disconnect();
            this.instance?.remove();
            this.instance = null;
        });
    }

    private async start(): Promise<void> {
        if (!this.browser) return;

        try {
            const lib = await import('maplibre-gl');

            if (this.workerUrl()) lib.setWorkerUrl(this.workerUrl());

            this.lib.set(lib);

            const box = this.bounds();
            const map = new lib.Map({
                container: this.container().nativeElement,
                style: this.mapStyle() as never,
                center: this.center(),
                zoom: this.zoom(),
                bearing: this.bearing(),
                pitch: this.pitch(),
                minZoom: this.minZoom(),
                maxZoom: this.maxZoom(),
                maxBounds: this.maxBounds()
                    ? ([
                          [this.maxBounds()![0], this.maxBounds()![1]],
                          [this.maxBounds()![2], this.maxBounds()![3]]
                      ] as never)
                    : undefined,
                interactive: this.interactive(),
                attributionControl: this.attributionControl() ? undefined : false,
                canvasContextAttributes: { preserveDrawingBuffer: this.preserveDrawingBuffer() },
                ...(box
                    ? {
                          bounds: [
                              [box[0], box[1]],
                              [box[2], box[3]]
                          ] as never,
                          fitBoundsOptions: { padding: this.boundsPadding() }
                      }
                    : {})
            });

            this.instance = map;

            if (this.navigationControl()) map.addControl(new lib.NavigationControl(), 'top-right');
            if (this.scaleControl()) map.addControl(new lib.ScaleControl(), 'bottom-left');
            if (this.fullscreenControl()) map.addControl(new lib.FullscreenControl(), 'top-right');
            if (this.geolocateControl()) map.addControl(new lib.GeolocateControl({}), 'top-right');

            map.on('moveend', () => this.afterMove(map));
            map.on('click', (e) => this.mapClick.emit(this.pointer(e)));
            map.on('dblclick', (e) => this.mapDoubleClick.emit(this.pointer(e)));
            map.on('contextmenu', (e) => this.mapContextMenu.emit(this.pointer(e)));
            map.on('error', (e) => {
                // A tile that does not come is not a reason to stop the map; one that stops the style from loading is.
                if (!this.ready()) {
                    this.failure.set(String((e as unknown as { error?: Error }).error?.message ?? 'The map could not be loaded'));
                    this.failedToLoad.emit(this.failure());
                }
            });
            map.on('style.load', () => {
                this.ready.set(true);
                this.map.set(map);
            });
            map.once('load', () => this.loaded.emit(map));

            // The map has to know when its box changes size, which the window resize event does not say.
            this.resizer = new ResizeObserver(() => map.resize());
            this.resizer.observe(this.container().nativeElement);
        } catch (error) {
            this.failure.set(error instanceof Error ? error.message : 'The map could not be started');
            this.failedToLoad.emit(this.failure());
        }
    }

    private pointer(e: { lngLat: { lng: number; lat: number }; point: { x: number; y: number }; originalEvent: MouseEvent | TouchEvent }): MapPointerEvent {
        return { lngLat: [e.lngLat.lng, e.lngLat.lat], point: [e.point.x, e.point.y], originalEvent: e.originalEvent };
    }

    private afterMove(map: MapLibreMap): void {
        const c = map.getCenter();
        const b = map.getBounds();
        const state: MapMoveEvent = { center: [c.lng, c.lat], zoom: map.getZoom(), bearing: map.getBearing(), pitch: map.getPitch(), bounds: [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()] };

        this.applying = true;
        this.center.set(state.center);
        this.zoom.set(state.zoom);
        this.bearing.set(state.bearing);
        this.pitch.set(state.pitch);
        this.applying = false;
        this.moved.emit(state);
    }

    private follow(center: MapLngLat, zoom: number, bearing: number, pitch: number): void {
        const map = this.instance;

        if (!map || this.applying) return;

        const c = map.getCenter();
        const same = (a: number, b: number) => Math.abs(a - b) < 1e-6;

        if (same(c.lng, center[0]) && same(c.lat, center[1]) && same(map.getZoom(), zoom) && same(map.getBearing(), bearing) && same(map.getPitch(), pitch)) return;

        map.jumpTo({ center, zoom, bearing, pitch });
    }

    // ---------------------------------------------------------------------------------------------
    // Methods
    // ---------------------------------------------------------------------------------------------

    /** The MapLibre map, for what the component does not cover. `null` until it has started. */
    getMap(): MapLibreMap | null {
        return this.instance;
    }

    /** Moves the map to a place along a curve. */
    flyTo(center: MapLngLat, zoom?: number, options: { duration?: number } = {}): void {
        this.instance?.flyTo({ center, ...(zoom == null ? {} : { zoom }), ...options });
    }

    /** Moves the map to a place in a straight line. */
    easeTo(center: MapLngLat, zoom?: number, options: { duration?: number } = {}): void {
        this.instance?.easeTo({ center, ...(zoom == null ? {} : { zoom }), ...options });
    }

    /** Fits the map to a box. */
    fitBounds(box: MapBounds, options: { padding?: number; duration?: number; maxZoom?: number } = {}): void {
        this.instance?.fitBounds(
            [
                [box[0], box[1]],
                [box[2], box[3]]
            ],
            { padding: this.boundsPadding(), ...options }
        );
    }

    /** Tells the map its box has changed size. It does this by itself when it can. */
    resize(): void {
        this.instance?.resize();
    }

    /** The place under a point of the map, in pixels from its top left. */
    unproject(point: [number, number]): MapLngLat | null {
        const p = this.instance?.unproject(point);

        return p ? [p.lng, p.lat] : null;
    }

    /** Where a place is on the map, in pixels from its top left. */
    project(lngLat: MapLngLat): [number, number] | null {
        const p = this.instance?.project(lngLat);

        return p ? [p.x, p.y] : null;
    }

    /** The map as an image. Needs `preserveDrawingBuffer`. */
    toDataURL(type = 'image/png'): string | null {
        return this.instance?.getCanvas().toDataURL(type) ?? null;
    }
}

/**
 * @group Modules
 */
@NgModule({
    imports: [Map, MapMarker, MapLayer, SharedModule],
    exports: [Map, MapMarker, MapLayer, SharedModule]
})
export class MapModule {}

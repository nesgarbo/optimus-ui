import { booleanAttribute, ChangeDetectionStrategy, Component, effect, inject, input, NgZone, numberAttribute, output, untracked, ViewEncapsulation } from '@angular/core';
import type { MapLayerClickEvent, MapLayerType } from '@openng/optimus-ui/types/map';
import type { GeoJSONSource, Map as MaplibreMap, MapLayerMouseEvent } from 'maplibre-gl';
import { MAP_CONTEXT } from './map-context';

let nextId = 0;

/**
 * MapLayer draws GeoJSON on a map: shapes, lines, circles, labels, heat or extruded buildings.
 *
 * `paint` and `layout` are the properties of MapLibre's style specification for the type, so a layer can be as simple as
 * `{ 'fill-color': '#f43f5e' }` or use data-driven expressions.
 *
 * @group Components
 */
@Component({
    selector: 'p-map-layer',
    standalone: true,
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { style: 'display: none' }
})
export class MapLayer {
    private readonly context = inject(MAP_CONTEXT);
    private readonly zone = inject(NgZone);

    /**
     * Identifies the layer. Made up when it is left out.
     * @group Props
     */
    readonly id = input(`p-map-layer-${nextId++}`);
    /**
     * How the data is drawn.
     * @group Props
     */
    readonly type = input<MapLayerType>('fill');
    /**
     * GeoJSON: a `FeatureCollection`, a `Feature`, a geometry, or the URL of one.
     * @group Props
     */
    readonly data = input<object | string | null>(null);
    /**
     * Paint properties of the layer, as in MapLibre's style specification.
     * @group Props
     */
    readonly paint = input<Record<string, unknown>>({});
    /**
     * Layout properties of the layer, as in MapLibre's style specification.
     * @group Props
     */
    readonly layout = input<Record<string, unknown>>({});
    /**
     * Shows only the features an expression lets through.
     * @group Props
     */
    readonly filter = input<unknown[] | null>(null);
    /**
     * Puts the layer under another one.
     * @group Props
     */
    readonly beforeId = input<string | undefined>(undefined);
    /**
     * Shows the layer.
     * @group Props
     */
    readonly visible = input(true, { transform: booleanAttribute });
    /**
     * Groups nearby points of the data into clusters.
     * @group Props
     */
    readonly cluster = input(false, { transform: booleanAttribute });
    /**
     * Least zoom the layer is drawn at.
     * @group Props
     */
    readonly minZoom = input(0, { transform: numberAttribute });
    /**
     * Most zoom the layer is drawn at.
     * @group Props
     */
    readonly maxZoom = input(24, { transform: numberAttribute });

    /**
     * Emitted when a feature of the layer is clicked.
     * @group Emits
     */
    readonly layerClick = output<MapLayerClickEvent>();

    private placedBefore: string | undefined;

    private readonly sourceId = () => `${this.id()}-source`;

    constructor() {
        // The layer is made again when what cannot be changed in place (id, type, cluster) changes, and when a new style has replaced
        // the one it was in.
        effect((onCleanup) => {
            const map = this.context.map();

            this.context.styleVersion();

            if (!map) return;

            const id = this.id();
            const type = this.type();
            const cluster = this.cluster();
            const source = `${id}-source`;
            const onClick = (e: MapLayerMouseEvent) => {
                const f = e.features?.[0];

                if (!f) return;

                this.zone.run(() => this.layerClick.emit({ lngLat: [e.lngLat.lng, e.lngLat.lat], point: [e.point.x, e.point.y], originalEvent: e.originalEvent, feature: { id: f.id, properties: f.properties, geometry: f.geometry } }));
            };
            const onEnter = () => (map.getCanvas().style.cursor = 'pointer');
            const onLeave = () => (map.getCanvas().style.cursor = '');

            untracked(() => {
                // A style that is still loading cannot take sources.
                if (map.getSource(source) || map.getLayer(id)) this.remove(map, id, source);

                map.addSource(source, { type: 'geojson', data: (this.data() ?? { type: 'FeatureCollection', features: [] }) as never, cluster });
                this.placedBefore = this.beforeId();
                map.addLayer(
                    {
                        id,
                        type: type as never,
                        source,
                        paint: this.paint() as never,
                        layout: { ...this.layout(), visibility: this.visible() ? 'visible' : 'none' } as never,
                        minzoom: this.minZoom(),
                        maxzoom: this.maxZoom(),
                        ...(this.filter() ? { filter: this.filter() as never } : {})
                    },
                    this.beforeId()
                );
                map.on('click', id, onClick);
                map.on('mouseenter', id, onEnter);
                map.on('mouseleave', id, onLeave);
            });

            // `effect` runs what is given to `onCleanup` before it runs again and when the layer goes; a function that is returned does not.
            onCleanup(() => {
                // The map may already be gone, or its style replaced, when the layer is.
                try {
                    map.off('click', id, onClick);
                    map.off('mouseenter', id, onEnter);
                    map.off('mouseleave', id, onLeave);
                    onLeave();
                    this.remove(map, id, source);
                } catch {
                    // Nothing to remove.
                }
            });
        });

        effect(() => {
            const data = this.data() ?? { type: 'FeatureCollection', features: [] };
            const map = this.context.map();

            this.context.styleVersion();

            untracked(() => (map?.getSource(this.sourceId()) as GeoJSONSource | undefined)?.setData(data as never));
        });

        effect(() => {
            const min = this.minZoom();
            const max = this.maxZoom();
            const map = this.context.map();

            this.context.styleVersion();

            untracked(() => {
                const id = this.id();

                if (map?.getLayer(id)) map.setLayerZoomRange(id, min, max);
            });
        });

        effect(() => {
            const before = this.beforeId();
            const map = this.context.map();

            untracked(() => {
                const id = this.id();

                // Only a change of `beforeId` moves the layer; its place is kept when it is made again.
                if (before === this.placedBefore) return;

                this.placedBefore = before;

                if (map?.getLayer(id)) map.moveLayer(id, before);
            });
        });

        effect(() => {
            const paint = this.paint();
            const layout = this.layout();
            const visible = this.visible();
            const filter = this.filter();
            const map = this.context.map();

            this.context.styleVersion();

            untracked(() => {
                const id = this.id();

                if (!map?.getLayer(id)) return;

                for (const [k, v] of Object.entries(paint)) map.setPaintProperty(id, k as never, v as never);
                for (const [k, v] of Object.entries(layout)) map.setLayoutProperty(id, k as never, v as never);

                map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none');
                map.setFilter(id, (filter as never) ?? null);
            });
        });
    }

    private remove(map: MaplibreMap, id: string, source: string): void {
        if (map.getLayer(id)) map.removeLayer(id);
        if (map.getSource(source)) map.removeSource(source);
    }
}

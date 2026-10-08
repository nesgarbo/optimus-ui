import { booleanAttribute, ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, numberAttribute, output, untracked, ViewEncapsulation } from '@angular/core';
import type { MapLayerClickEvent, MapLayerType } from '@openng/optimus-ui/types/map';
import type { GeoJSONSource, MapLayerMouseEvent } from 'maplibre-gl';
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
    private readonly destroyRef = inject(DestroyRef);

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

    private readonly sourceId = () => `${this.id()}-source`;

    constructor() {
        effect(() => {
            const map = this.context.map();

            if (!map) return;

            const id = untracked(() => this.id());
            const source = `${id}-source`;
            const type = untracked(() => this.type());
            const onClick = (e: MapLayerMouseEvent) => {
                const f = e.features?.[0];

                if (!f) return;

                this.layerClick.emit({ lngLat: [e.lngLat.lng, e.lngLat.lat], point: [e.point.x, e.point.y], originalEvent: e.originalEvent, feature: { id: f.id, properties: f.properties, geometry: f.geometry } });
            };

            untracked(() => {
                map.addSource(source, { type: 'geojson', data: (this.data() ?? { type: 'FeatureCollection', features: [] }) as never, cluster: this.cluster() });
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
                map.on('mouseenter', id, () => (map.getCanvas().style.cursor = 'pointer'));
                map.on('mouseleave', id, () => (map.getCanvas().style.cursor = ''));
            });

            return () => {
                // The map may already be gone, or its style replaced, when the layer is.
                try {
                    map.off('click', id, onClick);

                    if (map.getLayer(id)) map.removeLayer(id);
                    if (map.getSource(source)) map.removeSource(source);
                } catch {
                    // Nothing to remove.
                }
            };
        });

        effect(() => {
            const data = this.data() ?? { type: 'FeatureCollection', features: [] };
            const map = this.context.map();

            untracked(() => (map?.getSource(this.sourceId()) as GeoJSONSource | undefined)?.setData(data as never));
        });

        effect(() => {
            const paint = this.paint();
            const layout = this.layout();
            const visible = this.visible();
            const filter = this.filter();
            const map = this.context.map();

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
}

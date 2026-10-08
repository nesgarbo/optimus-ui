import type { PassThrough, PassThroughOption } from '@openng/optimus-ui/api';

/**
 * A place on the Earth, as `[longitude, latitude]`.
 * @group Types
 */
export type MapLngLat = [number, number];

/**
 * A box on the Earth: `[west, south, east, north]`.
 * @group Types
 */
export type MapBounds = [number, number, number, number];

/**
 * What a pointer event on the map says.
 * @group Interface
 */
export interface MapPointerEvent {
    /** Where on the Earth. */
    lngLat: MapLngLat;
    /** Where on the map, in pixels from its top left. */
    point: [number, number];
    /** The original event. */
    originalEvent: MouseEvent | TouchEvent;
}

/**
 * Event of `moved`.
 * @group Interface
 */
export interface MapMoveEvent {
    center: MapLngLat;
    zoom: number;
    bearing: number;
    pitch: number;
    bounds: MapBounds;
}

/**
 * Event of `layerClick`.
 * @group Interface
 */
export interface MapLayerClickEvent extends MapPointerEvent {
    /** The GeoJSON feature that was clicked. */
    feature: { id?: string | number; properties: Record<string, unknown> | null; geometry: unknown };
}

/**
 * The kinds of layer that `p-map-layer` draws.
 * @group Types
 */
export type MapLayerType = 'fill' | 'line' | 'circle' | 'symbol' | 'heatmap' | 'fill-extrusion';

/**
 * Pass-through options.
 * @group Interface
 */
export interface MapPassThroughOptions {
    root?: PassThroughOption<HTMLElement, any>;
    container?: PassThroughOption<HTMLElement, any>;
}

/**
 * @group Interface
 */
export type MapPassThrough<I = unknown> = PassThrough<I, MapPassThroughOptions>;

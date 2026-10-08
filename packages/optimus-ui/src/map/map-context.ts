import { InjectionToken, type Signal } from '@angular/core';
import type { Map as MapLibreMap } from 'maplibre-gl';

/**
 * What a marker or a layer needs from the map it is in. `map` is `null` until the map has started and its style has loaded.
 * @group Interface
 */
export interface MapContext {
    /** The MapLibre map, once it is ready. */
    readonly map: Signal<MapLibreMap | null>;
    /** The MapLibre module, once it is loaded. */
    readonly lib: Signal<typeof import('maplibre-gl') | null>;
}

export const MAP_CONTEXT = new InjectionToken<MapContext>('MAP_CONTEXT');

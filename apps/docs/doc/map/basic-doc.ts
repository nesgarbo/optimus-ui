import { Component, signal } from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { Map, MapMarker, OSM_MAP_STYLE } from '@openng/optimus-ui/map';
import type { MapLngLat } from '@openng/optimus-ui/types/map';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'basic-doc',
    standalone: true,
    imports: [Map, MapMarker, ButtonModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>center</i>, <i>zoom</i>, <i>bearing</i> and <i>pitch</i> are models: bind them with <i>[(center)]</i> to follow the user and to move the map. <i>mapStyle</i> takes the URL of a style or the style itself; this one uses the tiles of
                OpenStreetMap, which is fine to try the map and not for a product. A <i>p-map-marker</i> puts a pin; its <i>popupText</i> opens when it is clicked, and with <i>draggable</i> and <i>[(lngLat)]</i> the pin can be moved.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-col gap-4">
            <div class="flex flex-wrap gap-2">
                @for (city of cities; track city.name) {
                    <p-button [label]="city.name" size="small" severity="secondary" (onClick)="map.flyTo(city.at, 11)" />
                }
            </div>
            <p-map #map [(center)]="center" [(zoom)]="zoom" [mapStyle]="style" [scaleControl]="true" workerUrl="/maplibre-gl-worker.mjs" style="height: 26rem">
                @for (city of cities; track city.name) {
                    <p-map-marker [lngLat]="city.at" [popupText]="city.name" />
                }
                <p-map-marker [(lngLat)]="pin" [draggable]="true" color="#e11d48" popupText="Drag me" />
            </p-map>
            <p class="text-sm">Centre {{ center()[0].toFixed(3) }}, {{ center()[1].toFixed(3) }} · zoom {{ zoom().toFixed(1) }} · pin {{ pin()[0].toFixed(3) }}, {{ pin()[1].toFixed(3) }}</p>
        </div>
        <app-code></app-code>
    `
})
export class BasicDoc {
    style = OSM_MAP_STYLE;

    center = signal<MapLngLat>([2.35, 48.85]);

    zoom = signal(4);

    pin = signal<MapLngLat>([-3.7, 40.42]);

    cities = [
        { name: 'Madrid', at: [-3.7038, 40.4168] as MapLngLat },
        { name: 'Paris', at: [2.3522, 48.8566] as MapLngLat },
        { name: 'Rome', at: [12.4964, 41.9028] as MapLngLat }
    ];
}

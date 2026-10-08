import { Component, signal } from '@angular/core';
import { Map, MapLayer, OSM_MAP_STYLE } from '@openng/optimus-ui/map';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'layers-doc',
    standalone: true,
    imports: [Map, MapLayer, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>p-map-layer</i> draws GeoJSON. <i>type</i> is <i>fill</i>, <i>line</i>, <i>circle</i>, <i>symbol</i>, <i>heatmap</i> or <i>fill-extrusion</i>, and <i>paint</i> and <i>layout</i> are the properties of MapLibre's style specification,
                so they can use data-driven expressions. <i>layerClick</i> says which feature was clicked, and a new <i>data</i> redraws the layer. MapLibre cannot change the <i>id</i>, the <i>type</i> or the <i>cluster</i> of a layer in place, so
                changing any of them removes the layer and adds it again.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-col gap-4">
            <p-map [center]="[10, 45]" [zoom]="3.2" [mapStyle]="style" workerUrl="/maplibre-gl-worker.mjs" style="height: 26rem">
                <p-map-layer id="zones" type="fill" [data]="zones" [paint]="{ 'fill-color': ['get', 'color'], 'fill-opacity': 0.45 }" (layerClick)="clicked.set($any($event.feature.properties)['name'])" />
                <p-map-layer id="zones-outline" type="line" [data]="zones" [paint]="{ 'line-color': '#1e293b', 'line-width': 2 }" />
            </p-map>
            <p class="text-sm">{{ clicked() ? 'Clicked: ' + clicked() : 'Click a zone.' }}</p>
        </div>
        <app-code></app-code>
    `
})
export class LayersDoc {
    style = OSM_MAP_STYLE;

    clicked = signal('');

    zones = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: { name: 'West', color: '#f97316' },
                geometry: {
                    type: 'Polygon',
                    coordinates: [
                        [
                            [-9, 36],
                            [-2, 36],
                            [-2, 43],
                            [-9, 43],
                            [-9, 36]
                        ]
                    ]
                }
            },
            {
                type: 'Feature',
                properties: { name: 'Centre', color: '#3b82f6' },
                geometry: {
                    type: 'Polygon',
                    coordinates: [
                        [
                            [2, 44],
                            [9, 44],
                            [9, 49],
                            [2, 49],
                            [2, 44]
                        ]
                    ]
                }
            },
            {
                type: 'Feature',
                properties: { name: 'East', color: '#10b981' },
                geometry: {
                    type: 'Polygon',
                    coordinates: [
                        [
                            [11, 41],
                            [18, 41],
                            [18, 47],
                            [11, 47],
                            [11, 41]
                        ]
                    ]
                }
            }
        ]
    };
}

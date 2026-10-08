import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import type { StyleSpecification } from 'maplibre-gl';
import { EMPTY_MAP_STYLE, Map } from './map';
import { MapLayer } from './map-layer';
import { MapMarker } from './map-marker';

const wait = (ms = 50) => new Promise((r) => setTimeout(r, ms));

const polygon = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            properties: { name: 'Box' },
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [-10, -10],
                        [10, -10],
                        [10, 10],
                        [-10, 10],
                        [-10, -10]
                    ]
                ]
            }
        }
    ]
};

@Component({
    standalone: true,
    imports: [Map, MapMarker, MapLayer],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <p-map
            [mapStyle]="mapStyle()"
            [(center)]="center"
            [(zoom)]="zoom"
            [(bearing)]="bearing"
            [workerUrl]="worker"
            style="width: 600px; height: 400px"
            (loaded)="loadedCount = loadedCount + 1"
            (moved)="moves.push($event.zoom)"
            (mapClick)="clicks.push($event.lngLat)"
            [scaleControl]="true"
        >
            @for (m of markers(); track m.id) {
                <p-map-marker [lngLat]="m.at" [popupText]="m.text" [defaultLabel]="markerName()" [anchor]="anchor()" [draggable]="true" (pinClick)="pins = pins + 1" />
            }
            <p-map-layer id="box" type="fill" [data]="data()" [paint]="{ 'fill-color': '#f43f5e', 'fill-opacity': 0.5 }" [visible]="visible()" (layerClick)="features.push($event.feature.properties)" />
        </p-map>
    `
})
class Host {
    readonly map = viewChild.required(Map);
    // The test server serves the packages of the project under /node_modules, with or without coverage; an application copies the worker next to its scripts.
    readonly worker = new URL('/node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs', location.origin).href;
    center = signal<[number, number]>([0, 0]);
    zoom = signal(3);
    bearing = signal(0);
    markers = signal([{ id: 1, at: [0, 0] as [number, number], text: 'Null Island' }]);
    data = signal<object>(polygon);
    visible = signal(true);
    markerName = signal('Marker');
    anchor = signal<'bottom' | 'top'>('bottom');
    mapStyle = signal<StyleSpecification>(EMPTY_MAP_STYLE);
    loadedCount = 0;
    moves: number[] = [];
    clicks: [number, number][] = [];
    features: unknown[] = [];
    pins = 0;
}

describe('Map', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    const root = () => fixture.nativeElement as HTMLElement;
    const map = () => host.map().getMap()!;
    const settle = async () => {
        await fixture.whenStable();
        await wait();
        await fixture.whenStable();
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [Host], providers: [provideZonelessChangeDetection()] }).compileComponents();

        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        document.body.appendChild(fixture.nativeElement);
        await fixture.whenStable();

        // The map and its worker take a moment.
        for (let i = 0; i < 40 && !host.map().ready(); i++) await wait(100);

        await settle();
    });

    it('starts, loads its style and says so', async () => {
        for (let i = 0; i < 50 && host.loadedCount === 0; i++) await wait(100);

        expect(host.map().ready()).toBe(true);
        expect(host.map().failure()).toBe('');
        expect(host.loadedCount).toBe(1);
        expect(root().querySelector('canvas.maplibregl-canvas')).not.toBeNull();
    });

    it('starts where it was told to', () => {
        expect(map().getCenter().lng).toBeCloseTo(0);
        expect(map().getZoom()).toBeCloseTo(3);
    });

    it('moves when the models change', async () => {
        host.center.set([20, 40]);
        host.zoom.set(5);
        host.bearing.set(30);
        await settle();

        expect(map().getCenter().lng).toBeCloseTo(20);
        expect(map().getCenter().lat).toBeCloseTo(40);
        expect(map().getZoom()).toBeCloseTo(5);
        expect(map().getBearing()).toBeCloseTo(30);
    });

    it('sets the models when the user moves it', async () => {
        map().jumpTo({ center: [-30, 10], zoom: 6 });
        map().fire('moveend');
        await settle();

        expect(host.zoom()).toBeCloseTo(6);
        expect(host.center()[0]).toBeCloseTo(-30);
        expect(host.moves.at(-1)).toBeCloseTo(6);
    });

    it('draws a marker, and a popup for its text', async () => {
        const marker = root().querySelector('.maplibregl-marker') as HTMLElement;

        expect(marker).not.toBeNull();
        expect(marker.getAttribute('aria-label')).toBe('Null Island');

        marker.click();
        await settle();

        expect(host.pins).toBe(1);
        expect(root().querySelector('.maplibregl-popup-content')?.textContent).toContain('Null Island');
    });

    it('names a pin with neither label nor text from `defaultLabel`', async () => {
        host.markers.set([{ id: 7, at: [0, 0], text: '' }]);
        await settle();
        expect((root().querySelector('.maplibregl-marker') as HTMLElement).getAttribute('aria-label')).toBe('Marker');

        host.markerName.set('Marcador');
        await settle();
        expect((root().querySelector('.maplibregl-marker') as HTMLElement).getAttribute('aria-label')).toBe('Marcador');
    });

    it('adds and removes markers as the list changes', async () => {
        host.markers.set([
            { id: 1, at: [0, 0], text: 'a' },
            { id: 2, at: [10, 10], text: 'b' }
        ]);
        await settle();
        expect(root().querySelectorAll('.maplibregl-marker')).toHaveLength(2);

        host.markers.set([{ id: 2, at: [10, 10], text: 'b' }]);
        await settle();
        expect(root().querySelectorAll('.maplibregl-marker')).toHaveLength(1);
    });

    it('draws a layer from GeoJSON, with its paint', async () => {
        const layer = map().getLayer('box');

        expect(layer?.type).toBe('fill');
        expect(map().getPaintProperty('box', 'fill-color')).toBe('#f43f5e');
        expect(map().getSource('box-source')).toBeTruthy();
    });

    it('draws what is under a point of the map, and tells which feature is clicked', async () => {
        const p = map().project([0, 0]);

        expect(map().queryRenderedFeatures([p.x, p.y], { layers: ['box'] }).length).toBeGreaterThan(0);

        map().fire('click', { lngLat: map().unproject(p), point: p, originalEvent: new MouseEvent('click') } as never);
        await settle();

        expect(host.clicks).toHaveLength(1);
    });

    it('takes new data, and hides', async () => {
        host.data.set({ type: 'FeatureCollection', features: [] });
        await settle();
        await wait(20);

        const p = map().project([0, 0]);

        expect(map().queryRenderedFeatures([p.x, p.y], { layers: ['box'] })).toHaveLength(0);

        host.data.set(polygon);
        host.visible.set(false);
        await settle();
        await wait(20);

        expect(map().getLayoutProperty('box', 'visibility')).toBe('none');
    });

    it('fits itself to a box, and projects', () => {
        host.map().fitBounds([-50, -20, 50, 20], { duration: 0, padding: 0 });

        const east = host.map().project([50, 0])!;
        const west = host.map().project([-50, 0])!;

        expect(west[0]).toBeGreaterThanOrEqual(-1);
        expect(east[0]).toBeLessThanOrEqual(601);
        expect(host.map().unproject(host.map().project([12, 7])!)![0]).toBeCloseTo(12);
    });

    it('has the controls it was asked for', () => {
        expect(root().querySelector('.maplibregl-ctrl-zoom-in')).not.toBeNull();
        expect(root().querySelector('.maplibregl-ctrl-scale')).not.toBeNull();
    });

    it('keeps its layers after the style is replaced', async () => {
        expect(map().getLayer('box')).toBeTruthy();

        host.mapStyle.set({ ...EMPTY_MAP_STYLE, layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#abcdef' } }] });
        await settle();
        for (let i = 0; i < 30 && !map().getLayer('box'); i++) await wait(100);
        await settle();

        expect(map().getLayer('box')).toBeTruthy();
        expect(map().getSource('box-source')).toBeTruthy();
        expect(host.map().styleVersion()).toBeGreaterThan(1);
    });

    it('makes the pin a focusable button that opens with the keyboard', async () => {
        const marker = root().querySelector('.maplibregl-marker') as HTMLElement;

        expect(marker.getAttribute('role')).toBe('button');
        expect(marker.getAttribute('tabindex')).toBe('0');

        marker.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
        await settle();

        expect(host.pins).toBe(1);
    });

    it('makes the pin again when its anchor changes', async () => {
        host.anchor.set('top');
        await settle();

        expect(root().querySelectorAll('.maplibregl-marker')).toHaveLength(1);
        expect(root().querySelector('.maplibregl-marker')?.className).toContain('maplibregl-marker-anchor-top');
    });

    it('does not start a map that is destroyed while the library loads', async () => {
        const other = TestBed.createComponent(Host);

        document.body.appendChild(other.nativeElement);
        await other.whenStable();
        const element = other.nativeElement as HTMLElement;

        other.destroy();
        await wait(30);

        expect(element.querySelector('canvas')).toBeNull();
    });
});

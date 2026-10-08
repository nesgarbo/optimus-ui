import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { BasicDoc } from '@/doc/map/basic-doc';
import { ImportDoc } from '@/doc/map/import-doc';
import { LayersDoc } from '@/doc/map/layers-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Map Component - Optimus UI"
        header="Map"
        description="Map shows an interactive map with markers, popups and GeoJSON layers, on top of MapLibre GL."
        [docs]="docs"
        [apiDocs]="['Map', 'MapMarker', 'MapLayer']"
        themeDocs="map"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class MapDemo {
    docs = [
        { id: 'import', label: 'Import', component: ImportDoc },
        { id: 'basic', label: 'Basic', component: BasicDoc },
        { id: 'layers', label: 'Layers', component: LayersDoc }
    ];
}

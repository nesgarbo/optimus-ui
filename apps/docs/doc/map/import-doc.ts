import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                The component is standalone and uses <a href="https://maplibre.org/maplibre-gl-js/docs/" target="_blank" rel="noopener">MapLibre GL</a>, an optional peer dependency that is loaded when the first map is shown. Two files of the package
                have to be part of the application: its stylesheet, and its worker, which is copied next to the scripts of the build. Without the worker the map starts but draws no data; set <i>workerUrl</i> if it is somewhere else.
            </p>
        </app-docsectiontext>
        <app-code [code]="code" [hideToggleCode]="true"></app-code>
    `
})
export class ImportDoc {
    code = {
        typescript: `npm install maplibre-gl

import { Map, MapMarker, MapLayer } from '@openng/optimus-ui/map';`,
        basic: `// angular.json, in the options of the build
"assets": [{ "glob": "maplibre-gl-worker.mjs", "input": "node_modules/maplibre-gl/dist", "output": "/" }],
"styles": ["node_modules/maplibre-gl/dist/maplibre-gl.css"]`
    };
}

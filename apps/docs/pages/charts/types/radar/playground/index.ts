import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { PlaygroundImport2Doc } from '@/doc/charts/types/radar/playground/import-2-doc';
import { PlaygroundPlaygroundDoc } from '@/doc/charts/types/radar/playground/playground-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Radar Playground - Optimus UI"
        header="Radar Playground"
        description="Interactive playground for radar charts to experiment with inputs and configuration live."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesRadarPlaygroundDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: PlaygroundImport2Doc
        },
        {
            id: 'playground',
            label: 'Playground',
            component: PlaygroundPlaygroundDoc
        }
    ];
}

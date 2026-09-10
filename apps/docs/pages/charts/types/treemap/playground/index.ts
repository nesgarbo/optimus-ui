import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { PlaygroundImport2Doc } from '@/doc/charts/types/treemap/playground/import-2-doc';
import { PlaygroundPlaygroundDoc } from '@/doc/charts/types/treemap/playground/playground-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Treemap Playground - Optimus UI"
        header="Treemap Playground"
        description="Interactive playground for treemap charts to experiment with inputs and configuration live."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesTreemapPlaygroundDemo {
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

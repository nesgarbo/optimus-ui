import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { PlaygroundImport2Doc } from '@/doc/charts/types/line-area/playground/import-2-doc';
import { PlaygroundPlaygroundDoc } from '@/doc/charts/types/line-area/playground/playground-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Line & Area Playground - Optimus UI"
        header="Line & Area Playground"
        description="Interactive playground for line and area charts to experiment with inputs and configuration live."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesLineAreaPlaygroundDemo {
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

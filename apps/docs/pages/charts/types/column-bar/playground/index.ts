import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { PlaygroundImport2Doc } from '@/doc/charts/types/column-bar/playground/import-2-doc';
import { PlaygroundPlaygroundDoc } from '@/doc/charts/types/column-bar/playground/playground-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Column & Bar Playground - Optimus UI"
        header="Column & Bar Playground"
        description="Interactive playground for column and bar charts to experiment with inputs and configuration live."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesColumnBarPlaygroundDemo {
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

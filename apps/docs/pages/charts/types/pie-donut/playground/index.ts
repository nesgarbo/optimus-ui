import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { PlaygroundImport2Doc } from '@/doc/charts/types/pie-donut/playground/import-2-doc';
import { PlaygroundPlaygroundDoc } from '@/doc/charts/types/pie-donut/playground/playground-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Pie & Donut Playground - Optimus UI"
        header="Pie & Donut Playground"
        description="Interactive playground for pie and donut charts to experiment with inputs and configuration live."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesPieDonutPlaygroundDemo {
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

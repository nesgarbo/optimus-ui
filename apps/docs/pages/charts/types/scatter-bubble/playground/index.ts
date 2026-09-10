import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { PlaygroundImport2Doc } from '@/doc/charts/types/scatter-bubble/playground/import-2-doc';
import { PlaygroundPlaygroundDoc } from '@/doc/charts/types/scatter-bubble/playground/playground-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Scatter & Bubble Playground - Optimus UI"
        header="Scatter & Bubble Playground"
        description="Interactive playground for scatter and bubble charts to experiment with inputs and configuration live."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesScatterBubblePlaygroundDemo {
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

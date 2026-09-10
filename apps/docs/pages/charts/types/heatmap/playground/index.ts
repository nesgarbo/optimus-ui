import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { PlaygroundImport2Doc } from '@/doc/charts/types/heatmap/playground/import-2-doc';
import { PlaygroundPlaygroundDoc } from '@/doc/charts/types/heatmap/playground/playground-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Heatmap Playground - Optimus UI"
        header="Heatmap Playground"
        description="Interactive playground for heatmap charts to experiment with inputs and configuration live."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesHeatmapPlaygroundDemo {
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

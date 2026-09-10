import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { NavigatorImport2Doc } from '@/doc/charts/configuration/navigator/import-2-doc';
import { NavigatorBasicDoc } from '@/doc/charts/configuration/navigator/basic-doc';
import { NavigatorSeriesDoc } from '@/doc/charts/configuration/navigator/series-doc';
import { NavigatorHeightAndGapDoc } from '@/doc/charts/configuration/navigator/height-and-gap-doc';
import { NavigatorStylingDoc } from '@/doc/charts/configuration/navigator/styling-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Navigator - Optimus UI"
        header="Navigator"
        description="Add a mini overview chart below the main chart with a draggable selection window for zooming and panning."
        [docs]="docs"
        [apiDocs]="['ChartNavigator']"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsConfigurationNavigatorDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: NavigatorImport2Doc
        },
        {
            id: 'basic',
            label: 'Basic',
            component: NavigatorBasicDoc
        },
        {
            id: 'series',
            label: 'Series',
            component: NavigatorSeriesDoc
        },
        {
            id: 'height-and-gap',
            label: 'Height & Gap',
            component: NavigatorHeightAndGapDoc
        },
        {
            id: 'styling',
            label: 'Styling',
            component: NavigatorStylingDoc
        }
    ];
}

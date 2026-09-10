import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { PlaygroundImport2Doc } from '@/doc/charts/types/candlestick/playground/import-2-doc';
import { PlaygroundPlaygroundDoc } from '@/doc/charts/types/candlestick/playground/playground-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Candlestick & OHLC Playground - Optimus UI"
        header="Candlestick & OHLC Playground"
        description="Interactive playground for candlestick and OHLC charts to experiment with inputs and configuration live."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesCandlestickPlaygroundDemo {
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

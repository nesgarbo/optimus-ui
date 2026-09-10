import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { ReferenceLinesBandsImport2Doc } from '@/doc/charts/configuration/reference-lines-bands/import-2-doc';
import { ReferenceLinesBandsReferenceLineDoc } from '@/doc/charts/configuration/reference-lines-bands/reference-line-doc';
import { ReferenceLinesBandsReferenceBandDoc } from '@/doc/charts/configuration/reference-lines-bands/reference-band-doc';
import { ReferenceLinesBandsLabelDoc } from '@/doc/charts/configuration/reference-lines-bands/label-doc';
import { ReferenceLinesBandsStylingDoc } from '@/doc/charts/configuration/reference-lines-bands/styling-doc';
import { ReferenceLinesBandsMultipleAxesDoc } from '@/doc/charts/configuration/reference-lines-bands/multiple-axes-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Reference Lines & Bands - Optimus UI"
        header="Reference Lines & Bands"
        description="Overlay fixed value markers and shaded regions on cartesian charts to highlight thresholds, targets, and ranges."
        [docs]="docs"
        [apiDocs]="['ChartReferenceLine', 'ChartReferenceBand']"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsConfigurationReferenceLinesBandsDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: ReferenceLinesBandsImport2Doc
        },
        {
            id: 'reference-line',
            label: 'Reference Line',
            component: ReferenceLinesBandsReferenceLineDoc
        },
        {
            id: 'reference-band',
            label: 'Reference Band',
            component: ReferenceLinesBandsReferenceBandDoc
        },
        {
            id: 'label',
            label: 'Label',
            component: ReferenceLinesBandsLabelDoc
        },
        {
            id: 'styling',
            label: 'Styling',
            component: ReferenceLinesBandsStylingDoc
        },
        {
            id: 'multiple-axes',
            label: 'Multiple Axes',
            component: ReferenceLinesBandsMultipleAxesDoc
        }
    ];
}

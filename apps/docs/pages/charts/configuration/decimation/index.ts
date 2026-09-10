import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { DecimationImport2Doc } from '@/doc/charts/configuration/decimation/import-2-doc';
import { DecimationBasicDoc } from '@/doc/charts/configuration/decimation/basic-doc';
import { DecimationAlgorithmsDoc } from '@/doc/charts/configuration/decimation/algorithms-doc';
import { DecimationThresholdDoc } from '@/doc/charts/configuration/decimation/threshold-doc';
import { DecimationSampleCountDoc } from '@/doc/charts/configuration/decimation/sample-count-doc';
import { DecimationChoosingAnAlgorithmDoc } from '@/doc/charts/configuration/decimation/choosing-an-algorithm-doc';
import { DecimationProgressiveDetailOnZoomDoc } from '@/doc/charts/configuration/decimation/progressive-detail-on-zoom-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Decimation - Optimus UI"
        header="Decimation"
        description="Downsample large datasets before rendering by trading point-level detail for faster, readable charts."
        [docs]="docs"
        [apiDocs]="['ChartDecimation']"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsConfigurationDecimationDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: DecimationImport2Doc
        },
        {
            id: 'basic',
            label: 'Basic',
            component: DecimationBasicDoc
        },
        {
            id: 'algorithms',
            label: 'Algorithms',
            component: DecimationAlgorithmsDoc
        },
        {
            id: 'threshold',
            label: 'Threshold',
            component: DecimationThresholdDoc
        },
        {
            id: 'sample-count',
            label: 'Sample Count',
            component: DecimationSampleCountDoc
        },
        {
            id: 'choosing-an-algorithm',
            label: 'Choosing an Algorithm',
            component: DecimationChoosingAnAlgorithmDoc
        },
        {
            id: 'progressive-detail-on-zoom',
            label: 'Progressive Detail on Zoom',
            component: DecimationProgressiveDetailOnZoomDoc
        }
    ];
}

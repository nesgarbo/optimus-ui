import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { DataLabelsImport2Doc } from '@/doc/charts/configuration/data-labels/import-2-doc';
import { DataLabelsBasicDoc } from '@/doc/charts/configuration/data-labels/basic-doc';
import { DataLabelsDisplayModeDoc } from '@/doc/charts/configuration/data-labels/display-mode-doc';
import { DataLabelsFormatterDoc } from '@/doc/charts/configuration/data-labels/formatter-doc';
import { DataLabelsMinPercentageDoc } from '@/doc/charts/configuration/data-labels/min-percentage-doc';
import { DataLabelsLeaderLinesDoc } from '@/doc/charts/configuration/data-labels/leader-lines-doc';
import { DataLabelsAlignToDoc } from '@/doc/charts/configuration/data-labels/align-to-doc';
import { DataLabelsStylingDoc } from '@/doc/charts/configuration/data-labels/styling-doc';
import { DataLabelsOffsetsDoc } from '@/doc/charts/configuration/data-labels/offsets-doc';
import { DataLabelsCustomLabelDoc } from '@/doc/charts/configuration/data-labels/custom-label-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Data Labels - Optimus UI"
        header="Data Labels"
        description="Display values directly on chart elements with full control over content, formatting, leader lines, and custom rendering."
        [docs]="docs"
        [apiDocs]="['ChartDataLabels']"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsConfigurationDataLabelsDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: DataLabelsImport2Doc
        },
        {
            id: 'basic',
            label: 'Basic',
            component: DataLabelsBasicDoc
        },
        {
            id: 'display-mode',
            label: 'Display Mode',
            component: DataLabelsDisplayModeDoc
        },
        {
            id: 'formatter',
            label: 'Formatter',
            component: DataLabelsFormatterDoc
        },
        {
            id: 'min-percentage',
            label: 'Min Percentage',
            component: DataLabelsMinPercentageDoc
        },
        {
            id: 'leader-lines',
            label: 'Leader Lines',
            component: DataLabelsLeaderLinesDoc
        },
        {
            id: 'align-to',
            label: 'Align To',
            component: DataLabelsAlignToDoc
        },
        {
            id: 'styling',
            label: 'Styling',
            component: DataLabelsStylingDoc
        },
        {
            id: 'offsets',
            label: 'Offsets',
            component: DataLabelsOffsetsDoc
        },
        {
            id: 'custom-label',
            label: 'Custom Label',
            component: DataLabelsCustomLabelDoc
        }
    ];
}

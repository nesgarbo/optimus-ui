import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { AxesImport2Doc } from '@/doc/charts/configuration/axes/import-2-doc';
import { AxesBasicDoc } from '@/doc/charts/configuration/axes/basic-doc';
import { AxesTimeAxisDoc } from '@/doc/charts/configuration/axes/time-axis-doc';
import { AxesLinearAxisDoc } from '@/doc/charts/configuration/axes/linear-axis-doc';
import { AxesLogarithmicDoc } from '@/doc/charts/configuration/axes/logarithmic-doc';
import { AxesAxisTitleDoc } from '@/doc/charts/configuration/axes/axis-title-doc';
import { AxesTickFormattingDoc } from '@/doc/charts/configuration/axes/tick-formatting-doc';
import { AxesTickStylingDoc } from '@/doc/charts/configuration/axes/tick-styling-doc';
import { AxesGridLinesDoc } from '@/doc/charts/configuration/axes/grid-lines-doc';
import { AxesDomainDoc } from '@/doc/charts/configuration/axes/domain-doc';
import { AxesReversedDoc } from '@/doc/charts/configuration/axes/reversed-doc';
import { AxesHiddenAxisDoc } from '@/doc/charts/configuration/axes/hidden-axis-doc';
import { AxesCustomTickRenderDoc } from '@/doc/charts/configuration/axes/custom-tick-render-doc';
import { AxesAxisGroupingDoc } from '@/doc/charts/configuration/axes/axis-grouping-doc';
import { AxesMultipleAxesDoc } from '@/doc/charts/configuration/axes/multiple-axes-doc';
import { AxesTimeZoneDoc } from '@/doc/charts/configuration/axes/time-zone-doc';
import { AxesDataGroupingDoc } from '@/doc/charts/configuration/axes/data-grouping-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Axes - Optimus UI"
        header="Axes"
        description="Configure X and Y axes with full control over type, title, tick formatting, grid lines, domain, scale, grouping, and multi-axis layouts."
        [docs]="docs"
        [apiDocs]="['ChartXAxis', 'ChartYAxis']"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsConfigurationAxesDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: AxesImport2Doc
        },
        {
            id: 'basic',
            label: 'Basic',
            component: AxesBasicDoc
        },
        {
            id: 'time-axis',
            label: 'Time Axis',
            component: AxesTimeAxisDoc
        },
        {
            id: 'linear-axis',
            label: 'Linear Axis',
            component: AxesLinearAxisDoc
        },
        {
            id: 'logarithmic',
            label: 'Logarithmic',
            component: AxesLogarithmicDoc
        },
        {
            id: 'axis-title',
            label: 'Axis Title',
            component: AxesAxisTitleDoc
        },
        {
            id: 'tick-formatting',
            label: 'Tick Formatting',
            component: AxesTickFormattingDoc
        },
        {
            id: 'tick-styling',
            label: 'Tick Styling',
            component: AxesTickStylingDoc
        },
        {
            id: 'grid-lines',
            label: 'Grid Lines',
            component: AxesGridLinesDoc
        },
        {
            id: 'domain',
            label: 'Domain',
            component: AxesDomainDoc
        },
        {
            id: 'reversed',
            label: 'Reversed',
            component: AxesReversedDoc
        },
        {
            id: 'hidden-axis',
            label: 'Hidden Axis',
            component: AxesHiddenAxisDoc
        },
        {
            id: 'custom-tick-render',
            label: 'Custom Tick Render',
            component: AxesCustomTickRenderDoc
        },
        {
            id: 'axis-grouping',
            label: 'Axis Grouping',
            component: AxesAxisGroupingDoc
        },
        {
            id: 'multiple-axes',
            label: 'Multiple Axes',
            component: AxesMultipleAxesDoc
        },
        {
            id: 'time-zone',
            label: 'Time Zone',
            component: AxesTimeZoneDoc
        },
        {
            id: 'data-grouping',
            label: 'Data Grouping',
            component: AxesDataGroupingDoc
        }
    ];
}

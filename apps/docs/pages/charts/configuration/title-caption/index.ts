import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { TitleCaptionImport2Doc } from '@/doc/charts/configuration/title-caption/import-2-doc';
import { TitleCaptionBasicDoc } from '@/doc/charts/configuration/title-caption/basic-doc';
import { TitleCaptionCaptionDoc } from '@/doc/charts/configuration/title-caption/caption-doc';
import { TitleCaptionAlignmentDoc } from '@/doc/charts/configuration/title-caption/alignment-doc';
import { TitleCaptionPositionDoc } from '@/doc/charts/configuration/title-caption/position-doc';
import { TitleCaptionStylingDoc } from '@/doc/charts/configuration/title-caption/styling-doc';
import { TitleCaptionFloatingDoc } from '@/doc/charts/configuration/title-caption/floating-doc';
import { TitleCaptionOffsetsDoc } from '@/doc/charts/configuration/title-caption/offsets-doc';
import { TitleCaptionResponsiveScalingDoc } from '@/doc/charts/configuration/title-caption/responsive-scaling-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Title & Caption - Optimus UI"
        header="Title & Caption"
        description="Add a title and caption to any chart with control over position, alignment, font, and floating overlay mode."
        [docs]="docs"
        [apiDocs]="['ChartTitle', 'ChartCaption']"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsConfigurationTitleCaptionDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: TitleCaptionImport2Doc
        },
        {
            id: 'basic',
            label: 'Basic',
            component: TitleCaptionBasicDoc
        },
        {
            id: 'caption',
            label: 'Caption',
            component: TitleCaptionCaptionDoc
        },
        {
            id: 'alignment',
            label: 'Alignment',
            component: TitleCaptionAlignmentDoc
        },
        {
            id: 'position',
            label: 'Position',
            component: TitleCaptionPositionDoc
        },
        {
            id: 'styling',
            label: 'Styling',
            component: TitleCaptionStylingDoc
        },
        {
            id: 'floating',
            label: 'Floating',
            component: TitleCaptionFloatingDoc
        },
        {
            id: 'offsets',
            label: 'Offsets',
            component: TitleCaptionOffsetsDoc
        },
        {
            id: 'responsive-scaling',
            label: 'Responsive Scaling',
            component: TitleCaptionResponsiveScalingDoc
        }
    ];
}

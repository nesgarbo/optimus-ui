import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { AnnotationImport2Doc } from '@/doc/charts/configuration/annotation/import-2-doc';
import { AnnotationBasicDoc } from '@/doc/charts/configuration/annotation/basic-doc';
import { AnnotationPositioningAtDataValuesDoc } from '@/doc/charts/configuration/annotation/positioning-at-data-values-doc';
import { AnnotationMultiAxisPositioningDoc } from '@/doc/charts/configuration/annotation/multi-axis-positioning-doc';
import { AnnotationRadialChartsDoc } from '@/doc/charts/configuration/annotation/radial-charts-doc';
import { AnnotationDarkModeDoc } from '@/doc/charts/configuration/annotation/dark-mode-doc';
import { AnnotationMultipleAnnotationsDoc } from '@/doc/charts/configuration/annotation/multiple-annotations-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Annotation - Optimus UI"
        header="Annotation"
        description="Overlay fully custom content on any chart type using SVG nodes or direct Canvas drawing with access to scales, theme colors, and animation."
        [docs]="docs"
        [apiDocs]="['ChartAnnotation']"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsConfigurationAnnotationDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: AnnotationImport2Doc
        },
        {
            id: 'basic',
            label: 'Basic',
            component: AnnotationBasicDoc
        },
        {
            id: 'positioning-at-data-values',
            label: 'Positioning at Data Values',
            component: AnnotationPositioningAtDataValuesDoc
        },
        {
            id: 'multi-axis-positioning',
            label: 'Multi-Axis Positioning',
            component: AnnotationMultiAxisPositioningDoc
        },
        {
            id: 'radial-charts',
            label: 'Radial Charts',
            component: AnnotationRadialChartsDoc
        },
        {
            id: 'dark-mode',
            label: 'Dark Mode',
            component: AnnotationDarkModeDoc
        },
        {
            id: 'multiple-annotations',
            label: 'Multiple Annotations',
            component: AnnotationMultipleAnnotationsDoc
        }
    ];
}

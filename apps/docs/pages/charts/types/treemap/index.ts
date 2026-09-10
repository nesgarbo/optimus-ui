import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { TreemapImport2Doc } from '@/doc/charts/types/treemap/import-2-doc';
import { TreemapBasicDoc } from '@/doc/charts/types/treemap/basic-doc';
import { TreemapColorsDoc } from '@/doc/charts/types/treemap/colors-doc';
import { TreemapColorRangeDoc } from '@/doc/charts/types/treemap/color-range-doc';
import { TreemapHierarchyDoc } from '@/doc/charts/types/treemap/hierarchy-doc';
import { TreemapDrilldownDoc } from '@/doc/charts/types/treemap/drilldown-doc';
import { TreemapLayoutDoc } from '@/doc/charts/types/treemap/layout-doc';
import { TreemapLabelsDoc } from '@/doc/charts/types/treemap/labels-doc';
import { TreemapCustomContentDoc } from '@/doc/charts/types/treemap/custom-content-doc';
import { TreemapDeclarativeDoc } from '@/doc/charts/types/treemap/declarative-doc';
import { TreemapTitleAndCaptionDoc } from '@/doc/charts/types/treemap/title-and-caption-doc';
import { TreemapHoverDoc } from '@/doc/charts/types/treemap/hover-doc';
import { TreemapTooltipDoc } from '@/doc/charts/types/treemap/tooltip-doc';
import { TreemapLegendDoc } from '@/doc/charts/types/treemap/legend-doc';
import { TreemapDataLabelsDoc } from '@/doc/charts/types/treemap/data-labels-doc';
import { TreemapAnimationDoc } from '@/doc/charts/types/treemap/animation-doc';
import { TreemapExportDoc } from '@/doc/charts/types/treemap/export-doc';
import { TreemapResponsiveDoc } from '@/doc/charts/types/treemap/responsive-doc';
import { TreemapAccessibilityDoc } from '@/doc/charts/types/treemap/accessibility-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Treemap - Optimus UI"
        header="Treemap"
        description="Nested rectangles sized by value, with hierarchy, drilldown, custom content, and multiple layout algorithms."
        [docs]="docs"
        [apiDocs]="['ChartTreemap']"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesTreemapDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: TreemapImport2Doc
        },
        {
            id: 'basic',
            label: 'Basic',
            component: TreemapBasicDoc
        },
        {
            id: 'colors',
            label: 'Colors',
            component: TreemapColorsDoc
        },
        {
            id: 'color-range',
            label: 'Color Range',
            component: TreemapColorRangeDoc
        },
        {
            id: 'hierarchy',
            label: 'Hierarchy',
            component: TreemapHierarchyDoc
        },
        {
            id: 'drilldown',
            label: 'Drilldown',
            component: TreemapDrilldownDoc
        },
        {
            id: 'layout',
            label: 'Layout',
            component: TreemapLayoutDoc
        },
        {
            id: 'labels',
            label: 'Labels',
            component: TreemapLabelsDoc
        },
        {
            id: 'custom-content',
            label: 'Custom Content',
            component: TreemapCustomContentDoc
        },
        {
            id: 'declarative',
            label: 'Declarative',
            component: TreemapDeclarativeDoc
        },
        {
            id: 'title-and-caption',
            label: 'Title & Caption',
            component: TreemapTitleAndCaptionDoc
        },
        {
            id: 'hover',
            label: 'Hover',
            component: TreemapHoverDoc
        },
        {
            id: 'tooltip',
            label: 'Tooltip',
            component: TreemapTooltipDoc
        },
        {
            id: 'legend',
            label: 'Legend',
            component: TreemapLegendDoc
        },
        {
            id: 'data-labels',
            label: 'Data Labels',
            component: TreemapDataLabelsDoc
        },
        {
            id: 'animation',
            label: 'Animation',
            component: TreemapAnimationDoc
        },
        {
            id: 'export',
            label: 'Export',
            component: TreemapExportDoc
        },
        {
            id: 'responsive',
            label: 'Responsive',
            component: TreemapResponsiveDoc
        },
        {
            id: 'accessibility',
            label: 'Accessibility',
            component: TreemapAccessibilityDoc
        }
    ];
}

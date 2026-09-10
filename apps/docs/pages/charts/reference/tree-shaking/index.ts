import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { TreeShakingImport2Doc } from '@/doc/charts/reference/tree-shaking/import-2-doc';
import { TreeShakingStandaloneImportsDoc } from '@/doc/charts/reference/tree-shaking/standalone-imports-doc';
import { TreeShakingChartmoduleDoc } from '@/doc/charts/reference/tree-shaking/chartmodule-doc';
import { TreeShakingSvgAndCanvasDoc } from '@/doc/charts/reference/tree-shaking/svg-and-canvas-doc';
import { TreeShakingBundleImpactDoc } from '@/doc/charts/reference/tree-shaking/bundle-impact-doc';
import { TreeShakingChoosingAnImportStyleDoc } from '@/doc/charts/reference/tree-shaking/choosing-an-import-style-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Tree Shaking - Optimus UI"
        header="Tree Shaking"
        description="Choose standalone imports or the ChartModule barrel based on bundle size and page ergonomics."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsReferenceTreeShakingDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: TreeShakingImport2Doc
        },
        {
            id: 'standalone-imports',
            label: 'Standalone Imports',
            component: TreeShakingStandaloneImportsDoc
        },
        {
            id: 'chartmodule',
            label: 'ChartModule',
            component: TreeShakingChartmoduleDoc
        },
        {
            id: 'svg-and-canvas',
            label: 'SVG and Canvas',
            component: TreeShakingSvgAndCanvasDoc
        },
        {
            id: 'bundle-impact',
            label: 'Bundle Impact',
            component: TreeShakingBundleImpactDoc
        },
        {
            id: 'choosing-an-import-style',
            label: 'Choosing an Import Style',
            component: TreeShakingChoosingAnImportStyleDoc
        }
    ];
}

import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { BubbleImport2Doc } from '@/doc/charts/types/scatter-bubble/bubble/import-2-doc';
import { BubbleMicrosoftProductPortfolioBcgGrowthShareMatrixFy2023Doc } from '@/doc/charts/types/scatter-bubble/bubble/microsoft-product-portfolio-bcg-growth-share-matrix-fy2023-doc';
import { BubbleOecdHealthcareSpendVsOutcome2022Doc } from '@/doc/charts/types/scatter-bubble/bubble/oecd-healthcare-spend-vs-outcome-2022-doc';
import { BubbleBlockbusterRoiProductionBudgetWorldwideGross20112023Doc } from '@/doc/charts/types/scatter-bubble/bubble/blockbuster-roi-production-budget-worldwide-gross-2011-2023-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Bubble Examples - Optimus UI"
        header="Bubble Examples"
        description="Bubble chart examples using sizeField encoding, logarithmic axes, quadrant annotations, and custom legend and tooltip rendering."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesScatterBubbleBubbleDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: BubbleImport2Doc
        },
        {
            id: 'microsoft-product-portfolio-bcg-growth-share-matrix-fy2023',
            label: 'Microsoft Product Portfolio: BCG Growth-Share Matrix, FY2023',
            component: BubbleMicrosoftProductPortfolioBcgGrowthShareMatrixFy2023Doc
        },
        {
            id: 'oecd-healthcare-spend-vs-outcome-2022',
            label: 'OECD Healthcare: Spend vs Outcome, 2022',
            component: BubbleOecdHealthcareSpendVsOutcome2022Doc
        },
        {
            id: 'blockbuster-roi-production-budget-worldwide-gross-2011-2023',
            label: 'Blockbuster ROI: Production Budget × Worldwide Gross, 2011–2023',
            component: BubbleBlockbusterRoiProductionBudgetWorldwideGross20112023Doc
        }
    ];
}

import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { GroupedImport2Doc } from '@/doc/charts/types/column-bar/grouped/import-2-doc';
import { GroupedG7RanddExpenditureByFundingSource2022Doc } from '@/doc/charts/types/column-bar/grouped/g7-randd-expenditure-by-funding-source-2022-doc';
import { GroupedLabourForceParticipationByGenderAndRegion2023Doc } from '@/doc/charts/types/column-bar/grouped/labour-force-participation-by-gender-and-region-2023-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Grouped Bar Examples - Optimus UI"
        header="Grouped Bar Examples"
        description="Grouped bar chart demos on real data. Each uses a custom tooltip to show computed values across series."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesColumnBarGroupedDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: GroupedImport2Doc
        },
        {
            id: 'g7-randd-expenditure-by-funding-source-2022',
            label: 'G7 R&D Expenditure by Funding Source, 2022',
            component: GroupedG7RanddExpenditureByFundingSource2022Doc
        },
        {
            id: 'labour-force-participation-by-gender-and-region-2023',
            label: 'Labour Force Participation by Gender & Region, 2023',
            component: GroupedLabourForceParticipationByGenderAndRegion2023Doc
        }
    ];
}

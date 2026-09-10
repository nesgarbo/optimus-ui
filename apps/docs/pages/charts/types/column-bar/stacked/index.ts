import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { StackedImport2Doc } from '@/doc/charts/types/column-bar/stacked/import-2-doc';
import { StackedRevenueCompositionGroupedStackedWithReferenceBandsDoc } from '@/doc/charts/types/column-bar/stacked/revenue-composition-grouped-stacked-with-reference-bands-doc';
import { StackedGlobalElectricVehicleSalesByRegion20192023Doc } from '@/doc/charts/types/column-bar/stacked/global-electric-vehicle-sales-by-region-2019-2023-doc';
import { StackedElectricityGenerationMixByCountry2023Doc } from '@/doc/charts/types/column-bar/stacked/electricity-generation-mix-by-country-2023-doc';
import { StackedWorldPopulationByAgeGroupAndSex2024Doc } from '@/doc/charts/types/column-bar/stacked/world-population-by-age-group-and-sex-2024-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Stacked Bar Examples - Optimus UI"
        header="Stacked Bar Examples"
        description="Stacked bar chart demos built on real datasets. Covers normal stacking, percent normalization, and negative stacking patterns."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesColumnBarStackedDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: StackedImport2Doc
        },
        {
            id: 'revenue-composition-grouped-stacked-with-reference-bands',
            label: 'Revenue Composition, Grouped Stacked with Reference Bands',
            component: StackedRevenueCompositionGroupedStackedWithReferenceBandsDoc
        },
        {
            id: 'global-electric-vehicle-sales-by-region-2019-2023',
            label: 'Global Electric Vehicle Sales by Region, 2019–2023',
            component: StackedGlobalElectricVehicleSalesByRegion20192023Doc
        },
        {
            id: 'electricity-generation-mix-by-country-2023',
            label: 'Electricity Generation Mix by Country, 2023',
            component: StackedElectricityGenerationMixByCountry2023Doc
        },
        {
            id: 'world-population-by-age-group-and-sex-2024',
            label: 'World Population by Age Group and Sex, 2024',
            component: StackedWorldPopulationByAgeGroupAndSex2024Doc
        }
    ];
}

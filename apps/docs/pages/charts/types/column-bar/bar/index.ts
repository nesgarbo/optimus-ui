import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { BarImport2Doc } from '@/doc/charts/types/column-bar/bar/import-2-doc';
import { BarParis2024SummerOlympicsGoldMedalsTop12CountriesDoc } from '@/doc/charts/types/column-bar/bar/paris-2024-summer-olympics-gold-medals-top-12-countries-doc';
import { BarWorldSLargestMetropolitanAreasByPopulation2024Doc } from '@/doc/charts/types/column-bar/bar/world-s-largest-metropolitan-areas-by-population-2024-doc';
import { BarWorldSMostVisitedArtMuseums2023Doc } from '@/doc/charts/types/column-bar/bar/world-s-most-visited-art-museums-2023-doc';
import { BarPrimeuiThemedBarChartDoc } from '@/doc/charts/types/column-bar/bar/primeui-themed-bar-chart-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Bar Examples - Optimus UI"
        header="Bar Examples"
        description="Bar chart demos built on real datasets. Each highlights a different rendering or theming capability."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesColumnBarBarDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: BarImport2Doc
        },
        {
            id: 'paris-2024-summer-olympics-gold-medals-top-12-countries',
            label: 'Paris 2024 Summer Olympics, Gold Medals, Top 12 Countries',
            component: BarParis2024SummerOlympicsGoldMedalsTop12CountriesDoc
        },
        {
            id: 'world-s-largest-metropolitan-areas-by-population-2024',
            label: "World's Largest Metropolitan Areas by Population, 2024",
            component: BarWorldSLargestMetropolitanAreasByPopulation2024Doc
        },
        {
            id: 'world-s-most-visited-art-museums-2023',
            label: "World's Most-Visited Art Museums, 2023",
            component: BarWorldSMostVisitedArtMuseums2023Doc
        },
        {
            id: 'primeui-themed-bar-chart',
            label: 'PrimeUI-Themed Bar Chart',
            component: BarPrimeuiThemedBarChartDoc
        }
    ];
}

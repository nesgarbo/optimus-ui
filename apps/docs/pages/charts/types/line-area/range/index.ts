import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { RangeImport2Doc } from '@/doc/charts/types/line-area/range/import-2-doc';
import { RangeBrentCrudeOilAnnualPriceRange2005To2023Doc } from '@/doc/charts/types/line-area/range/brent-crude-oil-annual-price-range-2005-to-2023-doc';
import { RangeGlobalNumberOfBirthsAndDeaths1950To2100Doc } from '@/doc/charts/types/line-area/range/global-number-of-births-and-deaths-1950-to-2100-doc';
import { RangeLondonSunriseAndSunsetTimesDoc } from '@/doc/charts/types/line-area/range/london-sunrise-and-sunset-times-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Range Area Examples - Optimus UI"
        header="Range Area Examples"
        description="Area charts that fill the region between two series. Examples covering different band types."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesLineAreaRangeDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: RangeImport2Doc
        },
        {
            id: 'brent-crude-oil-annual-price-range-2005-to-2023',
            label: 'Brent Crude Oil Annual Price Range, 2005 to 2023',
            component: RangeBrentCrudeOilAnnualPriceRange2005To2023Doc
        },
        {
            id: 'global-number-of-births-and-deaths-1950-to-2100',
            label: 'Global Number of Births and Deaths, 1950 to 2100',
            component: RangeGlobalNumberOfBirthsAndDeaths1950To2100Doc
        },
        {
            id: 'london-sunrise-and-sunset-times',
            label: 'London Sunrise & Sunset Times',
            component: RangeLondonSunriseAndSunsetTimesDoc
        }
    ];
}

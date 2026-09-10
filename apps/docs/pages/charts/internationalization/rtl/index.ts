import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { RtlImport2Doc } from '@/doc/charts/internationalization/rtl/import-2-doc';
import { RtlCartesianChartsDoc } from '@/doc/charts/internationalization/rtl/cartesian-charts-doc';
import { RtlRadialChartsDoc } from '@/doc/charts/internationalization/rtl/radial-charts-doc';
import { RtlLocalizedTimeSeriesDoc } from '@/doc/charts/internationalization/rtl/localized-time-series-doc';
import { RtlAutoDirectionDoc } from '@/doc/charts/internationalization/rtl/auto-direction-doc';

@Component({
    template: `<app-doc docTitle="Angular Charts RTL - Optimus UI" header="RTL" description="Right-to-left layout for charts. Mirrors axes, legend, and overlay positioning for RTL locales." [docs]="docs" themeDocs="charts"></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsInternationalizationRtlDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: RtlImport2Doc
        },
        {
            id: 'cartesian-charts',
            label: 'Cartesian Charts',
            component: RtlCartesianChartsDoc
        },
        {
            id: 'radial-charts',
            label: 'Radial Charts',
            component: RtlRadialChartsDoc
        },
        {
            id: 'localized-time-series',
            label: 'Localized Time Series',
            component: RtlLocalizedTimeSeriesDoc
        },
        {
            id: 'auto-direction',
            label: 'Auto Direction',
            component: RtlAutoDirectionDoc
        }
    ];
}

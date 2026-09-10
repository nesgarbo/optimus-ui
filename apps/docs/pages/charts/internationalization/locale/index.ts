import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { LocaleImport2Doc } from '@/doc/charts/internationalization/locale/import-2-doc';
import { LocaleNumberFormattingDoc } from '@/doc/charts/internationalization/locale/number-formatting-doc';
import { LocaleDateFormattingDoc } from '@/doc/charts/internationalization/locale/date-formatting-doc';
import { LocaleLocaleAndRtlTogetherDoc } from '@/doc/charts/internationalization/locale/locale-and-rtl-together-doc';
import { LocaleCustomTickFormatDoc } from '@/doc/charts/internationalization/locale/custom-tick-format-doc';
import { LocaleTranslatingChartTextDoc } from '@/doc/charts/internationalization/locale/translating-chart-text-doc';

@Component({
    template: `<app-doc docTitle="Angular Charts Locale - Optimus UI" header="Locale" description="Format axis labels, tooltips, and data values using locale-aware number and date formatting." [docs]="docs" themeDocs="charts"></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsInternationalizationLocaleDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: LocaleImport2Doc
        },
        {
            id: 'number-formatting',
            label: 'Number Formatting',
            component: LocaleNumberFormattingDoc
        },
        {
            id: 'date-formatting',
            label: 'Date Formatting',
            component: LocaleDateFormattingDoc
        },
        {
            id: 'locale-and-rtl-together',
            label: 'Locale and RTL Together',
            component: LocaleLocaleAndRtlTogetherDoc
        },
        {
            id: 'custom-tick-format',
            label: 'Custom Tick Format',
            component: LocaleCustomTickFormatDoc
        },
        {
            id: 'translating-chart-text',
            label: 'Translating Chart Text',
            component: LocaleTranslatingChartTextDoc
        }
    ];
}

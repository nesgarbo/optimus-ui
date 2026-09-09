import { Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { DEVICES } from './demo-data';

@Component({
    selector: 'locale-doc',
    standalone: true,
    imports: [AppDocSectionText, ChartsModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                One <i>locale</i> on the root moves every number and date in the chart: axis ticks, tooltip values, legend values and data labels all go through <i>Intl</i>. Note that the axis abbreviates large values only where the locale actually
                does so — German renders 5000 compactly as bare <i>5000</i>, which is no shorter than <i>5.000</i> and has lost the thousands separator, so the grouped form wins there.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div class="flex flex-wrap gap-2 mb-4">
                @for (option of locales; track option) {
                    <button type="button" class="px-3 py-1 rounded border" [class.font-semibold]="locale() === option" (click)="locale.set(option)">{{ option }}</button>
                }
            </div>
            <div style="height: 22rem">
                <p-chart-svg [locale]="locale()">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="desktop" name="Desktop" [borderRadius]="4" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-tooltip />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class LocaleDoc {
    data = DEVICES.map((row) => ({ ...row, desktop: row.desktop * 40 }));

    readonly locales = ['en-US', 'de-DE', 'fr-FR', 'ja-JP', 'ar-EG'];

    readonly locale = signal('en-US');
}

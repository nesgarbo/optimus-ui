import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'types-polar-polar-import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>Use polar charts when category order wraps around a circle: compass directions, hours, seasons, or cyclical stages. Use a cartesian bar chart when the categories are not naturally circular.</p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PolarPolarImportDoc {}

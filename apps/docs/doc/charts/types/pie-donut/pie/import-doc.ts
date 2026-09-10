import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'types-pie-donut-pie-import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>Use pie charts for small part-to-whole sets where every slice has a clear label. Move to donut, stacked rings, or another chart type when the hierarchy or comparison needs more space.</p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PieDonutPieImportDoc {}

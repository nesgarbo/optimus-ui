import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'types-pie-donut-pie-nested-import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>Use nested pies only when the rings describe a real hierarchy. If the rings are unrelated series, use grouped or stacked charts instead.</p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PieDonutPieNestedImportDoc {}

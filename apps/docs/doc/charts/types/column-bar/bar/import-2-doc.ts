import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'types-column-bar-bar-import-2-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Use these examples after the <a href="/charts/types/column-bar">Column &amp; Bar overview</a> when you need realistic ranking, horizontal labels, custom colors, or PrimeUI token styling. Choose horizontal bars when category labels
                need room.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BarImport2Doc {}

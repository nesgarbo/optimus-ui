import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'types-line-area-line-import-2-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Use these complete line-chart scenarios after the <a href="/charts/types/line-area">Line &amp; Area overview</a>. The examples keep the same public parts and layer in reference lines, navigator windows, custom tooltips, and segment
                styling where the data benefits from them.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineImport2Doc {}

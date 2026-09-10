import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'getting-started-setup-import-2-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p><i>ChartModule</i> carries every Chart part, so one import covers any template.</p>
            <p><a href="/charts/reference/tree-shaking">Tree Shaking</a> covers importing parts individually, which keeps undrawn chart types out of the bundle.</p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SetupImport2Doc {}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'reference-tree-shaking-import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Every component is available two ways from the same package: standalone imports that tree-shake, and the <i>ChartModule</i> barrel that reads cleanly but pins every chart part into the bundle. Same components either way. For a line
                chart that should not carry the candlestick, treemap, and radar code, use standalone imports.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeShakingImportDoc {}

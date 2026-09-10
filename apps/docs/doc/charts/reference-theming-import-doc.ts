import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'reference-theming-import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                SVG charts read CSS custom properties natively. Override <i>--p-chart-*</i> variables at any scope and charts update without a JS re-render. Canvas charts stay DOM-free, so theming goes through a plain JS <i>theme</i> input instead.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemingImportDoc {}

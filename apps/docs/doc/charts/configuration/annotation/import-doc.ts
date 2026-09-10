import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'configuration-annotation-import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Annotations overlay fully custom content on any chart type. The annotation context provides chart area bounds, scale functions, and theme context to position content at specific data values. In SVG mode, use an
                <i>&lt;ng-template pChartAnnotationDef let-ctx&gt;</i> template; in Canvas mode, pass a <i>render</i> function that draws directly to <i>ctx</i>.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnotationImportDoc {}

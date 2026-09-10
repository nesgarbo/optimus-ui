import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'configuration-export-import-2-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Export is opt-in: add <i>ChartExportMenu</i> to show a download button in the chart corner; remove it and no button appears. Clicking opens a menu with PNG, JPEG, SVG, PDF, and CSV options. Control the button position, filename,
                background color, and available formats through inputs.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportImport2Doc {}

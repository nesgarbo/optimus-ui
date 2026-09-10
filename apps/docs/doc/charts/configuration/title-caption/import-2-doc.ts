import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'configuration-title-caption-import-2-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Titles and captions add text labels to the chart. Both reduce the chart area to make room for themselves by default. Set <i>floating</i> to overlay them without consuming layout space, and use <i>position</i> and <i>alignment</i> to
                control placement.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleCaptionImport2Doc {}

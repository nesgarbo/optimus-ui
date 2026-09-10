import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'configuration-navigator-import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                The navigator renders a compact overview of the full dataset below the main chart with a draggable selection window. It shares zoom state with <i>ChartZoom</i>: dragging the navigator handle updates the main chart and vice versa. Add
                both components together for the full zoom-and-navigate experience.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigatorImportDoc {}

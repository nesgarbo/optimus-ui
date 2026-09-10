import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'configuration-hover-import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Hover feedback is opt-in: add <i>ChartHover</i> to brighten the hovered element while non-hovered elements stay at normal opacity. Dimming is explicit: set <i>dimOpacity</i> below <i>1</i> on <i>ChartHover</i>, a series hover config,
                or the chart theme when you want the rest of the marks to fade.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HoverImportDoc {}

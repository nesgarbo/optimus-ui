import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'configuration-tooltip-import-2-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Hover details are opt-in: add <i>ChartTooltip</i> to show a tooltip on hover; remove it and hover produces nothing. It works across all chart types with no additional wiring. Mode, snap strategy, crosshair, and custom content are all
                configured on the same component.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipImport2Doc {}

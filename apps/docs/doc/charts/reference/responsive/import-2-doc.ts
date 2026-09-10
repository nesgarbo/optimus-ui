import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'reference-responsive-import-2-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Charts fill their container by default. <i>ChartResponsive</i> adds intelligent scaling on top: font sizes, padding, tick labels, and legend position adapt across four container-width tiers. Use <i>rules</i> to define custom
                breakpoints and configuration overrides.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResponsiveImport2Doc {}

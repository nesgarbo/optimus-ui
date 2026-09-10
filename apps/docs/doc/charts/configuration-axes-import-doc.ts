import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'configuration-axes-import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Axes are opt-in children of the chart root. Add <i>ChartXAxis</i> for horizontal labels and gridlines, <i>ChartYAxis</i> for vertical. Both default to a category axis with auto-calculated ticks. Place multiple
                <i>ChartYAxis</i> components with unique <i>id</i> values for multi-axis layouts.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AxesImportDoc {}

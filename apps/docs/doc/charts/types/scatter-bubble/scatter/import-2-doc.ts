import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'types-scatter-bubble-scatter-import-2-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>Use scatter charts for relationships, clusters, and outliers. Switch to <i>ChartCanvas</i> and add <i>ChartDecimation</i> when the point cloud is large enough that SVG mark count becomes the bottleneck.</p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScatterImport2Doc {}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'configuration-decimation-import-2-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Decimation downsamples large datasets before rendering. It is a controlled visual summary: you trade point-level detail for faster rendering and a readable high-level view. Add <i>ChartDecimation</i> when the chart has more points
                than the current view can usefully show, then choose a sample count and strategy that match the question the chart needs to answer. For broader large-data guidance, see <a href="/charts/reference/performance">Performance</a>.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DecimationImport2Doc {}

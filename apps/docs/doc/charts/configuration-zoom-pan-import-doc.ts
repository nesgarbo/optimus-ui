import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'configuration-zoom-pan-import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Zoom and pan are supported on Line, Bar, Scatter, and Candlestick charts. Add <i>ChartZoom</i> to enable wheel zoom, drag-to-select, and shift-pan; remove it and the chart is static. A reset button appears when the chart is zoomed.
                Add <i>ChartNavigator</i> alongside for a mini overview with a range selector.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZoomPanImportDoc {}

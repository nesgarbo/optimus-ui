import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { DEVICES } from './demo-data';

@Component({
    selector: 'rtl-doc',
    standalone: true,
    imports: [AppDocSectionText, ChartsModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                <i>dir="rtl"</i> flips the x pixel range rather than the data, so every position downstream follows from that one change: the categories run right to left, the tooltip places itself accordingly and the zoom direction reverses, without
                any of them special-casing direction.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 24rem">
                <p-chart-svg dir="rtl" locale="ar-EG">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="desktop" name="Desktop" [borderRadius]="4" />
                    <p-chart-x-axis />
                    <p-chart-y-axis position="right" />
                    <p-chart-tooltip />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class RtlDoc {
    data = DEVICES;
}

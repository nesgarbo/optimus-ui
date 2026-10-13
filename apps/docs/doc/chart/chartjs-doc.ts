import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'chartjs-doc',
    standalone: true,
    imports: [AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>To begin with, first you must install the charts.js package using npm and then include it in your project. An example with CLI would be;</p>
            <p>Since 3.0 Chart.js is loaded with a dynamic <i>import()</i> (a lazy chunk, not the main bundle), so the chart is drawn once it has loaded. The <i>chart</i> instance is <i>null</i> until then.</p>
        </app-docsectiontext>
        <app-code [hideToggleCode]="true"></app-code>
    `
})
export class ChartjsDoc {}

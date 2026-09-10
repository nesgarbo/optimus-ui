import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-radar-basic-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>categoryXField</i> to map spoke labels and <i>valueYField</i> to map the radial value for each axis.</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 460px">
                <p-chart-svg>
                    <p-chart-radar id="perf" [data]="data" categoryXField="metric" valueYField="value" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadarBasicDoc {
    readonly data = [
        { metric: 'Speed', value: 85 },
        { metric: 'Reliability', value: 92 },
        { metric: 'Usability', value: 78 },
        { metric: 'Security', value: 88 },
        { metric: 'Scalability', value: 72 },
        { metric: 'Documentation', value: 65 },
        { metric: 'Support', value: 80 }
    ];
}

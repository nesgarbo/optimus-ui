import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-radar-grid-shape-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>gridShape="circle"</i> on <i>ChartYAxis</i> to render smooth concentric circles instead of the default polygon grid. Circle grids produce a softer appearance. Use this when the polygon grid feels too technical.</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 460px">
                <p-chart-svg>
                    <p-chart-radar id="perf" [data]="data" categoryXField="metric" valueYField="value" [fillOpacity]="0.2" />
                    <p-chart-x-axis gridShape="circle" />
                    <p-chart-y-axis gridShape="circle" />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadarGridShapeDoc {
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

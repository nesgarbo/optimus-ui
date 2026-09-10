import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-polar-grid-shape-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>gridShape="polygon"</i> on <i>ChartYAxis</i> to render angular polygon grid lines instead of the default concentric circles. Polygon grids give a spider-web appearance, useful when the angular structure of the data warrants it.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div style="display: flex; justify-content: center">
                <p-chart-svg [width]="460" [height]="460">
                    <p-chart-polar [data]="data" categoryXField="direction" valueYField="speed" />
                    <p-chart-x-axis gridShape="polygon" />
                    <p-chart-y-axis gridShape="polygon" />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PolarGridShapeDoc {
    readonly data = [
        { direction: 'N', speed: 12 },
        { direction: 'NE', speed: 8 },
        { direction: 'E', speed: 15 },
        { direction: 'SE', speed: 20 },
        { direction: 'S', speed: 18 },
        { direction: 'SW', speed: 25 },
        { direction: 'W', speed: 22 },
        { direction: 'NW', speed: 10 }
    ];
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-sunburst-basic-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>p-chart-sunburst</i> draws a hierarchy as rings, the first generation innermost and each arc as wide as everything under it. Give it a flat list that names the parent of each node with <i>nodeId</i> and <i>parentField</i>. A node
                with children takes the sum of theirs. <i>maxDepth</i> stops at a generation, <i>innerRadius</i> sets the hole and <i>startAngle</i> and <i>sweepAngle</i> turn it into a half or a quarter.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-sunburst [data]="files" nodeId="id" parentField="parent" valueField="size" categoryField="name" />
                        <p-chart-tooltip />
                    </p-chart-svg>
                </div>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 24rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SunburstBasicDoc {
    readonly files = [
        { id: 'fs', name: 'Files', size: 0 },
        { id: 'img', name: 'Images', parent: 'fs', size: 0 },
        { id: 'png', name: 'PNG', parent: 'img', size: 400 },
        { id: 'jpg', name: 'JPEG', parent: 'img', size: 250 },
        { id: 'doc', name: 'Docs', parent: 'fs', size: 0 },
        { id: 'pdf', name: 'PDF', parent: 'doc', size: 300 },
        { id: 'txt', name: 'Text', parent: 'doc', size: 50 },
        { id: 'apps', name: 'Apps', size: 600 }
    ];
}

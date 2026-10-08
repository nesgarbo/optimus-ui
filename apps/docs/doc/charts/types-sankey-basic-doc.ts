import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-sankey-basic-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>p-chart-sankey</i> draws flows between nodes. Each datum is one flow with a <i>source</i>, a <i>target</i> and a <i>value</i> (rename them with <i>sourceField</i>, <i>targetField</i> and <i>valueField</i>). The nodes are the names
                that appear, in columns after the nodes that feed them, as tall as the flow through them. A flow that would loop back is left out. <i>linkColor</i> takes <i>source</i>, <i>target</i> or <i>gradient</i>, <i>nodeColors</i> colours nodes
                by name and <i>align</i> decides which column a node with no outflow goes to.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 420px">
                    <p-chart-svg>
                        <p-chart-sankey [data]="energy" [nodeColors]="{ Wind: '#16a34a', Coal: '#475569' }" />
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
export class SankeyBasicDoc {
    readonly energy = [
        { source: 'Coal', target: 'Power', value: 40 },
        { source: 'Gas', target: 'Power', value: 30 },
        { source: 'Wind', target: 'Power', value: 30 },
        { source: 'Power', target: 'Homes', value: 50 },
        { source: 'Power', target: 'Industry', value: 40 },
        { source: 'Power', target: 'Loss', value: 10 }
    ];
}

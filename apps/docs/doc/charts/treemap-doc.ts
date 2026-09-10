import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { PORTFOLIO } from './demo-data';

@Component({
    selector: 'treemap-doc',
    standalone: true,
    imports: [AppDocSectionText, ChartsModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                A treemap has no axes at all: position carries nothing and area carries the value, which makes the tiling algorithm the whole of the geometry. <i>squarify</i> is the default because a long thin rectangle and a square of the same area
                do not read as the same size — a treemap that does not squarify is hard to read as a treemap.
            </p>
            <p><i>nodeId</i> and <i>parentField</i> together turn a flat list into a hierarchy. Both are needed: inferring nesting from a shared label would be guessing.</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 24rem">
                <p-chart-svg>
                    <p-chart-treemap [data]="data" categoryField="label" valueField="revenue" nodeId="id" parentField="parent" [spacing]="3" [groupPadding]="4" />
                    <p-chart-tooltip />
                    <p-chart-hover />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class TreemapDoc {
    data = PORTFOLIO;
}

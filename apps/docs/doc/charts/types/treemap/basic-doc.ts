import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-treemap-basic-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>categoryField</i> and <i>valueField</i> to map data fields. Cell area scales proportionally to each value.</p>
        </app-docsectiontext>
        <div class="card">
            <div style="height: 460px">
                <p-chart-svg>
                    <p-chart-treemap [data]="data" categoryField="name" valueField="population" />
                </p-chart-svg>
            </div>
        </div>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreemapBasicDoc {
    readonly data = [
        { name: 'Asia', population: 4700 },
        { name: 'Africa', population: 1400 },
        { name: 'Europe', population: 750 },
        { name: 'N. America', population: 580 },
        { name: 'S. America', population: 430 },
        { name: 'Oceania', population: 45 }
    ];
}

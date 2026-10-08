import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-funnel-basic-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>p-chart-funnel</i> sizes each slice by its value, widest first. <i>p-chart-pyramid</i> takes the same inputs and points the other way. <i>mode</i> is <i>height</i> (the default: each slice is as tall as its share) or
                <i>surface</i> (each slice has the area of its share, which is how a true pyramid reads). <i>neckWidth</i> and <i>neckHeight</i> set the straight part of a funnel, <i>gap</i> the space between slices and <i>sort</i> orders them.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card grid grid-cols-12 gap-4">
                <div class="col-span-12 md:col-span-6" style="height: 360px">
                    <p-chart-svg>
                        <p-chart-funnel [data]="stages" categoryField="stage" valueField="people" />
                        <p-chart-legend />
                        <p-chart-tooltip />
                    </p-chart-svg>
                </div>
                <div class="col-span-12 md:col-span-6" style="height: 360px">
                    <p-chart-svg>
                        <p-chart-pyramid [data]="ages" categoryField="band" valueField="people" mode="surface" />
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
export class FunnelBasicDoc {
    readonly stages = [
        { stage: 'Visits', people: 5000 },
        { stage: 'Sign-ups', people: 1800 },
        { stage: 'Trials', people: 900 },
        { stage: 'Customers', people: 300 }
    ];

    readonly ages = [
        { band: '65+', people: 12 },
        { band: '45-64', people: 28 },
        { band: '25-44', people: 36 },
        { band: '0-24', people: 24 }
    ];
}

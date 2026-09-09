import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { DEVICES } from './demo-data';

@Component({
    selector: 'canvas-doc',
    standalone: true,
    imports: [AppDocSectionText, ChartsModule, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Swap the root and keep the children. <i>p-chart-canvas</i> takes the same inputs as <i>p-chart-svg</i> and accepts the same series, axes and features, because the children never draw anything themselves — they register what they are
                and the root paints them. Both roots paint the same computed scene, so the geometry is identical by construction rather than by careful duplication.
            </p>
            <p>
                SVG is the right default: every mark is a real element, so CSS can reach it, a screen reader can walk it and print keeps its vector resolution. Canvas is the trade you make past a few thousand marks or for streaming updates, and it
                gives up all three — which is what <i>p-chart-accessibility</i> exists to put back.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div class="flex flex-col gap-4">
                <div style="height: 18rem">
                    <p-chart-svg>
                        <p-chart-bar [data]="data" categoryXField="month" valueYField="desktop" name="Desktop" [borderRadius]="4" />
                        <p-chart-bar [data]="data" categoryXField="month" valueYField="mobile" name="Mobile" [borderRadius]="4" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                        <p-chart-legend />
                    </p-chart-svg>
                </div>
                <div style="height: 18rem">
                    <p-chart-canvas>
                        <p-chart-bar [data]="data" categoryXField="month" valueYField="desktop" name="Desktop" [borderRadius]="4" />
                        <p-chart-bar [data]="data" categoryXField="month" valueYField="mobile" name="Mobile" [borderRadius]="4" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                        <p-chart-legend />
                    </p-chart-canvas>
                </div>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class CanvasDoc {
    data = DEVICES;
}

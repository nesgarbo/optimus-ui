import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

function seededRandom(seed: number) {
    let t = seed + 0x6d2b79f5;

    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function priceSeries(n: number) {
    let price = 150;

    return Array.from({ length: n }, (_, i) => {
        const date = new Date(2025, 0, 1);

        date.setDate(date.getDate() + i);
        price += (seededRandom(i) - 0.48) * 4;

        return { timestamp: date.getTime(), price: Math.round(price * 100) / 100 };
    });
}

@Component({
    selector: 'configuration-zoom-pan-wheel-zoom-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Wheel zoom is enabled by default, and it asks for the Ctrl key (a trackpad pinch sets it too) so that the page can still scroll when the pointer crosses the chart. Set <i>wheel</i> to <i>false</i> to disable it, to <i>true</i> to zoom
                on a bare wheel, or pass a <i>ZoomWheelConfig</i> object to customize the speed and the modifier key.
            </p>
            <p>Before 3.0 the default of <i>wheel</i> was <i>true</i>, so a bare wheel zoomed the chart. Pass <i>[wheel]="true"</i> to keep that.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-line [data]="data" categoryXField="timestamp" valueYField="price" color="#5daeea" curve="smooth" />
                        <p-chart-x-axis type="time" />
                        <p-chart-y-axis label="Price ($)" [startFromZero]="false" />
                        <p-chart-zoom mode="x" [wheel]="{ enabled: true, speed: 0.1 }" [drag]="false" />
                    </p-chart-svg>
                </div>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZoomPanWheelZoomDoc {
    readonly data = priceSeries(90);
}

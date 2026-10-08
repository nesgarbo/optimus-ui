import { Component, signal } from '@angular/core';
import { LinearGauge } from '@openng/optimus-ui/gauges';
import type { LinearAxis } from '@openng/optimus-ui/types/gauges';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'linear-doc',
    standalone: true,
    imports: [LinearGauge, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>orientation</i> lays the scale across or up. <i>container</i> frames the pointers as <i>normal</i>, <i>roundedRectangle</i> or <i>thermometer</i>. A pointer is a <i>bar</i> that fills, or a <i>marker</i> that moves, and
                <i>placement</i> puts it <i>near</i> the axis, in the <i>center</i> or <i>far</i>. <i>opposedPosition</i> moves the labels to the other side and <i>isInversed</i> reverses the scale. A range's <i>position</i> is <i>inside</i>,
                <i>outside</i> or <i>cross</i>.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-wrap items-end justify-center gap-8">
            <p-linearGauge
                style="width: 360px"
                title="Battery"
                [value]="battery()"
                [container]="{ type: 'roundedRectangle' }"
                format="{value}%"
                [ranges]="[
                    { start: 0, end: 20, color: '#ef4444' },
                    { start: 20, end: 100, color: '#22c55e', position: 'outside', startWidth: 4, endWidth: 4 }
                ]"
            />
            <p-linearGauge style="width: 90px" orientation="vertical" title="Thermometer" [value]="21" [minimum]="-10" [maximum]="40" [container]="{ type: 'thermometer', width: 14 }" format="{value}°" />
            <p-linearGauge style="width: 100px" orientation="vertical" title="Marker" [axes]="markerAxis" />
        </div>
        <app-code></app-code>
    `
})
export class LinearDoc {
    battery = signal(64);

    markerAxis: LinearAxis[] = [{ minimum: 0, maximum: 10, majorTicks: { interval: 2 }, opposedPosition: true, pointers: [{ value: 7, type: 'marker', markerShape: 'triangle', width: 12, height: 14, color: '#7c8cff' }] }];
}

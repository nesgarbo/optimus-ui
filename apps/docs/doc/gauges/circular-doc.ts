import { Component, signal } from '@angular/core';
import { CircularGauge } from '@openng/optimus-ui/gauges';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'circular-doc',
    standalone: true,
    imports: [CircularGauge, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                A gauge with one needle needs no <i>axes</i>: <i>value</i>, <i>minimum</i>, <i>maximum</i>, <i>startAngle</i>, <i>endAngle</i> and <i>ranges</i> describe it. Angles are degrees clockwise from twelve o'clock, and a gauge whose start
                and end are equal is a full circle. The needle animates to every new value, unless <i>animate</i> is off or the user asks their system for less motion. <i>format</i> writes the labels, for example <i>{{ '{value}' }}%</i>.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-wrap justify-center gap-8">
            <p-circulargauge
                style="width: 260px"
                title="Speed"
                [value]="speed()"
                [minimum]="0"
                [maximum]="200"
                format="{value}"
                [ranges]="[
                    { start: 0, end: 120, color: '#22c55e' },
                    { start: 120, end: 170, color: '#f59e0b' },
                    { start: 170, end: 200, color: '#ef4444' }
                ]"
                annotation="km/h"
            />
            <p-circulargauge style="width: 260px" title="Half dial" [value]="40" [startAngle]="-90" [endAngle]="90" format="{value}%" aria-label="Completion" />
            <p-circulargauge style="width: 220px" title="Full circle" [value]="75" [startAngle]="0" [endAngle]="0" pointerType="rangeBar" format="{value}%" />
        </div>
        <app-code></app-code>
    `
})
export class CircularDoc {
    speed = signal(132);
}

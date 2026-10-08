import { DecimalPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { CircularGauge, LinearGauge } from '@openng/optimus-ui/gauges';
import type { GaugePointerEvent } from '@openng/optimus-ui/types/gauges';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'interactive-doc',
    standalone: true,
    imports: [CircularGauge, LinearGauge, DecimalPipe, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>enablePointerDrag</i> lets the user drag a pointer, and turns the gauge into a slider for the keyboard and for assistive technology: the arrows move by 1%, Page Up and Page Down by 10%, Home and End go to the ends.
                <i>[(value)]</i> keeps the simple form in step, <i>pointerChange</i> reports every change with a <i>dragging</i> flag, and <i>setPointerValue(axisIndex, pointerIndex, value)</i> sets a pointer from code.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-wrap items-center justify-center gap-8">
            <p-circulargauge
                style="width: 260px"
                [(value)]="volume"
                [enablePointerDrag]="true"
                aria-label="Volume"
                format="{value}"
                [ranges]="[
                    { start: 0, end: 70, color: '#22c55e' },
                    { start: 70, end: 100, color: '#ef4444' }
                ]"
                (pointerChange)="last.set($event)"
            />
            <p-linearGauge style="width: 320px" [(value)]="brightness" [enablePointerDrag]="true" aria-label="Brightness" [container]="{ type: 'roundedRectangle' }" />
            <p class="text-sm">Volume {{ volume() | number: '1.0-0' }}, brightness {{ brightness() | number: '1.0-0' }}<br />Last: {{ last()?.value | number: '1.0-0' }} {{ last()?.dragging ? '(dragging)' : '' }}</p>
        </div>
        <app-code></app-code>
    `
})
export class InteractiveDoc {
    volume = signal(40);

    brightness = signal(70);

    last = signal<GaugePointerEvent | null>(null);
}

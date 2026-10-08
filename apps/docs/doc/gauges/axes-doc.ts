import { Component } from '@angular/core';
import { CircularGauge } from '@openng/optimus-ui/gauges';
import type { CircularAxis } from '@openng/optimus-ui/types/gauges';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'axes-doc',
    standalone: true,
    imports: [CircularGauge, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>axes</i> is Syncfusion's model. An axis has its own scale, <i>majorTicks</i>, <i>minorTicks</i>, <i>labelStyle</i> (with <i>position</i>, <i>format</i> and <i>useRangeColor</i>), <i>ranges</i> (which can taper with
                <i>startWidth</i> and <i>endWidth</i>), <i>pointers</i> and <i>annotations</i>. A pointer is a <i>needle</i> (with a <i>cap</i> and a <i>needleTail</i>), a <i>marker</i> (<i>circle</i>, <i>rectangle</i>, <i>triangle</i>,
                <i>diamond</i> or <i>invertedTriangle</i>) or a <i>rangeBar</i>. An annotation is text or a template, placed by <i>angle</i> and <i>radius</i>.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-wrap justify-center gap-8">
            <p-circulargauge style="width: 300px" title="Temperature" [axes]="temperature" />
            <p-circulargauge style="width: 300px" title="Two scales" [axes]="two" />
        </div>
        <app-code></app-code>
    `
})
export class AxesDoc {
    temperature: CircularAxis[] = [
        {
            minimum: -20,
            maximum: 60,
            startAngle: 210,
            endAngle: 150,
            majorTicks: { interval: 20 },
            minorTicks: { interval: 5 },
            labelStyle: { format: '{value}°', useRangeColor: true, position: 'outside' },
            ranges: [
                { start: -20, end: 10, color: '#3b82f6', startWidth: 4, endWidth: 10 },
                { start: 10, end: 35, color: '#22c55e', startWidth: 10, endWidth: 10 },
                { start: 35, end: 60, color: '#ef4444', startWidth: 10, endWidth: 16 }
            ],
            pointers: [{ value: 28, type: 'needle', cap: { radius: 8, border: { color: '#fff', width: 2 } }, needleTail: { length: '18%' } }],
            annotations: [{ content: '28°C', angle: 180, radius: '45%' }]
        }
    ];

    two: CircularAxis[] = [
        {
            minimum: 0,
            maximum: 100,
            radius: '80%',
            startAngle: 220,
            endAngle: 140,
            majorTicks: { interval: 25 },
            pointers: [
                { value: 60, type: 'needle' },
                { value: 85, type: 'marker', markerShape: 'diamond', color: '#ef4444' }
            ]
        },
        { minimum: 0, maximum: 100, radius: '50%', startAngle: 220, endAngle: 140, labelStyle: { hidden: true }, majorTicks: { height: 0, width: 0 }, pointers: [{ value: 35, type: 'rangeBar', pointerWidth: 8, color: '#7c8cff' }] }
    ];
}

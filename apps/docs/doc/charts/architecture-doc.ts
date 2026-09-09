import { Code } from '@/domain/code';
import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'architecture-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                The root is <i>p-chart-svg</i> or <i>p-chart-canvas</i>. It owns the layout, the scales, the animation loop and the theme. Everything else is a child that registers what it is: series, axes, legends, tooltips. The component
                <i>is</i> the configuration — adding <i>p-chart-legend</i> renders a legend and reserves space for it, and removing the element removes both.
            </p>
            <p>The block below lists the parts that apply to any chart rather than to a single family. A real chart uses only the subset its data calls for.</p>
        </app-docsectiontext>
        <app-code [code]="code" [hideToggleCode]="true"></app-code>
        <app-docsectiontext>
            <p>
                Children never draw anything themselves. That is what makes swapping the root a swap rather than a rewrite: the same series and axes work under either one, and both roots paint the same computed scene, so an SVG chart and a Canvas
                chart of the same data are geometrically identical rather than merely similar.
            </p>
            <p>When inputs change, the root waits until the end of the tick and batches everything into one layout and one paint. Updating five series at once still costs one frame.</p>
        </app-docsectiontext>
    `
})
export class ArchitectureDoc {
    code: Code = {
        html: `<!-- Use <p-chart-canvas> to render on canvas. -->
<p-chart-svg>
    <!-- Use <p-chart-line>, <p-chart-bar> to render a different chart. -->
    <p-chart-bar [data]="data" categoryXField="category" valueYField="value" />
    <p-chart-x-axis />
    <p-chart-y-axis />
    <p-chart-legend />
    <p-chart-tooltip />
    <p-chart-hover />
</p-chart-svg>`
    };
}

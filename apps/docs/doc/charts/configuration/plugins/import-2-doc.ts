import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'configuration-plugins-import-2-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Plugins extend a chart from the outside without forking it. Pass them via the <i>plugins</i> input on <i>ChartSvg</i> or <i>ChartCanvas</i>. Each entry is a plugin (from <i>defineChartPlugin</i>) or a <i>[plugin, options]</i> tuple.
                Plugins that take configuration are usually written as a function returning <i>defineChartPlugin(...)</i>, so the options are type checked at the call site. A plugin can read chart state, subscribe to render frames and hover, paint an
                overlay above the chart, and expose a public API on the chart's <i>$plugins</i> getter. The chart's own rendering is untouched.
            </p>
            <p>The <i>plugins</i> input is read once when the chart mounts. Reassigning the array or changing a plugin's options afterward has no effect until the chart is destroyed and recreated.</p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PluginsImport2Doc {}

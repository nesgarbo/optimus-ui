import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { PluginsImport2Doc } from '@/doc/charts/configuration/plugins/import-2-doc';
import { PluginsDefiningAPluginDoc } from '@/doc/charts/configuration/plugins/defining-a-plugin-doc';
import { PluginsPluginOptionsDoc } from '@/doc/charts/configuration/plugins/plugin-options-doc';
import { PluginsWatermarkDoc } from '@/doc/charts/configuration/plugins/watermark-doc';
import { PluginsLiveStatsDoc } from '@/doc/charts/configuration/plugins/live-stats-doc';
import { PluginsTrendlineDoc } from '@/doc/charts/configuration/plugins/trendline-doc';
import { PluginsThresholdBandsDoc } from '@/doc/charts/configuration/plugins/threshold-bands-doc';
import { PluginsEventAnnotationsDoc } from '@/doc/charts/configuration/plugins/event-annotations-doc';
import { PluginsSecurityDoc } from '@/doc/charts/configuration/plugins/security-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Plugins - Optimus UI"
        header="Plugins"
        description="Extend charts from the outside with the plugins input: read chart state, subscribe to frames and hover, and paint overlays. Includes watermark, live stats, trendline, threshold bands, and event annotations."
        [docs]="docs"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsConfigurationPluginsDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: PluginsImport2Doc
        },
        {
            id: 'defining-a-plugin',
            label: 'Defining a plugin',
            component: PluginsDefiningAPluginDoc
        },
        {
            id: 'plugin-options',
            label: 'Plugin options',
            component: PluginsPluginOptionsDoc
        },
        {
            id: 'watermark',
            label: 'Watermark',
            component: PluginsWatermarkDoc
        },
        {
            id: 'live-stats',
            label: 'Live Stats',
            component: PluginsLiveStatsDoc
        },
        {
            id: 'trendline',
            label: 'Trendline',
            component: PluginsTrendlineDoc
        },
        {
            id: 'threshold-bands',
            label: 'Threshold Bands',
            component: PluginsThresholdBandsDoc
        },
        {
            id: 'event-annotations',
            label: 'Event Annotations',
            component: PluginsEventAnnotationsDoc
        },
        {
            id: 'security',
            label: 'Security',
            component: PluginsSecurityDoc
        }
    ];
}

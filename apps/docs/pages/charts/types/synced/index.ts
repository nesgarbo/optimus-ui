import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { SyncedImport2Doc } from '@/doc/charts/types/synced/import-2-doc';
import { SyncedCrosshairSyncDoc } from '@/doc/charts/types/synced/crosshair-sync-doc';
import { SyncedSharedLegendDoc } from '@/doc/charts/types/synced/shared-legend-doc';
import { SyncedSyncedZoomDoc } from '@/doc/charts/types/synced/synced-zoom-doc';
import { SyncedDashboardDoc } from '@/doc/charts/types/synced/dashboard-doc';
import { SyncedFullSyncDoc } from '@/doc/charts/types/synced/full-sync-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Synced Charts - Optimus UI"
        header="Synced Charts"
        description="Coordinate multiple independent charts with synchronized crosshairs, zoom ranges, and legend visibility using ChartGroup."
        [docs]="docs"
        [apiDocs]="['ChartGroup']"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsTypesSyncedDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: SyncedImport2Doc
        },
        {
            id: 'crosshair-sync',
            label: 'Crosshair Sync',
            component: SyncedCrosshairSyncDoc
        },
        {
            id: 'shared-legend',
            label: 'Shared Legend',
            component: SyncedSharedLegendDoc
        },
        {
            id: 'synced-zoom',
            label: 'Synced Zoom',
            component: SyncedSyncedZoomDoc
        },
        {
            id: 'dashboard',
            label: 'Dashboard',
            component: SyncedDashboardDoc
        },
        {
            id: 'full-sync',
            label: 'Full Sync',
            component: SyncedFullSyncDoc
        }
    ];
}

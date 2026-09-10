import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { ZoomPanImport2Doc } from '@/doc/charts/configuration/zoom-pan/import-2-doc';
import { ZoomPanBasicDoc } from '@/doc/charts/configuration/zoom-pan/basic-doc';
import { ZoomPanZoomModeDoc } from '@/doc/charts/configuration/zoom-pan/zoom-mode-doc';
import { ZoomPanWheelZoomDoc } from '@/doc/charts/configuration/zoom-pan/wheel-zoom-doc';
import { ZoomPanDragToZoomDoc } from '@/doc/charts/configuration/zoom-pan/drag-to-zoom-doc';
import { ZoomPanPanDoc } from '@/doc/charts/configuration/zoom-pan/pan-doc';
import { ZoomPanZoomAndPanButtonsDoc } from '@/doc/charts/configuration/zoom-pan/zoom-and-pan-buttons-doc';
import { ZoomPanTouchPinchDoc } from '@/doc/charts/configuration/zoom-pan/touch-pinch-doc';
import { ZoomPanZoomLimitsDoc } from '@/doc/charts/configuration/zoom-pan/zoom-limits-doc';
import { ZoomPanZoomChangeEventDoc } from '@/doc/charts/configuration/zoom-pan/zoom-change-event-doc';
import { ZoomPanProgrammaticControlDoc } from '@/doc/charts/configuration/zoom-pan/programmatic-control-doc';
import { ZoomPanNavigatorDoc } from '@/doc/charts/configuration/zoom-pan/navigator-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Zoom & Pan - Optimus UI"
        header="Zoom & Pan"
        description="Add interactive zoom and pan to cartesian charts with mouse wheel, drag-to-select, shift-pan, touch pinch, and programmatic control."
        [docs]="docs"
        [apiDocs]="['ChartZoom']"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsConfigurationZoomPanDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: ZoomPanImport2Doc
        },
        {
            id: 'basic',
            label: 'Basic',
            component: ZoomPanBasicDoc
        },
        {
            id: 'zoom-mode',
            label: 'Zoom Mode',
            component: ZoomPanZoomModeDoc
        },
        {
            id: 'wheel-zoom',
            label: 'Wheel Zoom',
            component: ZoomPanWheelZoomDoc
        },
        {
            id: 'drag-to-zoom',
            label: 'Drag to Zoom',
            component: ZoomPanDragToZoomDoc
        },
        {
            id: 'pan',
            label: 'Pan',
            component: ZoomPanPanDoc
        },
        {
            id: 'zoom-and-pan-buttons',
            label: 'Zoom and Pan Buttons',
            component: ZoomPanZoomAndPanButtonsDoc
        },
        {
            id: 'touch-pinch',
            label: 'Touch Pinch',
            component: ZoomPanTouchPinchDoc
        },
        {
            id: 'zoom-limits',
            label: 'Zoom Limits',
            component: ZoomPanZoomLimitsDoc
        },
        {
            id: 'zoom-change-event',
            label: 'Zoom Change Event',
            component: ZoomPanZoomChangeEventDoc
        },
        {
            id: 'programmatic-control',
            label: 'Programmatic Control',
            component: ZoomPanProgrammaticControlDoc
        },
        {
            id: 'navigator',
            label: 'Navigator',
            component: ZoomPanNavigatorDoc
        }
    ];
}

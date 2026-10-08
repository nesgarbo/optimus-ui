import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { AccessibilityDoc } from '@/doc/gauges/accessibility-doc';
import { AxesDoc } from '@/doc/gauges/axes-doc';
import { CircularDoc } from '@/doc/gauges/circular-doc';
import { ImportDoc } from '@/doc/gauges/import-doc';
import { InteractiveDoc } from '@/doc/gauges/interactive-doc';
import { LinearDoc } from '@/doc/gauges/linear-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Gauge Components - Optimus UI"
        header="Gauges"
        description="CircularGauge and LinearGauge show a value on a dial or a scale, with colored ranges, needles, markers and bars, animation, dragging and keyboard control."
        [docs]="docs"
        [apiDocs]="['CircularGauge', 'LinearGauge']"
        themeDocs="gauge"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class GaugesDemo {
    docs = [
        { id: 'import', label: 'Import', component: ImportDoc },
        { id: 'circular', label: 'Circular', component: CircularDoc },
        { id: 'axes', label: 'Axes, Pointers and Ranges', component: AxesDoc },
        { id: 'linear', label: 'Linear', component: LinearDoc },
        { id: 'interactive', label: 'Dragging and Forms', component: InteractiveDoc },
        { id: 'accessibility', label: 'Accessibility', component: AccessibilityDoc }
    ];
}

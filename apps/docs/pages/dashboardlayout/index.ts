import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { BasicDoc } from '@/doc/dashboardlayout/basic-doc';
import { LabelsDoc } from '@/doc/dashboardlayout/labels-doc';
import { ImportDoc } from '@/doc/dashboardlayout/import-doc';
import { MethodsDoc } from '@/doc/dashboardlayout/methods-doc';
import { ResizeDoc } from '@/doc/dashboardlayout/resize-doc';
import { ResponsiveDoc } from '@/doc/dashboardlayout/responsive-doc';

@Component({
    template: `<app-doc
        docTitle="Angular DashboardLayout Component - Optimus UI"
        header="DashboardLayout"
        description="DashboardLayout arranges panels on a grid that the user can rearrange and resize, with pointer and keyboard, floating panels and a one-column layout for narrow screens."
        [docs]="docs"
        [apiDocs]="['DashboardLayout']"
        themeDocs="dashboardlayout"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class DashboardLayoutDemo {
    docs = [
        { id: 'import', label: 'Import', component: ImportDoc },
        { id: 'basic', label: 'Basic', component: BasicDoc },
        { id: 'resize', label: 'Resizing', component: ResizeDoc },
        { id: 'methods', label: 'Adding, Removing and Saving', component: MethodsDoc },
        { id: 'responsive', label: 'Responsive', component: ResponsiveDoc },
        { id: 'labels', label: 'Labels and Announcements', component: LabelsDoc }
    ];
}

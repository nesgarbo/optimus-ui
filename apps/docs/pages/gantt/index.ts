import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { AccessibilityDoc } from '@/doc/gantt/accessibility-doc';
import { BasicDoc } from '@/doc/gantt/basic-doc';
import { CellsDoc } from '@/doc/gantt/cells-doc';
import { CalendarDoc } from '@/doc/gantt/calendar-doc';
import { DependenciesDoc } from '@/doc/gantt/dependencies-doc';
import { EditingDoc } from '@/doc/gantt/editing-doc';
import { ExportDoc } from '@/doc/gantt/export-doc';
import { HoursDoc } from '@/doc/gantt/hours-doc';
import { MessagesDoc } from '@/doc/gantt/messages-doc';
import { ImportDoc } from '@/doc/gantt/import-doc';
import { PlanningDoc } from '@/doc/gantt/planning-doc';
import { TimelineDoc } from '@/doc/gantt/timeline-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Gantt Component - Optimus UI"
        header="Gantt"
        description="Gantt plans tasks on a timeline: a grid of tasks beside a chart of bars, with dependencies, a working calendar, a critical path, and editing by pointer and keyboard."
        [docs]="docs"
        [apiDocs]="['Gantt']"
        themeDocs="gantt"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class GanttDemo {
    docs = [
        { id: 'import', label: 'Import', component: ImportDoc },
        { id: 'basic', label: 'Basic', component: BasicDoc },
        { id: 'dependencies', label: 'Dependencies and Critical Path', component: DependenciesDoc },
        { id: 'calendar', label: 'Working Calendar', component: CalendarDoc },
        { id: 'timeline', label: 'Timeline and Zoom', component: TimelineDoc },
        { id: 'editing', label: 'Editing Bars and Tasks', component: EditingDoc },
        { id: 'cells', label: 'Editing Cells and the Dialog', component: CellsDoc },
        { id: 'planning', label: 'Baseline and Resources', component: PlanningDoc },
        { id: 'hours', label: 'Hours and Minutes', component: HoursDoc },
        { id: 'export', label: 'Export', component: ExportDoc },
        { id: 'messages', label: 'Translating the Text', component: MessagesDoc },
        { id: 'accessibility', label: 'Accessibility', component: AccessibilityDoc }
    ];
}

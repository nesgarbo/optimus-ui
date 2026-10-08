import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Code } from '@/domain/code';

@Component({
    selector: 'messages-doc',
    standalone: true,
    imports: [AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                The texts of the grid, the dialog and the live region are in English. <i>messages</i> takes a partial <i>GanttMessages</i> and replaces only the keys it names; the rest keep the default. A text with <i>&#123;name&#125;</i>,
                <i>&#123;start&#125;</i>, <i>&#123;end&#125;</i>, <i>&#123;value&#125;</i> or <i>&#123;unit&#125;</i> gets them filled in. The names of the default columns come from <i>name</i>, <i>start</i>, <i>duration</i> and <i>progress</i>, and
                the labels of the dialog from <i>notes</i>, <i>resources</i>, <i>predecessors</i>, <i>save</i>, <i>cancel</i> and <i>delete</i>.
            </p>
        </app-docsectiontext>
        <app-code [code]="code" [hideToggleCode]="true" [hideCodeSandbox]="true" [hideStackBlitz]="true"></app-code>
    `
})
export class MessagesDoc {
    code: Code = {
        html: `<p-gantt
    [(dataSource)]="data"
    [taskFields]="fields"
    [messages]="{
        tasks: 'Tareas',
        expand: 'Expandir {name}',
        collapse: 'Contraer {name}',
        rowSummary: 'De {start} a {end}, {value}% completado',
        milestone: 'hito',
        critical: 'crítica',
        save: 'Guardar',
        cancel: 'Cancelar',
        delete: 'Eliminar'
    }"
/>`,
        typescript: `import { Component, signal } from '@angular/core';
import { Gantt } from '@openng/optimus-ui/gantt';
import type { GanttTaskFields } from '@openng/optimus-ui/types/gantt';

@Component({
    selector: 'gantt-messages-demo',
    templateUrl: './gantt-messages-demo.html',
    standalone: true,
    imports: [Gantt]
})
export class GanttMessagesDemo {
    fields: GanttTaskFields = { id: 'id', name: 'name', startDate: 'start', duration: 'days', progress: 'done' };

    data = signal<any[]>([{ id: 1, name: 'Diseño', start: '2026-10-05', days: 5, done: 40 }]);
}`
    };
}

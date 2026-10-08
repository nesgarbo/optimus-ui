import { Component } from '@angular/core';
import { Mention } from '@openng/optimus-ui/mention';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'editable-doc',
    standalone: true,
    imports: [Mention, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                A <i>contenteditable</i> element gets a chip, a non-editable <i>span</i> carrying the value in <i>data-mention</i>, in place of plain text. <i>target</i> points at a field that is not inside the component, and the
                <i>#display</i> template draws the chip.
            </p>
        </app-docsectiontext>
        <div class="card">
            <div id="mention-editor" contenteditable="true" class="p-inputtext" style="min-height: 5rem" aria-label="Comment"></div>
            <p-mention [dataSource]="people" [fields]="{ text: 'name', value: 'id' }" target="#mention-editor">
                <ng-template #display let-text="text"><i class="pi pi-at"></i> {{ text }}</ng-template>
            </p-mention>
        </div>
        <app-code></app-code>
    `
})
export class EditableDoc {
    people = [
        { id: 1, name: 'Ada' },
        { id: 2, name: 'Alan' },
        { id: 3, name: 'Grace' }
    ];
}

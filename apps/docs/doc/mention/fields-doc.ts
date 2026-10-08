import { Component } from '@angular/core';
import { Mention } from '@openng/optimus-ui/mention';
import { Textarea } from '@openng/optimus-ui/textarea';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'fields-doc',
    standalone: true,
    imports: [Mention, Textarea, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>fields</i> says where the <i>text</i>, <i>value</i>, <i>iconCss</i>, <i>groupBy</i> and <i>disabled</i> flag of an object live. <i>searchPattern</i> picks <i>startsWith</i>, <i>contains</i> or <i>endsWith</i>,
                <i>suggestionCount</i> trims the list, and <i>allowSpaces</i> lets a name of several words be typed. The <i>#item</i>, <i>#header</i> and <i>#noRecords</i> templates replace parts of the list.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-mention [dataSource]="people" [fields]="fields" searchPattern="contains" [allowSpaces]="true" [showMentionChar]="true" [suggestionCount]="6">
                <textarea pTextarea rows="3" class="w-full" placeholder="Type @ and part of a name"></textarea>
                <ng-template #item let-person let-text="text">
                    <i [class]="person.icon"></i>
                    <strong>{{ text }}</strong>
                    <small class="ml-2 opacity-70">{{ person.role }}</small>
                </ng-template>
                <ng-template #header><small>People</small></ng-template>
                <ng-template #noRecords><em>Nobody by that name</em></ng-template>
            </p-mention>
        </div>
        <app-code></app-code>
    `
})
export class FieldsDoc {
    fields = { text: 'name', value: 'id', groupBy: 'team', disabled: 'away' };

    people = [
        { id: 1, name: 'Ada Lovelace', role: 'Engineering', team: 'Core', icon: 'pi pi-user' },
        { id: 2, name: 'Alan Turing', role: 'Research', team: 'Core', icon: 'pi pi-user' },
        { id: 3, name: 'Grace Hopper', role: 'Compilers', team: 'Tools', icon: 'pi pi-user' },
        { id: 4, name: 'Linus Torvalds', role: 'Kernel', team: 'Tools', icon: 'pi pi-user', away: true }
    ];
}

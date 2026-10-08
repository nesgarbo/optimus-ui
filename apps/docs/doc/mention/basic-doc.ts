import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Mention } from '@openng/optimus-ui/mention';
import { Textarea } from '@openng/optimus-ui/textarea';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'basic-doc',
    standalone: true,
    imports: [Mention, Textarea, FormsModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                Put the field inside <i>p-mention</i> and type <i>&#64;</i>. <i>dataSource</i> takes strings or objects, and the list answers the arrow keys, Enter, Tab and Escape. The text field keeps working with <i>ngModel</i>,
                <i>formControl</i> and <i>[formField]</i>, because the pick is written as an ordinary <i>input</i> event. <i>showMentionChar</i> writes the trigger in front of the pick, and <i>requireLeadingSpace</i> keeps an e-mail address from
                opening the list.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-mention [dataSource]="people" [showMentionChar]="true">
                <textarea pTextarea rows="4" class="w-full" placeholder="Type @ to mention someone" [(ngModel)]="text"></textarea>
            </p-mention>
            <p class="mt-4 text-sm">{{ text }}</p>
        </div>
        <app-code></app-code>
    `
})
export class BasicDoc {
    people = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Linus Torvalds', 'Margaret Hamilton'];

    text = '';
}

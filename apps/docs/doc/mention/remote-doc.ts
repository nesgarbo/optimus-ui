import { Component } from '@angular/core';
import { Mention } from '@openng/optimus-ui/mention';
import type { MentionFilteringEvent } from '@openng/optimus-ui/types/mention';
import { Textarea } from '@openng/optimus-ui/textarea';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'remote-doc',
    standalone: true,
    imports: [Mention, Textarea, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>filtering</i> fires as the text after the trigger changes. Set <i>cancel</i> and call <i>updateData</i> with the answer of a server, and the built-in filter steps aside. A later answer replaces an earlier one, so answer only for
                the text the event carries.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-mention [dataSource]="[]" (filtering)="search($event)" [minLength]="1">
                <textarea pTextarea rows="3" class="w-full" placeholder="Type @ and one letter"></textarea>
            </p-mention>
        </div>
        <app-code></app-code>
    `
})
export class RemoteDoc {
    private readonly directory = ['Ada', 'Alan', 'Alonzo', 'Barbara', 'Grace', 'Tim'];

    search(event: MentionFilteringEvent) {
        event.cancel = true;

        // Stands in for an HTTP call.
        setTimeout(() => event.updateData(this.directory.filter((n) => n.toLowerCase().startsWith(event.text.toLowerCase()))), 200);
    }
}

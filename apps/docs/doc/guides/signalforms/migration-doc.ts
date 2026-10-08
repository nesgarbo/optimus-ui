import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Code } from '@/domain/code';
import { Component } from '@angular/core';

@Component({
    selector: 'migration-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                The signal forms release has one breaking change. <i>p-autocomplete</i> no longer has the <i>minLength</i> input, deprecated since v20. A signal form binds <i>minLength</i> to the string length of the field, so the component uses
                <i>minQueryLength</i> for the minimum query.
            </p>
            <p><i>ng update</i> runs a migration that renames the attribute in templates and inline templates. Rename by hand a <i>minLength</i> property read from an AutoComplete instance, for example through <i>viewChild</i>.</p>
        </app-docsectiontext>
        <app-code [code]="code" [hideToggleCode]="true"></app-code>
    `
})
export class MigrationDoc {
    code: Code = {
        html: `<!-- Before -->
<p-autocomplete [(ngModel)]="city" [minLength]="3" [suggestions]="items" />

<!-- After -->
<p-autocomplete [(ngModel)]="city" [minQueryLength]="3" [suggestions]="items" />`
    };
}

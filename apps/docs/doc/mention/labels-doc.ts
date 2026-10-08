import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Code } from '@/domain/code';

@Component({
    selector: 'labels-doc',
    standalone: true,
    imports: [AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>suggestionsLabel</i> is the accessible name of the list of suggestions when there is no <i>aria-label</i> (<i>Suggestions</i>), and <i>noRecordsText</i> is what the list shows when nothing matches (<i>No records found</i>). Set
                both to translate them.
            </p>
        </app-docsectiontext>
        <app-code [code]="code" [hideToggleCode]="true" [hideCodeSandbox]="true" [hideStackBlitz]="true"></app-code>
    `
})
export class LabelsDoc {
    code: Code = {
        html: `<p-mention [dataSource]="people" suggestionsLabel="Sugerencias" noRecordsText="Sin resultados" />`
    };
}

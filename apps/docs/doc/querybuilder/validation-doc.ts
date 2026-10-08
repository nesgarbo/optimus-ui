import { Component, signal } from '@angular/core';
import { QueryBuilder } from '@openng/optimus-ui/querybuilder';
import type { QueryBuilderColumn, RuleModel } from '@openng/optimus-ui/types/querybuilder';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'validation-doc',
    standalone: true,
    imports: [QueryBuilder, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>allowValidation</i> marks the conditions that cannot be evaluated and says why. A column's <i>validation</i> adds <i>isRequired</i>, <i>min</i>, <i>max</i>, <i>minLength</i> and <i>maxLength</i>. <i>getValidRules()</i> returns the
                tree without the invalid conditions, and <i>isValid()</i> tells whether any were dropped. Every text of the builder can be replaced through <i>messages</i>.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-querybuilder [columns]="columns" [(value)]="value" [allowValidation]="true" [messages]="{ addRule: 'New condition' }" />
        </div>
        <app-code></app-code>
    `
})
export class ValidationDoc {
    columns: QueryBuilderColumn[] = [
        { field: 'name', label: 'Name', type: 'string', validation: { minLength: 3 } },
        { field: 'age', label: 'Age', type: 'number', validation: { min: 0, max: 120 } }
    ];

    value = signal<RuleModel>({
        condition: 'and',
        rules: [
            { field: 'name', operator: 'equal', value: 'Jo', type: 'string' },
            { field: 'age', operator: 'between', value: [10, null], type: 'number' }
        ]
    });
}

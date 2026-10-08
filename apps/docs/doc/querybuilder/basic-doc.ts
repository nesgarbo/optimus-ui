import { Component, signal } from '@angular/core';
import { QueryBuilder } from '@openng/optimus-ui/querybuilder';
import type { QueryBuilderColumn, RuleModel } from '@openng/optimus-ui/types/querybuilder';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'basic-doc',
    standalone: true,
    imports: [QueryBuilder, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>columns</i> declares the fields, each with a <i>type</i> that picks its operators and its editor. The tree is a two-way <i>[(value)]</i> of <i>RuleModel</i>: a group has a <i>condition</i> and <i>rules</i>, a leaf has a
                <i>field</i>, an <i>operator</i> and a <i>value</i>. The <i>rule</i> input seeds it, and <i>maxGroupCount</i>, <i>enableNotCondition</i>, <i>showButtons</i>, <i>displayMode</i> and <i>sortDirection</i> work the same way.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-querybuilder [columns]="columns" [(value)]="value" [enableNotCondition]="true" />
            <pre class="mt-4 text-sm">{{ json() }}</pre>
        </div>
        <app-code></app-code>
    `
})
export class BasicDoc {
    columns: QueryBuilderColumn[] = [
        { field: 'name', label: 'Name', type: 'string' },
        { field: 'age', label: 'Age', type: 'number' },
        { field: 'hired', label: 'Hired', type: 'date' },
        { field: 'active', label: 'Active', type: 'boolean' },
        {
            field: 'role',
            label: 'Role',
            type: 'string',
            values: [
                { label: 'Admin', value: 'admin' },
                { label: 'Editor', value: 'editor' },
                { label: 'Viewer', value: 'viewer' }
            ]
        }
    ];

    value = signal<RuleModel>({
        condition: 'and',
        rules: [
            { field: 'name', operator: 'startswith', value: 'Ma', type: 'string' },
            {
                condition: 'or',
                rules: [
                    { field: 'age', operator: 'greaterthan', value: 30, type: 'number' },
                    { field: 'role', operator: 'in', value: ['admin', 'editor'], type: 'string' }
                ]
            }
        ]
    });

    json = () => JSON.stringify(this.value(), null, 2);
}

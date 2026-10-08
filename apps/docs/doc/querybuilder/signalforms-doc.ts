import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { QueryBuilder } from '@openng/optimus-ui/querybuilder';
import type { QueryBuilderColumn, RuleModel } from '@openng/optimus-ui/types/querybuilder';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'signalforms-doc',
    standalone: true,
    imports: [QueryBuilder, FormField, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                QueryBuilder is a value control for signal forms: bind it with <i>[formField]</i>. It also works with <i>formControlName</i>, <i>formControl</i> and <i>ngModel</i>, and reads <i>disabled</i>, <i>readonly</i>, <i>invalid</i> and
                <i>required</i> from the field.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-querybuilder [columns]="columns" [formField]="f.filter" />
            <p class="mt-4 text-sm">{{ model().filter.rules?.length }} top-level entries</p>
        </div>
        <app-code></app-code>
    `
})
export class SignalFormsDoc {
    columns: QueryBuilderColumn[] = [
        { field: 'name', label: 'Name', type: 'string' },
        { field: 'age', label: 'Age', type: 'number' }
    ];

    model = signal<{ filter: RuleModel }>({ filter: { condition: 'and', rules: [{ field: 'age', operator: 'greaterthan', value: 18, type: 'number' }] } });

    f = form(this.model);
}

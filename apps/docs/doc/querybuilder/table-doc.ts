import { Component, computed, signal } from '@angular/core';
import { QueryBuilder } from '@openng/optimus-ui/querybuilder';
import { TableModule } from '@openng/optimus-ui/table';
import type { QueryBuilderColumn, RuleModel } from '@openng/optimus-ui/types/querybuilder';
import { toPredicate } from '@openng/optimus-ui/querybuilder';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'table-doc',
    standalone: true,
    imports: [QueryBuilder, TableModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>The tree evaluates against plain rows through <i>toPredicate</i>, so an advanced filter for a Table is one <i>computed</i>. For a server-side table, send <i>getFeathersQuery()</i> to the service instead.</p>
        </app-docsectiontext>
        <div class="card">
            <p-querybuilder [columns]="columns" [(value)]="rule" />
            <p-table [value]="rows()" class="mt-4" size="small">
                <ng-template #header>
                    <tr>
                        <th>Name</th>
                        <th>Age</th>
                        <th>City</th>
                    </tr>
                </ng-template>
                <ng-template #body let-row>
                    <tr>
                        <td>{{ row.name }}</td>
                        <td>{{ row.age }}</td>
                        <td>{{ row.city }}</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
        <app-code></app-code>
    `
})
export class TableDoc {
    columns: QueryBuilderColumn[] = [
        { field: 'name', label: 'Name', type: 'string' },
        { field: 'age', label: 'Age', type: 'number' },
        { field: 'city', label: 'City', type: 'string' }
    ];

    data = [
        { name: 'Maria', age: 34, city: 'Madrid' },
        { name: 'John', age: 41, city: 'Paris' },
        { name: 'Joan', age: 22, city: 'Roma' },
        { name: 'Mark', age: 58, city: 'Madrid' }
    ];

    rule = signal<RuleModel>({ condition: 'and', rules: [{ field: 'city', operator: 'equal', value: 'Madrid', type: 'string' }] });

    rows = computed(() => this.data.filter(toPredicate(this.rule())));
}

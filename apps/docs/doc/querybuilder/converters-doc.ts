import { Component, signal, viewChild } from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { QueryBuilder } from '@openng/optimus-ui/querybuilder';
import type { QueryBuilderColumn } from '@openng/optimus-ui/types/querybuilder';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'converters-doc',
    standalone: true,
    imports: [QueryBuilder, ButtonModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>getSqlFromRules</i>, <i>getParameterizedSql</i>, <i>getMongoQuery</i> and <i>getFeathersQuery</i> write the tree out; <i>setRulesFromSql</i> and <i>setMongoQuery</i> read it back in. The Feathers query uses <i>$ilike</i> for the
                text operators and pushes a negated group down onto its conditions, because Feathers has no <i>$not</i>.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-querybuilder #qb [columns]="columns" (ruleChanged)="refresh()" />
            <div class="flex gap-2 my-4">
                <p-button label="Load SQL" severity="secondary" size="small" (onClick)="load()" />
            </div>
            <pre class="text-sm">{{ sql() }}</pre>
            <pre class="text-sm">{{ mongo() }}</pre>
            <pre class="text-sm">{{ feathers() }}</pre>
        </div>
        <app-code></app-code>
    `
})
export class ConvertersDoc {
    qb = viewChild.required<QueryBuilder>('qb');

    columns: QueryBuilderColumn[] = [
        { field: 'name', label: 'Name', type: 'string' },
        { field: 'age', label: 'Age', type: 'number' }
    ];

    sql = signal('');
    mongo = signal('');
    feathers = signal('');

    load() {
        this.qb().setRulesFromSql("name LIKE 'Jo%' AND (age > 30 OR age BETWEEN 1 AND 5)");
    }

    refresh() {
        const qb = this.qb();

        this.sql.set(qb.getSqlFromRules());
        this.mongo.set(JSON.stringify(qb.getMongoQuery()));
        this.feathers.set(JSON.stringify(qb.getFeathersQuery()));
    }
}

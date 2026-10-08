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
            <p>
                <i>getSqlFromRules</i> and <i>getParameterizedSql</i> (and the functions <i>toSql</i> and <i>toParameterizedSql</i>) check each field against the <i>columns</i> of the builder, or against <i>ToSqlOptions.columns</i> when they are
                called alone. A field that is not a column must still look like an identifier (<i>name</i>, <i>user.name</i>); otherwise they throw a <i>QueryBuilderParseError</i>, so a tree that came from outside cannot write SQL into the field.
                <i>contains</i>, <i>startswith</i> and the other text operators write <i>ESCAPE '!'</i> when the value has <i>%</i>, <i>_</i> or <i>!</i>, and those characters are matched as they are. <i>isempty</i> is true for an empty text and for
                <i>NULL</i>.
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

import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { BasicDoc } from '@/doc/querybuilder/basic-doc';
import { ConvertersDoc } from '@/doc/querybuilder/converters-doc';
import { ImportDoc } from '@/doc/querybuilder/import-doc';
import { SignalFormsDoc } from '@/doc/querybuilder/signalforms-doc';
import { TableDoc } from '@/doc/querybuilder/table-doc';
import { ValidationDoc } from '@/doc/querybuilder/validation-doc';

@Component({
    template: `<app-doc
        docTitle="Angular QueryBuilder Component - Optimus UI"
        header="QueryBuilder"
        description="QueryBuilder composes a tree of conditions over a set of columns and reads it out as SQL, MongoDB, a FeathersJS query or a predicate."
        [docs]="docs"
        [apiDocs]="['QueryBuilder']"
        themeDocs="querybuilder"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class QueryBuilderDemo {
    docs = [
        { id: 'import', label: 'Import', component: ImportDoc },
        { id: 'basic', label: 'Basic', component: BasicDoc },
        { id: 'signalforms', label: 'Signal Forms', component: SignalFormsDoc },
        { id: 'converters', label: 'SQL, Mongo and Feathers', component: ConvertersDoc },
        { id: 'table', label: 'Filtering a Table', component: TableDoc },
        { id: 'validation', label: 'Validation', component: ValidationDoc }
    ];
}

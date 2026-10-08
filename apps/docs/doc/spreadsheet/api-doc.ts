import { Component, signal, viewChild } from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { rowsToWorkbook, Spreadsheet } from '@openng/optimus-ui/spreadsheet';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'api-doc',
    standalone: true,
    imports: [Spreadsheet, ButtonModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>getCell</i> and <i>setCell</i> read and write a cell by its address, <i>getRows</i> and <i>setRows</i> a range or a table, and <i>toCsv</i> a sheet as CSV. <i>getApi</i> and <i>getWorkbook</i> give Univer's own API for the rest.
                <i>readonly</i> lets the workbook be read and not changed, and <i>locale</i> and <i>darkMode</i> set the language and the colours. A new <i>locale</i> starts the engine again, so what the user typed since the last <i>value</i> is
                lost: save before changing it. <i>toCsv</i> writes a text that starts with <i>=</i>, <i>+</i>, <i>-</i> or <i>@</i> with a leading quote, so that a spreadsheet does not run it as a formula, and <i>toCsvBlob</i> adds the byte order
                mark so that Excel reads the file as UTF-8. If Univer cannot start, the component shows <i>startErrorMessage</i> (<i>The spreadsheet could not be started</i>): set it to translate it.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-col gap-4">
            <div class="flex flex-wrap gap-2">
                <p-button label="Add a row" size="small" severity="secondary" (onClick)="addRow()" />
                <p-button label="Total" size="small" severity="secondary" (onClick)="total()" />
                <p-button label="Show CSV" size="small" severity="secondary" (onClick)="csv.set(sheet().toCsv())" />
            </div>
            <p-spreadsheet #sheet [value]="book" [footer]="false" style="height: 22rem" />
            <pre class="text-xs overflow-auto">{{ csv() }}</pre>
        </div>
        <app-code></app-code>
    `
})
export class ApiDoc {
    sheet = viewChild.required(Spreadsheet);

    csv = signal('');

    book = rowsToWorkbook([
        ['Month', 'Sales'],
        ['Jan', 120],
        ['Feb', 150],
        ['Mar', 90]
    ]);

    private rows = 4;

    addRow() {
        this.rows++;
        this.sheet().setRows([[`Month ${this.rows - 1}`, Math.round(80 + Math.random() * 100)]], `A${this.rows}`);
    }

    total() {
        this.sheet().setCell('D1', 'Total');
        this.sheet().setCell('E1', `=SUM(B2:B${this.rows})`);
    }
}

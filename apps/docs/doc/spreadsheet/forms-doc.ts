import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { rowsToWorkbook, Spreadsheet } from '@openng/optimus-ui/spreadsheet';
import type { SpreadsheetData } from '@openng/optimus-ui/types/spreadsheet';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'forms-doc',
    standalone: true,
    imports: [Spreadsheet, FormField, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>Spreadsheet is a value control for signal forms, bound with <i>[formField]</i>. It also works with <i>formControlName</i>, <i>formControl</i>, <i>ngModel</i> and two-way <i>[(value)]</i>.</p>
        </app-docsectiontext>
        <div class="card flex flex-col gap-4">
            <p-spreadsheet [formField]="f.budget" [footer]="false" style="height: 20rem" />
            <p class="text-sm">{{ cells() }}</p>
        </div>
        <app-code></app-code>
    `
})
export class FormsDoc {
    model = signal<{ budget: SpreadsheetData | null }>({
        budget: rowsToWorkbook([
            ['Rent', 900],
            ['Food', 350],
            ['Total', '=SUM(B1:B2)']
        ])
    });

    f = form(this.model);

    cells() {
        const book = this.model().budget;
        const sheet = book?.sheets?.[book.sheetOrder?.[0] ?? ''];

        return `${Object.keys(sheet?.cellData ?? {}).length} rows with data in the form`;
    }
}

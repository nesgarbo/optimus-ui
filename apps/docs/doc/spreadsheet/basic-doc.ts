import { Component, signal } from '@angular/core';
import { rowsToWorkbook, Spreadsheet } from '@openng/optimus-ui/spreadsheet';
import type { SpreadsheetData } from '@openng/optimus-ui/types/spreadsheet';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'basic-doc',
    standalone: true,
    imports: [Spreadsheet, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                The value is the workbook as Univer writes it: sheets, cells, formulas, formats and styles. It binds with <i>[(value)]</i>, and a moment after the last change it holds the new workbook, with the results of the formulas, so it can be
                stored and brought back. <i>rowsToWorkbook</i> makes a workbook from a table of rows, where a string that starts with <i>=</i> is a formula.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-col gap-4">
            <p-spreadsheet [(value)]="book" style="height: 28rem" />
            <p class="text-sm">{{ saved() }}</p>
        </div>
        <app-code></app-code>
    `
})
export class BasicDoc {
    book = signal<SpreadsheetData | null>(
        rowsToWorkbook(
            [
                ['Item', 'Price', 'Qty', 'Total'],
                ['Notebook', 4.5, 10, '=B2*C2'],
                ['Pen', 1.2, 25, '=B3*C3'],
                ['Stapler', 8.9, 3, '=B4*C4'],
                ['', '', 'Sum', '=SUM(D2:D4)']
            ],
            { header: true, name: 'Order' }
        )
    );

    saved = signal('Change a cell: the workbook in the value follows.');
}

import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataMatrix, Pdf417 } from '@openng/optimus-ui/barcode';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'matrix-doc',
    standalone: true,
    imports: [DataMatrix, Pdf417, FormsModule, InputTextModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>p-datamatrix</i> writes a Data Matrix (ECC 200), square sizes from 10 by 10 to 144 by 144, with digit pairs packed two to a codeword and Reed-Solomon correction shared over the blocks of the large ones. <i>p-pdf417</i> writes a
                PDF417 in byte compaction (declared UTF-8 beyond ASCII) or numeric compaction for digits; <i>columns</i> sets how many columns of data it has, and <i>errorCorrectionLevel</i> from 0 to 8 overrides the level chosen from the amount of
                data. Both take the same <i>width</i>, <i>height</i>, <i>foreColor</i>, <i>backgroundColor</i>, <i>margin</i>, <i>displayText</i> and <i>mode</i> as the other symbols, and a value they cannot hold fires <i>invalid</i>.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-wrap items-center gap-8">
            <p-datamatrix [value]="value()" [width]="180" [height]="180" />
            <p-pdf417 [value]="value()" [width]="360" [height]="130" [columns]="columns()" />
            <div class="flex flex-col gap-2">
                <input pInputText [ngModel]="value()" (ngModelChange)="value.set($event)" aria-label="Value" class="w-72" />
                <label class="text-sm">Columns of the PDF417: {{ columns() }} <input type="range" min="1" max="12" [ngModel]="columns()" (ngModelChange)="columns.set(+$event)" /></label>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class MatrixDoc {
    value = signal('PART-2026-00417 / LOT 18 / ES');

    columns = signal(4);
}

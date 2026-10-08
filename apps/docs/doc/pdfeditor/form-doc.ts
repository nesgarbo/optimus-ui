import { JsonPipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { PdfEditor } from '@openng/optimus-ui/pdfeditor';
import type { PdfFormValues } from '@openng/optimus-ui/types/pdfeditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { samplePdf } from './sample';

@Component({
    selector: 'form-doc',
    standalone: true,
    imports: [PdfEditor, JsonPipe, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                The fields of the form of the PDF -- text, multiline text, checkboxes, radio buttons, dropdowns and lists -- are shown as inputs over the page. Their values are the <i>formValues</i> model, by field name, and <i>save</i> writes them
                into the file. <i>flatten</i> makes the form part of the pages when it is saved, so it can no longer be filled in. <i>readonly</i> shows the document and its form and lets nothing be changed.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-col gap-4">
            <p-pdfeditor assetsUrl="/pdfjs" [src]="pdf()" [(formValues)]="values" [sidebar]="false" [fitOnLoad]="true" style="height: 36rem" />
            <pre class="text-sm">{{ values() | json }}</pre>
        </div>
        <app-code></app-code>
    `
})
export class FormDoc implements OnInit {
    pdf = signal<Uint8Array | null>(null);

    values = signal<PdfFormValues>({});

    async ngOnInit() {
        this.pdf.set(await samplePdf());
    }
}

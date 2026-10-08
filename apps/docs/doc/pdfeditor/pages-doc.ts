import { Component, OnInit, signal, viewChild } from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { PdfEditor } from '@openng/optimus-ui/pdfeditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { samplePdf } from './sample';

@Component({
    selector: 'pages-doc',
    standalone: true,
    imports: [PdfEditor, ButtonModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                The thumbnails are the pages: click one to go to it and drag one onto another to move it. The toolbar and the methods <i>rotateCurrentPage</i>, <i>deleteCurrentPage</i>, <i>movePage</i>, <i>addBlankPage</i>, <i>merge</i> and
                <i>extract</i> turn, delete, move, add, merge and take pages out. What is drawn on a page goes with it, and every change can be undone. <i>save</i> makes the new file, <i>saveAsBlob</i> a <i>Blob</i> and <i>download</i> hands it to
                the browser.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-col gap-4">
            <div class="flex flex-wrap gap-2">
                <p-button label="Rotate" size="small" severity="secondary" (onClick)="editor().rotateCurrentPage(90)" />
                <p-button label="Move first page to the end" size="small" severity="secondary" (onClick)="editor().movePage(0, editor().pages().length - 1)" />
                <p-button label="Add a page" size="small" severity="secondary" (onClick)="editor().addBlankPage()" />
                <p-button label="Extract page 2" size="small" severity="secondary" (onClick)="extractSecond()" />
                <p-button label="Download" size="small" (onClick)="editor().download('edited.pdf')" />
            </div>
            <p-pdfeditor assetsUrl="/pdfjs" [src]="pdf()" style="height: 36rem" />
            @if (message()) {
                <p class="text-sm">{{ message() }}</p>
            }
        </div>
        <app-code></app-code>
    `
})
export class PagesDoc implements OnInit {
    editor = viewChild.required(PdfEditor);

    pdf = signal<Uint8Array | null>(null);

    message = signal('');

    async ngOnInit() {
        this.pdf.set(await samplePdf());
    }

    async extractSecond() {
        const bytes = await this.editor().extract([1]);

        this.message.set(`Page 2 on its own is a file of ${bytes.length} bytes.`);
    }
}

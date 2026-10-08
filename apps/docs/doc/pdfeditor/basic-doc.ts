import { Component, OnInit, signal } from '@angular/core';
import { PdfEditor } from '@openng/optimus-ui/pdfeditor';
import type { PdfAnnotation } from '@openng/optimus-ui/types/pdfeditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { samplePdf } from './sample';

@Component({
    selector: 'basic-doc',
    standalone: true,
    imports: [PdfEditor, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                Give <i>src</i> a URL, a <i>Blob</i> or <i>File</i>, or the bytes of a file. The toolbar has tools for text, highlights, rectangles, ellipses, lines, arrows, freehand drawing and pictures. Click an annotation to select it, drag it to
                move it, drag a handle to resize it, press Delete to remove it, and double-click a text to edit it. Ctrl/Cmd+Z undoes and Ctrl/Cmd+Shift+Z redoes, for annotations and for page changes. The annotations are the <i>annotations</i> model,
                in points from the top left of the page as it is shown, so an app can store them and bring them back.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-pdfeditor assetsUrl="/pdfjs" [src]="pdf()" [(annotations)]="annotations" [fitOnLoad]="true" style="height: 40rem" />
            <p class="mt-4 text-sm">{{ annotations().length }} annotation{{ annotations().length === 1 ? '' : 's' }}</p>
        </div>
        <app-code></app-code>
    `
})
export class BasicDoc implements OnInit {
    pdf = signal<Uint8Array | null>(null);

    annotations = signal<PdfAnnotation[]>([]);

    async ngOnInit() {
        this.pdf.set(await samplePdf());
    }
}

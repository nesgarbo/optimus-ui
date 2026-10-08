import { Component, OnInit, signal } from '@angular/core';
import { PdfEditor } from '@openng/optimus-ui/pdfeditor';
import { Signature } from '@openng/optimus-ui/signature';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { samplePdf } from './sample';

@Component({
    selector: 'signature-doc',
    standalone: true,
    imports: [PdfEditor, Signature, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                A signature is a picture. Draw one with <i>p-signature</i>, pass its value as <i>signature</i>, pick the signature tool and click where it goes. With no <i>signature</i> set, the tool emits <i>signatureRequested</i> so that the app
                can ask for one. <i>placePicture</i> puts any PNG or JPEG on the page from code. A picture of more than about 21 MB, or of more than 40 million pixels, or one that cannot be read or placed, is not put on the page: <i>failed</i> emits
                with the reason.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-col gap-4">
            <p-signature [(value)]="signature" style="height: 8rem" />
            <p-pdfeditor assetsUrl="/pdfjs" [src]="pdf()" [signature]="signature()" [(tool)]="tool" (signatureRequested)="hint.set('Draw a signature above first')" style="height: 36rem" />
            <p class="text-sm">{{ hint() }}</p>
        </div>
        <app-code></app-code>
    `
})
export class SignatureDoc implements OnInit {
    pdf = signal<Uint8Array | null>(null);

    signature = signal<string | null>(null);

    tool = signal<any>('select');

    hint = signal('Draw a signature, pick the signature tool in the toolbar, and click on the page.');

    async ngOnInit() {
        this.pdf.set(await samplePdf());
    }
}

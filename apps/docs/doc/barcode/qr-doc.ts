import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { QRCode } from '@openng/optimus-ui/barcode';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'qr-doc',
    standalone: true,
    imports: [QRCode, FormsModule, InputTextModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                QRCode writes versions 1 to 40 in the numeric, alphanumeric and byte (UTF-8) modes. <i>errorCorrectionLevel</i> is <i>low</i>, <i>medium</i>, <i>quartile</i> or <i>high</i>, and is raised on its own when the value leaves room.
                <i>version</i> forces a size, and <i>xDimension</i> fixes the side of a module in pixels. <i>logo</i> puts a picture over the middle (<i>imageSource</i>, <i>width</i>, <i>height</i>): the level of correction goes to <i>high</i> and
                the picture is made smaller until it covers no more than a quarter of the symbol, so the code stays readable.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-wrap items-center gap-6">
            <p-qrcode [value]="value()" [width]="200" [height]="200" errorCorrectionLevel="quartile" />
            <p-qrcode [value]="value()" [width]="200" [height]="200" [logo]="{ imageSource: logo, width: 56, height: 56 }" />
            <input pInputText [ngModel]="value()" (ngModelChange)="value.set($event)" aria-label="Value" class="w-80" />
        </div>
        <app-code></app-code>
    `
})
export class QrDoc {
    value = signal('https://www.openng.org');

    logo = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#4f46e5"/><path d="M20 32l8 8 16-18" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>')}`;
}

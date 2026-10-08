import { Component } from '@angular/core';
import { Barcode } from '@openng/optimus-ui/barcode';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'basic-doc',
    standalone: true,
    imports: [Barcode, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>type</i> is <i>code128</i> (the shortest mix of sets B and C), <i>code128A</i>, <i>code128B</i>, <i>code128C</i>, <i>code39</i>, <i>code39Extended</i> (all of ASCII), <i>code11</i>, <i>codabar</i>, <i>ean13</i>, <i>ean8</i> or
                <i>upcA</i>. Code 128, EAN and UPC compute their check character; <i>enableCheckSum</i> adds the Mod 43 one to Code 39 and makes an EAN or UPC value that already carries a check digit be verified. A value the symbology cannot write
                fires <i>invalid</i> and draws nothing.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-wrap gap-6">
            <p-barcode type="code128" value="Optimus UI 2026" [width]="260" [height]="90" (invalid)="onInvalid($event.message)" />
            <p-barcode type="code39" value="CODE39" [width]="260" [height]="90" />
            <p-barcode type="ean13" value="4006381333931" [width]="220" [height]="100" />
            <p-barcode type="ean8" value="7351353" [width]="180" [height]="100" />
            <p-barcode type="upcA" value="03600029145" [width]="220" [height]="100" />
            <p-barcode type="code39Extended" value="Hello, Code39" [width]="300" [height]="90" />
            <p-barcode type="code11" value="123-45" [width]="220" [height]="90" />
            <p-barcode type="codabar" value="A40156B" [width]="220" [height]="90" />
        </div>
        <app-code></app-code>
    `
})
export class BasicDoc {
    onInvalid(message: string) {
        console.warn(message);
    }
}

import { Component } from '@angular/core';
import { Barcode, QRCode } from '@openng/optimus-ui/barcode';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'appearance-doc',
    standalone: true,
    imports: [Barcode, QRCode, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>displayText</i> is <i>false</i> to hide the text or an object to style it: <i>text</i>, <i>position</i>, <i>size</i>, <i>color</i>, <i>font</i>, <i>margin</i> and <i>alignment</i>. A QR Code shows no text unless asked.
                <i>foreColor</i> and <i>backgroundColor</i> default to black on white, which scanners read best; <i>margin</i> takes pixels per side, and <i>mode="canvas"</i> draws on a canvas instead of SVG.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-wrap gap-6">
            <p-barcode type="code128" value="TOP-TEXT" [width]="240" [height]="100" [displayText]="{ position: 'top', size: 16, color: '#b91c1c' }" foreColor="#1d4ed8" backgroundColor="#eff6ff" [margin]="{ left: 8, right: 8, top: 4, bottom: 4 }" />
            <p-barcode type="code128" value="CANVAS" mode="canvas" [width]="240" [height]="100" [displayText]="false" />
            <p-qrcode value="Caption below" [width]="160" [height]="190" [displayText]="{ visibility: true, text: 'Scan me' }" />
        </div>
        <app-code></app-code>
    `
})
export class AppearanceDoc {}

import { Component, viewChild } from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { Barcode } from '@openng/optimus-ui/barcode';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'export-doc',
    standalone: true,
    imports: [Barcode, ButtonModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>exportImage(fileName, format)</i> downloads the symbol as <i>svg</i>, <i>png</i> or <i>jpeg</i>. <i>exportAsBase64(format)</i> returns the data URL and <i>toSvg()</i> the SVG document, which is what is drawn: the file matches the
                screen.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-col gap-4 items-start">
            <p-barcode #code type="code128" value="EXPORT-ME" [width]="260" [height]="90" />
            <div class="flex gap-2">
                <p-button label="SVG" severity="secondary" size="small" (onClick)="code.exportImage('barcode', 'svg')" />
                <p-button label="PNG" severity="secondary" size="small" (onClick)="code.exportImage('barcode', 'png')" />
                <p-button label="JPEG" severity="secondary" size="small" (onClick)="code.exportImage('barcode', 'jpeg')" />
            </div>
        </div>
        <app-code></app-code>
    `
})
export class ExportDoc {
    code = viewChild.required<Barcode>('code');
}

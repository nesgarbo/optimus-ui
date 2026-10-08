import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { AppearanceDoc } from '@/doc/barcode/appearance-doc';
import { BasicDoc } from '@/doc/barcode/basic-doc';
import { ExportDoc } from '@/doc/barcode/export-doc';
import { ImportDoc } from '@/doc/barcode/import-doc';
import { MatrixDoc } from '@/doc/barcode/matrix-doc';
import { QrDoc } from '@/doc/barcode/qr-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Barcode and QR Code Components - Optimus UI"
        header="Barcode"
        description="Barcode, QRCode, DataMatrix and Pdf417 draw a value as Code 128, Code 39, Code 11, Codabar, EAN-13, EAN-8, UPC-A, a QR Code, a Data Matrix or a PDF417, as SVG or on a canvas, and export it as SVG, PNG or JPEG."
        [docs]="docs"
        [apiDocs]="['Barcode', 'QRCode', 'DataMatrix', 'Pdf417']"
        themeDocs="barcode"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class BarcodeDemo {
    docs = [
        { id: 'import', label: 'Import', component: ImportDoc },
        { id: 'basic', label: 'Barcode', component: BasicDoc },
        { id: 'qr', label: 'QR Code', component: QrDoc },
        { id: 'matrix', label: 'Data Matrix and PDF417', component: MatrixDoc },
        { id: 'appearance', label: 'Text, Colors and Canvas', component: AppearanceDoc },
        { id: 'export', label: 'Export', component: ExportDoc }
    ];
}

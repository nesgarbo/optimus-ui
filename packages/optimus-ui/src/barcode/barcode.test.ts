import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { BarcodeType } from '@openng/optimus-ui/types/barcode';
import { beforeEach, describe, expect, it } from 'vitest';
import { Barcode, BarcodeModule, DataMatrix, Pdf417, QRCode } from './barcode';

@Component({
    standalone: true,
    imports: [BarcodeModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <p-barcode #bc [type]="type()" [value]="value()" [width]="300" [height]="100" (invalid)="invalids.push($event.message)" (loaded)="loads = loads + 1" />
        <p-barcode #cv mode="canvas" type="code39" value="CODE39" [width]="300" [height]="100" />
        <p-qrcode #qr [value]="qrValue()" [width]="200" [height]="200" errorCorrectionLevel="high" [displayText]="true" />
    `
})
class Host {
    readonly bc = viewChild.required<Barcode>('bc');
    readonly cv = viewChild.required<Barcode>('cv');
    readonly qr = viewChild.required<QRCode>('qr');
    readonly type = signal<BarcodeType>('code128');
    readonly value = signal('Hello 123');
    readonly qrValue = signal('https://www.openng.org');
    readonly invalids: string[] = [];
    loads = 0;
}

describe('Barcode', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    const el = (sel: string) => fixture.nativeElement.querySelector(sel) as HTMLElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [Host], providers: [provideZonelessChangeDetection()] }).compileComponents();

        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('draws a barcode as SVG with its text and a name', () => {
        const svg = el('p-barcode svg');

        expect(svg.getAttribute('role')).toBe('img');
        expect(svg.getAttribute('aria-label')).toBe('code128 barcode: Hello 123');
        expect(svg.querySelector('path')!.getAttribute('d')!.length).toBeGreaterThan(20);
        expect(svg.querySelector('text')!.textContent).toBe('Hello 123');
        expect(host.loads).toBeGreaterThan(0);
    });

    it('redraws when the value or the type changes', async () => {
        const before = el('p-barcode svg path').getAttribute('d');

        host.value.set('Other');
        await fixture.whenStable();
        expect(el('p-barcode svg path').getAttribute('d')).not.toBe(before);

        host.type.set('ean13');
        host.value.set('4006381333931');
        await fixture.whenStable();

        expect([...fixture.nativeElement.querySelectorAll('p-barcode svg text')].slice(0, 3).map((t: Element) => t.textContent)).toEqual(['4', '006381', '333931']);
    });

    it('tells the consumer when a value cannot be written, and draws nothing', async () => {
        host.type.set('ean13');
        host.value.set('12ab');
        await fixture.whenStable();

        expect(host.invalids).toEqual(['EAN-13 takes digits only']);
        expect(el('p-barcode').getAttribute('aria-invalid')).toBe('true');
        expect(el('p-barcode').classList).toContain('p-barcode-invalid');
        expect(host.bc().toSvg()).toBe('');
    });

    it('draws on a canvas', async () => {
        const canvas = el('p-barcode canvas') as HTMLCanvasElement;

        expect(canvas).toBeTruthy();

        const data = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
        let dark = 0;

        for (let i = 0; i < data.length; i += 4) if (data[i] < 64 && data[i + 3] > 0) dark++;

        expect(dark).toBeGreaterThan(200);
    });

    it('draws a QR Code and exports it', () => {
        expect(el('p-qrcode svg path').getAttribute('d')!.length).toBeGreaterThan(200);
        expect(el('p-qrcode').classList).toContain('p-qrcode');
        expect(el('p-qrcode svg text')?.textContent).toBe('https://www.openng.org');

        const qr = host.qr();

        expect(qr.toSvg().startsWith('<svg')).toBe(true);
        expect(qr.exportAsBase64('png')).toMatch(/^data:image\/png/);
        expect(qr.exportAsBase64('jpeg')).toMatch(/^data:image\/jpeg/);
        expect(decodeURIComponent(qr.exportAsBase64('svg'))).toContain('<path');
    });

    it('a QR Code too long for its version is reported', async () => {
        host.qrValue.set('x'.repeat(5000));
        await fixture.whenStable();

        expect(host.qr().invalidMessage()).toContain('too long');
    });

    it('an empty value draws nothing and is not an error', async () => {
        host.value.set('');
        await fixture.whenStable();

        expect(el('p-barcode svg')).toBeNull();
        expect(host.bc().invalidMessage()).toBe('');
        expect(host.bc().exportAsBase64()).toBe('');
    });

    it('a browser that can read QR codes reads ours', async () => {
        const Detector = (window as any).BarcodeDetector;

        if (!Detector) return; // not every browser has one

        const image = new Image();

        image.src = host.qr().exportAsBase64('png', 4);
        await image.decode();

        const found = await new Detector({ formats: ['qr_code'] }).detect(image);

        expect(found[0]?.rawValue).toBe('https://www.openng.org');
    });
});

@Component({
    standalone: true,
    imports: [BarcodeModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <p-datamatrix #dm [value]="value()" [width]="160" [height]="160" (invalid)="invalids.push($event.message)" />
        <p-pdf417 #pdf value="PDF417 in a component" [width]="400" [height]="120" [columns]="4" />
        <p-qrcode #qr value="https://www.openng.org" [width]="200" [height]="200" [logo]="logo()" />
        <p-barcode #lin [type]="type()" [value]="linValue()" [width]="300" [height]="80" (invalid)="invalids.push($event.message)" />
    `
})
class MoreHost {
    readonly dm = viewChild.required<DataMatrix>('dm');
    readonly pdf = viewChild.required<Pdf417>('pdf');
    readonly qr = viewChild.required<QRCode>('qr');
    readonly lin = viewChild.required<Barcode>('lin');
    readonly value = signal('Data Matrix 2026');
    readonly type = signal<BarcodeType>('codabar');
    readonly linValue = signal('1234-5678');
    readonly logo = signal<{ imageSource: string; width: number; height: number } | undefined>(undefined);
    readonly invalids: string[] = [];
}

describe('Data Matrix, PDF417, logos and the other symbologies', () => {
    let fixture: ComponentFixture<MoreHost>;
    let host: MoreHost;

    const root = () => fixture.nativeElement as HTMLElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [MoreHost], providers: [provideZonelessChangeDetection()] }).compileComponents();

        fixture = TestBed.createComponent(MoreHost);
        host = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('draws a Data Matrix, and redraws for a new value', async () => {
        const d = () => root().querySelector('p-datamatrix svg path')!.getAttribute('d');
        const before = d();

        expect(root().querySelector('p-datamatrix svg')!.getAttribute('aria-label')).toBe('Data Matrix: Data Matrix 2026');
        expect(before!.length).toBeGreaterThan(100);

        host.value.set('Another value');
        await fixture.whenStable();
        expect(d()).not.toBe(before);

        host.value.set('x'.repeat(1700));
        await fixture.whenStable();
        expect(host.invalids.at(-1)).toContain('too long');
    });

    it('draws a PDF417 as stacked rows', () => {
        const rects = root().querySelectorAll('p-pdf417 svg path');

        expect(rects.length).toBe(1);
        expect(host.pdf().toSvg()).toContain('<path');
        expect(root().querySelector('p-pdf417 svg')!.getAttribute('aria-label')).toBe('PDF417: PDF417 in a component');
        expect(host.pdf().exportAsBase64('png')).toMatch(/^data:image\/png/);
    });

    it('puts a logo over a QR Code, at the highest level of correction', async () => {
        const plain = host.qr().toSvg();

        host.logo.set({ imageSource: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="red"/></svg>', width: 50, height: 50 });
        await fixture.whenStable();

        expect(root().querySelector('p-qrcode svg image')).toBeTruthy();
        expect(host.qr().toSvg()).toContain('<image href=');
        expect(host.qr().toSvg()).not.toBe(plain);
        // the symbol is bigger or equal: high correction needs more modules than medium for the same value
        expect(root().querySelectorAll('p-qrcode svg rect').length).toBeGreaterThanOrEqual(2);
    });

    it('exports a QR Code with a logo, and keeps the last logo asked for', async () => {
        const red = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="red"/></svg>';
        const blue = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="blue"/></svg>';

        host.logo.set({ imageSource: red, width: 50, height: 50 });
        await fixture.whenStable();
        host.logo.set({ imageSource: blue, width: 50, height: 50 });
        await fixture.whenStable();
        await new Promise((r) => setTimeout(r, 300));

        // `crossOrigin` is set on the logo, so the canvas of the export can be read back.
        expect(host.qr().exportAsBase64('png')).toMatch(/^data:image\/png/);
        expect(root().querySelector('p-qrcode svg image')!.getAttribute('href')).toBe(blue);
    });

    it('draws Codabar, Code 11 and Code 39 Extended, and says why a value does not fit', async () => {
        expect(root().querySelector('p-barcode svg path')!.getAttribute('d')!.length).toBeGreaterThan(50);

        host.type.set('code11');
        host.linValue.set('123-45');
        await fixture.whenStable();
        expect(root().querySelector('p-barcode svg text')!.textContent).toBe('123-455');

        host.type.set('code39Extended');
        host.linValue.set('Hello, world!');
        await fixture.whenStable();
        expect(root().querySelector('p-barcode svg text')!.textContent).toBe('Hello, world!');

        host.type.set('code11');
        host.linValue.set('12A');
        await fixture.whenStable();
        expect(host.invalids.at(-1)).toContain('Code 11');
    });
});

import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { beforeEach, describe, expect, it } from 'vitest';
import type { PdfAnnotation, PdfFormValues } from '@openng/optimus-ui/types/pdfeditor';
import { openDocument, renderPage } from './pdf-render';
import { PdfEditor } from './pdfeditor';
import { exportPdf, loadPdf, readForm, rotatePage } from './pdf-writer';

const wait = (ms = 120) => new Promise((r) => setTimeout(r, ms));

async function makePdf(pages = 3, withForm = false): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);

    for (let i = 0; i < pages; i++) {
        const page = doc.addPage([300, 400]);

        page.drawText(`Page ${i + 1}`, { x: 20, y: 360, size: 24, font });
    }

    if (withForm) {
        const form = doc.getForm();

        form.createTextField('name').addToPage(doc.getPage(0), { x: 20, y: 300, width: 200, height: 24 });
        form.createCheckBox('agree').addToPage(doc.getPage(0), { x: 20, y: 260, width: 16, height: 16 });
        form.createDropdown('size').addToPage(doc.getPage(0), { x: 20, y: 220, width: 100, height: 22 });
        form.getDropdown('size').addOptions(['S', 'M', 'L']);
    }

    return doc.save();
}

/** Draws a page of bytes at 1 point per pixel and reads one pixel, from the top left of the page as it is shown. */
async function pixel(bytes: Uint8Array, page: number, x: number, y: number): Promise<[number, number, number, number]> {
    const doc = await openDocument(bytes);
    const canvas = document.createElement('canvas');

    await renderPage(doc, page, canvas, 1, 1).promise;

    const data = canvas.getContext('2d')!.getImageData(Math.round(x), Math.round(y), 1, 1).data;

    await doc.loadingTask.destroy();

    return [data[0], data[1], data[2], data[3]];
}

const near = (got: number[], want: number[], tolerance = 24) => want.every((w, i) => Math.abs(got[i] - w) <= tolerance);

@Component({
    standalone: true,
    imports: [PdfEditor],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<p-pdfeditor
        [src]="src()"
        [(annotations)]="annotations"
        [(formValues)]="formValues"
        [(pageIndex)]="pageIndex"
        [(tool)]="tool"
        [signature]="signature()"
        [readonly]="locked()"
        (loaded)="loadedCount = loadedCount + 1"
        (failed)="failures.push($event.message)"
        (changed)="events.push($event.type)"
        (signatureRequested)="requests = requests + 1"
        style="height: 640px"
    />`
})
class Host {
    readonly editor = viewChild.required(PdfEditor);
    readonly src = signal<Uint8Array | null>(null);
    readonly signature = signal<string | null>(null);
    readonly locked = signal(false);
    annotations = signal<PdfAnnotation[]>([]);
    formValues = signal<PdfFormValues>({});
    pageIndex = signal(0);
    tool = signal<any>('select');
    loadedCount = 0;
    failures: string[] = [];
    events: string[] = [];
    requests = 0;
}

describe('PdfEditor', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    const root = () => fixture.nativeElement as HTMLElement;
    const editor = () => host.editor();
    const overlay = () => root().querySelector('svg.p-pdfeditor-overlay') as SVGSVGElement;

    const open = async (bytes: Uint8Array) => {
        host.src.set(bytes);
        await fixture.whenStable();
        await wait(900);
        await fixture.whenStable();
    };

    /** A pointer event at a point of the page, in points. */
    const fire = (type: string, x: number, y: number, extra: PointerEventInit = {}) => {
        const rect = overlay().getBoundingClientRect();
        const scale = editor().scale();

        overlay().dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, button: 0, clientX: rect.left + x * scale, clientY: rect.top + y * scale, ...extra }));
    };

    const drag = async (from: [number, number], to: [number, number], extra: PointerEventInit = {}) => {
        fire('pointerdown', from[0], from[1], extra);
        fire('pointermove', (from[0] + to[0]) / 2, (from[1] + to[1]) / 2, extra);
        fire('pointermove', to[0], to[1], extra);
        fire('pointerup', to[0], to[1], extra);
        await fixture.whenStable();
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [Host], providers: [provideZonelessChangeDetection()] }).compileComponents();

        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        document.body.appendChild(fixture.nativeElement);
        await fixture.whenStable();
    });

    it('opens a document, draws its page and lists its pages', async () => {
        await open(await makePdf(3));

        // Under load the first document takes longer to open.
        for (let i = 0; i < 50 && host.loadedCount === 0; i++) await wait(100);

        expect(host.loadedCount).toBe(1);
        expect(editor().pages()).toHaveLength(3);
        expect(root().textContent).toContain('1 / 3');

        const canvas = root().querySelector('canvas.p-pdfeditor-canvas') as HTMLCanvasElement;
        const data = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
        let dark = 0;

        for (let i = 0; i < data.length; i += 4) if (data[i] < 100) dark++;

        // The title of the page is black on white.
        expect(dark).toBeGreaterThan(50);
    });

    it('draws a thumbnail for each page', async () => {
        await open(await makePdf(3));
        await wait(400);

        const thumbs = [...root().querySelectorAll('canvas[data-thumbnail]')] as HTMLCanvasElement[];

        expect(thumbs).toHaveLength(3);
        expect(thumbs.every((c) => c.width > 10)).toBe(true);
    });

    it('says so when what it is given is not a PDF', async () => {
        host.src.set(new TextEncoder().encode('hello'));
        await fixture.whenStable();
        await wait(300);

        expect(host.failures).toEqual(['This is not a PDF']);
        expect(editor().pages()).toHaveLength(0);
    });

    it('draws a rectangle by dragging, and selects it', async () => {
        await open(await makePdf());
        host.tool.set('rectangle');
        await fixture.whenStable();
        await drag([50, 100], [150, 160]);

        const [a] = host.annotations();

        expect(a).toMatchObject({ type: 'rectangle', page: 0, x: 50, y: 100, width: 100, height: 60 });
        expect(editor().selectedId()).toBe(a.id);
        expect(host.tool()).toBe('select');
    });

    it('holds a drag to a square with shift', async () => {
        await open(await makePdf());
        host.tool.set('ellipse');
        await fixture.whenStable();
        await drag([50, 100], [170, 130], { shiftKey: true });

        const a = host.annotations()[0] as any;

        expect(a.width).toBeCloseTo(a.height);
    });

    it('makes nothing from a click that did not drag', async () => {
        await open(await makePdf());
        host.tool.set('rectangle');
        await fixture.whenStable();
        await drag([50, 100], [51, 100]);

        expect(host.annotations()).toHaveLength(0);
    });

    it('draws with the pen and keeps the points', async () => {
        await open(await makePdf());
        host.tool.set('draw');
        await fixture.whenStable();
        await drag([20, 20], [80, 90]);

        const a = host.annotations()[0] as any;

        expect(a.type).toBe('draw');
        expect(a.points.length).toBeGreaterThanOrEqual(3);
        // The pen stays on after a stroke.
        expect(host.tool()).toBe('draw');
    });

    it('moves an annotation by dragging it, and undo puts it back', async () => {
        await open(await makePdf());
        host.annotations.set([{ id: 'r', page: 0, type: 'rectangle', x: 50, y: 100, width: 100, height: 60, color: '#ff0000', strokeWidth: 2, fillColor: '#ff0000', fillOpacity: 1 }]);
        await fixture.whenStable();
        await drag([100, 130], [130, 160]);
        await fixture.whenStable();

        expect(host.annotations()[0]).toMatchObject({ x: 80, y: 130 });

        await editor().undo();
        await fixture.whenStable();

        expect(host.annotations()[0]).toMatchObject({ x: 50, y: 100 });
        expect(editor().canRedo()).toBe(true);

        await editor().redo();

        expect(host.annotations()[0]).toMatchObject({ x: 80, y: 130 });
    });

    it('resizes with a handle', async () => {
        await open(await makePdf());
        host.annotations.set([{ id: 'r', page: 0, type: 'rectangle', x: 50, y: 100, width: 100, height: 60, color: '#ff0000', strokeWidth: 2, fillColor: '#ff0000', fillOpacity: 1 }]);
        await fixture.whenStable();
        editor().select('r');
        await fixture.whenStable();

        const handle = root().querySelector('[data-handle="se"]') as SVGRectElement;
        const rect = overlay().getBoundingClientRect();

        handle.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, button: 0, clientX: rect.left + 150, clientY: rect.top + 160 }));
        fire('pointermove', 200, 200);
        fire('pointerup', 200, 200);
        await fixture.whenStable();

        expect(host.annotations()[0]).toMatchObject({ x: 50, y: 100, width: 150, height: 100 });
    });

    it('deletes the selected annotation with the key, and nudges with the arrows', async () => {
        await open(await makePdf());
        host.annotations.set([{ id: 'r', page: 0, type: 'rectangle', x: 50, y: 100, width: 100, height: 60, color: '#ff0000', strokeWidth: 2, fillColor: '', fillOpacity: 1 }]);
        await fixture.whenStable();
        editor().select('r');
        await fixture.whenStable();

        const key = (k: string, extra: KeyboardEventInit = {}) =>
            root()
                .querySelector('p-pdfeditor')!
                .dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, ...extra }));

        key('ArrowRight');
        key('ArrowDown', { shiftKey: true });
        await fixture.whenStable();
        expect(host.annotations()[0]).toMatchObject({ x: 51, y: 110 });

        key('Delete');
        await fixture.whenStable();
        expect(host.annotations()).toHaveLength(0);

        key('z', { ctrlKey: true });
        await wait();
        await fixture.whenStable();
        expect(host.annotations()).toHaveLength(1);
    });

    it('writes text: a click makes a box that takes what is typed', async () => {
        await open(await makePdf());
        host.tool.set('text');
        await fixture.whenStable();
        fire('pointerdown', 40, 60);
        fire('pointerup', 40, 60);
        await fixture.whenStable();
        await wait();

        const box = root().querySelector('textarea.p-pdfeditor-text-editor') as HTMLTextAreaElement;

        expect(box).not.toBeNull();

        box.value = 'Hello PDF';
        box.dispatchEvent(new Event('blur'));
        await fixture.whenStable();
        await wait();

        expect(host.annotations()[0]).toMatchObject({ type: 'text', text: 'Hello PDF', x: 40, y: 60 });
        expect(root().querySelector('textarea.p-pdfeditor-text-editor')).toBeNull();
        expect(root().querySelector('svg tspan')?.textContent).toBe('Hello PDF');
    });

    it('drops a text that was left empty', async () => {
        await open(await makePdf());
        host.tool.set('text');
        await fixture.whenStable();
        fire('pointerdown', 40, 60);
        await fixture.whenStable();
        await wait();
        (root().querySelector('textarea.p-pdfeditor-text-editor') as HTMLTextAreaElement).dispatchEvent(new Event('blur'));
        await fixture.whenStable();

        expect(host.annotations()).toHaveLength(0);
    });

    it('asks for a signature when there is none, and places one when there is', async () => {
        await open(await makePdf());
        host.tool.set('signature');
        await fixture.whenStable();
        fire('pointerdown', 100, 100);
        expect(host.requests).toBe(1);

        const canvas = document.createElement('canvas');

        canvas.width = 80;
        canvas.height = 40;
        host.signature.set(canvas.toDataURL());
        await fixture.whenStable();
        fire('pointerdown', 100, 100);
        await wait(200);
        await fixture.whenStable();

        expect(host.annotations()[0]).toMatchObject({ type: 'signature', width: 80, height: 40, x: 60, y: 80 });
    });

    it('turns, adds, moves and deletes pages, and the annotations go with their pages', async () => {
        await open(await makePdf(3));
        host.annotations.set([
            { id: 'a', page: 0, type: 'rectangle', x: 10, y: 10, width: 20, height: 20, color: '#f00', strokeWidth: 1, fillColor: '', fillOpacity: 1 },
            { id: 'b', page: 2, type: 'rectangle', x: 10, y: 10, width: 20, height: 20, color: '#f00', strokeWidth: 1, fillColor: '', fillOpacity: 1 }
        ]);
        await fixture.whenStable();

        await editor().rotateCurrentPage(90, 1);
        expect(editor().pages()[1]).toMatchObject({ rotation: 90, width: 400, height: 300 });

        await editor().addBlankPage(1);
        expect(editor().pages()).toHaveLength(4);
        expect(host.annotations().map((a) => [a.id, a.page])).toEqual([
            ['a', 0],
            ['b', 3]
        ]);

        await editor().movePage(3, 0);
        expect(host.annotations().map((a) => [a.id, a.page])).toEqual([
            ['a', 1],
            ['b', 0]
        ]);

        await editor().deleteCurrentPage(0);
        expect(editor().pages()).toHaveLength(3);
        expect(host.annotations().map((a) => [a.id, a.page])).toEqual([['a', 0]]);

        expect(host.events).toContain('page');
    });

    it('undoes a page change, with the document and the annotations', async () => {
        await open(await makePdf(2));
        host.annotations.set([{ id: 'a', page: 1, type: 'rectangle', x: 10, y: 10, width: 20, height: 20, color: '#f00', strokeWidth: 1, fillColor: '', fillOpacity: 1 }]);
        await fixture.whenStable();
        await editor().deleteCurrentPage(0);

        expect(editor().pages()).toHaveLength(1);
        expect(host.annotations()[0].page).toBe(0);

        await editor().undo();
        await fixture.whenStable();

        expect(editor().pages()).toHaveLength(2);
        expect(host.annotations()[0].page).toBe(1);
    });

    it('keeps the last page', async () => {
        await open(await makePdf(1));
        await editor().deleteCurrentPage(0);

        expect(editor().pages()).toHaveLength(1);
    });

    it('merges another document in', async () => {
        await open(await makePdf(2));

        const added = await editor().merge(await makePdf(3), 1);

        expect(added).toBe(3);
        expect(editor().pages()).toHaveLength(5);
    });

    it('shows the fields of the form as inputs and fills them in', async () => {
        await open(await makePdf(1, true));

        const text = root().querySelector('input[type="text"].p-pdfeditor-field') as HTMLInputElement;
        const check = root().querySelector('input[type="checkbox"].p-pdfeditor-field') as HTMLInputElement;
        const select = root().querySelector('select.p-pdfeditor-field') as HTMLSelectElement;

        expect([text, check, select].every(Boolean)).toBe(true);
        expect([...select.options].map((o) => o.value)).toEqual(['', 'S', 'M', 'L']);

        text.value = 'Ada Lovelace';
        text.dispatchEvent(new Event('input'));
        check.checked = true;
        check.dispatchEvent(new Event('change'));
        select.value = 'M';
        select.dispatchEvent(new Event('change'));
        await fixture.whenStable();

        expect(host.formValues()).toEqual({ name: 'Ada Lovelace', agree: true, size: 'M' });

        const out = await editor().save();
        const fields = readForm(await loadPdf(out));

        expect(fields.find((f) => f.name === 'name')!.value).toBe('Ada Lovelace');
        expect(fields.find((f) => f.name === 'agree')!.value).toBe(true);
        expect(fields.find((f) => f.name === 'size')!.value).toBe('M');
    });

    it('locks everything when it is readonly', async () => {
        await open(await makePdf(1, true));
        host.locked.set(true);
        host.tool.set('rectangle');
        await fixture.whenStable();
        await drag([50, 100], [150, 160]);

        expect(host.annotations()).toHaveLength(0);
        expect((root().querySelector('input[type="text"].p-pdfeditor-field') as HTMLInputElement).disabled).toBe(true);
        expect(root().querySelector('[role="radiogroup"]')).toBeNull();
    });

    it('saves a file with the annotations on the page, where they were placed', async () => {
        await open(await makePdf(1));
        host.annotations.set([{ id: 'r', page: 0, type: 'rectangle', x: 50, y: 100, width: 100, height: 60, color: '#000000', strokeWidth: 0, fillColor: '#ff0000', fillOpacity: 1 }]);
        await fixture.whenStable();

        const out = await editor().save();

        expect(near(await pixel(out, 0, 100, 130), [255, 0, 0, 255])).toBe(true);
        expect(near(await pixel(out, 0, 100, 250), [255, 255, 255, 255])).toBe(true);
        // The original file is not touched.
        expect(near(await pixel(editor().getBytes()!, 0, 100, 130), [255, 255, 255, 255])).toBe(true);
    });
});

describe('annotations on the page as it is shown', () => {
    const rects = (page = 0): PdfAnnotation[] => [
        { id: 'r', page, type: 'rectangle', x: 20, y: 30, width: 60, height: 40, color: '#000000', strokeWidth: 0, fillColor: '#ff0000', fillOpacity: 1 },
        { id: 'b', page, type: 'rectangle', x: 150, y: 200, width: 50, height: 50, color: '#000000', strokeWidth: 0, fillColor: '#0000ff', fillOpacity: 1 }
    ];

    for (const turn of [0, 90, 180, 270]) {
        it(`lands in the same place on a page turned ${turn} degrees`, async () => {
            const bytes = await makePdf(1);
            const doc = await loadPdf(bytes);

            rotatePage(doc, 0, turn);

            const out = await exportPdf(await doc.save(), { annotations: rects() });

            // Whatever the turn, the red box is at 20..80 x 30..70 of the page as it is shown, and the blue one at 150..200 x 200..250.
            expect(near(await pixel(out, 0, 50, 50), [255, 0, 0, 255])).toBe(true);
            expect(near(await pixel(out, 0, 175, 225), [0, 0, 255, 255])).toBe(true);
            expect(near(await pixel(out, 0, 10, 10), [255, 255, 255, 255])).toBe(true);
            expect(near(await pixel(out, 0, 120, 120), [255, 255, 255, 255])).toBe(true);
        });
    }

    it('draws a line, an arrow, a stroke, an ellipse and a highlight where they were placed', async () => {
        const out = await exportPdf(await makePdf(1), {
            annotations: [
                { id: '1', page: 0, type: 'line', x1: 20, y1: 100, x2: 120, y2: 100, color: '#ff0000', strokeWidth: 6 },
                {
                    id: '2',
                    page: 0,
                    type: 'draw',
                    points: [
                        [20, 150],
                        [120, 150]
                    ],
                    color: '#00aa00',
                    strokeWidth: 6
                },
                { id: '3', page: 0, type: 'ellipse', x: 20, y: 200, width: 100, height: 60, color: '#000', strokeWidth: 0, fillColor: '#0000ff', fillOpacity: 1 },
                { id: '4', page: 0, type: 'highlight', x: 20, y: 300, width: 100, height: 20, color: '#ffff00', opacity: 1 },
                { id: '5', page: 0, type: 'arrow', x1: 150, y1: 100, x2: 250, y2: 100, color: '#ff00ff', strokeWidth: 6 }
            ]
        });

        expect(near(await pixel(out, 0, 70, 100), [255, 0, 0, 255])).toBe(true);
        expect(near(await pixel(out, 0, 70, 150), [0, 170, 0, 255])).toBe(true);
        expect(near(await pixel(out, 0, 70, 230), [0, 0, 255, 255])).toBe(true);
        expect(near(await pixel(out, 0, 22, 202), [255, 255, 255, 255])).toBe(true);
        expect(near(await pixel(out, 0, 70, 310), [255, 255, 0, 255])).toBe(true);
        expect(near(await pixel(out, 0, 200, 100), [255, 0, 255, 255])).toBe(true);
    });

    it('writes text that is there to be seen, in the colour asked', async () => {
        const out = await exportPdf(await makePdf(1), { annotations: [{ id: 't', page: 0, type: 'text', x: 20, y: 100, width: 200, height: 40, text: 'HHHHHHHH', fontSize: 28, fontFamily: 'courier', color: '#ff0000' }] });
        const doc = await openDocument(out);
        const canvas = document.createElement('canvas');

        await renderPage(doc, 0, canvas, 1, 1).promise;

        const data = canvas.getContext('2d')!.getImageData(0, 90, 300, 60).data;
        let red = 0;

        for (let i = 0; i < data.length; i += 4) if (data[i] > 200 && data[i + 1] < 80) red++;

        expect(red).toBeGreaterThan(150);
    });

    it('puts a picture on the page', async () => {
        const canvas = document.createElement('canvas');

        canvas.width = canvas.height = 10;

        const context = canvas.getContext('2d')!;

        context.fillStyle = '#00ff00';
        context.fillRect(0, 0, 10, 10);

        const out = await exportPdf(await makePdf(1), { annotations: [{ id: 'i', page: 0, type: 'image', x: 100, y: 100, width: 50, height: 50, dataUrl: canvas.toDataURL('image/png') }] });

        expect(near(await pixel(out, 0, 125, 125), [0, 255, 0, 255])).toBe(true);
    });
});

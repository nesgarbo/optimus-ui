import { PDFDocument, StandardFonts } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import type { PdfAnnotation } from '@openng/optimus-ui/types/pdfeditor';
import { applyFormValues, createTextMeasurer, deletePage, drawAnnotations, exportPdf, extractPages, flattenForm, insertBlankPage, loadPdf, looksLikePdf, mergePdf, movePage, pageInfos, readForm, rotatePage, wrapText } from './pdf-writer';

async function sample(pages = 3, size: [number, number] = [300, 400]): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);

    for (let i = 0; i < pages; i++) doc.addPage(size).drawText(`Page ${i + 1}`, { x: 20, y: 360, size: 18, font });

    return doc.save();
}

async function withForm(): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    const page = doc.addPage([300, 400]);
    const second = doc.addPage([300, 400]);
    const form = doc.getForm();

    form.createTextField('name').addToPage(page, { x: 20, y: 340, width: 200, height: 24 });
    form.getTextField('name').setText('Ada');
    form.createCheckBox('agree').addToPage(page, { x: 20, y: 300, width: 16, height: 16 });
    form.createDropdown('size').addToPage(second, { x: 20, y: 340, width: 100, height: 22 });
    form.getDropdown('size').addOptions(['S', 'M', 'L']);

    const radio = form.createRadioGroup('plan');

    radio.addOptionToPage('free', page, { x: 20, y: 260, width: 14, height: 14 });
    radio.addOptionToPage('pro', page, { x: 80, y: 260, width: 14, height: 14 });

    return doc.save();
}

describe('pages', () => {
    it('reports the size each page is shown at, turned or not', async () => {
        const doc = await loadPdf(await sample(2));

        rotatePage(doc, 1, 90);

        expect(pageInfos(doc)).toEqual([
            { index: 0, width: 300, height: 400, rotation: 0 },
            { index: 1, width: 400, height: 300, rotation: 90 }
        ]);
    });

    it('turns a page clockwise and anticlockwise, and a turn that goes round comes back', async () => {
        const doc = await loadPdf(await sample(1));

        rotatePage(doc, 0, 90);
        rotatePage(doc, 0, 90);
        expect(pageInfos(doc)[0].rotation).toBe(180);
        rotatePage(doc, 0, -270);
        expect(pageInfos(doc)[0].rotation).toBe(270);
        rotatePage(doc, 0, 90);
        expect(pageInfos(doc)[0].rotation).toBe(0);
    });

    it('deletes a page, and keeps the last one', async () => {
        const doc = await loadPdf(await sample(2));

        deletePage(doc, 0);
        expect(doc.getPageCount()).toBe(1);
        expect(() => deletePage(doc, 0)).toThrow('at least one page');
    });

    it('moves a page', async () => {
        const doc = await loadPdf(await sample(3, [300, 400]));

        doc.getPage(0).setSize(100, 100);
        doc.getPage(1).setSize(200, 200);
        await movePage(doc, 0, 2);

        expect(doc.getPages().map((p) => p.getWidth())).toEqual([200, 300, 100]);

        await movePage(doc, 2, 0);

        expect(doc.getPages().map((p) => p.getWidth())).toEqual([100, 200, 300]);
    });

    it('adds a blank page as large as the one before it, or as asked', async () => {
        const doc = await loadPdf(await sample(2, [300, 400]));

        insertBlankPage(doc, 1);
        insertBlankPage(doc, 0, { width: 50, height: 60 });
        insertBlankPage(doc, 99);

        expect(doc.getPages().map((p) => [p.getWidth(), p.getHeight()])).toEqual([
            [50, 60],
            [300, 400],
            [300, 400],
            [300, 400],
            [300, 400]
        ]);
    });

    it('merges another document in, at a position', async () => {
        const doc = await loadPdf(await sample(2, [300, 400]));
        const added = await mergePdf(doc, await sample(3, [100, 100]), 1);

        expect(added).toBe(3);
        expect(doc.getPages().map((p) => p.getWidth())).toEqual([300, 100, 100, 100, 300]);
    });

    it('extracts some pages into a new file', async () => {
        const doc = await loadPdf(await sample(4));
        const out = await loadPdf(await extractPages(doc, [3, 1]));

        expect(out.getPageCount()).toBe(2);
    });

    it('knows a PDF when it sees one', async () => {
        expect(looksLikePdf(await sample(1))).toBe(true);
        expect(looksLikePdf(new TextEncoder().encode('hello'))).toBe(false);
    });
});

describe('annotations', () => {
    const all: PdfAnnotation[] = [
        { id: '1', page: 0, type: 'text', x: 20, y: 20, width: 120, height: 40, text: 'Hello world, this wraps', fontSize: 12, fontFamily: 'times', color: '#ff0000' },
        { id: '2', page: 0, type: 'highlight', x: 20, y: 80, width: 100, height: 14, color: '#ffff00', opacity: 0.4 },
        { id: '3', page: 0, type: 'rectangle', x: 20, y: 110, width: 60, height: 30, color: '#0000ff', strokeWidth: 2, fillColor: '#00ff00', fillOpacity: 0.5 },
        { id: '4', page: 1, type: 'ellipse', x: 20, y: 110, width: 60, height: 30, color: '#0000ff', strokeWidth: 2, fillColor: '', fillOpacity: 1 },
        { id: '5', page: 1, type: 'line', x1: 10, y1: 10, x2: 100, y2: 100, color: '#000000', strokeWidth: 2 },
        { id: '6', page: 1, type: 'arrow', x1: 10, y1: 200, x2: 100, y2: 150, color: '#000000', strokeWidth: 2 },
        {
            id: '7',
            page: 2,
            type: 'draw',
            points: [
                [10, 10],
                [30, 40],
                [60, 20]
            ],
            color: '#8800ff',
            strokeWidth: 3
        },
        { id: '8', page: 2, type: 'draw', points: [[100, 100]], color: '#8800ff', strokeWidth: 4 }
    ];

    it('are written into the pages as content, and the file still opens with the same pages', async () => {
        const bytes = await sample(3);
        const out = await exportPdf(bytes, { annotations: all });

        expect(out.length).toBeGreaterThan(bytes.length);
        expect((await loadPdf(out)).getPageCount()).toBe(3);
    });

    it('can hold a picture, a PNG or a JPEG', async () => {
        const doc = await PDFDocument.create();

        doc.addPage([200, 200]);

        const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==';

        await drawAnnotations(doc, [{ id: 'i', page: 0, type: 'image', x: 10, y: 10, width: 50, height: 50, dataUrl: png }]);

        expect((await PDFDocument.load(await doc.save())).getPageCount()).toBe(1);
    });

    it('skip a page that is not there, and an empty list does nothing', async () => {
        const doc = await loadPdf(await sample(1));

        await drawAnnotations(doc, [{ ...(all[2] as any), page: 7 }]);
        await drawAnnotations(doc, []);
        expect(doc.getPageCount()).toBe(1);
    });

    it('cope with characters a standard font does not have', async () => {
        const doc = await loadPdf(await sample(1));

        await expect(drawAnnotations(doc, [{ ...(all[0] as any), text: 'Привет 日本 ok ñ é' }])).resolves.toBeUndefined();
    });

    it('wrap text where it stops fitting, at newlines, and inside a word too long for a line', async () => {
        const measure = await createTextMeasurer();
        const width = (t: string) => measure(t, 10, 'helvetica');

        expect(wrapText('one two three four five six', width('one two three') + 1, width)).toEqual(['one two three', 'four five six']);
        expect(wrapText('a\n\nb', 500, width)).toEqual(['a', '', 'b']);

        const lines = wrapText('supercalifragilisticexpialidocious', width('supercali') + 1, width);

        expect(lines.length).toBeGreaterThan(2);
        expect(lines.join('')).toBe('supercalifragilisticexpialidocious');
        expect(lines.every((l) => width(l) <= width('supercali') + 1)).toBe(true);
    });

    it('measure the three standard fonts differently', async () => {
        const measure = await createTextMeasurer();
        const w = ['helvetica', 'times', 'courier'].map((f) => measure('Hello World', 12, f as any));

        expect(new Set(w).size).toBe(3);
        expect(w[2]).toBeCloseTo(11 * 0.6 * 12, 1);
    });
});

describe('form', () => {
    it('lists the fields with their type, value, page and place', async () => {
        const fields = readForm(await loadPdf(await withForm()));
        const by = (name: string) => fields.filter((f) => f.name === name);

        expect(fields.map((f) => f.name)).toEqual(['name', 'agree', 'size', 'plan', 'plan']);
        expect(by('name')[0]).toMatchObject({ type: 'text', page: 0, value: 'Ada' });
        // pdf-lib adds the border around the box it is given, so the widget is a point or two larger.
        expect(by('name')[0].width).toBeGreaterThanOrEqual(200);
        expect(by('name')[0].width).toBeLessThanOrEqual(202);
        expect(by('name')[0].x).toBeLessThanOrEqual(20);
        expect(by('name')[0].y + by('name')[0].height).toBeLessThanOrEqual(400 - 340 + 2);
        expect(by('agree')[0]).toMatchObject({ type: 'checkbox', value: false });
        expect(by('size')[0]).toMatchObject({ type: 'dropdown', page: 1, options: ['S', 'M', 'L'] });
        expect(by('plan').map((f) => f.option)).toEqual(['free', 'pro']);
        expect(by('plan')[0].type).toBe('radio');
    });

    it('places a field of a turned page as the page is shown', async () => {
        const doc = await loadPdf(await withForm());

        rotatePage(doc, 0, 90);

        const f = readForm(doc).find((x) => x.name === 'name')!;

        // A 200x24 box turned a quarter is 24 wide and 200 tall.
        expect(f.width).toBeCloseTo(25, 0);
        expect(f.height).toBeCloseTo(201, 0);
    });

    it('fills in the fields, and the values come back out of the saved file', async () => {
        const out = await exportPdf(await withForm(), { formValues: { name: 'Grace', agree: true, size: 'L', plan: 'pro', missing: 'x' } });
        const fields = readForm(await loadPdf(out));
        const value = (name: string) => fields.find((f) => f.name === name)!.value;

        expect(value('name')).toBe('Grace');
        expect(value('agree')).toBe(true);
        expect(value('size')).toBe('L');
        expect(value('plan')).toBe('pro');
    });

    it('ignores a value the field cannot hold', async () => {
        const doc = await loadPdf(await withForm());

        expect(() => applyFormValues(doc, { plan: 'gold', agree: 'not a boolean' as any })).not.toThrow();
        expect(readForm(doc).find((f) => f.name === 'plan')!.value).toBe('');
    });

    it('can be made part of the pages', async () => {
        const doc = await loadPdf(await withForm());

        flattenForm(doc);

        expect(readForm(doc)).toEqual([]);
    });

    it('is empty for a document without a form', async () => {
        expect(readForm(await loadPdf(await sample(1)))).toEqual([]);
    });
});

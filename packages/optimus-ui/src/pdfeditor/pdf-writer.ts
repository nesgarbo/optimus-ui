/**
 * The PDF editor's hands: everything that reads or changes a document, on top of pdf-lib.
 *
 * Nothing here knows about the screen. Annotations are written into the pages as ordinary page content, the fields of the form
 * are filled in, and pages can be turned, deleted, moved, added and merged.
 *
 * @module pdf-writer
 */
import {
    concatTransformationMatrix,
    degrees,
    LineCapStyle,
    PDFArray,
    PDFCheckBox,
    PDFDict,
    PDFDocument,
    PDFDropdown,
    PDFOptionList,
    PDFRadioGroup,
    PDFRef,
    PDFSignature,
    PDFTextField,
    popGraphicsState,
    pushGraphicsState,
    rgb,
    StandardFonts,
    type PDFFont,
    type PDFPage
} from 'pdf-lib';
import type { PdfAnnotation, PdfFontFamily, PdfFormField, PdfFormFieldType, PdfFormValues, PdfImageAnnotation, PdfPageInfo, PdfRotation } from '@openng/optimus-ui/types/pdfeditor';
import { ASCENT, normalizeRotation, parseColor, shownSize, shownToUser, userBoxToShown } from './pdf-model';

/** Padding inside a text annotation, in points. */
export const TEXT_PADDING = 2;
/** Space between lines, as a multiple of the font size. */
export const LINE_HEIGHT = 1.2;

const FONT_FILES: Record<PdfFontFamily, StandardFonts> = {
    helvetica: StandardFonts.Helvetica,
    times: StandardFonts.TimesRoman,
    courier: StandardFonts.Courier
};

/** Opens a document. A document that is encrypted is opened as far as the library allows. */
export function loadPdf(bytes: ArrayBuffer | Uint8Array): Promise<PDFDocument> {
    return PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
}

/** Where a page is, as it is shown. */
interface PageGeometry {
    x0: number;
    y0: number;
    width: number;
    height: number;
    rotation: PdfRotation;
}

function geometry(page: PDFPage): PageGeometry {
    const box = page.getCropBox();

    return { x0: box.x, y0: box.y, width: box.width, height: box.height, rotation: normalizeRotation(page.getRotation().angle) };
}

/** The pages of a document, with the size each is shown at. */
export function pageInfos(doc: PDFDocument): PdfPageInfo[] {
    return doc.getPages().map((page, index) => {
        const g = geometry(page);
        const shown = shownSize(g.width, g.height, g.rotation);

        return { index, width: shown.width, height: shown.height, rotation: g.rotation };
    });
}

// -------------------------------------------------------------------------------------------------
// Text
// -------------------------------------------------------------------------------------------------

/** What the measurer can tell about text: how wide it is, and how far its first line rises above the baseline. */
export interface TextMeasurer {
    (text: string, size: number, family: PdfFontFamily): number;
    /** The height of the first line above its baseline, in points. */
    ascent(text: string, size: number, family: PdfFontFamily): number;
}

/** The characters a standard font has besides Latin-1: the ones of Windows-1252 that sit in the 0x80-0x9F range. */
const WIN_ANSI_EXTRA = new Set('€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ');

/** Whether text has a character that the standard fonts do not, so that it needs a font of its own. */
export function needsUnicode(text: string): boolean {
    for (const char of text) {
        const code = char.codePointAt(0)!;

        if (code === 10 || code === 13 || (code >= 32 && code < 127) || (code >= 160 && code <= 255)) continue;
        if (WIN_ANSI_EXTRA.has(char)) continue;

        return true;
    }

    return false;
}

/** Embeds fontkit, which reads TrueType and OpenType files, in a document. */
async function useFontkit(doc: PDFDocument): Promise<void> {
    const fontkit = (await import('@pdf-lib/fontkit')).default;

    doc.registerFontkit(fontkit);
}

/**
 * Builds a measurer from the real metrics of the standard fonts, so that the screen wraps text as the file does. With a font of
 * its own -- a TrueType or OpenType file -- it measures the text the standard fonts cannot show with that font.
 */
export async function createTextMeasurer(unicodeFont?: ArrayBuffer | Uint8Array | null): Promise<TextMeasurer> {
    const doc = await PDFDocument.create();
    const fonts = {} as Record<PdfFontFamily, PDFFont>;

    for (const family of Object.keys(FONT_FILES) as PdfFontFamily[]) fonts[family] = await doc.embedFont(FONT_FILES[family]);

    let custom: PDFFont | null = null;

    if (unicodeFont) {
        try {
            await useFontkit(doc);
            custom = await doc.embedFont(unicodeFont, { subset: false });
        } catch {
            // A file that is not a font is as good as none.
        }
    }

    const pick = (text: string, family: PdfFontFamily) => (custom && needsUnicode(text) ? custom : fonts[family]);
    const measure = ((text: string, size: number, family: PdfFontFamily) => {
        const font = pick(text, family);

        return font.widthOfTextAtSize(font === custom ? text : safeText(font, text), size);
    }) as TextMeasurer;

    measure.ascent = (text, size, family) => {
        const font = pick(text, family);

        return font === custom ? font.heightAtSize(size, { descender: false }) : ASCENT[family] * size;
    };

    return measure;
}

/** Replaces what a standard font cannot show -- it has the characters of Latin-1 and a few more -- with a question mark. */
export function safeText(font: PDFFont, text: string): string {
    const set = new Set(font.getCharacterSet());
    let out = '';

    for (const char of text) out += char === '\n' || set.has(char.codePointAt(0)!) ? char : '?';

    return out;
}

/** Breaks text into lines that fit a width: at the newlines, then at spaces, and inside a word that is longer than the line. */
export function wrapText(text: string, maxWidth: number, measure: (text: string) => number): string[] {
    const lines: string[] = [];

    for (const paragraph of text.split('\n')) {
        let line = '';

        for (const word of paragraph.split(' ')) {
            const candidate = line ? `${line} ${word}` : word;

            if (measure(candidate) <= maxWidth || !candidate) {
                line = candidate;
                continue;
            }

            if (line) lines.push(line);

            line = word;

            // A word wider than the line is cut where it stops fitting.
            while (line.length > 1 && measure(line) > maxWidth) {
                let cut = line.length - 1;

                while (cut > 1 && measure(line.slice(0, cut)) > maxWidth) cut--;

                lines.push(line.slice(0, cut));
                line = line.slice(cut);
            }
        }

        lines.push(line);
    }

    return lines;
}

// -------------------------------------------------------------------------------------------------
// Annotations
// -------------------------------------------------------------------------------------------------

function dataUrlBytes(url: string): { bytes: Uint8Array; mime: string } {
    const match = /^data:([^;,]+)(;base64)?,(.*)$/s.exec(url);

    if (!match) throw new Error('Not a data URL');

    const raw = match[2] ? atob(match[3]) : decodeURIComponent(match[3]);
    const bytes = new Uint8Array(raw.length);

    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);

    return { bytes, mime: match[1] };
}

/** Writes annotations into the pages of a document, as page content. They are no longer annotations after that: they are part of the page. */
export async function drawAnnotations(doc: PDFDocument, annotations: readonly PdfAnnotation[], options: { unicodeFont?: ArrayBuffer | Uint8Array | null } = {}): Promise<void> {
    if (!annotations.length) return;

    const pages = doc.getPages();
    const fonts = new Map<PdfFontFamily, PDFFont>();
    const font = async (family: PdfFontFamily) => {
        if (!fonts.has(family)) fonts.set(family, await doc.embedFont(FONT_FILES[family] ?? StandardFonts.Helvetica));

        return fonts.get(family)!;
    };
    const images = new Map<string, Awaited<ReturnType<PDFDocument['embedPng']>>>();
    let custom: PDFFont | null | undefined;
    // The font of its own is embedded once, and only if some text needs it.
    const unicode = async (): Promise<PDFFont | null> => {
        if (custom !== undefined) return custom;

        custom = null;

        if (options.unicodeFont) {
            try {
                await useFontkit(doc);
                custom = await doc.embedFont(options.unicodeFont, { subset: true });
            } catch {
                custom = null;
            }
        }

        return custom;
    };

    for (const a of annotations) {
        const page = pages[a.page];

        if (!page) continue;

        const g = geometry(page);
        const shown = shownSize(g.width, g.height, g.rotation);
        const m = shownToUser(g.width, g.height, g.rotation, g.x0, g.y0);
        // Annotations are placed from the top; the page content below is drawn from the bottom, so y is flipped once here.
        const up = (y: number) => shown.height - y;

        // From here on the page is drawn as it is shown, whatever its rotation.
        page.pushOperators(pushGraphicsState(), concatTransformationMatrix(m[0], m[1], m[2], m[3], m[4], m[5]));

        try {
            switch (a.type) {
                case 'highlight': {
                    const c = parseColor(a.color);

                    page.drawRectangle({ x: a.x, y: up(a.y + a.height), width: a.width, height: a.height, color: rgb(c.r, c.g, c.b), opacity: a.opacity });
                    break;
                }
                case 'rectangle':
                case 'ellipse': {
                    const stroke = parseColor(a.color);
                    const fill = a.fillColor ? parseColor(a.fillColor) : null;

                    if (a.type === 'rectangle') {
                        page.drawRectangle({
                            x: a.x,
                            y: up(a.y + a.height),
                            width: a.width,
                            height: a.height,
                            borderColor: a.strokeWidth > 0 ? rgb(stroke.r, stroke.g, stroke.b) : undefined,
                            borderWidth: a.strokeWidth,
                            color: fill ? rgb(fill.r, fill.g, fill.b) : undefined,
                            opacity: fill ? a.fillOpacity : undefined,
                            borderOpacity: 1
                        });
                    } else {
                        page.drawEllipse({
                            x: a.x + a.width / 2,
                            y: up(a.y + a.height / 2),
                            xScale: a.width / 2,
                            yScale: a.height / 2,
                            borderColor: a.strokeWidth > 0 ? rgb(stroke.r, stroke.g, stroke.b) : undefined,
                            borderWidth: a.strokeWidth,
                            color: fill ? rgb(fill.r, fill.g, fill.b) : undefined,
                            opacity: fill ? a.fillOpacity : undefined,
                            borderOpacity: 1
                        });
                    }

                    break;
                }
                case 'line':
                case 'arrow': {
                    const c = parseColor(a.color);
                    const color = rgb(c.r, c.g, c.b);
                    const line = (x1: number, y1: number, x2: number, y2: number) => page.drawLine({ start: { x: x1, y: up(y1) }, end: { x: x2, y: up(y2) }, thickness: a.strokeWidth, color, lineCap: LineCapStyle.Round });

                    line(a.x1, a.y1, a.x2, a.y2);

                    if (a.type === 'arrow') {
                        const angle = Math.atan2(a.y2 - a.y1, a.x2 - a.x1);
                        const head = Math.max(a.strokeWidth * 4, 10);

                        for (const side of [-1, 1]) line(a.x2, a.y2, a.x2 - head * Math.cos(angle + (side * Math.PI) / 7), a.y2 - head * Math.sin(angle + (side * Math.PI) / 7));
                    }

                    break;
                }
                case 'draw': {
                    if (!a.points.length) break;

                    const c = parseColor(a.color);
                    const color = rgb(c.r, c.g, c.b);

                    if (a.points.length === 1) {
                        page.drawCircle({ x: a.points[0][0], y: up(a.points[0][1]), size: a.strokeWidth / 2, color });
                        break;
                    }

                    // The path is in the page's own coordinates, which are the shown page's counted from the top: the origin is its top left.
                    const path = a.points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');

                    page.drawSvgPath(path, { x: 0, y: shown.height, borderColor: color, borderWidth: a.strokeWidth, borderLineCap: LineCapStyle.Round });
                    break;
                }
                case 'text': {
                    const own = needsUnicode(a.text) ? await unicode() : null;
                    const f = own ?? (await font(a.fontFamily));
                    const c = parseColor(a.color);
                    const clean = (s: string) => (own ? s : safeText(f, s));
                    const lines = wrapText(a.text, Math.max(a.width - TEXT_PADDING * 2, 1), (t) => f.widthOfTextAtSize(clean(t), a.fontSize));
                    const ascent = own ? own.heightAtSize(a.fontSize, { descender: false }) : ASCENT[a.fontFamily] * a.fontSize;

                    lines.forEach((text, i) => {
                        const baseline = up(a.y + TEXT_PADDING) - ascent - i * a.fontSize * LINE_HEIGHT;

                        if (text) page.drawText(clean(text), { x: a.x + TEXT_PADDING, y: baseline, size: a.fontSize, font: f, color: rgb(c.r, c.g, c.b) });
                    });
                    break;
                }
                case 'image':
                case 'signature': {
                    const key = (a as PdfImageAnnotation).dataUrl;
                    let image = images.get(key);

                    if (!image) {
                        const { bytes, mime } = dataUrlBytes(key);

                        image = mime === 'image/png' ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
                        images.set(key, image);
                    }

                    page.drawImage(image, { x: a.x, y: up(a.y + a.height), width: a.width, height: a.height });
                    break;
                }
            }
        } finally {
            page.pushOperators(popGraphicsState());
        }
    }
}

// -------------------------------------------------------------------------------------------------
// Form
// -------------------------------------------------------------------------------------------------

function fieldType(field: unknown): PdfFormFieldType {
    if (field instanceof PDFTextField) return 'text';
    if (field instanceof PDFCheckBox) return 'checkbox';
    if (field instanceof PDFRadioGroup) return 'radio';
    if (field instanceof PDFDropdown) return 'dropdown';
    if (field instanceof PDFOptionList) return 'list';
    if (field instanceof PDFSignature) return 'signature';

    return (field as { constructor: { name: string } }).constructor.name === 'PDFButton' ? 'button' : 'unknown';
}

/** The index of the page a widget is on. */
function pageOfWidget(doc: PDFDocument, widget: { dict: PDFDict; P: () => PDFRef | undefined }): number {
    const pages = doc.getPages();
    const ref = widget.P();

    if (ref) {
        const direct = pages.findIndex((p) => p.ref === ref);

        if (direct >= 0) return direct;
    }

    // A widget with no /P is found in the /Annots of the page that lists it.
    for (let i = 0; i < pages.length; i++) {
        const annots = pages[i].node.Annots();

        if (!(annots instanceof PDFArray)) continue;

        for (let k = 0; k < annots.size(); k++) if (doc.context.lookup(annots.get(k)) === widget.dict) return i;
    }

    return -1;
}

/** Lists the fields of the form of a document, with where each widget is on the page as it is shown. */
export function readForm(doc: PDFDocument): PdfFormField[] {
    let fields;

    try {
        fields = doc.getForm().getFields();
    } catch {
        return [];
    }

    const pages = doc.getPages();
    const out: PdfFormField[] = [];

    for (const field of fields) {
        const type = fieldType(field);
        const widgets = field.acroField.getWidgets();
        let value: PdfFormField['value'] = '';
        let options: string[] = [];
        let multiline = false;

        try {
            if (field instanceof PDFTextField) {
                value = field.getText() ?? '';
                multiline = field.isMultiline();
            } else if (field instanceof PDFCheckBox) value = field.isChecked();
            else if (field instanceof PDFRadioGroup) {
                value = field.getSelected() ?? '';
                options = field.getOptions();
            } else if (field instanceof PDFDropdown) {
                value = field.getSelected()[0] ?? '';
                options = field.getOptions();
            } else if (field instanceof PDFOptionList) {
                value = field.getSelected();
                options = field.getOptions();
            }
        } catch {
            // A field whose value cannot be read is listed with an empty one.
        }

        widgets.forEach((widget, w) => {
            const pageIndex = pageOfWidget(doc, widget as never);

            if (pageIndex < 0) return;

            const g = geometry(pages[pageIndex]);
            const rect = widget.getRectangle();
            const box = userBoxToShown(rect, g.width, g.height, g.rotation, g.x0, g.y0);
            let option: string | undefined;

            // The buttons of a group come in the order of its options, whatever the export value of each widget is.
            if (type === 'radio') option = options[w] ?? decodeName(String((widget as any).getOnValue?.() ?? ''));

            out.push({ name: field.getName(), type, page: pageIndex, ...box, readOnly: field.isReadOnly(), required: field.isRequired(), multiline, options, value, option });
        });
    }

    return out;
}

function decodeName(text: string): string {
    return text.replace(/^\//, '');
}

/** Fills in the fields of the form with values by name. A name that is not in the form, or a value of the wrong kind, is ignored. */
export function applyFormValues(doc: PDFDocument, values: PdfFormValues): void {
    if (!Object.keys(values).length) return;

    const form = doc.getForm();

    for (const [name, value] of Object.entries(values)) {
        const field = form.getFieldMaybe(name);

        if (!field) continue;

        try {
            if (field instanceof PDFTextField) field.setText(String(value ?? '') || undefined);
            else if (field instanceof PDFCheckBox) value ? field.check() : field.uncheck();
            else if (field instanceof PDFRadioGroup) value ? field.select(String(value)) : field.clear();
            else if (field instanceof PDFDropdown) value ? field.select(String(value)) : field.clear();
            else if (field instanceof PDFOptionList) {
                const chosen = Array.isArray(value) ? value : value ? [String(value)] : [];

                field.clear();
                chosen.length && field.select(chosen);
            }
        } catch {
            // An option the field does not have, or a value it cannot hold, leaves the field as it was.
        }
    }
}

/** Makes the fields of the form part of the page, so they can no longer be changed. */
export function flattenForm(doc: PDFDocument): void {
    try {
        doc.getForm().flatten();
    } catch {
        // A document without a form has nothing to flatten.
    }
}

// -------------------------------------------------------------------------------------------------
// Pages
// -------------------------------------------------------------------------------------------------

/** Turns a page by a multiple of 90 degrees, clockwise when positive. */
export function rotatePage(doc: PDFDocument, index: number, by: number): void {
    const page = doc.getPage(index);

    page.setRotation(degrees(normalizeRotation(page.getRotation().angle + by)));
}

/** Removes a page. A document keeps at least one. */
export function deletePage(doc: PDFDocument, index: number): void {
    if (doc.getPageCount() <= 1) throw new Error('A document needs at least one page');

    doc.removePage(index);
}

/** Moves a page from one position to another. */
export async function movePage(doc: PDFDocument, from: number, to: number): Promise<void> {
    if (from === to) return;

    const [copy] = await doc.copyPages(doc, [from]);

    doc.removePage(from);
    doc.insertPage(to, copy);
}

/** Adds an empty page, as large as the page next to it unless a size is given. */
export function insertBlankPage(doc: PDFDocument, at: number, size?: { width: number; height: number }): void {
    const neighbour = doc.getPageCount() ? doc.getPage(Math.min(Math.max(at - 1, 0), doc.getPageCount() - 1)) : null;
    const g = neighbour ? geometry(neighbour) : null;
    const width = size?.width ?? g?.width ?? 595.28;
    const height = size?.height ?? g?.height ?? 841.89;

    doc.insertPage(Math.min(Math.max(at, 0), doc.getPageCount()), [width, height]);
}

/** Copies every page of another document into this one, at a position. Returns how many were added. */
export async function mergePdf(doc: PDFDocument, other: ArrayBuffer | Uint8Array, at = doc.getPageCount()): Promise<number> {
    const source = await loadPdf(other);
    const copies = await doc.copyPages(source, source.getPageIndices());

    copies.forEach((page, i) => doc.insertPage(at + i, page));

    return copies.length;
}

/** A new document made of some pages of this one. */
export async function extractPages(doc: PDFDocument, indexes: readonly number[]): Promise<Uint8Array> {
    const out = await PDFDocument.create();
    const copies = await out.copyPages(doc, [...indexes]);

    copies.forEach((page) => out.addPage(page));

    return out.save();
}

// -------------------------------------------------------------------------------------------------
// Save
// -------------------------------------------------------------------------------------------------

/** Options of {@link exportPdf}. */
export interface ExportOptions {
    annotations?: readonly PdfAnnotation[];
    formValues?: PdfFormValues;
    /** Makes the form part of the pages. */
    flatten?: boolean;
    /** A TrueType or OpenType font for the text that the standard fonts cannot show. */
    unicodeFont?: ArrayBuffer | Uint8Array | null;
}

/** Makes the new file: the document with its form filled in and the annotations written into its pages. */
export async function exportPdf(bytes: ArrayBuffer | Uint8Array, options: ExportOptions = {}): Promise<Uint8Array> {
    const doc = await loadPdf(bytes);

    applyFormValues(doc, options.formValues ?? {});
    // The form is drawn before the annotations so that what is written over a field stays over it.
    if (options.flatten) flattenForm(doc);

    await drawAnnotations(doc, options.annotations ?? [], { unicodeFont: options.unicodeFont });

    return doc.save();
}

/** Whether bytes start like a PDF. */
export function looksLikePdf(bytes: Uint8Array): boolean {
    const head = new TextDecoder('latin1').decode(bytes.subarray(0, 1024));

    return head.includes('%PDF-');
}

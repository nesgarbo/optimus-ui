/**
 * Export: turning a rendered chart into a file.
 *
 * Both renderers support every format, but they get there differently. SVG serializes to true
 * vector output and rasterizes through an offscreen canvas when a bitmap is asked for; Canvas is
 * already a bitmap and wraps that bitmap in an SVG envelope when vector output is asked for. The
 * PDF is written by hand rather than pulled from a library, because embedding one JPEG in a
 * PDF-1.4 is a few hundred bytes of structure and a dependency for that would be poor value.
 */
import type { ExportFormat } from '@openng/optimus-ui/types/charts';
import { csvCell } from './csv';

/** What an export needs to know. */
export interface ExportRequest {
    /**
     * Output format.
     */
    format: ExportFormat;
    /**
     * Filename, without the extension.
     */
    filename?: string;
    /**
     * Pixel density multiplier for a raster export.
     */
    scale?: number;
    /**
     * Background colour. `'auto'` resolves to the chart's own background.
     */
    backgroundColor?: string | 'auto' | 'transparent';
    /**
     * The chart's background, used to resolve `'auto'`.
     */
    resolvedBackground?: string;
    /**
     * Chart width in CSS pixels.
     */
    width: number;
    /**
     * Chart height in CSS pixels.
     */
    height: number;
}

/** The MIME type each format is served as. */
const MIME: Record<ExportFormat, string> = {
    png: 'image/png',
    jpeg: 'image/jpeg',
    svg: 'image/svg+xml',
    pdf: 'application/pdf'
};

/** The file extension each format gets. */
const EXTENSION: Record<ExportFormat, string> = { png: 'png', jpeg: 'jpg', svg: 'svg', pdf: 'pdf' };

/** Resolves the background an export should paint behind the chart. */
export function resolveExportBackground(request: ExportRequest): string | null {
    const requested = request.backgroundColor ?? 'auto';

    if (requested === 'transparent') return null;

    if (requested === 'auto') {
        const resolved = request.resolvedBackground;

        // A transparent chart background exports as white for the opaque formats, because JPEG has
        // no alpha and a PDF page is paper.
        if (!resolved || resolved === 'transparent' || resolved === 'rgba(0, 0, 0, 0)') {
            return request.format === 'jpeg' || request.format === 'pdf' ? '#ffffff' : null;
        }

        return resolved;
    }

    return requested;
}

/**
 * Serializes an SVG element to standalone markup.
 *
 * Computed styles are inlined, because an exported SVG leaves the page its stylesheet lives on: a
 * chart whose colours come from CSS custom properties would otherwise open as a black-on-black
 * silhouette in an image viewer.
 */
export function serializeSvg(svg: SVGSVGElement, background: string | null, width: number, height: number): string {
    const clone = svg.cloneNode(true) as SVGSVGElement;

    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    clone.setAttribute('width', String(width));
    clone.setAttribute('height', String(height));

    if (!clone.getAttribute('viewBox')) clone.setAttribute('viewBox', `0 0 ${width} ${height}`);

    inlineComputedStyles(svg, clone);

    if (background) {
        const rect = clone.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'rect');

        rect.setAttribute('x', '0');
        rect.setAttribute('y', '0');
        rect.setAttribute('width', String(width));
        rect.setAttribute('height', String(height));
        rect.setAttribute('fill', background);
        clone.insertBefore(rect, clone.firstChild);
    }

    return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}`;
}

/** The presentation properties worth carrying into an exported SVG. */
const INLINED_PROPERTIES = ['fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'opacity', 'font-family', 'font-size', 'font-weight', 'text-anchor', 'dominant-baseline'];

/** Elements that carry no painted style of their own. */
const UNSTYLED_TAGS = new Set(['defs', 'clipPath', 'stop', 'title', 'desc', 'linearGradient', 'radialGradient', 'pattern', 'mask']);

/**
 * Whether an element can look different once it leaves the page.
 *
 * Only an element that a stylesheet reaches (it has a class or an inline style) or that names a
 * custom property can. Reading the computed style of every other node -- most of a dense chart --
 * is the expensive part of an export and changes nothing.
 */
function needsInlining(element: Element): boolean {
    if (UNSTYLED_TAGS.has(element.tagName)) return false;
    if (element.hasAttribute('class') || element.hasAttribute('style')) return true;

    return INLINED_PROPERTIES.some((property) => element.getAttribute(property)?.includes('var(') === true);
}

/** Walks the live tree and the clone in step, copying resolved styles onto the clone. */
function inlineComputedStyles(source: Element, clone: Element): void {
    if (typeof getComputedStyle !== 'function') return;

    const sourceNodes = [source, ...source.querySelectorAll('*')];
    const cloneNodes = [clone, ...clone.querySelectorAll('*')];

    for (let i = 0; i < sourceNodes.length && i < cloneNodes.length; i++) {
        // The root is always read: it is where inherited properties such as the font start.
        if (i > 0 && !needsInlining(sourceNodes[i])) continue;

        const computed = getComputedStyle(sourceNodes[i]);
        const target = cloneNodes[i] as SVGElement;

        for (const property of INLINED_PROPERTIES) {
            const value = computed.getPropertyValue(property);

            if (!value || value === 'none' || value === 'normal') continue;
            target.setAttribute(property, value);
        }
    }
}

/** How long a rasterization may take before the export gives up. */
const RASTERIZE_TIMEOUT_MS = 15000;

/** The longest side browsers reliably allocate a canvas for. */
const MAX_CANVAS_SIDE = 16384;

/** The largest canvas area browsers reliably allocate, in pixels. */
const MAX_CANVAS_AREA = 120_000_000;

/**
 * The pixel size an export is drawn at.
 *
 * `scale` is a request, not a promise: a large chart at a high density asks for a canvas the
 * browser refuses to allocate, and what comes back is a blank image rather than an error. The scale
 * is lowered until the canvas fits.
 */
export function exportPixelSize(width: number, height: number, scale: number): { width: number; height: number } {
    const safeScale = Number.isFinite(scale) && scale > 0 ? scale : 1;
    const limited = Math.min(safeScale, MAX_CANVAS_SIDE / Math.max(width, 1), MAX_CANVAS_SIDE / Math.max(height, 1), Math.sqrt(MAX_CANVAS_AREA / Math.max(width * height, 1)));

    return { width: Math.max(1, Math.floor(width * limited)), height: Math.max(1, Math.floor(height * limited)) };
}

/** Rasterizes SVG markup onto a canvas at the requested density. */
export async function rasterizeSvg(markup: string, width: number, height: number, scale: number, background: string | null): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    const pixels = exportPixelSize(width, height, scale);

    canvas.width = pixels.width;
    canvas.height = pixels.height;

    const ctx = canvas.getContext('2d');

    if (!ctx) return canvas;

    if (background) {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
    const image = new Image();

    // A data URL keeps the image same-origin, so the canvas is not tainted and `toDataURL` still
    // works. A blob URL would have done too, but this needs no revoking.
    await new Promise<void>((resolve, reject) => {
        // A browser that never settles the load would leave the export button spinning forever.
        const timer = setTimeout(() => reject(new Error('Chart export timed out while rasterizing the SVG.')), RASTERIZE_TIMEOUT_MS);

        image.onload = () => {
            clearTimeout(timer);
            resolve();
        };
        image.onerror = () => {
            clearTimeout(timer);
            reject(new Error('Chart export failed to rasterize the SVG.'));
        };
        image.src = url;
    });

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    return canvas;
}

/** Copies a canvas at a new density, painting a background under it when one is asked for. */
export function recanvas(source: HTMLCanvasElement, width: number, height: number, scale: number, background: string | null): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const pixels = exportPixelSize(width, height, scale);

    canvas.width = pixels.width;
    canvas.height = pixels.height;

    const ctx = canvas.getContext('2d');

    if (!ctx) return canvas;

    if (background) {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

    return canvas;
}

/** Wraps a raster image in an SVG envelope, which is how a Canvas chart answers an SVG export. */
export function wrapRasterInSvg(dataUrl: string, width: number, height: number): string {
    return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><image width="${width}" height="${height}" xlink:href="${dataUrl}" /></svg>`;
}

/**
 * Builds a PDF-1.4 document holding one JPEG.
 *
 * The structure is written by hand: a catalog, a pages node, one page, a content stream that draws
 * the image to fill it, and the image XObject with `DCTDecode` so the JPEG bytes are embedded
 * as-is rather than re-encoded. That is the whole of what a single-image PDF needs, and it keeps
 * the export dependency-free.
 */
export function buildPdf(jpegBytes: Uint8Array, width: number, height: number): Blob {
    // The image dictionary has to state the JPEG's own pixel size. The page is in CSS pixels, but the
    // image was rendered at a higher density, and declaring the page size for it makes viewers
    // decode the scanlines at the wrong width.
    const pixels = jpegDimensions(jpegBytes) ?? { width, height };
    const encoder = new TextEncoder();
    const parts: (string | Uint8Array)[] = [];
    const offsets: number[] = [];
    let length = 0;

    const push = (chunk: string | Uint8Array) => {
        parts.push(chunk);
        length += typeof chunk === 'string' ? encoder.encode(chunk).length : chunk.length;
    };

    const startObject = () => offsets.push(length);

    push('%PDF-1.4\n');

    startObject();
    push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

    startObject();
    push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

    startObject();
    push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>\nendobj\n`);

    // The content stream maps the unit image square onto the page with a single transform.
    const content = `q\n${width} 0 0 ${height} 0 0 cm\n/Im0 Do\nQ\n`;

    startObject();
    push(`4 0 obj\n<< /Length ${encoder.encode(content).length} >>\nstream\n${content}endstream\nendobj\n`);

    startObject();
    push(`5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${pixels.width} /Height ${pixels.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`);
    push(jpegBytes);
    push('\nendstream\nendobj\n');

    const xrefOffset = length;

    push(`xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n`);

    for (const offset of offsets) push(`${String(offset).padStart(10, '0')} 00000 n \n`);

    push(`trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

    const blobParts = parts.map((part) => (typeof part === 'string' ? encoder.encode(part) : part));

    return new Blob(blobParts as BlobPart[], { type: MIME.pdf });
}

/** Reads the pixel size out of a JPEG's start-of-frame marker, or `null` when it cannot be found. */
export function jpegDimensions(bytes: Uint8Array): { width: number; height: number } | null {
    if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;

    let offset = 2;

    while (offset + 9 < bytes.length) {
        if (bytes[offset] !== 0xff) {
            offset++;
            continue;
        }

        const marker = bytes[offset + 1];

        // Fill bytes and standalone markers carry no length.
        if (marker === 0xff) {
            offset++;
            continue;
        }

        if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
            offset += 2;
            continue;
        }

        const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
        // Start-of-frame markers, except the three that are not frame headers (DHT, JPG, DAC).
        const isFrame = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;

        if (isFrame) return { height: (bytes[offset + 5] << 8) | bytes[offset + 6], width: (bytes[offset + 7] << 8) | bytes[offset + 8] };

        offset += 2 + length;
    }

    return null;
}

/** Strips the header off a data URL and decodes the payload. */
export function dataUrlToBytes(dataUrl: string): Uint8Array {
    const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    return bytes;
}

/** Turns markup into a `Blob`. */
export function markupToBlob(markup: string, format: ExportFormat): Blob {
    return new Blob([markup], { type: `${MIME[format]};charset=utf-8` });
}

/** Hands a blob to the browser as a download. */
export function downloadBlob(blob: Blob, filename: string, format: ExportFormat): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = `${filename}.${EXTENSION[format]}`;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    // Revoked on a later task so the navigation the click started has already read the URL.
    setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Builds the CSV a chart's data table exports as. Cells that a spreadsheet would run as a formula are defused. */
export function buildCsv(rows: readonly (readonly (string | number)[])[]): string {
    return rows.map((row) => row.map((cell) => csvCell(String(cell ?? ''))).join(',')).join('\r\n');
}

/** Turns CSV text into the `Blob` that gets downloaded. The byte order mark makes Excel read the file as UTF-8. */
export function csvToBlob(csv: string): Blob {
    return new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' });
}

/** The MIME type of a format. */
export function mimeOf(format: ExportFormat): string {
    return MIME[format];
}

/** The file extension of a format. */
export function extensionOf(format: ExportFormat): string {
    return EXTENSION[format];
}

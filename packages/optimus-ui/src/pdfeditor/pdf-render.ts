/**
 * The PDF editor's eyes: it draws pages on a canvas, with pdf.js.
 *
 * pdf.js is a heavy, optional peer dependency, so it is imported the first time a page is shown. Its worker is run on a thread of
 * its own when a `workerSrc` is given, and in the page when it is not, which needs no setup but is slower on a big file.
 *
 * @module pdf-render
 */
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';

type PdfJs = typeof import('pdfjs-dist');

/** Where the files pdf.js reads on demand are: `cmaps/`, `standard_fonts/` and `wasm/` of the `pdfjs-dist` package. */
export interface RenderAssets {
    /** Folder holding `cmaps/`, `standard_fonts/` and `wasm/`. Without it, text in a font that is not embedded is drawn in a similar one. */
    assetsUrl?: string;
    /** URL of `pdf.worker.min.mjs`. Without it, the worker runs in the page. */
    workerSrc?: string;
}

let library: Promise<PdfJs> | null = null;
let configured = '';

/** Loads pdf.js once, and points it at its worker. */
export function loadPdfJs(options: RenderAssets = {}): Promise<PdfJs> {
    const key = options.workerSrc ?? '';

    if (!library || key !== configured) {
        configured = key;
        library = (async () => {
            const lib = await import('pdfjs-dist');

            if (key) {
                lib.GlobalWorkerOptions.workerSrc = key;
            } else {
                // Evaluating the worker in the page makes it register itself, and pdf.js then talks to it without a thread.
                // @ts-ignore -- the worker has no types
                await import('pdfjs-dist/build/pdf.worker.mjs');
            }

            return lib;
        })();
    }

    return library;
}

/** Opens a document for drawing. The bytes are copied, because pdf.js takes the buffer it is given. */
export async function openDocument(bytes: Uint8Array, options: RenderAssets = {}): Promise<PDFDocumentProxy> {
    const lib = await loadPdfJs(options);
    const base = options.assetsUrl ? options.assetsUrl.replace(/\/?$/, '/') : '';

    return lib.getDocument({
        data: bytes.slice(),
        ...(base ? { cMapUrl: `${base}cmaps/`, cMapPacked: true, standardFontDataUrl: `${base}standard_fonts/`, wasmUrl: `${base}wasm/` } : {}),
        useSystemFonts: true
    }).promise;
}

/** A drawing that can be stopped. */
export interface PageRender {
    promise: Promise<void>;
    cancel(): void;
}

/**
 * Draws a page on a canvas. `scale` is CSS pixels per point; the canvas gets as many device pixels as the screen has.
 * The page is drawn as it is shown, so a page turned in the file comes out turned.
 */
export function renderPage(doc: PDFDocumentProxy, index: number, canvas: HTMLCanvasElement, scale: number, pixelRatio = 1): PageRender {
    let task: RenderTask | null = null;
    let cancelled = false;
    const promise = (async () => {
        const page = await doc.getPage(index + 1);

        if (cancelled) return;

        const viewport = page.getViewport({ scale: scale * pixelRatio });

        canvas.width = Math.max(Math.floor(viewport.width), 1);
        canvas.height = Math.max(Math.floor(viewport.height), 1);
        canvas.style.width = `${viewport.width / pixelRatio}px`;
        canvas.style.height = `${viewport.height / pixelRatio}px`;

        const lib = await loadPdfJs();

        // ENABLE_FORMS draws every annotation but the form widgets, which the editor draws as real inputs.
        task = page.render({ canvas, viewport, annotationMode: lib.AnnotationMode.ENABLE_FORMS });

        try {
            await task.promise;
        } catch (error) {
            // A drawing that was stopped on purpose is not a failure.
            if ((error as { name?: string }).name !== 'RenderingCancelledException') throw error;
        }
    })();

    return {
        promise,
        cancel() {
            cancelled = true;
            task?.cancel();
        }
    };
}

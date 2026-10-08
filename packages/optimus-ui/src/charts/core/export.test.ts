import { describe, expect, it } from 'vitest';
import { buildCsv, buildPdf, csvToBlob, exportPixelSize, jpegDimensions } from './export';

/** A JPEG header with just enough structure for the size to be read: SOI, an APP0, then SOF0. */
function jpegHeader(width: number, height: number): Uint8Array {
    return new Uint8Array([
        0xff,
        0xd8,
        // APP0 of length 16.
        0xff,
        0xe0,
        0x00,
        0x10,
        0x4a,
        0x46,
        0x49,
        0x46,
        0x00,
        0x01,
        0x01,
        0x00,
        0x00,
        0x01,
        0x00,
        0x01,
        0x00,
        0x00,
        // SOF0: length 17, precision 8, height, width, 3 components.
        0xff,
        0xc0,
        0x00,
        0x11,
        0x08,
        height >> 8,
        height & 0xff,
        width >> 8,
        width & 0xff,
        0x03,
        0x01,
        0x22,
        0x00,
        0x02,
        0x11,
        0x01,
        0x03,
        0x11,
        0x01,
        0xff,
        0xd9
    ]);
}

describe('jpegDimensions', () => {
    it('reads the pixel size from the start-of-frame marker', () => {
        expect(jpegDimensions(jpegHeader(1200, 800))).toEqual({ width: 1200, height: 800 });
    });

    it('is null for something that is not a JPEG', () => {
        expect(jpegDimensions(new Uint8Array([1, 2, 3, 4, 5]))).toBeNull();
        expect(jpegDimensions(new Uint8Array())).toBeNull();
    });
});

describe('buildPdf', () => {
    it('sizes the page in CSS pixels and the image in its own pixels', async () => {
        // A 600x400 chart exported at scale 2: the JPEG is 1200x800 and the page stays 600x400.
        const blob = buildPdf(jpegHeader(1200, 800), 600, 400);
        const text = new TextDecoder('latin1').decode(await blob.arrayBuffer());

        expect(text).toContain('/MediaBox [0 0 600 400]');
        expect(text).toContain('/Width 1200 /Height 800');
        expect(text).not.toContain('/Width 600 /Height 400');
    });

    it('falls back to the page size when the JPEG header cannot be read', async () => {
        const text = new TextDecoder('latin1').decode(await buildPdf(new Uint8Array([1, 2, 3]), 300, 200).arrayBuffer());

        expect(text).toContain('/Width 300 /Height 200');
    });
});

describe('exportPixelSize', () => {
    it('applies the scale when the canvas fits', () => {
        expect(exportPixelSize(600, 400, 2)).toEqual({ width: 1200, height: 800 });
    });

    it('lowers the scale rather than ask for a canvas the browser would refuse', () => {
        const size = exportPixelSize(8000, 6000, 4);

        expect(size.width).toBeLessThanOrEqual(16384);
        expect(size.width * size.height).toBeLessThanOrEqual(120_000_000);
        // Same aspect ratio as the request.
        expect(size.width / size.height).toBeCloseTo(8000 / 6000, 1);
    });

    it('treats a nonsense scale as 1', () => {
        expect(exportPixelSize(100, 50, 0)).toEqual({ width: 100, height: 50 });
        expect(exportPixelSize(100, 50, Number.NaN)).toEqual({ width: 100, height: 50 });
    });
});

describe('csvToBlob', () => {
    it('prefixes the downloaded CSV with a UTF-8 byte order mark', async () => {
        const blob = csvToBlob('a,b\r\n1,2');
        const bytes = new Uint8Array(await blob.arrayBuffer());

        expect(Array.from(bytes.slice(0, 3))).toEqual([0xef, 0xbb, 0xbf]);
        expect(blob.type).toBe('text/csv;charset=utf-8');
    });

    it('leaves the CSV string itself without the mark', () => {
        expect(buildCsv([['a', 'b']]).charCodeAt(0)).not.toBe(0xfeff);
    });
});

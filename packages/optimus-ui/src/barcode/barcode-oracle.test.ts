import { describe, expect, it } from 'vitest';
import { encodeDataMatrix } from './barcode-datamatrix';
import { encodePdf417 } from './barcode-pdf417';

/**
 * The browser can read some symbologies (`BarcodeDetector`). When it can, it is the judge of a symbol that no table in this
 * repository can vouch for: if the browser reads back what was written, the symbol is right.
 */
const Detector: any = (globalThis as any).BarcodeDetector;

async function read(modules: boolean[][], format: string, quiet: number, scale = 8): Promise<string | undefined> {
    const n = modules.length;
    const w = (modules[0].length + quiet * 2) * scale;
    const h = (n + quiet * 2) * scale;
    const canvas = document.createElement('canvas');

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#000';
    modules.forEach((row, y) => row.forEach((dark, x) => dark && ctx.fillRect((x + quiet) * scale, (y + quiet) * scale, scale, scale)));

    const found = await new Detector({ formats: [format] }).detect(canvas);

    return found[0]?.rawValue;
}

/** The browser's reader is fussy about the margin round a symbol, and not the same way for every size: it is enough that one framing reads. */
async function readSomehow(modules: boolean[][], format: string, scales = [6]): Promise<string | undefined> {
    for (const quiet of [4, 2, 3, 6]) {
        for (const scale of scales) {
            const got = await read(modules, format, quiet, scale);

            if (got !== undefined) return got;
        }
    }

    return undefined;
}

const sample = (n: number) => {
    let seed = n + 3;

    return Array.from({ length: n }, () => String.fromCharCode(65 + ((seed = (seed * 16807) % 2147483647) % 26))).join('');
};

describe.skipIf(!Detector)('the browser reads what we write', () => {
    it('Data Matrix, from the smallest symbol to one with several regions and blocks', async () => {
        const supported: string[] = await Detector.getSupportedFormats();

        if (!supported.includes('data_matrix')) return;

        const cases = ['A', '12', '1234567890', 'Hello, Data Matrix!', 'https://www.openng.org/path?x=1&y=2', ...[60, 140, 300, 400, 500, 600, 800, 1000, 1300, 1500].map(sample)];

        for (const text of cases) {
            const symbol = encodeDataMatrix(text);

            expect(await readSomehow(symbol.modules, 'data_matrix'), `${symbol.size}x${symbol.size}: ${text.slice(0, 20)}`).toBe(text);
        }
    });
});

describe.skipIf(!Detector)('the browser reads a PDF417', () => {
    it('in byte and in numeric compaction, with several shapes and levels', async () => {
        const supported: string[] = await Detector.getSupportedFormats();

        if (!supported.includes('pdf417')) return;

        const cases: [string, Parameters<typeof encodePdf417>[1]][] = [
            ['Hello', {}],
            ['https://www.openng.org/gantt?id=42', { columns: 5 }],
            ['1234567890123456789', {}],
            ['x'.repeat(120), { columns: 6, errorCorrectionLevel: 3 }]
        ];

        for (const [text, options] of cases) {
            const symbol = encodePdf417(text, options);

            expect(await readSomehow(symbol.modules, 'pdf417', [3]), `${symbol.columns}x${symbol.rows}: ${text.slice(0, 20)}`).toBe(text);
        }
    });
});

import { BarcodeError } from './barcode-linear';

/**
 * A PDF417 encoder: text in, a stack of rows of modules out.
 *
 * Data goes in byte compaction (UTF-8), or in numeric compaction when it is all digits. The error correction level follows the
 * amount of data unless it is given. The symbol is as wide as `columns` data columns, or as the shape that comes nearest to a
 * wide rectangle when they are left out.
 *
 * @module barcode-pdf417
 */

// ---------------------------------------------------------------------------------------------
// The bar patterns of the 929 codewords, in the three clusters
// ---------------------------------------------------------------------------------------------

/*
 * A symbol character is four bars and four spaces of 1 to 6 modules that fill 17. In the cluster `k` the first bar widths satisfy
 * (b1 - b2 + b3 - b4) mod 9 = 3k. The patterns of a cluster are listed by the sums of their adjacent elements (s1+b2, b2+s2, s2+b3, b3+s3,
 * s3+b4) in ascending order, and the standard (ISO/IEC 15438) takes 929 of them for the codewords 0 to 928. The pattern is found by
 * that order; which ones the standard takes is the bit mask below, one bit for each candidate, set when it is taken. The masks were
 * checked, entry by entry, against the table of the zxing-js library (Apache License 2.0), which carries the same assignments.
 */
const CLUSTER_MASKS: { count: number; hex: string }[] = [
    {
        count: 1484,
        hex: [
            'ff4d3fd03fc3c5ff7d7ff1fcf7ff57fd7d7ffdff57ff545541ffd0ff53f5dfffcfaabad20fad720f6cffff7b59ead3eaf2f7',
            '7fffeb5db3dbd7fff57b528aa928003efabfebefffeed676c8f9bd3dbffef9d76afae4d3cc8f736befffcdeff596dabdbaff',
            'edfee6faaaa5494000137f7ffff7df3aed5eddfffdabdf672db57b77ffbbfdcdff739dcfffeff6feeef555555004d557cff5',
            'aafefebaefb75bbfbafeefeeeefbfffe000000000000000000000000000000000000000'
        ].join('')
    },
    {
        count: 1002,
        hex: [
            'fffffffffffffdfeffffffffffffeffffffffffffffffffffffefcfffffffffffeffffdf9bdfeaf7fabdfeaf6f7fffdbfdbf',
            'dbfdbfffeff7eff7fffffff3fffffffffffff6ff6ff6ff6fffffbffaffb7fb7fb7fffffffffffffffffffffffbfbfbfbffff',
            'fffffffffffffffefffffffffffffffffff3f3ffffffff7ff00'
        ].join('')
    },
    {
        count: 1002,
        hex: [
            'ffe7ff7fffffeffefffffffffffffffeffffdfffffffffffabdffbffffffffdbfffffff7fffffffffffffff6fffffffff57b',
            'fb7fffff6fffffefffffffdffffdfffff77ffffffabdfdbfffffdbfffffbfffff3ffffffdfffffb7fffffabdfdbffff6ffff',
            'dffe3fffffff7fffbdffff7f6ffffffffffffeffffffffff000'
        ].join('')
    }
];

let patterns: number[][] | null = null;

/** The 17 module patterns, as integers with the first bar in the highest bit, of the 929 codewords of each of the three clusters. */
export function pdf417Patterns(): number[][] {
    if (patterns) return patterns;

    patterns = CLUSTER_MASKS.map((mask, cluster) => {
        const candidates: { w: number[]; order: number }[] = [];
        let order = 0;

        for (let b1 = 1; b1 <= 6; b1++) {
            for (let s1 = 1; s1 <= 6; s1++) {
                for (let b2 = 1; b2 <= 6; b2++) {
                    for (let s2 = 1; s2 <= 6; s2++) {
                        for (let b3 = 1; b3 <= 6; b3++) {
                            for (let s3 = 1; s3 <= 6; s3++) {
                                const b4 = (((b1 - b2 + b3 - cluster * 3) % 9) + 9) % 9;
                                const s4 = 17 - (b1 + s1 + b2 + s2 + b3 + s3 + b4);

                                if (b4 >= 1 && b4 <= 6 && s4 >= 1 && s4 <= 6) candidates.push({ w: [b1, s1, b2, s2, b3, s3, b4, s4], order: order++ });
                            }
                        }
                    }
                }
            }
        }

        const key = (w: number[]) => [w[1] + w[2], w[2] + w[3], w[3] + w[4], w[4] + w[5], w[5] + w[6]];

        candidates.sort((a, b) => {
            const ka = key(a.w);
            const kb = key(b.w);

            for (let i = 0; i < 5; i++) if (ka[i] !== kb[i]) return ka[i] - kb[i];

            return a.order - b.order;
        });

        return candidates
            .filter((_, i) => (parseInt(mask.hex[i >> 2], 16) >> (3 - (i & 3))) & 1)
            .map(({ w }) => {
                let bits = 0;

                w.forEach((n, i) => {
                    for (let k = 0; k < n; k++) bits = (bits << 1) | (i % 2 === 0 ? 1 : 0);
                });

                return bits;
            });
    });

    return patterns;
}

// ---------------------------------------------------------------------------------------------
// Compaction
// ---------------------------------------------------------------------------------------------

const LATCH_BYTE = 901;
const LATCH_NUMERIC = 902;
const LATCH_BYTE_6 = 924;
const PAD = 900;

/** Numeric compaction: groups of up to 44 digits, each written as the base 900 digits of `1` followed by the digits. */
export function numericCodewords(digits: string): number[] {
    const out: number[] = [LATCH_NUMERIC];

    for (let i = 0; i < digits.length; i += 44) {
        let n = BigInt(`1${digits.slice(i, i + 44)}`);
        const group: number[] = [];

        while (n > 0n) {
            group.unshift(Number(n % 900n));
            n /= 900n;
        }

        out.push(...group);
    }

    return out;
}

/** Byte compaction: six bytes become five codewords, in base 900; bytes left over are one codeword each. */
export function byteCodewords(bytes: Uint8Array): number[] {
    const out: number[] = [bytes.length % 6 === 0 ? LATCH_BYTE_6 : LATCH_BYTE];
    let i = 0;

    for (; i + 6 <= bytes.length; i += 6) {
        let n = 0n;

        for (let k = 0; k < 6; k++) n = (n << 8n) | BigInt(bytes[i + k]);

        const group: number[] = [];

        for (let k = 0; k < 5; k++) {
            group.unshift(Number(n % 900n));
            n /= 900n;
        }

        out.push(...group);
    }

    for (; i < bytes.length; i++) out.push(bytes[i]);

    return out;
}

// ---------------------------------------------------------------------------------------------
// Error correction, over the integers modulo 929
// ---------------------------------------------------------------------------------------------

/** The check codewords of a level: 2 to the power of the level plus one. */
export const eccCount = (level: number): number => 2 << level;

/** The generator polynomial of a level, lowest power first, with the roots 3, 3^2, 3^3... */
function generatorFor(level: number): number[] {
    let g = [1];
    let root = 1;

    for (let i = 0; i < eccCount(level); i++) {
        root = (root * 3) % 929;

        const next = new Array<number>(g.length + 1).fill(0);

        g.forEach((c, j) => {
            next[j + 1] = (next[j + 1] + c) % 929;
            next[j] = (next[j] + (929 - root) * c) % 929;
        });
        g = next;
    }

    return g;
}

/** The check codewords of some data codewords. */
export function checkCodewords(data: number[], level: number): number[] {
    const k = eccCount(level);
    const g = generatorFor(level);
    const e = new Array<number>(k).fill(0);

    for (const d of data) {
        const t = (d + e[k - 1]) % 929;

        for (let j = k - 1; j > 0; j--) e[j] = (e[j - 1] + 929 - ((t * g[j]) % 929)) % 929;

        e[0] = (929 - ((t * g[0]) % 929)) % 929;
    }

    return e.map((v) => (v ? 929 - v : 0)).reverse();
}

/** The level the amount of data asks for. */
export function defaultLevel(dataCodewords: number): number {
    return dataCodewords <= 40 ? 2 : dataCodewords <= 160 ? 3 : dataCodewords <= 320 ? 4 : dataCodewords <= 863 ? 5 : 6;
}

// ---------------------------------------------------------------------------------------------
// Encode
// ---------------------------------------------------------------------------------------------

/** Options of {@link encodePdf417}. */
export interface EncodePdf417Options {
    /** Data columns, 1 to 30. Omitted, the shape comes out about three times as wide as it is tall. */
    columns?: number;
    /** Error correction level, 0 to 8. Omitted, it follows the amount of data. */
    errorCorrectionLevel?: number;
    /** Modules tall a row is drawn. Default 3. */
    rowHeight?: number;
}

/** A finished symbol. */
export interface Pdf417Symbol {
    /** `modules[y][x]` is `true` for a dark module. Quiet zone excluded. */
    modules: boolean[][];
    columns: number;
    rows: number;
    errorCorrectionLevel: number;
}

const START = '81111113';
const STOP = '711311121';

function widthsToBits(widths: string): boolean[] {
    const out: boolean[] = [];

    [...widths].forEach((n, i) => {
        for (let k = 0; k < Number(n); k++) out.push(i % 2 === 0);
    });

    return out;
}

const bitsOf = (pattern: number): boolean[] => Array.from({ length: 17 }, (_, i) => ((pattern >> (16 - i)) & 1) === 1);

/** Encodes `text` (as UTF-8) as a PDF417. */
export function encodePdf417(text: string, options: EncodePdf417Options = {}): Pdf417Symbol {
    // Anything beyond ASCII is declared UTF-8 (the ECI 26), or a reader would take the bytes for Latin-1.
    const eci = /[^\u0000-\u007f]/.test(text) ? [927, 26] : [];
    const body = [...eci, ...(/^\d+$/.test(text) && text.length >= 2 ? numericCodewords(text) : byteCodewords(new TextEncoder().encode(text)))];
    const level = options.errorCorrectionLevel ?? defaultLevel(body.length + 1);

    if (!Number.isInteger(level) || level < 0 || level > 8) throw new BarcodeError('The PDF417 error correction level must be from 0 to 8');
    if (options.columns !== undefined && (!Number.isInteger(options.columns) || options.columns < 1 || options.columns > 30)) throw new BarcodeError('A PDF417 has from 1 to 30 data columns');

    const ecc = eccCount(level);
    const needed = body.length + 1 + ecc;

    let columns = options.columns;

    if (columns === undefined) {
        // Rows are 3 modules tall and a column 17 wide: about three times as wide as tall is columns of 17 * 3 / (17 * ... ), found by trying them.
        let best = 1;
        let bestScore = Infinity;

        for (let c = 1; c <= 30; c++) {
            const rows = Math.ceil(needed / c);

            if (rows < 3 || rows > 90) continue;

            const width = 17 * (c + 4) + 1;
            const height = rows * 3;

            if (Math.abs(width / height - 3) < bestScore) {
                bestScore = Math.abs(width / height - 3);
                best = c;
            }
        }

        columns = best;
    }

    const rows = Math.max(3, Math.ceil(needed / columns));

    if (rows > 90) throw new BarcodeError('The value is too long for a PDF417');

    const total = rows * columns;
    const data = [body.length + 1 + (total - needed), ...body];

    // The padding goes between the data and the check codewords.
    while (data.length < total - ecc) data.push(PAD);

    const words = [...data, ...checkCodewords(data, level)];
    const tables = pdf417Patterns();
    const rowHeight = Math.max(1, Math.round(options.rowHeight ?? 3));
    const modules: boolean[][] = [];

    for (let r = 0; r < rows; r++) {
        const cluster = r % 3;
        const base = 30 * Math.floor(r / 3);
        let left: number;
        let right: number;

        if (cluster === 0) {
            left = base + Math.floor((rows - 1) / 3);
            right = base + (columns - 1);
        } else if (cluster === 1) {
            left = base + level * 3 + ((rows - 1) % 3);
            right = base + Math.floor((rows - 1) / 3);
        } else {
            left = base + (columns - 1);
            right = base + level * 3 + ((rows - 1) % 3);
        }

        const row: boolean[] = [...widthsToBits(START), ...bitsOf(tables[cluster][left])];

        for (let c = 0; c < columns; c++) row.push(...bitsOf(tables[cluster][words[r * columns + c]]));

        row.push(...bitsOf(tables[cluster][right]), ...widthsToBits(STOP));

        for (let k = 0; k < rowHeight; k++) modules.push(row);
    }

    return { modules, columns, rows, errorCorrectionLevel: level };
}

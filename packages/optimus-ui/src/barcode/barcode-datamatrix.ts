import { BarcodeError } from './barcode-linear';

/**
 * A Data Matrix (ECC 200) encoder: text in, a square of modules out.
 *
 * It writes the square symbols from 10 by 10 to 144 by 144 in the ASCII mode, with digit pairs packed two to a codeword and
 * the extended characters through an upper shift, and with Reed-Solomon error correction interleaved over the blocks of the
 * larger symbols.
 *
 * @module barcode-datamatrix
 */

/** One symbol size. */
export interface DataMatrixSize {
    /** Modules on a side, finder patterns included. */
    size: number;
    /** Data regions on a side. */
    regions: number;
    /** Modules on a side of one data region. */
    region: number;
    /** Codewords of data the symbol holds. */
    data: number;
    /** Codewords of error correction. */
    ecc: number;
    /** Reed-Solomon blocks the codewords are shared out in. */
    blocks: number;
}

const size = (s: number, regions: number, region: number, data: number, ecc: number, blocks = 1): DataMatrixSize => ({ size: s, regions, region, data, ecc, blocks });

/** The square sizes of ECC 200. */
export const DATAMATRIX_SIZES: readonly DataMatrixSize[] = [
    size(10, 1, 8, 3, 5),
    size(12, 1, 10, 5, 7),
    size(14, 1, 12, 8, 10),
    size(16, 1, 14, 12, 12),
    size(18, 1, 16, 18, 14),
    size(20, 1, 18, 22, 18),
    size(22, 1, 20, 30, 20),
    size(24, 1, 22, 36, 24),
    size(26, 1, 24, 44, 28),
    size(32, 2, 14, 62, 36),
    size(36, 2, 16, 86, 42),
    size(40, 2, 18, 114, 48),
    size(44, 2, 20, 144, 56),
    size(48, 2, 22, 174, 68),
    size(52, 2, 24, 204, 84, 2),
    size(64, 4, 14, 280, 112, 2),
    size(72, 4, 16, 368, 144, 4),
    size(80, 4, 18, 456, 192, 4),
    size(88, 4, 20, 576, 224, 4),
    size(96, 4, 22, 696, 272, 4),
    size(104, 4, 24, 816, 336, 6),
    size(120, 6, 18, 1050, 408, 6),
    size(132, 6, 20, 1304, 496, 8),
    size(144, 6, 22, 1558, 620, 10)
];

// ---------------------------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------------------------

const UPPER_SHIFT = 235;
const PAD = 129;

/** The ASCII mode codewords of some bytes: a digit pair is one codeword, a byte above 127 takes an upper shift and one more. */
export function asciiCodewords(bytes: Uint8Array): number[] {
    const out: number[] = [];
    const isDigit = (b: number | undefined) => b !== undefined && b >= 48 && b <= 57;

    for (let i = 0; i < bytes.length; i++) {
        const b = bytes[i];

        if (isDigit(b) && isDigit(bytes[i + 1])) {
            out.push(130 + (b - 48) * 10 + (bytes[i + 1] - 48));
            i++;
        } else if (b < 128) {
            out.push(b + 1);
        } else {
            out.push(UPPER_SHIFT, b - 127);
        }
    }

    return out;
}

/** Pads codewords to the capacity of a symbol: one pad, then pads that the specification scrambles by their position. */
export function padCodewords(words: number[], capacity: number): number[] {
    const out = words.slice();

    if (out.length < capacity) out.push(PAD);

    while (out.length < capacity) {
        const position = out.length + 1;
        const value = PAD + ((149 * position) % 253) + 1;

        out.push(value > 254 ? value - 254 : value);
    }

    return out;
}

// ---------------------------------------------------------------------------------------------
// Reed-Solomon over GF(256) with the polynomial 301
// ---------------------------------------------------------------------------------------------

const EXP = new Array<number>(512);
const LOG = new Array<number>(256);

(() => {
    let x = 1;

    for (let i = 0; i < 255; i++) {
        EXP[i] = x;
        LOG[x] = i;
        x <<= 1;

        if (x & 0x100) x ^= 0x12d;
    }

    for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
})();

const mul = (a: number, b: number) => (a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]]);

/** The generator polynomial of `degree`, highest power first: the product of (x - 2^i) for i from 1. */
export function generator(degree: number): number[] {
    let g = [1];

    for (let i = 1; i <= degree; i++) {
        const next = new Array<number>(g.length + 1).fill(0);

        g.forEach((c, j) => {
            next[j] ^= c;
            next[j + 1] ^= mul(c, EXP[i]);
        });
        g = next;
    }

    return g;
}

/** The error correction codewords of a block of data. */
export function eccOf(data: number[], degree: number): number[] {
    const g = generator(degree);
    const r = new Array<number>(degree).fill(0);

    for (const d of data) {
        const factor = d ^ r[0];

        r.shift();
        r.push(0);

        if (factor) for (let j = 0; j < degree; j++) r[j] ^= mul(g[j + 1], factor);
    }

    return r;
}

/**
 * The data codewords of a symbol followed by their error correction.
 *
 * The blocks are dealt out round-robin: block `b` takes codewords `b`, `b + blocks`, `b + 2 * blocks`, and so on, so the data stays in
 * the order it was written; only the error correction codewords of the blocks are interleaved, the round continuing where the data ended.
 */
export function interleave(data: number[], s: DataMatrixSize): number[] {
    const eccLength = s.ecc / s.blocks;
    const blocks: number[][] = Array.from({ length: s.blocks }, () => []);

    data.forEach((word, i) => blocks[i % s.blocks].push(word));

    const eccs = blocks.map((block) => eccOf(block, eccLength));
    const out = data.slice();
    // The deal goes on where the data left off: in the largest symbol the last eight data codewords went to the eight longer
    // blocks, so the error correction starts with the two shorter ones.
    const first = data.length % s.blocks;

    for (let i = 0; i < eccLength; i++) for (let k = 0; k < s.blocks; k++) out.push(eccs[(first + k) % s.blocks][i]);

    return out;
}

// ---------------------------------------------------------------------------------------------
// Placement of the codewords in the data area
// ---------------------------------------------------------------------------------------------

/** Lays codewords out in an `n` by `n` data area, the way the specification walks it: diagonals, with four special corners. */
export function place(codewords: number[], n: number): boolean[][] {
    const grid: (boolean | null)[][] = Array.from({ length: n }, () => new Array<boolean | null>(n).fill(null));

    const module = (row: number, col: number, pos: number, bit: number) => {
        if (row < 0) {
            row += n;
            col += 4 - ((n + 4) % 8);
        }

        if (col < 0) {
            col += n;
            row += 4 - ((n + 4) % 8);
        }

        grid[row][col] = ((codewords[pos] ?? 0) & (1 << (8 - bit))) !== 0;
    };

    const utah = (row: number, col: number, pos: number) => {
        module(row - 2, col - 2, pos, 1);
        module(row - 2, col - 1, pos, 2);
        module(row - 1, col - 2, pos, 3);
        module(row - 1, col - 1, pos, 4);
        module(row - 1, col, pos, 5);
        module(row, col - 2, pos, 6);
        module(row, col - 1, pos, 7);
        module(row, col, pos, 8);
    };

    const corner1 = (pos: number) =>
        [
            [n - 1, 0],
            [n - 1, 1],
            [n - 1, 2],
            [0, n - 2],
            [0, n - 1],
            [1, n - 1],
            [2, n - 1],
            [3, n - 1]
        ].forEach(([r, c], i) => module(r, c, pos, i + 1));
    const corner2 = (pos: number) =>
        [
            [n - 3, 0],
            [n - 2, 0],
            [n - 1, 0],
            [0, n - 4],
            [0, n - 3],
            [0, n - 2],
            [0, n - 1],
            [1, n - 1]
        ].forEach(([r, c], i) => module(r, c, pos, i + 1));
    const corner3 = (pos: number) =>
        [
            [n - 3, 0],
            [n - 2, 0],
            [n - 1, 0],
            [0, n - 2],
            [0, n - 1],
            [1, n - 1],
            [2, n - 1],
            [3, n - 1]
        ].forEach(([r, c], i) => module(r, c, pos, i + 1));
    const corner4 = (pos: number) =>
        [
            [n - 1, 0],
            [n - 1, n - 1],
            [0, n - 3],
            [0, n - 2],
            [0, n - 1],
            [1, n - 3],
            [1, n - 2],
            [1, n - 1]
        ].forEach(([r, c], i) => module(r, c, pos, i + 1));

    let pos = 0;
    let row = 4;
    let col = 0;

    do {
        if (row === n && col === 0) corner1(pos++);
        if (row === n - 2 && col === 0 && n % 4 !== 0) corner2(pos++);
        if (row === n - 2 && col === 0 && n % 8 === 4) corner3(pos++);
        if (row === n + 4 && col === 2 && n % 8 === 0) corner4(pos++);

        do {
            if (row < n && col >= 0 && grid[row][col] === null) utah(row, col, pos++);

            row -= 2;
            col += 2;
        } while (row >= 0 && col < n);

        row += 1;
        col += 3;

        do {
            if (row >= 0 && col < n && grid[row][col] === null) utah(row, col, pos++);

            row += 2;
            col -= 2;
        } while (row < n && col >= 0);

        row += 3;
        col += 1;
    } while (row < n || col < n);

    // Some sizes leave the last two modules of the diagonal over: they are drawn as a fixed pattern.
    if (grid[n - 1][n - 1] === null) {
        grid[n - 1][n - 1] = true;
        grid[n - 2][n - 2] = true;
    }

    return grid.map((r) => r.map((v) => v === true));
}

// ---------------------------------------------------------------------------------------------
// Encode
// ---------------------------------------------------------------------------------------------

/** A finished symbol. */
export interface DataMatrixSymbol {
    /** `modules[y][x]` is `true` for a dark module. Quiet zone excluded. */
    modules: boolean[][];
    size: number;
}

/** Encodes `text` (as UTF-8) as a Data Matrix. */
export function encodeDataMatrix(text: string): DataMatrixSymbol {
    const words = asciiCodewords(new TextEncoder().encode(text));
    const s = DATAMATRIX_SIZES.find((x) => x.data >= words.length);

    if (!s) throw new BarcodeError('The value is too long for a Data Matrix');

    const all = interleave(padCodewords(words, s.data), s);
    const area = place(all, s.regions * s.region);
    const total = s.size;
    const modules = Array.from({ length: total }, () => new Array<boolean>(total).fill(false));
    const pitch = s.region + 2;

    for (let ri = 0; ri < s.regions; ri++) {
        for (let ci = 0; ci < s.regions; ci++) {
            const top = ri * pitch;
            const left = ci * pitch;

            // The finder: solid on the left and at the bottom. The clock: alternating along the top and down the right, starting dark at the left and the bottom.
            for (let i = 0; i < pitch; i++) {
                modules[top + i][left] = true;
                modules[top + pitch - 1][left + i] = true;
                modules[top][left + i] = i % 2 === 0;
                modules[top + pitch - 1 - i][left + pitch - 1] = i % 2 === 0;
            }

            for (let r = 0; r < s.region; r++) for (let c = 0; c < s.region; c++) modules[top + 1 + r][left + 1 + c] = area[ri * s.region + r][ci * s.region + c];
        }
    }

    return { modules, size: total };
}

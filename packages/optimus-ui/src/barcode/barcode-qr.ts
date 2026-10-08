import type { QrErrorCorrection } from '@openng/optimus-ui/types/barcode';
import { BarcodeError } from './barcode-linear';

export type { QrErrorCorrection };

/**
 * A QR Code encoder: text in, a square of modules out.
 *
 * It writes versions 1 to 40 in the numeric, alphanumeric and byte (UTF-8) modes, at the four error
 * correction levels, with Reed-Solomon codewords, the eight masks and the penalty rules that choose
 * between them.
 *
 * @module barcode-qr
 */

/** A finished symbol. */
export interface QrSymbol {
    /** `modules[y][x]` is `true` for a dark module. Quiet zone excluded. */
    modules: boolean[][];
    version: number;
    size: number;
    mask: number;
    errorCorrection: QrErrorCorrection;
}

const LEVELS: QrErrorCorrection[] = ['low', 'medium', 'quartile', 'high'];
/** The two format bits of each level. */
const FORMAT_BITS = [1, 0, 3, 2];

// Index by level, then by version (index 0 is unused).
const ECC_CODEWORDS_PER_BLOCK = [
    [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
    [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
];
const NUM_ERROR_CORRECTION_BLOCKS = [
    [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
    [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
    [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]
];

const ALPHANUMERIC = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

/** The number of modules a version spends on data and error correction, the function patterns taken out. */
export function rawDataModules(version: number): number {
    let result = (16 * version + 128) * version + 64;

    if (version >= 2) {
        const align = Math.floor(version / 7) + 2;

        result -= (25 * align - 10) * align - 55;

        if (version >= 7) result -= 36;
    }

    return result;
}

/** How many data codewords a version holds at a level. */
export function dataCodewords(version: number, level: QrErrorCorrection): number {
    const e = LEVELS.indexOf(level);

    return Math.floor(rawDataModules(version) / 8) - ECC_CODEWORDS_PER_BLOCK[e][version] * NUM_ERROR_CORRECTION_BLOCKS[e][version];
}

// ---------------------------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------------------------

class Bits {
    readonly bits: number[] = [];

    append(value: number, length: number): void {
        for (let i = length - 1; i >= 0; i--) this.bits.push((value >>> i) & 1);
    }
}

type Mode = { id: number; counts: [number, number, number] };

const NUMERIC: Mode = { id: 0b0001, counts: [10, 12, 14] };
const ALPHANUM: Mode = { id: 0b0010, counts: [9, 11, 13] };
const BYTE: Mode = { id: 0b0100, counts: [8, 16, 16] };

const countBits = (mode: Mode, version: number) => mode.counts[version <= 9 ? 0 : version <= 26 ? 1 : 2];

function segment(text: string): { mode: Mode; count: number; write: (bits: Bits) => void } {
    if (/^[0-9]*$/.test(text)) {
        return {
            mode: NUMERIC,
            count: text.length,
            write: (bits) => {
                for (let i = 0; i < text.length;) {
                    const n = Math.min(text.length - i, 3);

                    bits.append(Number(text.substr(i, n)), n * 3 + 1);
                    i += n;
                }
            }
        };
    }

    if ([...text].every((c) => ALPHANUMERIC.includes(c))) {
        return {
            mode: ALPHANUM,
            count: text.length,
            write: (bits) => {
                let i = 0;

                for (; i + 2 <= text.length; i += 2) bits.append(ALPHANUMERIC.indexOf(text[i]) * 45 + ALPHANUMERIC.indexOf(text[i + 1]), 11);

                if (i < text.length) bits.append(ALPHANUMERIC.indexOf(text[i]), 6);
            }
        };
    }

    const bytes = new TextEncoder().encode(text);

    return { mode: BYTE, count: bytes.length, write: (bits) => bytes.forEach((b) => bits.append(b, 8)) };
}

// ---------------------------------------------------------------------------------------------
// Reed-Solomon
// ---------------------------------------------------------------------------------------------

function gfMultiply(x: number, y: number): number {
    let z = 0;

    for (let i = 7; i >= 0; i--) {
        z = (z << 1) ^ ((z >>> 7) * 0x11d);
        z ^= ((y >>> i) & 1) * x;
    }

    return z;
}

function rsDivisor(degree: number): number[] {
    const result = new Array<number>(degree).fill(0);

    result[degree - 1] = 1;

    let root = 1;

    for (let i = 0; i < degree; i++) {
        for (let j = 0; j < degree; j++) {
            result[j] = gfMultiply(result[j], root);

            if (j + 1 < degree) result[j] ^= result[j + 1];
        }

        root = gfMultiply(root, 0x02);
    }

    return result;
}

/** The Reed-Solomon remainder of `data` by `divisor`: the error correction codewords. */
export function rsRemainder(data: number[], divisor: number[]): number[] {
    const result = divisor.map(() => 0);

    for (const b of data) {
        const factor = b ^ result.shift()!;

        result.push(0);
        divisor.forEach((coef, i) => (result[i] ^= gfMultiply(coef, factor)));
    }

    return result;
}

/** `true` when the codewords of one block leave no remainder: the check the decoders make first. */
export function rsIsValid(block: number[], eccLength: number): boolean {
    return rsRemainder(block, rsDivisor(eccLength)).every((v) => v === 0) || rsRemainder(block.slice(0, block.length - eccLength), rsDivisor(eccLength)).join() === block.slice(block.length - eccLength).join();
}

function addEccAndInterleave(data: number[], version: number, level: QrErrorCorrection): number[] {
    const e = LEVELS.indexOf(level);
    const blocks = NUM_ERROR_CORRECTION_BLOCKS[e][version];
    const eccLen = ECC_CODEWORDS_PER_BLOCK[e][version];
    const raw = Math.floor(rawDataModules(version) / 8);
    const shortBlocks = blocks - (raw % blocks);
    const shortLen = Math.floor(raw / blocks);
    const divisor = rsDivisor(eccLen);
    const result: number[][] = [];

    for (let i = 0, k = 0; i < blocks; i++) {
        const dat = data.slice(k, k + shortLen - eccLen + (i < shortBlocks ? 0 : 1));

        k += dat.length;

        const ecc = rsRemainder(dat, divisor);

        if (i < shortBlocks) dat.push(0);

        result.push(dat.concat(ecc));
    }

    const out: number[] = [];

    for (let i = 0; i < result[0].length; i++) {
        result.forEach((block, j) => {
            // The padding byte of a short block is not part of the symbol.
            if (i !== shortLen - eccLen || j >= shortBlocks) out.push(block[i]);
        });
    }

    return out;
}

// ---------------------------------------------------------------------------------------------
// Matrix
// ---------------------------------------------------------------------------------------------

const bit = (x: number, i: number) => ((x >>> i) & 1) !== 0;

class Matrix {
    readonly size: number;
    readonly modules: boolean[][];
    private readonly isFunction: boolean[][];

    constructor(
        readonly version: number,
        private readonly level: QrErrorCorrection
    ) {
        this.size = version * 4 + 17;
        this.modules = Array.from({ length: this.size }, () => new Array<boolean>(this.size).fill(false));
        this.isFunction = Array.from({ length: this.size }, () => new Array<boolean>(this.size).fill(false));
        this.drawFunctionPatterns();
    }

    private set(x: number, y: number, dark: boolean): void {
        this.modules[y][x] = dark;
        this.isFunction[y][x] = true;
    }

    private alignmentPositions(): number[] {
        if (this.version === 1) return [];

        const count = Math.floor(this.version / 7) + 2;
        const step = this.version === 32 ? 26 : Math.ceil((this.version * 4 + 4) / (count * 2 - 2)) * 2;
        const result = [6];

        for (let pos = this.size - 7; result.length < count; pos -= step) result.splice(1, 0, pos);

        return result;
    }

    private drawFunctionPatterns(): void {
        const { size } = this;

        for (let i = 0; i < size; i++) {
            this.set(6, i, i % 2 === 0);
            this.set(i, 6, i % 2 === 0);
        }

        this.finder(3, 3);
        this.finder(size - 4, 3);
        this.finder(3, size - 4);

        const pos = this.alignmentPositions();
        const n = pos.length;

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if ((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0)) continue;

                this.alignment(pos[i], pos[j]);
            }
        }

        this.drawFormat(0);
        this.drawVersion();
    }

    private finder(x: number, y: number): void {
        for (let dy = -4; dy <= 4; dy++) {
            for (let dx = -4; dx <= 4; dx++) {
                const dist = Math.max(Math.abs(dx), Math.abs(dy));
                const xx = x + dx;
                const yy = y + dy;

                if (xx >= 0 && xx < this.size && yy >= 0 && yy < this.size) this.set(xx, yy, dist !== 2 && dist !== 4);
            }
        }
    }

    private alignment(x: number, y: number): void {
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) this.set(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }

    /** The 15 format bits: level and mask, with their BCH code, masked. */
    static formatBits(level: QrErrorCorrection, mask: number): number {
        const data = (FORMAT_BITS[LEVELS.indexOf(level)] << 3) | mask;
        let rem = data;

        for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);

        return ((data << 10) | rem) ^ 0x5412;
    }

    drawFormat(mask: number): void {
        const bits = Matrix.formatBits(this.level, mask);
        const { size } = this;

        for (let i = 0; i <= 5; i++) this.set(8, i, bit(bits, i));

        this.set(8, 7, bit(bits, 6));
        this.set(8, 8, bit(bits, 7));
        this.set(7, 8, bit(bits, 8));

        for (let i = 9; i < 15; i++) this.set(14 - i, 8, bit(bits, i));
        for (let i = 0; i < 8; i++) this.set(size - 1 - i, 8, bit(bits, i));
        for (let i = 8; i < 15; i++) this.set(8, size - 15 + i, bit(bits, i));

        this.set(8, size - 8, true);
    }

    private drawVersion(): void {
        if (this.version < 7) return;

        let rem = this.version;

        for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);

        const bits = (this.version << 12) | rem;

        for (let i = 0; i < 18; i++) {
            const a = this.size - 11 + (i % 3);
            const b = Math.floor(i / 3);

            this.set(a, b, bit(bits, i));
            this.set(b, a, bit(bits, i));
        }
    }

    drawCodewords(data: number[]): void {
        const { size } = this;
        let i = 0;

        for (let right = size - 1; right >= 1; right -= 2) {
            if (right === 6) right = 5;

            for (let vert = 0; vert < size; vert++) {
                for (let j = 0; j < 2; j++) {
                    const x = right - j;
                    const upward = ((right + 1) & 2) === 0;
                    const y = upward ? size - 1 - vert : vert;

                    if (!this.isFunction[y][x] && i < data.length * 8) {
                        this.modules[y][x] = bit(data[i >>> 3], 7 - (i & 7));
                        i++;
                    }
                }
            }
        }
    }

    applyMask(mask: number): void {
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                let invert: boolean;

                switch (mask) {
                    case 0:
                        invert = (x + y) % 2 === 0;
                        break;
                    case 1:
                        invert = y % 2 === 0;
                        break;
                    case 2:
                        invert = x % 3 === 0;
                        break;
                    case 3:
                        invert = (x + y) % 3 === 0;
                        break;
                    case 4:
                        invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
                        break;
                    case 5:
                        invert = ((x * y) % 2) + ((x * y) % 3) === 0;
                        break;
                    case 6:
                        invert = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
                        break;
                    default:
                        invert = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
                }

                if (!this.isFunction[y][x] && invert) this.modules[y][x] = !this.modules[y][x];
            }
        }
    }

    /** The four penalty rules of the specification, summed. */
    penalty(): number {
        const { size, modules } = this;
        let result = 0;
        const lines: string[] = [];

        for (let y = 0; y < size; y++) lines.push(modules[y].map((m) => (m ? '1' : '0')).join(''));
        for (let x = 0; x < size; x++) lines.push(modules.map((row) => (row[x] ? '1' : '0')).join(''));

        for (const line of lines) {
            // Rule 1: five or more in a row.
            for (const run of line.match(/0{5,}|1{5,}/g) ?? []) result += 3 + (run.length - 5);

            // Rule 3: the 1:1:3:1:1 finder shape with four light modules on a side.
            for (const re of [/10111010000/g, /00001011101/g]) {
                let m: RegExpExecArray | null;

                while ((m = re.exec(line))) {
                    result += 40;
                    re.lastIndex = m.index + 1;
                }
            }
        }

        // Rule 2: 2x2 blocks of one colour.
        for (let y = 0; y < size - 1; y++) {
            for (let x = 0; x < size - 1; x++) {
                const c = modules[y][x];

                if (c === modules[y][x + 1] && c === modules[y + 1][x] && c === modules[y + 1][x + 1]) result += 3;
            }
        }

        // Rule 4: how far the share of dark modules strays from half.
        const dark = modules.reduce((sum, row) => sum + row.filter(Boolean).length, 0);
        const total = size * size;

        result += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10;

        return result;
    }
}

// ---------------------------------------------------------------------------------------------
// Encode
// ---------------------------------------------------------------------------------------------

/** Options of {@link encodeQr}. */
export interface EncodeQrOptions {
    errorCorrection?: QrErrorCorrection;
    /** A version to use; omitted, the smallest that fits. */
    version?: number;
    /** Raise the level for free when the data leaves room. Default `true`. */
    boost?: boolean;
}

/** Encodes `text` as a QR Code. */
export function encodeQr(text: string, options: EncodeQrOptions = {}): QrSymbol {
    let level = options.errorCorrection ?? 'medium';
    const seg = segment(text);
    const fixed = options.version;

    if (fixed !== undefined && (!Number.isInteger(fixed) || fixed < 1 || fixed > 40)) throw new BarcodeError('The QR version must be from 1 to 40');

    const used = (version: number) =>
        4 +
        countBits(seg.mode, version) +
        (() => {
            const b = new Bits();
            seg.write(b);
            return b.bits.length;
        })();
    let version = 0;

    for (let v = fixed ?? 1; v <= (fixed ?? 40); v++) {
        if (used(v) <= dataCodewords(v, level) * 8 && seg.count < 1 << countBits(seg.mode, v)) {
            version = v;
            break;
        }
    }

    if (!version) throw new BarcodeError(fixed ? `The value does not fit in QR version ${fixed}` : 'The value is too long for a QR code');

    if (options.boost !== false) {
        for (const candidate of LEVELS.slice(LEVELS.indexOf(level) + 1)) if (used(version) <= dataCodewords(version, candidate) * 8) level = candidate;
    }

    const bits = new Bits();

    bits.append(seg.mode.id, 4);
    bits.append(seg.count, countBits(seg.mode, version));
    seg.write(bits);

    const capacity = dataCodewords(version, level) * 8;

    bits.append(0, Math.min(4, capacity - bits.bits.length));
    bits.append(0, (8 - (bits.bits.length % 8)) % 8);

    for (let pad = 0xec; bits.bits.length < capacity; pad ^= 0xec ^ 0x11) bits.append(pad, 8);

    const data: number[] = new Array(bits.bits.length / 8).fill(0);

    bits.bits.forEach((b, i) => (data[i >>> 3] |= b << (7 - (i & 7))));

    const matrix = new Matrix(version, level);

    matrix.drawCodewords(addEccAndInterleave(data, version, level));

    let best = 0;
    let bestPenalty = Infinity;

    for (let mask = 0; mask < 8; mask++) {
        matrix.applyMask(mask);
        matrix.drawFormat(mask);

        const p = matrix.penalty();

        if (p < bestPenalty) {
            best = mask;
            bestPenalty = p;
        }

        matrix.applyMask(mask); // XOR again: undo
    }

    matrix.applyMask(best);
    matrix.drawFormat(best);

    return { modules: matrix.modules, version, size: matrix.size, mask: best, errorCorrection: level };
}

/** The format bits of a level and mask, for the tests and for anything that reads a symbol back. */
export const qrFormatBits = Matrix.formatBits;

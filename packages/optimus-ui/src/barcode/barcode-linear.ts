import type { BarcodeType as LinearBarcodeType } from '@openng/optimus-ui/types/barcode';

/**
 * Encoders for the one-dimensional barcodes: Code 128 (A, B, C and the automatic mix), Code 39,
 * EAN-13, EAN-8 and UPC-A.
 *
 * Each returns the symbol as modules, `true` for a bar and `false` for a space, quiet zones excluded.
 *
 * @module barcode-linear
 */

export type { LinearBarcodeType };

/** Thrown when a value cannot be written in the chosen symbology. */
export class BarcodeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'BarcodeError';
    }
}

/** An encoded symbol. */
export interface LinearSymbol {
    modules: boolean[];
    /** The human-readable text: the value, with any check character added. */
    text: string;
}

const fromWidths = (widths: string, startsWithBar = true): boolean[] => {
    const out: boolean[] = [];
    let bar = startsWithBar;

    for (const w of widths) {
        for (let i = 0; i < Number(w); i++) out.push(bar);

        bar = !bar;
    }

    return out;
};

const fromBits = (bits: string): boolean[] => [...bits].map((b) => b === '1');

// ---------------------------------------------------------------------------------------------
// Code 128
// ---------------------------------------------------------------------------------------------

/** Element widths of the 107 Code 128 symbols: bar, space, bar, space, bar, space (the stop has a seventh). */
export const CODE128_PATTERNS = [
    '212222',
    '222122',
    '222221',
    '121223',
    '121322',
    '131222',
    '122213',
    '122312',
    '132212',
    '221213',
    '221312',
    '231212',
    '112232',
    '122132',
    '122231',
    '113222',
    '123122',
    '123221',
    '223211',
    '221132',
    '221231',
    '213212',
    '223112',
    '312131',
    '311222',
    '321122',
    '321221',
    '312212',
    '322112',
    '322211',
    '212123',
    '212321',
    '232121',
    '111323',
    '131123',
    '131321',
    '112313',
    '132113',
    '132311',
    '211313',
    '231113',
    '231311',
    '112133',
    '112331',
    '132131',
    '113123',
    '113321',
    '133121',
    '313121',
    '211331',
    '231131',
    '213113',
    '213311',
    '213131',
    '311123',
    '311321',
    '331121',
    '312113',
    '312311',
    '332111',
    '314111',
    '221411',
    '431111',
    '111224',
    '111422',
    '121124',
    '121421',
    '141122',
    '141221',
    '112214',
    '112412',
    '122114',
    '122411',
    '142112',
    '142211',
    '241211',
    '221114',
    '413111',
    '241112',
    '134111',
    '111242',
    '121142',
    '121241',
    '114212',
    '124112',
    '124211',
    '411212',
    '421112',
    '421211',
    '212141',
    '214121',
    '412121',
    '111143',
    '111341',
    '131141',
    '114113',
    '114311',
    '411113',
    '411311',
    '113141',
    '114131',
    '311141',
    '411131',
    '211412',
    '211214',
    '211232',
    '2331112'
];

const START_A = 103;
const START_B = 104;
const START_C = 105;
const STOP = 106;
const CODE_A = 101; // switch to A, from B or C
const CODE_B = 100; // switch to B, from A or C
const CODE_C = 99; // switch to C, from A or B

type Subset = 'A' | 'B' | 'C';

/** The Code 128 symbol values for `value`, check and stop included. `subset` forces one set; omitted, the shortest mix of B and C is chosen. */
export function code128Values(value: string, subset?: Subset): number[] {
    if (!value) throw new BarcodeError('The value is empty');

    const codes: number[] = [];
    const digits = (i: number) => {
        let n = 0;

        while (i + n < value.length && value[i + n] >= '0' && value[i + n] <= '9') n++;

        return n;
    };
    const charCode = (ch: string, set: 'A' | 'B') => {
        const c = ch.charCodeAt(0);

        if (set === 'A') {
            if (c > 95) throw new BarcodeError(`"${ch}" cannot be written in Code 128 A`);

            return c < 32 ? c + 64 : c - 32;
        }

        if (c < 32 || c > 127) throw new BarcodeError(`"${ch}" cannot be written in Code 128 B`);

        return c - 32;
    };

    if (subset === 'C') {
        if (!/^\d+$/.test(value) || value.length % 2) throw new BarcodeError('Code 128 C takes an even number of digits');

        codes.push(START_C);
        for (let i = 0; i < value.length; i += 2) codes.push(Number(value.slice(i, i + 2)));
    } else if (subset === 'A' || subset === 'B') {
        codes.push(subset === 'A' ? START_A : START_B);
        for (const ch of value) codes.push(charCode(ch, subset));
    } else {
        // Automatic: start in C for a leading run of four or more digits (two when the whole value is digits), else B (or A when a control character demands it).
        const needsA = /[\x00-\x1f]/.test(value);
        let set: Subset;
        let i = 0;

        if (digits(0) >= 4 || (digits(0) >= 2 && digits(0) === value.length)) {
            set = 'C';
            codes.push(START_C);
        } else {
            set = needsA ? 'A' : 'B';
            codes.push(set === 'A' ? START_A : START_B);
        }

        while (i < value.length) {
            const run = digits(i);

            if (set === 'C') {
                if (run >= 2) {
                    codes.push(Number(value.slice(i, i + 2)));
                    i += 2;
                } else {
                    codes.push(needsA ? CODE_A : CODE_B);
                    set = needsA ? 'A' : 'B';
                }
            } else if (run >= 4 && !needsA) {
                // An odd run puts its first digit in B so that the pairs line up for C.
                if (run % 2) {
                    codes.push(charCode(value[i], 'B'));
                    i++;
                }

                codes.push(CODE_C);
                set = 'C';
            } else {
                codes.push(charCode(value[i], set));
                i++;
            }
        }
    }

    const sum = codes.reduce((acc, code, index) => acc + code * (index === 0 ? 1 : index), 0);

    codes.push(sum % 103, STOP);

    return codes;
}

/** Encodes `value` in Code 128. */
export function encodeCode128(value: string, subset?: Subset): LinearSymbol {
    const codes = code128Values(value, subset);
    const modules = codes.flatMap((code) => fromWidths(CODE128_PATTERNS[code]));

    return { modules, text: value };
}

// ---------------------------------------------------------------------------------------------
// Code 39
// ---------------------------------------------------------------------------------------------

/** `n` narrow, `w` wide: bar, space, bar... nine elements per character. Every character has three wide ones. */
export const CODE39_PATTERNS: Record<string, string> = {
    '0': 'nnnwwnwnn',
    '1': 'wnnwnnnnw',
    '2': 'nnwwnnnnw',
    '3': 'wnwwnnnnn',
    '4': 'nnnwwnnnw',
    '5': 'wnnwwnnnn',
    '6': 'nnwwwnnnn',
    '7': 'nnnwnnwnw',
    '8': 'wnnwnnwnn',
    '9': 'nnwwnnwnn',
    A: 'wnnnnwnnw',
    B: 'nnwnnwnnw',
    C: 'wnwnnwnnn',
    D: 'nnnnwwnnw',
    E: 'wnnnwwnnn',
    F: 'nnwnwwnnn',
    G: 'nnnnnwwnw',
    H: 'wnnnnwwnn',
    I: 'nnwnnwwnn',
    J: 'nnnnwwwnn',
    K: 'wnnnnnnww',
    L: 'nnwnnnnww',
    M: 'wnwnnnnwn',
    N: 'nnnnwnnww',
    O: 'wnnnwnnwn',
    P: 'nnwnwnnwn',
    Q: 'nnnnnnwww',
    R: 'wnnnnnwwn',
    S: 'nnwnnnwwn',
    T: 'nnnnwnwwn',
    U: 'wwnnnnnnw',
    V: 'nwwnnnnnw',
    W: 'wwwnnnnnn',
    X: 'nwnnwnnnw',
    Y: 'wwnnwnnnn',
    Z: 'nwwnwnnnn',
    '-': 'nwnnnnwnw',
    '.': 'wwnnnnwnn',
    ' ': 'nwwnnnwnn',
    '*': 'nwnnwnwnn',
    $: 'nwnwnwnnn',
    '/': 'nwnwnnnwn',
    '+': 'nwnnnwnwn',
    '%': 'nnnwnwnwn'
};

const CODE39_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%';

/** Encodes `value` in Code 39, with the Mod 43 check character when `checksum` is set. The input is upper-cased. */
export function encodeCode39(value: string, checksum = false): LinearSymbol {
    if (!value) throw new BarcodeError('The value is empty');

    let text = value.toUpperCase();

    for (const ch of text) if (!CODE39_ALPHABET.includes(ch)) throw new BarcodeError(`"${ch}" cannot be written in Code 39`);

    if (checksum) text += CODE39_ALPHABET[[...text].reduce((sum, ch) => sum + CODE39_ALPHABET.indexOf(ch), 0) % 43];

    const modules: boolean[] = [];
    const wide = 3;
    const narrow = 1;

    [...`*${text}*`].forEach((ch, index) => {
        if (index) modules.push(false); // the narrow space between characters

        let bar = true;

        for (const element of CODE39_PATTERNS[ch]) {
            for (let k = 0; k < (element === 'w' ? wide : narrow); k++) modules.push(bar);

            bar = !bar;
        }
    });

    return { modules, text: `*${text}*` };
}

// ---------------------------------------------------------------------------------------------
// Code 39 Extended
// ---------------------------------------------------------------------------------------------

/** The Code 39 pair that stands for each ASCII character that Code 39 cannot write on its own. */
function extendedPair(code: number): string {
    if (code === 0) return '%U';
    if (code >= 1 && code <= 26) return `$${String.fromCharCode(64 + code)}`;
    if (code >= 27 && code <= 31) return `%${String.fromCharCode(65 + code - 27)}`;
    if (code >= 33 && code <= 44) return `/${String.fromCharCode(65 + code - 33)}`;
    if (code === 47) return '/O';
    if (code === 58) return '/Z';
    if (code >= 59 && code <= 63) return `%${String.fromCharCode(70 + code - 59)}`;
    if (code === 64) return '%V';
    if (code >= 91 && code <= 95) return `%${String.fromCharCode(75 + code - 91)}`;
    if (code === 96) return '%W';
    if (code >= 97 && code <= 122) return `+${String.fromCharCode(65 + code - 97)}`;
    if (code >= 123 && code <= 127) return `%${String.fromCharCode(80 + code - 123)}`;

    return String.fromCharCode(code);
}

/** The Code 39 characters that write `value`: the ones it has, and a pair for each of the others. Throws for anything beyond ASCII. */
export function code39ExtendedText(value: string): string {
    let out = '';

    for (const ch of value) {
        const code = ch.charCodeAt(0);

        if (code > 127) throw new BarcodeError(`"${ch}" cannot be written in Code 39 Extended`);

        // These are in Code 39 itself: digits, capital letters, space and - . and the ones that are not in the table above.
        out += CODE39_ALPHABET.includes(ch) && ch !== '$' && ch !== '/' && ch !== '+' && ch !== '%' ? ch : extendedPair(code);
    }

    return out;
}

/** Encodes `value` in Code 39 Extended: all of ASCII, at the cost of a second character for some. */
export function encodeCode39Extended(value: string, checksum = false): LinearSymbol {
    if (!value) throw new BarcodeError('The value is empty');

    const symbol = encodeCode39(code39ExtendedText(value), checksum);

    return { modules: symbol.modules, text: value };
}

// ---------------------------------------------------------------------------------------------
// Code 11
// ---------------------------------------------------------------------------------------------

/** `n` narrow, `w` wide: bar, space, bar, space, bar. */
export const CODE11_PATTERNS: Record<string, string> = { '0': 'nnnnw', '1': 'wnnnw', '2': 'nwnnw', '3': 'wwnnn', '4': 'nnwnw', '5': 'wnwnn', '6': 'nwwnn', '7': 'nnnww', '8': 'wnnwn', '9': 'wnnnn', '-': 'nnwnn', '*': 'nnwwn' };

const CODE11_ALPHABET = '0123456789-';

/** The check characters of a Code 11 value: one (C) for up to ten characters, two (C and K) for more. */
export function code11Checks(value: string): string {
    const values = [...value].map((ch) => CODE11_ALPHABET.indexOf(ch));
    const check = (list: number[], max: number) => list.reduceRight((sum, v, i) => sum + v * (((list.length - 1 - i) % max) + 1), 0) % 11;
    const c = check(values, 10);
    let out = CODE11_ALPHABET[c];

    if (value.length >= 10) out += CODE11_ALPHABET[check([...values, c], 9)];

    return out;
}

/** Encodes `value` in Code 11, digits and the dash, with its check characters when `checksum` is set. */
export function encodeCode11(value: string, checksum = true): LinearSymbol {
    if (!value) throw new BarcodeError('The value is empty');

    for (const ch of value) if (!CODE11_ALPHABET.includes(ch)) throw new BarcodeError(`"${ch}" cannot be written in Code 11`);

    const text = checksum ? value + code11Checks(value) : value;
    const modules: boolean[] = [];

    [...`*${text}*`].forEach((ch, index) => {
        if (index) modules.push(false);

        let bar = true;

        for (const element of CODE11_PATTERNS[ch]) {
            for (let k = 0; k < (element === 'w' ? 2 : 1); k++) modules.push(bar);

            bar = !bar;
        }
    });

    return { modules, text };
}

// ---------------------------------------------------------------------------------------------
// Codabar
// ---------------------------------------------------------------------------------------------

/** `1` wide, `0` narrow: bar, space, bar, space, bar, space, bar. */
export const CODABAR_PATTERNS: Record<string, string> = {
    '0': '0000011',
    '1': '0000110',
    '2': '0001001',
    '3': '1100000',
    '4': '0010010',
    '5': '1000010',
    '6': '0100001',
    '7': '0100100',
    '8': '0110000',
    '9': '1001000',
    '-': '0001100',
    $: '0011000',
    ':': '1000101',
    '/': '1010001',
    '.': '1010100',
    '+': '0010101',
    A: '0011010',
    B: '0101001',
    C: '0001011',
    D: '0001110'
};

/** Encodes `value` in Codabar. It carries its own start and stop (A to D), and gets `A` at both ends when it has none. */
export function encodeCodabar(value: string): LinearSymbol {
    if (!value) throw new BarcodeError('The value is empty');

    let text = value.toUpperCase();
    const isGuard = (c: string) => 'ABCD'.includes(c);

    if (!isGuard(text[0]) || !isGuard(text[text.length - 1]) || text.length < 2) text = `A${text}A`;

    for (const ch of text.slice(1, -1)) if (!CODABAR_PATTERNS[ch] || isGuard(ch)) throw new BarcodeError(`"${ch}" cannot be written in Codabar`);

    const modules: boolean[] = [];

    [...text].forEach((ch, index) => {
        if (index) modules.push(false);

        let bar = true;

        for (const element of CODABAR_PATTERNS[ch]) {
            for (let k = 0; k < (element === '1' ? 3 : 1); k++) modules.push(bar);

            bar = !bar;
        }
    });

    return { modules, text };
}

// ---------------------------------------------------------------------------------------------
// EAN-13, EAN-8, UPC-A
// ---------------------------------------------------------------------------------------------

const L_CODES = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
const G_CODES = L_CODES.map((c) => [...[...c].map((b) => (b === '1' ? '0' : '1'))].reverse().join(''));
const R_CODES = L_CODES.map((c) => [...c].map((b) => (b === '1' ? '0' : '1')).join(''));
const EAN13_PARITY = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'];

/** The check digit of the digits before it, for EAN and UPC. */
export function eanCheckDigit(digits: string): number {
    let sum = 0;

    for (let i = digits.length - 1, w = 3; i >= 0; i--, w = w === 3 ? 1 : 3) sum += Number(digits[i]) * w;

    return (10 - (sum % 10)) % 10;
}

function ean(value: string, length: number, name: string, checksum: boolean): string {
    if (!/^\d+$/.test(value)) throw new BarcodeError(`${name} takes digits only`);

    if (value.length === length - 1) return value + eanCheckDigit(value);
    if (value.length !== length) throw new BarcodeError(`${name} takes ${length - 1} or ${length} digits`);

    if (checksum && Number(value[length - 1]) !== eanCheckDigit(value.slice(0, -1))) throw new BarcodeError(`The check digit of the ${name} is wrong`);

    return value;
}

/** Encodes `value` as EAN-13. Twelve digits get their check digit added; thirteen are checked when `checksum` is set. */
export function encodeEan13(value: string, checksum = true): LinearSymbol {
    const text = ean(value, 13, 'EAN-13', checksum);
    const parity = EAN13_PARITY[Number(text[0])];
    let bits = '101';

    for (let i = 0; i < 6; i++) bits += (parity[i] === 'L' ? L_CODES : G_CODES)[Number(text[i + 1])];

    bits += '01010';

    for (let i = 7; i < 13; i++) bits += R_CODES[Number(text[i])];

    return { modules: fromBits(bits + '101'), text };
}

/** Encodes `value` as EAN-8. */
export function encodeEan8(value: string, checksum = true): LinearSymbol {
    const text = ean(value, 8, 'EAN-8', checksum);
    let bits = '101';

    for (let i = 0; i < 4; i++) bits += L_CODES[Number(text[i])];

    bits += '01010';

    for (let i = 4; i < 8; i++) bits += R_CODES[Number(text[i])];

    return { modules: fromBits(bits + '101'), text };
}

/** Encodes `value` as UPC-A, which is an EAN-13 with a leading zero. */
export function encodeUpcA(value: string, checksum = true): LinearSymbol {
    const text = ean(value, 12, 'UPC-A', checksum);

    return { modules: encodeEan13(`0${text}`, false).modules, text };
}

/** Where the digits of a symbol sit, for the text under it: spans of modules, with the characters to draw in each. */
export function textGroups(type: LinearBarcodeType, text: string): { from: number; to: number; text: string }[] | null {
    if (type === 'ean13') {
        return [
            { from: -9, to: 0, text: text[0] },
            { from: 3, to: 45, text: text.slice(1, 7) },
            { from: 50, to: 92, text: text.slice(7) }
        ];
    }

    if (type === 'upcA') {
        return [
            { from: -9, to: 0, text: text[0] },
            { from: 10, to: 45, text: text.slice(1, 6) },
            { from: 50, to: 85, text: text.slice(6, 11) },
            { from: 95, to: 104, text: text[11] }
        ];
    }

    if (type === 'ean8') {
        return [
            { from: 3, to: 31, text: text.slice(0, 4) },
            { from: 36, to: 64, text: text.slice(4) }
        ];
    }

    return null;
}

/** Encodes `value` in the chosen symbology. */
export function encodeLinear(type: LinearBarcodeType, value: string, checksum = true): LinearSymbol {
    switch (type) {
        case 'code39':
            return encodeCode39(value, checksum);
        case 'code39Extended':
            return encodeCode39Extended(value, checksum);
        case 'code11':
            return encodeCode11(value, checksum);
        case 'codabar':
            return encodeCodabar(value);
        case 'code128':
            return encodeCode128(value);
        case 'code128A':
            return encodeCode128(value, 'A');
        case 'code128B':
            return encodeCode128(value, 'B');
        case 'code128C':
            return encodeCode128(value, 'C');
        case 'ean13':
            return encodeEan13(value, checksum);
        case 'ean8':
            return encodeEan8(value, checksum);
        case 'upcA':
            return encodeUpcA(value, checksum);
        default:
            throw new BarcodeError(`The barcode type "${type}" is not supported`);
    }
}

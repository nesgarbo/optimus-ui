import { describe, expect, it } from 'vitest';
import { BarcodeError, CODE128_PATTERNS, CODE39_PATTERNS, code128Values, eanCheckDigit, encodeCode128, encodeCode39, encodeEan13, encodeEan8, encodeLinear, encodeUpcA, textGroups } from './barcode-linear';

const width = (m: boolean[]) => m.length;

describe('Code 128', () => {
    it('has a pattern for each of the 107 symbols and each sums to 11 modules (13 for the stop)', () => {
        expect(CODE128_PATTERNS).toHaveLength(107);
        CODE128_PATTERNS.slice(0, 106).forEach((p, i) =>
            expect(
                [...p].reduce((s, c) => s + Number(c), 0),
                `symbol ${i}`
            ).toBe(11)
        );
        expect([...CODE128_PATTERNS[106]].reduce((s, c) => s + Number(c), 0)).toBe(13);
    });

    it('computes the check character', () => {
        // Start B (104) + P(48)*1 + J(42)*2 + J(42)*3 + 1(17)*4 + 2(18)*5 + 3(19)*6 + C(35)*7 = 879, 879 mod 103 = 55
        expect(code128Values('PJJ123C', 'B')).toEqual([104, 48, 42, 42, 17, 18, 19, 35, 55, 106]);
    });

    it('mixes B and C automatically, aligning digit pairs', () => {
        expect(code128Values('12345678')).toEqual([105, 12, 34, 56, 78, expect.any(Number), 106]);
        expect(code128Values('AB123456')).toEqual([104, 33, 34, 99, 12, 34, 56, expect.any(Number), 106]);
        // an odd run keeps its first digit in B
        expect(code128Values('A12345')).toEqual([104, 33, 17, 99, 23, 45, expect.any(Number), 106]);
        // a short run of digits stays in B
        expect(code128Values('A12B')).toEqual([104, 33, 17, 18, 34, expect.any(Number), 106]);
    });

    it('is 11 modules per symbol plus the 2-module stop tail', () => {
        const symbol = encodeCode128('Hello');

        // start + 5 chars + check = 7 symbols of 11, + stop of 13
        expect(width(symbol.modules)).toBe(7 * 11 + 13);
        expect(symbol.modules[0]).toBe(true);
        expect(symbol.modules.at(-1)).toBe(true);
    });

    it('refuses what the set cannot write', () => {
        expect(() => encodeCode128('abc', 'A')).toThrow(BarcodeError);
        expect(() => encodeCode128('123', 'C')).toThrow(BarcodeError);
        expect(() => encodeCode128('é')).toThrow(BarcodeError);
        expect(() => encodeCode128('')).toThrow(BarcodeError);
        expect(code128Values('A\tB', 'A')[2]).toBe(9 + 64);
    });
});

describe('Code 39', () => {
    it('gives every character three wide elements', () => {
        for (const [ch, p] of Object.entries(CODE39_PATTERNS)) {
            expect(p, ch).toHaveLength(9);
            expect(
                [...p].filter((c) => c === 'w'),
                ch
            ).toHaveLength(3);
        }
    });

    it('frames the value with stars and adds the Mod 43 check', () => {
        const plain = encodeCode39('CODE39');

        expect(plain.text).toBe('*CODE39*');
        // C(12)+O(24)+D(13)+E(14)+3+9 = 75, 75 mod 43 = 32 -> 'W'
        expect(encodeCode39('CODE39', true).text).toBe('*CODE39W*');
        expect(encodeCode39('code39').text).toBe('*CODE39*');
        // each character is 12 or 16 modules (3 wide of 3 modules... ) plus 1 for the gap: 6 + 2 stars, 7 gaps
        expect(width(plain.modules)).toBe([...'*CODE39*'].reduce((s, ch) => s + [...CODE39_PATTERNS[ch]].reduce((a, e) => a + (e === 'w' ? 3 : 1), 0), 0) + 7);
        expect(() => encodeCode39('a#b')).toThrow(BarcodeError);
    });
});

describe('EAN and UPC', () => {
    it('computes the check digit', () => {
        expect(eanCheckDigit('400638133393')).toBe(1);
        expect(eanCheckDigit('7351353')).toBe(7);
        expect(eanCheckDigit('03600029145')).toBe(2);
    });

    it('adds a missing check digit and verifies a given one', () => {
        expect(encodeEan13('400638133393').text).toBe('4006381333931');
        expect(encodeEan13('4006381333931').text).toBe('4006381333931');
        expect(() => encodeEan13('4006381333932')).toThrow(BarcodeError);
        expect(encodeEan13('4006381333932', false).text).toBe('4006381333932');
        expect(() => encodeEan13('12ab')).toThrow(BarcodeError);
        expect(encodeEan8('7351353').text).toBe('73513537');
        expect(encodeUpcA('03600029145').text).toBe('036000291452');
    });

    it('lays out guards and halves', () => {
        const m = encodeEan13('4006381333931').modules;
        const bits = m.map((b) => (b ? '1' : '0')).join('');

        expect(m).toHaveLength(95);
        expect(bits.startsWith('101')).toBe(true);
        expect(bits.slice(45, 50)).toBe('01010');
        expect(bits.endsWith('101')).toBe(true);
        // first digit 4 -> parity LGLLGG; the first left digit (0) is L: 0001101
        expect(bits.slice(3, 10)).toBe('0001101');
        // the first right digit is 3 in R: 1000010
        expect(bits.slice(50, 57)).toBe('1000010');
        expect(encodeEan8('73513537').modules).toHaveLength(67);
        expect(encodeUpcA('036000291452').modules).toHaveLength(95);
    });

    it('places the digits under the right modules', () => {
        expect(textGroups('ean13', '4006381333931')!.map((g) => g.text)).toEqual(['4', '006381', '333931']);
        expect(textGroups('upcA', '036000291452')!.map((g) => g.text)).toEqual(['0', '36000', '29145', '2']);
        expect(textGroups('code39', 'x')).toBeNull();
    });
});

describe('encodeLinear', () => {
    it('dispatches by type', () => {
        expect(encodeLinear('code128C', '1234').modules.length).toBe(11 * 4 + 13);
        expect(() => encodeLinear('nope' as any, 'x')).toThrow(BarcodeError);
    });
});

import { CODABAR_PATTERNS, CODE11_PATTERNS, code11Checks, code39ExtendedText, encodeCode11, encodeCode39Extended, encodeCodabar } from './barcode-linear';

describe('Code 39 Extended', () => {
    it('writes what Code 39 cannot as a pair, and what it can as itself', () => {
        expect(code39ExtendedText('Ab 1-.')).toBe('A+B 1-.');
        expect(code39ExtendedText('a')).toBe('+A');
        expect(code39ExtendedText('!')).toBe('/A');
        expect(code39ExtendedText('$/+%')).toBe('/D/O/K/E');
        expect(code39ExtendedText('\u0000\u001a\u001b\u007f')).toBe('%U$Z%A%T');
        expect(code39ExtendedText('@[`{~')).toBe('%V%K%W%P%S');
        expect(code39ExtendedText(':;?')).toBe('/Z%F%J');
    });

    it('covers all of ASCII, each pair made of characters Code 39 has', () => {
        const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%';

        for (let code = 0; code < 128; code++) {
            const text = code39ExtendedText(String.fromCharCode(code));

            expect(text.length, `code ${code}`).toBeLessThanOrEqual(2);
            expect(
                [...text].every((c) => alphabet.includes(c)),
                `code ${code}`
            ).toBe(true);
        }

        // no two characters write the same text
        expect(new Set(Array.from({ length: 128 }, (_, c) => code39ExtendedText(String.fromCharCode(c)))).size).toBe(128);
    });

    it('encodes, and refuses beyond ASCII', () => {
        expect(encodeCode39Extended('Hello').text).toBe('Hello');
        expect(encodeCode39Extended('Hello').modules.length).toBeGreaterThan(encodeCode39('HELLO').modules.length);
        expect(() => encodeCode39Extended('é')).toThrow(BarcodeError);
    });
});

describe('Code 11', () => {
    it('has one wide element in 0, 9 and the dash, and two in the rest', () => {
        for (const [ch, p] of Object.entries(CODE11_PATTERNS)) expect([...p].filter((c) => c === 'w').length, ch).toBe(['0', '9', '-'].includes(ch) ? 1 : 2);
    });

    it('computes C, and K from ten characters on', () => {
        // 123-45: weights from the right 1..: 5*1 + 4*2 + (-=10)*3 + 3*4 + 2*5 + 1*6 = 5+8+30+12+10+6 = 71 mod 11 = 5
        expect(code11Checks('123-45')).toBe('5');
        expect(code11Checks('1234567890')).toHaveLength(2);
        expect(encodeCode11('123-45').text).toBe('123-455');
        expect(encodeCode11('123-45', false).text).toBe('123-45');
        expect(() => encodeCode11('12A')).toThrow(BarcodeError);
    });
});

describe('Codabar', () => {
    it('has the right shape for every character: 2 or 3 wide elements in 7', () => {
        for (const [ch, p] of Object.entries(CODABAR_PATTERNS)) {
            expect(p, ch).toHaveLength(7);
            expect([2, 3]).toContain([...p].filter((c) => c === '1').length);
        }

        expect(new Set(Object.values(CODABAR_PATTERNS)).size).toBe(Object.keys(CODABAR_PATTERNS).length);
    });

    it('adds A at both ends unless the value has guards, and refuses a guard inside', () => {
        expect(encodeCodabar('1234').text).toBe('A1234A');
        expect(encodeCodabar('b123c').text).toBe('B123C');
        expect(() => encodeCodabar('12A34')).toThrow(BarcodeError);
        expect(() => encodeCodabar('12 34')).toThrow(BarcodeError);
    });
});

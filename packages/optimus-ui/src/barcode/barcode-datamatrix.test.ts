import { describe, expect, it } from 'vitest';
import { BarcodeError } from './barcode-linear';
import { DATAMATRIX_SIZES, asciiCodewords, eccOf, encodeDataMatrix, generator, interleave, padCodewords, place } from './barcode-datamatrix';

const bytes = (s: string) => new TextEncoder().encode(s);

describe('Data Matrix tables', () => {
    it('hold exactly the codewords the data area has, for every size', () => {
        for (const s of DATAMATRIX_SIZES) {
            const n = s.regions * s.region;

            expect(s.size, `${s.size}`).toBe(s.regions * (s.region + 2));
            expect(s.data + s.ecc, `${s.size}`).toBe(Math.floor((n * n) / 8));
            expect(s.ecc % s.blocks, `${s.size}`).toBe(0);
            // A Reed-Solomon block cannot be longer than 255 codewords.
            expect(Math.ceil(s.data / s.blocks) + s.ecc / s.blocks, `${s.size}`).toBeLessThanOrEqual(255);
        }
    });
});

describe('Data Matrix data', () => {
    it('packs digit pairs, shifts the extended bytes and offsets the rest', () => {
        expect(asciiCodewords(bytes('A'))).toEqual([66]);
        expect(asciiCodewords(bytes('12'))).toEqual([142]);
        expect(asciiCodewords(bytes('1234'))).toEqual([142, 164]);
        expect(asciiCodewords(bytes('123'))).toEqual([142, 52]);
        expect(asciiCodewords(bytes('a1b'))).toEqual([98, 50, 99]);
        expect(asciiCodewords(Uint8Array.of(200))).toEqual([235, 73]);
    });

    it('pads with 129 then with scrambled pads', () => {
        // The first pad is 129, the next ones follow the 253 state sequence of the specification: for "A" in a 3 word symbol
        // the third codeword: 129 + (149 * 3 mod 253) + 1 = 324, which is over 254, so 254 comes off
        expect(padCodewords([66], 3)).toEqual([66, 129, 70]);
        expect(padCodewords([1, 2, 3], 3)).toEqual([1, 2, 3]);
        expect(padCodewords([66], 8).length).toBe(8);
        expect(padCodewords([66], 8).every((w) => w >= 1 && w <= 254)).toBe(true);
    });
});

describe('Data Matrix error correction', () => {
    it('builds the generator polynomial, and a codeword followed by its remainder divides evenly', () => {
        expect(generator(1)).toEqual([1, 2]); // x - 2
        expect(generator(5)).toHaveLength(6);

        const data = [142, 164, 56, 7, 9, 200];
        const ecc = eccOf(data, 10);
        const whole = [...data, ...ecc];

        // Every root of the generator is a root of the codeword: evaluate it at 2^1 .. 2^10.
        const exp = (i: number) => {
            let x = 1;

            for (let k = 0; k < i; k++) {
                x <<= 1;

                if (x & 0x100) x ^= 0x12d;
            }

            return x;
        };
        const mul = (a: number, b: number) => {
            let r = 0;

            for (let i = 0; i < 8; i++) {
                if (b & 1) r ^= a;

                a <<= 1;

                if (a & 0x100) a ^= 0x12d;

                b >>= 1;
            }

            return r;
        };

        for (let i = 1; i <= 10; i++)
            expect(
                whole.reduce((acc, c) => mul(acc, exp(i)) ^ c, 0),
                `root ${i}`
            ).toBe(0);
    });

    it('deals the largest symbol out over ten blocks of unequal length, and interleaves only the error correction', () => {
        const s = DATAMATRIX_SIZES.at(-1)!;
        const data = Array.from({ length: s.data }, (_, i) => (i % 250) + 1);
        const all = interleave(data, s);

        expect(all).toHaveLength(s.data + s.ecc);
        // the data keeps its order
        expect(all.slice(0, s.data)).toEqual(data);
        // the error correction starts with the blocks 8 and 9, which had no data left to take after the 1550th codeword, then 0, 1...
        const first = (b: number) =>
            eccOf(
                data.filter((_, i) => i % 10 === b),
                62
            )[0];

        expect(all.slice(s.data, s.data + 4)).toEqual([first(8), first(9), first(0), first(1)]);
    });
});

describe('Data Matrix placement', () => {
    it('fills every module of the data area, for every size', () => {
        for (const s of DATAMATRIX_SIZES) {
            const n = s.regions * s.region;
            const grid = place(
                Array.from({ length: s.data + s.ecc }, () => 0xff),
                n
            );

            // With all bits set, every module the walk visits is dark: the ones it does not are the residue of the sizes that have some.
            const dark = grid.flat().filter(Boolean).length;
            const residue = n * n - (s.data + s.ecc) * 8;

            expect(dark, `${s.size}`).toBe((s.data + s.ecc) * 8 + (residue ? 2 : 0));
        }
    });
});

describe('encodeDataMatrix', () => {
    it('picks the smallest size and draws the finder and the clock of every region', () => {
        const a = encodeDataMatrix('A');

        expect(a.size).toBe(10);
        expect(encodeDataMatrix('1234567890').size).toBe(12); // five words
        expect(encodeDataMatrix('Hello, Data Matrix 2026').size).toBeGreaterThanOrEqual(18);

        const { modules, size: n } = encodeDataMatrix('x'.repeat(100));

        expect(n).toBeGreaterThanOrEqual(32);

        // The bottom left module of every region is dark, as is the whole left edge and bottom edge of it.
        const regions = DATAMATRIX_SIZES.find((x) => x.size === n)!;
        const pitch = regions.region + 2;

        for (let ri = 0; ri < regions.regions; ri++) {
            for (let ci = 0; ci < regions.regions; ci++) {
                for (let i = 0; i < pitch; i++) {
                    expect(modules[ri * pitch + i][ci * pitch]).toBe(true);
                    expect(modules[ri * pitch + pitch - 1][ci * pitch + i]).toBe(true);
                    expect(modules[ri * pitch][ci * pitch + i]).toBe(i % 2 === 0);
                }
            }
        }
    });

    it('refuses what does not fit', () => {
        expect(() => encodeDataMatrix('x'.repeat(1559))).toThrow(BarcodeError);
        expect(encodeDataMatrix('x'.repeat(1557)).size).toBe(144);
    });
});

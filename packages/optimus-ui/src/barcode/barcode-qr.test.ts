import { describe, expect, it } from 'vitest';
import { BarcodeError } from './barcode-linear';
import { dataCodewords, encodeQr, qrFormatBits, rawDataModules, rsRemainder } from './barcode-qr';

describe('QR tables', () => {
    it('matches the published capacities', () => {
        expect(rawDataModules(1)).toBe(208);
        expect(rawDataModules(7)).toBe(1568);
        expect(rawDataModules(40)).toBe(29648);

        // Data codewords per version and level, from the specification.
        expect([dataCodewords(1, 'low'), dataCodewords(1, 'medium'), dataCodewords(1, 'quartile'), dataCodewords(1, 'high')]).toEqual([19, 16, 13, 9]);
        expect([dataCodewords(10, 'low'), dataCodewords(10, 'medium'), dataCodewords(10, 'quartile'), dataCodewords(10, 'high')]).toEqual([274, 216, 154, 122]);
        expect([dataCodewords(40, 'low'), dataCodewords(40, 'medium'), dataCodewords(40, 'quartile'), dataCodewords(40, 'high')]).toEqual([2956, 2334, 1666, 1276]);
    });

    it('writes the known format string', () => {
        expect(qrFormatBits('low', 0).toString(2).padStart(15, '0')).toBe('111011111000100');
        expect(qrFormatBits('medium', 0).toString(2).padStart(15, '0')).toBe('101010000010010');
    });

    it('does Reed-Solomon over GF(256)', () => {
        // The worked example of the specification: "HELLO WORLD", version 1, level M.
        const data = [32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236, 17, 236, 17];

        expect(rsRemainder(data, divisorOf(10))).toEqual([196, 35, 39, 119, 235, 215, 231, 226, 93, 23]);
    });
});

function divisorOf(degree: number): number[] {
    // Re-derived here so the test does not lean on the module's private helper.
    const mul = (x: number, y: number) => {
        let z = 0;

        for (let i = 7; i >= 0; i--) {
            z = (z << 1) ^ ((z >>> 7) * 0x11d);
            z ^= ((y >>> i) & 1) * x;
        }

        return z;
    };
    const result = Array(degree).fill(0);

    result[degree - 1] = 1;

    let root = 1;

    for (let i = 0; i < degree; i++) {
        for (let j = 0; j < degree; j++) {
            result[j] = mul(result[j], root);
            if (j + 1 < degree) result[j] ^= result[j + 1];
        }

        root = mul(root, 2);
    }

    return result;
}

describe('encodeQr', () => {
    it('picks the smallest version that fits and raises the level for free', () => {
        const a = encodeQr('HELLO WORLD', { errorCorrection: 'low', boost: false });

        expect(a.version).toBe(1);
        expect(a.size).toBe(21);
        expect(encodeQr('HELLO WORLD', { errorCorrection: 'low' }).errorCorrection).toBe('quartile');
        expect(encodeQr('x'.repeat(30), { errorCorrection: 'low', boost: false }).version).toBe(2);
    });

    it('has the fixed patterns where the specification puts them', () => {
        const { modules, size } = encodeQr('https://www.openng.org');
        const finder = (x: number, y: number) => {
            for (let dy = 0; dy < 7; dy++)
                for (let dx = 0; dx < 7; dx++) {
                    const edge = dx === 0 || dx === 6 || dy === 0 || dy === 6;
                    const core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;

                    if (modules[y + dy][x + dx] !== (edge || core)) return false;
                }

            return true;
        };

        expect(finder(0, 0) && finder(size - 7, 0) && finder(0, size - 7)).toBe(true);
        expect(modules[size - 8][8]).toBe(true); // the dark module
        expect(modules[6].slice(8, size - 8).every((m, i) => m === (i % 2 === 0))).toBe(true); // timing row
    });

    it('is deterministic and varies with the value', () => {
        expect(encodeQr('abc').modules).toEqual(encodeQr('abc').modules);
        expect(encodeQr('abc').modules).not.toEqual(encodeQr('abd').modules);
    });

    it('writes UTF-8 and long values, and refuses what cannot fit', () => {
        expect(encodeQr('Ünïcödé ✓').version).toBeGreaterThanOrEqual(1);
        expect(encodeQr('a'.repeat(2953), { errorCorrection: 'low', boost: false }).version).toBe(40);
        expect(() => encodeQr('a'.repeat(2954), { errorCorrection: 'low' })).toThrow(BarcodeError);
        expect(() => encodeQr('a'.repeat(100), { version: 1 })).toThrow(BarcodeError);
        expect(() => encodeQr('a', { version: 41 })).toThrow(BarcodeError);
        expect(encodeQr('1', { version: 3 }).version).toBe(3);
    });

    it('draws the version information from version 7', () => {
        const q = encodeQr('x'.repeat(200), { errorCorrection: 'low', boost: false });

        expect(q.version).toBeGreaterThanOrEqual(7);
        expect(q.modules).toHaveLength(q.size);
    });
});

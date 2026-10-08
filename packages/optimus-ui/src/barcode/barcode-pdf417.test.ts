import { describe, expect, it } from 'vitest';
import { BarcodeError } from './barcode-linear';
import { byteCodewords, checkCodewords, defaultLevel, eccCount, encodePdf417, numericCodewords, pdf417Patterns } from './barcode-pdf417';

describe('the patterns', () => {
    const tables = pdf417Patterns();

    it('are 929 distinct ones for each of the three clusters', () => {
        expect(tables).toHaveLength(3);

        for (const t of tables) {
            expect(t).toHaveLength(929);
            expect(new Set(t).size).toBe(929);
        }
    });

    it('start as the standard lists them, and end as it ends them', () => {
        expect(tables[0].slice(0, 4)).toEqual([0x1d5c0, 0x1eaf0, 0x1f57c, 0x1d4e0]);
        expect(tables[1].slice(0, 2)).toEqual([0x1f560, 0x1fab8]);
        expect(tables[2].slice(0, 2)).toEqual([0x1abe0, 0x1d5f8]);
        expect(tables.map((t) => t[928])).toEqual([0x1bef4, 0x13f26, 0x1c7ea]);
    });

    it('add up, entry by entry, to the checksum of the standard table', () => {
        const sum = (t: number[]) => t.reduce((s, p, i) => (s + p * (i + 1)) % 2 ** 32, 0);

        expect(tables.map(sum)).toEqual([3207889740, 2177796850, 958469882]);
    });

    it('are four bars and four spaces of 17 modules, each cluster with its own bar signature', () => {
        tables.forEach((t, cluster) => {
            for (const p of t) {
                const bits = p.toString(2).padStart(17, '0');
                const runs = bits.match(/1+|0+/g)!.map((r) => r.length);

                expect(bits[0]).toBe('1');
                expect(bits[16]).toBe('0');
                expect(runs).toHaveLength(8);
                expect(Math.max(...runs)).toBeLessThanOrEqual(6);
                expect((((runs[0] - runs[2] + runs[4] - runs[6]) % 9) + 9) % 9).toBe(cluster * 3);
            }
        });
    });
});

describe('compaction', () => {
    it('latches to bytes: six bytes in five codewords, the rest one by one', () => {
        expect(byteCodewords(new Uint8Array([1, 2, 3, 4, 5, 6]))[0]).toBe(924);
        expect(byteCodewords(new Uint8Array([1, 2, 3, 4, 5, 6, 7]))).toHaveLength(1 + 5 + 1);
        expect(byteCodewords(new Uint8Array([7, 8, 9]))).toEqual([901, 7, 8, 9]);
        // 0 0 0 0 0 1 in base 900 is 0 0 0 0 1
        expect(byteCodewords(new Uint8Array([0, 0, 0, 0, 0, 1]))).toEqual([924, 0, 0, 0, 0, 1]);
        // 0xFFFFFFFFFFFF = 281474976710655, in base 900
        expect(byteCodewords(new Uint8Array(6).fill(255)).slice(1)).toEqual(base900(281474976710655n));
    });

    it('latches to numbers: "1" and the digits, in base 900', () => {
        // 1 followed by 12 is 112
        expect(numericCodewords('12')).toEqual([902, 112]);
        expect(numericCodewords('0')[1]).toBe(10);
        // 45 digits make two groups
        expect(numericCodewords('9'.repeat(45)).length).toBeGreaterThan(numericCodewords('9'.repeat(44)).length);
    });
});

function base900(n: bigint): number[] {
    const out: number[] = [];

    while (n > 0n) {
        out.unshift(Number(n % 900n));
        n /= 900n;
    }

    return out;
}

describe('error correction', () => {
    it('counts 2, 4, 8... and picks a level by the amount of data', () => {
        expect([0, 1, 2, 8].map(eccCount)).toEqual([2, 4, 8, 512]);
        expect([10, 41, 161, 321, 864].map(defaultLevel)).toEqual([2, 3, 4, 5, 6]);
    });

    it('make the codeword polynomial vanish at the roots 3, 9, 27...', () => {
        const data = [11, 22, 300, 4, 5, 928, 0, 77];

        for (const level of [0, 2, 4]) {
            const word = [...data, ...checkCodewords(data, level)];
            let root = 1;

            for (let i = 0; i < eccCount(level); i++) {
                root = (root * 3) % 929;

                // Horner, from the highest power
                expect(
                    word.reduce((acc, c) => (acc * root + c) % 929, 0),
                    `level ${level} root ${i + 1}`
                ).toBe(0);
            }
        }
    });
});

describe('encodePdf417', () => {
    it('draws rows of start, indicator, data, indicator and stop, three modules tall', () => {
        const s = encodePdf417('Hello PDF417', { columns: 4 });
        const width = 17 + 17 + 4 * 17 + 17 + 18;

        expect(s.columns).toBe(4);
        expect(s.rows).toBeGreaterThanOrEqual(3);
        expect(s.modules).toHaveLength(s.rows * 3);
        expect(s.modules.every((r) => r.length === width)).toBe(true);
        // the start pattern 81111113 and the stop 711311121 open and close every row
        const bits = (r: boolean[]) => r.map((b) => (b ? '1' : '0')).join('');

        expect(bits(s.modules[0]).startsWith('11111111010101000')).toBe(true);
        expect(bits(s.modules[0]).endsWith('111111101000101001')).toBe(true);
        // the three rows of a stack are the same
        expect(s.modules[0]).toEqual(s.modules[2]);
    });

    it('chooses a shape about three times as wide as tall, and honours an explicit one', () => {
        const auto = encodePdf417('x'.repeat(300));

        expect((17 * (auto.columns + 4)) / (auto.rows * 3)).toBeGreaterThan(1.5);
        expect((17 * (auto.columns + 4)) / (auto.rows * 3)).toBeLessThan(6);
        expect(encodePdf417('x'.repeat(300), { columns: 10 }).columns).toBe(10);
    });

    it('declares UTF-8 for text beyond ASCII, and numbers for digits', () => {
        const rowsOf = (t: string) => encodePdf417(t, { columns: 1 }).rows;

        expect(rowsOf('é')).toBeGreaterThan(rowsOf('e')); // two codewords of ECI more
        expect(rowsOf('1'.repeat(40))).toBeLessThan(rowsOf('a'.repeat(40)));
    });

    it('refuses what cannot be written', () => {
        expect(() => encodePdf417('x', { columns: 31 })).toThrow(BarcodeError);
        expect(() => encodePdf417('x', { errorCorrectionLevel: 9 })).toThrow(BarcodeError);
        expect(() => encodePdf417('x'.repeat(4000), { columns: 2 })).toThrow(BarcodeError);
    });
});

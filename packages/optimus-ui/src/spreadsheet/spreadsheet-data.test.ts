import { describe, expect, it } from 'vitest';
import { columnIndex, columnName, findSheet, fromA1, parseCsv, rowsToWorkbook, sheetToRows, toA1, toCsv } from './spreadsheet-data';

describe('addresses', () => {
    it('names columns as a sheet does', () => {
        expect([0, 1, 25, 26, 27, 51, 52, 701, 702, 16383].map(columnName)).toEqual(['A', 'B', 'Z', 'AA', 'AB', 'AZ', 'BA', 'ZZ', 'AAA', 'XFD']);
        expect(columnName(-1)).toBe('');
    });

    it('reads columns back', () => {
        expect(['A', 'z', 'AA', 'XFD'].map(columnIndex)).toEqual([0, 25, 26, 16383]);
        expect(columnIndex('A1')).toBe(-1);

        for (const n of [0, 5, 25, 26, 700, 702, 16383]) expect(columnIndex(columnName(n))).toBe(n);
    });

    it('turns a row and a column into an address and back', () => {
        expect(toA1(0, 0)).toBe('A1');
        expect(toA1(9, 27)).toBe('AB10');
        expect(fromA1('AB10')).toEqual({ row: 9, column: 27 });
        expect(fromA1('$C$3')).toEqual({ row: 2, column: 2 });
        expect(fromA1(' b2 ')).toEqual({ row: 1, column: 1 });
        expect(fromA1('A0')).toBeNull();
        expect(fromA1('1A')).toBeNull();
        expect(fromA1('A1:B2')).toBeNull();
    });
});

describe('rows and workbooks', () => {
    const rows = [
        ['Item', 'Price', 'Qty', 'Total'],
        ['Pen', 1.5, 4, '=B2*C2'],
        ['Book', 12, 2, '=B3*C3'],
        [null, '', true, new Date('2025-03-04T10:00:00Z')]
    ];

    it('makes a workbook with a formula where a string starts with =', () => {
        const book = rowsToWorkbook(rows, { header: true });
        const sheet = findSheet(book)!;

        expect(sheet.cellData![1][3]).toEqual({ f: '=B2*C2' });
        expect(sheet.cellData![1][1]).toEqual({ v: 1.5 });
        expect(sheet.cellData![0][0]).toEqual({ v: 'Item', s: { bl: 1 } });
        expect(sheet.cellData![3][2]).toEqual({ v: true });
        expect(sheet.cellData![3][3]).toEqual({ v: '2025-03-04' });
        // Empty cells are not stored.
        expect(sheet.cellData![3][0]).toBeUndefined();
        expect(sheet.cellData![3][1]).toBeUndefined();
    });

    it('leaves room around what is filled in, and more when asked', () => {
        const small = findSheet(rowsToWorkbook([[1]]))!;
        const big = findSheet(rowsToWorkbook([[1]], { minRows: 500, minColumns: 40 }))!;

        expect([small.rowCount, small.columnCount]).toEqual([100, 26]);
        expect([big.rowCount, big.columnCount]).toEqual([500, 40]);
    });

    it('reads the values back as rows, sized to what is filled in', () => {
        const book = rowsToWorkbook(rows);

        // A formula with no value yet is kept as a hole: its result is the engine's to work out.
        expect(sheetToRows(findSheet(book))).toEqual([
            ['Item', 'Price', 'Qty', 'Total'],
            ['Pen', 1.5, 4, null],
            ['Book', 12, 2, null],
            [null, null, true, '2025-03-04']
        ]);
        expect(sheetToRows(null)).toEqual([]);
        expect(sheetToRows({})).toEqual([]);
    });

    it('finds a sheet by position, id or name, and the first by default', () => {
        const book = { sheetOrder: ['b', 'a'], sheets: { a: { id: 'a', name: 'Alpha' }, b: { id: 'b', name: 'Beta' } } };

        expect(findSheet(book)?.name).toBe('Beta');
        expect(findSheet(book, 1)?.name).toBe('Alpha');
        expect(findSheet(book, 'a')?.name).toBe('Alpha');
        expect(findSheet(book, 'Beta')?.id).toBe('b');
        expect(findSheet(book, 'Gamma')).toBeNull();
        expect(findSheet(book, 5)).toBeNull();
        expect(findSheet(null)).toBeNull();
    });
});

describe('csv', () => {
    it('quotes what needs it', () => {
        expect(toCsv([['a', 'b,c', 'say "hi"', 'two\nlines', null, 3]])).toBe('a,"b,c","say ""hi""","two\nlines",,3');
        expect(toCsv([['a', 'b;c']], ';')).toBe('a;"b;c"');
    });

    it('reads it back, with numbers and booleans, quotes, and both kinds of line break', () => {
        const text = 'name,qty,ok\r\n"Smith, J",3,true\r\n"say ""hi""",2.5,FALSE\n,,\n';

        expect(parseCsv(text)).toEqual([
            ['name', 'qty', 'ok'],
            ['Smith, J', 3, true],
            ['say "hi"', 2.5, false],
            [null, null, null]
        ]);
    });

    it('keeps a quoted number as text, and a last line with no line break', () => {
        expect(parseCsv('"007",7')).toEqual([['007', 7]]);
        expect(parseCsv('')).toEqual([]);
    });

    it('is undone by itself for text that has every awkward character', () => {
        const rows = [
            ['a,b', 'c"d', 'e\nf', 'g'],
            ['h', 1, true, null]
        ];

        expect(parseCsv(toCsv(rows))).toEqual(rows);
    });
});

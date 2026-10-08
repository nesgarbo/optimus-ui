import { describe, expect, it } from 'vitest';
import { csvCell, defuseFormula } from './csv';
import { buildCsv } from './export';

describe('csv cells', () => {
    it('defuses a cell that a spreadsheet would run as a formula', () => {
        for (const cell of ['=SUM(A1:A9)', '+cmd|calc', '-2+3', '@SUM(1)', '\tcmd', '\rcmd']) {
            expect(defuseFormula(cell)).toBe(`'${cell}`);
        }
    });

    it('leaves a plain number alone, negative and scientific included', () => {
        for (const cell of ['-3.5', '42', '+7', '-1e-7', '.5', '1E5']) {
            expect(defuseFormula(cell)).toBe(cell);
        }
    });

    it('leaves ordinary text alone', () => {
        expect(defuseFormula('January')).toBe('January');
        expect(defuseFormula('')).toBe('');
    });

    it('quotes a cell with a separator, a quote or a line break', () => {
        expect(csvCell('a,b')).toBe('"a,b"');
        expect(csvCell('say "hi"')).toBe('"say ""hi"""');
        expect(csvCell('two\nlines')).toBe('"two\nlines"');
    });

    it('defuses first and quotes second, so a formula with a comma stays inert', () => {
        expect(csvCell('=HYPERLINK("x","y")')).toBe('"\'=HYPERLINK(""x"",""y"")"');
    });
});

describe('buildCsv', () => {
    it('writes CRLF rows and defuses the cells', () => {
        expect(
            buildCsv([
                ['name', 'value'],
                ['=1+1', -4]
            ])
        ).toBe("name,value\r\n'=1+1,-4");
    });
});

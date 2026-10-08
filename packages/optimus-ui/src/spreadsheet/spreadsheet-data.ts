/**
 * Helpers for the data of a spreadsheet, which need no spreadsheet engine: addresses of cells, a table of rows turned into a
 * workbook and back, and CSV.
 *
 * @module spreadsheet-data
 */
import type { SpreadsheetCell, SpreadsheetData, SpreadsheetSheet } from '@openng/optimus-ui/types/spreadsheet';

/** The letters of a column, from 0: `A`, `B`, ... `Z`, `AA`. */
export function columnName(index: number): string {
    let n = Math.floor(index);
    let name = '';

    if (n < 0) return '';

    do {
        name = String.fromCharCode(65 + (n % 26)) + name;
        n = Math.floor(n / 26) - 1;
    } while (n >= 0);

    return name;
}

/** The position of a column from its letters, from 0. */
export function columnIndex(name: string): number {
    let n = 0;

    for (const char of name.toUpperCase()) {
        const code = char.charCodeAt(0) - 64;

        if (code < 1 || code > 26) return -1;

        n = n * 26 + code;
    }

    return n - 1;
}

/** The address of a cell from its row and column, both from 0: `0, 0` is `A1`. */
export function toA1(row: number, column: number): string {
    return `${columnName(column)}${row + 1}`;
}

/** The row and the column of an address, both from 0, or `null` when it is not one. A `$` is ignored. */
export function fromA1(address: string): { row: number; column: number } | null {
    const match = /^\$?([A-Za-z]{1,3})\$?(\d{1,7})$/.exec(address.trim());

    if (!match) return null;

    const column = columnIndex(match[1]);
    const row = Number(match[2]) - 1;

    return column < 0 || row < 0 ? null : { row, column };
}

/** What a cell shows: its value, or empty. */
function cellValue(cell: SpreadsheetCell | undefined): string | number | boolean | null {
    if (!cell) return null;

    return cell.v === undefined ? null : cell.v;
}

/** The sheet of a workbook, by its position, its id or its name. The first sheet when none is named. */
export function findSheet(data: SpreadsheetData | null | undefined, which?: number | string): SpreadsheetSheet | null {
    if (!data?.sheets) return null;

    const ids = data.sheetOrder?.length ? data.sheetOrder : Object.keys(data.sheets);

    if (which == null) return data.sheets[ids[0]] ?? null;

    if (typeof which === 'number') return data.sheets[ids[which]] ?? null;

    return data.sheets[which] ?? ids.map((id) => data.sheets![id]).find((s) => s?.name === which) ?? null;
}

/** The values of a sheet as a table of rows, as large as the cells that are filled in. */
export function sheetToRows(sheet: SpreadsheetSheet | null): (string | number | boolean | null)[][] {
    const cells = sheet?.cellData;

    if (!cells) return [];

    let rows = 0;
    let columns = 0;

    for (const [r, row] of Object.entries(cells)) {
        for (const [c, cell] of Object.entries(row ?? {})) {
            if (cellValue(cell) === null && !cell?.f) continue;

            rows = Math.max(rows, Number(r) + 1);
            columns = Math.max(columns, Number(c) + 1);
        }
    }

    return Array.from({ length: rows }, (_, r) => Array.from({ length: columns }, (_, c) => cellValue(cells[r]?.[c])));
}

/** A workbook made of a table of rows, in one sheet. A string that starts with `=` is a formula. */
export function rowsToWorkbook(rows: readonly (readonly unknown[])[], options: { name?: string; sheetName?: string; id?: string; header?: boolean; minRows?: number; minColumns?: number } = {}): SpreadsheetData {
    const cellData: Record<number, Record<number, SpreadsheetCell>> = {};
    let columns = 0;

    rows.forEach((row, r) => {
        cellData[r] = {};
        columns = Math.max(columns, row.length);

        row.forEach((value, c) => {
            if (value === null || value === undefined || value === '') return;

            if (typeof value === 'string' && value.startsWith('=')) cellData[r][c] = { f: value };
            else if (typeof value === 'number' || typeof value === 'boolean') cellData[r][c] = { v: value };
            else if (value instanceof Date) cellData[r][c] = { v: value.toISOString().slice(0, 10) };
            else cellData[r][c] = { v: String(value) };

            if (options.header && r === 0) cellData[r][c].s = { bl: 1 };
        });
    });

    const id = options.id ?? 'sheet-1';

    return {
        id: options.id ? `${options.id}-workbook` : 'workbook-1',
        name: options.name ?? 'Workbook',
        locale: 'enUS',
        sheetOrder: [id],
        sheets: { [id]: { id, name: options.sheetName ?? 'Sheet1', rowCount: Math.max(rows.length + 20, options.minRows ?? 100), columnCount: Math.max(columns + 6, options.minColumns ?? 26), cellData } }
    };
}

/** Quotes a value for CSV when it has a separator, a quote or a line break in it. */
export function csvField(value: unknown, separator = ','): string {
    if (value === null || value === undefined) return '';

    const text = String(value);

    return text.includes(separator) || /["\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** A table of rows as CSV. */
export function toCsv(rows: readonly (readonly unknown[])[], separator = ','): string {
    return rows.map((row) => row.map((v) => csvField(v, separator)).join(separator)).join('\n');
}

/** CSV as a table of rows. Numbers and the words `true` and `false` become what they say; the rest stays text. */
export function parseCsv(text: string, separator = ','): (string | number | boolean | null)[][] {
    const rows: (string | number | boolean | null)[][] = [];
    let row: (string | number | boolean | null)[] = [];
    let field = '';
    let quoted = false;
    let wasQuoted = false;
    const push = () => {
        let value: string | number | boolean | null = field;

        if (!wasQuoted) {
            if (field === '') value = null;
            else if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(field.trim())) value = Number(field);
            else if (/^(true|false)$/i.test(field.trim())) value = field.trim().toLowerCase() === 'true';
        }

        row.push(value);
        field = '';
        wasQuoted = false;
    };

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (quoted) {
            if (char === '"' && text[i + 1] === '"') {
                field += '"';
                i++;
            } else if (char === '"') quoted = false;
            else field += char;
        } else if (char === '"') {
            quoted = true;
            wasQuoted = true;
        } else if (char === separator) push();
        else if (char === '\n' || char === '\r') {
            if (char === '\r' && text[i + 1] === '\n') i++;

            push();
            rows.push(row);
            row = [];
        } else field += char;
    }

    if (field !== '' || wasQuoted || row.length) {
        push();
        rows.push(row);
    }

    return rows;
}

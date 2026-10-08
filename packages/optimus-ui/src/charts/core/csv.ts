/**
 * CSV cells.
 *
 * A chart's labels and series names come from application data, so a cell can begin with `=`, `+`,
 * `-` or `@` and be run as a formula when the file is opened in a spreadsheet. A leading quote
 * defuses it; a plain number is left alone, since `-3.5` is data and not a formula.
 */

/** Prefixes a cell that a spreadsheet would run as a formula. */
export function defuseFormula(cell: string): string {
    return /^[=+\-@\t\r]/.test(cell) && !/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(cell) ? `'${cell}` : cell;
}

/** Defuses and quotes one CSV cell. */
export function csvCell(cell: string): string {
    const safe = defuseFormula(cell);

    return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

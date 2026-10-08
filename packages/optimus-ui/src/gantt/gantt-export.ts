/**
 * Writing a Gantt out: a CSV of the grid, an SVG drawing of the whole chart, and a PDF that holds a picture of it.
 *
 * Pure, and with no dependency. The PDF is as small as a PDF gets: one page the size of the picture, with the picture as a
 * JPEG the viewer decodes itself.
 *
 * @module gantt-export
 */

/** Writes cells as CSV: quoted when they hold a comma, a quote or a line break. */
export function toCsv(rows: readonly (readonly (string | number | null | undefined)[])[], separator = ','): string {
    const cell = (v: string | number | null | undefined) => {
        const s = v === null || v === undefined ? '' : String(v);

        // A cell that starts like a formula would run in a spreadsheet: a leading quote defuses it.
        const safe = /^[=+\-@\t\r]/.test(s) && typeof v === 'string' && !/^-?\d+(\.\d+)?$/.test(s) ? `'${s}` : s;

        return /[",\n\r]/.test(safe) || safe.includes(separator) ? `"${safe.replace(/"/g, '""')}"` : safe;
    };

    return rows.map((r) => r.map(cell).join(separator)).join('\r\n');
}

/** What the drawing needs, all in pixels. */
export interface ExportSnapshot {
    width: number;
    height: number;
    headHeight: number;
    gridWidth: number;
    chartWidth: number;
    rowHeight: number;
    font: string;
    colors: {
        text: string;
        muted: string;
        line: string;
        background: string;
        header: string;
        shade: string;
        bar: string;
        progress: string;
        parent: string;
        critical: string;
        criticalProgress: string;
        link: string;
        criticalLink: string;
        today: string;
        baseline: string;
    };
    /** Index of the column that holds the tree, which is indented by the level of each row. */
    treeColumn: number;
    columns: { header: string; width: number; align: 'left' | 'center' | 'right' }[];
    rows: { y: number; cells: string[]; level: number; bold: boolean }[];
    tiers: { top: { x: number; width: number; label: string }[]; bottom: { x: number; width: number; label: string }[]; height: number };
    shades: { x: number; width: number }[];
    lines: number[];
    bars: { left: number; top: number; width: number; height: number; progressWidth: number; isParent: boolean; isMilestone: boolean; critical: boolean; baseline: { left: number; width: number } | null; label: string }[];
    links: { d: string; critical: boolean }[];
    todayX: number | null;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const r = (n: number) => Math.round(n * 100) / 100;

/** The whole gantt as a standalone SVG. */
export function toSvg(s: ExportSnapshot): string {
    const c = s.colors;
    const x0 = s.gridWidth;
    const top = s.headHeight;
    const out: string[] = [`<svg xmlns="http://www.w3.org/2000/svg" width="${s.width}" height="${s.height}" viewBox="0 0 ${s.width} ${s.height}" font-family="${esc(s.font)}" font-size="13">`];

    out.push(`<rect width="100%" height="100%" fill="${esc(c.background)}"/>`);

    // The header.
    out.push(`<rect width="${s.width}" height="${top}" fill="${esc(c.header)}"/>`);

    let x = 0;

    for (const col of s.columns) {
        const tx = col.align === 'right' ? x + col.width - 8 : col.align === 'center' ? x + col.width / 2 : x + 8;
        const anchor = col.align === 'right' ? 'end' : col.align === 'center' ? 'middle' : 'start';

        out.push(`<text x="${r(tx)}" y="${top / 2 + 4}" text-anchor="${anchor}" font-weight="600" fill="${esc(c.muted)}">${esc(col.header)}</text>`);
        out.push(`<line x1="${x + col.width}" y1="0" x2="${x + col.width}" y2="${top}" stroke="${esc(c.line)}"/>`);
        x += col.width;
    }

    for (const [tier, row] of [
        [s.tiers.top, 0],
        [s.tiers.bottom, 1]
    ] as const) {
        for (const cell of tier) {
            const cx = x0 + cell.x;

            out.push(`<line x1="${r(cx)}" y1="${row * s.tiers.height}" x2="${r(cx)}" y2="${(row + 1) * s.tiers.height}" stroke="${esc(c.line)}"/>`);

            if (cell.width >= 14) out.push(`<text x="${r(cx + cell.width / 2)}" y="${row * s.tiers.height + s.tiers.height / 2 + 4}" text-anchor="middle" font-size="11" fill="${esc(c.muted)}">${esc(cell.label)}</text>`);
        }
    }

    out.push(`<line x1="0" y1="${s.tiers.height}" x2="${s.width}" y2="${s.tiers.height}" stroke="${esc(c.line)}"/>`, `<line x1="0" y1="${top}" x2="${s.width}" y2="${top}" stroke="${esc(c.line)}"/>`);

    // The rows of the grid, and of the chart.
    for (const row of s.rows) {
        const y = top + row.y;
        let cx = 0;

        out.push(`<line x1="0" y1="${y + s.rowHeight}" x2="${s.width}" y2="${y + s.rowHeight}" stroke="${esc(c.line)}" opacity="0.6"/>`);

        row.cells.forEach((text, i) => {
            const col = s.columns[i];
            const pad = i === s.treeColumn ? row.level * 16 : 0;
            const tx = col.align === 'right' ? cx + col.width - 8 : col.align === 'center' ? cx + col.width / 2 : cx + 8 + pad;
            const anchor = col.align === 'right' ? 'end' : col.align === 'center' ? 'middle' : 'start';

            out.push(`<text x="${r(tx)}" y="${y + s.rowHeight / 2 + 4}" text-anchor="${anchor}"${row.bold ? ' font-weight="600"' : ''} fill="${esc(c.text)}">${esc(text)}</text>`);
            cx += col.width;
        });
    }

    out.push(`<line x1="${x0}" y1="0" x2="${x0}" y2="${s.height}" stroke="${esc(c.line)}" stroke-width="2"/>`);

    // The chart.
    out.push(`<g transform="translate(${x0} ${top})">`);

    for (const sh of s.shades) out.push(`<rect x="${r(sh.x)}" y="0" width="${r(sh.width)}" height="${s.height - top}" fill="${esc(c.shade)}"/>`);
    for (const l of s.lines) out.push(`<line x1="${r(l)}" y1="0" x2="${r(l)}" y2="${s.height - top}" stroke="${esc(c.line)}" opacity="0.35"/>`);
    if (s.todayX !== null) out.push(`<line x1="${r(s.todayX)}" y1="0" x2="${r(s.todayX)}" y2="${s.height - top}" stroke="${esc(c.today)}" stroke-width="2"/>`);

    for (const l of s.links) out.push(`<path d="${l.d}" fill="none" stroke="${esc(l.critical ? c.criticalLink : c.link)}" stroke-width="1.25"/>`);

    for (const b of s.bars) {
        const fill = b.critical ? c.critical : b.isParent ? c.parent : c.bar;
        const done = b.critical ? c.criticalProgress : b.isParent ? c.parent : c.progress;

        if (b.baseline) out.push(`<rect x="${r(b.baseline.left)}" y="${r(b.top + b.height + 2)}" width="${r(b.baseline.width)}" height="4" rx="1" fill="${esc(c.baseline)}"/>`);

        if (b.isMilestone) {
            const cx = b.left + b.width / 2;
            const cy = b.top + b.height / 2;
            const h = b.height * 0.42;

            out.push(`<path d="M${r(cx)} ${r(cy - h)}L${r(cx + h)} ${r(cy)}L${r(cx)} ${r(cy + h)}L${r(cx - h)} ${r(cy)}Z" fill="${esc(b.critical ? c.criticalProgress : c.text)}"/>`);
        } else {
            out.push(`<rect x="${r(b.left)}" y="${r(b.top)}" width="${r(b.width)}" height="${r(b.height)}" rx="3" fill="${esc(fill)}"/>`);

            if (b.progressWidth > 0) out.push(`<rect x="${r(b.left)}" y="${r(b.top)}" width="${r(Math.min(b.progressWidth, b.width))}" height="${r(b.height)}" rx="3" fill="${esc(done)}"/>`);
        }

        if (b.label) out.push(`<text x="${r(b.left + b.width + 6)}" y="${r(b.top + b.height / 2 + 4)}" font-size="11" fill="${esc(c.text)}">${esc(b.label)}</text>`);
    }

    out.push('</g></svg>');

    return out.join('');
}

const latin1 = (s: string) => Uint8Array.from(s, (ch) => ch.charCodeAt(0) & 0xff);

/** A PDF of one page, `width` by `height` points, holding a JPEG. */
export function pdfFromJpeg(jpeg: Uint8Array, imageWidth: number, imageHeight: number, pageWidth: number, pageHeight: number): Uint8Array {
    const parts: Uint8Array[] = [];
    const offsets: number[] = [];
    let length = 0;
    const push = (b: Uint8Array | string) => {
        const bytes = typeof b === 'string' ? latin1(b) : b;

        parts.push(bytes);
        length += bytes.length;
    };
    const object = (n: number, body: string | Uint8Array[]) => {
        offsets[n] = length;
        push(`${n} 0 obj\n`);

        if (typeof body === 'string') push(body);
        else body.forEach(push);

        push('\nendobj\n');
    };

    push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    object(1, '<< /Type /Catalog /Pages 2 0 R >>');
    object(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    object(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${r(pageWidth)} ${r(pageHeight)}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
    object(4, [latin1(`<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`), jpeg, latin1('\nendstream')]);

    const content = `q ${r(pageWidth)} 0 0 ${r(pageHeight)} 0 0 cm /Im0 Do Q`;

    object(5, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);

    const xref = length;

    push(`xref\n0 6\n0000000000 65535 f \n${[1, 2, 3, 4, 5].map((n) => `${String(offsets[n]).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);

    const out = new Uint8Array(length);
    let at = 0;

    for (const p of parts) {
        out.set(p, at);
        at += p.length;
    }

    return out;
}

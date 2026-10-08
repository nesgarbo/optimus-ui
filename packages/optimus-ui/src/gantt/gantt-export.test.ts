import { describe, expect, it } from 'vitest';
import { pdfFromJpeg, toCsv, toSvg, type ExportSnapshot } from './gantt-export';

describe('toCsv', () => {
    it('quotes what needs it and defuses formulas', () => {
        expect(
            toCsv([
                ['a', 'b,c', 'd"e'],
                [1, null, undefined]
            ])
        ).toBe('a,"b,c","d""e"\r\n1,,');
        expect(toCsv([['=SUM(A1)', '-5', '+1+1', 'a\nb']])).toBe(`'=SUM(A1),-5,'+1+1,"a\nb"`);
        expect(toCsv([['a;b', 'c']], ';')).toBe('"a;b";c');
    });
});

const snapshot = (): ExportSnapshot => ({
    width: 600,
    height: 140,
    headHeight: 52,
    gridWidth: 200,
    chartWidth: 400,
    rowHeight: 36,
    font: 'sans-serif',
    colors: {
        text: '#111',
        muted: '#666',
        line: '#ddd',
        background: '#fff',
        header: '#f3f4f6',
        shade: '#eee',
        bar: '#9cf',
        progress: '#36f',
        parent: '#555',
        critical: '#f99',
        criticalProgress: '#e22',
        link: '#888',
        criticalLink: '#e22',
        today: '#2a2',
        baseline: '#bbb'
    },
    treeColumn: 1,
    columns: [
        { header: 'ID', width: 40, align: 'left' },
        { header: 'Task <b>', width: 160, align: 'left' }
    ],
    rows: [
        { y: 0, cells: ['1', 'Design & build'], level: 0, bold: true },
        { y: 36, cells: ['2', 'Child'], level: 1, bold: false }
    ],
    tiers: {
        top: [{ x: 0, width: 200, label: 'Oct' }],
        bottom: [
            { x: 0, width: 20, label: '5' },
            { x: 20, width: 10, label: '6' }
        ],
        height: 26
    },
    shades: [{ x: 100, width: 40 }],
    lines: [20],
    bars: [
        { left: 10, top: 8, width: 100, height: 20, progressWidth: 40, isParent: false, isMilestone: false, critical: false, baseline: { left: 10, width: 80 }, label: 'Design & build' },
        { left: 120, top: 44, width: 0, height: 20, progressWidth: 0, isParent: false, isMilestone: true, critical: true, baseline: null, label: '' }
    ],
    links: [{ d: 'M110 18L120 54', critical: true }],
    todayX: 60
});

describe('toSvg', () => {
    it('draws the header, the rows, the bars and the links, and escapes what it prints', () => {
        const svg = toSvg(snapshot());

        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg).toContain('Task &lt;b&gt;');
        expect(svg).toContain('Design &amp; build');
        expect((svg.match(/<rect /g) ?? []).length).toBeGreaterThanOrEqual(6);
        expect(svg).toContain('<path d="M110 18L120 54"');
        expect(svg).toContain('stroke="#e22"');
        expect(svg).toContain('<path d="M120');
        expect(svg.endsWith('</svg>')).toBe(true);
    });
});

describe('pdfFromJpeg', () => {
    it('makes a one page PDF with the picture inside, and an index that points at the objects', () => {
        const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 0xff, 0xd9]);
        const pdf = pdfFromJpeg(jpeg, 100, 50, 300, 150);
        const text = String.fromCharCode(...pdf);

        expect(text.startsWith('%PDF-1.4')).toBe(true);
        expect(text.endsWith('%%EOF\n')).toBe(true);
        expect(text).toContain('/MediaBox [0 0 300 150]');
        expect(text).toContain('/Filter /DCTDecode');
        expect(text).toContain('/Length 9');

        // Every entry of the cross-reference table is where its object starts.
        const startxref = Number(/startxref\n(\d+)/.exec(text)![1]);

        expect(text.slice(startxref, startxref + 4)).toBe('xref');

        [...text.slice(startxref).matchAll(/(\d{10}) 00000 n/g)].forEach((m, i) => expect(text.slice(Number(m[1]), Number(m[1]) + `${i + 1} 0 obj`.length)).toBe(`${i + 1} 0 obj`));

        // The JPEG is in the file, byte for byte.
        const at = pdf.findIndex((_, i) => pdf[i] === 0xff && pdf[i + 1] === 0xd8 && pdf[i + 2] === 0xff && pdf[i + 3] === 0xe0);

        expect([...pdf.slice(at, at + 9)]).toEqual([...jpeg]);
    });
});

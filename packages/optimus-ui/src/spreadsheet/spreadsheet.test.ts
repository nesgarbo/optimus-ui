import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, FormField } from '@angular/forms/signals';
import { beforeEach, describe, expect, it } from 'vitest';
import type { SpreadsheetData } from '@openng/optimus-ui/types/spreadsheet';
import { Spreadsheet } from './spreadsheet';
import { rowsToWorkbook } from './spreadsheet-data';

const wait = (ms = 150) => new Promise((r) => setTimeout(r, ms));

@Component({
    standalone: true,
    imports: [Spreadsheet],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<p-spreadsheet
        [(value)]="value"
        [locale]="locale()"
        [readonly]="locked()"
        [darkMode]="dark()"
        (created)="created = created + 1"
        (changed)="changes.push($event.data)"
        (touch)="touched = touched + 1"
        style="display: block; position: relative; width: 900px; height: 420px"
    />`
})
class Host {
    readonly sheet = viewChild.required(Spreadsheet);
    value = signal<SpreadsheetData | null>(
        rowsToWorkbook([
            ['Item', 'Price', 'Qty', 'Total'],
            ['Pen', 1.5, 4, '=B2*C2'],
            ['Book', 12, 2, '=B3*C3'],
            ['', '', 'Sum', '=SUM(D2:D3)']
        ])
    );
    locale = signal<'en-US' | 'es-ES'>('en-US');
    locked = signal(false);
    dark = signal(false);
    created = 0;
    touched = 0;
    changes: SpreadsheetData[] = [];
}

@Component({
    standalone: true,
    imports: [Spreadsheet, FormField],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<p-spreadsheet [formField]="f.book" style="width: 700px; height: 360px" />`
})
class FormHost {
    readonly sheet = viewChild.required(Spreadsheet);
    model = signal<{ book: SpreadsheetData | null }>({ book: rowsToWorkbook([['Name', 'Ada']]) });
    f = form(this.model);
}

describe('Spreadsheet', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    const root = () => fixture.nativeElement as HTMLElement;
    const sheet = () => host.sheet();
    const settle = async (ms = 200) => {
        await fixture.whenStable();
        await wait(ms);
        await fixture.whenStable();
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [Host, FormHost], providers: [provideZonelessChangeDetection()] }).compileComponents();

        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        document.body.appendChild(fixture.nativeElement);
        await fixture.whenStable();

        for (let i = 0; i < 60 && !host.sheet().ready(); i++) await wait(100);

        // The first calculation of the formulas takes a moment, and a cell changed during it is calculated with the old data:
        // wait for its result, not for a guessed time.
        await vi.waitFor(() => expect(sheet().getCell('D4')).toBe(30), { timeout: 10_000, interval: 50 });
        await settle(100);
    });

    it('starts, draws the sheet and says so', () => {
        expect(sheet().ready()).toBe(true);
        expect(host.created).toBe(1);
        expect(root().querySelector('canvas')).not.toBeNull();
        expect(root().querySelector('.univer-ui, [class*="univer"]')).not.toBeNull();
    });

    it('shows the workbook it is given, with the results of its formulas', () => {
        expect(sheet().getCell('A2')).toBe('Pen');
        expect(sheet().getCell('B3')).toBe(12);
        expect(sheet().getCell('D2')).toBe(6);
        expect(sheet().getCell('D3')).toBe(24);
        expect(sheet().getCell('D4')).toBe(30);
    });

    it('recalculates when a cell changes, and puts the new workbook in the value after a moment', async () => {
        sheet().setCell('C2', 10);

        await vi.waitFor(() => expect(sheet().getCell('D4')).toBe(39), { timeout: 5000, interval: 50 });
        expect(sheet().getCell('D2')).toBe(15);

        // The workbook is handed back after a short delay, so wait for it.
        await vi.waitFor(() => expect(host.changes.length).toBeGreaterThan(0), { timeout: 5000, interval: 50 });
        await vi.waitFor(() => expect(host.value()!.sheets![host.value()!.sheetOrder![0]].cellData![1][3]).toMatchObject({ v: 15 }), { timeout: 5000, interval: 50 });

        const book = host.value()!;

        expect(book.sheets![book.sheetOrder![0]].cellData![1][2]).toMatchObject({ v: 10 });
        expect(book.sheets![book.sheetOrder![0]].cellData![1][3]).toMatchObject({ f: '=B2*C2', v: 15 });
    });

    it('writes a formula from a string that starts with =', async () => {
        sheet().setCell('F1', '=SUM(B2:B3)');
        await settle(300);

        expect(sheet().getCell('F1')).toBe(13.5);
    });

    it('opens another workbook when the value is replaced, and does not hand it back as a change', async () => {
        await settle();
        const before = host.changes.length;

        host.value.set(rowsToWorkbook([['Replaced', 42]]));
        await settle(300);

        expect(sheet().getCell('A1')).toBe('Replaced');
        expect(sheet().getCell('B1')).toBe(42);
        expect(host.changes).toHaveLength(before);
    });

    it('opens a blank workbook for null', async () => {
        host.value.set(null);
        await settle(300);

        expect(sheet().getCell('A1')).toBeNull();
        expect(sheet().getWorkbook()).not.toBeNull();
    });

    it('reads and writes tables of rows, and gives CSV', async () => {
        expect(sheet().getRows('A1:B3')).toEqual([
            ['Item', 'Price'],
            ['Pen', 1.5],
            ['Book', 12]
        ]);

        sheet().setRows(
            [
                ['x', 1],
                ['y', '=I1*10']
            ],
            'H1'
        );
        await settle(300);

        expect(sheet().getCell('I2')).toBe(10);
        expect(sheet().getRows('H1:I2')).toEqual([
            ['x', 1],
            ['y', 10]
        ]);

        const csv = sheet().toCsv();

        expect(csv.split('\n')[0]).toBe('Item,Price,Qty,Total,,,,x,1');
        expect(csv.split('\n')[1]).toBe('Pen,1.5,4,6,,,,y,10');
    });

    it('can be read and not changed', async () => {
        host.locked.set(true);
        await settle(300);

        expect(root().querySelector('.p-spreadsheet-readonly')).not.toBeNull();
        expect(sheet().getWorkbook().getEditable?.() ?? false).toBe(false);

        host.locked.set(false);
        await settle(300);
        expect(root().querySelector('.p-spreadsheet-readonly')).toBeNull();
    });

    it('is a field of a signal form', async () => {
        const f = TestBed.createComponent(FormHost);

        document.body.appendChild(f.nativeElement);
        await f.whenStable();

        for (let i = 0; i < 60 && !f.componentInstance.sheet().ready(); i++) await wait(100);

        await vi.waitFor(() => expect(f.componentInstance.sheet().getCell('B1')).toBe('Ada'), { timeout: 5000, interval: 50 });

        f.componentInstance.sheet().setCell('B1', 'Grace');

        // The workbook reaches the model a moment after the change.
        await vi.waitFor(
            () => {
                const book = f.componentInstance.model().book!;

                expect(book.sheets![book.sheetOrder![0]].cellData![0][1]).toMatchObject({ v: 'Grace' });
            },
            { timeout: 5000, interval: 50 }
        );
    });
});

import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { GanttCellEditEvent } from '@openng/optimus-ui/types/gantt';
import { beforeEach, describe, expect, it } from 'vitest';
import { WorkCalendar, parseDay } from './gantt-calendar';
import { buildProject, findOverallocated, toTask } from './gantt-model';
import { Gantt, GanttModule } from './gantt';

const FIELDS = { id: 'id', name: 'name', startDate: 'start', duration: 'days', progress: 'done', dependency: 'after', child: 'kids', notes: 'note', baselineStartDate: 'planStart', baselineEndDate: 'planEnd', resourceInfo: 'who' };

@Component({
    standalone: true,
    imports: [GanttModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div style="width: 1200px">
            <p-gantt
                #g
                [(dataSource)]="data"
                [taskFields]="fields"
                [columns]="columns"
                [resources]="resources"
                [renderBaseline]="true"
                [timelineSettings]="{ bottomTier: { unit: 'day' }, topTier: { unit: 'week' }, timelineUnitSize: 20 }"
                [splitterSettings]="{ position: 760 }"
                [editSettings]="{ allowEditing: true, allowDeleting: true, allowTaskbarEditing: true, mode: mode() }"
                projectStartDate="2026-10-05"
                height="320px"
                [rowHeight]="30"
                (cellEdit)="edits.push($event)"
            />
        </div>
    `
})
class Host {
    readonly g = viewChild.required<Gantt>('g');
    readonly mode = signal<'cell' | 'dialog'>('cell');
    readonly fields = FIELDS;
    readonly edits: GanttCellEditEvent[] = [];
    readonly resources = [
        { id: 'ana', name: 'Ana' },
        { id: 'bo', name: 'Bo', unit: 50 },
        { id: 'cy', name: 'Cy', unit: 50 }
    ];
    readonly columns = [
        { field: 'id', headerText: 'ID', width: 40 },
        { field: 'name', headerText: 'Task', width: 160 },
        { field: 'startDate', headerText: 'Start', width: 110 },
        { field: 'duration', headerText: 'Days', width: 60 },
        { field: 'progress', headerText: '%', width: 50 },
        { field: 'dependency', headerText: 'After', width: 90 },
        { field: 'variance', headerText: 'Var', width: 50 },
        { field: 'resourceInfo', headerText: 'Who', width: 100 }
    ];
    readonly data = signal<any[]>([
        { id: 1, name: 'Plan', start: '2026-10-05', days: 3, done: 100, planStart: '2026-10-05', planEnd: '2026-10-06', who: ['ana'], note: 'first' },
        { id: 2, name: 'Build', start: '2026-10-05', days: 4, done: 20, after: '1', who: 'ana,bo' },
        { id: 3, name: 'Test', start: '2026-10-08', days: 2, who: ['bo'] },
        { id: 4, name: 'Docs', start: '2026-10-08', days: 2, who: ['bo'] },
        { id: 5, name: 'Group', kids: [{ id: 6, name: 'Inner', start: '2026-10-05', days: 2 }] }
    ]);
}

describe('Gantt: cells, dialog, baseline, resources, export', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    const root = () => fixture.nativeElement as HTMLElement;
    const row = (i: number) => root().querySelectorAll('.p-gantt-row')[i] as HTMLElement;
    const cell = (r: number, c: number) => row(r).querySelectorAll('.p-gantt-cell')[c] as HTMLElement;
    const editor = () => root().querySelector('.p-gantt-editor') as HTMLInputElement | null;
    const flush = () => new Promise((r) => setTimeout(r, 20));
    // The form is drawn a turn after the dialog opens: wait for it, not for a guess of how long it takes.
    const form = async (title: string) => {
        for (let i = 0; i < 50; i++) {
            await fixture.whenStable();

            if (root().querySelector('dialog form h3')?.textContent === title) return;

            await flush();
        }
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [Host], providers: [provideZonelessChangeDetection()] }).compileComponents();

        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        document.body.appendChild(fixture.nativeElement);
        await fixture.whenStable();
    });

    async function edit(r: number, c: number, text: string, key = 'Enter') {
        cell(r, c).dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
        await fixture.whenStable();
        await flush();

        const input = editor()!;

        input.value = text;
        input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
        await fixture.whenStable();
    }

    it('edits a name, a start, a length and a progress in place, and the dates follow', async () => {
        await edit(1, 1, 'Construction');
        expect(host.data()[1].name).toBe('Construction');
        expect(host.edits.at(-1)).toMatchObject({ field: 'name', value: 'Construction' });

        await edit(1, 3, '6'); // days
        expect(host.data()[1].days).toBe(6);

        await edit(1, 4, '75');
        expect(host.data()[1].done).toBe(75);

        // Build waits for Plan (Mon-Wed): it starts Thu 8. Asking for Mon 12 moves it, and the data says so.
        await edit(1, 2, '2026-10-12');
        expect(host.data()[1].start).toBe('2026-10-12');
    });

    it('refuses text it cannot read, keeps the editor and marks it', async () => {
        await edit(1, 3, 'many');

        expect(host.data()[1].days).toBe(4);
        expect(editor()!.getAttribute('aria-invalid')).toBe('true');

        editor()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
        await fixture.whenStable();
        expect(editor()).toBeNull();
    });

    it('edits the predecessors, and Tab goes to the next cell that can be edited', async () => {
        await edit(3, 5, '2FS+1d');
        expect(host.data()[3].after).toBe('2FS+1d');

        await edit(0, 1, 'Planning', 'Tab');
        await flush();
        expect(editor()).toBeTruthy(); // the next one: start
        expect(editor()!.type).toBe('date');
    });

    it('does not edit what a parent derives, the id, or a cell when editing is off', async () => {
        cell(4, 3).dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
        await fixture.whenStable();
        expect(editor()).toBeNull();

        cell(0, 0).dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
        await fixture.whenStable();
        expect(editor()).toBeNull();
        expect(cell(4, 3).getAttribute('aria-readonly')).toBe('true');
    });

    it('lets cellEdit change the value or cancel', async () => {
        const g = host.g();
        const sub = g.cellEdit.subscribe((e) => (e.value = String(e.value).toUpperCase()));

        await edit(0, 1, 'shout');
        expect(host.data()[0].name).toBe('SHOUT');
        sub.unsubscribe();

        g.cellEdit.subscribe((e) => (e.cancel = true));
        await edit(0, 1, 'quiet');
        expect(host.data()[0].name).toBe('SHOUT');
    });

    it('starts an edit with F2', async () => {
        row(0).focus();
        root()
            .querySelector('[role="treegrid"]')!
            .dispatchEvent(new KeyboardEvent('keydown', { key: 'F2', bubbles: true, cancelable: true }));
        await fixture.whenStable();
        await flush();

        expect(editor()).toBeTruthy();
    });

    describe('dialog', () => {
        beforeEach(async () => {
            host.mode.set('dialog');
            await fixture.whenStable();
        });

        it('opens on a double click, edits a whole task, saves into the data', async () => {
            row(1).dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
            await form('Build');

            const dialog = root().querySelector('dialog') as HTMLDialogElement;

            expect(dialog.open).toBe(true);
            expect(dialog.querySelector('h3')!.textContent).toBe('Build');
            expect(dialog.querySelectorAll('fieldset input[type="checkbox"]')).toHaveLength(3);

            const set = (name: string, value: string) => ((dialog.querySelector(`[name="${name}"]`) as HTMLInputElement).value = value);

            set('name', 'Construction');
            set('duration', '5');
            set('progress', '60');
            (dialog.querySelector('input[value="cy"]') as HTMLInputElement).checked = true;
            dialog.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            await fixture.whenStable();

            expect(host.data()[1]).toMatchObject({ name: 'Construction', days: 5, done: 60 });
            expect(host.data()[1].who).toBe('ana,bo,cy'); // a string stays a string
            expect(dialog.open).toBe(false);
        });

        it('cancels, deletes, and disables what a parent derives', async () => {
            host.g().openEditDialog('5');
            await form('Group');

            const dialog = root().querySelector('dialog') as HTMLDialogElement;

            expect((dialog.querySelector('[name="duration"]') as HTMLInputElement).disabled).toBe(true);

            (dialog.querySelectorAll('.p-gantt-btn')[1] as HTMLElement).click(); // cancel
            await fixture.whenStable();
            expect(dialog.open).toBe(false);
            expect(host.data()).toHaveLength(5);

            host.g().openEditDialog('3');
            await form('Test');
            (dialog.querySelector('.p-gantt-btn-danger') as HTMLElement).click();
            await fixture.whenStable();
            expect(host.data().map((d: any) => d.id)).toEqual([1, 2, 4, 5]);
        });

        it('writes the notes', async () => {
            host.g().openEditDialog('1');
            await form('Plan');

            const dialog = root().querySelector('dialog') as HTMLDialogElement;

            (dialog.querySelector('[name="notes"]') as HTMLTextAreaElement).value = 'second';
            dialog.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            await fixture.whenStable();

            expect(host.data()[0].note).toBe('second');
        });
    });

    describe('baseline and resources', () => {
        it('draws the plan under the bar, and reports the variance', () => {
            expect(root().querySelectorAll('.p-gantt-baseline')).toHaveLength(1);
            expect(host.g().getTaskByID('1')).toMatchObject({ variance: 1 }); // planned to end Tue, ends Wed
            expect(cell(0, 6).textContent!.trim()).toBe('1');
        });

        it('lists who is assigned, and flags a clash of resources', () => {
            expect(cell(0, 7).textContent!.trim()).toBe('Ana');
            expect(cell(1, 7).textContent!.trim()).toBe('Ana, Bo');
            // Bo is on 50%: Build, Test and Docs overlap on Thu 8 and Fri 9
            const g = host.g();

            expect(g.getTaskByID('3')!.isOverallocated).toBe(true);
            expect(g.getTaskByID('1')!.isOverallocated).toBe(false);
            expect(root().querySelector('.p-gantt-taskbar-overallocated')).toBeTruthy();
        });
    });

    describe('export', () => {
        it('writes the grid as CSV, parents included', () => {
            const csv = host.g().exportToCsv({ download: false });
            const lines = csv.split('\r\n');

            expect(lines[0]).toBe('ID,Task,Start,Days,%,After,Var,Who');
            expect(lines).toHaveLength(7);
            expect(lines[1]).toBe('1,Plan,2026-10-05,3,100,,1,Ana');
            expect(lines[2]).toContain('"Ana, Bo"');
        });

        it('draws the whole thing as SVG, a PNG and a PDF', async () => {
            const g = host.g();
            const svg = g.exportToSvg({ download: false });

            expect(svg.startsWith('<svg')).toBe(true);
            expect(svg).toContain('Build');
            expect(svg).toContain('<path d="M');

            const png = await g.exportToImage({ download: false, scale: 1 });

            expect(png.type).toBe('image/png');
            expect(png.size).toBeGreaterThan(1000);

            const pdf = await g.exportToPdf({ download: false, scale: 1 });
            const head = new Uint8Array(await pdf.arrayBuffer()).slice(0, 8);

            expect(pdf.type).toBe('application/pdf');
            expect(String.fromCharCode(...head)).toBe('%PDF-1.4');
        });
    });
});

describe('overallocation and variance (model)', () => {
    const cal = new WorkCalendar();
    const d = (iso: string) => parseDay(iso)!;
    const f = { resourceInfo: 'who', baselineEndDate: 'planEnd' };

    it('allows two tasks to share a resource that has room, and flags one that has not', () => {
        const data = [
            { id: 'a', startDate: '2026-10-05', duration: 3, who: 'x' },
            { id: 'b', startDate: '2026-10-06', duration: 3, who: 'x' }
        ];
        const p = buildProject(data, f, cal, d('2026-10-05'));

        expect([...findOverallocated(p, [{ id: 'x', name: 'X' }])].sort()).toEqual(['a', 'b']);
        expect(findOverallocated(p, [{ id: 'x', name: 'X', unit: 50 }]).size).toBe(0);
    });

    it('counts the variance in worked days, early or late', () => {
        const p = buildProject(
            [
                { id: 'a', startDate: '2026-10-05', duration: 3, planEnd: '2026-10-09' },
                { id: 'b', startDate: '2026-10-05', duration: 3, planEnd: '2026-10-06' },
                { id: 'c', startDate: '2026-10-05', duration: 3 }
            ],
            f,
            cal,
            d('2026-10-05')
        );
        const v = (id: string) => toTask(p.byId.get(id)!, true, cal).variance;

        expect(v('a')).toBe(-2); // ends Wed, planned Fri
        expect(v('b')).toBe(1);
        expect(v('c')).toBeNull();
    });
});

@Component({
    standalone: true,
    imports: [GanttModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div style="width: 1200px">
            <p-gantt
                #g
                [(dataSource)]="data"
                [taskFields]="{ id: 'id', name: 'name', startDate: 'start', duration: 'hours', dependency: 'after' }"
                [columns]="[
                    { field: 'name', width: 140 },
                    { field: 'startDate', width: 170 },
                    { field: 'duration', width: 60 }
                ]"
                durationUnit="hour"
                [timelineSettings]="{ bottomTier: { unit: 'day' }, topTier: { unit: 'week' }, timelineUnitSize: 80 }"
                [splitterSettings]="{ position: 400 }"
                [editSettings]="{ allowEditing: true, allowTaskbarEditing: true }"
                projectStartDate="2026-10-05"
                height="200px"
            />
        </div>
    `
})
class HoursHost {
    readonly g = viewChild.required<Gantt>('g');
    readonly data = signal<any[]>([
        { id: 1, name: 'Brief', start: '2026-10-05T08:00', hours: 4 },
        { id: 2, name: 'Draft', start: '2026-10-05T08:00', hours: 6, after: '1' }
    ]);
}

describe('Gantt in hours', () => {
    let fixture: ComponentFixture<HoursHost>;

    const root = () => fixture.nativeElement as HTMLElement;
    const bar = (id: string) => root().querySelector(`.p-gantt-taskbar[data-id="${id}"]`) as HTMLElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [HoursHost], providers: [provideZonelessChangeDetection()] }).compileComponents();

        fixture = TestBed.createComponent(HoursHost);
        document.body.appendChild(fixture.nativeElement);
        await fixture.whenStable();
    });

    it('draws a bar as long as its hours, and the next one from the hour the first ends', () => {
        // 80 px a day, eight hours a day: ten pixels an hour
        expect(parseFloat(bar('1').style.left)).toBe(0);
        expect(parseFloat(bar('1').style.width)).toBe(40);
        expect(parseFloat(bar('2').style.left)).toBe(40);
        expect(parseFloat(bar('2').style.width)).toBe(60);
    });

    it('shows the time, and the length in hours', () => {
        const cells = [...root().querySelectorAll('.p-gantt-row')[1].querySelectorAll('.p-gantt-cell')].map((c) => c.textContent!.trim());

        expect(cells[1]).toMatch(/12:00/);
        expect(cells[2]).toBe('6');
    });

    it('edits the length in hours and moves what follows', async () => {
        const g = fixture.componentInstance.g();
        const cell = root().querySelectorAll('.p-gantt-row')[0].querySelectorAll('.p-gantt-cell')[2] as HTMLElement;

        cell.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
        await fixture.whenStable();
        await new Promise((r) => setTimeout(r, 30));

        const input = root().querySelector('.p-gantt-editor') as HTMLInputElement;

        input.value = '6';
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
        await fixture.whenStable();

        expect(fixture.componentInstance.data()[0].hours).toBe(6);
        expect(fixture.componentInstance.data()[1].start).toBe('2026-10-05T14:00');
        expect(g.getTaskByID('2')!.startDate.getHours()).toBe(14);
    });

    it('moves a bar by the hour', async () => {
        const b = bar('1');
        const down = (x: number) => b.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 2, pointerType: 'mouse', button: 0, clientX: x, clientY: 5, bubbles: true, cancelable: true }));
        const move = (type: string, x: number) => b.dispatchEvent(new PointerEvent(type, { pointerId: 2, pointerType: 'mouse', clientX: x, clientY: 5, bubbles: true, cancelable: true }));

        down(100);
        move('pointermove', 120); // two hours on
        move('pointerup', 120);
        await fixture.whenStable();

        expect(fixture.componentInstance.data()[0].start).toBe('2026-10-05T10:00');
    });
});

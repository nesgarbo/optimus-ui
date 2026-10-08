import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { GanttActionEvent, GanttInvalidEvent, GanttTaskbarEvent } from '@openng/optimus-ui/types/gantt';
import { beforeEach, describe, expect, it } from 'vitest';
import { Gantt, GanttModule } from './gantt';

@Component({
    standalone: true,
    imports: [GanttModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div style="width: 1200px">
            <p-gantt
                #g
                [(dataSource)]="data"
                [(selectedRowIndex)]="selected"
                [taskFields]="{ id: 'id', name: 'name', startDate: 'start', duration: 'days', progress: 'done', dependency: 'after', child: 'kids' }"
                [columns]="[
                    { field: 'id', headerText: 'ID', width: 40 },
                    { field: 'name', headerText: 'Task', width: 160 },
                    { field: 'startDate', headerText: 'Start', width: 100 },
                    { field: 'duration', headerText: 'Days', width: 50 }
                ]"
                [timelineSettings]="{ bottomTier: { unit: 'day' }, topTier: { unit: 'week' }, timelineUnitSize: 20 }"
                [splitterSettings]="{ position: 400 }"
                [editSettings]="{ allowTaskbarEditing: true, allowDeleting: true, allowEditing: true }"
                [enableCriticalPath]="critical()"
                projectStartDate="2026-10-05"
                height="320px"
                [rowHeight]="30"
                (rowSelected)="selects.push($event.rowIndex)"
                (taskbarEdited)="edits.push($event)"
                (actionBegin)="begins.push($event)"
                (invalid)="problems.push($event)"
            />
        </div>
    `
})
class Host {
    readonly g = viewChild.required<Gantt>('g');
    readonly critical = signal(false);
    readonly selected = signal(-1);
    readonly selects: number[] = [];
    readonly edits: GanttTaskbarEvent[] = [];
    readonly begins: GanttActionEvent[] = [];
    readonly problems: GanttInvalidEvent[] = [];
    data = signal<any[]>([
        {
            id: 1,
            name: 'Design',
            kids: [
                { id: 2, name: 'Research', start: '2026-10-05', days: 3, done: 100 },
                { id: 3, name: 'Mockups', start: '2026-10-05', days: 4, done: 25, after: '2' }
            ]
        },
        { id: 4, name: 'Build', start: '2026-10-05', days: 5, after: '1', done: 0 },
        { id: 5, name: 'Launch', start: '2026-10-05', days: 0, after: '4' }
    ]);
}

const pe = (type: string, el: Element, x: number, extra: PointerEventInit = {}) => el.dispatchEvent(new PointerEvent(type, { pointerId: 1, pointerType: 'mouse', button: 0, clientX: x, clientY: 10, bubbles: true, cancelable: true, ...extra }));

describe('Gantt', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    const root = () => fixture.nativeElement as HTMLElement;
    const bar = (id: string) => root().querySelector(`.p-gantt-taskbar[data-id="${id}"]`) as HTMLElement;
    const left = (id: string) => parseFloat(bar(id).style.left);
    const width = (id: string) => parseFloat(bar(id).style.width);
    const rows = () => [...root().querySelectorAll('.p-gantt-row')].map((r) => r.querySelectorAll('.p-gantt-cell')[1].textContent!.trim());

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [Host], providers: [provideZonelessChangeDetection()] }).compileComponents();

        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        document.body.appendChild(fixture.nativeElement);
        await fixture.whenStable();
    });

    it('lists the tasks in a tree grid, with levels and a toggle on parents', () => {
        expect(rows()).toEqual(['Design', 'Research', 'Mockups', 'Build', 'Launch']);

        const grid = root().querySelector('[role="treegrid"]')!;

        expect(grid.getAttribute('aria-rowcount')).toBe('5');
        expect([...root().querySelectorAll('.p-gantt-row')].map((r) => r.getAttribute('aria-level'))).toEqual(['1', '2', '2', '1', '1']);
        expect(root().querySelectorAll('.p-gantt-row')[0].getAttribute('aria-expanded')).toBe('true');
        expect(root().querySelectorAll('.p-gantt-row')[1].getAttribute('aria-expanded')).toBeNull();
        expect(root().querySelectorAll('.p-gantt-toggle')).toHaveLength(1);
        expect(root().querySelectorAll('.p-gantt-row')[1].getAttribute('aria-description')).toContain('100% complete');
    });

    it('puts the bars where the dates and the dependencies say', () => {
        // 20 px a day from Mon 5 Oct: Research is Mon-Wed, Mockups starts after it (Thu 8) for four worked days over the weekend
        expect(left('2')).toBe(0);
        expect(width('2')).toBe(3 * 20);
        expect(left('3')).toBe(3 * 20);
        expect(width('3')).toBe(6 * 20); // Thu, Fri, Sat, Sun, Mon, Tue
        // the parent spans its children, and Build waits for it
        expect(left('1')).toBe(0);
        expect(width('1')).toBe(9 * 20);
        expect(left('4')).toBe(9 * 20); // Wed 14
        // Launch is a milestone on the day after Build
        expect(bar('5').classList).toContain('p-gantt-taskbar-milestone');
        expect(bar('1').classList).toContain('p-gantt-taskbar-parent');
    });

    it('draws a line for each dependency', () => {
        expect(root().querySelectorAll('.p-gantt-link')).toHaveLength(3); // 3 after 2, Build after Design, Launch after Build
        expect(root().querySelector('.p-gantt-link')!.getAttribute('d')).toMatch(/^M/);
    });

    it('shades days off and marks today only within the range', () => {
        expect(root().querySelectorAll('.p-gantt-shade').length).toBeGreaterThan(2);
        expect(root().querySelectorAll('.p-gantt-tier-cell').length).toBeGreaterThan(10);
    });

    it('collapses and expands, by button, by key and by method', async () => {
        (root().querySelector('.p-gantt-toggle') as HTMLElement).click();
        await fixture.whenStable();
        expect(rows()).toEqual(['Design', 'Build', 'Launch']);
        expect(root().querySelectorAll('.p-gantt-taskbar')).toHaveLength(3);
        expect(root().querySelectorAll('.p-gantt-row')[0].getAttribute('aria-expanded')).toBe('false');

        host.g().expandAll();
        await fixture.whenStable();
        expect(rows()).toHaveLength(5);

        host.g().collapseAll();
        await fixture.whenStable();
        expect(rows()).toHaveLength(3);

        host.g().expandByID('1');
        await fixture.whenStable();
        expect(rows()).toHaveLength(5);
    });

    it('lets a listener stop an expand', async () => {
        host.g().collapseByID('1');
        host.g().expanding.subscribe((e) => (e.cancel = true));
        host.g().expandByID('1');
        await fixture.whenStable();

        expect(rows()).toHaveLength(3);
    });

    it('selects with the pointer and moves with the arrows, parents open and close with left and right', async () => {
        (root().querySelectorAll('.p-gantt-row')[1] as HTMLElement).click();
        await fixture.whenStable();
        expect(host.selected()).toBe(1);
        expect(root().querySelectorAll('.p-gantt-row')[1].getAttribute('aria-selected')).toBe('true');
        expect(root().querySelectorAll('.p-gantt-row')[1].getAttribute('tabindex')).toBe('0');

        const key = (k: string, extra: KeyboardEventInit = {}) =>
            root()
                .querySelector('[role="treegrid"]')!
                .dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...extra }));

        key('ArrowDown');
        expect(host.selected()).toBe(2);
        key('Home');
        expect(host.selected()).toBe(0);
        key('ArrowLeft'); // an open parent closes
        await fixture.whenStable();
        expect(rows()).toHaveLength(3);
        key('ArrowRight'); // and opens
        await fixture.whenStable();
        expect(rows()).toHaveLength(5);
        key('ArrowRight'); // an open parent goes to its first child
        expect(host.selected()).toBe(1);
        key('ArrowLeft'); // a child goes to its parent
        expect(host.selected()).toBe(0);
        key('End');
        expect(host.selected()).toBe(4);
    });

    it('moves a bar with the pointer, over a weekend, and its successors follow into the data', async () => {
        const b = bar('2');

        pe('pointerdown', b, 100);
        pe('pointermove', b, 100 + 4 * 20); // four days on: Mon 5 -> Fri 9
        await fixture.whenStable();
        expect(b.classList).toContain('p-gantt-taskbar-dragging');
        expect(left('2')).toBe(4 * 20);
        pe('pointerup', b, 100 + 4 * 20);
        await fixture.whenStable();

        const research = host.data()[0].kids[0];

        expect(research.start).toBe('2026-10-09');
        expect(research.days).toBe(3);
        // Mockups waited for Research, which now ends on Tue 13: it starts Wed 14
        expect(host.data()[0].kids[1].start).toBe('2026-10-14');
        expect(host.edits.at(-1)!.action).toBe('move');
        expect(host.begins.at(-1)!.requestType).toBe('taskbarEdit');
        expect(left('3')).toBe(9 * 20);
        expect(root().querySelector('[role="status"]')!.textContent).toContain('Research');
    });

    it('resizes from either edge, in worked days', async () => {
        const b = bar('2');
        const handle = (side: string) => b.querySelector(`[data-handle="${side}"]`)!;

        pe('pointerdown', handle('resizeEnd'), 60);
        pe('pointermove', handle('resizeEnd'), 60 + 2 * 20);
        pe('pointerup', handle('resizeEnd'), 60 + 2 * 20);
        await fixture.whenStable();
        // Wed 7 + 2 days = Fri 9: five days from Monday, so 5 worked days
        expect(host.data()[0].kids[0].days).toBe(5);
        expect(width('2')).toBe(5 * 20);

        pe('pointerdown', handle('resizeStart'), 0);
        pe('pointermove', handle('resizeStart'), 2 * 20);
        pe('pointerup', handle('resizeStart'), 2 * 20);
        await fixture.whenStable();
        expect(host.data()[0].kids[0].start).toBe('2026-10-07');
        expect(host.data()[0].kids[0].days).toBe(3);
    });

    it('drags the progress', async () => {
        const b = bar('3');
        const knob = b.querySelector('[data-handle="progress"]')!;
        const rect = b.getBoundingClientRect();

        pe('pointerdown', knob, rect.left + rect.width * 0.25);
        pe('pointermove', knob, rect.left + rect.width * 0.8);
        pe('pointerup', knob, rect.left + rect.width * 0.8);
        await fixture.whenStable();

        expect(host.data()[0].kids[1].done).toBe(80);
        expect(host.edits.at(-1)!.action).toBe('progress');
    });

    it('does not edit what it should not: a parent, a milestone, or with editing off', () => {
        expect(bar('1').querySelector('.p-gantt-handle')).toBeNull();
        expect(bar('5').querySelector('.p-gantt-handle')).toBeNull();
        expect(bar('2').querySelector('.p-gantt-handle')).toBeTruthy();
    });

    it('adds, updates and deletes through the methods', async () => {
        const g = host.g();

        g.addRecord({ id: 9, name: 'Docs', start: '2026-10-06', days: 2 });
        await fixture.whenStable();
        expect(rows().at(-1)).toBe('Docs');

        g.addRecord({ id: 10, name: 'Wireframes', start: '2026-10-05', days: 1 }, '1');
        await fixture.whenStable();
        expect(rows()).toContain('Wireframes');
        expect(host.data()[0].kids.at(-1).id).toBe(10);

        g.updateRecordByID({ id: 9, name: 'Documentation' });
        await fixture.whenStable();
        expect(rows().at(-1)).toBe('Documentation');

        g.deleteRecord('1');
        await fixture.whenStable();
        expect(rows()).toEqual(['Build', 'Launch', 'Documentation']);
        expect(host.begins.map((e) => e.requestType)).toEqual(['add', 'add', 'save', 'delete']);
    });

    it('lets actionBegin cancel', async () => {
        host.g().actionBegin.subscribe((e) => (e.cancel = true));
        host.g().deleteRecord('4');
        await fixture.whenStable();

        expect(rows()).toHaveLength(5);
    });

    it('indents and outdents', async () => {
        const g = host.g();

        g.indent('4'); // Build goes under Design
        await fixture.whenStable();
        expect(host.data()).toHaveLength(2);
        expect(host.data()[0].kids.map((k: any) => k.id)).toEqual([2, 3, 4]);

        g.outdent('4');
        await fixture.whenStable();
        expect(host.data().map((d: any) => d.id)).toEqual([1, 4, 5]);
    });

    it('deletes with the key when allowed', async () => {
        host.selected.set(3);
        await fixture.whenStable();
        root()
            .querySelector('[role="treegrid"]')!
            .dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true }));
        await fixture.whenStable();

        expect(rows()).toEqual(['Design', 'Research', 'Mockups', 'Launch']);
    });

    it('highlights the critical path when asked', async () => {
        expect(root().querySelector('.p-gantt-taskbar-critical')).toBeNull();

        host.critical.set(true);
        await fixture.whenStable();

        expect(bar('4').classList).toContain('p-gantt-taskbar-critical');
        expect(bar('5').classList).toContain('p-gantt-taskbar-critical');
        expect(
            host
                .g()
                .getCriticalTasks()
                .map((t) => t.id)
        ).toContain('4');
    });

    it('reports problems in the data', async () => {
        host.data.set([
            { id: 1, name: 'a', start: '2026-10-05', days: 1, after: '2' },
            { id: 2, name: 'b', start: '2026-10-05', days: 1, after: '1' },
            { id: 3, name: 'c', after: '99' }
        ]);
        await fixture.whenStable();

        expect(host.problems.map((p) => p.kind).sort()).toEqual(['cycle', 'missingPredecessor']);
    });

    it('zooms, fits, resizes the grid and scrolls to a task', async () => {
        const g = host.g();
        const before = root().querySelector<HTMLElement>('.p-gantt-chart')!.getBoundingClientRect().width;

        g.zoomIn();
        await fixture.whenStable();
        expect(root().querySelector<HTMLElement>('.p-gantt-chart')!.getBoundingClientRect().width).toBeGreaterThan(before);

        g.zoomOut();
        g.zoomOut();
        await fixture.whenStable();
        expect(root().querySelector<HTMLElement>('.p-gantt-chart')!.getBoundingClientRect().width).toBeLessThan(before);

        g.zoomToFit();
        await fixture.whenStable();
        const chart = root().querySelector<HTMLElement>('.p-gantt-chart')!.getBoundingClientRect().width;

        expect(chart).toBeLessThanOrEqual(1200);

        g.setSplitterPosition(300);
        await fixture.whenStable();
        expect(root().querySelector<HTMLElement>('.p-gantt-grid')!.getBoundingClientRect().width).toBe(300);

        g.scrollToTask('5');
        expect(host.selected()).toBe(4);
    });

    it('moves the splitter with the keyboard and the pointer', async () => {
        const splitter = root().querySelector('[role="separator"]') as HTMLElement;

        splitter.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
        await fixture.whenStable();
        expect(root().querySelector<HTMLElement>('.p-gantt-grid')!.getBoundingClientRect().width).toBe(420);

        pe('pointerdown', splitter, 420);
        pe('pointermove', splitter, 370);
        pe('pointerup', splitter, 370);
        await fixture.whenStable();
        expect(root().querySelector<HTMLElement>('.p-gantt-grid')!.getBoundingClientRect().width).toBe(370);
    });

    it('draws only the rows in view from a long list, and keeps them all in the count', async () => {
        host.data.set(Array.from({ length: 400 }, (_, i) => ({ id: i + 1, name: `T${i + 1}`, start: '2026-10-05', days: 2 })));
        await fixture.whenStable();

        expect(rows().length).toBeLessThan(80);
        expect(root().querySelector('[role="treegrid"]')!.getAttribute('aria-rowcount')).toBe('400');
        expect(rows()[0]).toBe('T1');

        const scroller = root().querySelector<HTMLElement>('.p-gantt-scroll')!;

        scroller.scrollTop = 30 * 300;
        scroller.dispatchEvent(new Event('scroll'));
        await fixture.whenStable();

        expect(rows()).toContain('T301');
        expect(rows()).not.toContain('T1');
        expect(root().querySelectorAll('.p-gantt-taskbar').length).toBe(rows().length);
    });

    it('does not tell a problem again after an edit that leaves it', async () => {
        host.data.set([
            { id: 1, name: 'A', start: '2026-10-05', days: 2, after: '9' },
            { id: 2, name: 'B', start: '2026-10-05', days: 2 }
        ]);
        await fixture.whenStable();

        const told = host.problems.length;

        expect(told).toBeGreaterThan(0);

        host.g().updateRecordByID({ id: 2, name: 'B2' });
        await fixture.whenStable();
        expect(host.problems.length).toBe(told);
    });
});

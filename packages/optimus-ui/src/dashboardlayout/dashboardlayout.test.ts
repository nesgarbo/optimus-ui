import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { DashboardChangeEvent, PanelModel } from '@openng/optimus-ui/types/dashboardlayout';
import { beforeEach, describe, expect, it } from 'vitest';
import { DashboardLayout, DashboardLayoutModule } from './dashboardlayout';

@Component({
    standalone: true,
    imports: [DashboardLayoutModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div style="width: 600px">
            <p-dashboardlayout
                #dash
                [(panels)]="panels"
                [columns]="6"
                [cellSpacing]="0"
                [cellAspectRatio]="1"
                [allowResizing]="true"
                [mediaQuery]="mq()"
                [resizableHandles]="['se', 'w']"
                (layoutChanged)="events.push($event)"
                (dragStart)="starts.push($event.panel.id)"
            >
                <ng-template #header let-panel>H:{{ panel.id }}</ng-template>
                <ng-template #panel let-p
                    ><button type="button" class="inner">{{ p.id }}</button><span class="body">{{ p.id }}</span></ng-template
                >
            </p-dashboardlayout>
        </div>
    `
})
class Host {
    readonly dash = viewChild.required<DashboardLayout>('dash');
    readonly panels = signal<PanelModel[]>([
        { id: 'a', row: 0, col: 0, sizeX: 2, sizeY: 2 },
        { id: 'b', row: 0, col: 2, sizeX: 2, sizeY: 2 },
        { id: 'c', row: 2, col: 0, sizeX: 4, sizeY: 1, enabled: false }
    ]);
    readonly mq = signal<string | undefined>(undefined);
    readonly events: DashboardChangeEvent[] = [];
    readonly starts: string[] = [];
}

const pe = (type: string, el: Element, x: number, y: number, extra: PointerEventInit = {}) =>
    el.dispatchEvent(new PointerEvent(type, { pointerId: 1, pointerType: 'mouse', button: 0, clientX: x, clientY: y, bubbles: true, cancelable: true, ...extra }));

describe('DashboardLayout', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    const panel = (id: string) => fixture.nativeElement.querySelector(`[aria-label="${id}"], [aria-label="H:${id}"]`) as HTMLElement;
    const byId = (id: string) => [...fixture.nativeElement.querySelectorAll('.p-dashboardlayout-panel')].find((e: HTMLElement) => e.textContent!.includes(`H:${id}`)) as HTMLElement;
    const pos = (id: string) => {
        const m = /translate\((-?[\d.]+)px, ?(-?[\d.]+)px\)/.exec(byId(id).style.transform)!;

        return { x: Number(m[1]), y: Number(m[2]) };
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [Host], providers: [provideZonelessChangeDetection()] }).compileComponents();

        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        document.body.appendChild(fixture.nativeElement);
        await fixture.whenStable();
        host.dash().refresh();
        await fixture.whenStable();
    });

    it('lays the panels on the grid in pixels', () => {
        expect(fixture.nativeElement.querySelectorAll('.p-dashboardlayout-panel')).toHaveLength(3);
        expect(pos('a')).toEqual({ x: 0, y: 0 });
        expect(pos('b')).toEqual({ x: 200, y: 0 });
        expect(pos('c')).toEqual({ x: 0, y: 200 });
        expect(byId('a').style.width).toBe('200px');
        expect(fixture.nativeElement.querySelector('.p-dashboardlayout-grid').style.height).toBe('300px');
        expect(byId('a').querySelector('.body')).toBeTruthy();
    });

    it('drags a panel to a new cell, the others make way, and the model follows', async () => {
        const a = byId('a');

        pe('pointerdown', a, 20, 20);
        pe('pointermove', a, 40, 20);
        pe('pointermove', a, 20 + 200, 20); // two columns to the right: onto b
        await fixture.whenStable();

        expect(a.classList).toContain('p-dashboardlayout-panel-dragging');
        expect(fixture.nativeElement.querySelector('.p-dashboardlayout-placeholder')).toBeTruthy();

        pe('pointerup', a, 220, 20);
        await fixture.whenStable();

        const next = host.panels();

        expect(next.find((p) => p.id === 'a')).toMatchObject({ row: 0, col: 2 });
        expect(next.find((p) => p.id === 'b')!.row).toBeGreaterThanOrEqual(2);
        expect(host.starts).toEqual(['a']);
        expect(host.events.at(-1)!.type).toBe('drag');
        expect(fixture.nativeElement.querySelector('.p-dashboardlayout-placeholder')).toBeNull();
    });

    it('treats a press that barely moves as a click', async () => {
        const a = byId('a');

        pe('pointerdown', a, 20, 20);
        pe('pointermove', a, 21, 20);
        pe('pointerup', a, 21, 20);
        await fixture.whenStable();

        expect(host.events).toHaveLength(0);
        expect(host.starts).toEqual([]);
    });

    it('does not start a drag from a control inside the panel', async () => {
        pe('pointerdown', byId('a').querySelector('.inner')!, 20, 20);
        pe('pointermove', byId('a'), 300, 300);
        await fixture.whenStable();

        expect(host.starts).toEqual([]);
    });

    it('lets dragStart cancel', async () => {
        host.dash().dragStart.subscribe((e) => (e.cancel = true));

        const a = byId('a');

        pe('pointerdown', a, 20, 20);
        pe('pointermove', a, 220, 20);
        pe('pointerup', a, 220, 20);
        await fixture.whenStable();

        expect(host.events).toHaveLength(0);
    });

    it('resizes from the corner', async () => {
        const handle = byId('a').querySelector('.p-dashboardlayout-handle-se')!;

        pe('pointerdown', handle, 190, 190);
        pe('pointermove', handle, 290, 190);
        pe('pointerup', handle, 290, 190);
        await fixture.whenStable();

        expect(host.panels().find((p) => p.id === 'a')).toMatchObject({ sizeX: 3, sizeY: 2, col: 0 });
        expect(host.events.at(-1)!.type).toBe('resize');
    });

    it('resizes from the west edge keeping the right edge', async () => {
        const handle = byId('b').querySelector('.p-dashboardlayout-handle-w')!;

        pe('pointerdown', handle, 200, 100);
        pe('pointermove', handle, 300, 100); // 100px in: one column narrower
        pe('pointerup', handle, 300, 100);
        await fixture.whenStable();

        expect(host.panels().find((p) => p.id === 'b')).toMatchObject({ col: 3, sizeX: 1 });
    });

    it('moves and resizes with the keyboard and announces it', async () => {
        const a = byId('a');

        a.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true, cancelable: true }));
        await fixture.whenStable();

        expect(host.panels().find((p) => p.id === 'a')!.row).toBeGreaterThan(0);
        expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain('moved to row');

        byId('b').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true, bubbles: true, cancelable: true }));
        await fixture.whenStable();

        expect(host.panels().find((p) => p.id === 'b')!.sizeX).toBe(3);
        expect(host.events.map((e) => e.type)).toEqual(['keyboard', 'keyboard']);
    });

    it('answers the methods', async () => {
        const dash = host.dash();

        dash.addPanel({ id: 'd', sizeX: 2, sizeY: 1 });
        await fixture.whenStable();
        expect(host.panels().find((p) => p.id === 'd')).toMatchObject({ row: 0, col: 4 });
        expect(fixture.nativeElement.querySelectorAll('.p-dashboardlayout-panel')).toHaveLength(4);

        dash.movePanel('d', 5, 0);
        dash.resizePanel('d', 3, 2);
        dash.updatePanel({ id: 'd', header: 'Dee' });
        expect(dash.serialize().find((p) => p.id === 'd')).toMatchObject({ sizeX: 3, sizeY: 2, header: 'Dee' });

        dash.removePanel('d');
        expect(host.panels().some((p) => p.id === 'd')).toBe(false);

        dash.removeAll();
        await fixture.whenStable();
        expect(host.panels()).toEqual([]);
        expect(host.events.at(-1)!.type).toBe('clear');
    });

    it('keeps a disabled panel from being moved or resized', () => {
        expect(byId('c').classList).toContain('p-dashboardlayout-panel-disabled');
        expect(byId('c').querySelector('.p-dashboardlayout-handle')).toBeNull();
        expect(byId('c').getAttribute('aria-roledescription')).toBeNull();
        expect(byId('a').getAttribute('aria-roledescription')).toBe('draggable panel');
    });

    it('stacks the panels in one column under the media query, and cannot move them there', async () => {
        host.mq.set('min-width: 1px'); // always true
        await fixture.whenStable();

        expect(fixture.nativeElement.querySelector('.p-dashboardlayout-narrow')).toBeTruthy();
        expect(pos('a')).toEqual({ x: 0, y: 0 });
        expect(pos('b').x).toBe(0);
        expect(byId('b').style.width).toBe('600px');
        expect(pos('b').y).toBeGreaterThan(pos('a').y);
        expect(pos('c').y).toBeGreaterThan(pos('b').y);
        expect(byId('a').getAttribute('aria-roledescription')).toBeNull();

        host.mq.set(undefined);
        await fixture.whenStable();

        expect(fixture.nativeElement.querySelector('.p-dashboardlayout-narrow')).toBeNull();
        expect(pos('b')).toEqual({ x: 200, y: 0 });
    });
});

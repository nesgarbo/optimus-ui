import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CHART_CONTEXT, type ChartContext, type SeriesRegistration } from '../charts-registry';
import { createChartState } from '../charts-state';
import { ChartExportMenu } from './chart-export-menu';
import { ChartLegend } from './chart-legend';
import { ChartTooltip } from './chart-tooltip';

// The legend, the tooltip and the export menu are real DOM in both renderers, so they are tested as
// components -- mounted against a real chart state rather than a stub, because what they read is the
// state's own registry.

function makeState() {
    return createChartState({
        renderer: 'svg',
        width: signal(600),
        height: signal(300),
        theme: signal(undefined),
        isDark: signal(false),
        fontFamily: signal('sans-serif'),
        fontSize: signal(12),
        direction: signal<'ltr' | 'rtl'>('ltr'),
        locale: signal('en-US'),
        numberFormat: signal(undefined),
        text: signal(undefined),
        container: () => null,
        exportChart: async () => {},
        requestRender: () => {}
    });
}

function register(context: ChartContext, id: string, props: Record<string, unknown>, type: SeriesRegistration['type'] = 'line', index = 0): void {
    context.registerSeries({ id, type, props: signal(props) as never, seriesIndex: signal(index) });
}

async function mount<T>(component: new () => T, context: ChartContext, template = ''): Promise<ComponentFixture<T>> {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(), { provide: CHART_CONTEXT, useValue: context }] });

    const fixture = TestBed.createComponent(component);

    void template;
    await fixture.whenStable();

    return fixture;
}

describe('ChartLegend', () => {
    let state: ReturnType<typeof makeState>;

    beforeEach(() => {
        state = makeState();
        register(state.context, 'a', { name: 'Sales', data: [] }, 'line', 0);
        register(state.context, 'b', { name: 'Costs', data: [] }, 'bar', 1);
    });

    afterEach(() => TestBed.resetTestingModule());

    it('is a group of toggle buttons, not a list of list items', async () => {
        const fixture = await mount(ChartLegend, state.context);
        const el = fixture.nativeElement as HTMLElement;
        const root = el.querySelector('[data-slot="chart-legend"]')!;
        const buttons = el.querySelectorAll('button[data-slot="chart-legend-item"]');

        expect(root.getAttribute('role')).toBe('group');
        expect(buttons).toHaveLength(2);

        // A button with aria-pressed that is announced as a list item loses both its role and its state.
        for (const button of Array.from(buttons)) {
            expect(button.getAttribute('role')).toBeNull();
            expect(button.hasAttribute('aria-pressed')).toBe(true);
        }

        expect(el.querySelector('[role="listitem"]')).toBeNull();
    });

    it('toggles a series from its button and reflects it in aria-pressed', async () => {
        const fixture = await mount(ChartLegend, state.context);
        const el = fixture.nativeElement as HTMLElement;
        const first = el.querySelector<HTMLButtonElement>('button[data-series="a"]')!;

        expect(first.getAttribute('aria-pressed')).toBe('true');

        first.click();
        await fixture.whenStable();

        expect(state.context.isDatasetVisible('a')).toBe(false);
        expect(el.querySelector('button[data-series="a"]')!.getAttribute('aria-pressed')).toBe('false');
        expect(el.querySelector('button[data-series="a"]')!.getAttribute('data-state')).toBe('hidden');
    });

    it('labels a pie legend from a category bound with a function', async () => {
        const pieState = makeState();

        register(pieState.context, 'p', { data: [{ k: 'x' }, { k: 'y' }], categoryField: (ctx: { datum: { k: string } }) => ctx.datum.k.toUpperCase() }, 'pie');

        const fixture = await mount(ChartLegend, pieState.context);
        const labels = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.p-chart-legend-label')).map((node) => node.textContent);

        expect(labels).toEqual(['X', 'Y']);
    });
});

describe('ChartTooltip', () => {
    afterEach(() => TestBed.resetTestingModule());

    function hoverOn(state: ReturnType<typeof makeState>, datasetId: string, index: number): void {
        state.context.setHover({ datasetId, index, x: 50, y: 50 });
    }

    it('shows the value of a series bound with field names', async () => {
        const state = makeState();

        register(state.context, 's', {
            name: 'Sales',
            data: [
                { m: 'Jan', v: 10 },
                { m: 'Feb', v: 25 }
            ],
            categoryXField: 'm',
            valueYField: 'v'
        });

        const fixture = await mount(ChartTooltip, state.context);

        hoverOn(state, 's', 1);
        await fixture.whenStable();

        const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

        expect(text).toContain('Feb');
        expect(text).toContain('25');
    });

    it('shows the value of a series bound with function accessors', async () => {
        const state = makeState();

        register(state.context, 's', {
            name: 'Sales',
            data: [
                { m: 'Jan', v: 10 },
                { m: 'Feb', v: 25 }
            ],
            categoryXField: (ctx: { datum: { m: string } }) => `Month ${ctx.datum.m}`,
            valueYField: (ctx: { datum: { v: number } }) => ctx.datum.v * 2
        });

        const fixture = await mount(ChartTooltip, state.context);

        hoverOn(state, 's', 1);
        await fixture.whenStable();

        const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

        // Before, a function accessor showed the row index as the label and no value at all.
        expect(text).toContain('Month Feb');
        expect(text).toContain('50');
    });

    it('shows nothing for a row with no value, instead of a zero', async () => {
        const state = makeState();

        register(state.context, 's', { data: [{ m: 'Jan', v: null }], categoryXField: 'm', valueYField: 'v' });

        const fixture = await mount(ChartTooltip, state.context);

        hoverOn(state, 's', 0);
        await fixture.whenStable();

        expect((fixture.nativeElement as HTMLElement).querySelector('.p-chart-tooltip')).toBeNull();
    });

    it('lists every series at the hovered category in shared mode', async () => {
        const state = makeState();

        register(
            state.context,
            'a',
            {
                name: 'A',
                data: [
                    { m: 'Jan', v: 1 },
                    { m: 'Feb', v: 2 }
                ],
                categoryXField: 'm',
                valueYField: 'v'
            },
            'line',
            0
        );
        register(
            state.context,
            'b',
            {
                name: 'B',
                data: [
                    { m: 'Feb', v: 20 },
                    { m: 'Jan', v: 10 }
                ],
                categoryXField: 'm',
                valueYField: 'v'
            },
            'line',
            1
        );

        TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(), { provide: CHART_CONTEXT, useValue: state.context }] });

        const fixture = TestBed.createComponent(ChartTooltip);

        fixture.componentRef.setInput('mode', 'shared');
        await fixture.whenStable();

        hoverOn(state, 'a', 1);
        await fixture.whenStable();

        const rows = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('[data-slot="chart-tooltip-row"]')).map((row) => row.textContent?.replace(/\s+/g, ' ').trim());

        // Series b lists its Feb row even though it sits at a different index than series a's.
        expect(rows).toHaveLength(2);
        expect(rows[1]).toContain('20');
    });
});

@Component({ selector: 'p-test-menu-host', imports: [ChartExportMenu], template: `<p-chart-export-menu [menuItems]="['downloadPNG', 'downloadCSV']" />` })
class ExportMenuHost {}

describe('ChartExportMenu', () => {
    afterEach(() => TestBed.resetTestingModule());

    async function open(): Promise<{ fixture: ComponentFixture<ExportMenuHost>; el: HTMLElement; button: HTMLButtonElement }> {
        const state = makeState();

        register(state.context, 's', { data: [{ m: 'Jan', v: 1 }], categoryXField: 'm', valueYField: 'v' });
        TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(), { provide: CHART_CONTEXT, useValue: state.context }] });

        const fixture = TestBed.createComponent(ExportMenuHost);

        await fixture.whenStable();

        const el = fixture.nativeElement as HTMLElement;

        return { fixture, el, button: el.querySelector<HTMLButtonElement>('[data-slot="chart-export-menu-button"]')! };
    }

    const key = (target: Element, name: string) => target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));

    it('opens from the button with the down arrow and puts the focus on the first entry', async () => {
        const { fixture, el, button } = await open();

        expect(el.querySelector('[role="menu"]')).toBeNull();

        button.focus();
        key(button, 'ArrowDown');
        await fixture.whenStable();
        await new Promise((resolve) => setTimeout(resolve));

        const items = el.querySelectorAll<HTMLElement>('[role="menuitem"]');

        expect(el.querySelector('[role="menu"]')).not.toBeNull();
        expect(items).toHaveLength(2);
        expect(document.activeElement).toBe(items[0]);
    });

    it('moves between entries with the arrows, Home and End, wrapping at the ends', async () => {
        const { fixture, el, button } = await open();

        key(button, 'ArrowDown');
        await fixture.whenStable();
        await new Promise((resolve) => setTimeout(resolve));

        const items = Array.from(el.querySelectorAll<HTMLElement>('[role="menuitem"]'));

        key(items[0], 'ArrowDown');
        expect(document.activeElement).toBe(items[1]);
        key(items[1], 'ArrowDown');
        expect(document.activeElement).toBe(items[0]);
        key(items[0], 'ArrowUp');
        expect(document.activeElement).toBe(items[1]);
        key(items[1], 'Home');
        expect(document.activeElement).toBe(items[0]);
        key(items[0], 'End');
        expect(document.activeElement).toBe(items[1]);
    });

    it('closes on Escape and gives the focus back to the button', async () => {
        const { fixture, el, button } = await open();

        key(button, 'ArrowDown');
        await fixture.whenStable();
        await new Promise((resolve) => setTimeout(resolve));

        key(el.querySelector('[role="menuitem"]')!, 'Escape');
        await fixture.whenStable();

        expect(el.querySelector('[role="menu"]')).toBeNull();
        expect(document.activeElement).toBe(button);
    });

    it('closes on a click outside, and only listens while it is open', async () => {
        const { fixture, el, button } = await open();
        const add = vi.spyOn(document, 'addEventListener');
        const remove = vi.spyOn(document, 'removeEventListener');

        button.click();
        await fixture.whenStable();

        expect(el.querySelector('[role="menu"]')).not.toBeNull();
        expect(add.mock.calls.some(([type]) => type === 'click')).toBe(true);

        document.body.click();
        await fixture.whenStable();

        expect(el.querySelector('[role="menu"]')).toBeNull();
        expect(remove.mock.calls.some(([type]) => type === 'click')).toBe(true);

        add.mockRestore();
        remove.mockRestore();
    });

    it('does not open the menu with the arrow key a second time while it is already open', async () => {
        const { fixture, el, button } = await open();

        key(button, 'ArrowDown');
        await fixture.whenStable();
        key(button, 'ArrowDown');
        await fixture.whenStable();

        expect(el.querySelectorAll('[role="menu"]')).toHaveLength(1);
    });
});

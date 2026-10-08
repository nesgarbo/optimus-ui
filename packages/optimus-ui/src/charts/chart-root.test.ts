import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChartSvg } from './chart-svg';
import { ChartsModule } from './charts.module';

// The roots own the pieces no part can: the frame loop, the page's colour scheme and the keyboard.
// They are tested mounted, because what matters is what the page sees.

@Component({
    standalone: true,
    imports: [ChartsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <p-chart-svg [width]="500" [height]="300" [animation]="false" [ariaLabel]="label()" [text]="text()" (pointHover)="hovers.push($event)">
            <p-chart-x-axis />
            <p-chart-y-axis />
            <p-chart-line [data]="data" categoryXField="m" valueYField="v" name="Sales" />
            <p-chart-line [data]="other" categoryXField="m" valueYField="v" name="Costs" />
            <p-chart-tooltip />
            <p-chart-legend />
        </p-chart-svg>
    `
})
class LineHost {
    readonly text = signal<Record<string, string> | undefined>(undefined);
    readonly label = signal<string | undefined>(undefined);
    readonly hovers: unknown[] = [];
    readonly chart = viewChild.required(ChartSvg);
    readonly data = [
        { m: 'Jan', v: 10 },
        { m: 'Feb', v: 20 },
        { m: 'Mar', v: 30 }
    ];
    readonly other = [
        { m: 'Jan', v: 1 },
        { m: 'Feb', v: 2 },
        { m: 'Mar', v: 3 }
    ];
}

@Component({
    standalone: true,
    imports: [ChartsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <p-chart-svg [width]="500" [height]="300" [animation]="false">
            <p-chart-x-axis />
            <p-chart-y-axis />
            <p-chart-scatter [data]="data" valueXField="x" valueYField="y" />
            <p-chart-zoom [wheel]="wheel()" />
        </p-chart-svg>
    `
})
class ZoomHost {
    readonly wheel = signal<boolean | { modifierKey?: 'ctrl' }>({ modifierKey: 'ctrl' });
    readonly data = Array.from({ length: 20 }, (_, i) => ({ x: i, y: i * 2 }));
}

async function mount<T>(component: new () => T): Promise<ComponentFixture<T>> {
    await TestBed.configureTestingModule({ imports: [component], providers: [provideZonelessChangeDetection()] }).compileComponents();

    const fixture = TestBed.createComponent(component);

    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 60));
    await fixture.whenStable();

    return fixture;
}

const press = (target: Element, key: string, init: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });

    target.dispatchEvent(event);

    return event;
};

describe('chart root keyboard navigation', () => {
    let fixture: ComponentFixture<LineHost>;
    let container: HTMLElement;

    beforeEach(async () => {
        fixture = await mount(LineHost);
        container = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[role="figure"]')!;
    });

    afterEach(() => {
        fixture.destroy();
        TestBed.resetTestingModule();
    });

    const hover = () => fixture.componentInstance.chart().context.hover();

    it('moves the hover along the series with the arrow keys', () => {
        press(container, 'ArrowRight');
        expect(hover()).toMatchObject({ datasetId: expect.any(String), index: 0 });

        const first = hover()!.datasetId;

        press(container, 'ArrowRight');
        expect(hover()).toMatchObject({ datasetId: first, index: 1 });
        press(container, 'ArrowLeft');
        expect(hover()).toMatchObject({ datasetId: first, index: 0 });
        press(container, 'End');
        expect(hover()).toMatchObject({ index: 2 });
        press(container, 'Home');
        expect(hover()).toMatchObject({ index: 0 });
    });

    it('puts the hover on the point, in pixels, so the tooltip and the crosshair follow it', () => {
        press(container, 'ArrowRight');

        const { x, y } = hover()!;

        expect(Number.isFinite(x)).toBe(true);
        expect(Number.isFinite(y)).toBe(true);
        expect(x).toBeGreaterThan(0);
        expect(x).toBeLessThan(500);
    });

    it('switches series with up and down', () => {
        press(container, 'ArrowRight');

        const first = hover()!.datasetId;

        press(container, 'ArrowDown');

        expect(hover()!.datasetId).not.toBe(first);
        expect(hover()!.index).toBe(0);
    });

    it('tells the application, as a pointer would', async () => {
        press(container, 'ArrowRight');
        await fixture.whenStable();

        const last = fixture.componentInstance.hovers.at(-1) as { index: number; label: string } | null;

        expect(last).toMatchObject({ index: 0, label: 'Jan' });
    });

    it('clears the hover on Escape', () => {
        press(container, 'ArrowRight');
        expect(hover()).not.toBeNull();

        press(container, 'Escape');
        expect(hover()).toBeNull();
    });

    it('prevents the page from scrolling on a key it uses, and leaves other keys alone', () => {
        expect(press(container, 'ArrowRight').defaultPrevented).toBe(true);
        expect(press(container, 'a').defaultPrevented).toBe(false);
        expect(press(container, 'ArrowRight', { ctrlKey: true }).defaultPrevented).toBe(false);
    });

    it('ignores a key that was aimed at a control inside the chart', () => {
        const legendButton = container.querySelector<HTMLElement>('button[data-slot="chart-legend-item"]')!;

        press(legendButton, 'ArrowRight');

        expect(hover()).toBeNull();
    });

    it('clears the hover when the focus leaves the chart', () => {
        press(container, 'ArrowRight');
        container.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }));

        expect(hover()).toBeNull();
    });
});

describe('chart root hover repaint', () => {
    let fixture: ComponentFixture<LineHost>;

    beforeEach(async () => {
        fixture = await mount(LineHost);
    });

    afterEach(() => {
        fixture.destroy();
        TestBed.resetTestingModule();
    });

    const layer = (key: string) => Array.from((fixture.nativeElement as HTMLElement).querySelectorAll(`[data-slot="chart-layer-${key}"] > *`));
    // The chart paints on an animation frame, so wait for two frames instead of a fixed time, which
    // is too short when the machine is busy.
    const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const settle = async () => {
        await frame();
        await frame();
        await fixture.whenStable();
    };

    it('keeps the elements that a hover change does not touch', async () => {
        const container = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[role="figure"]')!;

        press(container, 'ArrowRight');
        await settle();

        const grid = layer('grid');
        const axes = layer('axes');
        const marks = layer('marks');

        expect(grid.length).toBeGreaterThan(0);
        expect(marks.length).toBeGreaterThan(0);

        press(container, 'ArrowRight');
        await settle();

        const sameElements = (before: Element[], after: Element[]) => after.filter((element) => before.includes(element)).length;

        expect(sameElements(grid, layer('grid'))).toBe(grid.length);
        expect(sameElements(axes, layer('axes'))).toBe(axes.length);
        expect(layer('marks').length).toBe(marks.length);
        // Without a ChartHover the hover paints no mark differently, so no mark is replaced either.
        expect(sameElements(marks, layer('marks'))).toBe(marks.length);
    });
});

describe('chart root accessibility', () => {
    afterEach(() => TestBed.resetTestingModule());

    it('writes the generated aria label with the text catalogue', async () => {
        const fixture = await mount(LineHost);
        const figure = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[role="figure"]')!;

        fixture.componentInstance.text.set({ multiSeriesSummary: 'Gráfico combinado con {count} series.' });
        await fixture.whenStable();

        expect(figure.getAttribute('aria-label')).toBe('Gráfico combinado con 2 series.');
        fixture.destroy();
    });

    it('uses the aria label it is given and falls back to a generated one', async () => {
        const fixture = await mount(LineHost);
        const figure = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[role="figure"]')!;

        expect(figure.getAttribute('aria-label')).toContain('Combination chart');

        fixture.componentInstance.label.set('Quarterly sales');
        await fixture.whenStable();

        expect(figure.getAttribute('aria-label')).toBe('Quarterly sales');
        fixture.destroy();
    });
});

describe('chart root frame loop and colour scheme', () => {
    afterEach(() => {
        document.documentElement.classList.remove('p-dark');
        TestBed.resetTestingModule();
    });

    it('cancels the pending repaint when the chart is destroyed', async () => {
        const fixture = await mount(LineHost);
        const cancel = vi.spyOn(window, 'cancelAnimationFrame');

        // A hover schedules a repaint on the next frame; destroying the chart first must cancel it.
        fixture.componentInstance.chart().context.setHover({ datasetId: 'x', index: 0, x: 1, y: 1 });
        fixture.destroy();

        expect(cancel).toHaveBeenCalled();
        cancel.mockRestore();
    });

    it('follows the page when it switches to a dark scheme', async () => {
        const fixture = await mount(LineHost);
        const context = fixture.componentInstance.chart().context;
        const before = context.isDark();

        document.documentElement.classList.toggle('p-dark', !before);
        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(context.isDark()).toBe(!before);

        document.documentElement.classList.toggle('p-dark', before);
        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(context.isDark()).toBe(before);
        fixture.destroy();
    });

    it('stops watching the page once destroyed', async () => {
        const fixture = await mount(LineHost);
        const context = fixture.componentInstance.chart().context;

        fixture.destroy();

        const before = context.isDark();

        document.documentElement.classList.toggle('p-dark', !before);
        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(context.isDark()).toBe(before);
    });
});

describe('chart zoom wheel', () => {
    let fixture: ComponentFixture<ZoomHost>;
    let container: HTMLElement;

    beforeEach(async () => {
        fixture = await mount(ZoomHost);
        container = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[role="figure"]')!;
    });

    afterEach(() => {
        fixture.destroy();
        TestBed.resetTestingModule();
    });

    const wheel = (init: WheelEventInit = {}) => {
        const event = new WheelEvent('wheel', { deltaY: 100, bubbles: true, cancelable: true, clientX: 200, clientY: 100, ...init });

        container.dispatchEvent(event);

        return event;
    };

    // The zoom binds its wheel listener on a frame after the chart mounts (it retries until the chart
    // container exists), so a test that dispatches at once can run before the listener is there.
    // Wait for the listener with a modifier wheel, which every config but `false` takes.
    const untilBound = () => vi.waitFor(() => expect(wheel({ ctrlKey: true }).defaultPrevented).toBe(true), { timeout: 2000 });

    it('leaves the page scroll alone by default', async () => {
        await untilBound();

        expect(wheel().defaultPrevented).toBe(false);
    });

    it('zooms with the modifier held, which is also what a trackpad pinch sends', async () => {
        await untilBound();

        expect(wheel({ ctrlKey: true }).defaultPrevented).toBe(true);
    });

    it('zooms on a bare wheel only when asked to', async () => {
        await untilBound();
        fixture.componentInstance.wheel.set(true as never);
        await fixture.whenStable();

        expect(wheel().defaultPrevented).toBe(true);
    });

    it('does not take the wheel when zoom is off', async () => {
        await untilBound();
        fixture.componentInstance.wheel.set(false as never);
        await fixture.whenStable();

        expect(wheel({ ctrlKey: true }).defaultPrevented).toBe(false);
    });

    it('only listens for the pointer on the chart, and not on the whole window', () => {
        const added = vi.spyOn(window, 'addEventListener');

        container.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true, clientX: 100, clientY: 100 }));

        expect(added.mock.calls.filter(([type]) => type === 'pointerup' || type === 'pointermove')).toHaveLength(0);
        added.mockRestore();
    });
});

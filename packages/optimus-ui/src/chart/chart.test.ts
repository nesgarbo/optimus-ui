import { ElementRef, PLATFORM_ID, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UIChart } from './chart';

const DATA = { labels: ['A', 'B'], datasets: [{ label: 'Sales', data: [3, 5] }] };

describe('UIChart (chart.js)', () => {
    afterEach(() => TestBed.resetTestingModule());

    async function mount() {
        TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });

        const fixture = TestBed.createComponent(UIChart);

        fixture.componentRef.setInput('type', 'bar');
        fixture.componentRef.setInput('data', DATA);
        fixture.componentRef.setInput('options', { animation: false });
        document.body.appendChild(fixture.nativeElement);
        await fixture.whenStable();
        await vi.waitFor(() => expect(fixture.componentInstance.chart).toBeTruthy());

        return fixture;
    }

    it('creates the chart on its canvas and exposes the element it sits on', async () => {
        const fixture = await mount();
        const chart = fixture.componentInstance;

        expect(chart.el).toBeInstanceOf(ElementRef);
        expect(chart.getCanvas()).toBeInstanceOf(HTMLCanvasElement);
        expect(chart.chart).toBeTruthy();
        expect(chart.getBase64Image()).toMatch(/^data:image\/png/);
        fixture.destroy();
    });

    it('builds a new chart when the data is replaced', async () => {
        const fixture = await mount();
        const chart = fixture.componentInstance;
        const first = chart.chart;

        fixture.componentRef.setInput('data', { labels: ['A'], datasets: [{ label: 'Sales', data: [1] }] });
        fixture.detectChanges();
        await vi.waitFor(() => expect(chart.chart).toBeTruthy());
        await vi.waitFor(() => expect(chart.chart).not.toBe(first));

        expect(chart.chart.data.labels).toEqual(['A']);
        fixture.destroy();
    });

    it('destroys the chart with the component', async () => {
        const fixture = await mount();
        const chart = fixture.componentInstance;
        const instance = chart.chart;

        fixture.destroy();

        expect(chart.chart).toBeNull();
        expect(instance.canvas).toBeNull();
    });

    it('labels the canvas for assistive technology', async () => {
        const fixture = await mount();

        fixture.componentRef.setInput('ariaLabel', 'Sales by letter');
        await fixture.whenStable();

        expect((fixture.nativeElement as HTMLElement).querySelector('canvas')!.getAttribute('aria-label')).toBe('Sales by letter');
        fixture.destroy();
    });

    it('does not create a chart when destroyed before Chart.js loads', async () => {
        TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
        const fixture = TestBed.createComponent(UIChart);

        fixture.componentRef.setInput('type', 'bar');
        fixture.componentRef.setInput('data', DATA);
        document.body.appendChild(fixture.nativeElement);
        fixture.detectChanges();
        const chart = fixture.componentInstance;

        fixture.destroy();
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(chart.chart).toBeFalsy();
    });

    it('creates a single chart when data changes while Chart.js loads', async () => {
        TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
        const fixture = TestBed.createComponent(UIChart);

        fixture.componentRef.setInput('type', 'bar');
        fixture.componentRef.setInput('data', DATA);
        fixture.componentRef.setInput('options', { animation: false });
        document.body.appendChild(fixture.nativeElement);
        fixture.detectChanges();
        const chart = fixture.componentInstance;

        fixture.componentRef.setInput('data', { labels: ['Z'], datasets: [{ label: 'Sales', data: [9] }] });
        fixture.detectChanges();
        await vi.waitFor(() => expect(chart.chart).toBeTruthy());
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(chart.chart.data.labels).toEqual(['Z']);
        expect(Object.keys((await import('chart.js')).Chart.instances).length).toBe(1);
        fixture.destroy();
    });

    it('does not throw before the chart exists', () => {
        TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
        const chart = TestBed.createComponent(UIChart).componentInstance;

        expect(() => {
            chart.refresh();
            chart.generateLegend();
            chart.getBase64Image();
            chart.reinit();
        }).not.toThrow();
    });

    it('does not load Chart.js on the server', async () => {
        TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(), { provide: PLATFORM_ID, useValue: 'server' }] });
        const fixture = TestBed.createComponent(UIChart);

        fixture.componentRef.setInput('type', 'bar');
        fixture.componentRef.setInput('data', DATA);
        await fixture.whenStable();
        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(fixture.componentInstance.chart).toBeFalsy();
        fixture.destroy();
    });
});

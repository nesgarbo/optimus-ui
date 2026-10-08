import { ElementRef, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
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

        chart.data = { labels: ['A'], datasets: [{ label: 'Sales', data: [1] }] };

        expect(chart.chart).not.toBe(first);
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
});

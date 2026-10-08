import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ChartsModule } from './charts.module';

@Component({
    standalone: true,
    imports: [ChartsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <p-chart-svg [width]="600" [height]="360" id="sk">
            <p-chart-sankey [data]="data()" [linkColor]="mode()" [nodeColors]="{ Power: '#ff0000' }" />
            <p-chart-tooltip />
        </p-chart-svg>
    `
})
class Host {
    readonly mode = signal<'source' | 'target' | 'gradient'>('gradient');
    readonly data = signal([
        { source: 'Coal', target: 'Power', value: 40 },
        { source: 'Gas', target: 'Power', value: 30 },
        { source: 'Power', target: 'Homes', value: 50 },
        { source: 'Power', target: 'Industry', value: 20 },
        { source: 'Industry', target: 'Power', value: 5 }
    ]);
}

describe('sankey series', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    const root = () => fixture.nativeElement as HTMLElement;
    const links = () => [...root().querySelectorAll('path[data-slot="chart-sankey-link"]')] as SVGPathElement[];
    const nodes = () => [...root().querySelectorAll('rect[data-slot="chart-sankey-node"]')] as SVGRectElement[];
    const wait = () => new Promise((r) => setTimeout(r, 150));

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [Host], providers: [provideZonelessChangeDetection()] }).compileComponents();

        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        document.body.appendChild(fixture.nativeElement);
        await fixture.whenStable();
        await new Promise((r) => setTimeout(r, 800));
        await fixture.whenStable();
    });

    it('draws a node per name and a link per flow, leaving out the one that loops back', () => {
        expect(nodes().map((n) => n.dataset['node'])).toEqual(['Coal', 'Power', 'Gas', 'Homes', 'Industry']);
        expect(links()).toHaveLength(4);
    });

    it('colours a node as asked, and a flow with a gradient between its two ends', () => {
        expect(
            nodes()
                .find((n) => n.dataset['node'] === 'Power')!
                .getAttribute('fill')
        ).toBe('#ff0000');
        expect(links()[0].getAttribute('stroke')).toMatch(/^url\(#/);
        expect(root().querySelectorAll('linearGradient')).toHaveLength(4);
    });

    it('can colour a flow after the node it leaves', async () => {
        host.mode.set('source');
        await fixture.whenStable();
        await wait();

        expect(root().querySelectorAll('linearGradient')).toHaveLength(0);
        expect(links()[0].getAttribute('stroke')).not.toMatch(/^url\(#/);
    });

    it('writes the name of each node', () => {
        expect([...root().querySelectorAll('text[data-slot="chart-sankey-label"]')].map((t) => t.textContent)).toEqual(['Coal', 'Power', 'Gas', 'Homes', 'Industry']);
    });

    it('lays flows thicker the more they carry', () => {
        const widths = links().map((l) => Number(l.getAttribute('stroke-width')));

        expect(widths[0] / widths[1]).toBeCloseTo(40 / 30, 1);
    });

    it('shows a flow in the tooltip, named after the two nodes it joins', async () => {
        const link = links()[0];
        const box = link.getBoundingClientRect();
        const svg = root().querySelector('svg')!;

        svg.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: box.left + box.width / 2, clientY: box.top + box.height / 2 }));
        await wait();
        await wait();

        expect(document.body.textContent).toContain('Coal → Power');
    });
});

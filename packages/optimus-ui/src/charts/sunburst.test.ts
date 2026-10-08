import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ChartsModule } from './charts.module';

@Component({
    standalone: true,
    imports: [ChartsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <p-chart-svg [width]="460" [height]="460" id="sun">
            <p-chart-sunburst [data]="data" nodeId="id" parentField="parent" valueField="size" categoryField="name" [maxDepth]="depth()" />
            <p-chart-tooltip />
        </p-chart-svg>
    `
})
class Host {
    readonly depth = signal<number | undefined>(undefined);
    readonly data = [
        { id: 'fs', name: 'Files', size: 0 },
        { id: 'img', name: 'Images', parent: 'fs', size: 0 },
        { id: 'png', name: 'PNG', parent: 'img', size: 400 },
        { id: 'jpg', name: 'JPEG', parent: 'img', size: 250 },
        { id: 'doc', name: 'Documents', parent: 'fs', size: 0 },
        { id: 'pdf', name: 'PDF', parent: 'doc', size: 300 },
        { id: 'txt', name: 'Text', parent: 'doc', size: 50 },
        { id: 'apps', name: 'Apps', size: 600 }
    ];
}

describe('sunburst series', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    const root = () => fixture.nativeElement as HTMLElement;
    const arcs = () => [...root().querySelectorAll('path[data-slot="chart-sunburst-arc"]')] as SVGPathElement[];
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

    it('draws an arc for every node, in rings by generation', () => {
        expect(arcs()).toHaveLength(8);
        expect(arcs().map((a) => a.dataset['depth'])).toEqual(['0', '1', '2', '2', '1', '2', '2', '0']);
        expect(
            arcs()
                .map((a) => a.dataset['category'])
                .slice(0, 3)
        ).toEqual(['Files', 'Images', 'PNG']);
    });

    it('turns a family the colour of its first ancestor, paler for each generation', () => {
        const [files, images, png] = arcs();

        expect(images.getAttribute('fill')).toBe(files.getAttribute('fill'));
        expect(png.getAttribute('fill')).toBe(files.getAttribute('fill'));
        expect(parseFloat(images.getAttribute('fill-opacity')!)).toBeLessThan(parseFloat(files.getAttribute('fill-opacity')!));
        expect(parseFloat(png.getAttribute('fill-opacity')!)).toBeLessThan(parseFloat(images.getAttribute('fill-opacity')!));
        // Apps is a family of its own
        expect(arcs()[7].getAttribute('fill')).not.toBe(files.getAttribute('fill'));
    });

    it('writes the names that fit, turned so that none is upside down', () => {
        const labels = [...root().querySelectorAll('text[data-slot="chart-sunburst-label"]')];

        expect(labels.length).toBeGreaterThan(2);
        expect(labels.map((l) => l.textContent)).toContain('Apps');

        for (const l of labels) {
            const turn = parseFloat(/rotate\((-?[\d.]+)/.exec(l.getAttribute('transform')!)![1]);
            const n = ((turn % 360) + 360) % 360;

            expect(n > 90 && n < 270).toBe(false);
        }
    });

    it('draws fewer rings when asked to stop at a generation', async () => {
        host.depth.set(2);
        await fixture.whenStable();
        await wait();

        expect(Math.max(...arcs().map((a) => Number(a.dataset['depth'])))).toBe(1);
        expect(arcs()).toHaveLength(4); // Files, Images, Documents, Apps
    });
});

import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ChartsModule } from './charts.module';
import { annotationScale } from './features/chart-annotation';
import { bandScale, linearScale } from './core/scale';

// An annotation positions content with the chart's own scales. A band axis is keyed by category
// label, and docs and callers naturally pass the category's index: that used to be NaN in the SVG.

@Component({
    standalone: true,
    imports: [ChartsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <p-chart-svg [width]="500" [height]="300" [animation]="false">
            <p-chart-bar [data]="data" categoryXField="m" valueYField="v" />
            <p-chart-x-axis />
            <p-chart-y-axis />
            <p-chart-annotation>
                <ng-template pChartAnnotationDef let-ctx>
                    <svg:rect data-test="byIndex" [attr.x]="ctx.xScale(2)" [attr.y]="ctx.yScale(30)" width="4" height="4" />
                    <svg:rect data-test="byLabel" [attr.x]="ctx.xScale('Mar')" [attr.y]="ctx.yScale(30)" width="4" height="4" />
                </ng-template>
            </p-chart-annotation>
        </p-chart-svg>
    `
})
class AnnotationHost {
    readonly data = [
        { m: 'Jan', v: 10 },
        { m: 'Feb', v: 20 },
        { m: 'Mar', v: 30 }
    ];
}

describe('annotation scales', () => {
    it('resolves a category index and a label to the same pixel on a band axis', async () => {
        await TestBed.configureTestingModule({ imports: [AnnotationHost], providers: [provideZonelessChangeDetection()] }).compileComponents();

        const fixture = TestBed.createComponent(AnnotationHost);

        document.body.appendChild(fixture.nativeElement);
        await fixture.whenStable();
        await new Promise((resolve) => setTimeout(resolve, 60));
        await fixture.whenStable();

        const root = fixture.nativeElement as HTMLElement;
        const byIndex = root.querySelector('[data-test="byIndex"]')!.getAttribute('x');
        const byLabel = root.querySelector('[data-test="byLabel"]')!.getAttribute('x');

        expect(byLabel).not.toBe('NaN');
        expect(byIndex).toBe(byLabel);
        expect(root.innerHTML).not.toContain('NaN');

        fixture.destroy();
    });

    it('reads an integer as a position only when it is not a category label', () => {
        const band = bandScale(['2020', '2021', '2022'], { start: 0, end: 300 }, 0, 0);
        const scale = annotationScale(band);

        expect(scale('2021')).toBe(band.scale('2021'));
        expect(scale(2)).toBe(band.scale('2022'));
        expect(scale(3)).toBeNaN();
        expect(scale(-1)).toBeNaN();
        expect(scale(1.5)).toBeNaN();
        expect(scale('nope')).toBeNaN();
    });

    it('leaves a linear scale untouched', () => {
        const linear = linearScale(0, 10, { start: 0, end: 100 });

        expect(annotationScale(linear)(5)).toBe(linear.scale(5));
    });
});

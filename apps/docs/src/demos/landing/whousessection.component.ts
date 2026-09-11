import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CONTAINER, EYEBROW, HEADING, LEDE, SECTION } from './sectionshell';

interface StackMark {
    name: string;
    light: string;
    dark: string;
}

/**
 * The band of marks a visitor scans for reassurance. Optimus UI is young and has no
 * public adopter list, so rather than borrow logos it has not earned, this shows the
 * stack every release is built and tested on — a claim we can stand behind.
 */
@Component({
    selector: 'who-uses-section',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section [class]="section" aria-labelledby="whouses-heading">
            <div [class]="container">
                <span [class]="eyebrow">Ecosystem</span>
                <h2 id="whouses-heading" [class]="heading">Works with your stack</h2>
                <p [class]="lede">Built and tested on every release against the tools you already use.</p>

                <div class="mt-12 overflow-hidden sm:mx-auto sm:max-w-lg sm:mask-[linear-gradient(90deg,transparent,#000_20%,#000_80%,transparent)]">
                    <div class="marquee-track flex w-max">
                        @for (mark of track; track $index) {
                            <div class="flex h-6 w-20 shrink-0 items-center justify-center sm:h-7 sm:w-24">
                                <img [src]="mark.dark" [alt]="mark.name" loading="lazy" width="96" height="32" class="hidden max-h-full w-auto opacity-50 dark:block" />
                                <img [src]="mark.light" [alt]="mark.name" loading="lazy" width="96" height="32" class="block max-h-full w-auto opacity-75 dark:hidden" />
                            </div>
                        }
                    </div>
                </div>
            </div>
        </section>
    `
})
export class WhoUsesSectionComponent {
    readonly section = SECTION;
    readonly container = CONTAINER;
    readonly eyebrow = EYEBROW;
    readonly heading = HEADING;
    readonly lede = LEDE;

    /** The list twice: the animation translates the row by half its width and loops seamlessly. */
    get track(): StackMark[] {
        return [...this.marks, ...this.marks];
    }

    marks: StackMark[] = [
        ['angular', 'Angular'],
        ['analog', 'Analog'],
        ['vite', 'Vite'],
        ['esbuild', 'esbuild'],
        ['nx', 'Nx'],
        ['tailwindcss', 'Tailwind CSS'],
        ['stackblitz', 'StackBlitz'],
        ['vercel', 'Vercel']
    ].map(([slug, name]) => ({
        name,
        light: `/stack/${slug}-light.svg`,
        dark: `/stack/${slug}-dark.svg`
    }));
}

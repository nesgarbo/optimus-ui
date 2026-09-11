import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { version } from '../../../package.json';

/**
 * The line above the headline: which version this is, and that it is MIT licensed. The
 * four squares walk from left to right so the badge reads as something alive rather than
 * a static label; they use the preset's primary colour, so it follows the theme.
 */
@Component({
    selector: 'hero-version-badge',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <span class="inline-flex items-center gap-2 rounded-full bg-surface-100 px-3 py-1.5 font-mono text-xs tracking-wide text-muted-color select-none dark:bg-[color-mix(in_srgb,var(--p-surface-950)_50%,var(--p-surface-900)_50%)]">
            <span class="flex items-center gap-0.5" aria-hidden="true">
                @for (square of squares; track square) {
                    <span class="size-1 rounded-[0.5px] bg-primary transition-all duration-300" [class.opacity-100]="lit() === square" [class.opacity-25]="lit() !== square"></span>
                }
            </span>
            <span>v{{ version }} &middot; MIT</span>
        </span>
    `
})
export class HeroVersionBadgeComponent {
    readonly version = version;

    readonly squares = [0, 1, 2, 3];

    readonly lit = signal(0);

    constructor() {
        const platformId = inject(PLATFORM_ID);

        if (!isPlatformBrowser(platformId)) {
            return;
        }

        const timer = setInterval(() => this.lit.update((current) => (current + 1) % this.squares.length), 700);

        inject(DestroyRef).onDestroy(() => clearInterval(timer));
    }
}

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, input, PLATFORM_ID, signal, Type, viewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { COMPONENT_PREVIEWS } from './previews';

/**
 * One card on the components index.
 *
 * The thumbnail is not a screenshot: it is the component's own "basic" demo, running at
 * a smaller scale. It is loaded the first time the card comes near the viewport, so the
 * page opens with ninety-seven cards and none of their code.
 */
@Component({
    selector: 'preview-card',
    standalone: true,
    imports: [CommonModule, RouterModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <a
            [routerLink]="routerLink()"
            class="group relative block overflow-hidden rounded-xl bg-surface-0 no-underline transition-shadow duration-200 ease-[cubic-bezier(0,.55,.45,1)] hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--p-primary-color)_64%,transparent)] focus-within:shadow-[0_0_0_1px_color-mix(in_srgb,var(--p-primary-color)_64%,transparent)] dark:bg-[color-mix(in_srgb,var(--p-surface-950)_50%,var(--p-surface-900)_50%)]"
        >
            <div #thumbnail class="relative aspect-[19.5/11.5625] w-full overflow-hidden rounded-lg">
                @if (preview()) {
                    <!--
                        The demo renders at a fixed design size and is scaled down to the
                        thumbnail, so the component keeps its real proportions and is still
                        big enough to recognise.
                    -->
                    <div class="component-preview pointer-events-none absolute inset-0 origin-top-left scale-[0.6]" aria-hidden="true" style="width: 500px; height: 296px">
                        <div class="flex h-full w-full items-center justify-center p-4">
                            <ng-container *ngComponentOutlet="preview()"></ng-container>
                        </div>
                    </div>
                } @else {
                    <div class="absolute inset-0 flex items-center justify-center bg-surface-100 dark:bg-surface-900" aria-hidden="true">
                        <span class="font-mono text-xs text-muted-color">{{ name() }}</span>
                    </div>
                }
            </div>

            <div class="p-3">
                <h3 class="m-0! truncate leading-6 font-medium text-color">{{ name() }}</h3>
                @if (!compact()) {
                    <p class="m-0! line-clamp-2 text-sm leading-6 text-surface-500">{{ description() }}</p>
                }
            </div>
        </a>
    `
})
export class PreviewCardComponent {
    name = input.required<string>();

    routerLink = input.required<string>();

    description = input<string>('');

    /** Which demo to render, keyed the way `previews.ts` keys them. */
    previewKey = input<string | null>(null);

    compact = input(false);

    readonly preview = signal<Type<unknown> | null>(null);

    private readonly platformId = inject(PLATFORM_ID);

    private readonly thumbnail = viewChild.required<ElementRef<HTMLElement>>('thumbnail');

    constructor() {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (!entries.some((entry) => entry.isIntersecting)) {
                    return;
                }

                observer.disconnect();
                this.load();
            },
            { rootMargin: '300px' }
        );

        // The element exists after the first render; observing from the constructor would
        // be too early.
        queueMicrotask(() => observer.observe(this.thumbnail().nativeElement));
        inject(DestroyRef).onDestroy(() => observer.disconnect());
    }

    private async load() {
        const key = this.previewKey();
        const loader = key ? COMPONENT_PREVIEWS[key] : undefined;

        if (!loader) {
            return;
        }

        try {
            this.preview.set(await loader());
        } catch {
            // A demo that cannot boot on its own leaves the card with its name, which is
            // still a working link to the page.
        }
    }
}

import { DISCORD_URL, GITHUB_REPO_URL } from '@/utils/constants';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { EYEBROW, HEADING, LEDE, SECTION } from './sectionshell';

const DOWNLOADS_ENDPOINT = 'https://api.npmjs.org/downloads/point/last-week/@openng/optimus-ui';

const CARD = 'flex flex-col justify-between rounded-xl border border-surface bg-surface-0 p-6 no-underline transition-colors hover:border-surface-300 dark:bg-surface-900 dark:hover:border-surface-600';

@Component({
    selector: 'community-section',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section [class]="section" aria-labelledby="community-heading">
            <div class="mx-auto! max-w-3xl px-6">
                <span [class]="eyebrow">Community</span>
                <h2 id="community-heading" [class]="heading">Join the Community</h2>
                <p [class]="lede">Connect with developers building with&nbsp;Optimus UI.</p>

                <div class="mt-12 grid gap-4 sm:grid-cols-3">
                    <!-- Weekly downloads, read live from the npm registry. -->
                    <a [class]="card" href="https://www.npmjs.com/package/&#64;openng/optimus-ui" target="_blank" rel="noopener noreferrer">
                        <span class="text-3xl font-normal tracking-tight text-surface-900 tabular-nums dark:text-surface-0">
                            @if (downloads() === null) {
                                <span class="inline-block h-8 w-20 animate-pulse rounded bg-surface-100 align-middle dark:bg-surface-800"></span>
                            } @else {
                                {{ downloads() }}
                            }
                        </span>
                        <span class="mt-2 text-sm text-muted-color">weekly downloads on npm</span>
                    </a>

                    <a [class]="card" [href]="licenseUrl" target="_blank" rel="noopener noreferrer">
                        <span class="text-3xl font-normal tracking-tight text-surface-900 dark:text-surface-0">MIT</span>
                        <span class="mt-2 text-sm text-muted-color">MIT licensed &middot; community maintained</span>
                    </a>

                    <a [class]="card" [href]="discordUrl" target="_blank" rel="noopener noreferrer">
                        <i class="pi pi-discord text-3xl text-surface-900 dark:text-surface-0" aria-hidden="true"></i>
                        <span class="mt-2 text-sm text-muted-color">Join the Discord</span>
                    </a>
                </div>
            </div>
        </section>
    `
})
export class CommunitySectionComponent {
    readonly section = SECTION;
    readonly eyebrow = EYEBROW;
    readonly heading = HEADING;
    readonly lede = LEDE;
    readonly card = CARD;

    readonly discordUrl = DISCORD_URL;
    readonly licenseUrl = `${GITHUB_REPO_URL}/blob/main/LICENSE.md`;

    /** Null while loading; a dash if the registry cannot be reached. */
    downloads = signal<string | null>(null);

    private platformId = inject(PLATFORM_ID);

    constructor() {
        afterNextRender(() => this.loadDownloads());
    }

    private async loadDownloads() {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        try {
            const response = await fetch(DOWNLOADS_ENDPOINT);
            const body = await response.json();

            this.downloads.set(typeof body?.downloads === 'number' ? new Intl.NumberFormat().format(body.downloads) : '—');
        } catch {
            this.downloads.set('—');
        }
    }
}

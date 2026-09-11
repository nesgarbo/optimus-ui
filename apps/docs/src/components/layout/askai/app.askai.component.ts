import { DISCORD_URL, GITHUB_DISCUSSIONS_URL } from '@/utils/constants';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DrawerModule } from '@openng/optimus-ui/drawer';

/**
 * The documentation assistant.
 *
 * The launcher sits in the bottom corner of the viewport, clear of the reading column.
 * The widget script in index.html binds to `#ask-ai`, so it keeps that id and exists
 * exactly once. When the widget has not loaded — offline, blocked, or during
 * prerendering — the drawer opens instead and points at the sources a human can read.
 */
@Component({
    selector: 'app-ask-ai',
    standalone: true,
    imports: [CommonModule, RouterModule, DrawerModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <button type="button" id="ask-ai" class="ask-ai-fab" data-ai-launcher (click)="launch()">
            <i class="pi pi-sparkles text-xs" aria-hidden="true"></i>
            <span>Ask AI</span>
        </button>

        <p-drawer [visible]="fallbackVisible()" (visibleChange)="fallbackVisible.set($event)" position="right" styleClass="max-w-xl w-full!" appendTo="body" header="Ask AI">
            <p class="text-sm text-(--text-secondary-color)">The assistant could not be reached. Everything it reads is published as plain text, so you can point your own model at it:</p>
            <ul class="mt-4 flex flex-col gap-2 text-sm">
                <li>
                    <a href="/llms.txt" class="doc-link" target="_blank" rel="noopener noreferrer">llms.txt</a>
                    — the site map for language models.
                </li>
                <li>
                    <a href="/llms-full.txt" class="doc-link" target="_blank" rel="noopener noreferrer">llms-full.txt</a>
                    — every page in one file.
                </li>
                <li>
                    <a [href]="discussionsUrl" class="doc-link" target="_blank" rel="noopener noreferrer">GitHub Discussions</a>
                    — ask the maintainers.
                </li>
                <li>
                    <a [href]="discordUrl" class="doc-link" target="_blank" rel="noopener noreferrer">Discord</a>
                    — ask the community.
                </li>
            </ul>
        </p-drawer>
    `
})
export class AppAskAiComponent {
    readonly fallbackVisible = signal(false);

    readonly discordUrl = DISCORD_URL;

    readonly discussionsUrl = GITHUB_DISCUSSIONS_URL;

    private readonly platformId = inject(PLATFORM_ID);

    launch() {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        // The widget hooks the same button by id and opens itself; if it never arrived,
        // nothing would happen at all, so fall back to the reading list.
        if (!(window as unknown as { Kapa?: unknown }).Kapa) {
            this.fallbackVisible.set(true);
        }
    }
}

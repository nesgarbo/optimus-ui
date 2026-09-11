import { DISCORD_URL, GITHUB_DISCUSSIONS_URL } from '@/utils/constants';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DrawerModule } from '@openng/optimus-ui/drawer';

/**
 * The assistant's own configuration: colours, type and radius are the ones the site uses,
 * and `color-scheme-selector` points at the class our theme toggle writes on <html>, so
 * the panel follows the site into dark mode instead of staying light behind it.
 */
const WIDGET_SRC = 'https://widget.kapa.ai/kapa-widget.bundle.js';

const WIDGET_CONFIG: Record<string, string> = {
    'website-id': 'c63701c9-bd7c-4893-8d8e-52dcb8851e0f',
    'project-name': 'Optimus UI',
    'project-logo': '/logo-icon.svg',
    'view-mode': 'sidebar',
    'launcher-button-hidden': 'true',
    'modal-override-open-selector': '#ask-ai',
    'modal-z-index': '1200',
    'modal-title': 'Optimus UI AI',
    'ask-ai-input-placeholder': 'Type your question here...',
    'color-scheme': 'light',
    'color-scheme-selector': '.p-dark',
    'project-color': '#09090b',
    'project-color-dark': '#fafafa',
    'surface-color': '#ffffff',
    'surface-color-dark': '#09090b',
    'surface-elevated-color': '#fafafa',
    'surface-elevated-color-dark': '#18181b',
    'surface-hover-color': '#f4f4f5',
    'surface-hover-color-dark': '#27272a',
    'text-color': '#18181b',
    'text-color-dark': '#fafafa',
    'text-muted-color': '#71717a',
    'text-muted-color-dark': '#a1a1aa',
    'border-color': '#e4e4e7',
    'border-color-dark': '#27272a',
    'font-family': "'Inter Variable', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    'modal-content-border-radius': '10px'
};

type KapaApi = { open?: () => void };

/**
 * The documentation assistant.
 *
 * The launcher sits in the bottom corner of the viewport, clear of the reading column.
 *
 * The widget is fetched when someone asks for it, not with the page. It is two megabytes
 * of script and pulls a reCAPTCHA of its own, roughly a megabyte more — on every page,
 * for every visitor, while it used to sit in the document head. Now the first click
 * loads it, and it binds to this button by id and opens itself from then on. When it
 * cannot be reached at all — offline or blocked — the drawer opens instead and points at
 * the sources a human can read.
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

    private readonly document = inject(DOCUMENT);

    /** Null until the first click; the same promise afterwards, so one script tag. */
    private loading: Promise<void> | null = null;

    async launch() {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        const api = (window as unknown as { Kapa?: KapaApi }).Kapa;

        // Already here: it hooks this button by id and opens itself.
        if (api) {
            return;
        }

        try {
            await this.load();
            (window as unknown as { Kapa?: KapaApi }).Kapa?.open?.();
        } catch {
            this.fallbackVisible.set(true);
        }
    }

    private load(): Promise<void> {
        this.loading ??= new Promise<void>((resolve, reject) => {
            const script = this.document.createElement('script');

            script.async = true;
            script.src = WIDGET_SRC;

            for (const [key, value] of Object.entries(WIDGET_CONFIG)) {
                script.dataset[key.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
            }

            script.addEventListener('load', () => resolve());
            script.addEventListener('error', () => reject(new Error('the assistant could not be loaded')));

            this.document.body.appendChild(script);
        });

        return this.loading;
    }
}

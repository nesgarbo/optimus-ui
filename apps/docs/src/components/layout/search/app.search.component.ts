import { default as ComponentIndex } from '@/assets/data/components.json';
import { default as MenuData } from '@/assets/data/menu.json';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, Injectable, PLATFORM_ID, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogModule } from '@openng/optimus-ui/dialog';

/**
 * Every page of the site, from the same data the navigation is built from. This is the
 * base of the search: it needs no network, answers as you type, and keeps working when
 * the hosted index is unavailable — which it is until DocSearch has crawled the new
 * domain. Algolia's section-level hits are merged on top when the index answers.
 */
const LOCAL_PAGES: SearchResult[] = buildLocalIndex();

/** Credentials of the public Algolia DocSearch index built for this site. */
const ALGOLIA = {
    appId: 'X3M9GFEM8Z',
    apiKey: 'ce715b53658d2e2190d8751fad64e8e9',
    indexName: 'Optimus UI Documentation'
};

const RECENT_KEY = 'optimus-ui-recent-searches';

const RECENT_LIMIT = 5;

/** Shape of a DocSearch record: a page split per heading, with its ancestors in `hierarchy`. */
interface SearchHit {
    url: string;
    hierarchy: Record<string, string | null>;
    content: string | null;
}

interface SearchResult {
    /** The page the hit belongs to, e.g. "Button" — also the group heading. */
    page: string;
    /** The page's own description, so a search can match what a page is about. */
    summary?: string;
    /** The heading inside that page, when the hit is deeper than the page itself. */
    title: string;
    /** The trail above the hit, e.g. "Components › Form". */
    breadcrumb: string;
    path: string;
}

interface ResultGroup {
    page: string;
    items: SearchResult[];
}

/** A piece of a label, marked when it matches what was typed. */
interface Piece {
    text: string;
    match: boolean;
}

/**
 * Opening the search dialog from anywhere. The topbar owns the button, the dialog lives
 * next to it, and the keyboard shortcut is bound once on the document.
 */
@Injectable({ providedIn: 'root' })
export class AppSearchService {
    readonly visible = signal(false);

    open() {
        this.visible.set(true);
    }

    close() {
        this.visible.set(false);
    }
}

/**
 * Site search: the Algolia index that DocSearch builds, queried directly and rendered
 * inside a dialog of ours instead of DocSearch's own modal — so the overlay is themed by
 * the active preset like every other overlay on the site.
 *
 * It keeps what DocSearch gives a reader: results grouped by the page they live on, the
 * typed text marked inside each label, arrow-key navigation, the pages they opened last
 * when the field is empty, and ⌘K from anywhere.
 */
@Component({
    selector: 'app-search',
    standalone: true,
    imports: [CommonModule, FormsModule, DialogModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <p-dialog
            [visible]="searchService.visible()"
            (visibleChange)="onVisibleChange($event)"
            [modal]="true"
            [dismissableMask]="true"
            [showHeader]="false"
            position="top"
            styleClass="w-[90vw] md:w-[34rem]"
            appendTo="body"
            [contentStyleClass]="'p-0!'"
        >
            <div class="flex items-center gap-2 border-b border-(--border-color) px-4 py-3">
                <i class="pi pi-search text-sm text-(--muted-color)" aria-hidden="true"></i>
                <input
                    #input
                    type="search"
                    class="w-full border-0 bg-transparent text-sm text-(--text-color) outline-none placeholder:text-(--muted-color)"
                    placeholder="Search the documentation"
                    autocomplete="off"
                    spellcheck="false"
                    role="combobox"
                    aria-label="Search the documentation"
                    aria-controls="search-results"
                    [attr.aria-expanded]="results().length > 0"
                    [attr.aria-activedescendant]="activeId()"
                    [ngModel]="query()"
                    (ngModelChange)="query.set($event)"
                    (keydown.arrowDown)="move($event, 1)"
                    (keydown.arrowUp)="move($event, -1)"
                    (keydown.enter)="openActive()"
                />
                <kbd class="hidden rounded border border-(--border-color) px-1.5 py-0.5 font-mono text-[10px] text-(--muted-color) sm:block">esc</kbd>
            </div>

            <div class="max-h-[60vh] overflow-y-auto p-2">
                @if (loading()) {
                    <p class="px-2 py-6 text-center text-sm text-(--muted-color)">Searching…</p>
                } @else if (!query()) {
                    @if (recent().length) {
                        <div class="flex items-center justify-between px-3 py-1.5">
                            <span class="font-mono text-[11px] tracking-wide text-(--muted-color) uppercase">Recent</span>
                            <button type="button" class="text-[11px] text-(--muted-color) hover:text-(--heading-color)" (click)="clearRecent()">Clear</button>
                        </div>
                        <ul>
                            @for (item of recent(); track item.path) {
                                <li class="flex items-center">
                                    <button type="button" class="flex min-w-0 flex-1 flex-col items-start gap-0.5 rounded-md px-3 py-2 text-start hover:bg-(--hover-background)" (click)="go(item)">
                                        <span class="truncate text-sm font-medium text-(--heading-color)">{{ item.title }}</span>
                                        @if (item.breadcrumb) {
                                            <span class="truncate text-xs text-(--muted-color)">{{ item.breadcrumb }}</span>
                                        }
                                    </button>
                                    <button type="button" class="me-1 rounded-md p-2 text-(--muted-color) hover:text-(--heading-color)" [attr.aria-label]="'Forget ' + item.title" (click)="forget(item)">
                                        <i class="pi pi-times text-[11px]" aria-hidden="true"></i>
                                    </button>
                                </li>
                            }
                        </ul>
                    } @else {
                        <p class="px-2 py-6 text-center text-sm text-(--muted-color)">Type to search components, guides and API pages.</p>
                    }
                } @else if (!results().length) {
                    <p class="px-2 py-6 text-center text-sm text-(--muted-color)">No results for "{{ query() }}".</p>
                } @else {
                    <ul id="search-results" role="listbox" aria-label="Search results">
                        @for (group of groups(); track group.page) {
                            <li role="presentation">
                                <p class="px-3 py-1.5 font-mono text-[11px] tracking-wide text-(--muted-color) uppercase">{{ group.page }}</p>
                                <ul role="presentation">
                                    @for (result of group.items; track result.path + result.title) {
                                        <li
                                            role="option"
                                            [id]="'search-result-' + indexOf(result)"
                                            [attr.aria-selected]="activeIndex() === indexOf(result)"
                                            [style.background-color]="activeIndex() === indexOf(result) ? 'var(--hover-background)' : null"
                                            class="rounded-md"
                                        >
                                            <button type="button" class="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-start" (click)="go(result)" (mouseenter)="activeIndex.set(indexOf(result))">
                                                <span class="text-sm font-medium text-(--heading-color)">
                                                    @for (piece of pieces(result.title); track $index) {
                                                        @if (piece.match) {
                                                            <mark class="bg-transparent font-semibold text-primary">{{ piece.text }}</mark>
                                                        } @else {
                                                            <span>{{ piece.text }}</span>
                                                        }
                                                    }
                                                </span>
                                                @if (result.breadcrumb) {
                                                    <span class="text-xs text-(--muted-color)">{{ result.breadcrumb }}</span>
                                                }
                                            </button>
                                        </li>
                                    }
                                </ul>
                            </li>
                        }
                    </ul>
                }
            </div>

            <div class="flex items-center gap-4 border-t border-(--border-color) px-4 py-2 text-[11px] text-(--muted-color)">
                <span class="flex items-center gap-1"><kbd class="rounded border border-(--border-color) px-1 font-mono">↑</kbd><kbd class="rounded border border-(--border-color) px-1 font-mono">↓</kbd> to navigate</span>
                <span class="flex items-center gap-1"><kbd class="rounded border border-(--border-color) px-1 font-mono">enter</kbd> to open</span>
                <span class="ms-auto hidden sm:block">Search by Algolia</span>
            </div>
        </p-dialog>
    `
})
export class AppSearchComponent {
    readonly searchService = inject(AppSearchService);

    readonly query = signal('');

    readonly results = signal<SearchResult[]>([]);

    readonly recent = signal<SearchResult[]>([]);

    readonly loading = signal(false);

    readonly activeIndex = signal(0);

    /** Results grouped under the page they belong to, the way DocSearch groups them. */
    readonly groups = computed<ResultGroup[]>(() =>
        this.results().reduce<ResultGroup[]>((groups, result) => {
            const last = groups[groups.length - 1];

            if (last && last.page === result.page) {
                last.items.push(result);
            } else {
                groups.push({ page: result.page, items: [result] });
            }

            return groups;
        }, [])
    );

    readonly activeId = computed(() => (this.results().length ? `search-result-${this.activeIndex()}` : null));

    private readonly router = inject(Router);

    private readonly platformId = inject(PLATFORM_ID);

    private readonly input = viewChild<ElementRef<HTMLInputElement>>('input');

    /** Only the newest query is allowed to write results. */
    private requestId = 0;

    constructor() {
        effect(() => {
            const query = this.query().trim();

            this.activeIndex.set(0);

            if (!query) {
                this.results.set([]);
                this.loading.set(false);

                return;
            }

            this.search(query);
        });

        effect(() => {
            if (this.searchService.visible()) {
                // The dialog animates in, so the field is not focusable on the same frame.
                setTimeout(() => this.input()?.nativeElement.focus(), 60);
            }
        });

        if (isPlatformBrowser(this.platformId)) {
            this.recent.set(readRecent());

            document.addEventListener('keydown', (event) => {
                if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                    event.preventDefault();
                    this.searchService.open();
                }
            });
        }
    }

    onVisibleChange(visible: boolean) {
        if (!visible) {
            this.searchService.close();
            this.query.set('');
        }
    }

    /** Flat position of a result, which is what the arrow keys walk. */
    indexOf(result: SearchResult): number {
        return this.results().indexOf(result);
    }

    move(event: Event, delta: number) {
        const total = this.results().length;

        if (!total) {
            return;
        }

        event.preventDefault();
        this.activeIndex.set((this.activeIndex() + delta + total) % total);
    }

    openActive() {
        const result = this.results()[this.activeIndex()];

        if (result) {
            this.go(result);
        }
    }

    go(result: SearchResult) {
        this.remember(result);
        this.searchService.close();
        this.query.set('');
        this.router.navigateByUrl(result.path);
    }

    forget(result: SearchResult) {
        this.recent.set(this.recent().filter((item) => item.path !== result.path));
        writeRecent(this.recent());
    }

    clearRecent() {
        this.recent.set([]);
        writeRecent([]);
    }

    /** The label split so the typed text can be marked without injecting HTML. */
    pieces(label: string): Piece[] {
        const query = this.query().trim();

        if (!query) {
            return [{ text: label, match: false }];
        }

        const parts: Piece[] = [];
        const haystack = label.toLowerCase();
        const needle = query.toLowerCase();
        let from = 0;

        for (let at = haystack.indexOf(needle, from); at !== -1; at = haystack.indexOf(needle, from)) {
            if (at > from) {
                parts.push({ text: label.slice(from, at), match: false });
            }

            parts.push({ text: label.slice(at, at + needle.length), match: true });
            from = at + needle.length;
        }

        if (from < label.length) {
            parts.push({ text: label.slice(from), match: false });
        }

        return parts;
    }

    private remember(result: SearchResult) {
        const next = [result, ...this.recent().filter((item) => item.path !== result.path)].slice(0, RECENT_LIMIT);

        this.recent.set(next);
        writeRecent(next);
    }

    private async search(query: string) {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        const id = ++this.requestId;
        const local = searchLocal(query);

        // Local matches are shown straight away; the hosted index only adds to them.
        this.results.set(local);
        this.loading.set(!local.length);

        try {
            const response = await fetch(`https://${ALGOLIA.appId}-dsn.algolia.net/1/indexes/${encodeURIComponent(ALGOLIA.indexName)}/query`, {
                method: 'POST',
                headers: {
                    'X-Algolia-Application-Id': ALGOLIA.appId,
                    'X-Algolia-API-Key': ALGOLIA.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ params: `query=${encodeURIComponent(query)}&hitsPerPage=16` })
            });

            const payload = (await response.json()) as { hits?: SearchHit[] };

            if (id !== this.requestId) {
                return;
            }

            const remote = (payload.hits ?? []).map(toResult).filter((result) => !!result.path);
            const seen = new Set(local.map((result) => result.path));

            this.results.set([...local, ...remote.filter((result) => !seen.has(result.path))]);
        } catch {
            // The hosted index is optional: the local pages are already on screen.
        } finally {
            if (id === this.requestId) {
                this.loading.set(false);
            }
        }
    }
}

interface MenuNode {
    name?: string;
    routerLink?: string;
    children?: MenuNode[];
}

function buildLocalIndex(): SearchResult[] {
    const descriptions = new Map<string, string>();

    for (const group of (ComponentIndex as { groups: { items: { routerLink: string; description: string }[] }[] }).groups) {
        for (const item of group.items) {
            descriptions.set(item.routerLink, item.description);
        }
    }

    const pages: SearchResult[] = [];

    const walk = (nodes: MenuNode[], trail: string[]) => {
        for (const node of nodes) {
            const here = node.name ? [...trail, node.name] : trail;

            if (node.children?.length) {
                walk(node.children, here);
            } else if (node.routerLink && node.name) {
                pages.push({
                    page: trail[0] ?? 'Documentation',
                    title: node.name,
                    breadcrumb: trail.join(' › '),
                    path: node.routerLink,
                    summary: descriptions.get(node.routerLink) ?? ''
                });
            }
        }
    };

    walk((MenuData as { data: MenuNode[] }).data, []);

    return pages;
}

/** Name first, then a name that contains it, then the summary. */
function searchLocal(query: string): SearchResult[] {
    const needle = query.toLowerCase();
    const scored: { result: SearchResult; score: number }[] = [];

    for (const page of LOCAL_PAGES) {
        const name = page.title.toLowerCase();
        const score = name.startsWith(needle) ? 0 : name.includes(needle) ? 1 : (page.summary ?? '').toLowerCase().includes(needle) ? 2 : -1;

        if (score >= 0) {
            scored.push({ result: page, score });
        }
    }

    return scored
        .sort((a, b) => a.score - b.score || a.result.title.localeCompare(b.result.title))
        .slice(0, 12)
        .map((entry) => entry.result);
}

function toResult(hit: SearchHit): SearchResult {
    const levels = ['lvl0', 'lvl1', 'lvl2', 'lvl3', 'lvl4', 'lvl5', 'lvl6'].map((level) => hit.hierarchy?.[level]).filter((value): value is string => !!value);
    const page = levels[1] ?? levels[0] ?? 'Documentation';
    const deeper = levels.slice(2);

    return {
        page,
        title: deeper.length ? deeper[deeper.length - 1] : page,
        breadcrumb: deeper.length > 1 ? [levels[0], ...deeper.slice(0, -1)].filter(Boolean).join(' › ') : (levels[0] ?? ''),
        path: toPath(hit.url)
    };
}

/** Records carry absolute URLs; the router needs the path and hash only. */
function toPath(url: string): string {
    try {
        const parsed = new URL(url);

        return `${parsed.pathname}${parsed.hash}`;
    } catch {
        return url?.startsWith('/') ? url : '';
    }
}

function readRecent(): SearchResult[] {
    try {
        const raw = localStorage.getItem(RECENT_KEY);
        const parsed = raw ? JSON.parse(raw) : [];

        return Array.isArray(parsed) ? parsed.slice(0, RECENT_LIMIT) : [];
    } catch {
        // Private mode, or something else wrote nonsense there.
        return [];
    }
}

function writeRecent(items: SearchResult[]) {
    try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(items));
    } catch {
        /* storage disabled — recents are a convenience, not state we need */
    }
}

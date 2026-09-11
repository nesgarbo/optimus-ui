import { Doc } from '@/domain/doc';
import { AppDocCopyMarkdown } from './app.doccopymarkdown';
import { AppDocService } from './app.doc.service';
import { CommonModule, DOCUMENT, isPlatformBrowser, Location } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, effect, ElementRef, inject, input, OnInit, PLATFORM_ID, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomHandler } from '@openng/optimus-ui/dom';
import { ObjectUtils } from '@openng/optimus-ui/utils';
import { fromEvent } from 'rxjs';

interface NavEntry {
    id: string;
    label: string;
    child: boolean;
    doc: Doc;
}

const RING_RADIUS = 9;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * Section index for a documentation page.
 *
 * On wide screens it is a rail on the right: a hairline track with a single bar that
 * slides to the active entry, positioned through `--indicator-top` / `--indicator-height`
 * so only two custom properties animate.
 *
 * Below that it collapses into an island at the bottom of the viewport showing how far
 * through the page you are — a progress ring and a "section / total" counter — which
 * opens into the full index when tapped.
 */
@Component({
    selector: 'app-docsection-nav',
    standalone: true,
    imports: [CommonModule, AppDocCopyMarkdown],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <!-- Wide screens: the rail. -->
        <div class="doc-section-nav-container hidden xl:flex">
            @if (resources().length > 1) {
                <p class="doc-section-nav-title">Resources</p>

                <ul class="doc-section-nav doc-section-resources">
                    @for (resource of resources(); track resource.tab) {
                        <li class="navbar-item" [class.active-navbar-item]="activeTab() === resource.tab">
                            <div class="navbar-item-content">
                                <button type="button" (click)="selectTab(resource.tab)">
                                    {{ resource.label }}
                                    @if (resource.badge) {
                                        <span class="doc-section-resources-badge">{{ resource.badge }}</span>
                                    }
                                </button>
                            </div>
                        </li>
                    }
                    @if (componentName() || docType() === 'page') {
                        <li class="navbar-item doc-section-resources-markdown">
                            <app-doccopymarkdown [componentName]="componentName()" [docType]="docType()" [inline]="true" />
                        </li>
                    }
                </ul>
            }

            <p class="doc-section-nav-title">On this page</p>

            <div #rail class="relative">
                <span class="absolute inset-y-0 start-0 w-px bg-surface-200 dark:bg-surface-800" aria-hidden="true"></span>
                <span class="doc-section-nav-indicator w-px bg-primary" aria-hidden="true"></span>

                <ul class="doc-section-nav">
                    @for (entry of entries(); track entry.id) {
                        <li class="navbar-item" [class.active-navbar-item]="activeId() === entry.id" [class.navbar-item-child]="entry.child" [attr.data-nav-id]="entry.id">
                            <div class="navbar-item-content">
                                <button type="button" (click)="onButtonClick(entry.doc)">{{ entry.label }}</button>
                            </div>
                        </li>
                    }
                </ul>
            </div>
        </div>

        <!-- Narrow screens: the island. -->
        @if (entries().length) {
            <div class="doc-nav-island xl:hidden" [class.doc-nav-island-open]="expanded()">
                <ul id="doc-nav-island-list" class="doc-nav-island-list" [hidden]="!expanded()">
                    @if (resources().length > 1) {
                        @for (resource of resources(); track resource.tab) {
                            <li>
                                <button type="button" class="is-resource" [class.is-active]="activeTab() === resource.tab" (click)="onResourceClick(resource.tab)">
                                    {{ resource.label }}
                                    @if (resource.badge) {
                                        <span class="doc-section-resources-badge">{{ resource.badge }}</span>
                                    }
                                </button>
                            </li>
                        }
                    }
                    @for (entry of entries(); track entry.id) {
                        <li>
                            <button type="button" [class.is-active]="activeId() === entry.id" [class.is-child]="entry.child" (click)="onIslandClick(entry.doc)">
                                {{ entry.label }}
                            </button>
                        </li>
                    }
                </ul>

                <button type="button" class="doc-nav-island-trigger" (click)="expanded.set(!expanded())" [attr.aria-expanded]="expanded()" aria-controls="doc-nav-island-list">
                    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" class="doc-nav-island-ring">
                        <circle cx="11" cy="11" [attr.r]="ringRadius" fill="none" stroke-width="2" class="doc-nav-island-ring-track" />
                        <circle cx="11" cy="11" [attr.r]="ringRadius" fill="none" stroke-width="2" stroke-linecap="round" class="doc-nav-island-ring-progress" [attr.stroke-dasharray]="ringCircumference" [attr.stroke-dashoffset]="ringOffset()" />
                    </svg>
                    <span class="doc-nav-island-label">{{ activeLabel() }}</span>
                    <span class="doc-nav-island-count">{{ activeIndex() + 1 }}/{{ entries().length }}</span>
                    <i class="pi" [ngClass]="expanded() ? 'pi-chevron-down' : 'pi-chevron-up'" aria-hidden="true"></i>
                </button>
            </div>
        }
    `
})
export class AppDocSectionNav implements OnInit {
    docs = input.required<Doc[]>();

    /*
     * The rail also renders on pages that are not built from `app-doc` — the changelog is
     * one — so the page state it reads is optional and falls back to "no panels".
     */
    private readonly docService = inject(AppDocService, { optional: true });

    readonly resources = computed(() => this.docService?.resources() ?? []);

    readonly activeTab = computed(() => this.docService?.activeTab() ?? 0);

    readonly componentName = computed(() => this.docService?.componentName() ?? '');

    readonly docType = computed(() => this.docService?.docType() ?? 'component');

    activeId = signal<string | null>(null);

    expanded = signal(false);

    readonly ringRadius = RING_RADIUS;

    readonly ringCircumference = RING_CIRCUMFERENCE.toFixed(2);

    isScrollBlocked = false;

    topbarHeight = 0;

    scrollEndTimer!: ReturnType<typeof setTimeout>;

    private readonly document = inject(DOCUMENT);
    private readonly platformId = inject(PLATFORM_ID);
    private readonly location = inject(Location);
    private readonly destroyRef = inject(DestroyRef);

    private rail = viewChild<ElementRef<HTMLElement>>('rail');

    /** Headings and their children flattened, which is what both the rail and the counter walk. */
    entries = computed<NavEntry[]>(() =>
        this.docs()
            .filter((doc) => !doc.isInterface)
            .flatMap((doc) => [{ id: doc.id, label: doc.label, child: false, doc }, ...(doc.children ?? []).map((child) => ({ id: child.id, label: child.label, child: true, doc: child }))])
    );

    activeIndex = computed(() => {
        const index = this.entries().findIndex((entry) => entry.id === this.activeId());

        return index < 0 ? 0 : index;
    });

    activeLabel = computed(() => this.entries()[this.activeIndex()]?.label ?? 'On this page');

    ringOffset = computed(() => {
        const total = this.entries().length;
        const progress = total ? (this.activeIndex() + 1) / total : 0;

        return (RING_CIRCUMFERENCE * (1 - progress)).toFixed(2);
    });

    constructor() {
        // Move the rail indicator whenever the active section changes.
        effect(() => {
            this.activeId();
            this.entries();
            afterNextRenderPlacement(() => this.placeIndicator());
        });

        afterNextRender(() => this.placeIndicator());
    }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.scrollCurrentUrl();

            fromEvent(this.document, 'scroll')
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe(() => this.onScroll());
        }
    }

    private placeIndicator() {
        const rail = this.rail()?.nativeElement;
        const activeId = this.activeId();

        if (!rail || !activeId) {
            return;
        }

        // Section ids come from headings and can contain characters a selector would
        // choke on, so match on the attribute value instead of building a selector.
        const active = Array.from(rail.querySelectorAll<HTMLElement>('[data-nav-id]')).find((item) => item.dataset['navId'] === activeId);

        if (!active) {
            return;
        }

        rail.style.setProperty('--indicator-top', `${active.offsetTop}px`);
        rail.style.setProperty('--indicator-height', `${active.offsetHeight}px`);
    }

    scrollCurrentUrl() {
        const hash = window.location.hash.substring(1);
        const hasHash = ObjectUtils.isNotEmpty(hash);
        const id = hasHash ? hash : (this.docs()[0] || ({} as Doc)).id;

        this.activeId.set(id);

        if (hasHash) {
            setTimeout(() => this.scrollToLabelById(id), 250);
        }
    }

    getLabels() {
        return [...Array.from(this.document.querySelectorAll(':is(h1,h2,h3).doc-section-label'))].filter((el: any) => DomHandler.isVisible(el));
    }

    onScroll() {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        if (!this.isScrollBlocked) {
            const labels = this.getLabels();
            const windowScrollTop = DomHandler.getWindowScrollTop();

            labels.forEach((label) => {
                const { top } = DomHandler.getOffset(label);
                const threshold = this.getThreshold(label);

                if (top - threshold <= windowScrollTop) {
                    const link = DomHandler.findSingle(label, 'a');

                    this.activeId.set(link.id);
                }
            });
        }

        clearTimeout(this.scrollEndTimer);
        this.scrollEndTimer = setTimeout(() => {
            this.isScrollBlocked = false;

            const rail = this.rail()?.nativeElement;
            const activeItem = rail && DomHandler.findSingle(rail, '.active-navbar-item');

            activeItem && activeItem.scrollIntoView({ block: 'nearest', inline: 'start' });
        }, 50);
    }

    onButtonClick(doc: Doc) {
        this.activeId.set(doc.id);
        setTimeout(() => {
            this.scrollToLabelById(doc.id);
            this.isScrollBlocked = true;
        }, 1);
    }

    selectTab(tab: number) {
        this.docService?.activeTab.set(tab);
    }

    onResourceClick(tab: number) {
        this.expanded.set(false);
        this.selectTab(tab);
    }

    onIslandClick(doc: Doc) {
        this.expanded.set(false);
        this.onButtonClick(doc);
    }

    getThreshold(label: Element) {
        if (!this.topbarHeight) {
            const topbar = DomHandler.findSingle(this.document.body, '.layout-topbar');

            this.topbarHeight = topbar ? DomHandler.getHeight(topbar) : 0;
        }

        return this.topbarHeight + DomHandler.getHeight(label) * 3.5;
    }

    scrollToLabelById(id: string) {
        const label = this.document.getElementById(id);

        this.location.go(this.location.path().split('#')[0] + '#' + id);

        setTimeout(() => {
            label && label.parentElement?.scrollIntoView({ block: 'start', behavior: 'smooth' });
        }, 1);
    }
}

/** Defer to after the DOM has settled without pulling in a second render hook per call. */
function afterNextRenderPlacement(callback: () => void) {
    if (typeof requestAnimationFrame === 'undefined' || typeof document === 'undefined') {
        return;
    }

    requestAnimationFrame(callback);
}

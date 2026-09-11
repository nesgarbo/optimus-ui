import { default as MenuData } from '@/assets/data/menu.json';
import { default as Versions } from '@/assets/data/versions.json';
import { AppConfigService } from '@/service/appconfigservice';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, ElementRef, inject, OnDestroy, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { DomHandler } from '@openng/optimus-ui/dom';
import { ScrollPanelModule } from '@openng/optimus-ui/scrollpanel';
import { SelectModule } from '@openng/optimus-ui/select';
import { Subscription } from 'rxjs';
import { AppMenuItemComponent } from './app.menuitem.component';

export interface MenuItem {
    /** Set on the three roots only: which area of the site the subtree belongs to. */
    section?: string;
    name?: string;
    icon?: string;
    badge?: string;
    children?: MenuItem[];
    routerLink?: string;
    href?: string;
}

/**
 * Navigation rail, in two levels.
 *
 * The three areas of the site sit at the top and are always visible; below them is the
 * tree of the area you are in, and only that one — a component page does not carry the
 * thirty guide entries it has nothing to do with.
 */
@Component({
    selector: 'app-menu',
    template: `
        <aside>
            <nav>
                <ul class="layout-menu-categories">
                    @for (section of sections; track section.section) {
                        <li>
                            <a [routerLink]="section.routerLink" [class.active]="activeSection() === section.section" [attr.aria-current]="activeSection() === section.section ? 'true' : null">
                                <span class="menu-icon">
                                    <i [class]="section.icon"></i>
                                </span>
                                <span>{{ section.name }}</span>
                            </a>
                        </li>
                    }
                </ul>

                <p-scrollpanel styleClass="layout-menu-scrollpanel">
                    <div class="layout-menu-scroll">
                        <ol class="layout-menu">
                            @for (group of activeGroups(); track group.name) {
                                <li app-menuitem [item]="group" [root]="false"></li>
                            }
                        </ol>
                    </div>
                </p-scrollpanel>

                <!--
                    Reading an older version of the documentation is a rare thing to want, so
                    the switcher sits under the tree as a quiet line rather than in the bar.
                -->
                <div class="layout-menu-version">
                    <p-select
                        [options]="versions"
                        [(ngModel)]="selectedVersion"
                        [group]="true"
                        appendTo="body"
                        size="small"
                        ariaLabel="Documentation version"
                        (onChange)="onVersionChange($event)"
                        [pt]="{
                            root: { class: 'w-full border-0! bg-transparent! shadow-none!' },
                            label: { class: 'px-2.5! py-0! font-mono text-xs text-muted-color' },
                            dropdown: { class: 'w-auto! text-muted-color' },
                            optionGroup: { class: 'version-group' }
                        }"
                    />
                </div>
            </nav>
        </aside>
    `,
    host: {
        class: 'layout-sidebar',
        '[class.active]': 'isActive()'
    },
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, FormsModule, RouterModule, ScrollPanelModule, SelectModule, AppMenuItemComponent]
})
export class AppMenuComponent implements OnDestroy {
    readonly sections: MenuItem[] = (MenuData as { data: MenuItem[] }).data;

    private readonly configService = inject(AppConfigService);
    private readonly el = inject(ElementRef);
    private readonly router = inject(Router);
    private readonly platformId = inject(PLATFORM_ID);

    private routerSubscription: Subscription;

    /** The path drives which area is open, so a deep link lands with the right tree. */
    private url = signal(this.router.url.split('#')[0]);

    activeSection = computed(() => {
        const url = this.url();
        const match = this.sections.find((section) => contains(section, url));

        return (match ?? this.sections[0]).section;
    });

    activeGroups = computed(() => this.sections.find((section) => section.section === this.activeSection())?.children ?? []);

    isActive = computed(() => this.configService.appState().menuActive);

    readonly versions: { label: string; value: string; items: { label: string; value: string }[] }[] = Versions;

    /** The first entry is this site; picking any other one leaves for that host. */
    selectedVersion = this.versions[0].items[0].value;

    constructor() {
        this.routerSubscription = this.router.events.subscribe((event) => {
            if (!(event instanceof NavigationEnd)) {
                return;
            }

            this.url.set(event.urlAfterRedirects.split('#')[0]);

            // Navigating from the drawer closes it; on a wide screen the rail is always open.
            if (this.isActive()) {
                this.configService.hideMenu();
                DomHandler.unblockBodyScroll('blocked-scroll');
            }
        });

        afterNextRender(() => setTimeout(() => this.scrollToActiveItem(), 1));
    }

    onVersionChange(event: { value?: string }) {
        if (event?.value?.startsWith('http') && event.value !== this.versions[0].items[0].value) {
            window.location.href = event.value;
        }
    }

    scrollToActiveItem() {
        // Prerendering runs render hooks against a DOM shim that has no geometry, so
        // there is nothing to measure and nothing to scroll.
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        const activeItem = DomHandler.findSingle(this.el.nativeElement, '.layout-menu .router-link-active');
        const viewport = DomHandler.findSingle(this.el.nativeElement, '.p-scrollpanel-content');

        if (!activeItem || !viewport) {
            return;
        }

        // Centre it by moving the rail's own viewport. `scrollIntoView` would walk up to
        // the document and scroll the page past its heading.
        const offset = activeItem.getBoundingClientRect().top - viewport.getBoundingClientRect().top;

        viewport.scrollTop += offset - viewport.clientHeight / 2 + activeItem.clientHeight / 2;
    }

    ngOnDestroy() {
        this.routerSubscription?.unsubscribe();
    }
}

/** Whether a route lives anywhere under this item. */
function contains(item: MenuItem, url: string): boolean {
    if (item.routerLink === url) {
        return true;
    }

    return (item.children ?? []).some((child) => contains(child, url));
}

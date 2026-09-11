import { default as MenuData } from '@/assets/data/menu.json';
import { MenuItem } from '@/components/layout/menu/app.menu.component';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

/**
 * Where the current page sits in the navigation, derived from the same menu data the
 * rail is built from — so the trail cannot drift from the menu.
 */
@Component({
    selector: 'app-docbreadcrumb',
    standalone: true,
    imports: [CommonModule, RouterModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        @if (trail().length) {
            <nav class="mb-4 flex items-center gap-1.5 font-mono text-[11px] tracking-wide text-surface-500 uppercase dark:text-surface-400" aria-label="Breadcrumb">
                @for (crumb of trail(); track crumb.label; let last = $last) {
                    @if (crumb.routerLink && !last) {
                        <a [routerLink]="crumb.routerLink" class="transition-colors hover:text-surface-900 dark:hover:text-surface-0">{{ crumb.label }}</a>
                    } @else {
                        <span [class.text-surface-900]="last" [class.dark:text-surface-0]="last">{{ crumb.label }}</span>
                    }
                    @if (!last) {
                        <i class="pi pi-caret-right text-[10px]!" aria-hidden="true"></i>
                    }
                }
            </nav>
        }
    `
})
export class AppDocBreadcrumb {
    private router = inject(Router);

    private url = toSignal(
        this.router.events.pipe(
            filter((event): event is NavigationEnd => event instanceof NavigationEnd),
            map((event) => event.urlAfterRedirects.split('#')[0]),
            startWith(this.router.url.split('#')[0])
        ),
        { initialValue: this.router.url.split('#')[0] }
    );

    trail = computed(() => dedupe(findTrail((MenuData as { data: MenuItem[] }).data, this.url())));
}

interface Crumb {
    label: string;
    routerLink?: string;
}

/** A page inside a same-named group would read "components / button / button". */
function dedupe(trail: Crumb[]): Crumb[] {
    return trail.filter((crumb, index) => index === 0 || crumb.label !== trail[index - 1].label);
}

/**
 * The deepest match wins.
 *
 * Each of the three areas carries the route of its own first page — Components points at
 * `/autocomplete` — so matching an item before its children would end the trail at
 * "components" and lose the group and the page.
 */
function findTrail(items: MenuItem[], url: string, parents: Crumb[] = []): Crumb[] {
    for (const item of items) {
        const here: Crumb[] = [...parents, { label: item.name ?? '', routerLink: item.routerLink }];

        if (item.children) {
            const found = findTrail(item.children, url, here);

            if (found.length) {
                return found;
            }
        }

        if (item.routerLink === url) {
            return here;
        }
    }

    return [];
}

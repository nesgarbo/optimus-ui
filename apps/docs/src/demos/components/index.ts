import { default as ComponentIndex } from '@/assets/data/components.json';
import { AppTopBarComponent } from '@/components/layout/topbar/app.topbar.component';
import { FooterSectionComponent } from '@/demos/landing/footersection.component';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { PreviewCardComponent } from './previewcard.component';

interface IndexItem {
    name: string;
    routerLink: string;
    description: string;
    preview: { slug: string; symbol: string } | null;
}

interface IndexGroup {
    name: string;
    items: IndexItem[];
}

const DATA = ComponentIndex as { total: number; groups: IndexGroup[] };

/**
 * The components index: every component in the library on one page, grouped the way the
 * navigation groups them, each card previewing its own demo.
 *
 * Public chrome — the bar and the home page footer, no rail — because this is where a
 * visitor arrives from the home page, before they are reading anything in particular.
 */
@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, AppTopBarComponent, FooterSectionComponent, PreviewCardComponent],
    template: `
        <div class="landing">
            <a class="skip-link" href="#content">Skip to content</a>
            <app-topbar />

            <section id="content" class="pt-10 pb-20 sm:pt-14">
                <div class="mx-auto w-full max-w-[92rem] px-6">
                    <h1 class="mt-6! text-center text-4xl! font-normal! tracking-tighter text-surface-900 sm:mt-8! sm:text-5xl! lg:text-6xl! dark:text-surface-0">Components</h1>

                    <p class="mx-auto mt-4 max-w-172 text-center text-base text-surface-900/60 sm:text-lg lg:text-xl dark:text-surface-0/50">
                        Discover <span class="font-medium text-surface-900 dark:text-surface-0">{{ total }}+</span> MIT licensed UI components, crafted for enterprise-grade applications and equally suited for individual projects.
                    </p>

                    <!-- Toolbar -->
                    <div class="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
                        <div class="relative mx-auto flex h-10 w-full max-w-84 items-center rounded-xl bg-surface-100 sm:mx-0 sm:flex-1 dark:bg-surface-900">
                            <i class="pi pi-search absolute start-3 text-sm text-muted-color" aria-hidden="true"></i>
                            <input
                                type="search"
                                class="h-full w-full border-0 bg-transparent ps-9 pe-3 text-sm text-color outline-none placeholder:text-muted-color"
                                placeholder="Search components..."
                                aria-label="Search components"
                                autofocus
                                [ngModel]="query()"
                                (ngModelChange)="query.set($event)"
                            />
                        </div>

                        <div class="flex h-10 items-center gap-1 rounded-xl bg-surface-100 px-1 dark:bg-surface-900">
                            @for (option of densities; track option.key) {
                                <button
                                    type="button"
                                    class="size-8 rounded-lg text-muted-color transition-colors hover:text-color data-active:bg-surface-0 data-active:text-primary dark:data-active:bg-surface-950"
                                    [attr.data-active]="density() === option.key ? '' : null"
                                    [attr.aria-label]="option.label"
                                    [attr.aria-pressed]="density() === option.key"
                                    (click)="density.set(option.key)"
                                >
                                    <i [class]="option.icon" aria-hidden="true"></i>
                                </button>
                            }
                        </div>
                    </div>

                    <!-- Groups -->
                    @for (group of visibleGroups(); track group.name) {
                        <div class="mt-12">
                            <div class="mb-3 flex items-baseline gap-2">
                                <h2 class="m-0! text-xl! font-medium! text-surface-900 dark:text-surface-0">{{ group.name }}</h2>
                                <span class="font-mono text-sm text-surface-400 dark:text-surface-500">({{ group.items.length }})</span>
                            </div>

                            <div
                                class="grid grid-cols-1 gap-2 rounded-[20px] bg-surface-100 p-2 shadow-[0_0_0_0.5px_rgba(0,0,0,0.2)] min-[640px]:grid-cols-2 lg:grid-cols-3 dark:bg-surface-800/60 dark:shadow-[0_0_0_0.5px_rgba(255,255,255,0.2)]"
                                [class]="density() === 'compact' ? 'xl:grid-cols-6' : 'xl:grid-cols-4'"
                            >
                                @for (item of group.items; track item.routerLink) {
                                    <preview-card [name]="item.name" [routerLink]="item.routerLink" [description]="item.description" [previewKey]="item.preview?.slug ?? null" [compact]="density() === 'compact'" />
                                }
                            </div>
                        </div>
                    } @empty {
                        <p class="mt-16 text-center text-muted-color">No component matches "{{ query() }}".</p>
                    }
                </div>
            </section>

            <footer-section />
        </div>
    `
})
export class ComponentsIndexDemo implements OnInit {
    readonly total = DATA.total;

    readonly densities = [
        { key: 'comfortable' as const, icon: 'pi pi-th-large', label: 'Comfortable' },
        { key: 'compact' as const, icon: 'pi pi-table', label: 'Compact' }
    ];

    readonly query = signal('');

    readonly density = signal<'comfortable' | 'compact'>('comfortable');

    /** Name and description, so "picker" finds ColorPicker and "tabular" finds Table. */
    readonly visibleGroups = computed(() => {
        const query = this.query().trim().toLowerCase();

        if (!query) {
            return DATA.groups;
        }

        return DATA.groups.map((group) => ({ ...group, items: group.items.filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(query)) })).filter((group) => group.items.length);
    });

    private title = inject(Title);

    private meta = inject(Meta);

    ngOnInit() {
        this.title.setTitle('Components - Optimus UI');
        this.meta.updateTag({
            name: 'description',
            content: `Every Optimus UI component in one place: ${DATA.total}+ MIT licensed Angular components, each with a live preview and a link to its own documentation page.`
        });
    }
}

import { default as MenuData } from '@/assets/data/menu.json';
import { MenuItem } from '@/components/layout/menu/app.menu.component';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EYEBROW, HEADING, LEDE, SECTION } from './sectionshell';

/** Counted from the menu the site is built from, so the number cannot go stale. */
function countComponents(): number {
    const components = (MenuData as { data: MenuItem[] }).data.find((group) => group.section === 'components');

    const leaves = (items: MenuItem[] = []): number => items.reduce((total, item) => total + (item.children ? leaves(item.children) : 1), 0);

    return leaves(components?.children);
}

const CARD = 'group relative p-5 sm:p-6 rounded-xl border border-surface bg-surface-0 dark:bg-surface-900 hover:border-surface-300 dark:hover:border-surface-600 transition-colors no-underline';

@Component({
    selector: 'dx-section',
    standalone: true,
    imports: [CommonModule, RouterModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section [class]="section + ' border-y border-surface'" aria-labelledby="dx-heading">
            <div class="mx-auto! max-w-4xl px-6">
                <span [class]="eyebrow">Developer Experience</span>
                <h2 id="dx-heading" [class]="heading">Built for Developers</h2>
                <p [class]="lede">Modern tooling, great defaults, and no surprises.</p>

                <div class="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-6">
                    <a [routerLink]="['/autocomplete']" [class]="card">
                        <div class="flex items-baseline gap-2">
                            <span class="text-4xl font-normal tracking-tight text-surface-900 tabular-nums dark:text-surface-0">{{ componentCount }}+</span>
                            <span class="text-sm text-muted-color">components</span>
                        </div>
                        <h3 class="mt-4 text-base font-medium text-surface-900 dark:text-surface-0">{{ componentCount }}+ Components</h3>
                        <p class="mt-1 text-sm text-muted-color">From data tables and charts to dialogs, menus and file uploads.</p>
                    </a>

                    <a [routerLink]="['/philosophy']" [class]="card">
                        <pre class="overflow-x-auto rounded-lg border border-surface p-3 font-mono text-[11px] leading-relaxed text-muted-color"><code>type Severity =
  | 'success' | 'info'
  | 'warn' | 'danger';</code></pre>
                        <h3 class="mt-4 text-base font-medium text-surface-900 dark:text-surface-0">TypeScript</h3>
                        <p class="mt-1 text-sm text-muted-color">Every input, output and template ref is typed, so the editor tells you what a component accepts.</p>
                    </a>

                    <a [routerLink]="['/installation']" [class]="card">
                        <ul class="flex flex-col gap-2">
                            @for (entry of bundle; track entry.name) {
                                <li class="flex items-center gap-3">
                                    <span class="w-16 shrink-0 truncate font-mono text-[11px] text-muted-color">{{ entry.name }}</span>
                                    <span class="h-2 flex-1 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
                                        <span class="block h-full rounded-full bg-primary" [style.width.%]="entry.share"></span>
                                    </span>
                                    <span class="w-16 shrink-0 text-end font-mono text-[11px] text-surface-900 tabular-nums dark:text-surface-0">{{ entry.size }}</span>
                                </li>
                            }
                        </ul>
                        <h3 class="mt-4 text-base font-medium text-surface-900 dark:text-surface-0">Tree Shakeable</h3>
                        <p class="mt-1 text-sm text-muted-color">Every component is its own entry point, so importing one ships one. Sizes are gzipped ESM, measured on the published package.</p>
                    </a>

                    <a [routerLink]="['/configuration']" [class]="card">
                        <div class="flex flex-wrap gap-2">
                            @for (tool of buildTools; track tool) {
                                <span class="inline-flex items-center gap-1.5 rounded-lg border border-surface px-2.5 py-1 text-xs text-surface-700 dark:text-surface-300">
                                    <i class="pi pi-check-circle text-[11px] text-primary" aria-hidden="true"></i>
                                    {{ tool }}
                                </span>
                            }
                        </div>
                        <h3 class="mt-4 text-base font-medium text-surface-900 dark:text-surface-0">SSR Ready</h3>
                        <p class="mt-1 text-sm text-muted-color">No DOM access on first render, so server rendering and hydration work out of the box. This page is prerendered.</p>
                    </a>
                </div>
            </div>
        </section>
    `
})
export class DxSectionComponent {
    readonly section = SECTION;
    readonly eyebrow = EYEBROW;
    readonly heading = HEADING;
    readonly lede = LEDE;
    readonly card = CARD;

    readonly componentCount = countComponents();

    /**
     * Gzipped size of the published `fesm2022` bundle for three entry points, measured
     * with `gzip -9` over `packages/optimus-ui/dist/fesm2022/*.mjs` after `build:lib`.
     * The bar is that size relative to the largest of the three.
     */
    bundle = [
        { name: 'button', size: '8.7 kB', share: 18 },
        { name: 'dialog', size: '10.7 kB', share: 22 },
        { name: 'table', size: '48.4 kB', share: 100 }
    ];

    buildTools = ['Angular CLI', 'Analog', 'Vite', 'esbuild', 'Nx'];
}

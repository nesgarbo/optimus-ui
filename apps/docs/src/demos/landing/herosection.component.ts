import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DrawerModule } from '@openng/optimus-ui/drawer';
import { RadioButtonModule } from '@openng/optimus-ui/radiobutton';
import { HeroVersionBadgeComponent } from './heroversionbadge.component';
import { CardsApp } from './samples/cardsapp.component';
import { ChatApp } from './samples/chatapp.component';
import { CustomersApp } from './samples/customersapp.component';
import { InboxApp } from './samples/inboxapp.component';
import { MoviesApp } from './samples/moviesapp.component';
import { OverviewApp } from './samples/overviewapp.component';
import { CONTAINER } from './sectionshell';

interface SampleTab {
    key: 'overview' | 'chat' | 'inbox' | 'cards' | 'customers' | 'movies';
    label: string;
    icon: string;
}

/**
 * The first screen: what this is, where to start, and six application shells running in
 * the page. The phone alongside the window renders the same component at half scale —
 * it is the live sample, not a screenshot of one.
 */
@Component({
    selector: 'hero-section',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, DrawerModule, RadioButtonModule, HeroVersionBadgeComponent, OverviewApp, ChatApp, InboxApp, CardsApp, CustomersApp, MoviesApp],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section class="pt-16 pb-20 sm:pt-24 sm:pb-28" aria-labelledby="hero-heading">
            <div [class]="container">
                <div class="flex justify-center">
                    <hero-version-badge />
                </div>

                <h1 id="hero-heading" class="mt-10! text-center text-4xl! font-normal! tracking-tighter text-surface-900 sm:mt-16! sm:text-5xl! lg:text-6xl! dark:text-surface-0">
                    Open Source UI
                    <span class="relative inline-block">
                        <span class="absolute -inset-x-1 -inset-y-0.5 border-2 border-primary/10 bg-primary/5 sm:-inset-x-1.5 sm:-inset-y-1" aria-hidden="true"></span>
                        <span class="absolute -left-1 bottom-[calc(100%+4px)] hidden bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.09em] text-primary/70 sm:block sm:text-[10px]" aria-hidden="true">.p-title</span>
                        <span class="relative">Suite</span>
                    </span>
                    for Angular
                </h1>

                <p class="mx-auto mt-4 max-w-160 text-center text-base text-surface-900/60 sm:text-lg lg:text-xl dark:text-surface-0/50">
                    80+ accessible, customizable Angular components under the MIT license. The community-maintained continuation of PrimeNG v21, built to stay open.
                </p>

                <div class="mt-10 flex flex-wrap items-center justify-center gap-3">
                    <a
                        [routerLink]="['/installation']"
                        class="flex h-10 items-center justify-center rounded-full bg-primary px-5 text-base font-medium text-primary-contrast no-underline transition-colors hover:bg-primary-emphasis lg:h-12 lg:px-7 lg:text-lg"
                    >
                        Get Started
                    </a>
                    <a
                        [routerLink]="['/components']"
                        class="flex h-10 items-center justify-center gap-2 rounded-full border border-surface bg-surface-0 px-4 text-base text-surface-600 no-underline shadow-xs transition-colors hover:bg-surface-100 lg:h-12 lg:px-5 lg:text-lg dark:bg-surface-900 dark:text-surface-400 dark:hover:bg-surface-800"
                    >
                        <span>View Components</span>
                        <i class="pi pi-arrow-right text-xs" aria-hidden="true"></i>
                    </a>
                </div>
            </div>

            <!-- Sample applications, on a wider measure than the copy above them -->
            <div class="mx-auto w-full max-w-[92rem] px-6">
                <div class="mt-16 flex flex-wrap items-center justify-center gap-2">
                    @for (tab of tabs; track tab.key) {
                        <button
                            type="button"
                            class="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors"
                            [class]="
                                active() === tab.key
                                    ? 'border-surface-900 bg-surface-900 text-surface-0 dark:border-surface-0 dark:bg-surface-0 dark:text-surface-900'
                                    : 'border-surface text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800'
                            "
                            [attr.aria-pressed]="active() === tab.key"
                            (click)="active.set(tab.key)"
                        >
                            <i [class]="tab.icon + ' text-[11px]'" aria-hidden="true"></i>
                            <span>{{ tab.label }}</span>
                        </button>
                    }
                </div>

                <div class="relative mt-8">
                    <!-- Desktop frame -->
                    <div class="overflow-hidden rounded-xl border border-surface bg-surface-0 shadow-sm dark:bg-surface-900">
                        <div class="flex items-center gap-2 border-b border-surface px-4 py-2.5">
                            <span class="flex gap-1.5" aria-hidden="true">
                                <span class="size-2 rounded-full bg-surface-300 dark:bg-surface-700"></span>
                                <span class="size-2 rounded-full bg-surface-300 dark:bg-surface-700"></span>
                                <span class="size-2 rounded-full bg-surface-300 dark:bg-surface-700"></span>
                            </span>
                            <span class="mx-auto rounded-md bg-surface-100 px-3 py-0.5 font-mono text-[11px] text-muted-color dark:bg-surface-800">{{ activeLabel() }}</span>
                            <button type="button" class="text-muted-color transition-colors hover:text-surface-900 dark:hover:text-surface-0" aria-label="Sample settings" (click)="settingsVisible.set(true)">
                                <i class="pi pi-cog text-sm" aria-hidden="true"></i>
                            </button>
                        </div>

                        <!--
                            One height for all six samples, sized so the Overview fits with
                            the same margin top and bottom; the taller apps scroll inside the
                            window instead of stretching the page. Padding lives here too, so
                            every app sits off the frame edge by the same amount.
                        -->
                        <div class="flex h-[32rem] overflow-auto p-4 sm:p-6 lg:h-[38rem]">
                            <!--
                                The samples are application layouts: side rails, three-column
                                grids, wide tables. Below a laptop they keep their proportions
                                and the window pans instead, which reads as a desktop app on a
                                phone rather than a broken one.
                            -->
                            <div class="flex min-w-[52rem] flex-1">
                                <ng-container [ngTemplateOutlet]="sample" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Settings for the sample above -->
            <p-drawer [visible]="settingsVisible()" (visibleChange)="settingsVisible.set($event)" position="right" styleClass="max-w-xl w-full!" appendTo="body" header="Sample settings">
                <p class="text-sm text-muted-color">Every sample is a live composition of Optimus UI components.</p>

                <div class="mt-6 flex flex-col gap-3">
                    @for (tab of tabs; track tab.key) {
                        <div class="flex items-center gap-2">
                            <p-radiobutton [inputId]="'sample-' + tab.key" name="sample" [value]="tab.key" [ngModel]="active()" (ngModelChange)="active.set($event)" />
                            <label [for]="'sample-' + tab.key" class="text-sm">{{ tab.label }}</label>
                        </div>
                    }
                </div>
            </p-drawer>
        </section>

        <ng-template #sample>
            @switch (active()) {
                @case ('overview') {
                    <overview-app />
                }
                @case ('chat') {
                    <chat-app />
                }
                @case ('inbox') {
                    <inbox-app />
                }
                @case ('cards') {
                    <cards-app />
                }
                @case ('customers') {
                    <customers-app />
                }
                @case ('movies') {
                    <movies-app />
                }
            }
        </ng-template>
    `
})
export class HeroSectionComponent {
    readonly container = CONTAINER;

    tabs: SampleTab[] = [
        { key: 'overview', label: 'Overview', icon: 'pi pi-chart-bar' },
        { key: 'chat', label: 'Chat', icon: 'pi pi-comments' },
        { key: 'inbox', label: 'Inbox', icon: 'pi pi-inbox' },
        { key: 'cards', label: 'Cards', icon: 'pi pi-credit-card' },
        { key: 'customers', label: 'Customers', icon: 'pi pi-users' },
        { key: 'movies', label: 'Movies', icon: 'pi pi-video' }
    ];

    active = signal<SampleTab['key']>('overview');

    settingsVisible = signal(false);

    activeLabel = () => this.tabs.find((tab) => tab.key === this.active())?.label ?? '';
}

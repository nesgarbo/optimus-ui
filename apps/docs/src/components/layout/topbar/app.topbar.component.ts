import { AppAskAiComponent } from '@/components/layout/askai/app.askai.component';
import { AppConfiguratorComponent } from '@/components/layout/configurator/app.configurator.component';
import { AppDesignerComponent, AppDesignerService } from '@/components/layout/designer/app.designer.component';
import { AppSearchComponent, AppSearchService } from '@/components/layout/search/app.search.component';
import { AppConfigService } from '@/service/appconfigservice';
import { GITHUB_REPO_URL } from '@/utils/constants';
import { CommonModule } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, computed, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StyleClass } from '@openng/optimus-ui/styleclass';

/**
 * One 3.5rem row: the mark at the start, the controls at the end. Search, theme, the
 * theme configurator, the designer and the repository — nothing else. Navigation lives
 * in the rail, the version in the hero badge, and the rest of the links in the footer.
 */
@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [CommonModule, FormsModule, StyleClass, RouterModule, AppConfiguratorComponent, AppSearchComponent, AppAskAiComponent, AppDesignerComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="layout-topbar">
            <div class="layout-topbar-inner flex h-14 items-center justify-between">
                <a [routerLink]="['/']" class="flex items-center transition-opacity hover:opacity-70" aria-label="Optimus UI home">
                    <img src="logo.svg" width="140" height="28" style="height: 28px" class="w-auto dark:invert" alt="Optimus UI" />
                </a>

                <ul class="topbar-items">
                    <li>
                        <button type="button" class="topbar-item" aria-label="Search the documentation" title="Search (⌘K)" (click)="searchService.open()">
                            <i class="pi pi-search"></i>
                        </button>
                    </li>
                    <li>
                        <button type="button" class="topbar-item" [attr.aria-label]="isDarkMode() ? 'Switch to light theme' : 'Switch to dark theme'" (click)="toggleDarkMode()">
                            <i class="pi" [ngClass]="{ 'pi-moon': isDarkMode(), 'pi-sun': !isDarkMode() }"></i>
                        </button>
                    </li>
                    @if (showConfigurator) {
                        <li class="max-sm:static!">
                            <button
                                type="button"
                                class="topbar-item"
                                aria-label="Customize theme"
                                enterActiveClass="px-overlay-enter-active"
                                enterFromClass="hidden"
                                leaveActiveClass="px-overlay-leave-active"
                                leaveToClass="hidden"
                                pStyleClass="@next"
                                [hideOnOutsideClick]="true"
                            >
                                <i class="pi pi-palette"></i>
                            </button>
                            <app-configurator />
                        </li>
                    }
                    <li>
                        <button type="button" class="topbar-item" aria-label="Theme designer" (click)="designerService.open()">
                            <i class="pi pi-pencil"></i>
                        </button>
                    </li>
                    <li class="max-md:hidden">
                        <a [href]="githubRepoUrl" target="_blank" rel="noopener noreferrer" class="topbar-cta">
                            <span>Star on GitHub</span>
                        </a>
                    </li>
                </ul>
            </div>

            <div class="topbar-cta-mobile md:hidden">
                <a [href]="githubRepoUrl" target="_blank" rel="noopener noreferrer" class="topbar-cta">
                    <span>Star on GitHub</span>
                </a>
            </div>
        </div>

        <!--
            Outside the bar on purpose: it is backdrop-filtered, which makes it the
            containing block for anything fixed inside it — the assistant launcher has to
            be positioned against the viewport.
        -->
        <app-search />
        <app-ask-ai />
        <app-designer />
    `
})
export class AppTopBarComponent {
    @Input({ transform: booleanAttribute }) showConfigurator = true;

    readonly githubRepoUrl = GITHUB_REPO_URL;

    readonly searchService = inject(AppSearchService);

    readonly designerService = inject(AppDesignerService);

    private readonly configService = inject(AppConfigService);

    isDarkMode = computed(() => this.configService.appState().darkTheme);

    toggleDarkMode() {
        this.configService.appState.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }
}

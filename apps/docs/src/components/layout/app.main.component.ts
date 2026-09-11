import { AppConfigService } from '@/service/appconfigservice';
import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Optimus } from '@openng/optimus-ui/config';
import { DomHandler } from '@openng/optimus-ui/dom';
import { AppFooterComponent } from './footer/app.footer.component';
import { AppMenuComponent } from './menu/app.menu.component';
import { AppTopBarComponent } from './topbar/app.topbar.component';

@Component({
    selector: 'app-main',
    template: `
        <div class="layout-wrapper" [ngClass]="containerClass()">
            <a class="skip-link" href="#content">Skip to content</a>
            <!-- <app-news /> -->
            <app-topbar />
            @if (isMenuActive()) {
                <div class="layout-mask" (click)="hideMenu()" animate.enter="px-modal-enter" animate.leave="px-modal-leave"></div>
            }
            <div class="layout-content">
                <button type="button" class="layout-menu-trigger xl:hidden" (click)="showMenu()" aria-label="Open the navigation">
                    <i class="pi pi-bars" aria-hidden="true"></i>
                    <span>Menu</span>
                </button>
                <app-menu />
                <main id="content" class="layout-content-slot">
                    <router-outlet></router-outlet>
                </main>
            </div>
            <app-footer />
        </div>
    `,
    standalone: true,
    imports: [RouterOutlet, AppFooterComponent, CommonModule, AppMenuComponent, AppTopBarComponent]
})
export class AppMainComponent {
    configService: AppConfigService = inject(AppConfigService);

    config: Optimus = inject(Optimus);

    isNewsActive = computed(() => false);

    isMenuActive = computed(() => this.configService.appState().menuActive);

    containerClass = computed(() => ({
        'layout-news-active': this.isNewsActive()
    }));

    showMenu() {
        this.configService.showMenu();
        DomHandler.blockBodyScroll('blocked-scroll');
    }

    hideMenu() {
        this.configService.hideMenu();
        DomHandler.unblockBodyScroll('blocked-scroll');
    }
}

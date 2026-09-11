import { AppState } from '@/domain/appstate';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

/** Read by the pre-paint script in index.html, so the two have to agree on the key. */
const THEME_STORAGE_KEY = 'optimus-ui-theme';

@Injectable({
    providedIn: 'root'
})
export class AppConfigService {
    document = inject(DOCUMENT);

    platformId = inject(PLATFORM_ID);

    appState = signal<AppState>({
        preset: 'Aura',
        primary: 'noir',
        surface: null,
        // The pre-paint script has already decided this and put the class on <html>;
        // start from that so the first render matches what is on screen.
        darkTheme: isPlatformBrowser(this.platformId) && this.document.documentElement.classList.contains('p-dark'),
        menuActive: false,
        RTL: false
    });

    newsActive = signal(false);

    transitionComplete = signal<boolean>(false);

    darkMode = computed(() => this.appState().darkTheme);

    primaryPalette = computed(() => this.appState().primary);

    surfacePalette = computed(() => this.appState().surface);

    constructor() {
        effect(() => {
            const isDarkMode = this.darkMode();

            // Read so the effect re-runs when either palette changes.
            this.primaryPalette();
            this.surfacePalette();

            this.toggleDarkMode(isDarkMode);
            this.persistTheme(isDarkMode);
            this.onTransitionEnd();
        });
    }

    private toggleDarkMode(darkMode: boolean): void {
        if (darkMode) {
            this.document.documentElement.classList.add('p-dark');
        } else {
            this.document.documentElement.classList.remove('p-dark');
        }
    }

    private persistTheme(darkMode: boolean): void {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        try {
            localStorage.setItem(THEME_STORAGE_KEY, darkMode ? 'dark' : 'light');
        } catch (error) {
            /* storage unavailable — the choice just will not survive a reload */
        }
    }

    private onTransitionEnd() {
        this.transitionComplete.set(true);
        setTimeout(() => {
            this.transitionComplete.set(false);
        });
    }

    hideMenu() {
        this.appState.update((state) => ({
            ...state,
            menuActive: false
        }));
    }

    showMenu() {
        this.appState.update((state) => ({
            ...state,
            menuActive: true
        }));
    }

    hideNews() {
        this.newsActive.set(false);
    }

    showNews() {
        this.newsActive.set(true);
    }
}

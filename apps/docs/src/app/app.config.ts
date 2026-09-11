import { DemoCodeService } from '@/service/democodeservice';
import { HighlightService } from '@/service/highlightservice';
import Noir from '@/themes/app-theme';
import { provideFileRouter, requestContextInterceptor } from '@analogjs/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideAppInitializer, provideZonelessChangeDetection, inject } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { withInMemoryScrolling } from '@angular/router';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';
import { provideOptimus } from '@openng/optimus-ui/config';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZonelessChangeDetection(),
        /*
         * Every page is prerendered, and without this the browser threw that HTML away and
         * built the whole tree again: the reader watched the page rebuild itself, which
         * measured 0.108 of layout shift on a component page, and the markup a crawler
         * reads was replaced before anyone could interact with it. Hydration adopts the
         * prerendered DOM instead.
         *
         * Event replay stays off: it reads `window` while the injector is built, which
         * the prerender does not have, and every route fails to render with it on.
         */
        provideClientHydration(),
        provideFileRouter(withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' })),
        provideHttpClient(withFetch(), withInterceptors([requestContextInterceptor])),
        provideOptimus({
            theme: Noir,
            ripple: false
        }),
        MessageService,
        ConfirmationService,
        // Creating the highlighter up front makes every later highlight call synchronous,
        // including the ones that run while prerendering.
        provideAppInitializer(() => inject(HighlightService).load()),
        /*
         * And the snippets before the first render, so the browser hydrates the code the
         * prerender already wrote instead of filling it in a few hundred milliseconds
         * later - which moved everything below it down the page.
         */
        provideAppInitializer(() => inject(DemoCodeService).loadDemos())
    ]
};

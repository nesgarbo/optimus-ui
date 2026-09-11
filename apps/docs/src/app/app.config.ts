import { HighlightService } from '@/service/highlightservice';
import Noir from '@/themes/app-theme';
import { provideFileRouter, requestContextInterceptor } from '@analogjs/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideAppInitializer, provideZonelessChangeDetection, inject } from '@angular/core';
import { withInMemoryScrolling } from '@angular/router';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';
import { provideOptimus } from '@openng/optimus-ui/config';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZonelessChangeDetection(),
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
        provideAppInitializer(() => inject(HighlightService).load())
    ]
};

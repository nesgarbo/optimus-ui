import { DOCUMENT } from '@angular/common';
import { DestroyRef, inject } from '@angular/core';

/**
 * Loads a stylesheet only while the calling page is alive.
 *
 * The CSS of the map and of the spreadsheet is big and only their own pages need it, so it is built
 * as a separate file (`inject: false` in `angular.json`) instead of going into the global styles.
 * The link is a real element, so it is also in the server-rendered HTML and there is no flash.
 *
 * Call it in a field initializer or the constructor.
 */
export function usePageStyle(href: string): void {
    const document = inject(DOCUMENT);
    const link = document.createElement('link');

    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute('data-page-style', href);
    document.head.appendChild(link);
    inject(DestroyRef).onDestroy(() => link.remove());
}

/*
 * Angular reads a global `ngServerMode` to tell which half of a dual-build it is running
 * in. The Angular CLI writes it into its own server bundle; nothing does here, so the
 * framework took the prerender for a browser and reached for `window` while building the
 * injector - which hydration's providers do, so no route rendered at all.
 *
 * It lives in its own module because the flag has to be set before any Angular code runs,
 * and an import is evaluated before the body of the file that imports it. Importing this
 * first in the server entry is what makes that order explicit.
 */
(globalThis as unknown as { ngServerMode?: boolean }).ngServerMode = true;

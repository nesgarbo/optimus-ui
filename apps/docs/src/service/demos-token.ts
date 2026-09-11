import { InjectionToken } from '@angular/core';
import { DemosJson } from '@/domain/democode';

/**
 * The extracted demo sources, handed to the application by whoever can read them without
 * a request. The prerender provides it from disk; in the browser it stays null and the
 * service fetches the file instead.
 */
export const DEMOS_JSON = new InjectionToken<DemosJson | null>('DEMOS_JSON', {
    providedIn: 'root',
    factory: () => null
});

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inlineCriticalCss } from './critical-css.mjs';

/**
 * Runs after `vite build`, once Nitro has finished prerendering. Doing this as a
 * separate step (rather than a Vite hook) is what guarantees the HTML files exist:
 * prerendering happens after every environment's bundle is closed.
 */
const here = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(here, '..', 'dist', 'analog', 'public');

const pages = await inlineCriticalCss(output);

console.log(pages > 0 ? `✓ Inlined critical CSS into ${pages} prerendered pages` : '! No prerendered pages found — skipped critical CSS');

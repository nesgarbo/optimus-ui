import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const pagesDir = path.join(here, '..', 'src', 'app', 'pages');

/**
 * Walk the Analog file-router tree and turn every .page.ts into the URL it serves.
 * Pathless groups — the (docs) shell — contribute no segment, and the layout file
 * that names them is not a route. Redirect pages are skipped: prerendering one
 * would freeze a 302 into a static file.
 */
export function docsRoutes(dir = pagesDir, prefix = '') {
    const routes = [];

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            const segment = /^\(.*\)$/.test(entry.name) ? prefix : `${prefix}/${entry.name}`;
            routes.push(...docsRoutes(full, segment));
            continue;
        }

        if (!entry.name.endsWith('.page.ts')) continue;
        if (fs.readFileSync(full, 'utf8').includes('redirectTo')) continue;

        const name = entry.name.replace('.page.ts', '');
        // `[...]` catch-alls have no URL of their own; `(name)` files are layouts, not routes.
        if (name.startsWith('[') || /^\(.*\)$/.test(name)) continue;
        routes.push(name === 'index' ? prefix || '/' : `${prefix}/${name}`);
    }

    return routes;
}

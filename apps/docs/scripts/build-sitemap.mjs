/**
 * Generates public/sitemap.xml from the file-based routes under src/app/pages,
 * so the sitemap cannot list a route the site does not serve.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { docsRoutes } from './prerender-routes.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'public/sitemap.xml');

const SITE_URL = 'https://optimus.openng.org';

/** Landing page first, then guides, then everything else. */
function priorityOf(route) {
    if (route === '/') return '1.0';
    if (route === '/installation') return '0.9';
    if (route.startsWith('/guides/') || route.startsWith('/theming/') || route.startsWith('/migration/')) return '0.8';
    return '0.7';
}

const routes = docsRoutes().sort();

const urls = routes.map((route) => `    <url>\n        <loc>${SITE_URL}${route === '/' ? '/' : route}</loc>\n        <priority>${priorityOf(route)}</priority>\n    </url>`).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

fs.writeFileSync(OUTPUT, xml, 'utf-8');
console.log(`✓ Generated ${path.relative(ROOT, OUTPUT)} with ${routes.length} urls`);

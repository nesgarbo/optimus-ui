/**
 * Generates public/sitemap.xml from the file-based routes under src/app/pages,
 * so the sitemap cannot list a route the site does not serve.
 */
import { execFileSync } from 'child_process';
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

const BUILT_AT = new Date().toISOString().slice(0, 10);

/**
 * What a page is made of: its route file, its demo and its sections. The newest commit
 * touching any of them is when the page last changed, which is what `lastmod` claims -
 * the one hint in a sitemap that search engines actually read. Outside a git checkout, or
 * in a clone too shallow to have the history, the build date stands in.
 */
function sourcesOf(route) {
    const name = route === '/' ? 'index' : route.replace(/^\//, '');
    const candidates = [path.join(ROOT, 'src/app/pages/(docs)', `${name}.page.ts`), path.join(ROOT, 'src/app/pages', `${name}.page.ts`), path.join(ROOT, 'src/demos', name), path.join(ROOT, 'src/doc', name)];

    return candidates.filter((candidate) => fs.existsSync(candidate));
}

function lastModifiedOf(route) {
    const sources = sourcesOf(route);

    if (!sources.length) return BUILT_AT;

    try {
        const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...sources], { cwd: ROOT, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

        return out || BUILT_AT;
    } catch {
        return BUILT_AT;
    }
}

const routes = docsRoutes().sort();

const urls = routes.map((route) => `    <url>\n        <loc>${SITE_URL}${route === '/' ? '/' : route}</loc>\n        <lastmod>${lastModifiedOf(route)}</lastmod>\n        <priority>${priorityOf(route)}</priority>\n    </url>`).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

fs.writeFileSync(OUTPUT, xml, 'utf-8');
console.log(`✓ Generated ${path.relative(ROOT, OUTPUT)} with ${routes.length} urls`);

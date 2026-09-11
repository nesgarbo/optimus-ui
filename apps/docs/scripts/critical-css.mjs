import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Post-processes the prerendered HTML: inlines the CSS each page actually needs and
 * defers the full stylesheet, so a page paints from its own <style> block instead of
 * waiting on a render-blocking request.
 */
export async function inlineCriticalCss(outputDir) {
    const { default: Beasties } = await import('beasties');

    const pages = await htmlFiles(outputDir);

    if (pages.length === 0) {
        return 0;
    }

    const beasties = new Beasties({
        path: outputDir,
        publicPath: '/',
        // Keep the stylesheet, but let it load after paint (see deferStylesheets below).
        preload: 'media',
        pruneSource: false,
        inlineFonts: false,
        preloadFonts: false,
        logLevel: 'silent'
    });

    for (const page of pages) {
        const html = await fs.readFile(page, 'utf-8');
        const processed = deferStylesheets(await beasties.process(html));
        await fs.writeFile(page, processed, 'utf-8');
    }

    return pages.length;
}

/**
 * Beasties' own `media` preload still leaves a blocking <link>. Swap any remaining
 * local stylesheet to `media="print"` and promote it once it has loaded.
 */
function deferStylesheets(html) {
    return html.replace(/<link([^>]*?)rel="stylesheet"([^>]*?)>/g, (tag, before, after) => {
        if (tag.includes('media=') || /href="https?:/.test(tag)) {
            return tag;
        }

        return `<link${before}rel="stylesheet"${after} media="print" onload="this.media='all'">`;
    });
}

async function htmlFiles(dir) {
    const found = [];

    async function walk(current) {
        let entries;

        try {
            entries = await fs.readdir(current, { withFileTypes: true });
        } catch {
            return;
        }

        for (const entry of entries) {
            const full = path.join(current, entry.name);

            if (entry.isDirectory()) {
                await walk(full);
            } else if (entry.name.endsWith('.html')) {
                found.push(full);
            }
        }
    }

    await walk(dir);

    return found;
}

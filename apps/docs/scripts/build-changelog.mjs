/**
 * Fetches the releases from GitHub and writes them into the app as data, so the changelog
 * page ships its content in the prerendered HTML instead of appearing after a request in
 * the browser. Run it before a build; the output is committed like the component index.
 *
 * `GITHUB_TOKEN` is used when present, purely to raise the anonymous rate limit.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const here = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(here, '..', 'src/assets/data/changelog.json');

const ENDPOINT = 'https://api.github.com/repos/openng-org/optimus-ui/releases?per_page=30';

const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'optimus-ui-docs' };

if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
}

const response = await fetch(ENDPOINT, { headers });

if (!response.ok) {
    // A build must not fail because GitHub is unreachable: keep whatever we had.
    console.warn(`! Releases could not be read (${response.status}); keeping the existing changelog.json`);
    process.exit(0);
}

const payload = await response.json();

const releases = payload
    .filter((release) => !release.draft)
    .map((release) => ({
        id: `release-${release.tag_name.replace(/[^\w.-]/g, '')}`,
        version: release.name?.trim() || release.tag_name,
        date: new Date(release.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        url: release.html_url,
        body: marked.parse(release.body ?? '', { async: false })
    }));

fs.writeFileSync(output, JSON.stringify({ generatedAt: new Date().toISOString(), releases }, null, 4) + '\n');
console.log(`✓ Wrote ${releases.length} releases to ${path.relative(path.resolve(here, '..'), output)}`);

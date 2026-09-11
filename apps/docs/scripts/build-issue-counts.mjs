/**
 * Counts the open issues per component label and writes them into the app as data.
 *
 * The component pages used to read this from the GitHub search API in the browser: one
 * request per page view, unauthenticated, against an endpoint that allows ten a minute —
 * and nothing at all in the prerendered HTML. Reading it at build time instead costs a
 * couple of requests for the whole site, renders the panel server-side, and leaves the
 * page making no request of its own.
 *
 * `GITHUB_TOKEN` is used when present, purely to raise the anonymous rate limit.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(here, '..', 'src/assets/data/issues.json');

const REPO = 'openng-org/optimus-ui';
const LABEL_PREFIX = 'Component: ';
const PER_PAGE = 100;
const MAX_PAGES = 10;

const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'optimus-ui-docs' };

if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
}

const counts = {};

for (let page = 1; page <= MAX_PAGES; page++) {
    const response = await fetch(`https://api.github.com/repos/${REPO}/issues?state=open&per_page=${PER_PAGE}&page=${page}`, { headers });

    if (!response.ok) {
        // A build must not fail because GitHub is unreachable: keep whatever we had.
        console.warn(`! Open issues could not be read (${response.status}); keeping the existing issues.json`);
        process.exit(0);
    }

    const payload = await response.json();

    if (!Array.isArray(payload) || !payload.length) {
        break;
    }

    for (const issue of payload) {
        // Pull requests come back from this endpoint too, and are not issues.
        if (issue.pull_request) {
            continue;
        }

        for (const label of issue.labels ?? []) {
            const name = typeof label === 'string' ? label : label.name;

            if (name?.startsWith(LABEL_PREFIX)) {
                const component = name.slice(LABEL_PREFIX.length).trim();

                counts[component] = (counts[component] ?? 0) + 1;
            }
        }
    }

    if (payload.length < PER_PAGE) {
        break;
    }
}

const sorted = Object.fromEntries(
    Object.keys(counts)
        .sort()
        .map((key) => [key, counts[key]])
);

fs.writeFileSync(output, JSON.stringify({ generatedAt: new Date().toISOString(), counts: sorted }, null, 4) + '\n');

console.log(`✓ Open issues per component written to src/assets/data/issues.json (${Object.keys(sorted).length} labelled)`);

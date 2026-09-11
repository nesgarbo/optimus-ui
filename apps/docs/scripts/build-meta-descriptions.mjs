/**
 * Writes a `metaDescription` on every documentation page.
 *
 * The visible subtitle under a page's heading is one short line, which makes a poor search
 * result: a description of 60 characters wastes most of the space Google gives it. This
 * composes a longer one from what the page itself contains — its own summary plus the
 * examples it ships — so every page gets a distinct, factual description without anyone
 * writing 100 of them by hand.
 *
 * Run with `node scripts/build-meta-descriptions.mjs`. It only touches pages that have no
 * `metaDescription` yet, so a hand-written one is never overwritten.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const demos = path.resolve(here, '..', 'src/demos');

const LIMIT = 158;

/** Sections that are page furniture rather than something a reader searches for. */
const SKIP = new Set(['import', 'accessibility', 'usage', 'examples']);

function labelsOf(source) {
    const start = source.indexOf('docs = [');

    if (start === -1) {
        return [];
    }

    const body = source.slice(start);
    const labels = [];
    const ids = [...body.matchAll(/id:\s*'([^']+)',\s*\n\s*label:\s*'([^']+)'/g)];

    for (const [, id, label] of ids) {
        if (!SKIP.has(id)) {
            labels.push(label);
        }
    }

    return labels;
}

function compose(summary, labels) {
    if (!labels.length) {
        return summary;
    }

    // Add examples one at a time and stop before the sentence would be cut in a result.
    const picked = [];

    for (const label of labels) {
        const candidate = [...picked, label];
        const sentence = `${summary} Examples cover ${list(candidate)}.`;

        if (sentence.length > LIMIT) {
            break;
        }

        picked.push(label);
    }

    return picked.length ? `${summary} Examples cover ${list(picked)}.` : summary;
}

function list(items) {
    if (items.length === 1) {
        return items[0].toLowerCase();
    }

    const lowered = items.map((item) => item.toLowerCase());

    return `${lowered.slice(0, -1).join(', ')} and ${lowered[lowered.length - 1]}`;
}

let written = 0;
let skipped = 0;

for (const slug of fs.readdirSync(demos)) {
    const file = path.join(demos, slug, 'index.ts');

    if (!fs.existsSync(file)) {
        continue;
    }

    const source = fs.readFileSync(file, 'utf8');

    if (source.includes('metaDescription')) {
        skipped++;
        continue;
    }

    const summaryMatch = source.match(/description="([^"]+)"/);

    if (!summaryMatch) {
        continue;
    }

    const summary = summaryMatch[1].replace(/\s+/g, ' ').trim();
    const meta = compose(summary, labelsOf(source));

    if (meta === summary) {
        // Nothing to add: the page has no examples of its own.
        skipped++;
        continue;
    }

    const patched = source.replace(summaryMatch[0], `${summaryMatch[0]}\n            metaDescription="${meta}"`);

    fs.writeFileSync(file, patched);
    written++;
}

console.log(`✓ ${written} pages given a metaDescription, ${skipped} left alone`);

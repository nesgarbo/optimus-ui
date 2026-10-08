const TAG_START = /<p-(?:autocomplete|auto-complete)\b/gi;
const MIN_LENGTH_ATTRIBUTE = /(\s\[?)minLength(\]?\s*=)/g;

/** Index of the `>` that closes the tag opened before `from`, skipping `>` inside quoted values (`=>`), or -1. */
function findTagEnd(text: string, from: number): number {
    let quote: string | null = null;

    for (let i = from; i < text.length; i++) {
        const char = text[i];

        if (quote) {
            if (char === quote) quote = null;
        } else if (char === '"' || char === "'") {
            quote = char;
        } else if (char === '>') {
            return i;
        }
    }

    return -1;
}

/** Renames the `minLength` and `[minLength]` attributes of every `p-autocomplete` tag to `minQueryLength`. */
export function rewriteAutoCompleteTags(text: string): { text: string; changed: boolean } {
    let result = '';
    let last = 0;
    let changed = false;

    TAG_START.lastIndex = 0;

    for (let match = TAG_START.exec(text); match; match = TAG_START.exec(text)) {
        const end = findTagEnd(text, match.index + match[0].length);

        if (end < 0) break;

        const tag = text.slice(match.index, end);
        const next = tag.replace(MIN_LENGTH_ATTRIBUTE, '$1minQueryLength$2');

        if (next !== tag) {
            result += text.slice(last, match.index) + next;
            last = end;
            changed = true;
        }

        TAG_START.lastIndex = end;
    }

    return { text: changed ? result + text.slice(last) : text, changed };
}

import type { MentionFields, MentionOption, MentionSearchPattern } from '@openng/optimus-ui/types/mention';

/**
 * Finding a mention being typed, narrowing the list to it, and writing the pick back into the text.
 *
 * Pure: the component reads the caret out of the DOM and hands the text over.
 *
 * @module mention-engine
 */

/** A mention in progress: `@jo` from `start` (the mention character) to `end` (the caret). */
export interface MentionMatch {
    start: number;
    end: number;
    query: string;
}

/** Options of {@link findMention}. */
export interface FindMentionOptions {
    mentionChar: string;
    /** The query may contain spaces. */
    allowSpaces?: boolean;
    /** Fewest characters after the mention character before the list opens. */
    minLength?: number;
    /** The mention character must start the text or follow whitespace. Default `true`. */
    requireLeadingSpace?: boolean;
}

/** The mention the caret is inside, or `null`. */
export function findMention(text: string, caret: number, options: FindMentionOptions): MentionMatch | null {
    const { mentionChar, allowSpaces = false, minLength = 0, requireLeadingSpace = true } = options;

    if (!mentionChar || caret < 0 || caret > text.length) return null;

    for (let i = caret - mentionChar.length; i >= 0; i--) {
        if (text.startsWith(mentionChar, i)) {
            if (requireLeadingSpace && i > 0 && !/\s/.test(text[i - 1])) return null;

            const query = text.slice(i + mentionChar.length, caret);

            if (/[\n\r]/.test(query) || (!allowSpaces && /\s/.test(query))) return null;

            return query.length >= minLength ? { start: i, end: caret, query } : null;
        }

        const ch = text[i];

        if (ch === '\n' || ch === '\r' || (!allowSpaces && /\s/.test(ch))) return null;
    }

    return null;
}

const read = (item: any, key: string | undefined) => (key && item !== null && typeof item === 'object' ? item[key] : undefined);

/** The text of an item. */
export function itemText(item: any, fields?: MentionFields): string {
    if (item === null || item === undefined) return '';
    if (typeof item !== 'object') return String(item);

    return String(read(item, fields?.text ?? 'text') ?? '');
}

/** The value of an item. */
export function itemValue(item: any, fields?: MentionFields): any {
    return typeof item === 'object' && item !== null ? (read(item, fields?.value) ?? itemText(item, fields)) : item;
}

/** Options of {@link filterItems}. */
export interface FilterOptions {
    fields?: MentionFields;
    ignoreCase?: boolean;
    pattern?: MentionSearchPattern;
    /** Most items kept. */
    limit?: number;
    sort?: 'none' | 'ascending' | 'descending';
}

/** The items that match `query`, in order, trimmed to `limit`. */
export function filterItems(items: any[], query: string, options: FilterOptions = {}): any[] {
    const { fields, ignoreCase = true, pattern = 'startsWith', limit = 25, sort = 'none' } = options;
    const fold = (s: string) => (ignoreCase ? s.toLocaleLowerCase() : s);
    const needle = fold(query);

    let result = (items ?? []).filter((item) => {
        if (!needle) return true;

        const text = fold(itemText(item, fields));

        return pattern === 'contains' ? text.includes(needle) : pattern === 'endsWith' ? text.endsWith(needle) : text.startsWith(needle);
    });

    if (sort !== 'none') {
        result = result.slice().sort((a, b) => (sort === 'ascending' ? 1 : -1) * itemText(a, fields).localeCompare(itemText(b, fields)));
    }

    return limit > 0 ? result.slice(0, limit) : result;
}

/** The rows of the list, with the group each one sits under. Rows of one group are kept together, in first-seen order. */
export function toOptions(items: any[], fields?: MentionFields): MentionOption[] {
    const rows = items.map((item) => ({
        item,
        text: itemText(item, fields),
        value: itemValue(item, fields),
        iconCss: read(item, fields?.iconCss) as string | undefined,
        group: read(item, fields?.groupBy) as string | undefined,
        disabled: !!read(item, fields?.disabled)
    }));

    if (fields?.groupBy) {
        const order = [...new Set(rows.map((r) => r.group ?? ''))];

        rows.sort((a, b) => order.indexOf(a.group ?? '') - order.indexOf(b.group ?? ''));
    }

    return rows.map((row, index) => ({ ...row, index }));
}

/** The index of the next row that can be picked, wrapping around; -1 when none can. */
export function stepActive(options: MentionOption[], from: number, direction: 1 | -1): number {
    const n = options.length;

    for (let k = 1; k <= n; k++) {
        const i = (((from + direction * k) % n) + n) % n;

        if (!options[i].disabled) return i;
    }

    return -1;
}

/** The text with the mention replaced by `insertion`, and where the caret goes. */
export function replaceMention(text: string, match: MentionMatch, insertion: string, trailing = ' '): { text: string; caret: number } {
    const before = text.slice(0, match.start);
    let after = text.slice(match.end);

    // Typing after a pick should not leave two spaces.
    if (trailing && after.startsWith(trailing)) after = after.slice(trailing.length);

    return { text: `${before}${insertion}${trailing}${after}`, caret: before.length + insertion.length + trailing.length };
}

/** Every mention in `text`, for a consumer that wants them back out of a plain-text value. */
export function extractMentions(text: string, mentionChar: string, names: string[]): string[] {
    const found: string[] = [];
    const sorted = names.slice().sort((a, b) => b.length - a.length);
    const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    for (const name of sorted) {
        const re = new RegExp(`(^|\\s)${escape(mentionChar + name)}(?=$|[\\s.,;:!?])`, 'g');

        if (re.test(text)) found.push(name);
    }

    return found;
}

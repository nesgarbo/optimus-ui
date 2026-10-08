/**
 * The blocks of the slash menu, and the helpers around them. Nothing here needs the editor to be running.
 *
 * @module block-commands
 */
import type { BlockCommand } from '@openng/optimus-ui/types/blockeditor';

/** The entries the slash menu starts with. */
export const DEFAULT_BLOCK_COMMANDS: BlockCommand[] = [
    { id: 'paragraph', label: 'Text', description: 'Plain text', icon: 'T', keywords: ['paragraph', 'p', 'plain'] },
    { id: 'heading1', label: 'Heading 1', description: 'Big section title', icon: 'H1', keywords: ['h1', 'title', 'header'] },
    { id: 'heading2', label: 'Heading 2', description: 'Medium section title', icon: 'H2', keywords: ['h2', 'subtitle', 'header'] },
    { id: 'heading3', label: 'Heading 3', description: 'Small section title', icon: 'H3', keywords: ['h3', 'header'] },
    { id: 'bulletList', label: 'Bulleted list', description: 'A list with bullets', icon: '•', keywords: ['ul', 'unordered', 'list'] },
    { id: 'orderedList', label: 'Numbered list', description: 'A list with numbers', icon: '1.', keywords: ['ol', 'ordered', 'list'] },
    { id: 'taskList', label: 'To-do list', description: 'Track tasks with check boxes', icon: '☑', keywords: ['todo', 'task', 'checkbox', 'checklist'] },
    { id: 'blockquote', label: 'Quote', description: 'Set a quotation apart', icon: '“', keywords: ['quote', 'citation'] },
    { id: 'codeBlock', label: 'Code', description: 'A block of code', icon: '</>', keywords: ['pre', 'snippet', 'code'] },
    { id: 'divider', label: 'Divider', description: 'A line between sections', icon: '—', keywords: ['hr', 'rule', 'separator', 'line'] },
    { id: 'image', label: 'Image', description: 'Upload a picture', icon: '🖼', keywords: ['picture', 'photo', 'upload'] }
];

/** The entries that match what was typed after the `/`: in the label first, then in the words that find it. */
export function filterCommands(commands: readonly BlockCommand[], query: string): BlockCommand[] {
    const q = query.trim().toLowerCase();

    if (!q) return [...commands];

    const rank = (c: BlockCommand): number => {
        const label = c.label.toLowerCase();

        if (label.startsWith(q)) return 0;
        if (label.split(/\s+/).some((w) => w.startsWith(q))) return 1;
        if (c.keywords?.some((k) => k.toLowerCase().startsWith(q))) return 2;
        if (label.includes(q) || c.keywords?.some((k) => k.toLowerCase().includes(q))) return 3;

        return -1;
    };

    return commands
        .map((c, i) => ({ c, i, r: rank(c) }))
        .filter((x) => x.r >= 0)
        .sort((a, b) => a.r - b.r || a.i - b.i)
        .map((x) => x.c);
}

/** Moves a position in a list of items to the next or the previous one, going round at the ends. */
export function stepIndex(index: number, count: number, by: 1 | -1): number {
    return count <= 0 ? 0 : (index + by + count) % count;
}

/** Whether a string is something a link can point at: a web address, a mail address or a path. Anything else is not turned into a link. */
export function normalizeUrl(input: string): string | null {
    const text = input.trim();

    if (!text) return null;
    if (/^(https?:|mailto:|tel:)/i.test(text)) return text;
    if (/^[\w.+-]+@[\w-]+(\.[\w-]+)+$/.test(text)) return `mailto:${text}`;
    // A path starts with one slash: `//host` and `/\host` are addresses of another site that borrow the scheme of the page.
    if (/^(\/(?![\/\\])|#|\.\/)/.test(text)) return text;
    // A bare address such as `example.com/page` gets a scheme.
    if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(text)) return `https://${text}`;

    return null;
}

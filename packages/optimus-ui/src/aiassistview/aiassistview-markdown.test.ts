import { describe, expect, it } from 'vitest';
import { blocksToPlainText, renderMarkdown, splitMarkdownBlocks } from './aiassistview-markdown';

// The renderer is the one piece of this component that turns model output into markup, so it is the
// one piece where a mistake is a security bug rather than a layout bug. What these protect:
//   - that nothing an answer contains can become markup the renderer did not put there,
//   - that a `javascript:` href never survives into an anchor,
//   - that the block splitter handles the half-written fence a stream spends most of its time in,
//   - that the prose subset a model actually emits round-trips.

describe('renderMarkdown', () => {
    it('escapes markup before any rule runs', () => {
        const html = renderMarkdown('<img src=x onerror=alert(1)>');

        expect(html).not.toContain('<img');
        expect(html).toContain('&lt;img');
    });

    it('escapes markup inside a code span', () => {
        const html = renderMarkdown('use `<script>alert(1)</script>` carefully');

        expect(html).toContain('<code>&lt;script&gt;');
        expect(html).not.toContain('<script>');
    });

    it('refuses a javascript: link and leaves the source visible', () => {
        const html = renderMarkdown('[click](javascript:alert(1))');

        expect(html).not.toContain('href');
        expect(html).toContain('[click]');
    });

    it('keeps an http link, and opens it safely', () => {
        const html = renderMarkdown('[docs](https://openng.org)');

        expect(html).toContain('href="https://openng.org"');
        expect(html).toContain('rel="noopener noreferrer"');
    });

    it('renders headings, emphasis, lists and quotes', () => {
        const html = renderMarkdown('# Title\n\nSome **bold** and *italic*.\n\n- one\n- two\n\n> quoted');

        expect(html).toContain('<h1>Title</h1>');
        expect(html).toContain('<strong>bold</strong>');
        expect(html).toContain('<em>italic</em>');
        expect(html).toContain('<ul><li>one</li><li>two</li></ul>');
        expect(html).toContain('<blockquote><p>quoted</p></blockquote>');
    });

    it('renders a table with its alignments', () => {
        const html = renderMarkdown('| a | b |\n| :-- | --: |\n| 1 | 2 |');

        expect(html).toContain('<table>');
        expect(html).toContain('style="text-align:left"');
        expect(html).toContain('style="text-align:right"');
        expect(html).toContain('<td style="text-align:left">1</td>');
    });

    it('renders a task list', () => {
        const html = renderMarkdown('- [x] done\n- [ ] pending');

        expect(html).toContain('type="checkbox" disabled checked');
        expect(html).toContain('type="checkbox" disabled />');
    });

    it('keeps a generated href out of reach of the emphasis rules', () => {
        const html = renderMarkdown('see [docs](https://host/my_file_latest) now');

        expect(html).toContain('href="https://host/my_file_latest"');
        expect(html).not.toContain('<em>file</em>');
    });

    it('still emphasises the label of a link', () => {
        expect(renderMarkdown('[**bold**](https://a.dev)')).toContain('<strong>bold</strong>');
    });

    it('refuses a remote image until it is allowed, and leaves it as text', () => {
        const blocked = renderMarkdown('![x](https://host/a.png)');

        expect(blocked).not.toContain('<img');
        // Not half-swallowed by the link rule either.
        expect(blocked).toContain('![x](https://host/a.png)');
        expect(renderMarkdown('![x](https://host/a.png)', { allowRemoteImages: true })).toContain('<img src="https://host/a.png"');
    });

    it('renders a same-origin image without being asked', () => {
        expect(renderMarkdown('![x](/local.png)')).toContain('<img src="/local.png"');
    });

    it('leaves an empty answer empty', () => {
        expect(renderMarkdown('')).toBe('');
    });
});

describe('splitMarkdownBlocks', () => {
    it('lifts a fenced sample out of the prose around it', () => {
        const blocks = splitMarkdownBlocks('Before\n\n```ts\nconst a = 1;\n```\n\nAfter');

        expect(blocks.map((block) => block.blockType)).toEqual(['text', 'code', 'text']);
        expect(blocks[1]).toMatchObject({ blockType: 'code', language: 'ts', content: 'const a = 1;', streaming: false });
    });

    it('reads a file name out of the info string', () => {
        const blocks = splitMarkdownBlocks('```ts:app.component.ts\nconst a = 1;\n```');

        expect(blocks[0]).toMatchObject({ language: 'ts', fileName: 'app.component.ts' });
    });

    it('marks an unterminated fence as still streaming', () => {
        const blocks = splitMarkdownBlocks('Here:\n\n```ts\nconst a = ');

        expect(blocks.at(-1)).toMatchObject({ blockType: 'code', streaming: true });
    });

    it('does not call a fence terminated by backticks inside a line', () => {
        const blocks = splitMarkdownBlocks('```ts\nvalue = ```');

        expect(blocks.at(-1)).toMatchObject({ blockType: 'code', streaming: true });
    });

    it('returns nothing for an empty answer', () => {
        expect(splitMarkdownBlocks('')).toEqual([]);
    });
});

describe('blocksToPlainText', () => {
    it('joins the readable blocks and leaves the reasoning out', () => {
        const text = blocksToPlainText([
            { blockType: 'text', content: 'One' },
            { blockType: 'thinking', stages: [{ content: 'secret' }] },
            { blockType: 'code', content: 'two()' }
        ]);

        expect(text).toBe('One\n\ntwo()');
    });

    it('falls back to the plain answer when there are no blocks', () => {
        expect(blocksToPlainText(undefined, 'plain')).toBe('plain');
    });
});

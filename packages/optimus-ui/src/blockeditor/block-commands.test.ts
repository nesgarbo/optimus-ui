import { describe, expect, it } from 'vitest';
import { DEFAULT_BLOCK_COMMANDS, filterCommands, normalizeUrl, stepIndex } from './block-commands';

describe('slash menu entries', () => {
    const ids = (q: string) => filterCommands(DEFAULT_BLOCK_COMMANDS, q).map((c) => c.id);

    it('shows everything for nothing typed', () => {
        expect(ids('')).toHaveLength(DEFAULT_BLOCK_COMMANDS.length);
        expect(ids('   ')).toHaveLength(DEFAULT_BLOCK_COMMANDS.length);
    });

    it('puts a label that starts with the query before a word that does, and before a keyword', () => {
        expect(ids('head').slice(0, 3)).toEqual(['heading1', 'heading2', 'heading3']);
        // "list" starts the label of the numbered and the bulleted lists' second word, and is a keyword of the to-do list.
        expect(ids('list')).toEqual(['bulletList', 'orderedList', 'taskList']);
    });

    it('finds an entry by a keyword it does not have in its label', () => {
        expect(ids('todo')).toEqual(['taskList']);
        expect(ids('hr')).toEqual(['divider']);
        expect(ids('h2')).toEqual(['heading2']);
    });

    it('finds a match inside a word too, after the better ones', () => {
        expect(ids('ode')).toEqual(['codeBlock']);
    });

    it('is not case sensitive and finds nothing for nonsense', () => {
        expect(ids('IMAGE')).toEqual(['image']);
        expect(ids('zzzz')).toEqual([]);
    });
});

describe('stepping through the menu', () => {
    it('goes round at both ends', () => {
        expect(stepIndex(0, 3, -1)).toBe(2);
        expect(stepIndex(2, 3, 1)).toBe(0);
        expect(stepIndex(1, 3, 1)).toBe(2);
        expect(stepIndex(0, 0, 1)).toBe(0);
    });
});

describe('link addresses', () => {
    it('keeps what already has a scheme, and adds one to a bare address', () => {
        expect(normalizeUrl('https://a.dev/x')).toBe('https://a.dev/x');
        expect(normalizeUrl('  HTTP://A.dev ')).toBe('HTTP://A.dev');
        expect(normalizeUrl('example.com/page?x=1')).toBe('https://example.com/page?x=1');
        expect(normalizeUrl('ada@example.com')).toBe('mailto:ada@example.com');
        expect(normalizeUrl('/docs')).toBe('/docs');
        expect(normalizeUrl('#top')).toBe('#top');
    });

    it('refuses what is not an address, and anything that could run code', () => {
        expect(normalizeUrl('')).toBeNull();
        expect(normalizeUrl('just words')).toBeNull();
        expect(normalizeUrl('javascript:alert(1)')).toBeNull();
        expect(normalizeUrl('data:text/html,<script>')).toBeNull();
        expect(normalizeUrl('//evil.com')).toBeNull();
        expect(normalizeUrl('/\\evil.com')).toBeNull();
    });
});

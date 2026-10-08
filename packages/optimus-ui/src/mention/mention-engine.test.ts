import { describe, expect, it } from 'vitest';
import { extractMentions, filterItems, findMention, replaceMention, stepActive, toOptions } from './mention-engine';

const opts = { mentionChar: '@' };

describe('findMention', () => {
    it('finds the mention under the caret', () => {
        expect(findMention('hello @jo', 9, opts)).toEqual({ start: 6, end: 9, query: 'jo' });
        expect(findMention('@', 1, opts)).toEqual({ start: 0, end: 1, query: '' });
        expect(findMention('hi @jo and', 6, opts)).toEqual({ start: 3, end: 6, query: 'j'.padEnd(1) + 'o' });
    });

    it('ignores what is not a mention', () => {
        expect(findMention('mail me at a@b.com', 18, opts)).toBeNull();
        expect(findMention('hello @jo and', 13, opts)).toBeNull();
        expect(findMention('hello world', 5, opts)).toBeNull();
        expect(findMention('@jo\nxx', 6, opts)).toBeNull();
    });

    it('honours requireLeadingSpace, minLength and allowSpaces', () => {
        expect(findMention('a@b', 3, { ...opts, requireLeadingSpace: false })).toEqual({ start: 1, end: 3, query: 'b' });
        expect(findMention('@j', 2, { ...opts, minLength: 2 })).toBeNull();
        expect(findMention('@jo', 3, { ...opts, minLength: 2 })).not.toBeNull();
        expect(findMention('@john sm', 8, { ...opts, allowSpaces: true })).toEqual({ start: 0, end: 8, query: 'john sm' });
        expect(findMention('@john\nsm', 8, { ...opts, allowSpaces: true })).toBeNull();
    });

    it('takes a multi-character trigger', () => {
        expect(findMention('see ##42', 8, { mentionChar: '##' })).toEqual({ start: 4, end: 8, query: '42' });
    });
});

describe('filtering', () => {
    const people = [
        { text: 'Ana', team: 'A' },
        { text: 'anders', team: 'B' },
        { text: 'Bea', team: 'A' },
        { text: 'Carl', team: 'B', off: true }
    ];

    it('matches by pattern, case and limit', () => {
        expect(filterItems(people, 'an').map((p) => p.text)).toEqual(['Ana', 'anders']);
        expect(filterItems(people, 'an', { ignoreCase: false }).map((p) => p.text)).toEqual(['anders']);
        expect(filterItems(people, 'a', { pattern: 'contains' })).toHaveLength(4);
        expect(filterItems(people, 'a', { pattern: 'endsWith' }).map((p) => p.text)).toEqual(['Ana', 'Bea']);
        expect(filterItems(people, '', { limit: 2 })).toHaveLength(2);
        expect(filterItems(['b', 'a', 'c'], '', { sort: 'descending' })).toEqual(['c', 'b', 'a']);
    });

    it('reads fields, strings and groups', () => {
        const options = toOptions(people, { groupBy: 'team', disabled: 'off' });

        expect(options.map((o) => o.group)).toEqual(['A', 'A', 'B', 'B']);
        expect(options.map((o) => o.text)).toEqual(['Ana', 'Bea', 'anders', 'Carl']);
        expect(options[3].disabled).toBe(true);
        expect(toOptions(['x', 'y'])[1]).toMatchObject({ text: 'y', value: 'y', index: 1 });
        expect(toOptions([{ name: 'N', id: 7 }], { text: 'name', value: 'id' })[0]).toMatchObject({ text: 'N', value: 7 });
    });

    it('steps over disabled rows and wraps', () => {
        const options = toOptions([{ text: 'a' }, { text: 'b', disabled: true }, { text: 'c' }], { disabled: 'disabled' });

        expect(stepActive(options, 0, 1)).toBe(2);
        expect(stepActive(options, 2, 1)).toBe(0);
        expect(stepActive(options, 0, -1)).toBe(2);
        expect(stepActive(toOptions([{ text: 'a', disabled: true }], { disabled: 'disabled' }), -1, 1)).toBe(-1);
    });
});

describe('replaceMention', () => {
    it('writes the pick and places the caret after it', () => {
        expect(replaceMention('hi @jo', { start: 3, end: 6, query: 'jo' }, '@John')).toEqual({ text: 'hi @John ', caret: 9 });
    });

    it('does not double the space that already follows', () => {
        expect(replaceMention('hi @jo there', { start: 3, end: 6, query: 'jo' }, 'John')).toEqual({ text: 'hi John there', caret: 8 });
    });
});

describe('extractMentions', () => {
    it('gives the names mentioned', () => {
        expect(extractMentions('hi @Ana and @Ana Maria, ok', '@', ['Ana', 'Ana Maria', 'Bea'])).toEqual(['Ana Maria', 'Ana']);
        expect(extractMentions('mail x@Ana.com', '@', ['Ana'])).toEqual([]);
    });
});

import { describe, expect, it } from 'vitest';
import { rewriteAutoCompleteTags } from './rewrite';

describe('rewriteAutoCompleteTags', () => {
    it('renames the static and the bound attribute', () => {
        const { text, changed } = rewriteAutoCompleteTags(`<p-autocomplete minLength="3" /><p-autoComplete [minLength]="n" [(ngModel)]="x"></p-autoComplete>`);

        expect(changed).toBe(true);
        expect(text).toBe(`<p-autocomplete minQueryLength="3" /><p-autoComplete [minQueryLength]="n" [(ngModel)]="x"></p-autoComplete>`);
    });

    it('handles a tag over several lines with > inside an expression', () => {
        const { text } = rewriteAutoCompleteTags(`<p-autocomplete\n    (completeMethod)="items = all.filter((i) => i.length > 2)"\n    minLength="2"\n/>`);

        expect(text).toContain('minQueryLength="2"');
        expect(text).not.toContain('minLength');
    });

    it('leaves other components and unrelated text alone', () => {
        const input = `<p-password minLength="3" /><div>minLength="3"</div><p-autocomplete minQueryLength="2" />`;
        const result = rewriteAutoCompleteTags(input);

        expect(result.changed).toBe(false);
        expect(result.text).toBe(input);
    });

    it('does not rename an attribute that only contains the name', () => {
        const input = `<p-autocomplete [attr.minLengthHint]="x" data-minLength="1" />`;

        expect(rewriteAutoCompleteTags(input).changed).toBe(false);
    });
});

import { inject, Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { createHighlighterCore, type HighlighterCore, type ShikiTransformer } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

export type HighlightLanguage = 'typescript' | 'html' | 'scss' | 'css' | 'shell' | 'json';

const LANGUAGE_ALIASES: Record<string, HighlightLanguage> = {
    typescript: 'typescript',
    ts: 'typescript',
    javascript: 'typescript',
    html: 'html',
    markup: 'html',
    scss: 'scss',
    css: 'css',
    command: 'shell',
    bash: 'shell',
    shell: 'shell',
    json: 'json'
};

/**
 * Highlights code with Shiki, emitting both themes in a single pass: every token
 * carries `color:<light>` plus a `--shiki-dark` custom property, and the stylesheet
 * swaps to the dark value under `.p-dark`. Switching theme is therefore a CSS change
 * with no re-highlight and no flash.
 *
 * The highlighter is created once during app initialization, which makes the
 * `highlight()` call itself synchronous — including while prerendering.
 */
@Injectable({ providedIn: 'root' })
export class HighlightService {
    private highlighter: HighlighterCore | null = null;

    private readonly sanitizer = inject(DomSanitizer);

    async load(): Promise<void> {
        if (this.highlighter) {
            return;
        }

        this.highlighter = await createHighlighterCore({
            themes: [import('shiki/themes/github-light.mjs'), import('shiki/themes/github-dark.mjs')],
            langs: [import('shiki/langs/typescript.mjs'), import('shiki/langs/html.mjs'), import('shiki/langs/scss.mjs'), import('shiki/langs/css.mjs'), import('shiki/langs/shellscript.mjs'), import('shiki/langs/json.mjs')],
            // The JavaScript engine keeps the build free of a WebAssembly asset.
            engine: createJavaScriptRegexEngine()
        });
    }

    /**
     * Highlighted markup, marked safe.
     *
     * Shiki carries every token's colour in a `style` attribute, and Angular's HTML
     * sanitizer strips exactly that — bound through `[innerHTML]` the result comes out
     * uncoloured. Everything highlighted here is first-party: literals in this repository
     * and snippets extracted from our own demo sources at build time.
     */
    highlightSafe(code: string, language: string): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(this.highlight(code, language));
    }

    /**
     * The same block, in one colour and one element.
     *
     * Highlighting costs a span per coloured token, and a page of forty-eight examples
     * carries more of them than a browser is happy with. Colour changes nothing about
     * layout - same font, same characters, same box - so a block can be served plain and
     * coloured later, when the reader is near it, with nothing moving on the page.
     */
    plain(code: string): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(
            `<pre class="shiki shiki-themes github-light github-dark" style="background-color:#fff;--shiki-dark-bg:#24292e;color:#24292e;--shiki-dark:#e1e4e8" tabindex="0"><code>${escapeHtml(code)}</code></pre>`
        );
    }

    highlight(code: string, language: string): string {
        const lang = LANGUAGE_ALIASES[language] ?? 'typescript';

        if (!this.highlighter) {
            return `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`;
        }

        return this.highlighter.codeToHtml(code, {
            lang: lang === 'shell' ? 'shellscript' : lang,
            themes: { light: 'github-light', dark: 'github-dark' },
            defaultColor: 'light',
            transformers: [compactTokens]
        });
    }
}

/**
 * Shiki wraps every token in a span of its own, and a page of examples is mostly tokens:
 * the table page carried 12,727 element nodes inside its code blocks alone, on a document
 * that a browser is happier keeping under a couple of thousand.
 *
 * Most of them say nothing. A token painted in the body colour needs no element at all,
 * and two neighbours painted alike need one between them rather than two. This drops both
 * - the text and the colours that reach the screen are exactly the same.
 */
const compactTokens: ShikiTransformer = {
    name: 'optimus:compact-tokens',
    root(hast: any) {
        const pre = hast.children?.find((child: any) => child.tagName === 'pre');
        const code = pre?.children?.find((child: any) => child.tagName === 'code');

        if (!code) {
            return;
        }

        const inherited = colorsOf(pre.properties?.style);

        for (const line of code.children) {
            if (line.type !== 'element' || !line.children?.length) {
                continue;
            }

            const compacted: any[] = [];

            for (const child of line.children) {
                const style = child.type === 'element' && child.tagName === 'span' ? colorsOf(child.properties?.style) : null;
                const previous = compacted[compacted.length - 1];

                // A token in the body colour: keep the text, drop the element around it.
                if (style !== null && style === inherited) {
                    const text = textOf(child);

                    if (previous?.type === 'text') {
                        previous.value += text;
                    } else {
                        compacted.push({ type: 'text', value: text });
                    }

                    continue;
                }

                // The same colour as the token before it: one span for both.
                if (style !== null && previous?.type === 'element' && colorsOf(previous.properties?.style) === style) {
                    previous.children.push(...child.children);
                    continue;
                }

                compacted.push(child);
            }

            // Merging leaves text in pieces; a line of plain code is then one text node.
            line.children = compacted.map((child: any) => (child.type === 'element' ? { ...child, children: mergeText(child.children) } : child));
        }
    }
};

/** The light and dark colour a style declares, as one comparable string. */
function colorsOf(style: unknown): string {
    const declarations = String(style ?? '').toLowerCase();
    const light = /(?:^|;)\s*color\s*:\s*([^;]+)/.exec(declarations)?.[1]?.trim() ?? '';
    const dark = /--shiki-dark\s*:\s*([^;]+)/.exec(declarations)?.[1]?.trim() ?? '';

    return `${light}|${dark}`;
}

function textOf(node: any): string {
    return node.type === 'text' ? node.value : (node.children ?? []).map(textOf).join('');
}

function mergeText(children: any[] = []): any[] {
    return children.reduce((merged: any[], child: any) => {
        const previous = merged[merged.length - 1];

        if (child.type === 'text' && previous?.type === 'text') {
            previous.value += child.value;

            return merged;
        }

        return [...merged, child];
    }, []);
}

function escapeHtml(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

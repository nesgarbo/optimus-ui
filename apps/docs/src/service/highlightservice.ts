import { inject, Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { createHighlighterCore, type HighlighterCore } from 'shiki/core';
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

    highlight(code: string, language: string): string {
        const lang = LANGUAGE_ALIASES[language] ?? 'typescript';

        if (!this.highlighter) {
            return `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`;
        }

        return this.highlighter.codeToHtml(code, {
            lang: lang === 'shell' ? 'shellscript' : lang,
            themes: { light: 'github-light', dark: 'github-dark' },
            defaultColor: 'light'
        });
    }
}

function escapeHtml(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

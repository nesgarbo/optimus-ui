import type { AssistResponseBlock } from '@openng/optimus-ui/types/aiassistview';

/**
 * The markdown a model actually emits, and nothing else.
 *
 * Syncfusion reaches for a converter package here. A dependency is the wrong trade for this surface:
 * the subset a chat answer uses is small and closed — headings, emphasis, lists, links, quotes,
 * tables, rules and fenced code — and a general converter brings a parser, an HTML passthrough mode
 * and a sanitiser question along with it.
 *
 * EVERY input is HTML-escaped before a single rule runs, so the output can only ever contain the tags
 * this file puts there. The result is still bound through `[innerHTML]`, where Angular's sanitiser
 * sees it a second time.
 *
 * @module aiassistview-markdown
 */

/** The placeholder a lifted code span leaves behind. Private-use, so no answer can contain it. */
const CODE_MARKER = '';

/** Turns text into something that cannot be markup. @internal */
function escapeHtml(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Only `http`, `https`, `mailto` and same-document references survive.
 *
 * `javascript:` in an `href` is the one markdown construct that executes, and neither escaping nor
 * Angular's own sanitiser is the right place to catch it — by the time it reaches them it is a valid
 * URL inside a valid anchor.
 */
function safeUrl(value: string): string | null {
    const trimmed = value.trim();

    if (/^(https?:|mailto:)/i.test(trimmed)) return trimmed;
    if (/^[./#?]/.test(trimmed)) return trimmed;

    return null;
}

/** Applies the span-level rules to one already-escaped line. @internal */
function renderInline(text: string): string {
    // Code first: what it holds is literal, so nothing after this may look inside it. Lifting the
    // spans out is what buys that — a later rule cannot see a span it was never handed.
    const codeSpans: string[] = [];

    let output = text.replace(/`([^`]+)`/g, (_match, code: string) => {
        codeSpans.push(code);

        return `${CODE_MARKER}${codeSpans.length - 1}${CODE_MARKER}`;
    });

    output = output.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (match, alt: string, url: string, title: string | undefined) => {
        const href = safeUrl(url);

        return href ? `<img src="${href}" alt="${alt}"${title ? ` title="${title}"` : ''} />` : match;
    });

    output = output.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (match, label: string, url: string, title: string | undefined) => {
        const href = safeUrl(url);

        return href ? `<a href="${href}" target="_blank" rel="noopener noreferrer"${title ? ` title="${title}"` : ''}>${label}</a>` : match;
    });

    output = output.replace(/(\*\*\*|___)(?=\S)([\s\S]*?\S)\1/g, '<strong><em>$2</em></strong>');
    output = output.replace(/(\*\*|__)(?=\S)([\s\S]*?\S)\1/g, '<strong>$2</strong>');
    output = output.replace(/(\*|_)(?=\S)([\s\S]*?\S)\1/g, '<em>$2</em>');
    output = output.replace(/~~(?=\S)([\s\S]*?\S)~~/g, '<del>$1</del>');

    return output.replace(new RegExp(`${CODE_MARKER}(\\d+)${CODE_MARKER}`, 'g'), (_match, position: string) => `<code>${codeSpans[Number(position)]}</code>`);
}

/** Splits a table row on its pipes. @internal */
function tableCells(line: string): string[] {
    return line
        .replace(/^\s*\|/, '')
        .replace(/\|\s*$/, '')
        .split('|')
        .map((cell) => cell.trim());
}

/**
 * Renders the prose subset to HTML.
 *
 * Fenced code is NOT handled here: {@link splitMarkdownBlocks} lifts it out first, so a sample gets
 * its own header, its own copy button and its own horizontal scroll rather than being flattened into
 * a `<pre>` in the middle of a paragraph.
 *
 * @group Function
 */
export function renderMarkdown(source: string): string {
    if (!source) return '';

    const lines = escapeHtml(source).split(/\r?\n/);
    const output: string[] = [];
    let paragraph: string[] = [];
    let listType: 'ul' | 'ol' | null = null;
    let inQuote = false;

    const closeParagraph = () => {
        if (paragraph.length === 0) return;

        output.push(`<p>${renderInline(paragraph.join('<br />'))}</p>`);
        paragraph = [];
    };

    const closeList = () => {
        if (!listType) return;

        output.push(`</${listType}>`);
        listType = null;
    };

    const closeQuote = () => {
        if (!inQuote) return;

        output.push('</blockquote>');
        inQuote = false;
    };

    const closeAll = () => {
        closeParagraph();
        closeList();
        closeQuote();
    };

    for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];

        if (!line.trim()) {
            closeAll();
            continue;
        }

        const heading = /^(#{1,6})\s+(.*)$/.exec(line);

        if (heading) {
            closeAll();

            const level = heading[1].length;

            output.push(`<h${level}>${renderInline(heading[2].trim())}</h${level}>`);
            continue;
        }

        if (/^\s*(?:[-*_]\s*){3,}$/.test(line)) {
            closeAll();
            output.push('<hr />');
            continue;
        }

        // A table means nothing until its separator row exists, so the lookahead is part of the match
        // rather than a state the loop has to carry between iterations.
        if (line.includes('|') && /^\s*\|?[\s:-]*-[\s:|-]*$/.test(lines[index + 1] ?? '')) {
            closeAll();

            const alignments = tableCells(lines[index + 1]).map((cell) => (cell.startsWith(':') && cell.endsWith(':') ? 'center' : cell.endsWith(':') ? 'right' : cell.startsWith(':') ? 'left' : ''));
            const header = tableCells(line).map((cell, position) => `<th${alignments[position] ? ` style="text-align:${alignments[position]}"` : ''}>${renderInline(cell)}</th>`);
            const body: string[] = [];

            index += 2;

            while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
                const cells = tableCells(lines[index]).map((cell, position) => `<td${alignments[position] ? ` style="text-align:${alignments[position]}"` : ''}>${renderInline(cell)}</td>`);

                body.push(`<tr>${cells.join('')}</tr>`);
                index += 1;
            }

            index -= 1;
            output.push(`<table><thead><tr>${header.join('')}</tr></thead><tbody>${body.join('')}</tbody></table>`);
            continue;
        }

        const quote = /^\s*&gt;\s?(.*)$/.exec(line);

        if (quote) {
            closeParagraph();
            closeList();

            if (!inQuote) {
                output.push('<blockquote>');
                inQuote = true;
            }

            output.push(`<p>${renderInline(quote[1])}</p>`);
            continue;
        }

        closeQuote();

        const unordered = /^\s*[-*+]\s+(.*)$/.exec(line);
        const ordered = /^\s*\d+[.)]\s+(.*)$/.exec(line);

        if (unordered || ordered) {
            closeParagraph();

            const wanted = unordered ? 'ul' : 'ol';

            if (listType !== wanted) {
                closeList();
                output.push(`<${wanted}>`);
                listType = wanted;
            }

            const item = (unordered ?? ordered)![1];
            const task = /^\[([ xX])\]\s+(.*)$/.exec(item);

            if (task) {
                const checked = task[1].toLowerCase() === 'x';

                output.push(`<li><input type="checkbox" disabled${checked ? ' checked' : ''} /> ${renderInline(task[2])}</li>`);
            } else {
                output.push(`<li>${renderInline(item)}</li>`);
            }

            continue;
        }

        closeList();
        paragraph.push(line.trim());
    }

    closeAll();

    return output.join('');
}

/**
 * Lifts fenced code out of an answer and returns the pieces in order.
 *
 * The result is what `blocks` would have held had the model sent structure instead of a string, which
 * is what lets the plain-text path and the structured path render through exactly the same components.
 *
 * An unterminated fence — the normal state of a streaming answer part-way through a sample — still
 * yields a code block, marked `streaming`, so the sample does not arrive as prose and then turn into
 * code once the closing fence lands.
 *
 * @group Function
 */
export function splitMarkdownBlocks(source: string): AssistResponseBlock[] {
    if (!source) return [];

    const blocks: AssistResponseBlock[] = [];
    // The closing fence must be a LINE of its own and the fallback must be the true end of the input.
    // A bare `$` under the `m` flag matches at every line end, which would stop the lazy body at the
    // first newline and report every finished sample as still streaming.
    const pattern = /^```([^\n`]*)\n([\s\S]*?)(?:\n```[ \t]*$|$(?![\s\S]))/gm;
    let cursor = 0;
    let match: RegExpExecArray | null;

    const pushText = (text: string) => {
        if (text.trim()) blocks.push({ blockType: 'text', content: text });
    };

    while ((match = pattern.exec(source)) !== null) {
        pushText(source.slice(cursor, match.index));

        const info = match[1].trim();
        const consumed = match[0];
        const terminated = /```[ \t]*$/.test(consumed.trimEnd());

        blocks.push({
            blockType: 'code',
            content: match[2].replace(/\n$/, ''),
            // `ts:app.component.ts` is the convention a fence uses to name a file; whatever precedes
            // the colon is still the language.
            language: info.split(':')[0] || undefined,
            fileName: info.includes(':') ? info.slice(info.indexOf(':') + 1) : undefined,
            streaming: !terminated
        });

        cursor = match.index + consumed.length;

        // A zero-length match would spin the loop forever on a malformed fence.
        if (consumed.length === 0) pattern.lastIndex += 1;
    }

    pushText(source.slice(cursor));

    return blocks;
}

/** Renders an answer as the plain text a clipboard, an export or a voice wants. @group Function */
export function blocksToPlainText(blocks: AssistResponseBlock[] | undefined, fallback = ''): string {
    if (!blocks?.length) return fallback;

    return blocks
        .map((block) => {
            switch (block.blockType) {
                case 'text':
                    return block.content;
                case 'code':
                    return block.content;
                case 'tool':
                    return typeof block.result === 'string' ? block.result : '';
                case 'error':
                    return block.content;
                // Reasoning is deliberately left out: it is scaffolding, and pasting it into a
                // document or reading it aloud is never what was asked for.
                default:
                    return '';
            }
        })
        .filter(Boolean)
        .join('\n\n');
}

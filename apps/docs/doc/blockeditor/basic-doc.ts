import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { BlockEditor, type BlockValue } from '@openng/optimus-ui/blockeditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'basic-doc',
    standalone: true,
    imports: [BlockEditor, JsonPipe, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                Every paragraph, heading, list, to-do, quote, code block or picture is a block. Type <i>/</i> to turn a line into another kind, select text for bold, italic, strikethrough, code and links, and press Alt + the arrow keys to move the
                block the cursor is in. The value is the document as a tree of nodes, the same JSON Tiptap writes, so it can be stored and brought back with <i>[(value)]</i>. <i>format="html"</i> holds it as HTML instead.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-col gap-4">
            <p-blockeditor [(value)]="value" />
            <details>
                <summary class="cursor-pointer text-sm">The value</summary>
                <pre class="text-xs overflow-auto">{{ value() | json }}</pre>
            </details>
        </div>
        <app-code></app-code>
    `
})
export class BasicDoc {
    value = signal<BlockValue>({
        type: 'doc',
        content: [
            { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Launch checklist' }] },
            {
                type: 'paragraph',
                content: [
                    { type: 'text', text: 'Type ' },
                    { type: 'text', marks: [{ type: 'code' }], text: '/' },
                    { type: 'text', text: ' on an empty line to add a block.' }
                ]
            },
            {
                type: 'taskList',
                content: [
                    { type: 'taskItem', attrs: { checked: true }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Write the announcement' }] }] },
                    { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Review the docs' }] }] }
                ]
            }
        ]
    });
}

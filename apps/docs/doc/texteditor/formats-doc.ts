import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ToolbarBoldUI, ToolbarCodeUI, ToolbarItalicUI, ToolbarStrikethroughUI, ToolbarSubscriptUI, ToolbarSuperscriptUI, ToolbarUnderlineUI } from '@/components/texteditor';

@Component({
    selector: 'formats-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarBoldUI, ToolbarItalicUI, ToolbarUnderlineUI, ToolbarStrikethroughUI, ToolbarCodeUI, ToolbarSubscriptUI, ToolbarSuperscriptUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                Every inline format is a command with a matching state flag: <i>commands.bold()</i> and <i>state.bold</i>, and the same pair for italic, underline, strikethrough, inline code, subscript and superscript. A collapsed cursor reads the
                stored marks, so a button lights up the moment it is pressed, before anything is typed.
            </p>
            <p>Keyboard shortcuts are wired for the common three: <i>Ctrl/Cmd + B</i>, <i>I</i> and <i>U</i>.</p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" ariaLabel="Inline formats">
                <p-text-editor-toolbar>
                    <div class="p-text-editor-ui-toolbar">
                        <bold-ui />
                        <italic-ui />
                        <underline-ui />
                        <strikethrough-ui />
                        <code-ui />
                        <subscript-ui />
                        <superscript-ui />
                    </div>
                </p-text-editor-toolbar>
                <p-text-editor-content height="12rem" />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class FormatsDoc {
    readonly value = signal<string | undefined>('<p>Select a word and apply <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strikethrough</s>, <code>code</code>, H<sub>2</sub>O or x<sup>2</sup>.</p>');
}

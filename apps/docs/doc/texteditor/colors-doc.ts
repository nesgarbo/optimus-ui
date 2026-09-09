import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ToolbarBackgroundColorUI, ToolbarFontFamilyUI, ToolbarFontSizeUI, ToolbarForegroundColorUI } from '@/components/texteditor';

@Component({
    selector: 'colors-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarForegroundColorUI, ToolbarBackgroundColorUI, ToolbarFontFamilyUI, ToolbarFontSizeUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>commands.foregroundColor(color)</i> and <i>commands.backgroundColor(color)</i> set the text and highlight colours, and <i>commands.fontFamily(family)</i> and <i>commands.fontSize(size)</i> the typeface. The current values come back
                on <i>state</i> as <i>foregroundColor</i>, <i>backgroundColor</i>, <i>fontFamily</i> and <i>fontSize</i>, or <i>null</i> when the selection mixes several.
            </p>
            <p>All four round-trip through HTML, and the values are validated on the way in and on the way out: a stylesheet cannot smuggle a <i>url(...)</i> into the document through a pasted span.</p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" ariaLabel="Colors and fonts">
                <p-text-editor-toolbar>
                    <div class="p-text-editor-ui-toolbar">
                        <font-family-ui />
                        <font-size-ui />
                        <foreground-color-ui />
                        <background-color-ui />
                    </div>
                </p-text-editor-toolbar>
                <p-text-editor-content height="12rem" />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class ColorsDoc {
    readonly value = signal<string | undefined>('<p>Select this sentence and give it a colour, a highlight, a typeface or a size.</p>');
}

import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ToolbarBlockquoteUI, ToolbarBulletListUI, ToolbarCheckListUI, ToolbarCodeBlockUI, ToolbarHeadingUI, ToolbarHorizontalRuleUI, ToolbarOrderedListUI, ToolbarTextAlignUI } from '@/components/texteditor';

@Component({
    selector: 'structure-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarHeadingUI, ToolbarBulletListUI, ToolbarOrderedListUI, ToolbarCheckListUI, ToolbarBlockquoteUI, ToolbarCodeBlockUI, ToolbarHorizontalRuleUI, ToolbarTextAlignUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                Block structure is the same shape as inline formatting. <i>commands.heading(level)</i> applies H1 to H6 and <i>commands.paragraph()</i> converts back; <i>commands.bulletList()</i>, <i>commands.orderedList()</i> and
                <i>commands.checkList()</i> toggle the three list types, and calling one while another is active converts between them; <i>commands.blockquote()</i> and <i>commands.codeBlock()</i> wrap the current block;
                <i>commands.insertHorizontalRule()</i> inserts a rule, and <i>commands.textAlign(alignment)</i> sets the alignment.
            </p>
            <p>
                Lists nest with <i>Tab</i> and <i>Shift + Tab</i>, and <i>Backspace</i> on an empty item lifts it out of the list instead of merging it into the one above. Checklists render a real checkbox, and the checked state round-trips as
                <i>data-p-checked</i> on the item.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" checklistPlaceholder="To-Do" ariaLabel="Document structure">
                <p-text-editor-toolbar>
                    <div class="p-text-editor-ui-toolbar">
                        <heading-ui />
                        <text-align-ui />
                        <bullet-list-ui />
                        <ordered-list-ui />
                        <check-list-ui />
                        <blockquote-ui />
                        <code-block-ui />
                        <horizontal-rule-ui />
                    </div>
                </p-text-editor-toolbar>
                <p-text-editor-content height="20rem" />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class StructureDoc {
    readonly value = signal<string | undefined>(
        '<h2>Structure</h2>' +
            '<p>Headings, lists, quotes and code blocks are all one command away.</p>' +
            '<ul data-p-checked-list><li data-p-checked="true"><p>Completed task</p></li><li data-p-checked="false"><p>Pending task</p></li></ul>' +
            '<pre><code>const editor = { mode: "classic", markdown: true };</code></pre>'
    );
}

import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { AccessibilityDoc } from '@/doc/texteditor/accessibility-doc';
import { BasicDoc } from '@/doc/texteditor/basic-doc';
import { BlockCompleteDoc } from '@/doc/texteditor/block-complete-doc';
import { BlockDoc } from '@/doc/texteditor/block-doc';
import { BlockMenuDoc } from '@/doc/texteditor/block-menu-doc';
import { ColorsDoc } from '@/doc/texteditor/colors-doc';
import { ContextToolbarDoc } from '@/doc/texteditor/context-toolbar-doc';
import { ControlledDoc } from '@/doc/texteditor/controlled-doc';
import { DataAttributesDoc } from '@/doc/texteditor/data-attributes-doc';
import { DocumentDoc } from '@/doc/texteditor/document-doc';
import { EventsDoc } from '@/doc/texteditor/events-doc';
import { FormatsDoc } from '@/doc/texteditor/formats-doc';
import { FormsDoc } from '@/doc/texteditor/forms-doc';
import { HistoryDoc } from '@/doc/texteditor/history-doc';
import { ImageDoc } from '@/doc/texteditor/image-doc';
import { ImportDoc } from '@/doc/texteditor/import-doc';
import { LinkDoc } from '@/doc/texteditor/link-doc';
import { MarkdownDoc } from '@/doc/texteditor/markdown-doc';
import { MentionDoc } from '@/doc/texteditor/mention-doc';
import { NavigatorDoc } from '@/doc/texteditor/navigator-doc';
import { PluginsDoc } from '@/doc/texteditor/plugins-doc';
import { PrintDoc } from '@/doc/texteditor/print-doc';
import { ReadonlyDoc } from '@/doc/texteditor/readonly-doc';
import { SecurityDoc } from '@/doc/texteditor/security-doc';
import { SlashCommandsDoc } from '@/doc/texteditor/slash-commands-doc';
import { StaticToolbarDoc } from '@/doc/texteditor/static-toolbar-doc';
import { StructureDoc } from '@/doc/texteditor/structure-doc';
import { TableDoc } from '@/doc/texteditor/table-doc';

@Component({
    template: `<app-doc
        docTitle="Angular TextEditor Component - Optimus UI"
        header="TextEditor"
        description="TextEditor is a ProseMirror-based rich text editor with a classic toolbar, Notion-style blocks, markdown input rules and a fully template-driven UI."
        [docs]="docs"
        [apiDocs]="['TextEditor']"
        themeDocs="texteditor"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class TextEditorDemo {
    docs = [
        { id: 'import', label: 'Import', component: ImportDoc },
        { id: 'basic', label: 'Basic', component: BasicDoc },
        { id: 'static-toolbar', label: 'Static Toolbar', component: StaticToolbarDoc },
        { id: 'context-toolbar', label: 'Context Toolbar', component: ContextToolbarDoc },
        { id: 'formats', label: 'Formats', component: FormatsDoc },
        { id: 'colors', label: 'Colors & Fonts', component: ColorsDoc },
        { id: 'structure', label: 'Structure', component: StructureDoc },
        { id: 'link', label: 'Link', component: LinkDoc },
        { id: 'image', label: 'Image', component: ImageDoc },
        { id: 'document', label: 'Document', component: DocumentDoc },
        { id: 'mention', label: 'Mention', component: MentionDoc },
        { id: 'table', label: 'Table', component: TableDoc },
        { id: 'block', label: 'Block Mode', component: BlockDoc },
        { id: 'block-menu', label: 'Block Menu', component: BlockMenuDoc },
        { id: 'slash-commands', label: 'Slash Commands', component: SlashCommandsDoc },
        { id: 'block-complete', label: 'Complete', component: BlockCompleteDoc },
        { id: 'markdown', label: 'Markdown', component: MarkdownDoc },
        { id: 'navigator', label: 'Navigator', component: NavigatorDoc },
        { id: 'history', label: 'Undo & Redo', component: HistoryDoc },
        { id: 'print', label: 'Print', component: PrintDoc },
        { id: 'events', label: 'Events & Output', component: EventsDoc },
        { id: 'controlled', label: 'Controlled', component: ControlledDoc },
        { id: 'forms', label: 'Forms', component: FormsDoc },
        { id: 'readonly', label: 'Readonly & Disabled', component: ReadonlyDoc },
        { id: 'plugins', label: 'Plugins', component: PluginsDoc },
        { id: 'data-attributes', label: 'Data Attributes', component: DataAttributesDoc },
        { id: 'security', label: 'Security', component: SecurityDoc },
        { id: 'accessibility', label: 'Accessibility', component: AccessibilityDoc }
    ];
}

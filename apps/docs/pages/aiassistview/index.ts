import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { AccessibilityDoc } from '@/doc/aiassistview/accessibility-doc';
import { AppearanceDoc } from '@/doc/aiassistview/appearance-doc';
import { AttachmentsDoc } from '@/doc/aiassistview/attachments-doc';
import { BasicDoc } from '@/doc/aiassistview/basic-doc';
import { BlocksDoc } from '@/doc/aiassistview/blocks-doc';
import { CompositionDoc } from '@/doc/aiassistview/composition-doc';
import { EventsDoc } from '@/doc/aiassistview/events-doc';
import { ExternalDoc } from '@/doc/aiassistview/external-doc';
import { ImportDoc } from '@/doc/aiassistview/import-doc';
import { SpeechDoc } from '@/doc/aiassistview/speech-doc';
import { StreamingDoc } from '@/doc/aiassistview/streaming-doc';
import { SuggestionsDoc } from '@/doc/aiassistview/suggestions-doc';
import { TemplatesDoc } from '@/doc/aiassistview/templates-doc';
import { ThinkingDoc } from '@/doc/aiassistview/thinking-doc';
import { ToolbarsDoc } from '@/doc/aiassistview/toolbars-doc';
import { ToolsDoc } from '@/doc/aiassistview/tools-doc';
import { ViewsDoc } from '@/doc/aiassistview/views-doc';

@Component({
    template: `<app-doc
        docTitle="Angular AI AssistView Component - Optimus UI"
        header="AIAssistView"
        description="AIAssistView is a conversational assistant surface: a streaming transcript, a composer with attachments and dictation, reasoning timelines, tool cards and a template for every part of it."
        [docs]="docs"
        [apiDocs]="['AIAssistView']"
        themeDocs="aiassistview"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class AIAssistViewDemo {
    docs = [
        { id: 'import', label: 'Import', component: ImportDoc },
        { id: 'basic', label: 'Basic', component: BasicDoc },
        { id: 'streaming', label: 'Streaming', component: StreamingDoc },
        { id: 'blocks', label: 'Response Blocks', component: BlocksDoc },
        { id: 'thinking', label: 'Reasoning', component: ThinkingDoc },
        { id: 'tools', label: 'Tool Calls', component: ToolsDoc },
        { id: 'suggestions', label: 'Suggestions', component: SuggestionsDoc },
        { id: 'toolbars', label: 'Toolbars', component: ToolbarsDoc },
        { id: 'attachments', label: 'Attachments', component: AttachmentsDoc },
        { id: 'speech', label: 'Speech', component: SpeechDoc },
        { id: 'views', label: 'Views', component: ViewsDoc },
        { id: 'templates', label: 'Templates', component: TemplatesDoc },
        { id: 'composition', label: 'Composition', component: CompositionDoc },
        { id: 'external', label: 'Store-owned Mode', component: ExternalDoc },
        { id: 'appearance', label: 'Layout and RTL', component: AppearanceDoc },
        { id: 'events', label: 'Events', component: EventsDoc },
        { id: 'accessibility', label: 'Accessibility', component: AccessibilityDoc }
    ];
}

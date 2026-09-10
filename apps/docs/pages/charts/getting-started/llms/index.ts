import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { LlmsImport2Doc } from '@/doc/charts/getting-started/llms/import-2-doc';
import { LlmsOverviewDoc } from '@/doc/charts/getting-started/llms/overview-doc';
import { LlmsChartPagesDoc } from '@/doc/charts/getting-started/llms/chart-pages-doc';
import { LlmsContextPacksDoc } from '@/doc/charts/getting-started/llms/context-packs-doc';
import { LlmsDemoSourceDoc } from '@/doc/charts/getting-started/llms/demo-source-doc';
import { LlmsGuardrailsDoc } from '@/doc/charts/getting-started/llms/guardrails-doc';
import { LlmsPromptingPatternDoc } from '@/doc/charts/getting-started/llms/prompting-pattern-doc';
import { LlmsOutputChecklistDoc } from '@/doc/charts/getting-started/llms/output-checklist-doc';

@Component({
    template: `<app-doc docTitle="Angular Charts LLMs - Optimus UI" header="LLMs" description="Use the Angular Chart documentation as structured context for AI assistants and code-generation tools." [docs]="docs" themeDocs="charts"></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsGettingStartedLlmsDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: LlmsImport2Doc
        },
        {
            id: 'overview',
            label: 'Overview',
            component: LlmsOverviewDoc
        },
        {
            id: 'chart-pages',
            label: 'Chart Pages',
            component: LlmsChartPagesDoc
        },
        {
            id: 'context-packs',
            label: 'Context Packs',
            component: LlmsContextPacksDoc
        },
        {
            id: 'demo-source',
            label: 'Demo Source',
            component: LlmsDemoSourceDoc
        },
        {
            id: 'guardrails',
            label: 'Guardrails',
            component: LlmsGuardrailsDoc
        },
        {
            id: 'prompting-pattern',
            label: 'Prompting Pattern',
            component: LlmsPromptingPatternDoc
        },
        {
            id: 'output-checklist',
            label: 'Output Checklist',
            component: LlmsOutputChecklistDoc
        }
    ];
}

import { AppDoc } from '@/components/doc/app.doc';
import { ArchitectureDoc } from '@/doc/theming/unstyled/architecture-doc';
import { ExampleDoc } from '@/doc/theming/unstyled/example-doc';
import { GlobalDoc } from '@/doc/theming/unstyled/global-doc';
import { SetupDoc } from '@/doc/theming/unstyled/setup-doc';
import { Component } from '@angular/core';

@Component({
    template: `<app-doc
        docTitle="Unstyled Mode - Optimus UI"
        header="Unstyled"
        metaDescription="Unstyled mode in Optimus UI: components bring behaviour and accessibility with no CSS of their own, so Tailwind or your own stylesheet decides the looks."
        description="Theming Optimus UI with alternative styling approaches."
        [docs]="docs"
        docType="page"
    ></app-doc>`,
    imports: [AppDoc],
    standalone: true
})
export class ThemingUnstyledDemo {
    docs = [
        {
            id: 'architecture',
            label: 'Architecture',
            component: ArchitectureDoc
        },
        {
            id: 'setup',
            label: 'Setup',
            component: SetupDoc
        },
        {
            id: 'example',
            label: 'Example',
            component: ExampleDoc
        },
        {
            id: 'global',
            label: 'Global',
            component: GlobalDoc
        }
    ];
}

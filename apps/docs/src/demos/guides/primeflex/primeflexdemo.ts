import { CompatibilityDoc } from '@/doc/guides/primeflex/compatibility-doc';
import { MigrationDoc } from '@/doc/guides/primeflex/migration-doc';
import { OverviewDoc } from '@/doc/guides/primeflex/overview-doc';
import { TailwindCSSDoc } from '@/doc/guides/primeflex/tailwindcss-doc';
import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';

@Component({
    selector: 'css-layer',
    standalone: true,
    imports: [AppDoc],
    template: `<app-doc
        docTitle="PrimeFlex - Optimus UI"
        header="Introduction"
        metaDescription="Moving an Angular project from PrimeFlex to Tailwind CSS: the class equivalents, the schematic that rewrites them for you, and what to check by hand."
        [docs]="docs"
        description="Moving from PrimeFlex to Tailwind CSS."
    ></app-doc>`
})
export class PrimeFlexDemoComponent {
    docs = [
        {
            id: 'overview',
            label: 'Overview',
            component: OverviewDoc
        },
        {
            id: 'compatibility',
            label: 'Compatibility',
            component: CompatibilityDoc
        },
        {
            id: 'tailwindcss',
            label: 'Tailwind CSS',
            component: TailwindCSSDoc
        },
        {
            id: 'migration',
            label: 'Migration',
            component: MigrationDoc
        }
    ];
}

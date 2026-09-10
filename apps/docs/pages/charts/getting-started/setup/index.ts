import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { SetupImport3Doc } from '@/doc/charts/getting-started/setup/import-3-doc';
import { SetupInstallationDoc } from '@/doc/charts/getting-started/setup/installation-doc';
import { SetupImport2Doc } from '@/doc/charts/getting-started/setup/import-2-doc';
import { SetupStylesDoc } from '@/doc/charts/getting-started/setup/styles-doc';
import { SetupNgmoduleDoc } from '@/doc/charts/getting-started/setup/ngmodule-doc';
import { SetupQuickstartsDoc } from '@/doc/charts/getting-started/setup/quickstarts-doc';
import { SetupNextStepsDoc } from '@/doc/charts/getting-started/setup/next-steps-doc';

@Component({
    template: `<app-doc docTitle="Angular Charts Setup - Optimus UI" header="Setup" description="Install Angular Charts, load the chart styles, and render the first chart with public package imports." [docs]="docs" themeDocs="charts"></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsGettingStartedSetupDemo {
    docs = [
        {
            id: 'import-3',
            label: 'Import',
            component: SetupImport3Doc
        },
        {
            id: 'installation',
            label: 'Installation',
            component: SetupInstallationDoc
        },
        {
            id: 'import-2',
            label: 'Import',
            component: SetupImport2Doc
        },
        {
            id: 'styles',
            label: 'Styles',
            component: SetupStylesDoc
        },
        {
            id: 'ngmodule',
            label: 'NgModule',
            component: SetupNgmoduleDoc
        },
        {
            id: 'quickstarts',
            label: 'Quickstarts',
            component: SetupQuickstartsDoc
        },
        {
            id: 'next-steps',
            label: 'Next Steps',
            component: SetupNextStepsDoc
        }
    ];
}

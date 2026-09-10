import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { AnimationImport2Doc } from '@/doc/charts/configuration/animation/import-2-doc';
import { AnimationBasicDoc } from '@/doc/charts/configuration/animation/basic-doc';
import { AnimationDurationDoc } from '@/doc/charts/configuration/animation/duration-doc';
import { AnimationEasingDoc } from '@/doc/charts/configuration/animation/easing-doc';
import { AnimationDisablingAnimationDoc } from '@/doc/charts/configuration/animation/disabling-animation-doc';
import { AnimationCustomEasingDoc } from '@/doc/charts/configuration/animation/custom-easing-doc';
import { AnimationLoopingPropertyAnimationsDoc } from '@/doc/charts/configuration/animation/looping-property-animations-doc';
import { AnimationTransitionsDoc } from '@/doc/charts/configuration/animation/transitions-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Animation - Optimus UI"
        header="Animation"
        description="Configure chart entrance, update, and looping animations via animation, animations, and transitions inputs on the chart root."
        [docs]="docs"
        [apiDocs]="['ChartSvg']"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsConfigurationAnimationDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: AnimationImport2Doc
        },
        {
            id: 'basic',
            label: 'Basic',
            component: AnimationBasicDoc
        },
        {
            id: 'duration',
            label: 'Duration',
            component: AnimationDurationDoc
        },
        {
            id: 'easing',
            label: 'Easing',
            component: AnimationEasingDoc
        },
        {
            id: 'disabling-animation',
            label: 'Disabling Animation',
            component: AnimationDisablingAnimationDoc
        },
        {
            id: 'custom-easing',
            label: 'Custom Easing',
            component: AnimationCustomEasingDoc
        },
        {
            id: 'looping-property-animations',
            label: 'Looping Property Animations',
            component: AnimationLoopingPropertyAnimationsDoc
        },
        {
            id: 'transitions',
            label: 'Transitions',
            component: AnimationTransitionsDoc
        }
    ];
}

import { AccessibilityDoc } from '@/doc/styleclass/accessibility-doc';
import { AnimationDoc } from '@/doc/styleclass/animation-doc';
import { HideOnResizeDoc } from '@/doc/styleclass/hideonresize-doc';
import { ImportDoc } from '@/doc/styleclass/import-doc';
import { ToggleClassDoc } from '@/doc/styleclass/toggleclass-doc';
import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';

@Component({
    template: `<app-doc
        docTitle="Angular StyleClass Component - Optimus UI"
        header="StyleClass"
        description="StyleClass manages css classes declaratively to during enter/leave animations or just to toggle classes on an element."
        metaDescription="StyleClass manages css classes declaratively to during enter/leave animations or just to toggle classes on an element. Examples cover toggle class."
        [docs]="docs"
        [apiDocs]="['StyleClass']"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class StyleClassDemo {
    docs = [
        {
            id: 'import',
            label: 'Import',
            component: ImportDoc
        },
        {
            id: 'toggleclass',
            label: 'Toggle Class',
            component: ToggleClassDoc
        },
        {
            id: 'animation',
            label: 'Animation',
            component: AnimationDoc
        },
        {
            id: 'hideonresize',
            label: 'Hide On Resize',
            component: HideOnResizeDoc
        },
        {
            id: 'accessibility',
            label: 'Accessibility',
            component: AccessibilityDoc
        }
    ];
}

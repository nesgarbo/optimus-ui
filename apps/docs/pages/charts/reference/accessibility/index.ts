import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { AccessibilityImport2Doc } from '@/doc/charts/reference/accessibility/import-2-doc';
import { AccessibilityBasicDoc } from '@/doc/charts/reference/accessibility/basic-doc';
import { AccessibilityColorVisionDoc } from '@/doc/charts/reference/accessibility/color-vision-doc';
import { AccessibilityCustomDescriptionDoc } from '@/doc/charts/reference/accessibility/custom-description-doc';
import { AccessibilityPointDescriptionsDoc } from '@/doc/charts/reference/accessibility/point-descriptions-doc';
import { AccessibilityScreenReaderDataTableDoc } from '@/doc/charts/reference/accessibility/screen-reader-data-table-doc';
import { AccessibilityKeyboardNavigationDoc } from '@/doc/charts/reference/accessibility/keyboard-navigation-doc';
import { AccessibilityFocusIndicatorDoc } from '@/doc/charts/reference/accessibility/focus-indicator-doc';
import { AccessibilityLandmarkVerbosityDoc } from '@/doc/charts/reference/accessibility/landmark-verbosity-doc';
import { AccessibilityDisablingAccessibilityDoc } from '@/doc/charts/reference/accessibility/disabling-accessibility-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Charts Accessibility - Optimus UI"
        header="Accessibility"
        description="Configure screen reader support, ARIA labels, keyboard navigation, and focus indicators for chart data."
        [docs]="docs"
        [apiDocs]="['ChartAccessibility']"
        themeDocs="charts"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class ChartsReferenceAccessibilityDemo {
    docs = [
        {
            id: 'import-2',
            label: 'Import',
            component: AccessibilityImport2Doc
        },
        {
            id: 'basic',
            label: 'Basic',
            component: AccessibilityBasicDoc
        },
        {
            id: 'color-vision',
            label: 'Color Vision',
            component: AccessibilityColorVisionDoc
        },
        {
            id: 'custom-description',
            label: 'Custom Description',
            component: AccessibilityCustomDescriptionDoc
        },
        {
            id: 'point-descriptions',
            label: 'Point Descriptions',
            component: AccessibilityPointDescriptionsDoc
        },
        {
            id: 'screen-reader-data-table',
            label: 'Screen Reader Data Table',
            component: AccessibilityScreenReaderDataTableDoc
        },
        {
            id: 'keyboard-navigation',
            label: 'Keyboard Navigation',
            component: AccessibilityKeyboardNavigationDoc
        },
        {
            id: 'focus-indicator',
            label: 'Focus Indicator',
            component: AccessibilityFocusIndicatorDoc
        },
        {
            id: 'landmark-verbosity',
            label: 'Landmark Verbosity',
            component: AccessibilityLandmarkVerbosityDoc
        },
        {
            id: 'disabling-accessibility',
            label: 'Disabling Accessibility',
            component: AccessibilityDisablingAccessibilityDoc
        }
    ];
}

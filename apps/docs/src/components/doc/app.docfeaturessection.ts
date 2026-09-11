import { Doc } from '@/domain/doc';
import { ChangeDetectionStrategy, Component, computed, Input, input, ViewEncapsulation } from '@angular/core';
import { featuresOutline } from './helpers/features-outline';
import { AppDocSection } from './app.docsection';
import { AppDocSectionNav } from './app.docsection-nav';
import { AppDocBreadcrumb } from './app.docbreadcrumb';

@Component({
    selector: 'app-docfeaturessection',
    standalone: true,
    imports: [AppDocSection, AppDocSectionNav, AppDocBreadcrumb],
    template: ` <div class="doc-main">
            <div class="doc-intro">
                <app-docbreadcrumb />
                <div class="doc-intro-heading">
                    <h1>{{ header }}</h1>
                </div>
                <p>{{ description }}</p>
            </div>
            <app-docsection [docs]="outline()" />
        </div>
        <app-docsection-nav [docs]="outline()" />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[class.doc-tabpanel]': 'true'
    }
})
export class AppDocFeaturesSection {
    @Input() header!: string;

    @Input() description!: string;

    docs = input<Doc[]>([]);

    @Input() componentName: string = '';

    docType = input<'component' | 'page'>('component');

    /** Usage, then Examples, then Accessibility — see `featuresOutline`. */
    outline = computed(() => (this.docType() === 'component' ? featuresOutline(this.docs()) : this.docs()));
}

import { Component } from '@angular/core';
import { ImageCompareModule } from '@openng/optimus-ui/imagecompare';
import { AppCodeModule } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'responsive-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCodeModule, ImageCompareModule],
    template: `
        <app-docsectiontext>
            <p>Apply responsive styles to the container element to optimize display per screen size.</p>
        </app-docsectiontext>
        <div class="card flex justify-center">
            <p-imagecompare class="sm:!w-96 shadow-lg rounded-2xl">
                <ng-template #left>
                    <img src="https://optimus.openng.org/demo/compare/island1.jpg" alt="An island shore in daylight" width="728" height="410" />
                </ng-template>
                <ng-template #right>
                    <img src="https://optimus.openng.org/demo/compare/island2.jpg" alt="The same island shore at dusk" width="728" height="410" />
                </ng-template>
            </p-imagecompare>
        </div>
        <app-code></app-code>
    `
})
export class ResponsiveDoc {}

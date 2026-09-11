import { Component } from '@angular/core';
import { ImageCompareModule } from '@openng/optimus-ui/imagecompare';
import { AppCodeModule } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'basic-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCodeModule, ImageCompareModule],
    template: `
        <app-docsectiontext>
            <p>Images are defined using templating with <i>left</i> and <i>right</i> templates. Use the <i>style</i> or <i>class</i> properties to define the size of the container.</p>
        </app-docsectiontext>
        <div class="card flex justify-center">
            <p-imagecompare class="shadow-lg rounded-2xl">
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
export class BasicDoc {}

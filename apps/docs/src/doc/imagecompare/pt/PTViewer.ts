import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ImageCompareModule } from '@openng/optimus-ui/imagecompare';

@Component({
    selector: 'imagecompare-pt-viewer',
    standalone: true,
    imports: [CommonModule, AppDocPtViewer, ImageCompareModule],
    template: `
        <app-docptviewer [docs]="docs">
            <p-imagecompare>
                <ng-template #left>
                    <img src="https://optimus.openng.org/demo/compare/island1.jpg" alt="An island shore in daylight" width="728" height="410" />
                </ng-template>
                <ng-template #right>
                    <img src="https://optimus.openng.org/demo/compare/island2.jpg" alt="The same island shore at dusk" width="728" height="410" />
                </ng-template>
            </p-imagecompare>
        </app-docptviewer>
    `
})
export class PTViewer {
    docs = [
        {
            data: getPTOptions('ImageCompare'),
            key: 'ImageCompare'
        }
    ];
}

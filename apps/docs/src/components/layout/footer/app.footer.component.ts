import { OPENNG_URL, GITHUB_REPO_URL } from '@/utils/constants';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { version } from '../../../../package.json';

/**
 * Two lines under a documentation page: what you are reading and the licence it is under.
 * Everything else a reader might want is in the rail, a few pixels to the left.
 */
@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [RouterModule],
    template: `
        <div class="layout-footer">
            <span>
                Optimus UI {{ version }} by
                <a [href]="openngUrl" target="_blank" rel="noopener noreferrer">OpenNG</a>
            </span>
            <a [href]="licenseUrl" target="_blank" rel="noopener noreferrer">MIT License</a>
        </div>
    `
})
export class AppFooterComponent {
    readonly openngUrl = OPENNG_URL;

    readonly licenseUrl = `${GITHUB_REPO_URL}/blob/main/LICENSE.md`;

    readonly version = version;
}

import { DISCORD_URL, GITHUB_DISCUSSIONS_URL, GITHUB_REPO_URL, OPENNG_URL } from '@/utils/constants';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

interface FooterLink {
    label: string;
    href: string;
    icon?: string;
    image?: string;
}

/**
 * The end of the home page: the mark, and the four places the project actually lives.
 * The link columns belong in the rail and in the documentation footer, where a reader
 * is looking for them — not under the pitch.
 */
@Component({
    selector: 'footer-section',
    standalone: true,
    imports: [CommonModule, RouterModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section class="landing-footer pt-20">
            <div class="landing-footer-container">
                <hr class="section-divider border-surface" />
                <div class="flex flex-wrap justify-between gap-8 py-12">
                    <span>
                        <a [routerLink]="['/']" aria-label="Optimus UI home">
                            <img src="logo.svg" width="140" height="28" style="height: 28px" class="w-auto dark:invert" alt="Optimus UI" />
                        </a>
                    </span>
                    <div class="flex items-center gap-2">
                        @for (link of links; track link.label) {
                            <a [href]="link.href" target="_blank" rel="noopener noreferrer" class="linkbox linkbox-icon" [attr.aria-label]="link.label">
                                @if (link.icon) {
                                    <i [class]="link.icon + ' text-lg!'" aria-hidden="true"></i>
                                } @else {
                                    <img [src]="link.image" width="18" height="18" class="dark:invert" [alt]="link.label" />
                                }
                            </a>
                        }
                    </div>
                </div>
            </div>
        </section>
    `
})
export class FooterSectionComponent {
    links: FooterLink[] = [
        { label: 'GitHub', icon: 'pi pi-github', href: GITHUB_REPO_URL },
        { label: 'Discord', icon: 'pi pi-discord', href: DISCORD_URL },
        { label: 'Discussions', icon: 'pi pi-comments', href: GITHUB_DISCUSSIONS_URL },
        { label: 'OpenNG', image: 'logo-icon.svg', href: OPENNG_URL }
    ];
}

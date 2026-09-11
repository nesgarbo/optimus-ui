import { default as ChangelogData } from '@/assets/data/changelog.json';
import { AppDocBreadcrumb } from '@/components/doc/app.docbreadcrumb';
import { AppDocSectionNav } from '@/components/doc/app.docsection-nav';
import { Doc } from '@/domain/doc';
import { GITHUB_REPO_URL } from '@/utils/constants';
import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DomSanitizer, Meta, SafeHtml, Title } from '@angular/platform-browser';

interface Release {
    id: string;
    version: string;
    date: string;
    url: string;
    body: string;
}

const DATA = ChangelogData as { generatedAt: string; releases: Release[] };

/**
 * The changelog, read from the releases on GitHub.
 *
 * The releases are fetched at build time (`scripts/build-changelog.mjs`) rather than in
 * the browser: the page then ships its content in the prerendered HTML, which is what a
 * crawler and a reader on a slow connection see, and it costs no request at runtime.
 */
@Component({
    standalone: true,
    imports: [CommonModule, AppDocSectionNav, AppDocBreadcrumb],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="doc">
            <div class="doc-component">
                <div class="doc-tabpanels">
                    <div class="doc-tabpanel">
                        <div class="doc-main">
                            <div class="doc-intro">
                                <app-docbreadcrumb />
                                <h1>Changelog</h1>
                                <p>Every release of Optimus UI, newest first.</p>
                            </div>

                            @if (!releases().length) {
                                <section class="py-6">
                                    <p class="text-muted-color">
                                        No releases are recorded yet.
                                        <a [href]="releasesUrl" target="_blank" rel="noopener noreferrer" class="doc-link">Check GitHub</a>
                                        for the latest.
                                    </p>
                                </section>
                            } @else {
                                @for (release of releases(); track release.id) {
                                    <section class="py-6">
                                        <h2 class="doc-section-label">
                                            {{ release.version }}
                                            <a (click)="navigate($event, release.id)" class="cursor-pointer" [id]="release.id">#</a>
                                        </h2>
                                        <div class="doc-section-description">
                                            <p class="mt-2 font-mono text-xs text-muted-color">{{ release.date }}</p>
                                            <div class="release-notes mt-4" [innerHTML]="notes(release)"></div>
                                            <p class="mt-4">
                                                <a [href]="release.url" target="_blank" rel="noopener noreferrer" class="doc-link">View the release on GitHub</a>
                                            </p>
                                        </div>
                                    </section>
                                }
                            }
                        </div>

                        @if (docs().length) {
                            <app-docsection-nav [docs]="docs()" />
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
export class ChangelogDemo implements OnInit {
    readonly releasesUrl = `${GITHUB_REPO_URL}/releases`;

    readonly releases = signal<Release[]>(DATA.releases);

    /** The section index is fed the same list the page renders. */
    readonly docs = computed<Doc[]>(() => this.releases().map((release) => ({ id: release.id, label: release.version })));

    private readonly location = inject(Location);
    private readonly sanitizer = inject(DomSanitizer);
    private readonly title = inject(Title);
    private readonly meta = inject(Meta);

    /** Release notes are markdown we publish ourselves, rendered to HTML at build time. */
    notes(release: Release): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(release.body);
    }

    ngOnInit() {
        const releases = this.releases();

        this.title.setTitle('Changelog - Optimus UI');
        this.meta.updateTag({
            name: 'description',
            content: `Release notes for every version of Optimus UI, from ${releases[releases.length - 1]?.version ?? '1.0.0'} to ${releases[0]?.version ?? 'today'}.`
        });
    }

    navigate(event: Event, id: string) {
        event.preventDefault();
        this.location.go(this.location.path().split('#')[0] + '#' + id);
        document.getElementById(id)?.parentElement?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
}
